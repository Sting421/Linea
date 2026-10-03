> **CURRENT OVERRIDE --- 3 October 2026:** Any older rules saying "no
> retry," Filipino-only conversation, or recorded intro on the first
> call are obsolete. Current rules are in this packet's handoff and
> `05-mvp-lock.md`.

# Current MVP safety policy

Updated 3 October 2026. This section replaces the historical safety,
medicine parsing, and conversation-routing rules below. FALL and BREATHING
boundaries were agreed with the user; the other three concerns were completed
under the user's instruction to finish them using the same approach.
The handoff delegates the detailed thresholds to this section.

These are product escalation rules, not a validated clinical triage protocol.
Routine is a notification tier, never a declaration of medical safety.
Public guidance informs emergency indicators; the tier mapping and conservative
fallbacks are Linea decisions. Sources are recorded in `../evidence/sources.md`.

## S-01. Facts before tiers

AI extracts structured facts from the conversation. FastAPI applies the rules.
Keep concern, response tier, and medicine result separate. One utterance may
contain several facts and several concerns.

Each concern tracks: subject, actual event versus near-event, event time,
current status, reported severity, functional impact, recurrence, associated
symptoms, supporting transcript spans, explicit corrections, and unresolved
questions. Missing facts stay unknown. Model confidence or retrieval similarity
must never determine a tier or supply a missing negative answer.

Evaluate Emergency first, then Significant, then Routine eligibility.
Only classify an event as Routine when its required facts are established.
Negation, hypothetical examples, third-party stories, and remote resolved
history do not become new elder incidents. An actual person currently needing
emergency help still receives the fixed emergency response; preserve who the
event concerns rather than attributing it to the elder.

## S-02. Response contract

| Tier | Family notification | Elder response | Normal check-in |
| --- | --- | --- | --- |
| Routine | Quiet alert with exact words | Acknowledge; clarify only missing relevant facts | Resume after clarification |
| Significant | Alert with exact words | Explicitly explain that family is being informed | Resume only when the concern no longer requires immediate attention |
| Emergency | Immediate alert with exact words | Fixed emergency script; no diagnosis or improvised advice | Stop ordinary beats |

Significant concerns that are ongoing, worsening, or unresolved keep the call
focused on clarification and connecting human help. A resolved concern or a
practical medicine-access issue can allow the check-in to continue after
notification. Family notification does not replace urgent professional help
where the rule calls for it. Never wait for a family join before delivering an
emergency response.

Claim notification was sent only after confirmed delivery to the relevant
delivery service; this does not mean the family read it. On failure, say Linea
is trying to reach them. Persistence and notification failures must not block
the emergency script.

## S-03. Clarification and uncertainty

- Acknowledge first. Ask one short question about a missing fact at a time.
  Start with present condition when it is unknown. Do not repeat facts already
  supplied or require the elder to demonstrate standing, walking, or breathing.
- A specific emergency report bypasses clarification. A later "I'm fine"
  cannot cancel it. Do not wait for a duration, pain score, or a second symptom
  when a sufficient emergency condition is already present.
- Pending clarification is an evidence state, not a fourth response tier.
  Persist and notify within the existing ten-second target once a credible
  concern is established; do not delay the initial alert until questions end.
  If no tier is established yet, send an explicitly pending-assessment alert
  with `tier=null`; acknowledge without announcing an escalation that has not
  been selected. This allows an eventual Routine result to remain quiet.
  Apply any already-established Significant/Emergency boundary immediately.
- An actual symptom with insufficient facts cannot be finalized as Routine.
  If clarification remains unresolved after its prompt budget, use Significant
  and label the uncertainty. Ongoing actual chest pain has the Emergency
  fallback defined below. An isolated uncertain medicine answer has its own
  Routine handling under S-08; its result remains unknown even after review.
- Allow at most two unanswered or inconclusive clarification prompts for the
  same missing fact. Do not count a new material fact as a failed answer.
  After that, preserve uncertainty and use the concern-specific fallback;
  unresolved symptoms require explicit family involvement. Isolated medicine
  uncertainty follows S-08. Do not loop or silently resume an unresolved
  symptom conversation.
- Silence, topic changes, interrupted questions, and low-confidence ASR are
  not negative symptom findings. Bare silence alone is not evidence of a
  collapse. When credible emergency words are intelligible, a low overall
  transcript confidence must not suppress their escalation.
- Timing words such as "earlier" and "yesterday" are not resolution rules.
  Ask when timing matters. Do not invent a general elapsed-time cutoff.
- For symptom recurrence, count distinct episodes rather than repeated
  mentions: two or more since the last completed check-in, or the elder's
  explicit report that the problem keeps recurring. If that time anchor is
  unavailable, clarify the pattern instead of inventing a lookback window.
  A previously assessed, unchanged remote history does not satisfy this rule.

## S-04. FALL

