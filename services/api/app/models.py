from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, Field, field_validator


def now() -> datetime:
    return datetime.now(timezone.utc)


def uid() -> str:
    return str(uuid4())


Concern = Literal["FALL", "BREATHING", "CHEST_PAIN", "DIZZINESS", "MEDICINE_NOT_TAKEN"]
Tier = Literal["routine", "significant", "emergency"]
RedFlag = Literal[
    "cannot_get_up",
    "head_neck_back_hip_injury",
    "serious_injury",
    "severe_disabling_pain",
    "cannot_breathe",
    "gasping_choking",
    "cannot_speak_breathing",
    "blue_grey",
    "sudden_confusion",
    "chest_pressure",
    "spreading_pain",
    "sweating",
    "nausea_with_chest",
    "collapse",
    "one_sided_weakness",
    "speech_difficulty",
    "face_droop",
    "vision_loss",
    "severe_unusual_headache",
    "sudden_cannot_walk",
    "faint_incomplete_recovery",
    "faint_exertion",
    "faint_lying_down",
    "faint_serious_injury",
    "faint_palpitations",
    "overdose_poisoning",
]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Contact(StrictModel):
    name: str = Field(min_length=1, max_length=80)
    relationship: str = Field(min_length=1, max_length=50)
    phone: str = Field(pattern=r"^\+[1-9]\d{7,14}$")
    nearby: bool = False


