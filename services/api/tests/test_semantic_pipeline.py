import pytest
from app.bridge import BrainBridge
from app.models import Turn
from app.semantic_pipeline import SemanticPipeline
from test_conversation import setup


def test_interpreter_cannot_supply_tier_or_replace_policy():
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        Turn.model_validate({"turn_id": "a", "text": "hello", "tier": "routine"})


def test_bridge_preserves_active_question_and_schema_validates_response():
    class Retriever:
        def retrieve(self, text, limit=5):
            return [{"text": "Synthetic example only", "similarity": 0.99}]

    class Interpreter:
        def interpret(self, request):
            assert request["active_question"] == "concern:fall"
            assert "tier" not in request["output_schema"]["properties"]
            return {
                "turn_id": "model-id",
                "text": "model-text",
                "concerns": [
                    {
                        "incident_id": "fall",
                        "concern": "FALL",
                        "quote": "Yes",
                        "injury": True,
                    }
                ],
            }

    p, c = setup()
    c.active_question = "concern:fall"
    reply = BrainBridge(SemanticPipeline(Retriever(), Interpreter())).completion(
        "Yes", "provider-turn", c, p, []
    )
    assert c.medicine_result == "unknown" and c.alerts[0].tier == "significant"
    assert c.transcript[0]["text"] == "Yes" and "family" in reply