| Tier | Deterministic boundary |
| --- | --- |
| Routine | A fall or near-fall with recovery established: no reported ongoing pain/injury, new functional difficulty, repeated recent events, or emergency features after relevant clarification. A near-fall keeps `actual_fall=false`. |
| Significant | Ongoing non-emergency pain, a new functional concern short of an emergency, repeated recent falls/near-falls, or recovery still uncertain. |
| Emergency | Still unable to get up after the fall; possible head, neck, back, or hip injury in the unassessed episode; serious injury/severe disabling pain; or associated emergency features from another concern. |

"I fell yesterday, but I'm okay" is a Routine candidate, not an immediate
Routine assignment. "My leg still hurts" is at least Significant.
"I'm fine, but I can't get up" is Emergency. Ask about the existing situation,
not whether the elder can try getting up. Previously assessed remote history
with no new symptoms does not restart an emergency incident.

## S-05. BREATHING

| Tier | Deterministic boundary |
| --- | --- |
| Routine | Mild, familiar breathlessness following usual exertion, fully resolved, without change from the elder's stated usual pattern or reported emergency features. Clarify missing facts first. |
| Significant | New, unusual, persistent, worsening, or more frequent breathlessness without an established emergency feature. New/unusual episodes remain Significant even if resolved. |
| Emergency | Current inability to breathe, gasping/choking, inability to speak because of breathing difficulty, or breathlessness with chest tightness/heaviness, reported blue/grey appearance, or sudden confusion. Apply any other concern's emergency rule too. |

First question when needed: "Are you having trouble breathing right now?"
Do not infer normal breathing from the ability to complete a sentence.
Reported emergency features in the current/recent unassessed episode are not
cancelled just because the elder says it passed. Linea does not diagnose a
cause or instruct breathing exercises.

## S-06. CHEST_PAIN

| Tier | Deterministic boundary |
| --- | --- |
| Routine | No new symptomatic episode qualifies automatically. Remote, resolved history that was already assessed, with no recurrence or current concern, is context only; it does not create a fresh alert. |
| Significant | A recent chest-pain/discomfort episode has completely stopped, with no reported emergency-associated features in that episode. Also applies to recurrent episodes while currently symptom-free. Explicit family awareness and a fixed recommendation to obtain medical advice are required. |
| Emergency | Confirmed current chest pain/discomfort, even described as mild; or a current/recent unassessed episode with pressure/tightness/heaviness, spreading pain, breathlessness, sweating, nausea, faintness, or collapse. Do not downgrade such an episode merely because the pain stopped. |

Treating all confirmed current chest pain as Emergency is a conservative MVP
choice because Linea cannot reliably exclude serious causes by phone. It is
stricter than the public guidance's specific emergency combinations.

For "My chest hurt earlier", ask "Do you have any chest pain right now?"
if the answer is not already known. "My chest hurts" establishes a current
symptom and must not wait for that question. Figurative language, a negated
symptom, or a story about another person does not establish current elder pain.
Never accept "probably indigestion" or a guessed muscle strain as clearance.
Neither a familiar label nor an old diagnosis bypasses current emergency rules.

Examples: "It hurt this morning, but stopped; nothing else happened" is
Significant. "It stopped, but I was sweaty and breathless" is Emergency.
"It only hurts a little right now" is Emergency under the MVP fallback.

## S-07. DIZZINESS

| Tier | Deterministic boundary |
| --- | --- |
| Routine | One mild, brief episode, now fully resolved, without fainting, injury, new ongoing functional difficulty, recurrence/worsening, or associated emergency features. Do not infer a benign cause such as standing up quickly. |
| Significant | Persistent, recurrent, worsening, or activity-limiting dizziness without emergency features; or a faint with full recovery and no emergency circumstances. |
| Emergency | Sudden dizziness with new one-sided weakness/numbness, speech difficulty, face droop, sudden vision loss, severe unusual headache, or sudden inability to stand/walk; incomplete recovery after fainting; fainting during exertion or while lying down; fainting with serious injury or palpitations; or concurrent chest/breathing emergency features. |

First question when needed: "Are you still feeling dizzy now?"
Ask about a reported blackout without equating feeling faint with actually
losing consciousness. A fall is also evaluated under FALL, not hidden inside
the dizziness label. An inability to walk must be new, not a pre-existing
mobility limitation unrelated to this episode.
Persistent/recurrent dizziness and a recovered faint receive a fixed prompt
to obtain medical advice, in addition to explicit family notification:
"Please get medical advice about this episode."
Use the same fixed review prompt for non-emergency chest-pain episodes.

Recent sudden neurological features remain an emergency even if they stop;
do not translate "better now" into clearance. Public guidance specifically
calls for emergency help for stroke signs within the last 24 hours even after
resolution. That window is not permission to ignore an older unassessed report:
preserve it for prompt medical review and apply Emergency if symptoms recur,
remain present, or the time is uncertain. Linea never announces a diagnosis.

## S-08. MEDICINE_NOT_TAKEN