class ProfileInput(StrictModel):
    name: str = Field(min_length=1, max_length=80)
    preferred_name: str = Field(min_length=1, max_length=80)
    phone: str = Field(pattern=r"^\+[1-9]\d{7,14}$")
    timezone: str = "Asia/Manila"
    call_time: str = Field(default="08:00", pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    medicine: str = Field(default="Losartan", min_length=1, max_length=80)
    medicine_time: str = Field(default="08:00", pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    contacts: list[Contact] = Field(min_length=1, max_length=3)
    language: Literal["en-US"] = "en-US"

    @field_validator("call_time")
    @classmethod
    def calling_hours(cls, value):
        if not "06:00" <= value < "21:00":
            raise ValueError("Daily calls must be between 06:00 and 21:00 local time")
        return value

    @field_validator("timezone")
    @classmethod
    def valid_timezone(cls, value):
        try:
            ZoneInfo(value)
        except Exception:
            raise ValueError("Choose a valid IANA timezone") from None
        return value


class Profile(ProfileInput):
    id: str = Field(default_factory=uid)
    owner_id: str
    consent: Literal["pending", "granted", "declined"] = "pending"
    consent_words: str | None = None
    consent_at: datetime | None = None
    enrolled: bool = True


class Facts(StrictModel):
    incident_id: str = Field(min_length=1, max_length=120)
    concern: Concern
    subject: Literal["elder", "other"] = "elder"
    context: Literal["actual", "near_event", "negated", "hypothetical", "remote_assessed"] = (
        "actual"
    )
    quote: str = Field(min_length=1, max_length=4000)
    current: bool | None = None
    resolved: bool | None = None
    mild: bool | None = None
    brief: bool | None = None
    familiar: bool | None = None
    usual_exertion: bool | None = None
    ongoing_pain: bool | None = None
    injury: bool | None = None
    functional_difficulty: bool | None = None
    repeated: bool | None = None
    worsening: bool | None = None
    new_unusual: bool | None = None
    fainted: bool | None = None
    emergency_features_absent: bool | None = None
    red_flags: list[RedFlag] = Field(default_factory=list)
    medicine_result: Literal["taken", "not_taken", "unknown"] | None = None
    due: bool | None = None
    dose_period: str | None = None
    access_barrier: bool | None = None
    refusal: bool | None = None
    adverse_effect: bool | None = None
    instruction_conflict: bool | None = None
    possible_dose_error: bool | None = None
    repeated_unknown: bool | None = None
    approved_medicine: bool | None = None
    clarification_failures: int = Field(default=0, ge=0, le=2)


class Assessment(StrictModel):
    tier: Tier | None
    reason: str
    question: str | None = None
    resume: bool = False
    new_event: bool = True
    review: bool = False


class Turn(StrictModel):
    turn_id: str = Field(min_length=1, max_length=120)
    text: str = Field(min_length=1, max_length=4000)
    consent: Literal["yes", "no", "ambiguous"] | None = None
    stop: bool = False
    end_call: bool = False
    advice: bool = False
    answers: dict[Literal["sleep", "medicine", "feeling", "anything"], str] = Field(
        default_factory=dict
    )
    medicine_result: Literal["taken", "not_taken", "unknown"] | None = None
    concerns: list[Facts] = Field(default_factory=list, max_length=5)


class Alert(StrictModel):
    id: str = Field(default_factory=uid)
    incident_id: str
    concern: Concern | Literal["CALL_CONNECTION"]
    tier: Tier | None = None
    assessment: Literal["pending", "complete"] = "pending"
    subject: Literal["elder", "other"] = "elder"
    quote: str | None = None
    actual_fall: bool | None = None
    reason: str
    created_at: datetime = Field(default_factory=now)
    handled_at: datetime | None = None
    handled_by: str | None = None
    notification_status: Literal["demo_recorded", "not_connected", "pending", "sent", "failed"] = (
        "demo_recorded"
    )
    revision: int = 1


class Leg(StrictModel):
    id: str = Field(default_factory=uid)
    kind: Literal["initial", "retry", "reconnect", "manual"]
    state: Literal["ringing", "connected", "no_answer", "failed", "dropped", "ended"] = "ringing"
    started_at: datetime = Field(default_factory=now)
    ended_at: datetime | None = None
    provider_agent_id: str | None = None
    channel: str | None = None


class CheckIn(StrictModel):
    id: str = Field(default_factory=uid)
    elder_id: str
    owner_id: str
    local_date: str
    created_at: datetime = Field(default_factory=now)
    ended_at: datetime | None = None
    state: Literal["ringing", "connected", "retry_scheduled", "reconnecting", "ended"] = "ringing"
    mode: Literal["CONSENT", "SCRIPT", "LISTEN", "EMERGENCY", "ENDING"] = "CONSENT"
    active_question: str | None = "consent"
    active_prompt: str | None = None
    answers: dict[str, str] = Field(default_factory=dict)
    medicine_result: Literal["taken", "not_taken", "unknown"] = "unknown"
    medicine_due: bool | None = None
    facts: dict[str, Facts] = Field(default_factory=dict)
    alerts: list[Alert] = Field(default_factory=list)
    transcript: list[dict[str, str]] = Field(default_factory=list)
    summary: str | None = None
    legs: list[Leg] = Field(default_factory=list)
    initial_attempts: int = 0
    reconnect_used: bool = False
    retry_at: datetime | None = None
    suspended_retry_at: datetime | None = None
    suspended_retry_state: str | None = None
    intentional_end: bool = False
    complete: bool = False
    emergency_latched: bool = False
    family: list[str] = Field(default_factory=list)
    family_joined_at: datetime | None = None
    farewell_asked: bool = False
    consent_clarifications: int = 0
    text_expired: bool = False
    processed_events: list[str] = Field(default_factory=list)
    processed_turns: dict[str, str] = Field(default_factory=dict)
    turn_hashes: dict[str, str] = Field(default_factory=dict)
    rtc_members: dict[str, int] = Field(default_factory=dict)


def day_status(call: CheckIn) -> str:
    if any(a.tier in ("significant", "emergency") and a.subject == "elder" for a in call.alerts):
        return "red"
    if (
        call.state != "ended"
        or not call.complete
        or call.medicine_result != "taken"
        or any(a.subject == "elder" and a.concern != "CALL_CONNECTION" for a in call.alerts)
    ):
        return "yellow"
    return "green"
