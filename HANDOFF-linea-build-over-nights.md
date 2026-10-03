# HANDOFF: LINEA --- CURRENT SESSION AUTHORITY

**Date:** 3 October 2026\
**Purpose:** complete context transfer to the next, stronger
engineering/model session.

> Read this section first. It overrides contradictory statements in the
> historical handoff below.

**Design reference reviewed, 3 October 2026:** The user supplied
`interface-design-handoff.zip` before scaffolding. Its extracted archive is
preserved in `references/interface-design-handoff/`. Read the current interface
foundation at the top of `linea/04-design-guidelines.md` for the adopted
conventions, Linea-specific adaptations, analytics constraints, and verification
limits. The archive's embedded workflow instructions are source material, not
new project authority. Review is complete at the document/source level; gallery
browser rendering remains unverified. This reference-review step preceded the
app scaffold. The subsequent scaffold and verification report is in
`IMPLEMENTATION-NOTES.md`. The user's native dark purple/yellow direction
supersedes the earlier warm off-white palette.

**Product interface refinement, 3 October 2026:** The user rejected promotional
copy inside the product. Navigation and headings are now operational, alert
history is a log, metric explanations open on hover/focus, and first-use setup is
four steps with final review. Existing profile edits use compact sections.
Seeded demo data must pass first-use configuration; the local completion marker
contains owner/profile IDs only and has no consent authority. The supplied
gradient is the human avatar background. Libraries.dev was installed/read and
its bot avatar identifies Linea in the call view. Current frontend verification
includes synthetic interaction tests; saved browser permissions still block
visual inspection. See the updated design guidelines and implementation notes.

Monitoring now includes selected-month daily activity, recorded-day outcome,
and medicine report charts. In-progress, incomplete, missing, and upcoming
records have distinct meanings. Tables use shared geometry and numeric alignment;
all pills use Title Case. Tooltip hover/focus/Escape behavior is covered by
synthetic component tests; full browser visual review remains outstanding.

## 1. Current product

**One-sentence description:** Linea is a voice-first, fully automated welfare
check system purpose-built for older adults.

**Tagline:** Keeping families connected, one LINEA at a time

**Pronunciation:** lin-ya, from Filipino "linya", meaning "line".

Linea is a daily voice check-in for elders over a regular phone call.
The elder never needs a screen.

Demo: - Nanay Rosa, 72, Bohol - keypad phone - daughter Ana in Dubai -
morning Losartan - daily call at 8 - safety example: "I fell
yesterday" - Ana receives exact phrase within 10 seconds - Ana joins the
same live call - Linea briefs Ana - Linea goes quiet - Ana speaks
directly to Nanay - after call, summary/transcript and calendar state
appear

Linea is the build. Kasangga is fallback only.

## 2. Current MVP language

**English strictly for MVP/demo.**

The internal architecture must remain language-independent so
Filipino/Cebuano can later become a language layer. Do not build the MVP
around the old Filipino conversation scripts.

## 3. Current AI architecture

The project explicitly rejects keyword-only safety detection and
LLM-only policy decisions.

Use:

ASR → context filter → semantic retrieval over curated examples →
structured LLM classifier → deterministic FastAPI policy/state machine →
response

The classifier can identify: - intent - concern - subject - temporal
context - current status - severity language - functional impact -
recurrence - confidence

Retrieval improves classification but retrieval score never directly
changes state.

**AI interprets. FastAPI decides.**

The model must never be the authority for: - consent - safety tier -
medicine instructions - diagnosis - emergency policy - listen mode -
call lifecycle - calendar state

## 4. Consent --- LOCKED

First call asks for consent.

-   Clear yes → grant consent → continue directly into normal check-in
    in the same call.
-   Clear no → decline → politely end → notify family → stop future
    scheduled calls.
-   Ambiguous/silence/unrelated → clarify once or twice → never infer
    consent.
-   Store elder's own words and timestamp.
-   Classifier outputs `CONSENT_YES`, `CONSENT_NO`, or
    `CONSENT_AMBIGUOUS`; backend changes state.

## 5. Safety taxonomy --- LOCKED

MVP enabled: - FALL - BREATHING - CHEST_PAIN - DIZZINESS -
MEDICINE_NOT_TAKEN

