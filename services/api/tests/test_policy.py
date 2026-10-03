"""Policy tests consume curated semantic facts, not a pretend keyword classifier."""

import pytest
from app.models import Facts
from app.policy import assess


def f(concern, **kw):
    return Facts(incident_id="test-incident", concern=concern, quote="Original elder words", **kw)


@pytest.mark.parametrize(
    "concern,details,tier",
    [
        ("FALL", {}, None),
        (
            "FALL",
            dict(
                resolved=True,
                ongoing_pain=False,
                injury=False,
                functional_difficulty=False,
                repeated=False,
                emergency_features_absent=True,
            ),
            "routine",
        ),
        ("FALL", dict(ongoing_pain=True), "significant"),
        ("FALL", dict(repeated=True), "significant"),
        ("FALL", dict(red_flags=["cannot_get_up"]), "emergency"),
        (
            "FALL",
            dict(red_flags=["head_neck_back_hip_injury"], resolved=True),
            "emergency",
        ),
        (
            "BREATHING",
            dict(
                mild=True,
                familiar=True,
                usual_exertion=True,
                resolved=True,
                emergency_features_absent=True,
                new_unusual=False,
                worsening=False,
            ),
            "routine",
        ),
        ("BREATHING", dict(new_unusual=True, resolved=True), "significant"),
        ("BREATHING", dict(current=True), "significant"),
        ("BREATHING", dict(red_flags=["gasping_choking"]), "emergency"),
        ("CHEST_PAIN", dict(current=True, mild=True), "emergency"),
        (
            "CHEST_PAIN",
            dict(resolved=True, current=False, emergency_features_absent=True),
            "significant",
        ),
        ("CHEST_PAIN", dict(resolved=True, red_flags=["sweating"]), "emergency"),
        ("CHEST_PAIN", {}, None),
        (
            "DIZZINESS",
            dict(
                mild=True,
                brief=True,
                resolved=True,
                emergency_features_absent=True,
                fainted=False,
                injury=False,
                functional_difficulty=False,
                repeated=False,
                worsening=False,
            ),
            "routine",
        ),
        ("DIZZINESS", dict(current=True), "significant"),
        ("DIZZINESS", dict(repeated=True, resolved=True), "significant"),
        (
            "DIZZINESS",
            dict(fainted=True, resolved=True, emergency_features_absent=True),
            "significant",
        ),
        ("DIZZINESS", dict(resolved=True, red_flags=["face_droop"]), "emergency"),
        ("DIZZINESS", dict(red_flags=["faint_exertion"]), "emergency"),
        (
            "MEDICINE_NOT_TAKEN",
            dict(approved_medicine=True, medicine_result="not_taken", due=True),
            "routine",
        ),
        (
            "MEDICINE_NOT_TAKEN",
            dict(
                approved_medicine=True,
                medicine_result="unknown",
                clarification_failures=2,
            ),
            "routine",
        ),
        (
            "MEDICINE_NOT_TAKEN",
            dict(approved_medicine=True, medicine_result="unknown"),
            None,
        ),
        (
            "MEDICINE_NOT_TAKEN",
            dict(approved_medicine=True, medicine_result="not_taken", repeated=True),
            "significant",
        ),
        (
            "MEDICINE_NOT_TAKEN",
            dict(medicine_result="unknown", repeated_unknown=True),
            "significant",
        ),
        (
            "MEDICINE_NOT_TAKEN",
            dict(medicine_result="not_taken", access_barrier=True, due=False),
            "significant",
        ),
        (
            "MEDICINE_NOT_TAKEN",
            dict(medicine_result="unknown", possible_dose_error=True),
            "significant",
        ),
        ("MEDICINE_NOT_TAKEN", dict(red_flags=["overdose_poisoning"]), "emergency"),
        (
            "MEDICINE_NOT_TAKEN",
            dict(approved_medicine=False, medicine_result="not_taken"),
            "significant",
        ),
        ("DIZZINESS", dict(clarification_failures=2), "significant"),
    ],
)
def test_thresholds(concern, details, tier):
    assert assess(f(concern, **details)).tier == tier


