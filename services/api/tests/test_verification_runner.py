"""Check reporting boundaries: deployment failures cannot masquerade as acceptance."""

import importlib.util
import json
from pathlib import Path

import httpx
import pytest

spec = importlib.util.spec_from_file_location(
    "verification_runner", Path(__file__).resolve().parents[3] / "scripts/run-verification.py"
)
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)

CONTRACT = {
    "info": {"title": "Linea MVP API"},
    "paths": {
        "/health": {"get": {}},
        "/profiles": {"get": {}, "post": {}},
        "/dashboard": {"get": {}},
    },
}


def run_checks(health, contract=CONTRACT, denied=401):
    requests = []

    def handler(request):
        assert request.method == "GET"
        requests.append(request)
        if request.url.path == "/health":
            return httpx.Response(200, json=health)
        if request.url.path == "/openapi.json":
            return httpx.Response(200, json=contract)
        return httpx.Response(denied, json={"private": "synthetic-private-marker"})

    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        result = runner.api_checks("https://api.example.test", True, client)
    return {c["id"]: c for c in result}, requests


@pytest.mark.parametrize("voice", [False, "true", None])
def test_live_flags_require_real_booleans_and_do_not_prove_delivery(voice):
    results, requests = run_checks(
        {
            "status": "ok",
            "mode": "live",
            "voice_connected": voice,
            "push_connected": True,
            "repository": "supabase",
        }
    )
    assert results["QA-01.live_declarations"]["status"] == "BLOCKED"
    assert results["QA-27.invalid_bearer"]["status"] == "PASS"
    assert len(requests) == 4
    assert "synthetic-private-marker" not in json.dumps(results)


def test_demo_cannot_be_marked_live_ready():
    results, _ = run_checks(
        {
            "status": "ok",
            "mode": "demo",
            "voice_connected": True,
            "push_connected": True,
            "repository": "sqlite-demo",
        }
    )
    assert results["QA-01.health"]["status"] == "PASS"
    assert results["QA-01.live_declarations"]["status"] == "BLOCKED"


@pytest.mark.parametrize("health", [{"status": "ok", "mode": {}}, "proxy error"])
def test_invalid_health_blocks_auth_checks_instead_of_accepting_proxy_status(health):
    results, requests = run_checks(health, denied=403)
    assert results["QA-01.health"]["status"] == "FAIL"
    assert results["QA-27.missing_auth"]["status"] == "BLOCKED"
    assert results["QA-27.invalid_bearer"]["status"] == "BLOCKED"
    assert len(requests) == 2


def test_authenticated_data_exposure_fails_without_saving_private_response():
    results, _ = run_checks({"status": "ok", "mode": "demo"}, denied=200)
    assert results["QA-27.missing_auth"]["status"] == "FAIL"
    assert results["QA-27.invalid_bearer"]["status"] == "FAIL"
    assert "synthetic-private-marker" not in json.dumps(results)


def test_wrong_contract_blocks_app_authentication_conclusion():
    results, requests = run_checks({"status": "ok", "mode": "demo"}, contract={"paths": {}})
    assert results["QA-01.contract"]["status"] == "FAIL"
    assert results["QA-27.invalid_bearer"]["status"] == "BLOCKED"
    assert len(requests) == 2
