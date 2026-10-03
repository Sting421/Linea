import hashlib
import hmac
import json
import time
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4

import httpx
import pytest
from app.agora_runtime import AgoraRuntime
from app.interpreter import OpenAIClassifier, output_schema
from app.models import CheckIn, Facts, Profile, Turn, now
from app.provider_routes import install_provider_routes
from app.runtime_service import EmergencyJournal, RuntimeService
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient


def at():
    return datetime(2026, 10, 4, 0, 0, tzinfo=timezone.utc)


class MemoryRuntimeRepository:
    def __init__(self, profile):
        self.profile = profile
        self.saved, self.commands, self.jobs = {}, [], {}
        self.leases = set()
        self.fail = False

    def profiles(self):
        return [self.profile.model_copy(deep=True)]

    def calls(self):
        return [c.model_copy(deep=True) for c in self.saved.values()]

    def call(self, cid):
        return self.saved[cid].model_copy(deep=True)

    @contextmanager
    def locked(self, eid):
        if eid in self.leases:
            raise HTTPException(409, "busy")
        self.leases.add(eid)
        try:
            yield "lease"
        finally:
            self.leases.remove(eid)

    def commit(self, call, profile, lease, commands):
        assert call.elder_id in self.leases
        if self.fail:
            raise HTTPException(503, "Storage failure")
        self.saved[call.id] = call.model_copy(deep=True)
        self.profile = profile.model_copy(deep=True)
        for cmd in commands:
            if not any(c["id"] == cmd["id"] for c in self.commands):
                self.commands.append(cmd)

    def update_job(self, table, jid, **values):
        self.jobs.setdefault(jid, {}).update(values)


@pytest.fixture
def runtime(tmp_path):
    profile = Profile(
        id=str(uuid4()),
        owner_id=str(uuid4()),
        name="Test Elder",
        preferred_name="Test",
        phone="+12025550101",
        contacts=[
            {
                "name": "Family",
                "relationship": "Family",
                "phone": "+12025550102",
            }
        ],
        consent="granted",
    )
    repo = MemoryRuntimeRepository(profile)
    classifier = SimpleNamespace(count=0)

    def classify(text, call, profile):
        classifier.count += 1
        return Turn(
            turn_id="unused",
            text=text,
            concerns=[Facts(incident_id="chest", concern="CHEST_PAIN", current=True, quote=text)]
            if "chest" in text
            else [],
        )

    classifier.classify = classify
    voice = SimpleNamespace(
        family_token=lambda call, member: {"uid": call.rtc_members[member]},
        members=lambda call: set(),
    )
    return RuntimeService(repo, voice, classifier, EmergencyJournal(tmp_path, "private-test"), at)


def connected_call(runtime):
    call = runtime.place(runtime.repo.profile.id, runtime.repo.profile.owner_id, request_id="first")
    call.state = "connected"
    call.legs[-1].state = "connected"
    call.legs[-1].provider_agent_id = "agent"
    with runtime.repo.locked(call.elder_id) as lease:
        runtime.persist(call, runtime.repo.profile, lease)
    return call


def test_placement_idempotency_consent_hours_and_foreign_owner(runtime):
    p = runtime.repo.profile
    first = runtime.place(p.id, p.owner_id, request_id="same")
    assert runtime.place(p.id, p.owner_id, request_id="same").id == first.id
    assert len(runtime.repo.commands) == 1
    with pytest.raises(HTTPException) as error:
        runtime.place(p.id, p.owner_id, request_id="different")
    assert error.value.status_code == 409
    with pytest.raises(HTTPException) as error:
        runtime.place(p.id, str(uuid4()))
    assert error.value.status_code == 404


def test_streaming_reply_precedes_storage_and_duplicate_turn_skips_model(runtime):
    call = connected_call(runtime)
    runtime.repo.fail = True
    reply, finish = runtime.completion(call.id, call.legs[-1].id, "1", "My chest hurts now.")
    assert (
        "please call 911 now" in reply.lower() and not runtime.repo.saved[call.id].emergency_latched
    )
    finish()
    assert runtime.current(call.id).emergency_latched
    assert runtime.journal.read(call.id)[0].emergency_latched
    assert b"chest" not in next(runtime.journal.directory.glob("*.emergency")).read_bytes()
    runtime.repo.fail = False
    reply2, finish2 = runtime.completion(call.id, call.legs[-1].id, "1", "My chest hurts now.")
    finish2()
    assert reply2 == reply and runtime.bridge.classifier.count == 1
    assert runtime.repo.saved[call.id].emergency_latched
    assert not list(runtime.journal.directory.glob("*.emergency"))


