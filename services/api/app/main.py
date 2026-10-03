import os
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from zoneinfo import ZoneInfo

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .conversation import turn
from .interpretation import prepare
from .lifecycle import event, finalize, join, leave, place
from .models import CheckIn, Profile, ProfileInput, StrictModel, Turn, day_status, now
from .provider_routes import install_provider_routes
from .repository import Repository
from .runtime_config import accepted, build_runtime
from .seed import DEMO_OWNER, seed
from .supabase_repository import SupabaseRepository, verify_user


def create_app(path=None, clock=None, runtime=None):
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
    call_clock = clock or now
    mode = os.getenv("LINEA_MODE", "connected")
    if mode not in ("demo", "connected", "live"):
        raise RuntimeError("LINEA_MODE must be demo, connected, or live")
    if mode == "live" and not accepted():
        raise RuntimeError(
            "Live mode is gated: record all MVP acceptance checks before enabling it. See IMPLEMENTATION-NOTES.md."
        )
    if runtime is None and (mode == "live" or os.getenv("LINEA_VOICE_ENABLED") == "1"):
        runtime = build_runtime(call_clock)
    voice_ready = bool(runtime and (mode == "live" or accepted()))
    repo = (
        Repository(path or os.getenv("LINEA_DATABASE_PATH", ".local/linea.db"))
        if mode == "demo"
        else None
    )
    if repo and os.getenv("LINEA_DEMO_SEED", "1") == "1":
        seed(repo)
    token = os.getenv("LINEA_DEMO_API_TOKEN", "local-demo-only-change-me")
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    supabase_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    if mode != "demo" and (not supabase_url.startswith("https://") or not supabase_key):
        raise RuntimeError("Connected mode requires SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY")

    @asynccontextmanager
    async def lifespan(app):
        if repo:
            repo.sweep()
        yield

    app = FastAPI(
        title="Linea MVP API",
        version="0.1.0",
        lifespan=lifespan,
        description="Supabase family workspace and authenticated Agora runtime. Voice capability requires configured workers and verified acceptance.",
    )
    app.state.repo = repo
    app.state.runtime = runtime
    install_provider_routes(app, runtime)

    def user_client(authorization: str | None = Header(default=None)):
        if mode == "demo":
            yield None
            return
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(401, "Authentication required")
        with httpx.Client(
            base_url=supabase_url,
            headers={"apikey": supabase_key, "Authorization": authorization},
            timeout=15,
        ) as client:
            yield client

    def owner(authorization: str | None = Header(default=None), client=Depends(user_client)):
        if mode != "demo":
            return verify_user(client)
        if not authorization or not secrets.compare_digest(authorization, f"Bearer {token}"):
            raise HTTPException(401, "Authentication required")
        return DEMO_OWNER

    def request_repo(user=Depends(owner), client=Depends(user_client)):
        return repo if mode == "demo" else SupabaseRepository(client, user)

    def demo_only():
        if mode != "demo":
            raise HTTPException(404, "Demo actions are unavailable in this workspace")

    def can_call(user):
        return bool(
            runtime
            and runtime.worker_ready("voice")
            and (voice_ready or (runtime.test_scope and runtime.test_scope[1] == user))
        )

    def push_ready():
        return bool(
            runtime
            and os.getenv("LINEA_PUSH_ENABLED") == "1"
            and runtime.worker_ready("notifications")
        )

    def voice_available(user=Depends(owner)):
        if mode != "demo" and not can_call(user):
            raise HTTPException(
                503, "Calling is not connected yet. Your saved records are available."
            )

    def profile_for(pid, user, repo):
        p = next((p for p in repo.profiles() if p.id == pid and p.owner_id == user), None)
        if not p:
            raise HTTPException(404, "Elder not found")
        return p

    def call_for(cid, user, repo):
        c = next((c for c in repo.calls() if c.id == cid and c.owner_id == user), None)
        if not c:
            raise HTTPException(404, "Check-in not found")
        return c

    def view(c):
        payload = c.model_dump(mode="json")
        # Semantic/state-machine internals and idempotency replies are not a family API.
        for key in (
            "facts",
            "processed_events",
            "processed_turns",
            "turn_hashes",
            "active_prompt",
            "rtc_members",
        ):
            payload.pop(key)
        payload["day_status"] = day_status(c)
        return payload

    @app.get("/health")
    def health():
        return {
            "status": "ok",
            "build": os.getenv("LINEA_BUILD_ID", "unknown"),
            "mode": mode,
            "voice_connected": bool(voice_ready and runtime.worker_ready("voice")),
            "push_connected": push_ready(),
            "repository": "sqlite-demo" if mode == "demo" else "supabase",
        }

    @app.get("/profiles")
    def profiles(user=Depends(owner), repo=Depends(request_repo)):
        return [p for p in repo.profiles() if p.owner_id == user]

    @app.post("/profiles", status_code=201)
    def create_profile(body: ProfileInput, user=Depends(owner), repo=Depends(request_repo)):
        p = Profile(**body.model_dump(), owner_id=user)
        if mode == "demo":
            repo.save(p)
        else:
            repo.save_profile(p, create=True)
        return p

    @app.put("/profiles/{pid}")
    def update_profile(
        pid: str, body: ProfileInput, user=Depends(owner), repo=Depends(request_repo)
    ):
        if mode != "demo":
            p = profile_for(pid, user, repo)
            p = Profile.model_validate({**p.model_dump(), **body.model_dump()})
            repo.save_profile(p, create=False)
            return p
        with repo.lock:
            p = profile_for(pid, user, repo)
            for k, v in body.model_dump().items():
                setattr(p, k, v)
            # Re-validate nested contacts after the update.
            p = Profile.model_validate(p.model_dump())
            repo.save(p)
            return p

    @app.get("/dashboard")
    def dashboard(
        elder_id: str | None = None,
        month: str | None = None,
        user=Depends(owner),
        repo=Depends(request_repo),
    ):
        if mode == "demo":
            repo.sweep()
        ps = [p for p in repo.profiles() if p.owner_id == user]
        p = next((p for p in ps if p.id == elder_id), None) if elder_id else (ps[0] if ps else None)
        if elder_id and not p:
            raise HTTPException(404, "Elder not found")
        if not p:
            return {
                "profile": None,
                "profiles": [],
                "checkins": [],
                "alerts": [],
                "mode": mode,
                "voice_connected": can_call(user),
            }
        cs = sorted(
            [c for c in repo.calls() if c.elder_id == p.id and c.owner_id == user],
            key=lambda c: c.created_at,
            reverse=True,
        )
        return {
            "profile": p,
            "profiles": ps,
            "checkins": [view(c) for c in cs if not month or c.local_date.startswith(month)],
            "alerts": [
                dict(
                    a.model_dump(mode="json"),
                    checkin_id=c.id,
                    local_date=c.local_date,
                    call_state=c.state,
                )
                for c in cs
                for a in c.alerts
            ],
            "mode": mode,
            "voice_connected": can_call(user),
        }

    @app.get("/checkins/{cid}")
    def get_call(cid: str, user=Depends(owner), repo=Depends(request_repo)):
        if mode == "demo":
            repo.sweep()
        return view(call_for(cid, user, repo))

    @app.post("/profiles/{pid}/call", status_code=201, dependencies=[Depends(voice_available)])
    def call_now(pid: str, user=Depends(owner), idempotency_key: str | None = Header(default=None)):
        if mode != "demo":
            if not idempotency_key or len(idempotency_key) > 120:
                raise HTTPException(400, "A call placement idempotency key is required")
            return view(runtime.place(pid, user, request_id=idempotency_key))
        with repo.lock:
            p = profile_for(pid, user, repo)
            if p.consent == "declined":
                raise HTTPException(
                    409,
                    "Consent was declined; automatic or manual calls remain disabled",
                )
            cs = [c for c in repo.calls() if c.elder_id == pid]
            if any(
                c.state in ("ringing", "connected")
                or (c.state == "reconnecting" and c.legs and c.legs[-1].state == "ringing")
                for c in cs
            ):
                raise HTTPException(409, "A call is already active for this elder")
            at = call_clock()
            pending = next((c for c in cs if c.state in ("retry_scheduled", "reconnecting")), None)
            if pending:
                c = pending
                place(c, "manual", at)
            else:
                c = CheckIn(
                    elder_id=p.id,
                    owner_id=user,
                    local_date=at.astimezone(ZoneInfo(p.timezone)).date().isoformat(),
                    mode="SCRIPT" if p.consent == "granted" else "CONSENT",
                )
                place(c, "manual", at)
            repo.save(c)
            return view(c)

    class EventBody(BaseModel):
        event_id: str
        kind: str
        leg_id: str

    @app.post("/demo/checkins/{cid}/event", dependencies=[Depends(demo_only)])
    def demo_event(cid: str, body: EventBody, user=Depends(owner)):
        with repo.lock:
            c = call_for(cid, user, repo)
            try:
                reply = event(
                    c,
                    profile_for(c.elder_id, user, repo),
                    body.event_id,
                    body.kind,
                    body.leg_id,
                    call_clock(),
                )
            except ValueError as e:
                raise HTTPException(409, str(e)) from e
            repo.save(c)
            return {"call": view(c), "reply": reply}

    @app.post("/demo/checkins/{cid}/turn", dependencies=[Depends(demo_only)])
    def demo_turn(cid: str, body: Turn, user=Depends(owner)):
        with repo.lock:
            c, p = call_for(cid, user, repo), None
            p = profile_for(c.elder_id, user, repo)
            body = prepare(body, c, p, repo.calls(), call_clock())
            try:
                reply = turn(c, p, body)
            except ValueError as e:
                raise HTTPException(409, str(e)) from e
            if c.intentional_end:
                finalize(c, call_clock())
            try:
                repo.save(p)
                repo.save(c)
            except Exception as failure:
                if c.emergency_latched:
                    # Spoken response must not depend on storage/notification success.
                    # The connected runtime must retain its emergency session latch.
                    return {"call": view(c), "reply": reply, "persistence_status": "failed"}
                raise HTTPException(
                    503, "The check-in could not be saved. Please try again."
                ) from failure
            return {"call": view(c), "reply": reply}

    @app.post("/demo/checkins/{cid}/automatic-attempt", dependencies=[Depends(demo_only)])
    def automatic_attempt(cid: str, user=Depends(owner)):
        with repo.lock:
            c = call_for(cid, user, repo)
            p = profile_for(c.elder_id, user, repo)
            at = call_clock()
            if p.consent == "declined" or c.intentional_end or not c.retry_at or c.retry_at > at:
                raise HTTPException(409, "No eligible automatic attempt is due")
            local_hour = at.astimezone(ZoneInfo(p.timezone)).hour
            if not 6 <= local_hour < 21:
                raise HTTPException(
                    409,
                    "Automatic calls are allowed from 06:00 to 21:00 elder local time",
                )
            if any(
                x.elder_id == p.id
                and any(phone_leg.state in ("ringing", "connected") for phone_leg in x.legs)
                for x in repo.calls()
            ):
                raise HTTPException(409, "An active call blocks placement")
            try:
                place(c, "reconnect" if c.state == "reconnecting" else "retry", at)
            except ValueError as e:
                raise HTTPException(409, str(e)) from e
            repo.save(c)
            return view(c)

    @app.post("/checkins/{cid}/join", dependencies=[Depends(voice_available)])
    def family_join(cid: str, user=Depends(owner)):
        if mode != "demo":
            return {"simulation": False, "rtc": runtime.family_token(cid, user)}
        with repo.lock:
            c = call_for(cid, user, repo)
            try:
                reply = join(c, profile_for(c.elder_id, user, repo), user)
            except ValueError as e:
                raise HTTPException(409, str(e)) from e
            if reply:
                c.active_prompt = reply
                c.transcript.append(
                    {"speaker": "linea", "text": reply, "at": call_clock().isoformat()}
                )
            repo.save(c)
            return {"call": view(c), "briefing": reply, "simulation": True, "rtc": None}

    @app.post("/checkins/{cid}/leave", dependencies=[Depends(voice_available)])
    def family_leave(cid: str, user=Depends(owner)):
        if mode != "demo":
            c, reply = runtime.family_control(cid, user, "leave")
            return {"call": view(c), "reply": reply}
        with repo.lock:
            c = call_for(cid, user, repo)
            reply = leave(c, profile_for(c.elder_id, user, repo), user)
            if reply:
                c.active_prompt = reply
                c.transcript.append(
                    {"speaker": "linea", "text": reply, "at": call_clock().isoformat()}
                )
            repo.save(c)
            return {"call": view(c), "reply": reply}

    @app.post("/checkins/{cid}/end", dependencies=[Depends(voice_available)])
    def end_everyone(cid: str, user=Depends(owner)):
        if mode != "demo":
            c, _ = runtime.family_control(cid, user, "end")
            return view(c)
        with repo.lock:
            c = call_for(cid, user, repo)
            if user not in c.family:
                raise HTTPException(403, "Join the call before ending it for everyone")
            c.intentional_end = True
            finalize(c, call_clock())
            repo.save(c)
            return view(c)

    @app.post("/checkins/{cid}/alerts/{aid}/handle")
    def handle(cid: str, aid: str, user=Depends(owner), repo=Depends(request_repo)):
        if mode != "demo":
            c = call_for(cid, user, repo)
            if not any(a.id == aid for a in c.alerts):
                raise HTTPException(404, "Alert not found")
            repo.mark_handled(cid, aid)
            return next(a for a in call_for(cid, user, repo).alerts if a.id == aid)
        with repo.lock:
            c = call_for(cid, user, repo)
            a = next((a for a in c.alerts if a.id == aid), None)
            if not a:
                raise HTTPException(404, "Alert not found")
            a.handled_at, a.handled_by = a.handled_at or now(), a.handled_by or user
            repo.save(c)
            return a

    class PushKeys(StrictModel):
        p256dh: str = Field(min_length=1, max_length=512)
        auth: str = Field(min_length=1, max_length=512)

    class PushSubscription(StrictModel):
        endpoint: str = Field(pattern=r"^https://\S+$", max_length=4096)
        keys: PushKeys
        expirationTime: int | None = None

    @app.post("/push/subscriptions")
    def subscribe(body: PushSubscription, user=Depends(owner), repo=Depends(request_repo)):
        repo.subscribe(user, body.model_dump(mode="json"))
        return {"status": "saved", "delivery_connected": push_ready()}

    @app.get("/configuration")
    def configuration(user=Depends(owner), repo=Depends(request_repo)):
        if mode != "demo":
            repo.profiles()  # Readiness must include an authenticated database read.
        return {
            "mode": mode,
            "web_push_public_key": os.getenv("WEB_PUSH_PUBLIC_KEY", ""),
            "checks": [
                {"name": "Family web app", "state": "ready"},
                {"name": "Profile and contact storage", "state": "ready"},
                {
                    "name": "Supabase Auth / Postgres / RLS",
                    "state": "ready" if mode != "demo" else "not_connected",
                },
                {
                    "name": "Semantic fact extraction",
                    "state": "ready" if runtime else "not_connected",
                },
                {
                    "name": "Curated example retrieval",
                    "state": "ready"
                    if runtime and getattr(runtime.bridge.classifier, "retriever", None)
                    else "not_connected",
                },
                {
                    "name": "Agora voice / Twilio SIP",
                    "state": "ready" if can_call(user) else "not_connected",
                },
                {
                    "name": "Web push delivery",
                    "state": "ready" if push_ready() else "not_connected",
                },
                {"name": "Provider recording and retention", "state": "not_verified"},
            ],
        }

    @app.post("/checkins/{cid}/confirm-join", dependencies=[Depends(voice_available)])
    def confirm_join(cid: str, user=Depends(owner)):
        if mode == "demo":
            raise HTTPException(404, "Provider membership is unavailable in demo")
        c, reply = runtime.family_control(cid, user, "confirm")
        return {"call": view(c), "briefing": reply}

    @app.delete("/profiles/{pid}")
    def unenroll_profile(pid: str, user=Depends(owner), scoped_repo=Depends(request_repo)):
        profile_for(pid, user, scoped_repo)
        if not runtime:
            raise HTTPException(503, "Runtime teardown is required before unenrollment")
        runtime.unenroll(pid, user)
        return {"status": "unenrolled"}

    return app
