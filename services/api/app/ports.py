"""Integration contracts. These are Linea contracts, not assumed Agora webhook shapes."""

from typing import Protocol

import httpx

from .models import CheckIn, Profile, Turn


class VoiceRuntime(Protocol):
    def place(self, call: CheckIn, profile: Profile) -> str: ...
    def speak(self, call: CheckIn, text: str) -> None: ...
    def end_everyone(self, call: CheckIn) -> None: ...
    def family_token(self, call: CheckIn, member: str) -> dict: ...


class Classifier(Protocol):
    def classify(self, text: str, call: CheckIn, profile: Profile) -> Turn: ...


class SemanticHTTPClassifier:
    """Connect a curated retrieval + structured interpretation service here.
    It must bind short answers to active_question and emit facts, never a tier.
    """

    def __init__(self, url, token):
        self.url, self.token = url, token

    def classify(self, text, call, profile):
        response = httpx.post(
            self.url,
            headers={"Authorization": f"Bearer {self.token}"},
            json={
                "text": text,
                "active_question": call.active_question,
                "active_prompt": call.active_prompt,
                "mode": call.mode,
                "known_facts": {k: v.model_dump() for k, v in call.facts.items()},
                "medicine": profile.medicine,
                "schema": Turn.model_json_schema(),
            },
            timeout=8,
        )
        response.raise_for_status()
        return Turn.model_validate(response.json())


class UnconnectedVoiceRuntime:
    def place(self, *args):
        raise RuntimeError("Agora call placement is not connected; no phone call was placed")

    def speak(self, *args):
        raise RuntimeError("Agora speak delivery is not connected")

    def end_everyone(self, *args):
        raise RuntimeError("Provider teardown must be verified before live use")

    def family_token(self, *args):
        raise RuntimeError("Authorized RTC token issuance is not connected")
