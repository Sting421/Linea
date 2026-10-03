import json
from types import SimpleNamespace

import httpx
import pytest
from app.bridge import BrainBridge
from app.interpreter import OpenAIClassifier
from app.models import Facts
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


def test_interpreter_failure_preserves_report_and_can_recover_without_skipping_question(caplog):
    p, c = setup()
    c.active_question, c.active_prompt = "medicine", "Have you taken your medicine today?"

    def unavailable(*args):
        raise httpx.ReadTimeout("private-error-with-token")

    bridge = BrainBridge(SimpleNamespace(classify=unavailable))
    reply = bridge.completion("private-reported-answer", "failed", c, p, [])
    assert "Please say it again" in reply and c.interpretation_failures == 1
    assert c.active_question == "medicine" and c.answers == {} and not c.complete
    assert c.alerts[0].quote == "private-reported-answer"
    assert c.alerts[0].assessment == "pending" and c.alerts[0].tier is None
    assert "ReadTimeout" in caplog.text and "private-" not in caplog.text
    assert bridge.completion("private-reported-answer", "failed", c, p, []) == reply
    assert c.interpretation_failures == 1 and len(c.transcript) == 2
    recovered = classifier({"medicine_result": "taken", "evidence": {"medicine": "I took it"}})
    BrainBridge(recovered).completion("I took it", "retry-answer", c, p, [])
    assert c.interpretation_failures == 0 and c.medicine_result == "taken"
    assert len(c.alerts) == 1  # Keep the unassessed earlier report visible.


def test_three_interpreter_failures_end_incomplete_without_withdrawing_consent():
    p, c = setup()

    def unavailable(*args):
        raise ValueError("invalid provider output")

    bridge = BrainBridge(SimpleNamespace(classify=unavailable))
    for i in range(3):
        reply = bridge.completion("Please listen", str(i), c, p, [])
    assert c.mode == "ENDING" and c.intentional_end and not c.complete
    assert c.active_question is None and c.retry_at is None
    assert p.consent == "granted" and "incomplete" in reply
    assert len(c.alerts) == 1 and c.alerts[0].revision == 3


def test_interpreter_failure_does_not_interrupt_existing_family_audio():
    p, c = setup()
    c.family = [p.owner_id]
    c.mode = "LISTEN"

    def unavailable(*args):
        raise httpx.ReadTimeout("unavailable")

    reply = BrainBridge(SimpleNamespace(classify=unavailable)).completion(
        "hello", "failed", c, p, []
    )
    assert reply == "" and c.mode == "LISTEN" and not c.intentional_end
    assert c.transcript[-1]["speaker"] == "elder"


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


def test_two_concerns_cannot_overwrite_each_other_with_shared_episode_id():
    p, c = setup()
    model = classifier(
        {
            "concerns": [
                {"incident_id": "episode", "concern": "CHEST_PAIN", "current": True},
                {"incident_id": "episode", "concern": "BREATHING", "current": True},
            ]
        }
    )
    BrainBridge(model).completion("My chest hurts and I can't breathe.", "first", c, p, [])
    assert {f.concern for f in c.facts.values()} == {"CHEST_PAIN", "BREATHING"}
    assert {a.concern for a in c.alerts} == {"CHEST_PAIN", "BREATHING"}
    assert len(c.facts) == len(c.alerts) == 2
    original_ids = set(c.facts)
    # The provider repeats its shared ID; clarification must use the same derived ID.
    BrainBridge(model).completion("It is still happening.", "second", c, p, [])
    assert set(c.facts) == original_ids and len(c.alerts) == 2


def test_new_concern_cannot_replace_a_previously_saved_different_concern():
    p, c = setup()
    c.facts["episode"] = Facts(incident_id="episode", concern="FALL", quote="I fell.")
    result = classifier(
        {
            "concerns": [
                {"incident_id": "episode", "concern": "DIZZINESS", "current": True},
            ]
        }
    ).classify("I am also dizzy now.", c, p)
    assert result.concerns[0].incident_id != "episode"
    assert c.facts["episode"].concern == "FALL"


@pytest.mark.parametrize(
    "stop,evidence,expected",
    [
        (True, "Please stop calling me", True),
        (True, "invented", False),
        (True, "", False),
        (False, None, False),
    ],
)
def test_latched_emergency_accepts_only_evidenced_withdrawal(stop, evidence, expected):
    p, c = setup()
    c.emergency_latched = True
    requests = []

    def forbidden(*args):
        pytest.fail("Emergency controls must not perform retrieval")

    model = classifier(
        {"stop": stop, "end_call": False, "evidence": evidence},
        requests,
        SimpleNamespace(retrieve=forbidden),
    )
    result = model.classify("Please stop calling me", c, p)
    assert result.stop is expected and not result.concerns and not result.answers
    assert len(requests) == 1
    assert requests[0]["response_format"]["json_schema"]["name"] == "linea_emergency_control"


def test_latched_emergency_survives_control_model_failure():
    p, c = setup()
    c.emergency_latched = True

    def unavailable(*args):
        raise httpx.ReadTimeout("private utterance")

    reply = BrainBridge(SimpleNamespace(classify=unavailable)).completion(
        "Hello?",
        "new",
        c,
        p,
        [],
    )
    assert "call 911" in reply
    assert c.emergency_latched and not c.intentional_end


def test_latched_emergency_end_call_does_not_withdraw_future_consent():
    p, c = setup()
    c.emergency_latched = True
    model = classifier({"stop": False, "end_call": True, "evidence": "end this call"})
    result = model.classify("Please end this call", c, p)
    assert result.end_call and not result.stop
