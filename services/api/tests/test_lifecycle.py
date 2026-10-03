from datetime import datetime, timedelta, timezone

import pytest
from app.lifecycle import event, place
from app.models import Alert, day_status
from app.repository import Repository
from app.scheduler import plan
from test_conversation import setup

AT = datetime(2026, 10, 3, 0, 0, tzinfo=timezone.utc)


def test_retry_is_fifteen_minutes_and_only_two_initial_attempts():
    p, c = setup()
    c.state = "ringing"
    leg = place(c, "initial", AT)
    event(c, p, "fail1", "no_answer", leg.id, AT)
    assert c.retry_at == AT + timedelta(minutes=15)
    second = place(c, "retry", c.retry_at)
    event(c, p, "fail2", "no_answer", second.id, AT + timedelta(minutes=16))
    assert c.state == "ended" and c.initial_attempts == 2
    with pytest.raises(ValueError):
        place(c, "retry", AT)


def test_one_reconnect_preserves_state_and_stale_events_cannot_close_it():
    p, c = setup()
    c.state = "ringing"
    first = place(c, "initial", AT)
    event(c, p, "answer", "connected", first.id, AT)
    c.answers["sleep"] = "well"
    event(c, p, "drop", "dropped", first.id, AT)
    assert c.state == "reconnecting" and c.retry_at == AT
    second = place(c, "reconnect", AT)
    event(c, p, "stale", "ended", first.id, AT)
    assert second.state == "ringing"
    reply = event(c, p, "answer2", "connected", second.id, AT)
    assert "disconnected" in reply and c.answers["sleep"] == "well"
    event(c, p, "drop2", "dropped", second.id, AT)
    assert c.state == "ended"
    with pytest.raises(ValueError):
        place(c, "reconnect", AT)


def test_active_guard_intentional_end_and_idempotency():
    p, c = setup()
    c.state = "ringing"
    leg = place(c, "initial", AT)
    with pytest.raises(ValueError):
        place(c, "manual", AT)
    event(c, p, "end", "ended", leg.id, AT)
    event(c, p, "end", "dropped", leg.id, AT)
    assert c.intentional_end and c.retry_at is None
    with pytest.raises(ValueError):
        place(c, "manual", AT)


def test_red_history_survives_completion_and_handling():
    _, c = setup()
    c.complete = True
    c.medicine_result = "taken"
    c.state = "ended"
    assert day_status(c) == "green"
    c.alerts = [
        Alert(
            incident_id="fall",
            concern="FALL",
            tier="significant",
            assessment="complete",
            reason="Ongoing pain",
            handled_at=AT,
        )
    ]
    assert day_status(c) == "red"
    c.alerts[0].tier = "routine"
    assert day_status(c) == "yellow"


def test_retention_boundaries_and_consent_exception():
    p, c = setup()
    repo = Repository(":memory:")
    repo.save(p)
    c.ended_at = AT
    c.state = "ended"
    c.summary = "Private summary"
    c.answers = {"sleep": "Private text"}
    c.processed_turns = {"1": "Private response"}
    c.alerts = [
        Alert(
            incident_id="fall",
            concern="FALL",
            quote="Private quote",
            reason="Fixed policy reason",
        )
    ]
    repo.save(c)
    repo.sweep(AT + timedelta(days=90) - timedelta(microseconds=1))
    assert not repo.calls()[0].text_expired
    repo.sweep(AT + timedelta(days=90))
    retained = repo.calls()[0]
    assert retained.text_expired and retained.summary is None and retained.alerts[0].quote is None
    assert not retained.answers and not retained.processed_turns
    retained.alerts[0].handled_at = AT + timedelta(days=95)
    repo.save(retained)
    repo.sweep(AT + timedelta(days=365))
    assert not repo.calls() and len(repo.profiles()) == 1
    repo.unenroll(p.id)
    assert not repo.profiles()


def test_scheduler_local_time_consent_dedupe_and_guard():
    p, c = setup()
    c.state = "ended"
    c.ended_at = AT
    c.complete = True
    assert plan([p], [], AT) == [{"elder_id": p.id, "checkin_id": None, "kind": "initial"}]
    assert not plan([p], [c], AT)
    p.consent = "pending"
    assert not plan([p], [], AT)
    p.consent = "granted"
    assert not plan([p], [], AT - timedelta(hours=4))