@pytest.mark.parametrize("context", ["negated", "hypothetical", "remote_assessed"])
def test_context_does_not_make_incident(context):
    result = assess(f("CHEST_PAIN", context=context, current=True))
    assert not result.new_event


def test_third_party_emergency_preserves_subject():
    assert assess(f("BREATHING", subject="other", red_flags=["cannot_breathe"])).tier == "emergency"
    assert not assess(f("FALL", subject="other")).new_event


def test_not_due_or_taken_is_not_a_missed_dose():
    assert not assess(f("MEDICINE_NOT_TAKEN", due=False, medicine_result="not_taken")).new_event
    assert not assess(f("MEDICINE_NOT_TAKEN", medicine_result="taken")).new_event


def test_unknown_recovery_never_becomes_routine():
    assert assess(f("FALL", resolved=True)).tier is None
    assert not assess(f("FALL", resolved=True)).resume


@pytest.mark.parametrize("subject", ["elder", "other"])
def test_reported_large_excess_needs_no_second_red_flag_or_symptoms(subject):
    result = assess(
        f(
            "MEDICINE_NOT_TAKEN",
            subject=subject,
            reported_large_excess_or_poisoning=True,
            medicine_result="taken",
            possible_dose_error=True,
            current=False,
            resolved=True,
        )
    )
    assert result.tier == "emergency" and not result.resume and result.question is None


@pytest.mark.parametrize("context", ["negated", "hypothetical", "remote_assessed"])
def test_large_excess_context_does_not_create_an_actual_emergency(context):
    result = assess(
        f("MEDICINE_NOT_TAKEN", context=context, reported_large_excess_or_poisoning=True)
    )
    assert result.tier is None and not result.new_event


def test_possible_single_extra_dose_does_not_imply_large_excess():
    result = assess(
        f(
            "MEDICINE_NOT_TAKEN",
            possible_dose_error=True,
            reported_large_excess_or_poisoning=False,
            medicine_result="taken",
        )
    )
    assert result.tier == "significant"


def test_significant_concern_stops_questions_after_two_failed_clarifications():
    result = assess(f("DIZZINESS", current=True, clarification_failures=2))
    assert result.tier == "significant" and result.unresolved
    assert result.question is None and not result.resume


@pytest.mark.parametrize("attempts,tier", [(0, None), (2, "significant")])
def test_missing_dose_answer_never_becomes_an_established_omission(attempts, tier):
    result = assess(
        f("MEDICINE_NOT_TAKEN", due=True, approved_medicine=True, clarification_failures=attempts)
    )
    assert result.tier == tier and result.unresolved and not result.resume
    assert "No dose answer" in result.reason


@pytest.mark.parametrize(
    "concern,known,question",
    [
        (
            "FALL",
            {
                "resolved": True,
                "ongoing_pain": False,
                "injury": False,
                "functional_difficulty": False,
                "repeated": False,
            },
            "Did anything else happen during or after this episode?",
        ),
        (
            "BREATHING",
            {
                "current": False,
                "resolved": True,
                "familiar": True,
                "new_unusual": False,
                "usual_exertion": True,
            },
            "Was the breathing difficulty worse than your usual pattern?",
        ),
        ("DIZZINESS", {"current": False, "fainted": False}, "Were you hurt during this episode?"),
        (
            "DIZZINESS",
            {"current": False, "fainted": False, "injury": False},
            "Have you had any new difficulty moving since this episode?",
        ),
    ],
)
def test_clarification_asks_for_missing_facts_instead_of_repeating_known_answers(
    concern, known, question
):
    result = assess(f(concern, **known))
    assert result.question == question
    assert result.tier is None and not result.resume
