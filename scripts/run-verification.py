"""Run backend regression and read-only API smoke checks with private reports.

No phone calls, model inference, database writes, or push sends are performed.
Passing these checks does not pass the corresponding full manual acceptance case.
"""

import argparse
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

import httpx

ROOT = Path(__file__).resolve().parents[1]


def workspace_version():
    digest = hashlib.sha256()
    files = sorted(
        [
            *(ROOT / "services/api/app").glob("*.py"),
            *(ROOT / "services/api/tests").glob("*.py"),
            ROOT / "scripts/run-verification.py",
            ROOT / "scripts/prepare-test-run.py",
            ROOT / "linea/policy-fixtures.yaml",
            ROOT / "services/api/data/curated-conversations.json",
            ROOT / "testing/held-out-utterances.json",
            ROOT / "testing/README.md",
        ]
    )
    for path in files:
        digest.update(str(path.relative_to(ROOT)).replace("\\", "/").encode())
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    commit = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True)
    dirty = subprocess.run(
        ["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True
    )
    return {
        "commit": commit.stdout.strip() if commit.returncode == 0 else "unknown",
        "uncommitted_changes": bool(dirty.stdout.strip()) if dirty.returncode == 0 else None,
        "source_sha256": digest.hexdigest(),
    }


def check(case_id, status, detail, **evidence):
    return {"id": case_id, "status": status, "detail": detail, "evidence": evidence}


def local_checks(folder):
    # Synthetic test factories expect these values, independently of deployment credentials.
    environment = {
        **os.environ,
        "LINEA_MODE": "demo",
        "LINEA_DEMO_SEED": "1",
        "LINEA_DEMO_API_TOKEN": "local-demo-only-change-me",
    }
    junit = folder / "backend-junit.xml"
    # Select the known synthetic suite; do not discover future tests against live services.
    test_files = [
        "test_api.py",
        "test_conversation.py",
        "test_journey.py",
        "test_lifecycle.py",
        "test_manual_retry.py",
        "test_policy.py",
        "test_semantic_pipeline.py",
        "test_verification_runner.py",
    ]
    command = [
        sys.executable,
        "-m",
        "pytest",
        *[f"tests/{name}" for name in test_files],
        f"--junitxml={junit}",
    ]
    try:
        result = subprocess.run(
            command,
            cwd=ROOT / "services/api",
            env=environment,
            capture_output=True,
            text=True,
            timeout=120,
        )
    except subprocess.TimeoutExpired:
        return [check("QA-03.backend", "FAIL", "Backend regression exceeded 120 seconds.")]
    (folder / "backend-output.txt").write_text(result.stdout + result.stderr, encoding="utf-8")
    counts = {key: 0 for key in ("tests", "failures", "errors", "skipped")}
    if junit.exists():
        tree = ElementTree.parse(junit)
        for suite in tree.iter("testsuite"):
            for key in counts:
                counts[key] += int(suite.get(key, "0"))
    passed = (
        result.returncode == 0
        and counts["tests"] > 0
        and not any(counts[key] for key in ("failures", "errors", "skipped"))
    )
    checks = [
        check(
            "QA-03.backend",
            "PASS" if passed else "FAIL",
            "Structured policy/state tests; not live language, audio, push, or account isolation.",
            exit_code=result.returncode,
            counts=counts,
            files=["backend-junit.xml", "backend-output.txt"],
        )
    ]
    # Import by path because the existing preparation script name contains hyphens.

    spec = importlib.util.spec_from_file_location(
        "linea_test_inventory", ROOT / "scripts/prepare-test-run.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    try:
        manual, original, held_out = module.inventory()
        checks.append(
            check(
                "QA-11.fixture_inventory",
                "PASS",
                "Source examples and expectations match; semantic accuracy remains NOT RUN.",
                guide_checks=len(manual),
                original_cases=len(original),
                held_out_cases=len(held_out),
            )
        )
    except (AssertionError, KeyError, ValueError, OSError):
        checks.append(
            check("QA-11.fixture_inventory", "FAIL", "Guide or fixture inventory differs.")
        )
    return checks


def request(client, url, headers=None):
    started = time.monotonic()
    try:
        response = client.get(url, headers=headers)
        return response, {
            "http_status": response.status_code,
            "elapsed_ms": round((time.monotonic() - started) * 1000),
        }
    except httpx.HTTPError:
        # Do not print request/response content, authorization headers, or exception URLs.
        return None, {
            "transport_error": True,
            "elapsed_ms": round((time.monotonic() - started) * 1000),
        }


def response_json(response):
    if response is None or response.status_code != 200:
        return None
    try:
        return response.json()
    except ValueError:
        return None


def api_checks(api_url, require_live, client):
    checks = []
    response, timing = request(client, f"{api_url}/health")
    health = response_json(response)
    valid_health = (
        isinstance(health, dict)
        and health.get("status") == "ok"
        and health.get("mode") in ("demo", "live")
    )
    checks.append(
        check(
            "QA-01.health",
            "PASS" if valid_health else "FAIL",
            "Health must return 200 and Linea status/mode.",
            **timing,
        )
    )

    if require_live:
        ready = (
            valid_health
            and health.get("mode") == "live"
            and health.get("voice_connected") is True
            and health.get("push_connected") is True
            and isinstance(health.get("repository"), str)
            and bool(health["repository"].strip())
            and "sqlite" not in health["repository"].lower()
        )
        checks.append(
            check(
                "QA-01.live_declarations",
                "PASS" if ready else "BLOCKED",
                "Requires declared live mode, connected voice/push, and non-SQLite repository. These declarations do not prove actual delivery or isolation.",
            )
        )

    response, timing = request(client, f"{api_url}/openapi.json")
    schema = response_json(response)
    paths = schema.get("paths", {}) if isinstance(schema, dict) else {}
    info = schema.get("info", {}) if isinstance(schema, dict) else {}
    valid_contract = (
        isinstance(paths, dict)
        and isinstance(info, dict)
        and isinstance(info.get("title"), str)
        and "linea" in info["title"].lower()
        and all(
            isinstance(paths.get(path), dict) and "get" in paths[path]
            for path in ("/health", "/profiles", "/dashboard")
        )
        and "post" in paths.get("/profiles", {})
    )
    checks.append(
        check(
            "QA-01.contract",
            "PASS" if valid_contract else "FAIL",
            "Deployed OpenAPI must identify Linea and contain the core health/profile/dashboard methods.",
            **timing,
        )
    )

    for case_id, headers in [
        ("QA-27.missing_auth", {}),
        ("QA-27.invalid_bearer", {"Authorization": "Bearer linea-verification-invalid-token"}),
    ]:
        if not valid_health or not valid_contract:
            checks.append(
                check(
                    case_id,
                    "BLOCKED",
                    "Linea health/contract prerequisites failed; a proxy rejection would not establish application authentication.",
                )
            )
            continue
        response, timing = request(client, f"{api_url}/dashboard", headers)
        rejected = response is not None and response.status_code in {401, 403}
        checks.append(
            check(
                case_id,
                "PASS" if rejected else "FAIL",
                "Unauthenticated/invalid requests must be rejected. Own/other-account RLS and valid user authentication remain NOT RUN.",
                **timing,
            )
        )
    return checks


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--local", action="store_true", help="Run synthetic backend pytest and fixture inventory"
    )
    parser.add_argument(
        "--api-url",
        help="Base URL for read-only deployment checks, without secrets or query parameters",
    )
    parser.add_argument(
        "--require-live",
        action="store_true",
        help="Also require declared live integrations; not end-to-end proof",
    )
    parser.add_argument("--run-name", help="New report directory name; never overwritten")
    args = parser.parse_args()
    if not args.local and not args.api_url:
        parser.error("Choose --local and/or --api-url")
    if args.require_live and not args.api_url:
        parser.error("--require-live needs --api-url")
    if args.api_url:
        try:
            parsed = urlsplit(args.api_url)
        except ValueError:
            parser.error("Invalid API URL")
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.hostname
            or parsed.username
            or parsed.password
            or parsed.query
            or parsed.fragment
        ):
            parser.error("API URL must be HTTP(S) without credentials, query, or fragment")
        args.api_url = args.api_url.rstrip("/")
    run_name = args.run_name or datetime.now(timezone.utc).strftime("scripted-%Y%m%dT%H%M%S%fZ")
    reserved = {"CON", "PRN", "AUX", "NUL"} | {
        f"{p}{n}" for p in ("COM", "LPT") for n in range(1, 10)
    }
    if (
        not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}", run_name)
        or run_name.upper() in reserved
    ):
        parser.error("Run name must be a safe directory name of 1 to 64 characters")
    folder = ROOT / "artifacts/test-runs" / run_name
    if folder.exists():
        parser.error("Run folder already exists; use a new name to preserve evidence")
    folder.mkdir(parents=True)
    started = datetime.now(timezone.utc).isoformat()
    before = workspace_version()
    checks = local_checks(folder) if args.local else []
    if args.api_url:
        with httpx.Client(timeout=15, follow_redirects=False) as client:
            checks.extend(api_checks(args.api_url, args.require_live, client))
    after = workspace_version()
    if args.local and before["source_sha256"] != after["source_sha256"]:
        for item in checks:
            if item["id"] in {"QA-03.backend", "QA-11.fixture_inventory"}:
                item["status"] = "BLOCKED"
                item["detail"] += " Source changed during the run; rerun on a stable build."
    report = {
        "started_utc": started,
        "finished_utc": datetime.now(timezone.utc).isoformat(),
        "local_commit": before["commit"],
        "workspace_before": before,
        "workspace_after": after,
        "deployed_commit": "not_verified_by_this_runner",
        "api_url": args.api_url,
        "checks": checks,
        "limits": "Subchecks only. Actual classifier accuracy, valid auth/RLS, audio, notifications, visual behavior, and full live acceptance remain NOT RUN. No provider inference, phone calls, or writes performed.",
    }
    (folder / "scripted-report.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    summary = "# Linea scripted verification report\n\n"
    summary += f"UTC start: {started}\n\nLocal commit: {report['local_commit']}\n\n"
    summary += f"Uncommitted changes: {before['uncommitted_changes']}\n\nSource fingerprint: {before['source_sha256']}\n\n"
    summary += report["limits"] + "\n\n| Subcheck | Status | Detail |\n| --- | --- | --- |\n"
    for item in checks:
        summary += f"| {item['id']} | {item['status']} | {item['detail']} |\n"
        print(f"{item['status']}: {item['id']}")
    (folder / "scripted-report.md").write_text(summary, encoding="utf-8")
    print(f"Report: {folder / 'scripted-report.md'}")
    return (
        1
        if any(c["status"] == "FAIL" for c in checks)
        else 2
        if any(c["status"] == "BLOCKED" for c in checks)
        else 0
    )


if __name__ == "__main__":
    raise SystemExit(main())