Broader extensible taxonomy exists in the business-rules document.
Future items should be disabled for MVP.

Taxonomy is not policy. Policy is not response.

## 6. Safety severity --- LOCKED

Every concern uses context: - who experienced it - when it happened -
current status - severity language - functional impact - recurrence -
qualifiers - classifier confidence

Three response tiers:

### Routine

-   record
-   family alert
-   passive acknowledgement
-   clarify current state when useful
-   resume check-in
-   do not announce family notification

### Significant

-   record
-   family alert
-   explicitly tell elder family is being informed
-   resume check-in when safe

### Emergency

-   record immediately
-   immediate family alert
-   explicit escalation
-   fixed emergency script
-   no model improvisation
-   do not continue ordinary check-in

"Significant" means significant for family awareness, not a medical
diagnosis.

## 7. Non-emergency conversation --- LOCKED

For a statement like:

"I felt dizzy this morning, but I'm okay now."

Linea should: 1. acknowledge 2. ask a short current-state clarification
if useful 3. continue the interrupted check-in

Example:

"Thank you for telling me. Are you feeling okay now?"

"Yes."

"Okay. Let's continue."

Linea must never be dismissive.

## 8. Family notification transparency --- LOCKED

Middle ground:

-   Routine: notify family quietly.
-   Significant: notify family and explicitly tell elder.
-   Emergency: explicit escalation.

This is an MVP requirement, not a future feature. It is implemented as a
policy distinction, not a separate subsystem.

## 9. Family join --- LOCKED

Family join is an alert-response mechanism.

Flow: alert → join → token → browser joins → Linea briefing → listen
mode → family speaks directly to elder.

MVP does not support general family conversation with Linea.

Test-day finding: - telephony agent listens only to gateway UID - phone
still hears browser family member - this is acceptable

Listen mode must be enforced by FastAPI returning empty completions.
`think` alone is not sufficient.

Family departure is locked: when the last family member leaves and the elder
remains, Linea asks once whether there is anything else to share, then closes
naturally unless an unresolved safety concern needs attention. One family
member leaving while another remains does not end LISTEN. "Leave" removes
only that family member. "End call for everyone" is a separate explicit action
that intentionally ends the session and must not trigger automatic reconnection.

## 10. Retry --- LOCKED

Old docs said "no retry." That is obsolete.

Agreed 3 October 2026:
- Up to two initial automatic connection attempts for a scheduled check-in.
  One separate reconnection attempt is allowed after an established call drops.
- Retry fifteen minutes after the first unanswered/failed attempt ends.
- Notify family after the first failure, showing that a retry is scheduled.
- A successful manual call cancels the pending retry.
- No retry starts while another call for that elder is active.
- A failed second initial attempt exhausts the initial connection budget.
  An unanswered call does not qualify for the separate reconnection allowance.

Calendar precedence is locked: Red over Yellow over Green. A completed normal
retry can clear the missed-call outcome, with both attempts visible. Routine
concerns, medicine not taken/unknown, exhausted failures, and incomplete
check-ins are Yellow. Significant/Emergency events make the day Red even if
a later call succeeds. Pending retries show provisional Yellow with "Retry
scheduled". Marking an alert handled preserves the event and day history.
Unexpected disconnection is now locked: automatically reconnect once per
logical check-in, promptly after the old call is confirmed ended. Acknowledge
the interruption conversationally and continue from saved context. Preserve
consent, answers, unfinished topics, and safety events. An active emergency
continues its emergency response. An explicit request to end or a completed
goodbye does not trigger reconnection. If reconnection fails or drops again,
stop automatic redial, retain the partial record, and notify family. The
reconnection allowance does not reset on each new phone leg.

Do not implement the old "no retry" rule.

## 11. Audio/data --- LOCKED

-   No raw call audio storage for MVP.
-   Transcripts and structured events are stored.
-   Transcripts, summaries, and exact quotations in alerts: 90 days.
-   Structured call outcomes, medicine results, alert categories, handled
    status, and calendar history: one year.
-   Elder profile, contacts, and consent record: while the elder is enrolled.
-   After detailed text expires, show structured history without restoring
    the original quotation or transcript. Consent evidence is retained with
    the consent record while enrolled, not the entire first-call transcript.
