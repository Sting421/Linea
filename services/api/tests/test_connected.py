import json
from datetime import timedelta
from types import SimpleNamespace
from uuid import uuid4

import httpx
import pytest
from app import main
from app.models import now
from fastapi.testclient import TestClient

USER = str(uuid4())
OTHER = str(uuid4())
PID = str(uuid4())
AUTH = {"Authorization": "Bearer user-session"}
PROFILE = {
    "name": "Test Elder",
    "preferred_name": "Test",
    "phone": "+12025550101",
    "timezone": "Asia/Manila",
    "call_time": "08:00",
    "medicine": "Test medicine",
    "medicine_time": "08:00",
    "language": "en-US",
    "contacts": [
        {"name": "Test Contact", "relationship": "Family", "phone": "+12025550102", "nearby": True}
    ],
}


@pytest.fixture
def connected(monkeypatch):
    monkeypatch.setenv("LINEA_MODE", "connected")
    monkeypatch.setenv("SUPABASE_URL", "https://supabase.test")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "public-test-key")
    requests = []
    rows = {"elders": [], "checkins": []}
    failures = {}

    def dispatch(request):
        requests.append(request)
        path = request.url.path
        assert request.headers["apikey"] == "public-test-key"
        if path in failures:
            return httpx.Response(failures[path], json={"detail": "Private database diagnostics"})
        if path == "/auth/v1/user":
            if request.headers["Authorization"] != AUTH["Authorization"]:
                return httpx.Response(401)
            return httpx.Response(200, json={"id": USER, "is_anonymous": False})
        assert request.headers["Authorization"] == AUTH["Authorization"]
        if path == "/rest/v1/rpc/save_family_profile":
            data = json.loads(request.content)
            profile = data["profile_data"]
            rows["elders"][:] = [
                {
                    **profile,
                    "id": data["profile_id"],
                    "owner_id": USER,
                    "contacts": [
                        {**c, "position": i + 1} for i, c in enumerate(profile["contacts"])
                    ],
                    "consents": {"decision": "pending", "words": None, "decided_at": None},
                }
            ]
            return httpx.Response(200, json=data["profile_id"])
        if path == "/rest/v1/push_subscriptions":
            return httpx.Response(201)
        table = path.rsplit("/", 1)[-1]
        assert request.url.params["owner_id"] == f"eq.{USER}"
        return httpx.Response(200, json=rows[table])

    monkeypatch.setattr(
        main,
        "httpx",
        SimpleNamespace(
            Client=lambda **kwargs: httpx.Client(**kwargs, transport=httpx.MockTransport(dispatch))
        ),
    )
    with TestClient(main.create_app()) as client:
        yield client, requests, rows, failures


def test_connected_verifies_session_and_never_accepts_demo_token(connected):
    client, requests, _, _ = connected
    assert client.get("/dashboard").status_code == 401
    assert (
        client.get(
            "/dashboard", headers={"Authorization": "Bearer local-demo-only-change-me"}
        ).status_code
        == 401
    )
    assert not any("/rest/v1/" in str(r.url) for r in requests)
    response = client.get("/dashboard", headers=AUTH)
    assert response.status_code == 200
    assert response.json() == {
        "profile": None,
        "profiles": [],
        "checkins": [],
        "alerts": [],
        "mode": "connected",
        "voice_connected": False,
    }
    assert client.get("/health").json()["repository"] == "supabase"


def test_profile_create_update_roundtrip_uses_atomic_rpc_and_verified_owner(connected):
    client, requests, _, _ = connected
    created = client.post("/profiles", headers=AUTH, json=PROFILE)
    assert created.status_code == 201
    profile = created.json()
    assert profile["owner_id"] == USER and profile["consent"] == "pending"
    assert client.get("/dashboard", headers=AUTH).json()["profile"] == profile
    updated = client.put(
        f"/profiles/{profile['id']}",
        headers=AUTH,
        json={
            **PROFILE,
            "name": "Edited",
            "contacts": [{**PROFILE["contacts"][0], "name": "Edited contact"}],
        },
    )
    assert updated.status_code == 200
    assert (
        client.get("/profiles", headers=AUTH).json()[0]["contacts"][0]["name"] == "Edited contact"
    )
    writes = [json.loads(r.content) for r in requests if r.method == "POST"]
    assert [w["create_new"] for w in writes] == [True, False]
    assert all(
        "owner_id" not in w["profile_data"] and "consent" not in w["profile_data"] for w in writes
    )
    for forged in ({"owner_id": OTHER}, {"consent": "granted"}):
        assert client.post("/profiles", headers=AUTH, json={**PROFILE, **forged}).status_code == 422