Medicine result and concern tier are independent. The medicine result remains
`taken`, `not_taken`, or `unknown`; store the reason and due-period separately.
Use the configured medicine and schedule, not an invented dosing timetable.

| Answer/context | Result and handling |
| --- | --- |
| Clear report that the listed dose was taken for this due-period | `taken`; no missed-dose concern by itself |
| "Not yet", "I forgot", or "I'll take it later" | `not_taken` as of the call, not a completed dose; distinguish pending from a confirmed missed scheduled dose |
| "Maybe", "I think so", "I can't remember", contradictory unreconciled answers, or unrelated "yes" | `unknown`; clarify once or twice without guessing |
| A dose taken yesterday or a different medicine | Does not establish today's listed dose; clarify the intended medicine/time |
| "My doctor told me to stop it" | Record the reported instruction and actual result; Significant profile reconciliation, not a non-adherence accusation; never tell the elder to restart |

| Tier | Deterministic boundary |
| --- | --- |
| Routine | Isolated `not_taken` or `unknown` for the MVP demo medicine (Losartan), without access barriers, repeated omissions, reported adverse effects, dosing-error concerns, or emergency symptoms. Quiet notification states the exact result and uncertainty. |
| Significant | Repeated omissions; out of medicine/cannot obtain it; difficulty taking it; refusal to continue; suspected adverse effects; conflicting instructions; or uncertainty involving possible extra/wrong doses. Explicitly notify family; route medication questions/errors to a pharmacist or clinician using fixed wording. |
| Emergency | Emergency symptoms under another concern, or a reported overdose/poisoning concern requiring immediate emergency help. A missed-dose count alone does not create Emergency for the demo medicine. |

For deterministic MVP handling, "repeated omissions" means two consecutive
scheduled doses of the same medicine explicitly reported/logged not taken,
or an explicit report of an ongoing pattern ("I haven't taken it for days").
Two calls about one dose count once. `Unknown` is not counted as missed;
unknown results on two consecutive due-periods prompt Significant human
reconciliation. These are product thresholds for family attention, not medical
claims about safe missed-dose counts, and require no trend-analysis feature.

If the configured dose is not yet due, record its pending status without
calling it a missed dose or sending a missed-dose alert. Access/refusal/error
concerns still apply before the dose is due. If due timing is unavailable,
say "not yet taken as of this call" rather than inventing a missed deadline.

The isolated-omission Routine rule is scoped to the Losartan demo. It must not
be generalized to insulin, seizure medicines, or other time-critical medicines.
For another/unknown medicine without an approved omission policy, use
Significant human medication review rather than inventing a threshold.

Possible extra/wrong doses are medication-safety exceptions, not evidence of
`not_taken`. Preserve the actual words and flag for immediate professional
advice even without symptoms. A reported large/unknown excess amount or
suspected poisoning uses the conservative Emergency fallback; do not calculate
a safe dose or wait for symptoms. This exception adds no sixth MVP concern
or medication-management feature.

Fixed no-advice response: "I can't advise you about doses. Please ask a
pharmacist or doctor."
Never instruct taking, skipping, doubling, restarting, or changing a medicine.
Never infer a symptom was caused by a missed dose. Evaluate both independently.

## S-09. Calls are not linear

The four beats are coverage goals, not a mandatory sequence of question/answer
pairs. Track the active question's subject and intent, unfinished beats,
clarification state, and each concern's evidence across turns.

1. Extract all facts, including answers supplied before a question is asked.
   Resolve pronouns and short replies against the actual conversational
   question, not merely `current_beat`. If the reference is unclear, clarify.
2. Update each concern independently. A medicine answer can coexist with a
   fall and a breathing concern. The highest required response takes priority.
3. Deliver emergency behavior immediately, including during consent, LISTEN,
   and closing. This does not grant consent, revive ordinary beats, or open
   general family conversation with Linea. On telephony, the agent hears the
   gateway/elder only; never assume it heard the family's browser speech.
4. Keep factual corrections and original evidence. A clear correction can
   revise a mistaken attribution, but vague reassurance cannot erase a
   specific red flag. Never silently delete an alert or mark it handled.
5. After a non-emergency branch, resume the unfinished beat when appropriate.
   If the elder already answered it, move to the next unfinished topic.
   Do not repeat the entire script or abandon an unresolved symptom.
6. Deduplicate by incident and dose due-period, not phrase text. New details
   update the incident; escalation or materially new information warrants an
   updated notification. A repeated sentence alone does not.
7. Emergency response stays active after an established red flag. A later
   material correction can be recorded for the family, but the bot must not
   medically clear the episode or autonomously restart ordinary check-in.

Example: while asking about medicine, the elder mentions a fall. Linea asks
whether they are hurt. "No, but I haven't taken the tablet" supplies a negative
injury answer and a separate `not_taken` fact. It does not prove all Routine
fall conditions. "Yes" alone answers the injury question, not medicine-taking.

