import os
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .conversation import turn
from .interpretation import prepare
from .lifecycle import event, finalize, join, leave, place
from .models import CheckIn, Profile, ProfileInput, StrictModel, Turn, day_status, now
from .repository import Repository
from .seed import DEMO_OWNER, seed


def create_app(path=None, clock=None):
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
    call_clock = clock or now
    mode = os.getenv("LINEA_MODE", "demo")
    if mode not in ("demo", "live"):
        raise RuntimeError("LINEA_MODE must be demo or live")
    if mode == "live":
        raise RuntimeError(
            "Live mode is gated: connect the Supabase repository, verified Agora runtime, and notification delivery before enabling it. See IMPLEMENTATION-NOTES.md."
        )
    repo = Repository(path or os.getenv("LINEA_DATABASE_PATH", ".local/linea.db"))
    if os.getenv("LINEA_DEMO_SEED", "1") == "1":
        seed(repo)
    token = os.getenv("LINEA_DEMO_API_TOKEN", "local-demo-only-change-me")

    @asynccontextmanager
    async def lifespan(app):
        repo.sweep()
        yield

    app = FastAPI(
        title="Linea MVP API",
        version="0.1.0",
        lifespan=lifespan,
        description="Local scaffold. All voice and push actions in demo mode are simulated.",
    )
    app.state.repo = repo

    def owner(authorization: str | None = Header(default=None)):
        if not authorization or not secrets.compare_digest(authorization, f"Bearer {token}"):
            raise HTTPException(401, "Authentication required")
        return DEMO_OWNER

    def profile_for(pid, user):
        p = next((p for p in repo.profiles() if p.id == pid and p.owner_id == user), None)
        if not p:
            raise HTTPException(404, "Elder not found")
        return p

    def call_for(cid, user):
        c = next((c for c in repo.calls() if c.id == cid and c.owner_id == user), None)
        if not c:
            raise HTTPException(404, "Check-in not found")
        return c

    def view(c):
        payload = c.model_dump(mode="json")
        # Semantic/state-machine internals and idempotency replies are not a family API.
        for key in ("facts", "processed_events", "processed_turns", "active_prompt"):
            payload.pop(key)
        payload["day_status"] = day_status(c)
        return payload

    @app.get("/health")
    def health():
        return {
            "status": "ok",
            "mode": mode,
            "voice_connected": False,
            "push_connected": False,
            "repository": "sqlite-demo",
        }

    @app.get("/profiles")
    def profiles(user=Depends(owner)):
        return [p for p in repo.profiles() if p.owner_id == user]

    @app.post("/profiles", status_code=201)
    def create_profile(body: ProfileInput, user=Depends(owner)):
        p = Profile(**body.model_dump(), owner_id=user)
        repo.save(p)
        return p

    @app.put("/profiles/{pid}")
    def update_profile(pid: str, body: ProfileInput, user=Depends(owner)):
        with repo.lock:
            p = profile_for(pid, user)
            for k, v in body.model_dump().items():
                setattr(p, k, v)
            # Re-validate nested contacts after the update.
            p = Profile.model_validate(p.model_dump())
            repo.save(p)
            return p

    @app.get("/dashboard")
    def dashboard(elder_id: str | None = None, month: str | None = None, user=Depends(owner)):
        repo.sweep()
        ps = [p for p in repo.profiles() if p.owner_id == user]
        p = profile_for(elder_id or ps[0].id, user) if ps else None
        if not p:
            return {
                "profile": None,
                "profiles": [],
                "checkins": [],
                "alerts": [],
                "mode": mode,
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
        }

    @app.get("/checkins/{cid}")
    def get_call(cid: str, user=Depends(owner)):
        repo.sweep()
        return view(call_for(cid, user))

    @app.post("/profiles/{pid}/call", status_code=201)
    def call_now(pid: str, user=Depends(owner)):
        with repo.lock:
            p = profile_for(pid, user)
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
            if not 6 <= at.astimezone(ZoneInfo(p.timezone)).hour < 21:
                raise HTTPException(409, "Calls are allowed from 06:00 to 21:00 elder local time")
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

    @app.post("/demo/checkins/{cid}/event")
    def demo_event(cid: str, body: EventBody, user=Depends(owner)):
        with repo.lock:
            c = call_for(cid, user)
            try:
                reply = event(
                    c,
                    profile_for(c.elder_id, user),
                    body.event_id,
                    body.kind,
                    body.leg_id,
                    call_clock(),
                )
            except ValueError as e:
                raise HTTPException(409, str(e)) from e
            repo.save(c)
            return {"call": view(c), "reply": reply}

    @app.post("/demo/checkins/{cid}/turn")
    def demo_turn(cid: str, body: Turn, user=Depends(owner)):
        with repo.lock:
            c, p = call_for(cid, user), None
            p = profile_for(c.elder_id, user)
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

    @app.post("/demo/checkins/{cid}/automatic-attempt")
    def automatic_attempt(cid: str, user=Depends(owner)):
        with repo.lock:
            c = call_for(cid, user)
            p = profile_for(c.elder_id, user)
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

    @app.post("/checkins/{cid}/join")
    def family_join(cid: str, user=Depends(owner)):
        with repo.lock:
            c = call_for(cid, user)
            try:
                reply = join(c, profile_for(c.elder_id, user), user)
            except ValueError as e:
                raise HTTPException(409, str(e)) from e
            if reply:
                c.active_prompt = reply
                c.transcript.append(
                    {"speaker": "linea", "text": reply, "at": call_clock().isoformat()}
                )
            repo.save(c)
            return {"call": view(c), "briefing": reply, "simulation": True, "rtc": None}

    @app.post("/checkins/{cid}/leave")
    def family_leave(cid: str, user=Depends(owner)):
        with repo.lock:
            c = call_for(cid, user)
            reply = leave(c, profile_for(c.elder_id, user), user)
            if reply:
                c.active_prompt = reply
                c.transcript.append(
                    {"speaker": "linea", "text": reply, "at": call_clock().isoformat()}
                )
            repo.save(c)
            return {"call": view(c), "reply": reply}

    @app.post("/checkins/{cid}/end")
    def end_everyone(cid: str, user=Depends(owner)):
        with repo.lock:
            c = call_for(cid, user)
            if user not in c.family:
                raise HTTPException(403, "Join the call before ending it for everyone")
            c.intentional_end = True
            finalize(c, call_clock())
            repo.save(c)
            return view(c)

    @app.post("/checkins/{cid}/alerts/{aid}/handle")
    def handle(cid: str, aid: str, user=Depends(owner)):
        with repo.lock:
            c = call_for(cid, user)
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
    def subscribe(body: PushSubscription, user=Depends(owner)):
        repo.subscribe(user, body.model_dump(mode="json"))
        return {"status": "saved", "delivery_connected": False}

    @app.get("/configuration")
    def configuration(user=Depends(owner)):
        return {
            "mode": mode,
            "checks": [
                {"name": "Family web app", "state": "ready"},
                {"name": "Local policy and persistence", "state": "ready"},
                {"name": "Supabase Auth / Postgres / RLS", "state": "not_connected"},
                {"name": "Semantic retrieval + classifier", "state": "not_connected"},
                {"name": "Agora voice / Twilio SIP", "state": "not_connected"},
                {"name": "Web push delivery", "state": "not_connected"},
                {"name": "Provider recording and retention", "state": "not_verified"},
            ],
        }

    return app
