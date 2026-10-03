from datetime import datetime, timedelta

from .conversation import briefing, emergency, opening
from .models import Alert, CheckIn, Leg, Profile, now
from .policy import assess


def place(c: CheckIn, kind: str, at: datetime) -> Leg:
    if c.ended_at:
        raise ValueError("Finalized check-in cannot acquire a new leg")
    if any(phone_leg.state in ("ringing", "connected") for phone_leg in c.legs):
        raise ValueError("A phone leg is already active")
    if c.intentional_end:
        raise ValueError("This check-in was intentionally ended")
    if kind in ("initial", "retry"):
        if c.initial_attempts >= 2:
            raise ValueError("Initial connection budget exhausted")
        c.initial_attempts += 1
    if kind == "reconnect":
        if c.reconnect_used:
            raise ValueError("Reconnection budget exhausted")
        c.reconnect_used = True
    if kind == "manual" and c.retry_at:
        c.suspended_retry_at, c.suspended_retry_state = c.retry_at, c.state
    c.retry_at = None
    leg = Leg(kind=kind, started_at=at)
    c.legs.append(leg)
    c.state = "reconnecting" if kind == "reconnect" else "ringing"
    return leg


def connection_alert(c: CheckIn, reason: str, at: datetime):
    old = next((a for a in c.alerts if a.concern == "CALL_CONNECTION"), None)
    if old:
        old.reason = reason
    else:
        c.alerts.append(
            Alert(
                incident_id=f"connection:{c.id}",
                concern="CALL_CONNECTION",
                reason=reason,
                created_at=at,
            )
        )


def finalize(c: CheckIn, at: datetime):
    c.state, c.retry_at = "ended", None
    c.suspended_retry_at, c.suspended_retry_state = None, None
    c.ended_at = c.ended_at or at
    for leg in c.legs:
        if leg.state in ("ringing", "connected"):
            leg.state, leg.ended_at = "ended", at
    c.family = []
    c.summary = (
        f"Check-in {'completed' if c.complete else 'incomplete'}. Medicine reported "
        f"{c.medicine_result.replace('_', ' ')}. "
        + (
            "Concerns were recorded for family review."
            if any(a.concern != "CALL_CONNECTION" for a in c.alerts)
            else "No symptom concern was recorded."
        )
    )


def event(c: CheckIn, p: Profile, event_id: str, kind: str, leg_id: str, at: datetime) -> str:
    if event_id in c.processed_events:
        return ""
    leg = next((phone_leg for phone_leg in c.legs if phone_leg.id == leg_id), None)
    if not leg:
        raise ValueError("Unknown phone leg")
    if leg.state not in ("ringing", "connected"):
        # Out-of-order terminal events cannot close a replacement leg.
        c.processed_events.append(event_id)
        return ""
    reply = ""
    if kind == "connected":
        if leg.state == "connected":
            return ""
        leg.state, c.state = "connected", "connected"
        if leg.kind == "manual":
            c.suspended_retry_at, c.suspended_retry_state = None, None
        c.family = []
        reply = opening(c, p, leg.kind == "reconnect")
    elif kind in ("no_answer", "failed", "dropped"):
        established = leg.state == "connected"
        leg.state, leg.ended_at, c.family = kind, at, []
        if (
            c.intentional_end
            or p.consent == "declined"
            or (c.mode == "ENDING" and c.active_question is None)
        ):
            c.intentional_end = True
            finalize(c, at)
        elif not established and leg.kind == "manual" and c.suspended_retry_at:
            c.state = c.suspended_retry_state
            c.retry_at = max(c.suspended_retry_at, at)
            c.suspended_retry_at, c.suspended_retry_state = None, None
            connection_alert(
                c,
                "Manual call did not connect. The eligible automatic attempt remains pending.",
                at,
            )
        elif established and not c.reconnect_used:
            c.state = "reconnecting"
            c.retry_at = at
            connection_alert(c, "Connection lost. One reconnection is pending.", at)
        elif not established and leg.kind in ("initial", "retry") and c.initial_attempts < 2:
            c.state, c.retry_at = "retry_scheduled", at + timedelta(minutes=15)
            connection_alert(
                c, f"Nobody answered. Retry scheduled for {c.retry_at.isoformat()}.", at
            )
        else:
            connection_alert(
                c,
                "Manual call did not connect. Check-in incomplete."
                if leg.kind == "manual"
                else "Automatic attempts exhausted. Check-in incomplete.",
                at,
            )
            finalize(c, at)
        if c.emergency_latched:
            connection_alert(
                c,
                "Connection lost during an Emergency. Family attention required; eligible automatic attempt remains governed by its budget.",
                at,
            )
    elif kind == "ended":
        c.intentional_end = True
        finalize(c, at)
    else:
        raise ValueError("Unsupported normalized provider event")
    c.processed_events.append(event_id)
    if reply:
        c.active_prompt = reply
        c.transcript.append({"speaker": "linea", "text": reply, "at": at.isoformat()})
    return reply


def join(c: CheckIn, p: Profile, member: str) -> str:
    if c.state != "connected":
        raise ValueError("The phone call is not connected")
    if member in c.family:
        return ""
    c.family.append(member)
    c.family_joined_at = c.family_joined_at or now()
    c.mode = "EMERGENCY" if c.emergency_latched else "LISTEN"
    c.active_question = None
    return briefing(c, p)


def leave(c: CheckIn, p: Profile, member: str) -> str:
    if member not in c.family:
        return ""
    c.family.remove(member)
    if c.family or c.state != "connected":
        return ""
    if c.emergency_latched:
        return emergency(p)
    c.mode = "SCRIPT"
    for facts in c.facts.values():
        result = assess(facts)
        if result.new_event and not result.resume:
            c.active_question = f"concern:{facts.incident_id}"
            return result.question or "I am here while you connect with someone who can help."
    if c.farewell_asked:
        return ""
    c.farewell_asked = True
    c.mode, c.active_question = "ENDING", "anything"
    return f"{p.preferred_name}, it's just us again. Is there anything else you'd like to share?"
