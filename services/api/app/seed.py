from datetime import timedelta
from zoneinfo import ZoneInfo

from .models import Alert, CheckIn, Contact, Leg, Profile, now

DEMO_OWNER = "demo-ana"


def seed(repo):
    if repo.profiles():
        return
    p = Profile(
        id="rosa",
        owner_id=DEMO_OWNER,
        name="Rosa Santos",
        preferred_name="Nanay Rosa",
        phone="+639000000001",
        medicine="Losartan",
        contacts=[
            Contact(name="Ana Santos", relationship="Daughter", phone="+971500000001"),
            Contact(
                name="Lina Santos",
                relationship="Nearby sister",
                phone="+639000000002",
                nearby=True,
            ),
        ],
        consent="granted",
        consent_words="Yes, that is okay.",
        consent_at=now() - timedelta(days=27),
    )
    repo.save(p)
    local = (
        now().astimezone(ZoneInfo(p.timezone)).replace(hour=8, minute=0, second=0, microsecond=0)
    )
    for days in range(1, min(local.day, 25)):
        at = local - timedelta(days=days)
        c = CheckIn(
            id=f"demo-day-{days}",
            elder_id=p.id,
            owner_id=p.owner_id,
            local_date=at.date().isoformat(),
            created_at=at,
            ended_at=at + timedelta(minutes=5),
            state="ended",
            mode="ENDING",
            complete=True,
            medicine_result="taken",
            medicine_due=True,
            initial_attempts=1,
            answers={
                "sleep": "Slept well",
                "medicine": "Taken",
                "feeling": "Feeling well",
                "anything": "Nothing else",
            },
            legs=[
                Leg(
                    kind="initial",
                    state="ended",
                    started_at=at,
                    ended_at=at + timedelta(minutes=5),
                )
            ],
            summary="Nanay Rosa reported sleeping well and taking Losartan. No symptom concern was reported.",
            transcript=[
                {
                    "speaker": "elder",
                    "text": "I slept well and took my Losartan. I feel well today.",
                    "at": at.isoformat(),
                }
            ],
        )
        if days % 7 == 0:
            c.medicine_result = "not_taken"
            c.summary = "Nanay Rosa had not taken Losartan as of this check-in. A Routine notification was recorded for family."
            c.alerts.append(
                Alert(
                    incident_id=f"medicine:{at.date()}",
                    concern="MEDICINE_NOT_TAKEN",
                    tier="routine",
                    assessment="complete",
                    quote="I haven't taken it yet.",
                    reason="Not yet taken as of this call",
                    created_at=at,
                )
            )
        if days == 2:
            c.summary = "Nanay Rosa reported a fall with ongoing lower-leg pain. Family attention was requested."
            c.alerts.append(
                Alert(
                    incident_id="fall-demo-2",
                    concern="FALL",
                    tier="significant",
                    assessment="complete",
                    quote="I fell yesterday and my lower leg still aches.",
                    reason="Ongoing pain after a fall",
                    created_at=at,
                )
            )
        repo.save(c)