These rules and `policy-fixtures.yaml` define expected behavior. The fixtures
are specification examples, not evidence that a running classifier or policy
engine has passed tests. Retention is defined below. The current acceptance
matrix is at the top of `../01-test-day-checklist.md`; it remains unexecuted.

---

## Current retry policy

Agreed 3 October 2026. A scheduled check-in has up to two initial automatic
connection attempts. After the first unanswered/failed attempt ends, schedule the second
for fifteen minutes later and notify family of the failure and retry plan.
A successful manual call cancels its pending retry. Never place a retry while
another call for the elder is active. Consent and calling-hours restrictions
still apply. A failed second initial attempt exhausts this placement budget.
Historical immediate-retry rules do not grant extra call attempts. The
separate allowance below applies only after a conversation was established.

## Unexpected disconnection and reconnection

Agreed 3 October 2026: make one automatic reconnection attempt after an
unexpected drop, acknowledge it conversationally, and continue the routine
from saved context. This is one reconnection per logical check-in, not per
drop or per provider session. It does not replenish the initial connection
budget. At most three automatic phone legs are possible: two initial
connection attempts and one reconnection if a conversation was established.

- Start reconnection promptly once the old phone leg is confirmed ended and
  no competing call is active; do not wait the unanswered-call fifteen minutes.
  Apply consent and calling-hours eligibility. Do not reconnect after an
  explicit request to stop, consent refusal/withdrawal, or an intentional close.
- An unexplained loss during an unfinished conversation is eligible for the
  single reconnection unless there is evidence of intentional termination.
  Silence by itself is not a disconnected call. Verify provider disconnect
  signals during implementation; do not claim network failure can always be
  distinguished from a handset hangup.
- Keep one logical check-in with separate phone-leg records. Restore consent,
  medicine results, active question, unfinished beats, clarification state,
  alerts, and evidence. Do not ask granted consent again or repeat answered
  beats. If consent was pending, resume consent rather than ordinary questions.
- Normal opening: "Nanay Rosa, it's Linea again. Our call got disconnected.
  We were talking about how you slept." Then ask only the next unanswered
  question. Adapt the recalled topic to saved facts; never invent a lost answer.
- A pending safety clarification takes precedence over the normal beat.
  An active Emergency resumes the fixed emergency response, not the routine.
  During a family handover, verify who is actually present before restoring
  LISTEN; old membership is not evidence that family joined the replacement leg.
  Apply the family-departure rules below if the last family member has left
  and the elder remains.
- Update the family call state to "Reconnecting". Immediately update an
  active Emergency alert when the connection is lost; do not wait for the
  reconnection outcome. No duplicate safety alert merely for a new phone leg.
- If the reconnection is unanswered, fails, or drops again, make no further
  automatic attempt for that check-in. Notify family that the check-in could
  not be completed and retain all partial data; a manual call remains available.
- A successful manual call cancels pending automatic reconnection, and an
  active manual call blocks it, just as with initial retries. Use a single
  per-elder call-placement guard so competing events cannot start two calls.
- While reconnecting, use provisional Yellow with "Reconnecting" unless Red
  already applies. Once the continued check-in finishes, aggregate the logical
  check-in normally: the drop alone need not keep it Yellow, but safety events
  still determine precedence. Failed/exhausted reconnection leaves an incomplete
  Yellow day unless Red applies. Preserve all phone legs in the day view.

## Family departure and intentional call ending

Agreed 3 October 2026:

- "Leave" removes only the acting family member's connection. If another
  family member remains, keep LISTEN and do not announce a return to the script.
- When the last family member leaves and the elder remains, Linea returns
  gently: "Nanay Rosa, it's just us again. Is there anything else you'd like
  to share?" Ask once, respond naturally, and close. Do not restart the routine
  or force all unfinished beats into this closing exchange.
- An unresolved safety concern takes precedence over the closing question.
  Continue its clarification/escalation; an active emergency does not become
  resolved because family left, nor does it trigger an automatic warm close.
- Family departure alone is not an elder disconnection and does not use the
  reconnection allowance. Confirm actual membership rather than assuming an
  issued token means a family member joined or a stale flag means they remain.
- "End call for everyone" is a separate, explicit action available to an
  authorized family participant. Record intentional termination and cancel
  pending retry/reconnection before ending the session. Stop the phone leg
  and agent; verify the provider's supported teardown sequence instead of
  assuming an agent leave necessarily ends every participant's connection.
- An explicit family end does not mark safety alerts handled or classify an
  unfinished check-in as complete. Preserve its events and partial answers,
  then apply calendar precedence. During an emergency, record who ended the
  session; the action is not a declaration that the emergency was resolved.

## Current calendar policy

Agreed 3 October 2026. Evaluate all attempts and safety events for the elder's
local calendar day. Apply Red before Yellow before Green.

| Outcome | Day status |
| --- | --- |
| Completed check-in, medicine taken, no concerns | Green |
| Failed first attempt, followed by a completed normal retry | Green; preserve both attempts in the day view |
| Routine concern, medicine not taken, or medicine unknown | Yellow with the reason |
| Both automatic attempts failed, or check-in remained incomplete | Yellow with the reason |
| Significant or Emergency concern occurred | Red, even if a later call completed normally |

