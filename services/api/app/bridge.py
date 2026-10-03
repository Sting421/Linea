"""Custom-LLM bridge contract, independent of the provider wire envelope.
The verified Agora adapter must map the real authenticated turn to this input,
and map an empty reply to the verified no-speech wire response. No fabricated
vendor endpoint is exposed by the demo API.
"""

import hashlib

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
        interpreted = (
            Turn(turn_id=turn_id, text=text)
            if call.emergency_latched
            else self.classifier.classify(text, call, profile)
        )
        interpreted.turn_id, interpreted.text = turn_id, text
        interpreted = prepare(interpreted, call, profile, history)
        reply = turn(call, profile, interpreted)
        call.turn_hashes[turn_id] = hashlib.sha256(text.encode()).hexdigest()
        return reply
