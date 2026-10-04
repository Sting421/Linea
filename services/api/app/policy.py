"""Deterministic S-01..S-08. Facts are semantic adapter output, never keyword matches."""

from .models import Assessment, Facts


def assess(f: Facts) -> Assessment:
    if f.context in ("negated", "hypothetical", "remote_assessed"):
        return Assessment(
            tier=None,
            reason="Context only; no new incident",
            new_event=False,
            resume=True,
        )
    # Emergency evidence has priority, including an actual other person in need.
    if (
        f.red_flags
        or f.reported_large_excess_or_poisoning is True
        or (f.concern == "CHEST_PAIN" and f.current is True)
    ):
        return Assessment(
            tier="emergency",
            reason="Reported emergency feature; immediate help required",
        )
    if f.subject == "other":
        return Assessment(
            tier=None,
            reason="Third-party context; not an elder incident",
            new_event=False,
            resume=True,
        )
    if f.concern == "MEDICINE_NOT_TAKEN":
        special = any(
            v is True
            for v in (
                f.access_barrier,
                f.refusal,
                f.adverse_effect,
                f.instruction_conflict,
                f.possible_dose_error,
                f.repeated,
                f.repeated_unknown,
            )
        )
        if special:
            return Assessment(
                tier="significant",
                reason="Medication review needed",
                review=True,
                resume=not (f.adverse_effect or f.possible_dose_error),
            )
        if f.medicine_result == "taken" or f.due is False:
            return Assessment(
                tier=None,
                reason="No missed due dose established",
                new_event=False,
                resume=True,
            )
        # Nothing is reported about the dose yet: ask, whatever the medicine.
        if f.medicine_result is None:
            return Assessment(
                tier="significant" if f.clarification_failures >= 2 else None,
                reason="No dose answer established",
                question="Have you taken your listed medicine for this dose period?"
                if f.clarification_failures < 2
                else None,
                unresolved=True,
            )
        if f.approved_medicine is not True:
            return Assessment(
                tier="significant",
                reason="No approved omission policy for this medicine",
                review=True,
                resume=True,
            )
        if f.medicine_result == "unknown" and f.clarification_failures < 2:
            return Assessment(
                tier=None,
                reason="Medicine answer uncertain",
                question="Have you taken your listed medicine for this dose period?",
            )
        return Assessment(
            tier="routine",
            reason="Isolated medicine report; result remains uncertain"
            if f.medicine_result == "unknown"
            else "Not yet taken as of this call",
            resume=True,
        )
    significant = False
    routine = False
    question = None
    if f.concern == "FALL":
        significant = any(
            v is True for v in (f.ongoing_pain, f.injury, f.functional_difficulty, f.repeated)
        )
        routine = (
            f.resolved is True
            and all(
                v is False for v in (f.ongoing_pain, f.injury, f.functional_difficulty, f.repeated)
            )
            and f.emergency_features_absent is True
        )
        if f.ongoing_pain is None:
            question = "Are you hurt right now?"
        elif f.injury is None:
            question = "Were you injured when this happened?"
        elif f.functional_difficulty is None:
            question = "Do you have any new difficulty moving since this happened?"
        elif f.repeated is None:
            question = "Has this been happening repeatedly?"
        elif f.resolved is not True:
            question = "Are you back to how you felt before this happened?"
        else:
            question = "Did anything else happen during or after this episode?"
    elif f.concern == "BREATHING":
        significant = any(v is True for v in (f.new_unusual, f.current, f.repeated, f.worsening))
        routine = (
            all(
                v is True
                for v in (
                    f.mild,
                    f.familiar,
                    f.usual_exertion,
                    f.resolved,
                    f.emergency_features_absent,
                )
            )
            and f.new_unusual is False
            and f.worsening is False
        )
        if f.current is None:
            question = "Are you having trouble breathing right now?"
        elif f.resolved is None:
            question = "Has the breathing difficulty completely stopped?"
        elif f.familiar is None or f.new_unusual is None:
            question = "Is this the same breathing pattern you usually experience?"
        elif f.usual_exertion is None:
            question = "Did this follow your usual activity?"
        elif f.worsening is None:
            question = "Was the breathing difficulty worse than your usual pattern?"
        else:
            question = "Did anything else happen during this episode?"
    elif f.concern == "CHEST_PAIN":
        significant = f.resolved is True and f.emergency_features_absent is True
        question = (
            "Do you have any chest pain right now?"
            if f.current is None
            else "Did anything else happen while your chest hurt?"
        )
    elif f.concern == "DIZZINESS":
        significant = any(
            v is True
            for v in (
                f.current,
                f.repeated,
                f.worsening,
                f.functional_difficulty,
                f.fainted,
            )
        )
        routine = all(
            v is True for v in (f.mild, f.brief, f.resolved, f.emergency_features_absent)
        ) and all(
            v is False
            for v in (
                f.fainted,
                f.injury,
                f.functional_difficulty,
                f.repeated,
                f.worsening,
            )
        )
        if f.current is None:
            question = "Are you still feeling dizzy now?"
        elif f.fainted is None:
            question = "Did you faint during this episode?"
        elif f.injury is None:
            question = "Were you hurt during this episode?"
        elif f.functional_difficulty is None:
            question = "Have you had any new difficulty moving since this episode?"
        elif f.repeated is None:
            question = "Has this happened more than once?"
        elif f.worsening is None:
            question = "Has the dizziness been getting worse?"
        elif f.mild is None:
            question = "Was the dizziness mild or severe?"
        elif f.brief is None:
            question = "How long did the dizziness last?"
        elif f.resolved is None:
            question = "Has the dizziness completely stopped?"
        else:
            question = "Did anything else happen during this episode?"
    if significant:
        return Assessment(
            tier="significant",
            reason="Reported ongoing, recurrent, or unusual concern",
            question=question
            if f.emergency_features_absent is not True and f.clarification_failures < 2
            else None,
            resume=f.resolved is True and f.emergency_features_absent is True,
            review=f.concern in ("CHEST_PAIN", "DIZZINESS"),
            unresolved=f.emergency_features_absent is not True,
        )
    if routine:
        return Assessment(tier="routine", reason="Required recovery facts established", resume=True)
    if f.clarification_failures >= 2:
        return Assessment(
            tier="significant",
            reason="Uncertainty remains after clarification",
            review=f.concern in ("CHEST_PAIN", "DIZZINESS"),
            unresolved=True,
        )
    return Assessment(
        tier=None,
        reason="Assessment pending; recovery not established",
        question=question,
    )