While a retry is pending, display provisional Yellow with "Retry scheduled",
unless Red already applies. A successful retry can resolve the missed-call
outcome but does not erase safety events. All attempt results remain visible.
Marking an alert handled records that action without removing the event or
changing its historical day color. Colors describe recorded check-in outcomes,
not medical clearance. Historical low/medium/high severity mappings below
are superseded by the current Routine/Significant/Emergency policy.

---

## Current retention policy

Agreed 3 October 2026:

| Data | Retention |
| --- | --- |
| Transcripts, summaries, and exact quotations in alerts | 90 days |
| Structured call outcomes, medicine results, alert categories, handled status, calendar history | One year (365 days) |
| Elder profile, contacts, and consent record | While the elder remains enrolled |
| Raw call audio | Not stored |

- Anchor call-related expiry to the original logical check-in's end, not a
  later edit, regenerated summary, handled action, or replayed webhook. Related
  text copies follow the same expiry. Retention must not restart on access.
- Remove expired detailed text, including alert quotations and free-text
  evidence/context. Preserve only the permitted structured history until its
  own expiry. A retained event must not hide a transcript inside a JSON field.
- After 90 days the UI may say "Fall reported; family joined" from structured
  fields, but displays "Detailed text expired" instead of a quote, summary,
  or transcript. Green/Yellow/Red history remains until its one-year expiry.
- The consent record retains the elder's consent words, decision, and timestamp
  while enrolled. This is a narrow exception for consent evidence, not a reason
  to retain the full first-call transcript beyond 90 days.
- At unenrollment, remove the active profile, contacts, and consent record.
  Any retained call/event history remains subject to its original deadlines;
  unenrollment does not extend them. This requires backend lifecycle handling,
  not a new MVP export/delete screen.
- Apply expiry to server-readable copies, caches, and any persisted call text
  in diagnostics. Do not retain personal call text by copying it into the
  curated semantic-retrieval examples. Avoid logging raw call text by default.
- Verify provider retention/recording settings and backup deletion behavior
  during implementation. Application cleanup alone does not establish that
  provider copies were removed. Do not invent an Agora retention field or
  claim provider deletion has been verified.

The acceptance matrix covers expiry boundaries with synthetic dated data;
there is no need to wait 90 days to verify cleanup behavior. No retention job
or live provider configuration has been implemented in this documentation pass.

---

# Historical Linea Business Rules Document

The original rules below remain background material. S-01 through S-09 above
supersede conflicting keyword matching, severity mappings, advice, medicine
answers, clarification, and listen-mode behavior. Other current handoff/MVP
overrides still apply to language, consent, retries, SMS, audio, and retention.

Version 1.0, 1 October 2026. These rules are the behavior the system
must have regardless of what the language model does. Rules marked
**code** are implemented as deterministic checks in the backend, before
or around the model call. Rules marked **prompt** live in the system
message and are allowed to be soft. Rules marked **policy** are
decisions about the business that the build does not need to enforce on
the night.

## 1. Definitions

-   Elder: the person who receives the calls. Also "the subscriber's
    parent" in family facing text.
-   Family member: the account holder who pays, configures, and receives
    alerts. One or more per elder.
-   Contact: any person who receives alerts, including family members
    and a nearby relative or helper who has no account.
-   Check-in: one scheduled call and everything logged from it.
-   Alert: a backend event raised from the elder's words or from call
    outcomes, with a class and a severity.
-   Day color: green, yellow or red, computed from the check-in and its
    alerts.

## 2. Eligibility and consent

  -----------------------------------------------------------------------
  Rule                    Type                    Statement
  ----------------------- ----------------------- -----------------------
  C-01                    code                    No scheduled call is
                                                  placed until
                                                  `consent_status` is
                                                  `granted`. The first
                                                  call is a consent call
                                                  that may proceed to the
                                                  check-in only if
                                                  consent is given.

  C-02                    code                    Consent is recorded as
                                                  the elder's own words
                                                  on the first call,
                                                  stored as transcript
                                                  and timestamp. A family
                                                  member cannot grant
                                                  consent on the elder's
                                                  behalf in the MVP.

  C-03                    policy                  Where the elder lacks
                                                  capacity to consent, a
                                                  legal representative's
                                                  written consent is
                                                  required before
                                                  onboarding. Not built
                                                  in the MVP; the
                                                  onboarding copy says
                                                  so.

  C-04                    code                    If the elder says no to
                                                  consent, the call ends
                                                  politely, the family is
                                                  notified, and no
                                                  further calls are
                                                  scheduled until the
                                                  family changes the
                                                  status.

  C-05                    prompt                  The agent always says
                                                  what it is, an
                                                  automated companion set
                                                  up by the family, and
                                                  never implies it is a
                                                  person or a doctor.
  -----------------------------------------------------------------------