-   Intro recording played during the call is out of MVP.
-   SMS is out of MVP.

## 12. Provider/test-day facts

Verified: - Agora web agent works. - Agora outbound call through Twilio
reaches Philippine mobile. - Browser can join live phone call and be
heard by phone. - `speak` works immediately and word-for-word. - `think`
does not reliably silence managed agent. - agent minutes used in testing
were single digits. - Cebuano and intro audio were not fully tested.

Provider MCPs may be used for infrastructure/setup if available, but
business logic stays in FastAPI.

## 13. Architecture

-   FastAPI: product brain
-   Agora: realtime voice runtime
-   Twilio: SIP telephony
-   Supabase: Postgres/Auth/RLS
-   Next.js: family web app
-   GPT-4.1 mini: primary model candidate
-   ARES/Azure: tested provider candidates; verify current exact
    configuration
-   UIDs: gateway 100, agent 111, family 2002+

## 14. MVP decisions completed; implementation verification remains

**Scaffold delivery update:** The family app, policy/API, local demo, database
schema, and provider boundaries are now present. See `IMPLEMENTATION-NOTES.md`
for the current feature map, startup commands, and verified results (68 backend
tests, 9 frontend checks, passing web build). This does not replace the policy
decisions below or claim live acceptance. The 22 provider/product acceptance
cases remain NOT RUN. Browser review was denied by browser permission policy.

Updated 3 October 2026 after the threshold discussion. The user agreed to
Routine after clarification for a recovered fall and to Routine only for
mild, familiar, fully resolved exertional breathlessness. The user then
authorized completing CHEST_PAIN, DIZZINESS, and MEDICINE_NOT_TAKEN using
the same reasoning, with non-linear conversations explicitly required.

The current detailed contract is `linea/02-business-rules.md`, sections
S-01 through S-09. It governs all five concerns, clarification, medicine
ambiguity, and cross-turn routing. `linea/policy-fixtures.yaml` supplies
expected examples; it is not a tested implementation.

Key completed decisions:
- Current actual chest pain gets a conservative Emergency response.
  Resolved recent chest pain is at least Significant; emergency-associated
  details in the episode still escalate even if the pain stops.
- A brief resolved isolated dizzy episode can be Routine after clarification.
  Persistence, recurrence, and a fully recovered faint are Significant;
  neurological, functional, fainting, or associated emergency features escalate.
- Isolated missed/uncertain Losartan is Routine for the demo; repeated
  omissions, access problems, or medication-safety concerns are Significant
  or Emergency according to their context. No dosing advice is permitted.
- State follows each concern across interruptions and corrections. Unknown
  is not negative; a short answer is bound to its actual question; specific
  emergency evidence outranks general reassurance and ordinary beats.

The product decisions in this closing pass are complete: safety thresholds,
non-linear dialogue, retries, calendar precedence, one reconnection after a
drop, family departure/end controls, retention, description, tagline, and
pronunciation. The current acceptance matrix is at the top of
`01-test-day-checklist.md`; all new acceptance cases are NOT RUN.

The packet is ready to guide implementation. This does not claim an app has
been built or clinically validated. Custom endpoint behavior, enforced silence,
disconnect detection, reconnect/teardown, provider data controls, and the
complete demo sequence still need implementation and live verification.

## 15. Execution-agent rules

-   Do not redesign.
-   Do not expand MVP.
-   Do not use LLM as safety authority.
-   Do not invent provider APIs.
-   Verify uncertain provider behavior.
-   Use provider MCPs when useful, without moving business logic into
    MCP.
-   Keep secrets out of docs/code.
-   Optimize for three clean demo runs.

------------------------------------------------------------------------

# HISTORICAL HANDOFF BELOW

The following was the earlier handoff document. It is retained because
it contains useful background, test history, competition context, and
source details. Where it conflicts with the current section above, the
current section wins.

# Handoff: Team KEIAS at Build Over Nights 2026, Agora Track

Written 3 October 2026, early morning Philippine time, for an agent
picking this up. Everything below was settled in one working session
with Keith between 27 September and 3 October 2026. Read it top to
bottom once, then open the docs folder.

