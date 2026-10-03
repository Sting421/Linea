from app.conversation import opening, turn
from app.interpretation import prepare
from app.lifecycle import join, leave
from app.models import CheckIn, Contact, Facts, Profile, Turn


def setup(consent="granted"):
    p = Profile(
        owner_id="a",
        name="Rosa",
        preferred_name="Nanay Rosa",
        phone="+639123456789",
        contacts=[Contact(name="Ana", relationship="Daughter", phone="+639123456790")],
        consent=consent,
    )
    c = CheckIn(
        elder_id=p.id,
        owner_id="a",
        local_date="2026-10-03",
        state="connected",
        mode="SCRIPT" if consent == "granted" else "CONSENT",
    )
    return p, c


def test_consent_clear_yes_continues_same_call():
    p, c = setup("pending")
    reply = turn(c, p, Turn(turn_id="1", text="Yes, that is okay.", consent="yes"))
    assert p.consent == "granted" and "sleep" in reply and c.active_question == "sleep"
    assert p.consent_words == "Yes, that is okay."


def test_ambiguous_or_refused_consent():
    p, c = setup("pending")
    turn(c, p, Turn(turn_id="1", text="Maybe later", consent="ambiguous"))
    assert p.consent == "pending"
    turn(c, p, Turn(turn_id="2", text="No", consent="no"))
    assert c.intentional_end and p.consent == "declined"


def test_emergency_during_consent_does_not_grant_it():
    p, c = setup("pending")
    reply = turn(
        c,
        p,
        Turn(
            turn_id="1",
            text="My chest hurts",
            concerns=[
                Facts(
                    incident_id="chest",
                    concern="CHEST_PAIN",
                    quote="My chest hurts",
                    current=True,
                )
            ],
        ),
    )
    assert "911" in reply and p.consent == "pending" and c.mode == "EMERGENCY"


def test_listen_empty_reply_and_emergency_override():
    p, c = setup()
    join(c, p, "a")
    assert turn(c, p, Turn(turn_id="1", text="Thanks for calling")) == ""
    reply = turn(
        c,
        p,
        Turn(
            turn_id="2",
            text="I cannot breathe",
            concerns=[
                Facts(
                    incident_id="breathing",
                    concern="BREATHING",
                    quote="I cannot breathe",
                    red_flags=["cannot_breathe"],
                )
            ],
        ),
    )
    assert "911" in reply
    assert turn(c, p, Turn(turn_id="3", text="I feel fine now")) == ""
    assert c.mode == "EMERGENCY" and not c.complete


def test_duplicate_turn_and_incident_do_not_duplicate_alert():
    p, c = setup()
    t = Turn(
        turn_id="1",
        text="I fell",
        concerns=[Facts(incident_id="fall", concern="FALL", quote="I fell")],
    )
    first = turn(c, p, t)
    assert turn(c, p, t) == first
    turn(c, p, t.model_copy(update={"turn_id": "2"}))
    assert len(c.alerts) == 1 and len(c.transcript) == 4
    turn(
        c,
        p,
        Turn(
            turn_id="3",
            text="I cannot get up",
            concerns=[
                Facts(
                    incident_id="fall",
                    concern="FALL",
                    quote="I cannot get up",
                    red_flags=["cannot_get_up"],
                )
            ],
        ),
    )
    assert len(c.alerts) == 1 and c.alerts[0].tier == "emergency"


def test_out_of_order_answers_skip_completed_beats():
    p, c = setup()
    reply = turn(
        c,
        p,
        Turn(
            turn_id="1",
            text="Slept well, took medicine, feeling well.",
            answers={"sleep": "well", "medicine": "taken", "feeling": "well"},
            medicine_result="taken",
        ),
    )
    assert "anything else" in reply and c.active_question == "anything"


