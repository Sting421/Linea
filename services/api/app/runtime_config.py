"""Explicit runtime configuration. Credentials alone never satisfy live acceptance."""

import json
import os
from pathlib import Path
from uuid import UUID

from .agora_runtime import AgoraRuntime
from .interpreter import OpenAIClassifier
from .ports import SemanticHTTPClassifier
from .retrieval import CuratedRetriever
from .runtime_repository import RuntimeRepository, service_client
from .runtime_service import EmergencyJournal, RuntimeService


def accepted():
    path = os.getenv("LINEA_LIVE_ACCEPTANCE_FILE", "")
    if not path:
        return False
    try:
        result = json.loads(Path(path).read_text(encoding="utf-8"))
        return bool(
            result.get("tested_at")
            and os.getenv("LINEA_BUILD_ID")
            and result.get("build") == os.getenv("LINEA_BUILD_ID")
            and result.get("tester")
        ) and all(result.get("cases", {}).get(f"MVP-{i:02}") == "passed" for i in range(1, 23))
    except (OSError, ValueError, TypeError, AttributeError):
        return False


def build_runtime(clock):
    test_scope = None
    if os.getenv("LINEA_VOICE_TEST_MODE") == "1":
        if os.getenv("LINEA_MODE") != "connected":
            raise RuntimeError("Scoped voice acceptance testing requires connected mode")
        test_scope = (
            str(UUID(os.environ["LINEA_TEST_ELDER_ID"])),
            str(UUID(os.environ["LINEA_TEST_OWNER_ID"])),
        )
    external_url = os.getenv("LINEA_SEMANTIC_CLASSIFIER_URL", "")
    if external_url:
        if not external_url.startswith("https://") or not os.getenv(
            "LINEA_SEMANTIC_CLASSIFIER_TOKEN"
        ):
            raise RuntimeError("External interpretation requires HTTPS and a private bearer")
        classifier = SemanticHTTPClassifier(
            external_url, os.environ["LINEA_SEMANTIC_CLASSIFIER_TOKEN"]
        )
    else:
        classifier = OpenAIClassifier(
            os.environ["OPENAI_API_KEY"],
            os.getenv("LINEA_SEMANTIC_MODEL", "gpt-4.1-mini-2025-04-14"),
            retriever=CuratedRetriever(os.environ["OPENAI_API_KEY"]),
        )
    if not os.getenv("LINEA_PROVIDER_WEBHOOK_SECRET"):
        raise RuntimeError("Install Agora's actual project notification secret")
    return RuntimeService(
        RuntimeRepository(service_client()),
        AgoraRuntime(),
        classifier,
        EmergencyJournal(
            os.getenv("LINEA_RUNTIME_JOURNAL_PATH", ".local/runtime-journal"),
            os.environ["LINEA_CUSTOM_LLM_BEARER"],
        ),
        clock,
        test_scope=test_scope,
    )
