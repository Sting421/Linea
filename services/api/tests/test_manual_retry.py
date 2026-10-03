from datetime import timedelta

from app.lifecycle import event, place
from test_conversation import setup
from test_lifecycle import AT


def pending():
    p, c = setup()
    c.state = "ringing"
    initial = place(c, "initial", AT)
    event(c, p, "initial-fail", "no_answer", initial.id, AT)
    return p, c


def test_failed_manual_does_not_cancel_original_retry():
    p, c = pending()
    original = c.retry_at
    manual = place(c, "manual", AT + timedelta(minutes=1))
    event(c, p, "manual-fail", "no_answer", manual.id, AT + timedelta(minutes=2))
    assert c.state == "retry_scheduled" and c.retry_at == original
    assert c.initial_attempts == 1


def test_successful_manual_cancels_pending_retry():
    p, c = pending()
    manual = place(c, "manual", AT + timedelta(minutes=1))
    event(c, p, "manual-answer", "connected", manual.id, AT + timedelta(minutes=2))
    assert c.retry_at is None and c.suspended_retry_at is None and c.state == "connected"


def test_warm_close_does_not_reconnect_after_drop():
    p, c = pending()
    manual = place(c, "manual", AT + timedelta(minutes=1))
    event(c, p, "manual-answer", "connected", manual.id, AT + timedelta(minutes=2))
    c.mode, c.active_question, c.complete = "ENDING", None, True
    event(c, p, "close-disconnect", "dropped", manual.id, AT + timedelta(minutes=3))
    assert c.state == "ended" and c.retry_at is None and not c.reconnect_used