def test_restart_restores_emergency_and_pending_commands(runtime):
    call = connected_call(runtime)
    runtime.repo.fail = True
    _, finish = runtime.completion(call.id, call.legs[-1].id, "1", "My chest hurts now.")
    finish()
    restarted = RuntimeService(
        runtime.repo, runtime.voice, runtime.bridge.classifier, runtime.journal, at
    )
    assert restarted.current(call.id).emergency_latched


def test_known_emergency_keeps_fixed_speech_when_database_lease_is_unavailable(runtime):
    call = connected_call(runtime)
    runtime.repo.fail = True
    _, finish = runtime.completion(call.id, call.legs[-1].id, "1", "My chest hurts now.")
    finish()

    @contextmanager
    def unavailable(eid):
        raise HTTPException(503, "Database unavailable")
        yield

    runtime.repo.locked = unavailable
    reply, finish = runtime.completion(call.id, call.legs[-1].id, "2", "I feel better.")
    finish()
    assert "please call 911 now" in reply.lower()
    assert runtime.bridge.classifier.count == 1
    with pytest.raises(HTTPException):
        runtime.completion(call.id, str(uuid4()), "3", "I feel better.")


def test_expired_recovery_cannot_restore_sensitive_detail(runtime):
    call = connected_call(runtime)
    call.ended_at = now() - timedelta(days=91)
    runtime.journal.write(call, runtime.repo.profile)
    assert runtime.journal.read(call.id) is None
    assert not list(runtime.journal.directory.glob("*.emergency"))


def test_worker_recovery_cannot_leave_an_obsolete_api_snapshot(runtime):
    call = connected_call(runtime)
    runtime.repo.fail = True
    _, finish = runtime.completion(call.id, call.legs[-1].id, "1", "My chest hurts now.")
    finish()
    worker = RuntimeService(
        runtime.repo, runtime.voice, runtime.bridge.classifier, runtime.journal, at
    )
    recovered, profile, commands = runtime.journal.read(call.id)
    runtime.repo.fail = False
    with runtime.repo.locked(call.elder_id) as lease:
        recovered.intentional_end = True
        recovered.ended_at = now()
        recovered.state = "ended"
        worker.persist(recovered, profile, lease, commands)
    assert runtime.current(call.id).state == "ended"


def test_scoped_acceptance_requires_matching_actual_profile_owner(runtime):
    runtime.test_scope = (runtime.repo.profile.id, str(uuid4()))
    with pytest.raises(HTTPException) as error:
        runtime.place(runtime.repo.profile.id)
    assert error.value.status_code == 404
    assert not runtime.repo.commands


def test_ambiguous_placement_is_reconciled_without_a_second_paid_request(runtime):
    p = runtime.repo.profile
    call = runtime.place(p.id, p.owner_id, request_id="ambiguous")
    job = {**runtime.repo.commands[0], "checkin_id": call.id, "state": "pending"}
    runtime.repo.jobs[job["id"]] = job.copy()
    runtime.repo.request = lambda method, path, **kw: [runtime.repo.jobs[job["id"]].copy()]
    attempts = []

    def place_then_timeout(call, profile):
        attempts.append(call.id)
        raise httpx.ReadTimeout("Provider accepted but response was lost")

    runtime.voice.place = place_then_timeout
    runtime.voice.find_agent = lambda leg: "recovered-agent"
    with pytest.raises(httpx.ReadTimeout):
        runtime.process_command(job)
    assert runtime.repo.jobs[job["id"]]["state"] == "uncertain"
    runtime.process_command(job)
    runtime.reconcile_command({**job, "state": "uncertain"})
    assert attempts == [call.id]
    assert runtime.repo.jobs[job["id"]]["state"] == "done"
    assert runtime.current(call.id).legs[-1].provider_agent_id == "recovered-agent"


def test_family_token_is_not_presence_and_listen_still_detects_emergency(runtime):
    call = connected_call(runtime)
    member = runtime.repo.profile.owner_id
    token = runtime.family_token(call.id, member)
    assert token["uid"] >= 2002 and runtime.repo.saved[call.id].family == []
    with pytest.raises(HTTPException) as error:
        runtime.family_control(call.id, member, "confirm")
    assert error.value.status_code == 409
    runtime.voice.members = lambda c: {token["uid"]}
    joined, _ = runtime.family_control(call.id, member, "confirm")
    assert joined.mode == "LISTEN"
    reply, finish = runtime.completion(call.id, call.legs[-1].id, "1", "I slept well.")
    finish()
    assert reply == ""
    reply, finish = runtime.completion(call.id, call.legs[-1].id, "2", "My chest hurts now.")
    finish()
    assert "please call 911 now" in reply.lower()


