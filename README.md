# Linea Build Packet

**Team KEIAS · Build Over Nights 2026 · Agora Track (Voice First)**\
**Regenerated:** 3 October 2026

This packet is the handoff and implementation basis for the next
engineering/model session.

## Runnable MVP scaffold

The workspace includes the family web app in `apps/web`, FastAPI policy/API
in `services/api`, a Supabase migration in `supabase`, contracts, and checks.
The local demo covers onboarding, monitoring summaries/charts, calendar/day
records, alerts, and simulated family call controls. The elder uses a regular
phone. Current design is native dark, purple/yellow, with soft raised/inset
surfaces and explicit status meanings.

Read `IMPLEMENTATION-NOTES.md` for the build report, local startup commands,
verification limits, and the remaining connection work. Provider calls, push,
semantic interpretation, production Auth/database isolation, and live acceptance
are still integration tasks. The backend refuses live mode while unconnected.

Quick checks:

```powershell
pnpm typecheck
pnpm test
pnpm build
cd services/api
..\..\.venv\Scripts\python.exe -m pytest
```

`pnpm dev` starts the family web app after the API is started separately.
Repository: [Sting421/Linea](https://github.com/Sting421/Linea).
Provider integration and live publishing remain follow-up work.

**Description:** Linea is a voice-first, fully automated welfare check system
purpose-built for older adults.

**Tagline:** Keeping families connected, one LINEA at a time

**Pronunciation:** lin-ya, from Filipino "linya", meaning "line".

## Authority

1.  `HANDOFF-linea-build-over-nights.md`
2.  `linea/05-mvp-lock.md`
3.  `linea/02-business-rules.md`
4.  `linea/03-architecture.md`
5.  remaining documents
6.  provider documentation when verifying current API behavior

## Important current decisions

-   Linea is the build. Kasangga is fallback only.
-   MVP conversation language is **English strictly**.
-   First-call consent is conversational and deterministic. A clear yes
    continues into the normal check-in in the same call.
-   Safety detection uses semantic meaning/context, not keyword-only
    rules.
-   AI interprets. FastAPI policy decides.
-   Safety tiers are **Routine / Significant / Emergency**.
-   Routine concerns are family-notified quietly.
-   Significant concerns are family-notified and Linea explicitly tells
    the elder.
-   Emergency concerns use fixed escalation behavior.
-   Five MVP concerns: FALL, BREATHING, CHEST_PAIN, DIZZINESS,
    MEDICINE_NOT_TAKEN.
-   Non-emergency concerns use a short clarification branch and then
    resume the check-in.
-   Family join is an alert-response mechanism, not general Linea
    conversation.
-   Listen mode is enforced by FastAPI returning empty completions.
-   Two initial automatic connection attempts: retry fifteen minutes after the first
    unanswered/failed attempt ends. Notify family after the first failure
    with the retry plan. A successful manual call cancels the pending retry;
    another active call blocks retry placement.
-   One separate automatic reconnection after an unexpected drop during a
    conversation. Acknowledge the drop, preserve state, and continue from the
    unfinished topic or active safety response. No repeated reconnection loop.
-   Calendar precedence is Red, then Yellow, then Green. A successful retry
    can clear the missed-call outcome; safety events remain visible. Pending
    retries show provisional Yellow with "Retry scheduled".
-   Raw call audio is not stored for MVP.
-   Detailed text (transcripts, summaries, and alert quotations) is retained
    for 90 days; structured history for one year; profiles, contacts, and
    consent records while enrolled.
-   Intro recording on the call is out of MVP.
-   SMS is out of MVP.
-   Business rules are code, not prompts.
-   The five concern thresholds and non-linear conversation rules are
    specified in `linea/02-business-rules.md` S-01 through S-09, with examples
    in `linea/policy-fixtures.yaml`. They are not implemented or live-tested yet.
-   The product decision pass is complete. The current acceptance matrix is
    at the top of `01-test-day-checklist.md`; its cases remain NOT RUN.

## Document map

-   `HANDOFF-linea-build-over-nights.md` --- complete session context
    and decisions
-   `00-prerequisites-and-discovery.md` --- setup and verification
-   `01-test-day-checklist.md` --- verified test results and regression
    checklist
-   `shared/agora-platform-reference.md` --- Agora/Twilio integration
    reference
-   `linea/00-vision.md` --- product vision
-   `linea/01-prd.md` --- product requirements
-   `linea/02-business-rules.md` --- deterministic behavior
-   `linea/03-architecture.md` --- system architecture
-   `linea/04-design-guidelines.md` --- voice and web UX
-   `references/interface-design-handoff/README.md` --- preserved design
    reference from the user's previous project; the current adaptation at the
    top of `linea/04-design-guidelines.md` governs its use in Linea
-   `linea/05-mvp-lock.md` --- exact MVP contract
-   `linea/agent-behavior.md` --- compact agent state contract
-   `linea/policy-fixtures.yaml` --- machine-readable policy seed
-   `evidence/sources.md` --- evidence inventory

## Engineering principle

**Build this. Do not redesign it.**

If a provider behavior is uncertain, verify it. Do not invent it.
