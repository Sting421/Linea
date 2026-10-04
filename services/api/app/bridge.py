"""Custom-LLM bridge contract, independent of the provider wire envelope.
The verified Agora adapter must map the real authenticated turn to this input,
and map an empty reply to the verified no-speech wire response. No fabricated
vendor endpoint is exposed by the demo API.
"""

import hashlib
import logging

from .conversation import turn, unasked_dose_result
from .interpretation import prepare
from .models import Alert, CheckIn, Profile, Turn, now
from .ports import Classifier


class BrainBridge:
    def __init__(self, classifier: Classifier):
        self.classifier = classifier

    def completion(
        self,
        text: str,
        turn_id: str,
        call: CheckIn,
        profile: Profile,
        history: list[CheckIn],
    ):
        if turn_id in call.processed_turns:
            if (
                turn_id in call.turn_hashes
                and call.turn_hashes[turn_id] != hashlib.sha256(text.encode()).hexdigest()
            ):
                raise ValueError("Turn identity was reused with different elder text")
            return call.processed_turns[turn_id]
        try:
            interpreted = self.classifier.classify(text, call, profile)
        except Exception as exc:
            response = getattr(exc, "response", None)
            logging.getLogger("uvicorn.error").warning(
                "Interpretation failed: error=%s upstream_status=%s",
                type(exc).__name__,
                getattr(response, "status_code", None),
            )
            if not call.emergency_latched:
                return self.unavailable(text, turn_id, call)
            # Once established, the fixed response never depends on another
            # successful model request. Failed interpretation cannot end a call.
            logging.getLogger(__name__).warning("Emergency control unavailable; retaining response")
            interpreted = Turn(turn_id=turn_id, text=text)
        else:
            call.interpretation_failures = 0
        interpreted.turn_id, interpreted.text = turn_id, text
        interpreted = unasked_dose_result(call, interpreted)
        interpreted = prepare(interpreted, call, profile, history)
        reply = turn(call, profile, interpreted)
        call.turn_hashes[turn_id] = hashlib.sha256(text.encode()).hexdigest()
        return reply

    @staticmethod
    def unavailable(text, turn_id, call):
        # Preserve the report without inventing facts or advancing a routine beat.
        # A provider retry of this turn receives the same reply, not another failure.
        call.interpretation_failures += 1
        call.complete = False
        incident = f"interpretation:{call.id}"
        alert = next((a for a in call.alerts if a.incident_id == incident), None)
        if alert:
            alert.quote = text
            alert.revision += 1
        else:
            call.alerts.append(
                Alert(
                    incident_id=incident,
                    concern="CALL_CONNECTION",
                    quote=text,
                    reason="An answer could not be assessed because interpretation was unavailable",
                )
            )
        if call.family:
            # Retain LISTEN behavior for existing browser participants.
            reply = ""
        elif call.interpretation_failures >= 3:
            call.intentional_end, call.mode, call.active_question = True, "ENDING", None
            call.retry_at = None
            reply = (
                "I'm having trouble continuing this check-in. "
                "Your check-in is incomplete. I'll end this call now."
            )
        else:
            reply = "I'm having trouble processing your answer. Please say it again."
        call.transcript.append({"speaker": "elder", "text": text, "at": now().isoformat()})
        if reply:
            call.transcript.append({"speaker": "linea", "text": reply, "at": now().isoformat()})
        # Keep active_prompt: a repeated short answer still belongs to that question.
        call.processed_turns[turn_id] = reply
        call.turn_hashes[turn_id] = hashlib.sha256(text.encode()).hexdigest()
        return reply
