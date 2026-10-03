from .models import Alert, CheckIn, Facts, Profile, Turn, now
from .policy import assess

QUESTIONS = {
    "sleep": "How did you sleep last night?",
    "medicine": "Have you taken {medicine} for today’s dose period?",
    "feeling": "How are you feeling today?",
    "anything": "Is there anything else you would like to share?",
}
NO_ADVICE = "I can't advise you about doses. Please ask a pharmacist or doctor."
REVIEW = "Please get medical advice about this episode."


def emergency(p: Profile) -> str:
    nearby = next((c for c in p.contacts if c.nearby), p.contacts[0])
    return (
        f"{p.preferred_name}, please call 911 now, or ask someone nearby to call. "
        f"You can also reach {nearby.name} at {nearby.phone}. I am trying to reach your family. I am here with you."
    )


def next_question(c: CheckIn, p: Profile) -> str:
    for beat, question in QUESTIONS.items():
        if beat not in c.answers:
            c.active_question = beat
            return question.format(medicine=p.medicine)
    c.complete = True
    c.mode = "ENDING"
    c.active_question = None
    return f"Thank you for talking with me, {p.preferred_name}. Take care. Your next scheduled check-in is at {p.call_time}."


def merge_facts(old: Facts | None, incoming: Facts) -> Facts:
    if not old:
        return incoming
    data = old.model_dump()
    for key, value in incoming.model_dump(exclude_unset=True).items():
        if value is not None:
            data[key] = value
    data["red_flags"] = list(dict.fromkeys(old.red_flags + incoming.red_flags))
    # Reassurance and reinterpretation do not erase an established emergency.
    return Facts.model_validate(data)