def test_signed_callbacks_authenticate_raw_body_expiry_and_ignore_agent_join(runtime, monkeypatch):
    monkeypatch.setenv("LINEA_PROVIDER_WEBHOOK_SECRET", "actual-provider-secret")
    received = []
    runtime.repo.enqueue_event = lambda body: received.append(body) or True
    app = FastAPI()
    install_provider_routes(app, runtime)
    body = {
        "noticeId": "event",
        "notifyMs": int(time.time() * 1000),
        "productId": 17,
        "eventType": 202,
        "payload": {
            "state": "ANSWERED",
            "agent_id": "agent",
            "channel": "channel",
            "report_ms": int(time.time() * 1000),
        },
    }

    def post(client, value, secret="actual-provider-secret"):
        raw = json.dumps(value).encode()
        signature = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
        return client.post(
            "/provider/agora/events", content=raw, headers={"Agora-Signature-V2": signature}
        )

    with TestClient(app) as client:
        assert post(client, body, "wrong").status_code == 401
        assert post(client, {**body, "notifyMs": 0}).status_code == 400
        assert post(client, {**body, "eventType": 101}).json()["status"] == "ignored"
        assert not received
        assert post(client, body).status_code == 200 and len(received) == 1


def test_custom_endpoint_sse_auth_stale_legs_and_message_turn_identity(runtime, monkeypatch):
    monkeypatch.setenv("LINEA_CUSTOM_LLM_BEARER", "completion-private")
    call = connected_call(runtime)
    app = FastAPI()
    install_provider_routes(app, runtime)
    url = f"/provider/checkins/{call.id}/legs/{call.legs[-1].id}/chat/completions"
    body = {"messages": [{"role": "user", "content": "My chest hurts now.", "turn_id": 1}]}
    with TestClient(app) as client:
        assert client.post(url, json=body).status_code == 401
        auth = {"Authorization": "Bearer completion-private"}
        reply = client.post(url, json=body, headers=auth)
        assert reply.status_code == 200 and "[DONE]" in reply.text
        assert "please call 911 now" in reply.text.lower()
        assert runtime.repo.saved[call.id].emergency_latched
        assert (
            client.post(
                url.replace(call.legs[-1].id, str(uuid4())), json=body, headers=auth
            ).status_code
            == 409
        )
        assert client.post(url, json={"messages": []}, headers=auth).status_code == 400


def test_openai_envelope_without_turn_id_deduplicates_retries(runtime, monkeypatch):
    monkeypatch.setenv("LINEA_CUSTOM_LLM_BEARER", "completion-private")
    call = connected_call(runtime)
    app = FastAPI()
    install_provider_routes(app, runtime)
    url = f"/provider/checkins/{call.id}/legs/{call.legs[-1].id}/chat/completions"
    auth = {"Authorization": "Bearer completion-private"}
    body = {"messages": [{"role": "user", "content": "I slept well."}], "stream": False}
    with TestClient(app) as client:
        first = client.post(url, json=body, headers=auth)
        assert first.status_code == 200
        retry = client.post(
            url,
            json={"messages": [{"content": "I slept well.", "role": "user"}], "stream": True},
            headers=auth,
        )
        assert retry.status_code == 200 and "[DONE]" in retry.text
    saved = runtime.repo.saved[call.id]
    assert runtime.bridge.classifier.count == 1
    assert len([t for t in saved.transcript if t["speaker"] == "elder"]) == 1
    assert len(saved.processed_turns) == 1


def test_identical_words_in_later_message_history_are_a_new_turn(runtime, monkeypatch):
    monkeypatch.setenv("LINEA_CUSTOM_LLM_BEARER", "completion-private")
    call = connected_call(runtime)
    app = FastAPI()
    install_provider_routes(app, runtime)
    url = f"/provider/checkins/{call.id}/legs/{call.legs[-1].id}/chat/completions"
    auth = {"Authorization": "Bearer completion-private"}
    messages = [{"role": "user", "content": "Yes."}]
    with TestClient(app) as client:
        first = client.post(url, json={"messages": messages, "stream": False}, headers=auth)
        assert first.status_code == 200
        messages.extend(
            [
                {"role": "assistant", "content": first.json()["choices"][0]["message"]["content"]},
                {"role": "user", "content": "Yes."},
            ]
        )
        second = client.post(url, json={"messages": messages, "stream": False}, headers=auth)
        assert second.status_code == 200
    assert runtime.bridge.classifier.count == 2
    assert len(runtime.repo.saved[call.id].processed_turns) == 2


