"""Placement planner, run by one worker. No scheduler starts on module import.
The connected production worker must acquire the SQL per-elder placement lock.
"""

from datetime import datetime
from zoneinfo import ZoneInfo

from .models import CheckIn, Profile


def plan(profiles: list[Profile], calls: list[CheckIn], at: datetime) -> list[dict]:
    result = []
    for p in profiles:
        if not p.enrolled or p.consent != "granted":
            continue
        local = at.astimezone(ZoneInfo(p.timezone))
        if not 6 <= local.hour < 21:
            continue
        cs = [c for c in calls if c.elder_id == p.id]
        if any(phone_leg.state in ("connected", "ringing") for c in cs for phone_leg in c.legs):
            continue
        pending = next(
            (
                c
                for c in cs
                if not c.intentional_end
                and c.retry_at
                and c.retry_at <= at
                and c.state in ("retry_scheduled", "reconnecting")
            ),
            None,
        )
        if pending:
            if pending.state == "reconnecting" and not pending.reconnect_used:
                result.append({"elder_id": p.id, "checkin_id": pending.id, "kind": "reconnect"})
            elif pending.state == "retry_scheduled" and pending.initial_attempts < 2:
                result.append({"elder_id": p.id, "checkin_id": pending.id, "kind": "retry"})
        elif local.strftime("%H:%M") >= p.call_time and not any(
            c.local_date == local.date().isoformat()
            and (c.initial_attempts > 0 or c.complete or c.intentional_end)
            for c in cs
        ):
            result.append({"elder_id": p.id, "checkin_id": None, "kind": "initial"})
    return result
