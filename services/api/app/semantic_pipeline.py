"""Language-independent semantic orchestration seam, ready for provider wiring.
Retrieval never chooses tier. Stored curated examples are synthetic specs only.
"""

from typing import Protocol

from .models import CheckIn, Profile, Turn


class Retriever(Protocol):
    def retrieve(self, text: str, limit: int = 5) -> list[dict]: ...


class StructuredInterpreter(Protocol):
    def interpret(self, request: dict) -> dict: ...


class SemanticPipeline:
    def __init__(self, retriever: Retriever, interpreter: StructuredInterpreter):
        self.retriever, self.interpreter = retriever, interpreter

    def classify(self, text: str, call: CheckIn, profile: Profile) -> Turn:
        request = {
            "instruction": (
                "Extract every fact, never decide severity or treatment. Bind short "
                "answers to the actual active question. Resolve subject, negation, "
                "event timing, corrections, and actual vs hypothetical events. "
                "Missing findings remain null; confidence is not recovery. "
                "Use stable incident identity across turns and dose-period identity "
                "for medicine. Do not infer that the family browser speaker was "
                "heard on telephony. Never add facts from examples to this elder."
            ),
            "text": text,
            "active_question": call.active_question,
            "active_prompt": call.active_prompt,
            "mode": call.mode,
            "consent": profile.consent,
            "medicine": profile.medicine,
            "known_facts": {k: v.model_dump() for k, v in call.facts.items()},
            "examples": self.retriever.retrieve(text, 5),
            "output_schema": Turn.model_json_schema(),
        }
        return Turn.model_validate(self.interpreter.interpret(request))
