from app.main import create_app
from fastapi.testclient import TestClient
from test_api import AUTH, clock


def test_fresh_onboarding_consent_complete_call_and_calendar(monkeypatch):
    monkeypatch.setenv("LINEA_DEMO_SEED", "0")
    with TestClient(create_app(":memory:", clock=clock)) as client:
        assert client.get("/dashboard", headers=AUTH).json()["profile"] is None
        body = {
            "name": "Rosa Santos",
            "preferred_name": "Nanay Rosa",
            "phone": "+639123456789",
            "contacts": [{"name": "Ana", "relationship": "Daughter", "phone": "+639123456790"}],
        }
        p = client.post("/profiles", json=body, headers=AUTH).json()
        assert p["consent"] == "pending"
        c = client.post(f"/profiles/{p['id']}/call", headers=AUTH).json()
        cid = c["id"]
        answered = client.post(
            f"/demo/checkins/{cid}/event",
            headers=AUTH,
            json={
                "event_id": "answer",
                "leg_id": c["legs"][0]["id"],
                "kind": "connected",
            },
        ).json()
        assert "okay" in answered["reply"]
        for i, values in enumerate(
            [
                {"text": "Yes", "consent": "yes"},
                {"text": "Slept well", "answers": {"sleep": "well"}},
                {
                    "text": "Taken",
                    "answers": {"medicine": "taken"},
                    "medicine_result": "taken",
                },
                {"text": "Feeling well", "answers": {"feeling": "well"}},
                {"text": "Nothing else", "answers": {"anything": "none"}},
            ]
        ):
            result = client.post(
                f"/demo/checkins/{cid}/turn",
                headers=AUTH,
                json={"turn_id": str(i), **values},
            )
            assert result.status_code == 200
        assert result.json()["call"]["complete"]
        client.post(
            f"/demo/checkins/{cid}/event",
            headers=AUTH,
            json={"event_id": "end", "leg_id": c["legs"][0]["id"], "kind": "ended"},
        )
        done = client.get(f"/checkins/{cid}", headers=AUTH).json()
        assert done["day_status"] == "green" and done["summary"] and len(done["transcript"]) >= 10


def test_consent_no_ends_call_and_blocks_next_call(monkeypatch):
    monkeypatch.setenv("LINEA_DEMO_SEED", "0")
    with TestClient(create_app(":memory:", clock=clock)) as client:
        p = client.post(
            "/profiles",
            headers=AUTH,
            json={
                "name": "Rosa",
                "preferred_name": "Nanay Rosa",
                "phone": "+639123456789",
                "contacts": [
                    {
                        "name": "Ana",
                        "relationship": "Daughter",
                        "phone": "+639123456790",
                    }
                ],
            },
        ).json()
        c = client.post(f"/profiles/{p['id']}/call", headers=AUTH).json()
        client.post(
            f"/demo/checkins/{c['id']}/event",
            headers=AUTH,
            json={
                "event_id": "answer",
                "leg_id": c["legs"][0]["id"],
                "kind": "connected",
            },
        )
        ended = client.post(
            f"/demo/checkins/{c['id']}/turn",
            headers=AUTH,
            json={"turn_id": "no", "text": "Please do not call", "consent": "no"},
        ).json()["call"]
        assert ended["state"] == "ended" and ended["intentional_end"]
        assert client.post(f"/profiles/{p['id']}/call", headers=AUTH).status_code == 409
