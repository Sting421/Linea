"""Serialized deterministic runtime, with durable provider commands."""

import base64
import hashlib
import json
from contextlib import ExitStack
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID, uuid4, uuid5
from zoneinfo import ZoneInfo

from cryptography.fernet import Fernet
from fastapi import HTTPException

from .agora_runtime import PlacementRejected
from .bridge import BrainBridge
from .conversation import emergency
from .lifecycle import event, finalize, join, leave, place
from .models import CheckIn, Profile, now
from .scheduler import plan


def command(call, kind, text=None, key=None, delay=0, leg=None):
    leg = leg or call.legs[-1]
    return {
        "id": str(uuid5(UUID(call.id), key or f"{kind}:{leg.id}")),
        "leg_id": leg.id,
        "kind": kind,
        "text": text,
        "not_before": (now() + timedelta(seconds=delay)).isoformat(),
    }


class EmergencyJournal:
    """Encrypted recovery spool on the API/worker's shared private persistent volume."""

    def __init__(self, directory, secret):
        self.directory = Path(directory)
        self.cipher = Fernet(base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest()))

    def write(self, call, profile, commands=()):
        self.directory.mkdir(parents=True, exist_ok=True)
        path = self.directory / f"{UUID(call.id)}.emergency"
        temporary = path.with_suffix(".tmp")
        with temporary.open("wb") as stream:
            stream.write(
                self.cipher.encrypt(
                    json.dumps(
                        {
                            "call": call.model_dump(mode="json"),
                            "profile": profile.model_dump(mode="json"),
                            "commands": list(commands),
                        }
                    ).encode()
                )
            )
            stream.flush()
            import os

            os.fsync(stream.fileno())
        temporary.replace(path)

    def read(self, cid):
        path = self.directory / f"{UUID(cid)}.emergency"
        if not path.exists():
            return None
        data = json.loads(self.cipher.decrypt(path.read_bytes()))
        call = CheckIn.model_validate(data["call"])
        if call.ended_at and now() >= call.ended_at + timedelta(days=90):
            self.remove(cid)
            return None
        return (
            call,
            Profile.model_validate(data["profile"]),
            data.get("commands", []),
        )

    def remove(self, cid):
        (self.directory / f"{UUID(cid)}.emergency").unlink(missing_ok=True)


