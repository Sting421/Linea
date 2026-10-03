"""Verified Agora envelopes; do not accept client-authored policy facts."""

import hashlib
import json
import logging
import os
import re
import secrets
import time

from fastapi import BackgroundTasks, HTTPException, Request
from fastapi.responses import StreamingResponse

from .agora_runtime import verify_signature


async def bounded_json(request):
    raw = bytearray()
    async for chunk in request.stream():
        raw.extend(chunk)
        if len(raw) > 65536:
            raise HTTPException(413, "Provider request is too large")
    try:
        body = json.loads(raw)
        if not isinstance(body, dict):
            raise ValueError()
    except (ValueError, TypeError) as exc:
        raise HTTPException(400, "Invalid provider request") from exc
    return bytes(raw), body


def install_provider_routes(app, runtime):
    @app.middleware("http")
    async def provider_request_status(request: Request, call_next):
        # The service disables general access logs. Keep provider diagnostics
        # useful without logging IDs, URLs, headers, transcripts or bodies.
        path = request.url.path
        route = (
            "agora_events"
            if path == "/provider/agora/events"
            else "chat_completions"
            if re.fullmatch(r"/provider/checkins/[^/]+/legs/[^/]+/chat/completions", path)
            else None
        )
        if route is None:
            return await call_next(request)
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            return response
        finally:
            logging.getLogger("uvicorn.error").info(
                "Provider request: route=%s HTTP status=%s", route, status
            )

    @app.post("/provider/agora/events")
    async def callback(request: Request):
        raw, body = await bounded_json(request)
        if not verify_signature(
            raw, request.headers, os.getenv("LINEA_PROVIDER_WEBHOOK_SECRET", "")
        ):
            raise HTTPException(401, "Invalid provider signature")
        if not runtime:
            raise HTTPException(503, "Voice runtime is not configured")
        if (
            not isinstance(body.get("notifyMs"), int)
            or abs(time.time() * 1000 - body["notifyMs"]) > 300000
        ):
            raise HTTPException(400, "Expired provider notification")
        if body.get("productId") != 17 or not isinstance(body.get("noticeId"), str):
            raise HTTPException(400, "Invalid provider notification")
        if not 0 < len(body["noticeId"]) <= 200:
            raise HTTPException(400, "Invalid notification identity")
        if body.get("eventType") != 202:
            return {"status": "ignored"}
        payload = body.get("payload", {})
        if (
            not isinstance(payload, dict)
            or payload.get("state")
            not in (
                "START",
                "CALLING",
                "RINGING",
                "ANSWERED",
                "HANGUP",
            )
            or not isinstance(payload.get("report_ms"), int)
        ):
            raise HTTPException(400, "Invalid telephony event")
        if not 0 <= payload["report_ms"] <= body["notifyMs"] + 60000:
            raise HTTPException(400, "Invalid event timestamp")
        if not all(
            isinstance(payload.get(k), str) and 0 < len(payload[k]) <= 200
            for k in ("agent_id", "channel")
        ):
            raise HTTPException(400, "Missing provider session identity")
        # Authenticated receipt only: the worker performs serialized policy changes.
        created = runtime.repo.enqueue_event(body)
        return {"status": "queued" if created else "duplicate"}

    @app.post("/provider/checkins/{cid}/legs/{lid}/chat/completions")
    async def completion(cid: str, lid: str, request: Request, tasks: BackgroundTasks):
        from uuid import UUID

        try:
            UUID(cid)
            UUID(lid)
        except ValueError as exc:
            raise HTTPException(404, "Check-in not found") from exc
        bearer = os.getenv("LINEA_CUSTOM_LLM_BEARER", "")
        if not bearer or not secrets.compare_digest(
            request.headers.get("Authorization", ""), f"Bearer {bearer}"
        ):
            raise HTTPException(401, "Invalid completion authentication")
        if not runtime:
            raise HTTPException(503, "Voice runtime is not configured")
        _, body = await bounded_json(request)
        messages = body.get("messages")
        if not isinstance(messages, list) or not messages or len(messages) > 64:
            raise HTTPException(400, "Missing elder message")
        message = messages[-1]
        if not isinstance(message, dict) or message.get("role") != "user":
            raise HTTPException(400, "Completion requires the latest elder turn")
        content = message.get("content")
        if isinstance(content, list):
            if not all(
                isinstance(p, dict) and p.get("type") == "text" and isinstance(p.get("text"), str)
                for p in content
            ):
                raise HTTPException(400, "Only elder text is supported")
            content = " ".join(p["text"] for p in content)
        turn_id = message.get("turn_id", body.get("turn_id"))
        if (
            not isinstance(content, str)
            or not content.strip()
            or len(content) > 4000
            or (
                turn_id is not None
                and (
                    not isinstance(turn_id, (str, int))
                    or isinstance(turn_id, bool)
                    or len(str(turn_id)) > 80
                    or not str(turn_id)
                )
            )
        ):
            raise HTTPException(400, "Missing text or stable turn identity")
        if turn_id is None:
            # Agora documents an OpenAI-compatible message envelope, which does
            # not require turn_id. Use the authenticated conversation history for
            # retry identity, rather than text alone: repeated words answering a
            # later question must remain a different turn. Never use a random ID
            # or a server counter here, since retries must survive API restarts.
            if not all(isinstance(item, dict) for item in messages):
                raise HTTPException(400, "Invalid conversation history")
            history = [
                {"role": item.get("role"), "content": item.get("content")} for item in messages
            ]
            turn_id = (
                "history-"
                + hashlib.sha256(
                    json.dumps(history, sort_keys=True, separators=(",", ":")).encode()
                ).hexdigest()
            )
        if not isinstance(body.get("stream", True), bool):
            raise HTTPException(400, "Invalid streaming preference")
        from starlette.concurrency import run_in_threadpool

        try:
            reply, finish = await run_in_threadpool(
                runtime.completion, cid, lid, str(turn_id), content
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(503, "Interpretation is temporarily unavailable") from exc
        tasks.add_task(finish)
        identity = f"chatcmpl-{lid}-{turn_id}"
        base = {"id": identity, "created": int(time.time()), "model": "linea-policy"}
        if body.get("stream", True):

            def chunks():
                yield (
                    "data: "
                    + json.dumps(
                        {
                            **base,
                            "object": "chat.completion.chunk",
                            "choices": [
                                {
                                    "index": 0,
                                    "delta": {"role": "assistant", "content": reply},
                                    "finish_reason": None,
                                }
                            ],
                        }
                    )
                    + "\n\n"
                )
                yield (
                    "data: "
                    + json.dumps(
                        {
                            **base,
                            "object": "chat.completion.chunk",
                            "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
                        }
                    )
                    + "\n\n"
                )
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                chunks(),
                media_type="text/event-stream",
                background=tasks,
                headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
            )
        return {
            **base,
            "object": "chat.completion",
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": reply},
                    "finish_reason": "stop",
                }
            ],
        }
