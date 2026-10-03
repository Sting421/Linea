"""User-scoped Supabase persistence for the connected family workspace.

Every request uses a verified user's JWT, including database RPCs. No service-role
key is needed by the running API; RLS remains a second authorization boundary.
Voice state writes are deliberately absent until the provider adapter exists.
"""

from datetime import timedelta

import httpx
from fastapi import HTTPException

from .models import Alert, CheckIn, Leg, Profile, now


class SupabaseRepository:
    def __init__(self, client: httpx.Client, owner_id: str):
        self.client = client
        self.owner_id = owner_id

    def request(self, method, path, **kwargs):
        try:
            response = self.client.request(method, f"/rest/v1/{path}", **kwargs)
        except httpx.RequestError as exc:
            raise HTTPException(
                503, "The database could not be reached. Please try again."
            ) from exc
        if response.status_code in (401, 403):
            raise HTTPException(403, "You do not have access to this record.")
        if response.is_error:
            # Never expose Postgres details, bearer tokens, or personal records.
            raise HTTPException(503, "The database operation failed. Please try again.")
        return response.json() if response.content else None

    def rows(self, table, params):
        result = []
        offset = 0
        while True:
            page = self.request(
                "GET", table, params={**params, "limit": "500", "offset": str(offset)}
            )
            result.extend(page)
            if len(page) < 500:
                return result
            offset += len(page)

    def profiles(self):
        rows = self.rows(
            "elders",
            {
                "select": "*,contacts(*),consents(*)",
                "owner_id": f"eq.{self.owner_id}",
                "order": "created_at.asc,id.asc",
            },
        )
        profiles = []
        for row in rows:
            values = {k: row[k] for k in Profile.model_fields if k in row}
            values["contacts"] = [
                {k: contact[k] for k in ("name", "relationship", "phone", "nearby")}
                for contact in sorted(row.get("contacts", []), key=lambda c: c["position"])
            ]
            consent = row.get("consents") or {}
            values.update(
                call_time=row["call_time"][:5],
                medicine_time=row["medicine_time"][:5],
                consent=consent.get("decision", "pending"),
                consent_words=consent.get("words"),
                consent_at=consent.get("decided_at"),
            )
            profiles.append(Profile.model_validate(values))
        return profiles

    def save_profile(self, profile: Profile, *, create: bool):
        if profile.owner_id != self.owner_id:
            raise HTTPException(404, "Elder not found")
        payload = profile.model_dump(
            mode="json",
            exclude={"id", "owner_id", "consent", "consent_words", "consent_at", "enrolled"},
        )
        self.request(
            "POST",
            "rpc/save_family_profile",
            json={"profile_id": profile.id, "profile_data": payload, "create_new": create},
        )

    def calls(self):
        rows = self.rows(
            "checkins",
            {
                "select": "*,phone_legs(*),alerts(*,alert_details(*)),checkin_details(*),family_presence(*)",
                "owner_id": f"eq.{self.owner_id}",
                "order": "created_at.desc,id.asc",
            },
        )
        calls = []
        for row in rows:
            # History whose elder was unenrolled is not part of an active profile.
            if not row.get("elder_id"):
                continue
            values = {k: row[k] for k in CheckIn.model_fields if k in row and k != "alerts"}
            call = CheckIn.model_validate(values)
            call.text_expired = bool(call.ended_at and now() >= call.ended_at + timedelta(days=90))
            details = {} if call.text_expired else (row.get("checkin_details") or {})
            call.transcript = details.get("transcript", [])
            call.summary = details.get("summary")
            call.answers = details.get("runtime_context", {}).get("answers", {})
            call.legs = [
                Leg.model_validate({k: leg[k] for k in Leg.model_fields if k in leg})
                for leg in sorted(row.get("phone_legs", []), key=lambda leg: leg["started_at"])
            ]
            call.family = [
                p["user_id"]
                for p in row.get("family_presence", [])
                if p.get("joined_at") and not p.get("left_at")
            ]
            call.alerts = []
            for alert in row.get("alerts", []):
                detail = {} if call.text_expired else (alert.get("alert_details") or {})
                alert_values = {k: alert[k] for k in Alert.model_fields if k in alert}
                alert_values.update(
                    reason=alert["reason_code"],
                    quote=detail.get("quotation"),
                    notification_status="not_connected",
                )
                call.alerts.append(Alert.model_validate(alert_values))
            calls.append(CheckIn.model_validate(call.model_dump()))
        return calls

    def mark_handled(self, checkin_id, alert_id):
        self.request(
            "POST", "rpc/handle_family_alert", json={"call_id": checkin_id, "alert_id": alert_id}
        )

    def subscribe(self, owner, subscription):
        if owner != self.owner_id:
            raise HTTPException(403, "Subscription owner mismatch")
        self.request(
            "POST",
            "push_subscriptions",
            params={"on_conflict": "user_id,endpoint"},
            headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
            json={"user_id": owner, "endpoint": subscription["endpoint"], **subscription["keys"]},
        )


def verify_user(client: httpx.Client) -> str:
    try:
        response = client.get("/auth/v1/user")
    except httpx.RequestError as exc:
        raise HTTPException(503, "Sign-in verification is temporarily unavailable.") from exc
    if response.status_code in (401, 403):
        raise HTTPException(401, "Please sign in again.")
    if response.is_error:
        raise HTTPException(503, "Sign-in verification is temporarily unavailable.")
    from uuid import UUID

    try:
        user = response.json()
        user_id = str(UUID(user["id"]))
    except (ValueError, KeyError, TypeError) as exc:
        raise HTTPException(401, "Invalid sign-in session.") from exc
    if user.get("is_anonymous"):
        raise HTTPException(401, "Sign in with your email to use this workspace.")
    return user_id