def turn(c: CheckIn, p: Profile, t: Turn) -> str:
    if t.turn_id in c.processed_turns:
        return c.processed_turns[t.turn_id]
    if c.state not in ("connected",):
        raise ValueError("A connected phone leg is required")
    c.transcript.append({"speaker": "elder", "text": t.text, "at": now().isoformat()})
    if t.stop or t.end_call:
        c.intentional_end = True
        c.retry_at = None
        c.mode = "ENDING"
        c.active_question = None
    if t.stop:
        p.consent = "declined"
        p.consent_words, p.consent_at = t.text, now()
    c.answers.update(t.answers)
    if t.medicine_result is not None:
        c.medicine_result = t.medicine_result
        c.answers["medicine"] = t.medicine_result
    assessments = []
    for incoming in t.concerns:
        previous = c.facts.get(incoming.incident_id)
        facts = merge_facts(previous, incoming)
        c.facts[facts.incident_id] = facts
        result = assess(facts)
        if (
            facts.concern == "MEDICINE_NOT_TAKEN"
            and facts.subject == "elder"
            and facts.context == "actual"
            and facts.medicine_result
        ):
            c.medicine_result, c.medicine_due = facts.medicine_result, facts.due
            c.answers["medicine"] = facts.medicine_result
        if not result.new_event:
            old = next((a for a in c.alerts if a.incident_id == facts.incident_id), None)
            if old:
                # Retain the alert/evidence; correct attribution without pretending
                # that an established emergency has been clinically cleared.
                old.subject = facts.subject
                old.quote = facts.quote
                old.reason = result.reason
                old.revision += 1
            continue
        old = next((a for a in c.alerts if a.incident_id == facts.incident_id), None)
        if old:
            ranks = {None: 0, "routine": 1, "significant": 2, "emergency": 3}
            material_change = previous and previous.model_dump(
                exclude={"quote", "clarification_failures"}
            ) != facts.model_dump(exclude={"quote", "clarification_failures"})
            if material_change or ranks[result.tier] > ranks[old.tier]:
                old.revision += 1
            old.quote, old.reason = facts.quote, result.reason
            old.subject = facts.subject
            if facts.concern == "FALL":
                old.actual_fall = facts.context != "near_event"
            if ranks[result.tier] >= ranks[old.tier]:
                old.tier = result.tier
            old.assessment = (
                "complete"
                if old.tier == "emergency" or (result.tier and not result.unresolved)
                else "pending"
            )
        else:
            c.alerts.append(
                Alert(
                    incident_id=facts.incident_id,
                    concern=facts.concern,
                    subject=facts.subject,
                    actual_fall=(facts.context != "near_event")
                    if facts.concern == "FALL"
                    else None,
                    tier=result.tier,
                    quote=facts.quote,
                    reason=result.reason,
                    assessment="complete" if result.tier and not result.unresolved else "pending",
                )
            )
        assessments.append((facts, result))
        if result.tier == "emergency":
            c.emergency_latched = True
    if c.intentional_end:
        c.mode = "ENDING"
        reminder = (
            " Please call 911 now, or ask someone nearby to call." if c.emergency_latched else ""
        )
        decision = (
            "I will stop future scheduled calls and let your family know."
            if t.stop
            else "I will end this call now."
        )
        reply = f"I understand, {p.preferred_name}. {decision}{reminder} Take care."
    elif c.emergency_latched:
        c.mode = "EMERGENCY"
        reply = (
            ""
            if c.family and not any(result.tier == "emergency" for _, result in assessments)
            else emergency(p)
        )
    elif p.consent != "granted":
        if t.consent == "yes":
            p.consent, p.consent_words, p.consent_at = "granted", t.text, now()
            c.mode = "SCRIPT"
            reply = "Thank you. " + next_question(c, p)
        elif t.consent == "no":
            p.consent, p.consent_words, p.consent_at = "declined", t.text, now()
            c.intentional_end, c.mode = True, "ENDING"
            c.retry_at = None
            reply = f"I understand, {p.preferred_name}. I will not call again. I will let your family know. Take care."
        else:
            c.active_question = "consent"
            c.consent_clarifications += 1
            if c.consent_clarifications >= 2:
                c.intentional_end, c.mode = True, "ENDING"
                reply = f"I could not confirm your consent, {p.preferred_name}. I will end this call and let your family know. Take care."
                c.alerts.append(
                    Alert(
                        incident_id=f"consent:{c.id}",
                        concern="CALL_CONNECTION",
                        reason="Consent could not be confirmed. Scheduled calls remain disabled.",
                    )
                )
            else:
                reply = "Is it okay for Linea to call you for a daily check-in and share the check-in with your family?"
    elif c.family:
        c.mode, reply = "LISTEN", ""
    else:
        pending = []
        # Re-evaluate unresolved incidents even when the elder changes topic.
        for facts in c.facts.values():
            result = assess(facts)
            if result.new_event and not result.resume:
                pending.append((facts, result))
        if pending:
            facts, result = sorted(
                pending,
                key=lambda item: {"significant": 2, None: 1, "routine": 0}.get(item[1].tier, 3),
                reverse=True,
            )[0]
            c.active_question = f"concern:{facts.incident_id}"
            prefix = (
                "I am trying to reach your family about this. "
                if result.tier == "significant"
                else "Thank you for telling me. "
            )
            if result.review:
                prefix += (NO_ADVICE if facts.concern == "MEDICINE_NOT_TAKEN" else REVIEW) + " "
            reply = prefix + (
                result.question or "I am here while you connect with someone who can help."
            )
        elif t.advice:
            reply = NO_ADVICE
        elif c.farewell_asked:
            c.mode, c.active_question = "ENDING", None
            reply = f"Thank you, {p.preferred_name}. Take care."
        else:
            c.mode = "SCRIPT"
            significant = [r for _, r in assessments if r.tier == "significant"]
            prefix = (
                "I am trying to reach your family about this. "
                if significant
                else ("Thank you for telling me. " if assessments else "")
            )
            if any(r.review for _, r in assessments):
                prefix += (
                    NO_ADVICE
                    if any(f.concern == "MEDICINE_NOT_TAKEN" for f, _ in assessments)
                    else REVIEW
                ) + " "
            reply = prefix + next_question(c, p)
    if reply:
        c.active_prompt = reply
        c.transcript.append({"speaker": "linea", "text": reply, "at": now().isoformat()})
    c.processed_turns[t.turn_id] = reply
    return reply


def opening(c: CheckIn, p: Profile, reconnect: bool = False) -> str:
    if c.emergency_latched:
        c.mode = "EMERGENCY"
        return emergency(p)
    prefix = (
        f"{p.preferred_name}, it's Linea again. Our call got disconnected. "
        if reconnect
        else f"Hello {p.preferred_name}, it's Linea, your automated check-in companion. "
    )
    if p.consent != "granted":
        return prefix + "Is it okay for me to call daily and share your check-in with your family?"
    c.mode = "SCRIPT"
    unresolved = [
        (f, assess(f)) for f in c.facts.values() if not assess(f).resume and assess(f).new_event
    ]
    if unresolved:
        return prefix + (
            unresolved[0][1].question or "I am here while you connect with someone who can help."
        )
    return prefix + next_question(c, p)


def briefing(c: CheckIn, p: Profile) -> str:
    facts = f"{p.preferred_name} is on the line. "
    facts += f"Medicine was reported {c.medicine_result.replace('_', ' ')}. "
    if c.alerts:
        alert = c.alerts[-1]
        facts += f"{alert.concern.replace('_', ' ').lower()} was reported. "
    return facts + "Over to you."
