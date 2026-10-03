"""Supabase scheduler, provider-command, callback, push and retention worker.
Default is read-only planning. --execute is explicit and requires acceptance.
"""

import argparse
import json
import logging
import os
import time
from pathlib import Path
from types import SimpleNamespace

from dotenv import load_dotenv

from .models import now
from .notifications import deliver_one
from .runtime_config import accepted, build_runtime
from .runtime_repository import RuntimeRepository, service_client
from .runtime_service import EmergencyJournal
from .scheduler import plan


def tick(runtime, *, execute=False, push=False, role="voice"):
    repo = runtime.repo
    if not execute:
        return {
            "mode": "plan_only",
            "repository": "supabase",
            "proposals": plan(repo.profiles(), repo.calls(), now()),
        }
    repo.request(
        "POST",
        "linea_worker_status",
        params={"on_conflict": "role"},
        headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
        json={"role": role, "updated_at": now().isoformat()},
    )
    if role == "notifications":
        if push:
            deliver_one(repo)
        return {"mode": "notifications", "repository": "supabase"}
    if role == "retention":
        repo.request("POST", "rpc/expire_linea_history", json={})
        if runtime.journal:
            for path in runtime.journal.directory.glob("*.emergency"):
                runtime.journal.read(path.stem)
        return {"mode": "retention", "repository": "supabase"}
    # Reconcile saved completions before handling any new provider turn/event.
    for path in runtime.journal.directory.glob("*.emergency"):
        recovered = runtime.journal.read(path.stem)
        if recovered:
            call, profile, commands = recovered
            if not runtime.allowed(call.elder_id):
                continue
            with repo.locked(call.elder_id) as lease:
                runtime.persist(call, profile, lease, commands)
    for job in repo.jobs("linea_event_inbox"):
        if not runtime.allowed(repo.call(job["checkin_id"]).elder_id):
            continue
        try:
            runtime.process_event(job)
        except Exception:
            logging.getLogger(__name__).error("Provider event processing will retry")
    for job in repo.jobs("linea_commands"):
        if not runtime.allowed(repo.call(job["checkin_id"]).elder_id):
            continue
        from datetime import datetime

        if datetime.fromisoformat(job["not_before"]) > now():
            continue
        try:
            runtime.process_command(job)
        except Exception:
            logging.getLogger(__name__).error("Provider command requires reconciliation")
    for job in repo.rows(
        "linea_commands", {"state": "in.(inflight,uncertain)", "order": "created_at.asc,id.asc"}
    ):
        if runtime.allowed(repo.call(job["checkin_id"]).elder_id):
            try:
                runtime.reconcile_command(job)
            except Exception:
                logging.getLogger(__name__).error("Command reconciliation deferred")
    for proposal in plan(
        [p for p in repo.profiles() if runtime.allowed(p.id, p.owner_id)], repo.calls(), now()
    ):
        try:
            runtime.place(proposal["elder_id"], kind=proposal["kind"])
        except Exception:
            logging.getLogger(__name__).error("Placement proposal deferred")
    for call in repo.calls():
        if not runtime.allowed(call.elder_id):
            continue
        try:
            runtime.reconcile_call(call.id)
        except Exception:
            logging.getLogger(__name__).error("Call reconciliation deferred")
        if call.state == "connected" and call.family:
            try:
                members = runtime.voice.members(call)
                for member in call.family:
                    if call.rtc_members.get(member) not in members:
                        runtime.family_control(call.id, member, "leave")
            except Exception:
                logging.getLogger(__name__).error("Family membership reconciliation deferred")
    return {"mode": "worker", "repository": "supabase"}


def main():
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--role", choices=("voice", "notifications", "retention"), default="voice")
    args = parser.parse_args()
    if not args.execute:
        with service_client() as client:
            repo = RuntimeRepository(client)
            print(
                json.dumps(
                    {
                        "mode": "plan_only",
                        "repository": "supabase",
                        "proposals": plan(repo.profiles(), repo.calls(), now()),
                    }
                )
            )
        return
    if args.role == "retention":
        bearer = os.getenv("LINEA_CUSTOM_LLM_BEARER")
        runtime = SimpleNamespace(
            repo=RuntimeRepository(service_client()),
            journal=EmergencyJournal(
                os.getenv("LINEA_RUNTIME_JOURNAL_PATH", ".local/runtime-journal"), bearer
            )
            if bearer
            else None,
        )
    else:
        runtime = build_runtime(now)
        if not accepted() and not runtime.test_scope:
            parser.error(
                "Live work is gated until all MVP acceptance checks pass; use an explicitly scoped acceptance test"
            )
    while True:
        try:
            print(
                json.dumps(
                    tick(
                        runtime,
                        execute=True,
                        push=os.getenv("LINEA_PUSH_ENABLED") == "1",
                        role=args.role,
                    )
                )
            )
        except Exception:
            logging.getLogger(__name__).error("Worker tick failed; it will retry")
        if args.once:
            break
        time.sleep(60 if args.role == "retention" else 2)


if __name__ == "__main__":
    main()