def test_two_inconclusive_clarifications_do_not_loop():
    p, c = setup()
    turn(
        c,
        p,
        Turn(
            turn_id="1",
            text="I fell",
            concerns=[Facts(incident_id="fall", concern="FALL", quote="I fell")],
        ),
    )
    for i in (2, 3):
        turn(c, p, prepare(Turn(turn_id=str(i), text="I do not know"), c, p, []))
    assert c.alerts[0].tier == "significant"
    assert c.facts["fall"].clarification_failures == 2
    assert c.alerts[0].revision == 2
    assert c.alerts[0].assessment == "pending"
    assert c.alerts[0].reason == "Uncertainty remains after clarification"


def test_short_answer_binds_to_semantic_active_question():
    p, c = setup()
    c.active_question = "medicine"
    turn(
        c,
        p,
        Turn(
            turn_id="1",
            text="I fell",
            concerns=[Facts(incident_id="fall", concern="FALL", quote="I fell")],
        ),
    )
    turn(
        c,
        p,
        Turn(
            turn_id="2",
            text="Yes",
            concerns=[Facts(incident_id="fall", concern="FALL", quote="Yes", injury=True)],
        ),
    )
    assert c.medicine_result == "unknown" and c.facts["fall"].injury is True


def test_family_members_leave_independently():
    p, c = setup()
    join(c, p, "a")
    join(c, p, "b")
    assert leave(c, p, "a") == "" and c.mode == "LISTEN"
    assert "it's just us again" in leave(c, p, "b") and c.farewell_asked
    assert leave(c, p, "b") == ""


def test_reconnect_restores_context_and_not_consent():
    p, c = setup()
    c.answers = {"sleep": "well", "medicine": "taken"}
    reply = opening(c, p, True)
    assert "disconnected" in reply and "feeling" in reply and "okay for me" not in reply


def test_specific_subject_correction_preserves_evidence_and_alert():
    p, c = setup()
    turn(
        c,
        p,
        Turn(
            turn_id="1",
            text="I fell",
            concerns=[Facts(incident_id="fall", concern="FALL", quote="I fell")],
        ),
    )
    turn(
        c,
        p,
        Turn(
            turn_id="2",
            text="I meant my sister; I did not fall.",
            concerns=[
                Facts(
                    incident_id="fall",
                    concern="FALL",
                    subject="other",
                    quote="I meant my sister; I did not fall.",
                )
            ],
        ),
    )
    assert len(c.alerts) == 1 and c.alerts[0].subject == "other"
    assert c.transcript[0]["text"] == "I fell"


def test_near_fall_and_actual_prompt_are_recorded():
    p, c = setup()
    turn(
        c,
        p,
        Turn(
            turn_id="1",
            text="I almost fell",
            concerns=[
                Facts(
                    incident_id="fall", concern="FALL", context="near_event", quote="I almost fell"
                )
            ],
        ),
    )
    assert c.alerts[0].actual_fall is False
    assert c.active_prompt == "Thank you for telling me. Are you hurt right now?"


def test_medicine_not_yet_due_records_answer_without_alert():
    p, c = setup()
    c.answers["sleep"] = "well"
    reply = turn(
        c,
        p,
        Turn(
            turn_id="1",
            text="Not yet",
            concerns=[
                Facts(
                    incident_id="medicine:today",
                    concern="MEDICINE_NOT_TAKEN",
                    quote="Not yet",
                    medicine_result="not_taken",
                    due=False,
                    approved_medicine=True,
                )
            ],
        ),
    )
    assert c.medicine_result == "not_taken" and not c.alerts
    assert c.active_question == "feeling" and "feeling" in reply


def test_previous_not_yet_due_report_is_not_a_logged_missed_dose():
    from datetime import datetime, timezone

    p, c = setup()
    previous = c.model_copy(
        deep=True,
        update={"local_date": "2026-10-02", "medicine_result": "not_taken", "medicine_due": False},
    )
    t = prepare(
        Turn(turn_id="1", text="Not taken", medicine_result="not_taken"),
        c,
        p,
        [previous],
        datetime(2026, 10, 3, 2, 0, tzinfo=timezone.utc),
    )
    assert not t.concerns[0].repeated
