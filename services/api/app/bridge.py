"""Custom-LLM bridge contract, independent of the provider wire envelope.
The verified Agora adapter must map the real authenticated turn to this input,
and map an empty reply to the verified no-speech wire response. No fabricated
vendor endpoint is exposed by the demo API.
"""

import hashlib
import logging

from .conversation import turn
from .interpretation import prepare
from .models import CheckIn, Profile, Turn
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
        except Exception:
            if not call.emergency_latched:
                raise
            # Once established, the fixed response never depends on another
            # successful model request. Failed interpretation cannot end a call.
            logging.getLogger(__name__).warning("Emergency control unavailable; retaining response")
            interpreted = Turn(turn_id=turn_id, text=text)
        interpreted.turn_id, interpreted.text = turn_id, text
        interpreted = prepare(interpreted, call, profile, history)
        reply = turn(call, profile, interpreted)
        call.turn_hashes[turn_id] = hashlib.sha256(text.encode()).hexdigest()
        return reply
