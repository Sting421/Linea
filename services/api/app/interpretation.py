"""Augment semantic output with authoritative schedule/history and prompt budget."""

from datetime import date, timedelta
from zoneinfo import ZoneInfo

from .conversation import merge_facts
from .models import CheckIn, Facts, Profile, Turn, now
from .policy import assess


def prepare(t: Turn, c: CheckIn, p: Profile, history: list[CheckIn], at=None):
    at = at or now()
    if t.medicine_result is not None:
        c.medicine_due = at.astimezone(ZoneInfo(p.timezone)).strftime("%H:%M") >= p.medicine_time
    if (
        t.medicine_result
        and t.medicine_result != "taken"
        and not any(f.concern == "MEDICINE_NOT_TAKEN" for f in t.concerns)
    ):
        t.concerns.append(
            Facts(
                incident_id=f"medicine:{c.local_date}",
                concern="MEDICINE_NOT_TAKEN",
                quote=t.text,
                medicine_result=t.medicine_result,
            )
        )
    for f in t.concerns:
        prior = c.facts.get(f.incident_id)
        f.clarification_failures = prior.clarification_failures if prior else 0
        if f.concern == "MEDICINE_NOT_TAKEN":
            f.due = at.astimezone(ZoneInfo(p.timezone)).strftime("%H:%M") >= p.medicine_time
            f.approved_medicine = p.medicine.casefold() == "losartan"
            f.dose_period = c.local_date
            preceding = (date.fromisoformat(c.local_date) - timedelta(days=1)).isoformat()
            previous = sorted(
                [x for x in history if x.elder_id == p.id and x.local_date == preceding],
                key=lambda x: x.created_at,
                reverse=True,
            )
            if previous and previous[0].medicine_due is True:
                f.repeated = f.repeated or (
                    f.medicine_result == "not_taken" and previous[0].medicine_result == "not_taken"
                )
                f.repeated_unknown = f.repeated_unknown or (
                    f.medicine_result == "unknown" and previous[0].medicine_result == "unknown"
                )
    if c.active_question and c.active_question.startswith("concern:"):
        incident = c.active_question.removeprefix("concern:")
        old = c.facts.get(incident)
        if old and assess(old).question:
            new = next((f for f in t.concerns if f.incident_id == incident), None)
            merged = merge_facts(old, new) if new else old.model_copy(deep=True)

            def substantive(f):
                return f.model_dump(exclude={"quote", "clarification_failures"})

            merged.clarification_failures = (
                0
                if substantive(merged) != substantive(old)
                else min(2, old.clarification_failures + 1)
            )
            if new:
                t.concerns[t.concerns.index(new)] = merged
            else:
                t.concerns.append(merged)
    return t
