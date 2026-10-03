"""Private Supabase adapter for runtime/worker writes, separate from user-JWT reads."""

from contextlib import contextmanager
from uuid import uuid4

import httpx
from fastapi import HTTPException

from .models import CheckIn
from .supabase_repository import SupabaseRepository


class RuntimeRepository(SupabaseRepository):
    def __init__(self, client):
        super().__init__(client, "")

    def profiles(self):
        # Reuse the connected relational mapper without an owner filter.
        rows = self.rows(
            "elders",
            {
                "select": "*,contacts(*),consents(*)",
                "order": "created_at.asc,id.asc",
                "enrolled": "eq.true",
            },
        )
        return self.map_profiles(rows)

    def calls(self):
        return [
            CheckIn.model_validate(row["payload"])
            for row in self.rows(
                "linea_runtime",
                {
                    "select": "payload,checkins!inner(elder_id)",
                    "checkins.elder_id": "not.is.null",
                    "order": "checkin_id.asc",
                },
            )
        ]

    def call(self, cid):
        rows = self.request(
            "GET",
            "linea_runtime",
            params={
                "checkin_id": f"eq.{cid}",
                "select": "payload",
            },
        )
        if not rows:
            raise HTTPException(404, "Check-in not found")
        return CheckIn.model_validate(rows[0]["payload"])

    @contextmanager
    def locked(self, eid):
        lease = str(uuid4())
        if not self.request("POST", "rpc/linea_lock_runtime", json={"eid": eid, "lease": lease}):
            raise HTTPException(409, "This elder has an operation in progress. Please retry.")
        try:
            yield lease
        finally:
            try:
                self.request("POST", "rpc/linea_unlock_runtime", json={"eid": eid, "lease": lease})
            except HTTPException:
                # A crashed/disconnected owner cannot keep a permanent lease.
                pass

    def commit(self, call, profile, lease, commands=()):
        return self.request(
            "POST",
            "rpc/linea_commit_runtime",
            json={
                "eid": profile.id,
                "lease": lease,
                "call_data": call.model_dump(mode="json"),
                "consent_data": {
                    "decision": profile.consent,
                    "words": profile.consent_words,
                    "decided_at": profile.consent_at.isoformat() if profile.consent_at else None,
                },
                "commands": list(commands),
            },
        )

    def enqueue_event(self, body):
        # SQL stores only lifecycle metadata, never a provider transcript/audio copy.
        return self.request("POST", "rpc/linea_enqueue_event", json={"notice": body})

    def jobs(self, table):
        order = "report_ms.asc,id.asc" if table == "linea_event_inbox" else "created_at.asc,id.asc"
        return self.rows(table, {"state": "eq.pending", "order": order})

    def update_job(self, table, jid, **values):
        self.request("PATCH", table, params={"id": f"eq.{jid}"}, json=values)


def service_client():
    import os

    url, key = os.getenv("SUPABASE_URL", "").rstrip("/"), os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url.startswith("https://") or not key:
        raise RuntimeError("Runtime workers require server-side Supabase URL and service-role key")
    return httpx.Client(
        base_url=url, headers={"apikey": key, "Authorization": f"Bearer {key}"}, timeout=15
    )
