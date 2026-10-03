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


@pytest.mark.parametrize("quote", ["", " ", "An older utterance", None])
def test_concern_evidence_is_exact_received_text_instead_of_model_quote(quote):
    p, c = setup()
    model = classifier(
        {
            "concerns": [
                {"incident_id": "new", "concern": "CHEST_PAIN", "current": True, "quote": quote}
            ]
        }
    )
    result = model.classify("My chest hurts right now.", c, p)
    assert result.concerns[0].quote == "My chest hurts right now."


def test_maximum_length_utterance_is_preserved_as_evidence():
    p, c = setup()
    text = "My chest hurts. " + "a" * (4000 - len("My chest hurts. "))
    result = classifier(
        {"concerns": [{"incident_id": "new", "concern": "CHEST_PAIN", "current": True}]}
    ).classify(text, c, p)
    assert result.concerns[0].quote == text


@pytest.mark.parametrize("quote", [None, "invented"])
def test_concern_cannot_bypass_dose_evidence_gate(quote):
    p, c = setup()
    result = classifier(
        {
            "medicine_result": "not_taken",
            "evidence": {"medicine": quote},
            "concerns": [
                {
                    "incident_id": "dose",
                    "concern": "MEDICINE_NOT_TAKEN",
                    "medicine_result": "not_taken",
                    "access_barrier": True,
                }
            ],
        }
    ).classify("I'm out of tablets.", c, p)
    assert result.medicine_result is None
    assert result.concerns[0].medicine_result is None
    assert result.concerns[0].access_barrier is True


def test_concern_dose_result_cannot_overwrite_evidenced_answer():
    p, c = setup()
    result = classifier(
        {
            "medicine_result": "taken",
            "evidence": {"medicine": "I took it"},
            "concerns": [
                {
                    "incident_id": "dose",
                    "concern": "MEDICINE_NOT_TAKEN",
                    "medicine_result": "unknown",
                    "possible_dose_error": True,
                }
            ],
        }
    ).classify("I took it but I might have taken it twice.", c, p)
    assert result.medicine_result == result.concerns[0].medicine_result == "taken"
    assert result.concerns[0].possible_dose_error is True