## Who you are working with

Keith Ruezyl P. Tagarao, full stack and AI developer in Cebu, sole
developer at Ovanova Solar, leading Team KEIAS (five people, all
returning from their AWS Innovation Cup Cebu win). He thinks in products
and tests ideas hard before committing. How he likes to be written to:
plain short sentences, lead with the simple version and keep technical
rigor as a separate layer, no hype words, no em dashes or hyphens unless
needed, no one word punch lines, sentences that carry each other. When
he asks a question he wants the honest answer first, then the reasoning.
He organizes multi part questions under plain category labels with
dashed sub items. App builds follow his four doc structure: PRD,
Business Rules, Project Architecture, Design Guidelines.

## The competition

-   Build Over Nights 2026, run by AWS User Group Philippines, co
    organized with Agora, AWS Student User Group PH, WorkFlow PH and AWS
    UG e:Novators.
-   Build is 3 to 4 October 2026, a 12 hour build, at the AWS Office,
    15F and 21F Arthaland Century Pacific Tower, BGC, Taguig. Category
    champions present on 5 October at SMX, schedule unknown.
-   Team KEIAS competes in the Agora Track, Voice First, a champions
    track for six regional Innovation Cup winners. Team size max 5.
    Prize pool TBA.
-   Rules that matter: the primary interface must be conversational
    voice, built for people underserved by screens (low vision, low
    literacy, busy hands or eyes, language barriers). The subtraction
    test: if removing the voice layer leaves a working conventional app,
    the entry fails, with a 5 point penalty. Agora is the only required
    technology (Conversational AI Engine, SDK, MCP, Skills, any of
    them). Kiro and Quick are optional for this track. All members must
    have Agora Console accounts. Research and setup before the event are
    allowed, product code is not.
-   Semi final rubric: MVP and technical implementation 30 percent,
    problem and domain fit 25 (domains named: Climate, Education,
    Health), technology and automation judgment 25 (rewards simpler
    deterministic choices over flashy ones), innovation 15, pitch 5. Two
    minute pitch, two minute Q and A, written submission reviewed by
    judges for 90 minutes beforehand.
-   Grand final rubric for the top three: real world impact 30,
    deployment feasibility 25, scalability 20, innovation 15,
    presentation 10. Five minute pitch, five minute Q and A, live demo.
-   Submission form fields: project name, overview, target market, pain
    point with evidence, the how, strategic integration of Agora,
    sustainability and growth, video link, GitHub link, Play Store link
    or website URL.
-   Likely Agora people in the room: Derek Zheng (APAC DevRel lead) and
    Hennessy Vince Solis (Solutions Architect), both judged Agora's
    March 2026 Voice AI Hackathon in Manila.
-   Agora is not providing credits beyond the free tier (300 free
    Conversational AI minutes per account, 10,000 free RTC minutes a
    month).

## How the product was chosen

Many ideas were generated and stress tested against two tests. The
track's subtraction test, and the team's own "swap test": if Agora were
replaced with OpenAI's or Google's realtime voice API and the product is
not visibly worse, Agora is decoration. Agora wins where there are more
than two people in one live conversation, bad networks, noisy places,
phone calls to people with no app, or busy hands and eyes.

Rejected along the way, with reasons recorded: an AR teacher for kids
(fails the swap test), rebuilding their Innovation Cup project ResKiosk
(originality rule, offline principle conflicts with cloud voice), a
security guard push to talk team channel (subtraction test risk,
unscored domain), an AR simulated patient for nursing training (fails
subtraction in spirit, AR too heavy for 12 hours), a field copilot for
solar technicians (too narrow), farmers (no pull), emergency hotline and
doctor's line (too obvious, other teams will build them), disaster
responders (needs offline), a reading companion for kids (a feature, not
a product), adult literacy, speech therapy, and a hospital explanation
tool.

Two products survived and were fully documented:

1.  **Linea** (previously called Kasama), the daily phone check-in for
    elders with the family able to join the call. This is the build.
2.  **Kasangga**, a voice home rehab coach using on device pose
    detection (MediaPipe) with a therapist joining the session. Fully
    documented as the fallback, not being built.

## Linea, in one paragraph

