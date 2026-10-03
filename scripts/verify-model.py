"""Opt-in synthetic model checks. No phone calls, accounts, or database writes.

Only named core outcomes are compared automatically. Reports never authorize
live operation or claim full acceptance; review actual replies and facts too.
"""

import argparse
import json
import os
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
import yaml
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services/api"))
RANKS = {None: 0, "routine": 1, "significant": 2, "emergency": 3}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Make paid model/embedding requests with synthetic text",
    )
    parser.add_argument("--output", type=Path)
    parser.add_argument(
        "--cases-file",
        type=Path,
        default=ROOT / "linea/policy-fixtures.yaml",
        help="Synthetic YAML cases only; defaults to the 41 policy fixtures",
    )
    parser.add_argument("--case", action="append", default=[])
    parser.add_argument(
        "--model", help="Evaluation-only model override; does not change deployment"
    )
    parser.add_argument(
        "--request-interval", type=float, default=6, help="Minimum seconds between model requests"
    )
    parser.add_argument("--workers", type=int, choices=range(1, 5), default=1)
    args = parser.parse_args()
    if not 0 <= args.request_interval <= 60:
        parser.error("Request interval must be between 0 and 60 seconds")
    cases = yaml.safe_load(args.cases_file.read_text(encoding="utf-8"))["cases"]
    if args.case:
        names = set(args.case)
        if names - {c["id"] for c in cases}:
            parser.error("Unknown case id")
        cases = [c for c in cases if c["id"] in names]
    if not args.execute:
        print(json.dumps({"mode": "plan_only", "cases": [c["id"] for c in cases]}))
        return
    output = args.output or ROOT / ".local" / (
        "model-check-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f") + ".json"
    )
    if output.exists():
        parser.error("Output exists; preserve earlier evidence and choose a new path")
    load_dotenv(ROOT / "services/api/.env")
    from app import conversation, interpretation
    from app.bridge import BrainBridge
    from app.interpreter import OpenAIClassifier
    from app.models import Alert, CheckIn, Facts, Profile
    from app.retrieval import CuratedRetriever

    # Fixed synthetic clock gives due/not-due fixtures a reproducible schedule.
    at = datetime(2026, 10, 4, 8, tzinfo=timezone.utc)
    interpretation.now = conversation.now = lambda: at

    class EvaluationClient(httpx.Client):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)
            self.gate = threading.Lock()
            self.last_request = 0.0

        def post(self, *params, **kwargs):
            with self.gate:
                delay = args.request_interval - (time.monotonic() - self.last_request)
                if delay > 0:
                    time.sleep(delay)
                self.last_request = time.monotonic()
            return super().post(*params, **kwargs)

    model = OpenAIClassifier(
        os.environ["OPENAI_API_KEY"],
        args.model or os.getenv("LINEA_SEMANTIC_MODEL", "gpt-4.1-mini-2025-04-14"),
        client=EvaluationClient(base_url="https://api.openai.com", timeout=15),
        retriever=CuratedRetriever(os.environ["OPENAI_API_KEY"]),
    )

    def run(case):
        ctx, expected, started = case.get("context", {}), case["expected"], time.monotonic()
        p = Profile(
            name="Synthetic",
            preferred_name="Synthetic",
            phone="+12025550101",
            owner_id="synthetic",
            timezone="UTC",
            medicine=ctx.get("medicine", "Losartan"),
            medicine_time="20:00" if ctx.get("dose_due") is False else "08:00",
            consent=ctx.get("consent", "granted"),
            contacts=[{"name": "Family", "relationship": "Family", "phone": "+12025550102"}],
        )
        c = CheckIn(
            elder_id=p.id,
            owner_id=p.owner_id,
            local_date=at.date().isoformat(),
            created_at=at,
            state="connected",
            mode=ctx.get("mode", "SCRIPT"),
            active_question=ctx.get("unfinished_beat", "feeling"),
            active_prompt="How are you feeling today?",
        )
        if c.mode == "LISTEN":
            c.family = [p.owner_id]
        if c.mode == "CONSENT":
            c.active_question = "consent"
        history = []
        if ctx.get("previous_due_period_result"):
            history = [
                CheckIn(
                    elder_id=p.id,
                    owner_id=p.owner_id,
                    local_date=(at - timedelta(days=1)).date().isoformat(),
                    created_at=at - timedelta(days=1),
                    state="ended",
                    medicine_due=True,
                    medicine_result=ctx["previous_due_period_result"],
                )
            ]
        if ctx.get("same_incident"):
            # These two specifications explicitly start with an existing incident.
            medicine = "medicine" in ctx
            fact = Facts(
                incident_id="existing",
                concern="MEDICINE_NOT_TAKEN" if medicine else "DIZZINESS",
                quote="I'm out of tablets." if medicine else "I'm still dizzy.",
                **(
                    {"access_barrier": True, "medicine_result": "not_taken"}
                    if medicine
                    else {"current": True}
                ),
            )
            c.facts["existing"] = fact
            c.alerts = [
                Alert(
                    incident_id="existing",
                    concern=fact.concern,
                    tier="significant",
                    reason="Existing concern",
                    quote=fact.quote,
                    notification_status="sent",
                )
            ]
            c.active_question = "concern:existing"
        replies = []
        try:
            for i, (speaker, text) in enumerate(case["dialogue"]):
                if speaker == "linea":
                    c.active_prompt = text
                    c.transcript.append({"speaker": "linea", "text": text, "at": at.isoformat()})
                else:
                    replies.append(BrainBridge(model).completion(text, str(i), c, p, history))
            tier = max((a.tier for a in c.alerts), key=lambda x: RANKS[x], default=None)
            actual = {
                "tier": tier,
                "medicine_result": c.medicine_result,
                "consent": p.consent,
                "mode": c.mode,
                "active_question": c.active_question,
                "complete": c.complete,
                "intentional_end": c.intentional_end,
                "answers": c.answers,
                "alerts": [a.model_dump(mode="json") for a in c.alerts],
                "facts": {k: v.model_dump() for k, v in c.facts.items()},
                "replies": replies,
            }
            errors = []
            for key in (
                "tier",
                "medicine_result",
                "consent",
                "complete",
                "intentional_end",
                "mode",
            ):
                if key in expected and expected[key] != actual[key]:
                    errors.append(key)
            if expected.get("minimum_tier") and RANKS[tier] < RANKS[expected["minimum_tier"]]:
                errors.append("minimum_tier")
            if expected.get("new_event") is False and c.alerts:
                errors.append("new_event")
            if expected.get("concerns") and not set(expected["concerns"]).issubset(
                {a.concern for a in c.alerts}
            ):
                errors.append("concerns")
            if ctx.get("same_incident") and (
                len(c.alerts) != 1 or c.alerts[0].incident_id != "existing"
            ):
                errors.append("incident_identity")
            if (
                expected.get("resume_checkin") is False
                and c.active_question in ("sleep", "medicine", "feeling", "anything")
                and c.mode != "EMERGENCY"
            ):
                errors.append("resume_checkin")
            return {
                "id": case["id"],
                "expected": expected,
                "actual": actual,
                "core_mismatches": errors,
                "seconds": round(time.monotonic() - started, 2),
            }
        except Exception as exc:
            return {
                "id": case["id"],
                "error": type(exc).__name__,
                "http_status": getattr(getattr(exc, "response", None), "status_code", None),
            }

    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for future in as_completed([pool.submit(run, c) for c in cases]):
            result = future.result()
            results.append(result)
            print(
                json.dumps(
                    {
                        k: result[k]
                        for k in ("id", "core_mismatches", "error", "http_status", "seconds")
                        if k in result
                    }
                ),
                flush=True,
            )
    output.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "model": model.model,
        "cases_file": str(args.cases_file.resolve()),
        "workers": args.workers,
        "request_interval_seconds": args.request_interval,
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "scope": "synthetic core outcomes only; not full acceptance or audio latency",
        "results": results,
    }
    with output.open("x", encoding="utf-8") as stream:
        json.dump(report, stream, indent=2)
    failures = sum(bool(r.get("core_mismatches") or r.get("error")) for r in results)
    print(f"{len(results)} cases; {failures} core mismatch/error cases; report: {output}")
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
