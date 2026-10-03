from datetime import datetime, timezone

from app.main import create_app
from fastapi.testclient import TestClient


def clock():
    return datetime(2026, 10, 3, 0, 0, tzinfo=timezone.utc)


AUTH = {"Authorization": "Bearer local-demo-only-change-me"}


def test_auth_validation_conflicting_call_and_family_scope():
    app = create_app(":memory:", clock=clock)
    with TestClient(app) as client:
        assert client.get("/dashboard").status_code == 401
        assert (
            client.get("/dashboard", headers={"Authorization": "Bearer wrong"}).status_code == 401
        )
        d = client.get("/dashboard", headers=AUTH).json()
        assert d["profile"]["id"] == "rosa"
        assert client.post("/profiles", json={"name": "Invalid"}, headers=AUTH).status_code == 422
        assert client.get("/checkins/not-owned", headers=AUTH).status_code == 404
        call = client.post("/profiles/rosa/call", headers=AUTH).json()
        assert client.post("/profiles/rosa/call", headers=AUTH).status_code == 409
        assert client.post(f"/checkins/{call['id']}/join", headers=AUTH).status_code == 409
        event = {
            "event_id": "answer",
            "kind": "connected",
            "leg_id": call["legs"][-1]["id"],
        }
        assert (
            client.post(f"/demo/checkins/{call['id']}/event", json=event, headers=AUTH).status_code
            == 200
        )
        assert client.post(f"/checkins/{call['id']}/end", headers=AUTH).status_code == 403
        joined = client.post(f"/checkins/{call['id']}/join", headers=AUTH).json()
        assert joined["simulation"] and joined["rtc"] is None
        assert client.post(f"/checkins/{call['id']}/end", headers=AUTH).json()["intentional_end"]


def test_live_mode_is_fail_closed(monkeypatch):
    import pytest

    monkeypatch.setenv("LINEA_MODE", "live")
    with pytest.raises(RuntimeError, match="Live mode is gated"):
        create_app(":memory:")


def test_emergency_response_survives_storage_failure(monkeypatch):
    app = create_app(":memory:", clock=clock)
    with TestClient(app) as client:
        c = client.post("/profiles/rosa/call", headers=AUTH).json()
        client.post(
            f"/demo/checkins/{c['id']}/event",
            headers=AUTH,
            json={"event_id": "answer", "kind": "connected", "leg_id": c["legs"][0]["id"]},
        )

        def broken_save(item):
            raise OSError("Synthetic storage failure")

        monkeypatch.setattr(app.state.repo, "save", broken_save)
        result = client.post(
            f"/demo/checkins/{c['id']}/turn",
            headers=AUTH,
            json={
                "turn_id": "emergency",
                "text": "My chest hurts",
                "concerns": [
                    {
                        "incident_id": "chest",
                        "concern": "CHEST_PAIN",
                        "quote": "My chest hurts",
                        "current": True,
                    }
                ],
            },
        )
        assert result.status_code == 200 and "911" in result.json()["reply"]
        assert result.json()["persistence_status"] == "failed"


def test_manual_call_is_allowed_outside_automatic_calling_hours():
    def late():
        return datetime(2026, 10, 3, 15, 0, tzinfo=timezone.utc)

    with TestClient(create_app(":memory:", clock=late)) as client:
        assert client.post("/profiles/rosa/call", headers=AUTH).status_code == 201


def test_subscription_metadata_cannot_hide_call_text():
    with TestClient(create_app(":memory:", clock=clock)) as client:
        valid = {
            "endpoint": "https://push.example.test/subscription",
            "keys": {"p256dh": "test-public-key", "auth": "test-auth"},
            "expirationTime": None,
        }
        assert client.post("/push/subscriptions", headers=AUTH, json=valid).status_code == 200
        assert (
            client.post(
                "/push/subscriptions",
                headers=AUTH,
                json={**valid, "transcript": "Must not be stored here"},
            ).status_code
            == 422
        )