## 3. Calling rules

  -----------------------------------------------------------------------
  Rule                    Type                    Statement
  ----------------------- ----------------------- -----------------------
  L-01                    code                    One scheduled call per
                                                  elder per day at
                                                  `call_time`, in the
                                                  elder's time zone
                                                  (Asia/Manila).

  L-02                    code                    Calls are placed only
                                                  between 06:00 and 21:00
                                                  local time. A call time
                                                  outside this window is
                                                  rejected at setup.

  L-03                    code                    Unanswered or failed
                                                  call: mark the day
                                                  yellow with reason
                                                  `no_answer`, notify the
                                                  primary family member.
                                                  Retry once after 15
                                                  minutes is a More time
                                                  feature; MVP does not
                                                  retry.

  L-04                    code                    Maximum call duration
                                                  10 minutes when only
                                                  the elder and the agent
                                                  are in the call. The
                                                  limit is lifted while a
                                                  family member is in the
                                                  channel.

  L-05                    code                    The agent leaves the
                                                  channel (`leave`
                                                  endpoint) within 30
                                                  seconds of the call
                                                  ending.

  L-06                    code                    The first call plays
                                                  the family's recorded
                                                  intro before the agent
                                                  speaks; later calls do
                                                  not.

  L-07                    policy                  The caller ID shown is
                                                  the trunk number. The
                                                  family is told to save
                                                  it on the elder's phone
                                                  as "Linea".
  -----------------------------------------------------------------------

## 4. Conversation rules

  ------------------------------------------------------------------------
  Rule                  Type                  Statement
  --------------------- --------------------- ----------------------------
  V-01                  prompt                Script order: greeting by
                                              name, sleep, morning
                                              medicine, how are you
                                              feeling, anything else, warm
                                              close with the next call
                                              time.

  V-02                  prompt                The agent lets the elder
                                              talk. It does not rush back
                                              to the script while she is
                                              telling a story. It returns
                                              to unfinished beats once,
                                              then lets them go.

  V-03                  prompt                Short sentences. One
                                              question at a time. Repeat
                                              the question in simpler
                                              words if asked, or if there
                                              is no answer after the
                                              silence window.

  V-04                  code                  Language per elder: `fil-PH`
                                              default. Bisaya only if the
                                              account has
                                              `language=ceb-PH` and T3
                                              passed.

  V-05                  code                  Speech rate 0.85 to 0.9 of
                                              the vendor default.
                                              `silence_duration_ms` 1200.

  V-06                  prompt                The agent never discusses
                                              money, politics, religion or
                                              other family members'
                                              private matters. If raised,
                                              it listens, acknowledges,
                                              and moves on.

  V-07                  code                  The agent never gives
                                              medical advice. Advice
                                              intent is detected in code
                                              (see section 6) and answered
                                              with the fixed script in
                                              `04-design-guidelines.md`.

  V-08                  code                  The agent never changes,
                                              adds or interprets medicine.
                                              It only asks whether the
                                              listed medicine was taken.
  ------------------------------------------------------------------------

## 5. Medicine logging

  -----------------------------------------------------------------------
  Rule                    Type                    Statement
  ----------------------- ----------------------- -----------------------
  M-01                    code                    For each medicine due
                                                  at the call's time of
                                                  day, the backend
                                                  records `taken`,
                                                  `not_taken` or
                                                  `unknown`.

  M-02                    code                    `taken` requires an
                                                  affirmative answer
                                                  about the medicine
                                                  question. `not_taken`
                                                  requires a negative
                                                  answer. Anything else
                                                  is `unknown`.

  M-03                    code                    `not_taken` or
                                                  `unknown` makes the day
                                                  yellow and raises an
                                                  alert of class
                                                  `medicine` with
                                                  severity low.

  M-04                    prompt                  When medicine is not
                                                  taken, the agent says
                                                  gently that the family
                                                  will see it, and asks
                                                  if anything is making
                                                  it hard. It does not
                                                  instruct the elder to
                                                  take it now.
  -----------------------------------------------------------------------

## 6. Alert classes and triggers

