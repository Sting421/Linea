import sys
from types import SimpleNamespace

import pytest
from app import worker


@pytest.mark.parametrize("role", ["notifications", "retention"])
def test_auxiliary_workers_do_not_construct_voice_or_classifier(monkeypatch, role):
    monkeypatch.setattr(sys, "argv", ["worker", "--execute", "--once", "--role", role])
    monkeypatch.setattr(worker, "load_dotenv", lambda *a, **kw: None)
    for key in ("WEB_PUSH_PUBLIC_KEY", "WEB_PUSH_PRIVATE_KEY", "WEB_PUSH_SUBJECT"):
        monkeypatch.setenv(key, "test-setting")
    monkeypatch.setenv("LINEA_PUSH_ENABLED", "1")
    monkeypatch.delenv("LINEA_CUSTOM_LLM_BEARER", raising=False)
    repo = SimpleNamespace()
    monkeypatch.setattr(worker, "service_client", lambda: None)
    monkeypatch.setattr(worker, "RuntimeRepository", lambda client: repo)

    def forbidden(*args):
        raise AssertionError("Auxiliary worker must not require a voice runtime")

    monkeypatch.setattr(worker, "build_runtime", forbidden)
    seen = []
    monkeypatch.setattr(worker, "tick", lambda runtime, **kw: seen.append((runtime.repo, kw)) or {})
    worker.main()
    assert seen == [(repo, {"execute": True, "push": True, "role": role})]
