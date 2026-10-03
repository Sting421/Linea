"""Read-only calling audit. Never starts workers, mutates records, or places calls.

Run on the host with --env-file /etc/linea/backend.env --check-provider.
IDs are taken only from the private scoped environment, never source defaults.
A clear snapshot is not authorization, provider verification, or acceptance.
"""

import argparse
import json
import os
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import httpx
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "services/api"))
from app.runtime_repository import RuntimeRepository, service_client  # noqa: E402
from app.scheduler import plan  # noqa: E402


def audit(repo, settings, at, recovery_files=0):
    profiles, calls = repo.profiles(), repo.calls()
    elder, owner = settings.get("LINEA_TEST_ELDER_ID"), settings.get("LINEA_TEST_OWNER_ID")
    selected = [p for p in profiles if p.id == elder and p.owner_id == owner]
    commands = repo.rows(
        "linea_commands", {"select": "state,not_before", "state": "in.(pending,inflight,uncertain)"}
    )
    events = repo.rows(
        "linea_event_inbox", {"select": "state", "state": "in.(pending,inflight,uncertain)"}
    )
    active = [c for c in calls if any(leg.state in ("ringing", "connected") for leg in c.legs)]
    retries = [c for c in calls if c.retry_at and not c.intentional_end and not c.ended_at]
    proposals = plan(profiles, calls, at)
    blockers = []
    if settings.get("LINEA_MODE") != "connected" or settings.get("LINEA_VOICE_TEST_MODE") != "1":
        blockers.append("Scoped rehearsal requires connected mode and private test scope")
    if len(selected) != 1:
        blockers.append("Private scope must match exactly one existing enrolled profile and owner")
    profile_status = None
    if len(selected) == 1:
        p = selected[0]
        local = at.astimezone(ZoneInfo(p.timezone))
        profile_status = {
            "consent": p.consent,
            "timezone": p.timezone,
            "local_time": local.isoformat(),
            "daily_call_time": p.call_time,
            "inside_calling_hours": 6 <= local.hour < 21,
        }
        profile_status["manual_call_hours"] = "Any time; automatic calls remain 06:00 to 21:00"
        if p.consent == "declined":
            blockers.append("Existing consent does not allow calling")
    for present, message in (
        (active, "Existing active phone legs require inspection"),
        (
            commands,
            "Queued/inflight/uncertain commands require inspection, including future commands",
        ),
        (events, "Pending provider callbacks require inspection"),
        (retries, "Pending retry/reconnection schedules require inspection"),
        (recovery_files, "Recovery files require inspection without deleting history"),
    ):
        if present:
            blockers.append(message)
    scoped_proposals = [p for p in proposals if p["elder_id"] == elder]
    if scoped_proposals:
        blockers.append("Starting the worker can immediately place a scheduled scoped call")
    return {
        "audit_time_utc": at.isoformat(),
        "read_only": True,
        "build": settings.get("LINEA_BUILD_ID"),
        "mode": settings.get("LINEA_MODE"),
        "voice_enabled": settings.get("LINEA_VOICE_ENABLED") == "1",
        "scope_matches": len(selected),
        "scoped_profile": profile_status,
        "all_profiles": len(profiles),
        "all_runtime_calls": len(calls),
        "all_active_phone_calls": len(active),
        "all_command_states": dict(Counter(c["state"] for c in commands)),
        "all_pending_callbacks": len(events),
        "all_pending_retry_reconnection_schedules": len(retries),
        "recovery_files": recovery_files,
        "all_due_scheduler_proposal_kinds": dict(Counter(p["kind"] for p in proposals)),
        "scoped_due_scheduler_proposal_kinds": dict(Counter(p["kind"] for p in scoped_proposals)),
        "worker_heartbeats": repo.rows("linea_worker_status", {"select": "role,updated_at"}),
        "blockers": blockers,
        "limits": [
            "Point-in-time snapshot; repeat immediately before worker startup and after each take",
            "Authorization and normally created profile provenance require human confirmation",
            "Actual Agora Secret/callback and speech must be verified separately",
            "No acceptance, phone audio, browser microphone or push result is established",
            "A scoped worker still performs normal scheduled calling; stop it after the session",
            "Manual calls are allowed any time; automatic calls/retries retain normal hours",
        ],
    }


def provider_agents(settings):
    with httpx.Client(
        base_url="https://api.agora.io",
        auth=(settings["AGORA_CUSTOMER_ID"], settings["AGORA_CUSTOMER_SECRET"]),
        timeout=15,
    ) as client:
        response = client.get(
            f"/api/conversational-ai-agent/v2/projects/{settings['AGORA_APP_ID']}/agents",
            params={"state": "0,1,2,3,4,6", "limit": 100},
        )
        response.raise_for_status()
        # Hitting the page limit is already sufficient to block startup/cleanup.
        return len(response.json()["data"]["list"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path, required=True)
    parser.add_argument("--check-provider", action="store_true")
    args = parser.parse_args()
    try:
        if not args.env_file.is_file():
            raise ValueError("Missing environment")
        load_dotenv(args.env_file, override=False)
        settings = dict(os.environ)
        journal = settings.get("LINEA_RUNTIME_JOURNAL_PATH")
        if not journal or not Path(journal).is_dir():
            raise ValueError("Missing private journal directory")
        # Do not decrypt/read recovery files: doing so can expire them.
        recovery_files = sum(
            len(list(Path(journal).glob(pattern))) for pattern in ("*.emergency", "*.tmp")
        )
        with service_client() as client:
            result = audit(
                RuntimeRepository(client), settings, datetime.now(timezone.utc), recovery_files
            )
        if args.check_provider:
            result["provider_active_agents"] = provider_agents(settings)
            if result["provider_active_agents"]:
                result["blockers"].append("Existing provider agents require inspection")
        else:
            result["provider_active_agents"] = "NOT CHECKED"
            result["blockers"].append("Read-only provider agent lookup is required before startup")
        print(json.dumps(result, indent=2))
        return 2 if result["blockers"] else 0
    except Exception:
        # Provider/database errors can contain credentials or personal records.
        print(
            json.dumps(
                {
                    "read_only": True,
                    "status": "BLOCKED",
                    "detail": "Calling audit could not complete; inspect configuration/access privately",
                }
            )
        )
        return 2


if __name__ == "__main__":
    sys.exit(main())