Alert detection runs in code on every user transcript segment before the
model is called. Matching is on normalized text (lowercase, no
punctuation) for phrases in Filipino, Taglish and English. The list is
the starting set and is extended during testing.

  --------------------------------------------------------------------------------
  Class                Severity     Example         Agent behavior    Who is
                                    triggers                          alerted
                                    (Filipino,                        
                                    Taglish,                          
                                    English)                          
  -------------------- ------------ --------------- ----------------- ------------
  `fall`               high         nahulog,        Stay on the line, All contacts
                                    natumba,        ask if she is     
                                    nadapa, fell,   hurt now, keep    
                                    nahulog ako     her talking, no   
                                    kahapon         advice            

  `breathing`          emergency    hirap huminga,  Emergency script, All contacts
                                    hindi           read 911 and      
                                    makahinga,      nearest contact   
                                    nahihingal,                       
                                    cannot breathe                    

  `chest_pain`         emergency    masakit ang     Emergency script  All contacts
                                    dibdib, sakit                     
                                    sa dibdib,                        
                                    chest pain                        

  `dizzy_faint`        high         nahihilo, hilo, Ask her to sit,   All contacts
                                    nawalan ng      keep talking      
                                    malay, fainted                    

  `confusion`          high         hindi ko alam   Keep calm tone,   Primary and
                                    kung nasaan     alert             nearby
                                    ako,                              
                                    nakalimutan ko                    
                                    kung sino,                        
                                    agent detects                     
                                    repeated                          
                                    contradictory                     
                                    answers                           

  `pain_other`         medium       masakit,        Acknowledge, ask  Primary
                                    sumasakit,      where, log        
                                    hurts, with a                     
                                    body part                         

  `low_mood`           medium       malungkot,      Warm              Primary and
                                    nalulungkot,    acknowledgment,   nearby
                                    gusto ko nang   stay longer,      
                                    mamatay, ayoko  alert             
                                    na                                

  `medicine`           low          hindi ako       Log, gentle       Primary
                                    nakainom ng     acknowledgment    
                                    gamot, naubos                     
                                    na ang gamot                      

  `advice_requested`   low          pwede ko bang   Fixed no advice   Primary
                                    inumin, anong   script            
                                    gagawin ko sa,                    
                                    should I take                     

  `no_answer`          low          Call not        None              Primary
                                    answered or                       
                                    failed                            
  --------------------------------------------------------------------------------

Rules

  -----------------------------------------------------------------------
  Rule                    Type                    Statement
  ----------------------- ----------------------- -----------------------
  A-01                    code                    Any match raises an
                                                  alert within 10
                                                  seconds, containing the
                                                  exact transcript
                                                  segment, the class, the
                                                  severity, the time and
                                                  a join link.

  A-02                    code                    Emergency class alerts
                                                  go to all contacts by
                                                  push and SMS. High goes
                                                  to all contacts by
                                                  push, primary by SMS.
                                                  Medium and low go to
                                                  the primary by push.

  A-03                    code                    On emergency class, the
                                                  agent is instructed
                                                  (through `think`) to
                                                  deliver the emergency
                                                  script and stays on the
                                                  line until a family
                                                  member joins or the
                                                  elder ends the call.

  A-04                    code                    The day is red for any
                                                  high or emergency
                                                  alert, yellow for
                                                  medium or low, unless
                                                  already red.

  A-05                    code                    Alerts are never auto
                                                  resolved. A family
                                                  member marks them
                                                  handled in the web app.

  A-06                    code                    The `low_mood` class
                                                  with phrases indicating
                                                  self harm sets severity
                                                  to emergency and uses
                                                  the mental health
                                                  script, which reads the
                                                  national mental health
                                                  crisis line and keeps
                                                  the elder talking. The
                                                  agent never asks for
                                                  method or plan.
  -----------------------------------------------------------------------

## 7. Family join rules

  -----------------------------------------------------------------------
  Rule                    Type                    Statement
  ----------------------- ----------------------- -----------------------
  J-01                    code                    Only contacts with an
                                                  account can join.
                                                  Joining requires a
                                                  channel token issued by
                                                  our server for that
                                                  call only.

  J-02                    code                    On join, the backend
                                                  calls `speak` with a
                                                  briefing of at most 512
                                                  bytes, in the family
                                                  member's language,
                                                  listing the elder's
                                                  answers so far and any
                                                  alert.

  J-03                    code                    After the briefing, the
                                                  backend sets
                                                  `mode=listen` on the
                                                  call and the custom LLM
                                                  endpoint returns empty
                                                  replies for any turn
                                                  that does not address
                                                  "Linea" and has no
                                                  safety trigger. A
                                                  `think` instruction is
                                                  sent as a nudge, but
                                                  test B4 showed the
                                                  nudge alone does not
                                                  silence the agent, so
                                                  the backend rule is the
                                                  enforcement. On
                                                  telephony calls the
                                                  agent hears only the
                                                  elder's line, never the
                                                  family member.

  J-04                    prompt                  In listen mode the
                                                  agent does not
                                                  summarize, interject or
                                                  comfort. The family is
                                                  talking.

  J-05                    code                    When the family member
                                                  leaves, the agent asks
                                                  the elder once if there
                                                  is anything else, then
                                                  closes.
  -----------------------------------------------------------------------

