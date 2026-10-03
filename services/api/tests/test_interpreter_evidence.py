import json
from types import SimpleNamespace

import httpx
import pytest
from app.bridge import BrainBridge
from app.interpreter import OpenAIClassifier
from test_conversation import setup


def classifier(result, requests=None, retriever=None):
    def respond(request):
        if requests is not None:
            requests.append(json.loads(request.content))
        return httpx.Response(
            200,
            json={
                "choices": [{"finish_reason": "stop", "message": {"content": json.dumps(result)}}]
            },
        )

    return OpenAIClassifier(
        "private",
        "test-model",
        httpx.Client(base_url="https://api.openai.com", transport=httpx.MockTransport(respond)),
        retriever=retriever,
    )


def test_profile_medicine_cannot_skip_medicine_question():
    p, c = setup()
    c.active_question = "sleep"
    c.active_prompt = "How did you sleep last night?"
    model = classifier(
        {
            "sleep": "Okay",
            "medicine": p.medicine,
            "evidence": {"sleep": "Okay", "medicine": p.medicine},
        }
    )
    reply = BrainBridge(model).completion("Okay", "sleep-turn", c, p, [])
    assert c.answers == {"sleep": "Okay"}
    assert c.active_question == "medicine" and p.medicine in reply
    assert not c.complete


@pytest.mark.parametrize("quote", [None, "", "invented"])
def test_unsupported_routine_answers_and_dose_status_are_discarded(quote):
    p, c = setup()
    model = classifier(
        {
            "sleep": "well",
            "medicine_result": "taken",
            "evidence": {"sleep": quote, "medicine": quote},
        }
    )
    result = model.classify("Hello", c, p)
    assert result.answers == {} and result.medicine_result is None


def test_multiple_explicit_answers_and_medication_corrections_remain_supported():
    p, c = setup()
    result = classifier(
        {
            "sleep": "well",
            "feeling": "good",
            "medicine_result": "not_taken",
            "evidence": {
                "sleep": "slept well",
                "feeling": "feel good",
                "medicine": "haven't taken my tablet",
            },
        }
    ).classify("I slept well, feel good, but haven't taken my tablet.", c, p)
    assert result.answers == {"sleep": "well", "feeling": "good"}
    assert result.medicine_result == "not_taken"


def test_model_receives_retrieved_examples_as_context_only():
    p, c = setup()
    requests = []
    retrieved = [{"id": "synthetic-only", "dialogue": [["elder", "I fell"]]}]
    model = classifier({}, requests, SimpleNamespace(retrieve=lambda query, limit: retrieved))
    result = model.classify("Hello", c, p)
    context = json.loads(requests[0]["messages"][1]["content"])
    assert context["synthetic_examples"] == retrieved
    assert not result.concerns and not result.answers
    assert len(requests) == 1


def test_retrieval_outage_does_not_skip_safety_interpretation(caplog):
    p, c = setup()

    def fail(query, limit):
        raise httpx.ReadTimeout("private-utterance")

    model = classifier(
        {
            "concerns": [
                {
                    "incident_id": "new",
                    "concern": "CHEST_PAIN",
                    "current": True,
                    "quote": "My chest hurts",
                }
            ]
        },
        retriever=SimpleNamespace(retrieve=fail),
    )
    result = model.classify("My chest hurts", c, p)
    assert result.concerns[0].current is True
    assert "private-utterance" not in caplog.text


@pytest.mark.parametrize("quote", ["", " "])
def test_empty_concern_evidence_is_rejected(quote):
    p, c = setup()
    model = classifier(
        {
            "concerns": [
                {"incident_id": "new", "concern": "CHEST_PAIN", "current": True, "quote": quote}
            ]
        }
    )
    with pytest.raises(ValueError):
        model.classify("I am fine", c, p)