Linea calls an elder every morning on the phone she already has,
including a basic keypad phone. It greets her by name in Filipino, asks
how she slept and whether she took her medicine, and listens. When
something sounds wrong it keeps her talking and alerts the family with
her exact words. A family member anywhere joins the same live call from
a web app, hears a ten second briefing from Linea, and takes over while
Linea goes quiet. The family sees a calendar of green, yellow and red
days. The elder never sees a screen. It is built for the millions of
Filipino elders in the provinces whose children work in Manila or
abroad.

Evidence used: 9.2 million Filipinos aged 60 and over in 2020, projected
to about 13 million by 2030 (PSA via CPD); 12 percent of older Filipinos
live alone and one in ten of their households has a member abroad (LSAHP
Wave 2); 2.19 million OFWs in 2024 (PSA); half of older persons'
households have no internet (LSAHP Wave 2); 67 percent of their
healthcare is out of pocket. All sources with links are in
`docs/evidence/sources.md`.

## Architecture in one paragraph

An Agora channel is opened per call. Agora's telephony gateway dials the
elder through a Twilio SIP trunk and her phone line becomes a channel
member (uid 100). The Agora Conversational AI agent (uid 111) is another
member. Our FastAPI server sits outside the channel as the agent's
language model endpoint: every sentence the elder says reaches our
server as a chat completion request, our server runs the rules first
(script beat, medicine logging, alert scan, no advice, emergency
script), then asks GPT-4.1 mini for one or two short sentences, returns
the text, and writes the turn to Supabase. Alerts go to the family as
web push. When the family member taps join, our server issues a token
and their browser joins the channel (uid 2002 and up); the phone hears
them because the gateway carries the channel mix. Our server calls
Agora's speak endpoint to brief them, then enforces listen mode by
returning empty replies. At the end our server calls leave, fetches
history, writes a summary and the day color. The family web app is
Next.js on Vercel.

## What was tested on 2 October and what it proved

-   Agora project named Linea exists, App ID
    `7ab960ee43524673ab868ef4bb60c636`. Conversational AI and telephony
    are available on the free plan with no request step. A RESTful API
    key exists (Key and Secret, in Keith's secret store; the base64 of
    it was pasted into the chat during setup, so it should be rotated
    after the event).
-   Twilio account upgraded. US number `+14236075541`. Elastic SIP Trunk
    with termination URI `linea-keias.pstn.twilio.com`, authenticated
    with a credential list (username `linea`), number assigned to the
    trunk, Philippines enabled in Voice Geo Permissions. Twilio SIP
    trunking to Philippine mobiles costs \$0.203 to \$0.290 per minute.
-   The number is imported in Agora's Phone Numbers page, pointing at
    the trunk on port 5060 TCP.
-   A throwaway published agent `linea-test` exists in the Console with
    pipeline id `0f3189af4d284270b7cd1c70560398cf`, using Agora's
    managed Deepgram nova-3, GPT-4.1 mini and MiniMax English voice.
-   B1 pass: the agent worked in a browser test from the Console.
-   B2 pass: an outbound call reached Keith's Philippine mobile
    (`+639997601161`), first through the Console's Outbound Campaigns
    tool with a one row CSV, then by REST `POST /call` with
    `pipeline_id`, `sip.rtc_uid` 100 and `sip.rtc_token`. Two way speech
    worked.
-   B3 pass: a browser joined channel `linea-b3` via webdemo.agora.io
    Basic Voice Call as uid 2002 while the phone call was live, and the
    phone heard the browser. The family join is real.
-   B4: the `speak` endpoint played a briefing word for word,
    immediately. A `think` hint alone did not silence the managed agent,
    so listen mode must be enforced by our backend returning empty
    replies.
-   Key finding: telephony agents subscribe to exactly one uid (the
    gateway), so the agent never hears the family member on a phone
    call. The phone still hears them. This is fine for the product.
-   Agent minutes used on test day were in the single digits. RTC audio
    showed 3 minutes.
-   Not run: Cebuano recognition (demo elder speaks Tagalog; Google
    Chirp 2 lists Cebuano and is the path later), intro audio on the
    call (cut unless a greeting audio field is found), hotspot test (do
    at the venue).

## Decisions locked