def test_foreign_ids_are_rejected_without_database_writes(connected):
    client, requests, _, _ = connected
    assert client.put(f"/profiles/{PID}", headers=AUTH, json=PROFILE).status_code == 404
    assert client.get(f"/dashboard?elder_id={PID}", headers=AUTH).status_code == 404
    assert client.get(f"/checkins/{PID}", headers=AUTH).status_code == 404
    assert client.post(f"/checkins/{PID}/alerts/{PID}/handle", headers=AUTH).status_code == 404
    assert not any(r.method == "POST" for r in requests)


def test_connected_blocks_all_simulated_voice_mutations(connected):
    client, requests, _, _ = connected
    for route in [
        f"/profiles/{PID}/call",
        f"/checkins/{PID}/join",
        f"/checkins/{PID}/leave",
        f"/checkins/{PID}/end",
    ]:
        assert client.post(route, headers=AUTH).status_code == 503
    for suffix in ["event", "turn", "automatic-attempt"]:
        assert (
            client.post(f"/demo/checkins/{PID}/{suffix}", headers=AUTH, json={}).status_code == 404
        )
    assert not any(r.method == "POST" for r in requests)


def test_database_failure_never_claims_a_profile_was_saved(connected):
    client, _, _, failures = connected
    failures["/rest/v1/rpc/save_family_profile"] = 500
    response = client.post("/profiles", headers=AUTH, json=PROFILE)
    assert response.status_code == 503
    assert "Private database diagnostics" not in response.text
    failures["/auth/v1/user"] = 503
    assert client.get("/dashboard", headers=AUTH).status_code == 503


def test_subscription_saved_under_verified_identity(connected):
    client, requests, _, _ = connected
    result = client.post(
        "/push/subscriptions",
        headers=AUTH,
        json={
            "endpoint": "https://push.example.test/test",
            "keys": {"auth": "test", "p256dh": "test"},
        },
    )
    assert result.status_code == 200 and not result.json()["delivery_connected"]
    assert json.loads(requests[-1].content)["user_id"] == USER


def test_configuration_returns_only_public_push_key(connected, monkeypatch):
    client, _, _, _ = connected
    monkeypatch.setenv("WEB_PUSH_PUBLIC_KEY", "public-key")
    monkeypatch.setenv("WEB_PUSH_PRIVATE_KEY", "private-key-never-expose")
    response = client.get("/configuration", headers=AUTH)
    assert response.status_code == 200
    assert response.json()["web_push_public_key"] == "public-key"
    assert "private-key-never-expose" not in response.text


def test_relational_checkins_map_to_ui_and_expired_text_is_suppressed(connected):
    client, _, rows, _ = connected
    ended = now() - timedelta(days=91)
    rows["checkins"] = [
        {
            "id": PID,
            "elder_id": PID,
            "owner_id": USER,
            "local_date": ended.date().isoformat(),
            "created_at": ended.isoformat(),
            "ended_at": ended.isoformat(),
            "state": "ended",
            "mode": "ENDING",
            "phone_legs": [
                {
                    "id": PID,
                    "kind": "initial",
                    "state": "ended",
                    "started_at": ended.isoformat(),
                    "ended_at": ended.isoformat(),
                }
            ],
            "checkin_details": {
                "summary": "Expired private text",
                "transcript": [],
                "runtime_context": {"answers": {"sleep": "Private answer"}},
            },
            "alerts": [
                {
                    "id": PID,
                    "incident_id": "test",
                    "concern": "DIZZINESS",
                    "tier": "routine",
                    "assessment": "complete",
                    "subject": "elder",
                    "reason_code": "resolved",
                    "alert_details": {"quotation": "Expired quote"},
                }
            ],
            "family_presence": [],
        }
    ]
    response = client.get(f"/checkins/{PID}", headers=AUTH)
    assert response.status_code == 200
    c = response.json()
    assert c["text_expired"] and c["summary"] is None and c["answers"] == {}
    assert c["alerts"][0]["quote"] is None
    assert c["alerts"][0]["notification_status"] == "not_connected"
    assert c["legs"][0]["id"] == PID