class RuntimeService:
    def __init__(self, repo, voice, classifier, journal, clock=now, test_scope=None):
        self.repo, self.voice, self.bridge = repo, voice, BrainBridge(classifier)
        self.journal, self.clock = journal, clock
        self.emergencies = {}
        self.test_scope = test_scope

    def allowed(self, eid, owner=None):
        return self.test_scope is None or (
            eid == self.test_scope[0] and (owner is None or owner == self.test_scope[1])
        )

    def worker_ready(self, role):
        try:
            rows = self.repo.request("GET", "linea_worker_status", params={"role": f"eq.{role}"})
            return bool(
                rows
                and now() - datetime.fromisoformat(rows[0]["updated_at"]) < timedelta(seconds=45)
            )
        except Exception:
            return False

    def unenroll(self, eid, owner):
        profile = self.profile(eid, owner)
        with self.repo.locked(eid) as lease:
            for call in self.repo.calls():
                if call.elder_id != eid:
                    continue
                call = self.current(call.id)
                call.intentional_end = True
                finalize(call, self.clock())
                self.persist(call, profile, lease, [command(call, "end")])
                target = call.model_copy(deep=True)
                for leg in call.legs:
                    if not leg.provider_agent_id:
                        jobs = self.repo.rows(
                            "linea_commands", {"leg_id": f"eq.{leg.id}", "kind": "eq.place"}
                        )
                        for job in jobs:
                            if job["state"] == "pending":
                                self.repo.update_job("linea_commands", job["id"], state="failed")
                        if not any(j["state"] in ("inflight", "uncertain", "done") for j in jobs):
                            continue
                        leg.provider_agent_id = self.voice.find_agent(leg)
                        if not leg.provider_agent_id:
                            raise HTTPException(
                                503, "Call resources need reconciliation before unenrollment"
                            )
                    target.legs = [leg]
                    self.voice.end_everyone(target)
                    self.repo.update_job(
                        "linea_commands", command(call, "end", leg=leg)["id"], state="done"
                    )
                for job in self.repo.rows(
                    "linea_commands",
                    {"checkin_id": f"eq.{call.id}", "state": "in.(pending,inflight,uncertain)"},
                ):
                    self.repo.update_job("linea_commands", job["id"], state="failed")
            self.repo.request(
                "POST",
                "rpc/linea_unenroll_profile",
                json={
                    "eid": eid,
                    "owner_uuid": owner,
                    "lease": lease,
                },
            )

    def profile(self, eid, owner=None):
        if not self.allowed(eid, owner):
            raise HTTPException(404, "Elder not found")
        profile = next(
            (
                p
                for p in self.repo.profiles()
                if p.id == eid
                and (owner is None or p.owner_id == owner)
                and self.allowed(p.id, p.owner_id)
            ),
            None,
        )
        if not profile:
            raise HTTPException(404, "Elder not found")
        return profile

    def current(self, cid):
        recovery = self.emergencies.get(cid) or self.journal.read(cid)
        if recovery and recovery[0].ended_at and now() >= recovery[0].ended_at + timedelta(days=90):
            self.emergencies.pop(cid, None)
            self.journal.remove(cid)
            recovery = None
        if recovery:
            return recovery[0].model_copy(deep=True)
        return self.repo.call(cid)

    def call_profile(self, call, owner=None):
        profile = self.profile(call.elder_id, owner)
        recovery = self.emergencies.get(call.id) or self.journal.read(call.id)
        if recovery:
            previous = recovery[1]
            profile.consent, profile.consent_words, profile.consent_at = (
                previous.consent,
                previous.consent_words,
                previous.consent_at,
            )
        return profile

    def persist(self, call, profile, lease, commands=()):
        recovered = self.journal.read(call.id)
        commands = [*(recovered[2] if recovered else []), *commands]
        self.emergencies[call.id] = (
            call.model_copy(deep=True),
            profile.model_copy(deep=True),
            commands,
        )
        self.journal.write(call, profile, commands)
        # The shared journal becomes authoritative once written. Keeping a local
        # snapshot after a worker recovers it could overwrite that worker's state.
        self.emergencies.pop(call.id, None)
        self.repo.commit(call, profile, lease, commands)
        self.journal.remove(call.id)
        self.emergencies.pop(call.id, None)

    def place(self, eid, owner=None, kind="manual", request_id=None):
        profile = self.profile(eid, owner)
        with self.repo.locked(eid) as lease:
            profile = self.profile(eid, owner)
            at = self.clock()
            if profile.consent == "declined" or (kind != "manual" and profile.consent != "granted"):
                raise HTTPException(409, "Consent does not allow this call")
            if kind != "manual" and not 6 <= at.astimezone(ZoneInfo(profile.timezone)).hour < 21:
                raise HTTPException(
                    409, "Automatic calls are allowed from 06:00 to 21:00 elder local time"
                )
            calls = [c for c in self.repo.calls() if c.elder_id == eid]
            key = f"placement:{request_id}" if request_id else None
            previous = next((c for c in calls if key and key in c.processed_events), None)
            if previous:
                return previous
            if any(
                any(phone_leg.state in ("ringing", "connected") for phone_leg in c.legs)
                for c in calls
            ):
                raise HTTPException(409, "A call is already active for this elder")
            if kind != "manual" and not any(
                x["kind"] == kind and x["elder_id"] == eid for x in plan([profile], calls, at)
            ):
                raise HTTPException(409, "No automatic attempt is due")
            call = next(
                (
                    c
                    for c in calls
                    if not c.ended_at and c.state in ("retry_scheduled", "reconnecting")
                ),
                None,
            )
            if call is None:
                call = CheckIn(
                    elder_id=eid,
                    owner_id=profile.owner_id,
                    created_at=at,
                    local_date=at.astimezone(ZoneInfo(profile.timezone)).date().isoformat(),
                    mode="SCRIPT" if profile.consent == "granted" else "CONSENT",
                )
            leg = place(call, kind, at)
            leg.channel = f"linea-{leg.id}"
            if key:
                call.processed_events.append(key)
            self.persist(call, profile, lease, [command(call, "place")])
            return call

    def completion(self, cid, lid, turn_id, text):
        # Hold a cross-process lease until the response's background persistence ends.
        call = self.current(cid)
        stack = ExitStack()
        try:
            lease = stack.enter_context(self.repo.locked(call.elder_id))
        except HTTPException as exc:
            recovery = self.emergencies.get(cid) or self.journal.read(cid)
            if (
                exc.status_code >= 500
                and recovery
                and call.emergency_latched
                and call.legs
                and call.legs[-1].id == lid
                and call.legs[-1].state == "connected"
                and not call.ended_at
            ):
                # A known latch already has durable recovery evidence. Keep its
                # fixed speech available during an outage without mutating state.
                return emergency(recovery[1]), lambda: None
            raise
        try:
            call = self.current(cid)
            profile = self.call_profile(call)
            if (
                call.legs
                and call.legs[-1].id == lid
                and call.legs[-1].state == "ringing"
                and call.legs[-1].provider_agent_id
            ):
                if self.voice.call_status(call).get("state") == "answered":
                    event(call, profile, f"verifiedanswer:{lid}", "connected", lid, self.clock())
            if not call.legs or call.legs[-1].id != lid or call.legs[-1].state != "connected":
                raise HTTPException(409, "Completion is not for the active phone leg")
            tid = f"{lid}:{turn_id}"
            reply = self.bridge.completion(text, tid, call, profile, self.repo.calls())
            self.emergencies[cid] = (call.model_copy(deep=True), profile.model_copy(deep=True))
            commands = []
            if call.intentional_end or (call.mode == "ENDING" and call.active_question is None):
                call.intentional_end = True
                # Avoid cutting off the final scripted completion; call end is still explicit.
                finalize(call, self.clock())
                commands.append(command(call, "end", key=f"end:{tid}", delay=12))

            def finish():
                try:
                    self.persist(call, profile, lease, commands)
                except Exception:
                    # Retain the latch/journal; never replace the emergency speech with a DB error.
                    if not call.emergency_latched:
                        import logging

                        logging.getLogger(__name__).error("Completion persistence failed")
                finally:
                    stack.close()

            return reply, finish
        except Exception:
            stack.close()
            raise

    def family_token(self, cid, member):
        call = self.current(cid)
        self.profile(call.elder_id, member)
        with self.repo.locked(call.elder_id) as lease:
            call = self.current(cid)
            if call.state != "connected":
                raise HTTPException(409, "The phone call is not connected")
            if member not in call.rtc_members:
                call.rtc_members[member] = max([2001, *call.rtc_members.values()]) + 1
            self.persist(call, self.call_profile(call, member), lease)
            # Token issuance is deliberately not a lifecycle join.
            return self.voice.family_token(call, member)

    def family_control(self, cid, member, operation):
        call = self.current(cid)
        self.profile(call.elder_id, member)
        with self.repo.locked(call.elder_id) as lease:
            call = self.current(cid)
            profile = self.call_profile(call, member)
            commands, reply = [], ""
            if operation == "confirm":
                uid = call.rtc_members.get(member)
                if not uid or uid not in self.voice.members(call):
                    raise HTTPException(409, "Your audio connection is not confirmed yet")
                reply = join(call, profile, member)
            elif operation == "leave":
                reply = leave(call, profile, member)
            elif operation == "end":
                if member not in call.family:
                    raise HTTPException(403, "Join the call before ending it for everyone")
                call.intentional_end = True
                finalize(call, self.clock())
                commands.append(command(call, "end"))
            if reply:
                call.active_prompt = reply
                call.transcript.append(
                    {"speaker": "linea", "text": reply, "at": self.clock().isoformat()}
                )
                commands.append(command(call, "speak", reply, key=f"{operation}:{uuid4()}"))
            self.persist(call, profile, lease, commands)
            return call, reply

    def process_event(self, job):
        call = self.current(job["checkin_id"])
        with self.repo.locked(call.elder_id) as lease:
            call = self.current(call.id)
            profile = self.call_profile(call)
            leg = next(
                (phone_leg for phone_leg in call.legs if phone_leg.id == job["leg_id"]), None
            )
            if not leg or leg.provider_agent_id != job["agent_id"]:
                raise ValueError("Provider session mismatch")
            if job["id"] in call.processed_events:
                self.repo.update_job("linea_event_inbox", job["id"], state="done")
                return
            # Agent join is not a phone answer. Only telephony ANSWERED connects the leg.
            kind = {
                "ANSWERED": "connected",
                "HANGUP": "dropped" if leg.state == "connected" else "no_answer",
            }.get(job["kind"])
            if job["kind"] == "HANGUP":
                target = call.model_copy(deep=True)
                target.legs = [leg]
                reason = self.voice.call_status(target).get("reason")
                if reason in ("request", "hangup"):
                    kind = "ended"
            commands = []
            if kind:
                event_at = datetime.fromtimestamp(job["report_ms"] / 1000, timezone.utc)
                event(call, profile, job["id"], kind, leg.id, event_at)
                # Greeting is delivered by the agent; lifecycle only records it.
                if kind != "connected":
                    commands.append(command(call, "end", key=f"end:{leg.id}", leg=leg))
            else:
                call.processed_events.append(job["id"])
            self.persist(call, profile, lease, commands)
            self.repo.update_job("linea_event_inbox", job["id"], state="done")

    def process_command(self, job):
        call = self.current(job["checkin_id"])
        with self.repo.locked(call.elder_id) as lease:
            # The lock is authoritative; job lists can have been fetched concurrently.
            rows = self.repo.request("GET", "linea_commands", params={"id": f"eq.{job['id']}"})
            if not rows or rows[0]["state"] != "pending":
                return
            call = self.current(call.id)
            profile = self.call_profile(call)
            if call.legs[-1].id != job["leg_id"] and job["kind"] != "end":
                self.repo.update_job("linea_commands", job["id"], state="failed")
                return
            if (
                job["kind"] == "place"
                and (call.intentional_end or call.ended_at or profile.consent == "declined")
            ) or (job["kind"] == "speak" and call.state != "connected"):
                # No provider request was made, so there is nothing to reconcile.
                self.repo.update_job("linea_commands", job["id"], state="failed")
                return
            self.repo.update_job("linea_commands", job["id"], state="inflight")
            try:
                if job["kind"] == "place":
                    call.legs[-1].provider_agent_id = self.voice.place(call, profile)
                    self.persist(call, profile, lease)
                elif job["kind"] == "speak":
                    self.voice.speak(call, job["text"])
                elif job["kind"] == "end":
                    target = call.model_copy(deep=True)
                    target.legs = [
                        phone_leg for phone_leg in target.legs if phone_leg.id == job["leg_id"]
                    ]
                    if target.legs and target.legs[-1].provider_agent_id:
                        self.voice.end_everyone(target)
                self.repo.update_job("linea_commands", job["id"], state="done")
            except PlacementRejected:
                # A known refusal must release the ringing leg, while preserving
                # lifecycle retry budgets and the record of the failed attempt.
                if job["kind"] != "place":
                    raise
                event(call, profile, f"rejected:{job['id']}", "failed", job["leg_id"], self.clock())
                self.persist(call, profile, lease)
                self.repo.update_job("linea_commands", job["id"], state="failed")
                raise
            except Exception:
                # Never retry a possibly billed placement/speech automatically after an
                # ambiguous timeout/crash. Keep the call reserved for reconciliation.
                self.repo.update_job("linea_commands", job["id"], state="uncertain")
                raise

    def reconcile_command(self, job):
        call = self.current(job["checkin_id"])
        with self.repo.locked(call.elder_id) as lease:
            call = self.current(call.id)
            profile = self.call_profile(call)
            leg = next((leg for leg in call.legs if leg.id == job["leg_id"]), None)
            if not leg:
                return
            if job["kind"] == "place":
                if f"rejected:{job['id']}" in call.processed_events:
                    # Recover a crash between saving the refusal and closing the job.
                    self.persist(call, profile, lease)
                    self.repo.update_job("linea_commands", job["id"], state="failed")
                    return
                agent = leg.provider_agent_id or self.voice.find_agent(leg)
                if not agent:
                    # Absence from an eventually consistent listing is not proof of failure.
                    return
                leg.provider_agent_id = agent
                self.persist(call, profile, lease)
                self.repo.update_job("linea_commands", job["id"], state="done")
            elif job["kind"] == "end" and leg.provider_agent_id:
                target = call.model_copy(deep=True)
                target.legs = [leg]
                self.voice.end_everyone(target)
                self.repo.update_job("linea_commands", job["id"], state="done")

    def reconcile_call(self, cid):
        call = self.current(cid)
        if (
            not call.legs
            or not call.legs[-1].provider_agent_id
            or call.legs[-1].state not in ("ringing", "connected")
        ):
            return
        leg = call.legs[-1]
        status = self.voice.call_status(call)
        kind = {"answered": "ANSWERED", "hangup": "HANGUP"}.get(status.get("state"))
        if kind and (kind != "ANSWERED" or leg.state != "connected"):
            stamp = int(status.get("stop_ts") or self.clock().timestamp())
            self.process_event(
                {
                    "id": f"reconcile:{leg.id}:{kind}",
                    "checkin_id": cid,
                    "leg_id": leg.id,
                    "agent_id": leg.provider_agent_id,
                    "kind": kind,
                    "report_ms": stamp * 1000,
                }
            )
        elif call.state == "connected" and not call.emergency_latched:
            started = next(
                (entry["at"] for entry in call.transcript if entry["speaker"] == "linea"), None
            )
            if started and self.clock() >= datetime.fromisoformat(started) + timedelta(minutes=10):
                with self.repo.locked(call.elder_id) as lease:
                    call = self.current(cid)
                    if call.emergency_latched or call.state != "connected":
                        return
                    call.intentional_end = True
                    finalize(call, self.clock())
                    self.persist(call, self.call_profile(call), lease, [command(call, "end")])