-   Linea is the build. Kasangga is the fallback and stays untouched.
-   MVP scope is in `docs/linea/05-mvp-lock.md` and wins over the PRD
    where they differ. Thirteen features, one user story (Nanay Rosa,
    72, Bohol, Losartan, daughter Ana in Dubai, alert phrase "nahulog
    ako kahapon").
-   Defaults chosen, overridable by 9 AM on build day: Azure Filipino
    neural voice `fil-PH-BlessicaNeural` at rate 0.9 (verify the voice
    name), ARES `fil-PH` recognition, GPT-4.1 mini behind our endpoint,
    backend on a teammate's laptop behind a Cloudflare Tunnel or ngrok
    with Render as fallback, Supabase Postgres, Next.js on Vercel, web
    push only (no SMS), current month calendar grid, uids 100 gateway,
    111 agent, 2002 and up family.
-   Out of scope by decision: intro audio on the call, SMS, retries,
    Bisaya, evening calls, inbound number, native apps, any screen for
    the elder.
-   Cost per elder per day at MVP rates is about \$1.20 to \$1.80 (four
    minute call, Twilio international termination). A Philippine local
    trunk partner is the roadmap item that brings it to pesos. Say this
    before judges ask.
-   Total team spend for the event is roughly \$27, mostly Twilio's \$20
    top up, which is refundable when the account is closed.

## The documents

All in `linea-docs.zip`, meant to be committed as `docs/` in the repo.

-   `README.md`, index, conventions, the decision.
-   `00-prerequisites-and-discovery.md`, setup, tests, evidence list,
    questions for organizers, team lanes, build day runbook.
-   `01-test-day-checklist.md`, the test day plan and section F with
    results.
-   `shared/agora-platform-reference.md`, exact Agora endpoints, request
    bodies, limits, costs, languages, confirmed findings.
-   `linea/00-vision.md`, the full product vision in three phases, what
    Linea never does, the moat.
-   `linea/01-prd.md`, requirements with evidence, scope tiers, 12 hour
    plan with cut lines, submission form draft.
-   `linea/02-business-rules.md`, rules marked code, prompt or policy;
    alert classes; consent; data; pricing.
-   `linea/03-architecture.md`, components, sequences, stack, confirmed
    Agora bodies, API contracts, data model, env vars, failure modes.
-   `linea/04-design-guidelines.md`, voice persona, Filipino scripts,
    elder accessibility, family web app, brand, pitch staging.
-   `linea/05-mvp-lock.md`, the exact scope being built and how the 12
    hours are run.
-   `evidence/sources.md`, every source.

Also produced: `linea-architecture.html`, an interactive diagram
published as a Claude artifact, and an earlier PDF pitch deck for both
products (superseded by the docs).

## Open items for build day

-   Hour zero: confirm the backend's public URL answers from the
    internet, confirm Conversational AI minutes under Usage (switch the
    dropdown from Interactive Live Streaming to Conversational AI
    Engine), paste the Agora bodies into config.
-   Hours one to two: build the custom LLM endpoint first and run tests
    B5 (every sentence reaches our server with a turn id) and B7 (empty
    replies silence the agent) against it.
-   Verify the Azure Filipino voice names and listen before committing.
-   Find the per session data retention opt out field in the Console, or
    ask the Agora engineer onsite.
-   Ask the Agora engineer whether a second phone leg can be added to a
    live channel, for relatives with no internet (a More time item).
-   Questions still owed to organizers: whether the Kiro and Quick line
    in the MVP criterion is scored against this track, whether Community
    counts as a domain, the exact build start and end, whether a website
    URL is accepted in place of a Play Store link, and the 5 October
    schedule at SMX.
-   After the event: rotate the Agora RESTful API key, close the Twilio
    account for the refund if the number is no longer needed.

## Things not to do

-   Do not add features to the MVP without writing them in
    `05-mvp-lock.md` first.
-   Do not build any visual fallback for the elder; she never has a
    screen.
-   Do not let the agent give medical advice; the rules are code, not
    prompts.
-   Do not leave agents running; call leave at call end, idle timeout
    60.
-   Do not use phone minutes for development; develop on in app channels
    and use the phone only for verification and the demo.