## 8. Data rules

  -----------------------------------------------------------------------
  Rule                    Type                    Statement
  ----------------------- ----------------------- -----------------------
  D-01                    policy                  Health related
                                                  transcripts are
                                                  sensitive personal
                                                  information under the
                                                  Philippine Data Privacy
                                                  Act of 2012 (RA 10173).
                                                  Processing rests on the
                                                  elder's consent and the
                                                  family's account
                                                  agreement.

  D-02                    code                    Agora per session data
                                                  retention is opted out
                                                  in the agent
                                                  configuration
                                                  (**verify** the current
                                                  field in the Console).

  D-03                    code                    Transcripts and
                                                  summaries are kept 90
                                                  days by default, then
                                                  deleted. Alerts and day
                                                  colors are kept for one
                                                  year.

  D-04                    code                    Audio is not stored by
                                                  us. The intro recording
                                                  is stored, since the
                                                  family made it for this
                                                  purpose.

  D-05                    code                    A family member can
                                                  export and delete an
                                                  elder's data from the
                                                  web app. Deletion
                                                  removes transcripts,
                                                  summaries, alerts and
                                                  the profile within 24
                                                  hours.

  D-06                    code                    Access is per family
                                                  account. A contact
                                                  without an account
                                                  receives SMS alerts
                                                  only and sees nothing
                                                  else.

  D-07                    policy                  No data is shared with
                                                  LGUs, health centers or
                                                  insurers without a
                                                  separate, specific
                                                  consent.
  -----------------------------------------------------------------------

## 9. Pricing and billing

  -----------------------------------------------------------------------
  Rule                    Type                    Statement
  ----------------------- ----------------------- -----------------------
  P-01                    policy                  Billed to the family
                                                  per elder per month.
                                                  Price set after a
                                                  pilot, anchored to the
                                                  cost of roughly four
                                                  minutes of calling per
                                                  day plus a margin.

  P-02                    policy                  Fourteen day free
                                                  trial, card not
                                                  required.

  P-03                    policy                  A second elder on the
                                                  same account is
                                                  discounted.

  P-04                    policy                  LGU and health center
                                                  licenses are per
                                                  barangay or per
                                                  facility, priced later.

  P-05                    policy                  Cost floor at MVP
                                                  rates: Agora
                                                  Conversational AI about
                                                  \$0.10 per minute after
                                                  free minutes, plus
                                                  Twilio SIP trunking to
                                                  Philippine mobiles at
                                                  \$0.203 to \$0.290 per
                                                  minute, plus TTS vendor
                                                  charges. That is about
                                                  \$1.20 to \$1.80 per
                                                  elder per day for a
                                                  four minute call. A
                                                  Philippine local trunk
                                                  partner is the path to
                                                  a few pesos per call
                                                  and is the first
                                                  business conversation
                                                  after the event.
  -----------------------------------------------------------------------

## 10. Operating rules

  -----------------------------------------------------------------------
  Rule                    Type                    Statement
  ----------------------- ----------------------- -----------------------
  O-01                    code                    The scheduler runs
                                                  every minute and places
                                                  calls whose `call_time`
                                                  has arrived and whose
                                                  `consent_status` is
                                                  `granted` and whose day
                                                  has no completed
                                                  check-in yet.

  O-02                    code                    An agent that fails to
                                                  start (non 200 from
                                                  `join` or `call`) is
                                                  retried once
                                                  immediately, then the
                                                  day is yellow with
                                                  reason `system`.

  O-03                    code                    Agents are stopped with
                                                  `leave` on call end.
                                                  `idle_timeout` is set
                                                  to 60 as a backstop.

  O-04                    policy                  Support hours and the
                                                  family facing support
                                                  channel are decided
                                                  after the event.
  -----------------------------------------------------------------------

## 11. What the agent must never do

Written as rules so they can be tested.

-   Never diagnose, interpret symptoms, or suggest a cause.
-   Never tell the elder to take, skip, or change any medicine.
-   Never pretend to be a family member or a health worker.
-   Never ask for bank details, PINs, or any payment information.
-   Never discuss other family members' private matters.
-   Never end an emergency class call on its own.
-   Never speak faster than the configured rate or use long sentences.

## 12. Acceptance tests for the rules

  -----------------------------------------------------------------------
  Test                    Steps                   Expected
  ----------------------- ----------------------- -----------------------
  R-1                     Elder says "nahulog ako Alert class `fall`,
                          kahapon"                severity high, exact
                                                  phrase in the alert,
                                                  agent asks if she is
                                                  hurt now

  R-2                     Elder says "masakit ang Alert emergency,
                          dibdib ko"              emergency script
                                                  spoken, 911 read, SMS
                                                  to all contacts

  R-3                     Elder asks "pwede ko    Fixed no advice script,
                          bang inumin ang         alert
                          Biogesic linea ng gamot `advice_requested`
                          ko"                     

  R-4                     Elder says she did not  `not_taken` logged, day
                          take the medicine       yellow, gentle
                                                  acknowledgment, no
                                                  instruction

  R-5                     Family member joins     Briefing spoken, then
                                                  silence from the agent
                                                  while the family talks

  R-6                     Call not answered       Day yellow with
                                                  `no_answer`, primary
                                                  notified

  R-7                     First call, elder says  Call ends politely,
                          no                      family notified, no
                                                  further calls

  R-8                     Call runs past 10       Agent closes warmly and
                          minutes with no family  leaves
                          in channel              
  -----------------------------------------------------------------------
