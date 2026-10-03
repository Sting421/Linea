"""Exercise real Auth, RLS, atomic writes and the local web proxy using disposable users.

Run only against the configured Linea project: python scripts/verify-connected.py --run
Add --signup to exercise the actual registration form endpoint when the development
project has email confirmation disabled. Without it, test users are admin-created.
Never prints credentials, tokens, contact records, or authentication links. Creates
two synthetic email-confirmed accounts without sending email, then deletes only
the accounts and records created by this invocation, including on test failure.
"""

import argparse
import json
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

import httpx
from dotenv import dotenv_values


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", action="store_true", required=True)
    parser.add_argument("--web-url", default="http://127.0.0.1:3000")
    parser.add_argument("--signup", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    env = dotenv_values(root / "services/api/.env")
    api_env = dotenv_values(root / "apps/web/.env.local")
    assert env["SUPABASE_URL"] == api_env["NEXT_PUBLIC_SUPABASE_URL"], "Supabase project mismatch"
    assert api_env["LINEA_MODE"] == "connected", "Start the web app in connected mode first"
    url = env["SUPABASE_URL"].rstrip("/")
    key = env["SUPABASE_SERVICE_ROLE_KEY"]
    admin = httpx.Client(
        base_url=url, headers={"apikey": key, "Authorization": f"Bearer {key}"}, timeout=20
    )
    run_id = uuid4().hex
    users, profiles, calls, clients, passwords = [], [], [], [], []
    manifest = root / "artifacts" / f"connected-check-{run_id}.json"
    manifest.parent.mkdir(exist_ok=True)

    def record():
        manifest.write_text(
            json.dumps({"users": users, "profiles": profiles, "checkins": calls}), encoding="utf-8"
        )

    def checked(response, status=200):
        if response.status_code != status:
            raise AssertionError(
                f"{response.request.method} {response.request.url.path}: expected {status}, got {response.status_code}"
            )
        return response.json() if response.content else None

    try:
        # Refuse to create test accounts until the migration is visible.
        schema = checked(admin.get("/rest/v1/"))
        assert "/rpc/save_family_profile" in schema["paths"], (
            "Apply the connected workspace migration first"
        )
        if args.signup:
            settings = checked(admin.get("/auth/v1/settings"))
            assert settings.get("mailer_autoconfirm") is True, (
                "Public signup check requires email confirmation disabled; no emails will be sent"
            )
        for index in range(2):
            email = f"linea-check-{run_id}-{index}@example.com"
            password = secrets.token_urlsafe(32)
            passwords.append(password)
            if args.signup:
                with httpx.Client(base_url=args.web_url, timeout=30) as registration:
                    registration.headers["Origin"] = args.web_url
                    registered = checked(
                        registration.post(
                            "/api/session",
                            json={
                                "action": "signup",
                                "email": email,
                                "password": password,
                                "confirmPassword": password,
                            },
                        )
                    )
                    assert registered == {"ok": True, "confirmationRequired": False}
                    assert checked(registration.get("/api/backend/dashboard"))["profile"] is None
                    checked(registration.post("/api/session", json={"action": "signout"}))
            else:
                user = checked(
                    admin.post(
                        "/auth/v1/admin/users",
                        json={"email": email, "password": password, "email_confirm": True},
                    )
                )
                users.append(user["id"])
                record()
            public = httpx.Client(
                base_url=url, headers={"apikey": env["SUPABASE_PUBLISHABLE_KEY"]}, timeout=20
            )
            session = checked(
                public.post(
                    "/auth/v1/token?grant_type=password",
                    json={"email": email, "password": password},
                )
            )
            if args.signup:
                users.append(session["user"]["id"])
                record()
            public.headers["Authorization"] = f"Bearer {session['access_token']}"
            clients.append(public)
        if args.signup:
            print(
                "PASS: two fresh accounts registered through the frontend endpoint, immediately authenticated, and signed out without email"
            )
        owner, stranger = clients
        payload = {
            "name": "Temporary integration test",
            "preferred_name": "Test",
            "phone": "+12025550101",
            "timezone": "Asia/Manila",
            "call_time": "08:00",
            "medicine": "Test medicine",
            "medicine_time": "08:00",
            "language": "en-US",
            "contacts": [
                {
                    "name": "Temporary test contact",
                    "relationship": "Family",
                    "phone": "+12025550102",
                    "nearby": True,
                }
            ],
        }
        # Exercise normal email/password sign-in, SSR cookies, and the real API.
        with httpx.Client(base_url=args.web_url, timeout=30, follow_redirects=False) as web:
            web.headers["Origin"] = args.web_url
            login = {
                "action": "signin",
                "email": f"linea-check-{run_id}-0@example.com",
                "password": passwords[0],
            }
            assert (
                web.post(
                    "/api/session", json={**login, "password": "incorrect-password"}
                ).status_code
                == 401
            )
            assert web.get("/api/backend/dashboard").status_code == 401
            assert (
                web.post(
                    "/api/session",
                    content="invalid-json",
                    headers={"Content-Type": "application/json"},
                ).status_code
                == 400
            )
            assert (
                web.post(
                    "/api/session", json=login, headers={"Origin": "https://foreign.example.test"}
                ).status_code
                == 403
            )
            signed_in = checked(web.post("/api/session", json=login))
            assert signed_in == {"ok": True, "confirmationRequired": False}
            assert (
                web.post(
                    "/api/session",
                    json={**login, "action": "signup", "confirmPassword": "mismatch"},
                ).status_code
                == 400
            )
            empty = checked(web.get("/api/backend/dashboard"))
            assert empty["mode"] == "connected" and empty["profile"] is None
            created = checked(web.post("/api/backend/profiles", json=payload), 201)
            pid = created["id"]
            profiles.append(pid)
            record()
            assert created["owner_id"] == users[0] and created["consent"] == "pending"
            reloaded = checked(web.get("/api/backend/dashboard"))["profile"]
            assert reloaded == created
            edited = {
                **payload,
                "preferred_name": "Edited test",
                "contacts": [{**payload["contacts"][0], "name": "Updated test contact"}],
            }
            checked(web.put(f"/api/backend/profiles/{pid}", json=edited))
            reloaded = checked(web.get("/api/backend/dashboard"))["profile"]
            assert (
                reloaded["preferred_name"] == "Edited test"
                and reloaded["contacts"][0]["name"] == "Updated test contact"
            )
            assert reloaded["consent"] == "pending"
            print(
                "PASS: password sign-in, rejected credentials/origins, session cookies, profile/contact create, edit and reload"
            )
            # Verify a brand-new backend HTTP request also reads persisted records.
            api_url = api_env["LINEA_API_URL"]
            direct = httpx.get(
                api_url + "/profiles",
                headers={"Authorization": owner.headers["Authorization"]},
                timeout=20,
            )
            assert checked(direct)[0]["id"] == pid
            for table, column in [
                ("elders", "id"),
                ("contacts", "elder_id"),
                ("consents", "elder_id"),
                ("family_members", "elder_id"),
            ]:
                assert (
                    checked(stranger.get(f"/rest/v1/{table}", params={column: f"eq.{pid}"})) == []
                )
            denied = stranger.post(
                "/rest/v1/rpc/save_family_profile",
                json={"profile_id": pid, "profile_data": edited, "create_new": False},
            )
            assert denied.status_code == 403
            assert (
                httpx.put(
                    api_url + f"/profiles/{pid}",
                    headers={"Authorization": stranger.headers["Authorization"]},
                    json=edited,
                    timeout=20,
                ).status_code
                == 404
            )
            print("PASS: cross-account reads and writes denied by both API and database")
            # A failure after the profile UPDATE and contacts DELETE must roll back both.
            invalid = {
                **edited,
                "preferred_name": "Must roll back",
                "contacts": [{**edited["contacts"][0], "phone": "invalid"}],
            }
            assert owner.post(
                "/rest/v1/rpc/save_family_profile",
                json={"profile_id": pid, "profile_data": invalid, "create_new": False},
            ).is_error
            assert checked(web.get("/api/backend/dashboard"))["profile"] == reloaded
            print("PASS: failed contact replacement rolls back the entire profile edit")
            call_id, alert_id = str(uuid4()), str(uuid4())
            ended = datetime.now(timezone.utc) - timedelta(days=1)
            checked(
                admin.post(
                    "/rest/v1/checkins",
                    json={
                        "id": call_id,
                        "elder_id": pid,
                        "owner_id": users[0],
                        "local_date": ended.date().isoformat(),
                        "created_at": ended.isoformat(),
                        "ended_at": ended.isoformat(),
                        "state": "ended",
                        "mode": "ENDING",
                    },
                ),
                201,
            )
            calls.append(call_id)
            record()
            checked(
                admin.post(
                    "/rest/v1/alerts",
                    json={
                        "id": alert_id,
                        "checkin_id": call_id,
                        "incident_id": "temporary-test",
                        "concern": "DIZZINESS",
                        "tier": "routine",
                        "subject": "elder",
                        "assessment": "complete",
                        "reason_code": "resolved",
                    },
                ),
                201,
            )
            checked(
                admin.post(
                    "/rest/v1/checkin_details",
                    json={"checkin_id": call_id, "summary": "Temporary test summary"},
                ),
                201,
            )
            checked(
                admin.post(
                    "/rest/v1/alert_details",
                    json={"alert_id": alert_id, "quotation": "Temporary synthetic test quotation"},
                ),
                201,
            )
            checkin = checked(web.get(f"/api/backend/checkins/{call_id}"))
            assert checkin["summary"] == "Temporary test summary"
            assert checkin["alerts"][0]["quote"] == "Temporary synthetic test quotation"
            handled = checked(web.post(f"/api/backend/checkins/{call_id}/alerts/{alert_id}/handle"))
            assert handled["handled_at"] and handled["handled_by"] == users[0]
            again = checked(web.post(f"/api/backend/checkins/{call_id}/alerts/{alert_id}/handle"))
            assert again["handled_at"] == handled["handled_at"]
            assert checked(stranger.get("/rest/v1/checkins", params={"id": f"eq.{call_id}"})) == []
            assert (
                checked(
                    stranger.get("/rest/v1/alert_details", params={"alert_id": f"eq.{alert_id}"})
                )
                == []
            )
            assert (
                stranger.post(
                    "/rest/v1/rpc/handle_family_alert",
                    json={"call_id": call_id, "alert_id": alert_id},
                ).status_code
                == 403
            )
            print(
                "PASS: persisted check-in detail, idempotent alert handling, and history isolation"
            )
            for route in [f"profiles/{pid}/call", f"checkins/{pid}/join"]:
                assert web.post(f"/api/backend/{route}").status_code == 503
            assert web.post(f"/api/backend/demo/checkins/{pid}/event", json={}).status_code == 404
            assert checked(web.post("/api/session", json={"action": "signout"}))["ok"]
            assert web.get("/api/backend/dashboard").status_code == 401
            assert checked(web.post("/api/session", json=login))["ok"]
            assert checked(web.get("/api/backend/dashboard"))["profile"] == reloaded
            checked(web.post("/api/session", json={"action": "signout"}))
            print(
                "PASS: simulated calls disabled; sign-out removes access; password re-login retains records"
            )
        print("CONNECTED WORKSPACE VERIFIED")
    finally:
        cleanup_ok = True
        for cid in calls:
            response = admin.delete(
                "/rest/v1/checkins", params={"id": f"eq.{cid}", "owner_id": f"eq.{users[0]}"}
            )
            cleanup_ok = cleanup_ok and response.is_success
        # Exact IDs from this invocation only. Contact, consent and membership rows cascade.
        for pid in profiles:
            response = admin.delete(
                "/rest/v1/elders", params={"id": f"eq.{pid}", "owner_id": f"eq.{users[0]}"}
            )
            cleanup_ok = cleanup_ok and response.is_success
        for uid in users:
            response = admin.delete(f"/auth/v1/admin/users/{uid}")
            cleanup_ok = cleanup_ok and response.is_success
        for client in clients:
            client.close()
        admin.close()
        if cleanup_ok:
            manifest.unlink(missing_ok=True)
            print("Temporary test accounts and records removed")
        else:
            print(f"Cleanup incomplete; exact test IDs preserved in {manifest}")


if __name__ == "__main__":
    main()