@pytest.mark.parametrize("identity", [True, "", {}, []])
def test_invalid_explicit_turn_identity_is_not_replaced_by_history(runtime, monkeypatch, identity):
    monkeypatch.setenv("LINEA_CUSTOM_LLM_BEARER", "completion-private")
    call = connected_call(runtime)
    app = FastAPI()
    install_provider_routes(app, runtime)
    url = f"/provider/checkins/{call.id}/legs/{call.legs[-1].id}/chat/completions"
    with TestClient(app) as client:
        response = client.post(
            url,
            json={"messages": [{"role": "user", "content": "Yes."}], "turn_id": identity},
            headers={"Authorization": "Bearer completion-private"},
        )
        assert response.status_code == 400
    assert runtime.bridge.classifier.count == 0


def test_strict_interpreter_schema_and_exact_evidence_validation():
    requests = []

    def dispatch(request):
        requests.append(json.loads(request.content))
        return httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "finish_reason": "stop",
                        "message": {
                            "content": json.dumps(
                                {
                                    "concerns": [
                                        {
                                            "incident_id": "chest",
                                            "concern": "CHEST_PAIN",
                                            "quote": "invented evidence",
                                            "current": True,
                                        }
                                    ]
                                }
                            )
                        },
                    }
                ]
            },
        )

    interpreter = OpenAIClassifier(
        "private",
        "gpt-4.1-mini-2025-04-14",
        httpx.Client(base_url="https://api.openai.com", transport=httpx.MockTransport(dispatch)),
    )
    profile = Profile(
        name="Test",
        preferred_name="Test",
        phone="+12025550101",
        owner_id=str(uuid4()),
        contacts=[{"name": "Family", "relationship": "Family", "phone": "+12025550102"}],
    )
    with pytest.raises(ValueError, match="evidence"):
        interpreter.classify(
            "My chest hurts.",
            CheckIn(elder_id=profile.id, owner_id=profile.owner_id, local_date="2026-10-04"),
            profile,
        )
    schema = output_schema()
    assert "due" not in schema["$defs"]["ExtractedFacts"]["properties"]
    assert set(schema["properties"]) == set(schema["required"])
    assert requests[0]["model"] == "gpt-4.1-mini-2025-04-14" and not requests[0]["store"]


def test_agora_request_tokens_scope_full_config_and_teardown(monkeypatch, runtime):
    for name, value in {
        "AGORA_APP_ID": "a" * 32,
        "AGORA_APP_CERTIFICATE": "b" * 32,
        "AGORA_FROM_NUMBER": "+12025550100",
        "LINEA_PUBLIC_API_URL": "https://api.test",
        "LINEA_CUSTOM_LLM_BEARER": "private",
    }.items():
        monkeypatch.setenv(name, value)
    requests = []

    def dispatch(request):
        requests.append(request)
        return httpx.Response(200, json={"agent_id": "provider-agent"})

    voice = AgoraRuntime(
        httpx.Client(base_url="https://api.agora.io", transport=httpx.MockTransport(dispatch)),
        {"asr": {"vendor": "ares"}, "tts": {"vendor": "configured", "params": {}}},
    )
    call = connected_call(runtime)
    call.legs[-1].provider_agent_id = voice.place(call, runtime.repo.profile)
    data = json.loads(requests[0].content)
    assert data["properties"]["remote_rtc_uids"] == [data["sip"]["rtc_uid"]]
    assert data["properties"]["llm"]["url"].endswith(f"/legs/{call.legs[-1].id}/chat/completions")
    assert data["properties"]["parameters"]["opt_out"] is True
    voice.speak(call, "A sentence. " * 120)
    assert all(len(json.loads(r.content)["text"].encode()) <= 512 for r in requests[1:])
    voice.end_everyone(call)
    assert requests[-2].url.path.endswith("/calls/provider-agent/hangup")
    assert requests[-1].url.path.endswith("/agents/provider-agent/leave")
