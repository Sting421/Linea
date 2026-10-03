"""Tests must never inherit a workstation's connected account or database mode."""

import pytest


@pytest.fixture(autouse=True)
def demo_environment(monkeypatch):
    monkeypatch.setenv("LINEA_MODE", "demo")
    monkeypatch.setenv("LINEA_DEMO_API_TOKEN", "local-demo-only-change-me")
    monkeypatch.setenv("LINEA_DEMO_SEED", "1")
