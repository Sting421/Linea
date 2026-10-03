"""Worker audit must remain read-only and reveal outstanding work without PII."""

import importlib.util
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

spec = importlib.util.spec_from_file_location(
    "calling_preflight", Path(__file__).resolve().parents[3] / "scripts/preflight-calling.py"
)
preflight = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preflight)


def setup(hour=7, consent="pending"):
    at = datetime(2026, 10, 4, hour, tzinfo=timezone.utc)
    profile = SimpleNamespace(
        id="existing-profile",
        owner_id="existing-owner",
        enrolled=True,
        consent=consent,
        timezone="UTC",
        call_time="08:00",
        name="private-person-marker",
        phone="private-phone-marker",
    )
    settings = {
        "LINEA_MODE": "connected",
        "LINEA_VOICE_TEST_MODE": "1",
        "LINEA_TEST_ELDER_ID": profile.id,
        "LINEA_TEST_OWNER_ID": profile.owner_id,
        "LINEA_PROVIDER_WEBHOOK_SECRET": "private-secret-marker",
    }
    repo = SimpleNamespace(profiles=lambda: [profile], calls=lambda: [], reads=[])

    def rows(table, params):
        assert table in ("linea_commands", "linea_event_inbox", "linea_worker_status")
        repo.reads.append((table, params))
        return []

    repo.rows = rows
    return repo, settings, at


def test_pending_consent_snapshot_is_read_only_and_contains_no_identities_or_secrets():
    repo, settings, at = setup()
    result = preflight.audit(repo, settings, at)
    assert not result["blockers"]
    assert result["scoped_profile"]["consent"] == "pending"
    assert len(repo.reads) == 3
    text = json.dumps(result)
    assert all(
        value not in text
        for value in (
            "existing-profile",
            "existing-owner",
            "private-person-marker",
            "private-phone-marker",
            "private-secret-marker",
        )
    )
    assert "require human confirmation" in text


def test_actual_clock_and_owner_mismatch_block_startup():
    repo, settings, at = setup(hour=4)
    assert any("calling hours" in b for b in preflight.audit(repo, settings, at)["blockers"])
    settings["LINEA_TEST_OWNER_ID"] = "unrelated-owner"
    result = preflight.audit(repo, settings, at)
    assert result["scope_matches"] == 0
    assert any("existing enrolled profile and owner" in b for b in result["blockers"])


def test_future_work_recovery_and_active_calls_are_not_hidden_by_current_planner():
    repo, settings, at = setup()
    call = SimpleNamespace(
        elder_id="existing-profile",
        legs=[SimpleNamespace(state="connected")],
        retry_at=at + timedelta(minutes=15),
        intentional_end=False,
        ended_at=None,
    )
    repo.calls = lambda: [call]
    repo.rows = lambda table, params: (
        [{"state": "uncertain", "not_before": (at + timedelta(hours=1)).isoformat()}]
        if table == "linea_commands"
        else [{"state": "pending"}]
        if table == "linea_event_inbox"
        else []
    )
    result = preflight.audit(repo, settings, at, recovery_files=1)
    assert result["all_active_phone_calls"] == 1
    assert result["all_command_states"] == {"uncertain": 1}
    assert result["all_pending_callbacks"] == 1
    assert result["all_pending_retry_reconnection_schedules"] == 1
    assert len(result["blockers"]) == 5


def test_scope_does_not_hide_an_immediately_due_daily_call():
    repo, settings, at = setup(hour=8, consent="granted")
    result = preflight.audit(repo, settings, at)
    assert result["scoped_due_scheduler_proposal_kinds"] == {"initial": 1}
    assert any("immediately place" in b for b in result["blockers"])
