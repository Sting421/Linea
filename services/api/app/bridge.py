"""Custom-LLM bridge contract, independent of the provider wire envelope.
The verified Agora adapter must map the real authenticated turn to this input,
and map an empty reply to the verified no-speech wire response. No fabricated
vendor endpoint is exposed by the demo API.
"""

from .conversation import turn
from .interpretation import prepare
from .models import CheckIn, Profile
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
            return call.processed_turns[turn_id]
        interpreted = self.classifier.classify(text, call, profile)
        interpreted.turn_id, interpreted.text = turn_id, text
        interpreted = prepare(interpreted, call, profile, history)
        return turn(call, profile, interpreted)
