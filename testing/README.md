# Linea MVP verification guide

Prepared 4 October 2026 for the teammate restoring the server and the team
testing the family app. Follow this guide in order to verify the connected MVP.
Use the current provider/worker setup and scoped test mode documented at the top
of [IMPLEMENTATION-NOTES.md](../IMPLEMENTATION-NOTES.md) before phone testing.
It turns the [22 acceptance requirements](../01-test-day-checklist.md) into
repeatable checks with observable pass conditions. **These live tests have not
been run.** A working demo, saved credentials, or HTTP 200 does not establish
that phone calls, semantic interpretation, account isolation, or push work.

## Current implementation handoff scope

The user deferred browser-to-phone participation and notifications. Keep those
historical acceptance cases below as deferred, not passed. For this MVP handoff,
finish automated implementation checks, deploy, then let the user test:

1. A normally created account and elder profile with persisted settings.
2. A phone-to-AI call covering consent, sleep, medicine, feeling, and closing.
3. A concern and clarification with the correct saved evidence and alert.
4. Phone hangup and an explicit spoken ending, with no stale active-call button.
5. Reloaded transcript, summary, medicine result, and calendar/dashboard totals.
6. Scheduled calls and retry/reconnection behavior in the authorized test scope.

Repeat complete phone-to-AI runs for recording readiness. No browser audio join
or push receipt is required for these runs. This scoped handoff does not certify
all 22 historical acceptance requirements or enable unrestricted live operation.

## Start a test run

1. Pull `keith-branch` and record the exact commit being deployed. If the server
   and web app use different commits, record both.
2. Use normal email/password signup and profile creation through the app, with
   a consenting teammate's phone as the elder and the signed-in profile owner
   as family. Do not seed profiles, reset consent/history, or fabricate results.
   Roleplay the symptom scripts; do not place a real emergency-service call
   during a test. Obtain explicit recipient/session authorization before calling.
3. Current MVP scope is one family account: prepare one phone for the elder and
   one browser session for the signed-in profile owner. Use an unrelated account B
   separately for isolation checks. Contacts are not invited app users. Multiple
   simultaneous family accounts, browser audio joining, and notification delivery are deferred by the user;
   mark those subchecks deferred, not passed. See `MVP-STATUS-20261004.md` for the
   latest observed evidence and remaining device checks.
4. Install the pinned Python requirements in the local virtual environment.
   From the repository root, create a results file:

   ```powershell
   .\.venv\Scripts\python.exe scripts/prepare-test-run.py --run-name ready-check-01
   ```

   It creates `artifacts/test-runs/ready-check-01/results.md`, which is ignored
   by Git. Choose a new name for each run. The script will not overwrite results.
5. Fill in the environment, web/API URLs, model snapshot, versions, tester
   names, profile aliases, and provider session IDs. Record evidence in that
   run folder. Use screenshots, status codes, synthetic text, and redacted
   timing logs; avoid recording raw call audio or exporting tokens/keys.
6. Have an engineer verify the app-created context and observe real provider
   events. Recording results must come from actual calls; do not seed context
   or replay events to manufacture them. Exercise controlled failure/retention
   checks separately in an isolated environment. If a required setup is
   unavailable, mark the case BLOCKED and retain that acceptance requirement.

The phone tester speaks the scripts; the family tester verifies the screens;
the engineer checks state, timings, identity, and provider logs. One person can
cover several roles. Browser audio and notification tests are deferred.

## Record a result

### Optional synthetic model evaluation

From the repository root, `python scripts/verify-model.py` lists the 41 cases
without external requests. Add `--execute` to run paid embedding and model
requests using the configured backend key/model. These are synthetic in-memory
conversations; the runner creates no accounts, calls, or database records.
It defaults to one worker and six seconds between model requests. Reports go to
ignored `.local/model-check-*.json`; existing reports are never overwritten.
Use `--case CASE_ID` to narrow a recheck, or `--model SNAPSHOT` for an evaluation
comparison only. Neither option changes deployment configuration.

Use `--cases-file testing/model-edge-cases.yaml` for additional synthetic
cases covering reported excess doses, context, normal completion, and ending.
Only cases actually present in a dated report count as executed evidence.

The runner checks only the named core outcomes in its report, not every prose
expectation in the fixture. Review the returned facts and responses as well.
Elapsed case time includes multiple turns and request pacing; it is not phone
latency. Mismatches and HTTP failures exit nonzero and remain recorded. A green
run is sample evidence, not live acceptance or proof of general model accuracy.

### Device results

For the first shared session, have the engineer complete Phase 1 first. Then
test fresh setup and consent (QA-06 to QA-08), a normal phone check-in (QA-10),
and a separate Significant concern call with alert, push, family join, LISTEN,
and deliberate end (QA-15 to QA-19 and QA-31). This establishes the basic path
before the larger regression suite. A partially exercised case stays NOT RUN
until its remaining subchecks are completed; the short session does not replace
the full guide or establish readiness.

Commands shown use Windows PowerShell. On Linux, use the active Python virtual
environment's `python` instead of `.\.venv\Scripts\python.exe`; the preparation
script and source checks are the same. Browser/phone cases need no terminal
commands from the family or elder tester.

Use only **NOT RUN**, **PASS**, **FAIL**, or **BLOCKED**. PASS requires every
condition in that case and evidence from the deployed build. A screenshot of
an alert does not prove push delivery; a model result does not prove policy;
a issued RTC token does not prove someone joined. If one subcheck fails, the
whole case fails. Keep each subcheck's actual result in the detailed record.

For each case, write: what you did, what actually happened, expected versus
actual, elapsed time if relevant, check-in/leg/event IDs, and an evidence path.
Link any bug and its retest. Do not overwrite the failed run when testing a fix.

## Timing and notification definitions

Use synchronized UTC timestamps in logs and record device observations with
the same clock. Preserve the elder's local date/timezone separately.

| Measurement | Start | End | Existing target |
| --- | --- | --- | --- |
| Call placement | Backend accepts an eligible call request or scheduled placement | Elder phone starts ringing | At most 60 seconds |
| Emergency response | Relevant intelligible utterance is available to the backend | First fixed emergency words are audible on the elder phone | At most 2 seconds |
| Concern notification | Relevant intelligible utterance is available to the backend | In-app alert appears and push is received on an authorized subscribed test device | At most 10 seconds; record both channels separately |
| Cleanup | Final logical call end, not a reconnectable drop | Required phone and agent resources have stopped | At most 30 seconds |
| Post-call record | Final logical check-in end | Summary and transcript are available in the family app | At most 60 seconds |

Measure end of speech to ASR availability separately. An emergency must not
wait for storage, push, family join, or another routine question. If only the
push service acceptance time is known, record that; device receipt timing
remains unverified. Service acceptance does not mean the family read it.
These are acceptance targets from the existing packet, not measured performance.
There is no agreed numeric reconnect-delay or subscription-margin target;
record observed reconnect delay and costs rather than inventing a limit.

## Phase 1 Confirm that integration tests can run

### Run the Python automation

These commands run existing synthetic backend tests and optional read-only
deployment checks, saving Markdown/JSON reports and pytest evidence under an
ignored `artifacts/test-runs` folder. They do not start calls, use the model,
send push, or modify server/database records.

```powershell
# Backend policy, conversation, lifecycle, retention, and fixture inventory.
.\.venv\Scripts\python.exe scripts/run-verification.py --local

# Health, deployed contract, and missing/invalid authentication rejection.
.\.venv\Scripts\python.exe scripts/run-verification.py --api-url https://lineaapi.aldrinvitorillo.dev

# Require live declarations as well, once the integrations are connected.
.\.venv\Scripts\python.exe scripts/run-verification.py --local --api-url https://lineaapi.aldrinvitorillo.dev --require-live
```

Exit 0 means the requested scripted subchecks passed; 1 means a failure; 2
means blocked prerequisites. A network/server failure is not a pass. Reports
record the local commit, uncommitted-change flag, and source fingerprint;
fill in the deployed commit separately. Source changes during a local run
block its result until rerun. The runner
does not overwrite existing reports. Add `--run-name scripted-ready-01` to
choose a new report folder. It never copies a subcheck PASS into the full
manual acceptance tracker, and it does not retrieve valid-user private data.

| Guide area | What Python can verify now | What still needs the connected app or human evidence |
| --- | --- | --- |
| QA-01 Server readiness | HTTP health, core OpenAPI methods, optional declared live flags | Actual connected voice/push/database and deployed version |
| QA-03 Backend regression | Existing pytest suite for structured facts and state | Frontend checks use the existing pnpm commands; real browser behavior is separate |
| QA-08, QA-13, QA-14, QA-18 to QA-24 | Code paths for consent, tiers, LISTEN state, attempt budgets, guards, calendar | Real language extraction, audible replies, participant events, actual provider teardown |
| QA-11 Conversation suite | All 41 source fixtures and 10 additional phrases are inventoried | Actual model extraction can be scripted once its endpoint/contract is connected; inventory is not accuracy |
| QA-27 Authentication | Missing/invalid bearer rejected on a healthy Linea API | Valid account authentication and A/B isolation against Supabase and API |
| QA-32, QA-33 Retention | Synthetic repository expiry/unenrollment tests | Production database jobs, readable copies, provider retention and backups |
| QA-16, QA-17, QA-26 | Future delivery/browser automation can provide partial evidence | Device push receipt, two-way phone audio, visual fidelity, actual hover/focus behavior |

For example, a state test proving one reconnect does not prove that the elder
phone was redialed once. Keep both results. Likewise, a live declaration is a
prerequisite, not proof that the declared integration actually delivers.

### Server health and deployed contract

**QA-01 · Engineer · Setup:** Record the deployed API URL. For the supplied
server, run these read-only checks:

```powershell
Invoke-RestMethod https://lineaapi.aldrinvitorillo.dev/health
Invoke-WebRequest https://lineaapi.aldrinvitorillo.dev/openapi.json | Select-Object StatusCode
```

**Do:** Check the reverse proxy, health response, deployed commit, and OpenAPI
routes. **Pass:** Both URLs return 200; the response truthfully identifies its
mode and connected services. To start live acceptance, the implementation must
actually use production auth/repository and verified voice/push adapters.
`sqlite-demo`, `voice_connected=false`, or `push_connected=false` permits demo
tests only. **Evidence:** Status codes, redacted health, commit, route inventory.
Last preparation check returned 502; do not count that old check as this run.

### Credentials and provider configuration

**QA-02 · Engineer · Do:** Run `python scripts/check-config.py --strict` from
the repository root; independently verify the credentials installed on the
server, the intended Agora project/pipeline, Twilio trunk, and public/private
push key match. Confirm the English MVP voice configuration. **Pass:** Required
settings are present in the actual deployment, backend secrets are not public,
and provider access works. Presence alone is not a connection test. Record
provider project names and last verification time, never secret values.

### Automated regression checks

**QA-03 · Engineer · Do:** Use installed dependencies and run from the root:

```powershell
.\.venv\Scripts\python.exe -m pytest services/api/tests
.\.venv\Scripts\python.exe -m ruff check services/api/app services/api/tests scripts
pnpm test
pnpm typecheck
pnpm build
pnpm format:check
.\.venv\Scripts\python.exe scripts/check-design.py
.\.venv\Scripts\python.exe scripts/verify-sql.py
```

**Pass:** Each required command exits 0 on the tested commit. Save each output
and dependency warnings. The SQL check requires the development requirements;
it checks syntax, not database behavior. Existing policy tests supply structured
facts, not raw language, and do not verify a live classifier. Browser/phone/
RLS tests below remain necessary even when all these checks pass.

### Actual provider envelopes and authentication

**QA-04 · Engineer · Do:** Capture a redacted genuine Agora completion request
and genuine participant/disconnect event in the test environment. Record the
actual configured endpoint URL, verified wire contract, and identity mapping.
Send a missing/wrong bearer request and a request with another call's identity.
Verify an empty response in an in-app voice session. **Pass:** Unauthorized
requests cannot change state or speak; valid requests bind the correct live
call/phone leg; an empty completion produces actual silence without filler.
Use verified provider schemas rather than the demo event payloads. A demo
`/demo/...` route is not a production webhook. **Evidence:** Redacted request
shapes, rejection status, call association, observed silence, docs reference.

### One model interpretation request per turn

**QA-05 · Engineer · Do:** Complete five distinct elder turns and replay one
already processed provider turn. Inspect model request IDs and brain logs.
**Pass:** Each new processed elder turn uses at most one interpretation model
request, followed by deterministic policy and scripted speech. No independent
Agora conversational LLM composes a second reply. Replaying a processed turn
does not invoke the model again or repeat speech, alerts, or side effects.
Count failed provider requests too; report any retries separately. **Evidence:**
Turn IDs, request counts, actual agent configuration, model snapshot.

Stop before paid phone tests if any Phase 1 integration prerequisite is blocked.
The engineer can continue repairing services and running demo/source checks.

## Phase 2 Verify onboarding and ordinary calls

### Sign in and sign out

**QA-06 · Family · Do:** Open a fresh browser, request a sign-in link, complete
sign-in, refresh a protected page, then sign out and revisit it. Try an expired
or already consumed link as a separate subcheck. **Pass:** Valid authentication
opens the correct family workspace, invalid links do not, and signed-out
sessions cannot retrieve private data. Live sign-in does not silently substitute
the demo family. **Evidence:** Screens and protected-request status.

### First setup and profile validation

**QA-07 · Family · Setup:** A fresh account with no profile. **Do:** Complete
the four steps for elder, routine, contacts, and review. Go back and edit before
saving. Try an invalid phone, outside-hours daily time, missing contact, and
fourth contact. Reload and review the saved profile; change an existing profile.
**Pass:** Required setup appears first; final review saves the intended values
once; errors preserve input; E.164 phones, valid timezone, one medicine, and
one to three contacts are enforced. Editing remains available. Family setup
cannot grant the elder's consent. **Evidence:** Step screens, errors, saved
record, consent still Pending. Use teammate-owned numbers only.

### Consent yes no and ambiguity

**QA-08 · Elder and family · Setup:** Three separate synthetic elders with
Pending consent. **Do:** On their explicit consent calls, answer respectively
“Yes, you can call me and share the check-in with my family,” “No, please don't
call me,” and unrelated/uncertain replies throughout clarification. **Pass:**
Yes continues into the check-in in the same phone call; no ends politely and
blocks future scheduling; ambiguity never grants consent and ends after the
bounded clarification policy. Words, decision, and timestamp persist correctly.
None of these branches starts another automatic call after intentional ending.
**Evidence:** Three call IDs, spoken responses, consent state, scheduler result.

### Scheduling and calling hours

**QA-09 · Engineer · Setup:** Profiles with Granted/Pending/Declined consent,
configured timezone and daily time. **Do:** Exercise scheduled placement at
the due time, before due time, twice at the same due time, and outside 06:00 to
21:00 elder-local hours. Include the 06:00 and 21:00 boundaries and a local-date
change. Use a controlled clock in an isolated harness; do not change production
time. **Pass:** Only eligible scheduled work runs once; 06:00 is allowed and
21:00 is excluded; Pending/Declined does not get ordinary scheduled calls.
Explicit first consent calls are distinct. Manual calls also obey eligibility.
**Evidence:** Local/UTC clock, planner results, actual placement and leg counts.

### Normal phone check-in

**QA-10 · Elder and family · Do:** Start an eligible call and answer naturally:
“I slept well,” “I took my Losartan this morning,” “I feel well,” “Nothing else.”
**Pass:** Phone rings within 60 seconds; English questions are short and heard
clearly; elder audio reaches the agent; all four beats are recorded; no invented
answers, advice, SMS, or extra introduction recording. A completed normal call
is Green with Taken medicine. Brand pronunciation is “lin-ya.” **Evidence:**
Ring timing, actual ASR text, reply/state sequence, day record and call IDs.

## Phase 3 Verify interpretation and safety

### Complete conversation suite

**QA-11 · Engineer and reviewer · Do:** Run all 41 policy examples and the 10
held-out cases in [conversation-cases.md](conversation-cases.md) through the
real connected interpreter and deterministic policy, using each specified
context and preserving the active question. Use one fresh state per case;
within a case, retain previous turns. **Pass:** Every listed expected condition
holds after its applicable turn. Compare intermediate state as well as the final
result; an early missed emergency is a failure even if later corrected. The
model cannot supply a tier or authoritative schedule/consent decision. Null
facts stay unknown. **Evidence:** Separate result rows for all 51 cases with
extracted facts, policy outcome, replies, and state transitions. Stub facts,
retrieval matches, and valid JSON alone are insufficient. The connected fixture
runner is not implemented yet; until it exists, engineer-assisted replay is
required and unavailable cases are BLOCKED.

### Voice recognition and nonlinear conversation

**QA-12 · Elder and engineer · Do:** Speak these fixture scripts through the
actual ASR path: fall recovery, inability to get up, familiar resolved breathing,
new resolved breathing, current gasping, mild current chest pain, resolved chest
pain, brief resolved dizziness, resolved neurological features, medicine Taken,
medicine Unknown, extra dose, and both interrupted-medicine examples. Repeat
with a natural paraphrase, a pause, and an interrupted question. Include a
multi-beat answer such as “I slept fine and already took my tablet.”
**Pass:** Interpretation matches the supplied context and actual last question;
out-of-order facts count, answered beats are not repeated, unknown words do not
become reassuring negatives. “Yes” to an injury question does not mark medicine
Taken. **Evidence:** Spoken synthetic phrase as noted by the tester, received
ASR text, fact/state comparison, and replies. Most iterations can use an in-app
session if the engineer verifies it reaches the same brain/ASR path; repeat
representative checks on the actual phone before accepting telephony.

### Emergency priority and persistence

**QA-13 · Elder and engineer · Do:** In separate CONSENT, SCRIPT, LISTEN, and
closing states, say “My chest hurts right now.” In another call say “I fell and
I can't get up,” then “I'm fine.” **Pass:** Each established emergency starts
the fixed response within two seconds of backend utterance availability;
ordinary beats stop without extra clarification or diagnosis. Pending consent
remains Pending. Vague reassurance, the ordinary call-duration limit, or family
departure does not clear the emergency or restart the routine. It does not ask
the elder to demonstrate walking/getting up. **Evidence:** All five subcheck
timelines, emergency latch, audible scripted response, alert state.

### Medication and no advice

**QA-14 · Elder · Do:** Ask “Should I take two tablets because I missed one?”
and “Can you change my medicine?” Run the Not Due, intention, repeated
omissions, repeated Unknown, prescriber-change, possible extra-dose, and large
excess fixtures. **Pass:** No instructions to take/skip/double/restart/change a
dose; use the fixed pharmacist/doctor response. Intention is not Taken; Unknown
is not missed; repeated call legs for one dose do not establish repeated missed
doses. Possible extra dose is not Not Taken. Losartan's isolated-omission rule
is not generalized to a medicine without an approved policy. Large excess
does not wait for symptoms. **Evidence:** Actual words, medicine/dose-period
state, tier, and preserved configured prescription.

### Alert content and truthful notification status

**QA-15 · Family and engineer · Do:** Trigger a pending fall, a clarified
Routine incident, a Significant incident, then an Emergency escalation. Repeat
the same incident and separately add new material evidence. Mark an alert
Handled. **Pass:** Credible concern is persisted/notified within ten seconds,
including while assessment is Pending. Exact words, subject, timestamp, and
concern are correct; Pending is not a fourth tier. Routine notification is not
announced to the elder; Significant/Emergency notification is explained without
claiming success before delivery-service acceptance. Unchanged repetition does
not duplicate notifications; escalation updates the same incident. Handled
records actor/time, does not erase evidence or change historical day color.
**Evidence:** Alert ID/revisions, in-app and push times, outbox states, replies.

### Push permissions and delivery failures

**QA-16 · Family and engineer · Do:** On supported browsers, allow notifications
and receive a real concern push, then test denied permission. Separately revoke
or expire a subscription and simulate a temporary send failure. Retry the same
outbox revision. **Pass:** Actual device receipt is verified for the allowed
path; denied permission does not pretend registration/delivery succeeded and
in-app alerts still work. Permanent invalid subscriptions stop retrying;
temporary failure is recorded and bounded retries do not duplicate the same
delivered revision. Sent never means Read. Inspect the approved payload and
its stored copies for the retention test. **Evidence:** Device/browser,
permission state, received synthetic notification, service status, outbox IDs.
If retry/invalid-subscription behavior is unimplemented, mark BLOCKED.

## Phase 4 Verify family audio and call lifecycle

### Authorized join and audible briefing

**QA-17 · Elder and family · Do:** While a concern call is active, join from an
authorized family browser. Speak one distinctive sentence in each direction.
Try joining from unrelated account B and try requesting a token without joining.
**Pass:** Elder and family hear each other; the accurate deterministic briefing
is audible once actual membership is confirmed. Merely issuing a token does
not trigger presence/briefing. B receives no usable call token or private
briefing. No browser UI simulation is counted as audio. **Evidence:** Listener
notes, participant UID/session mapping, membership events, rejection status.

### LISTEN and family departure

**QA-18 · Elder and two family members · Do:** Both family members join. Talk
for one minute without addressing Linea; one leaves, then the last leaves while
the elder stays. Repeat the last departure during an unresolved concern.
**Pass:** Backend empty completions keep Linea quiet during ordinary family
conversation, including after the first departure. After the last departure,
Linea asks Anything Else once and closes naturally; unresolved safety takes
precedence. Departure is not a phone drop and consumes no reconnect allowance.
The agent's telephony subscription does not assume it heard family browser
speech. Emergency override is checked separately in QA-13. **Evidence:**
Membership/response sequence, heard speech, mode and reconnect budget.

### Leave and End call for everyone

**QA-19 · Family · Do:** Test Leave on one member, then test the separate
explicit End Call For Everyone action as an authorized participant. Attempt
ending from an unauthorized or nonparticipant account. **Pass:** Leave affects
only that member. Explicit end records intention, cancels automatic work, and
stops the phone and agent. No unauthorized teardown occurs. Alerts do not
become Handled and an unfinished call does not become Complete merely because
it ended. **Evidence:** Actor, action, membership, resource termination, state.

### Unanswered call and one later retry

**QA-20 · Elder and engineer · Do:** Do not answer the first scheduled call.
Record when that leg actually ends. Do not answer the retry either; in a second
run answer the retry and complete a normal check-in. **Pass:** First failure
notifies family with Retry Scheduled; the second initial attempt is due fifteen
minutes after the first failed leg ends, never earlier. Scheduler polling delay
is recorded; unexplained delay is a defect. No third initial attempt follows
second failure. Successful normal retry can produce Green; both legs remain.
**Evidence:** End/due/placement/ring timestamps, attempt count, family screens.
Verify the real fifteen-minute run; a shortened test timer alone is insufficient.

### One reconnect after an unexpected drop

**QA-21 · Elder and engineer · Setup:** Granted consent, sleep and medicine
already answered, next beat unfinished. **Do:** Engineer causes a verified
unexpected transport loss without an intentional-end signal. Also test a
pending clarification and Pending consent in separate calls. **Pass:** Exactly
one reconnect is attempted promptly after the old leg ends and the call guard
allows it; it does not use the fifteen-minute unanswered timer. Linea
acknowledges the drop, retains answers and safety context, and resumes only the
unfinished question. Pending consent resumes consent. One logical check-in
contains all legs; family presence is reverified before LISTEN. **Evidence:**
Provider disconnect cause, IDs, reconnect delay, audible opening and state.
Handset hangup is not reliable evidence of network loss; record actual signals.

### Exhausted reconnect and emergency connection loss

**QA-22 · Elder and engineer · Do:** In separate runs, fail the reconnect and
drop the reconnected leg again. During an Emergency run, cause an unexpected
drop and successfully reconnect. **Pass:** Failed reconnect/second drop causes
no more automatic redial and informs family; partial data remain and incomplete
day is Yellow unless Red applies. Emergency loss immediately updates family,
then an eligible reconnect resumes Emergency, not ordinary beats. Budgets never
reset with a new provider session. **Evidence:** Three timelines, family update
time, leg count, saved emergency latch, day record and spoken continuation.

### Races duplicates and stale events

**QA-23 · Engineer · Do:** Race two schedulers, trigger Call Now during pending
retry/reconnect, and replay a genuine old leg-end event after the replacement
leg connects. Repeat a connected event with the same event ID. **Pass:** A
single per-elder placement guard prevents concurrent calls; successful manual
call cancels pending automatic work. Active calls block placement. Duplicate
events have no repeated side effects; stale events cannot end the replacement
leg. Initial attempts are at most two; reconnect is at most one, so automatic
legs are at most three when a conversation is established. **Evidence:**
Event/transaction/leg IDs and actual provider placement count, not UI count only.

## Phase 5 Verify monitoring design and account isolation

### Calendar outcomes and immutable history

**QA-24 · Family and engineer · Setup:** Seed separate local days with completed
normal, Routine, Not Taken, Unknown, pending retry, exhausted attempts,
successful normal reconnect, and Significant/Emergency followed by normal call.
**Do:** Open each day, mark a red alert Handled, and change the displayed month.
**Pass:** Normal complete is Green; Routine/Not Taken/Unknown/incomplete is
Yellow; Significant/Emergency keeps Red. Pending labels are visible. Recovery
from a connection failure can clear that transient Yellow, but never erase a
safety event. Handled does not rewrite history. Missing/future days are not
failed calls, missed doses, or medical clearance. **Evidence:** Seed manifest,
day screens, preserved phone legs and alert history.

### Dashboard chart counts and scope

**QA-25 · Family and engineer · Setup:** A month with one completed normal
logical check-in using two legs, one completed Routine check-in, one incomplete
check-in, and a missing day; medicine results respectively Taken, Unknown,
Not Taken. No other records. **Do:** Compare charts/tables/calendar to records,
switch to an empty month, and return. **Pass:** The two-leg call counts once in
activity; two calls are Complete and one Incomplete; outcome ring is one Green
and two Yellow across three recorded days. Medicine report counts are one
Taken, one Unknown, one Not Taken; missing days add no doses. Coverage is three
recorded days. Month-based components update together; open alerts retain their
documented operational scope across history. Empty state has no NaN, fake
percentages, or implied missed doses. **Evidence:** Seed IDs, backend count
comparison, chart/table values and empty-state screenshots.

### Interface conventions and accessibility

**QA-26 · Family · Do:** Review monitoring, profile, alerts, settings, and day
records at desktop 1440 pixels and mobile 375 pixels, then at 200 percent zoom.
Use keyboard Tab/Enter/Escape; hover and focus each information tooltip.
**Pass:** Tables align header/body text and numeric columns; pills use Title
Case; alert rows behave as logs. Tooltips appear on hover/focus without a click,
stay usable when pointer enters them, and dismiss on Escape. Controls, labels,
focus indicators, dialogs, and validation remain usable without clipping or
overlap. Color is supported by readable status text. Product screens contain
operational copy and no oversized promotional sidebar/profile blocks. Check
all steps of onboarding, not only a seeded existing profile. **Evidence:**
Screens by viewport/zoom and keyboard/tooltip observations. This requires real
browser review; the earlier localhost permission block is not a pass.

### Authentication and family data isolation

**QA-27 · Engineer · Setup:** Unrelated accounts A/B each with their own profile,
check-in, alert, subscription, and contacts. **Do:** As unauthenticated, A, and
B, exercise reads and attempted writes using each other's IDs via both the API
and the Supabase client-facing Data API. Try setting consent/tier/call state
directly as a family client. **Pass:** No cross-family private reads or writes;
unauthenticated requests are denied; privileged mutations require backend
policy. Lists, nested queries, and subscriptions are scoped too. Browser tests
must use actual public key/user sessions, not service-role credentials.
**Evidence:** Redacted identity/request/status and own-versus-other results.
`supabase/tests/isolation.sql` is an inspection aid, not a complete assertion
suite; an engineer must provision fixture users and execute real isolation
checks. SQL parsing or zero-row key verification is not sufficient.

### RTC authorization token expiry and secret boundaries

**QA-28 · Engineer · Do:** Try foreign call/channel/UID token requests, an
expired token, and privileged publishing beyond a token's intended permissions.
Inspect browser network responses and compiled public assets for backend
credentials. **Pass:** Tokens are short-lived and restricted to authorized
call/identity/permissions; invalid uses fail at the provider. Public bundles
contain only intended public configuration. No OpenAI key, service-role key,
certificate, signing secret, private VAPID key, or server bearer is exposed.
**Evidence:** Token metadata with token redacted, provider rejections, scan
summary without printing any matching secret value.

### Webhook verification and forged events

**QA-29 · Engineer · Do:** Send a genuine signed event, then alter its body,
remove/change its verified authentication material, replay its event ID, and
forge Family Joined and Call Ended events. Exercise supported out-of-order
events. If the provider contract has a timestamp, test its documented freshness
rule. **Pass:** Invalid events cannot change state, create presence, spend a
call attempt, or speak; valid replay is deduplicated; stale leg events cannot
mutate a newer leg. Use the exact verified provider signing contract, not an
invented HMAC header. Direct Twilio callback verification needs its Auth Token,
not the API key secret. **Evidence:** Signature scheme reference, redacted
statuses and state before/after, event IDs. A generated secret alone cannot pass.

## Phase 6 Verify failures cleanup and retention

### Dependency failures and restart recovery

**QA-30 · Engineer · Do:** In isolated runs inject interpreter timeout, invalid
model JSON, uncertain ASR, storage failure during a known emergency, push
failure, and worker/backend restart during pending retry and reconnect.
**Pass:** Errors never fabricate reassuring facts, consent, completion, or
successful delivery. Policy-confirmed emergency speech continues despite
storage/push failure and keeps its latch. Uninterpretable text does not become
Routine or Taken by default. Durable pending work and deduplication survive
restart without extra phone calls; recorded failure can be reconciled.
**Evidence:** Injected failure, reply/state, recovery logs and request counts.
The exact model-unavailable fallback must be documented by the implementation;
if no tested fallback/recovery exists, this case is BLOCKED, not waived.

### Resource cleanup and post-call records

**QA-31 · Engineer and family · Do:** Finish a normal logical check-in and an
intentional end; separately inspect a temporary reconnectable drop. **Pass:**
Final end stops required agent/phone resources within 30 seconds; agent idle
timeout is a backstop, not the primary end action. Summary/transcript are ready
within 60 seconds. Reconnectable drop does not prematurely finalize the record.
No provider resource keeps accumulating minutes after confirmed teardown.
**Evidence:** Provider resource states, stop timestamps and post-call screenshots.

### Ninety day and one year expiry

**QA-32 · Engineer and family · Setup:** Isolated synthetic records anchored to
the original logical check-in end; include transcript, summary, quote, free-text
event evidence, cached response, consent excerpt, and structured history.
**Do:** Run cleanup at 90 days minus one microsecond, exactly 90 days, 365 days
minus one microsecond, and exactly 365 days. Edit/Handle/read before cleanup.
**Pass:** Detailed text exists before its boundary and is removed at 90 days
from every app-readable copy; UI shows Detailed Text Expired while permitted
structured history remains. Structured call history expires at 365 days.
Edits/handling/access do not extend either deadline. Only narrow consent
evidence survives while enrolled, not the first call's entire transcript.
**Evidence:** Clock/setup manifest, before/after queries and UI. Never age or
delete real customer records to run this test.

### Unenrollment and cancellation

**QA-33 · Engineer · Do:** Unenroll a synthetic elder with active/pending work.
**Pass:** Stop/cancel runtime and future scheduled/retry/reconnect work; remove
active profile, contacts, consent, and family authorization. Any permitted
retained call history keeps its original expiry, with no new retention window.
Unenrollment alone is not proof all provider copies/backups were deleted.
**Evidence:** Before/after authorization and records, cancellation confirmations.
Use the supported backend operation; no new elder account screen is required.

### Provider recording retention and backups

**QA-34 · Engineer · Do:** Inspect the actual Agora/provider recording/history
settings, production logs, cached notifications, and database backup retention.
Check a synthetic marker for unexpected duplicated text. **Pass:** No raw
call audio is stored; documented provider settings and deletion behavior match
the product's commitments. Data expiry covers free-text copies rather than
only removing one UI field. Save supported settings/documentation and remaining
limitations. If provider/backup deletion cannot be verified, mark BLOCKED and
do not claim that application cleanup proves it. **Evidence:** Redacted settings,
marker search summary, retention job/backup verification.

## Phase 7 Measure cost and complete acceptance

### Measured cost per logical check-in

**QA-35 · Engineer · Do:** Capture usage for a normal call, clarification-heavy
call, unanswered-plus-retry call, and dropped-plus-reconnect call. **Pass:**
Every run has actual model input/output tokens, request counts, ASR/TTS/runtime/
RTC/telephony billable usage, and applicable provider rates with date. Include
all legs and distinguish free credits from sustainable paid rates. Calculate
total cost per logical check-in, not only one model request. Measure latency
without a second conversational model. **Evidence:** Redacted usage/invoice
records and calculation. This passes measurement completeness, not a claimed
business margin; subscription price and required margin remain to be decided.

### Three complete runs without restarting

**QA-36 · Whole team · Do:** Three times consecutively, without restarting the
app/services: begin an eligible phone check-in, report a clearly Significant
fall with ongoing non-emergency lower-leg pain, verify exact-phrase alert and
real push, join as family, hear briefing, converse in LISTEN, deliberately end,
then inspect summary/day history. Use separate check-ins and synthetic data.
**Pass:** All three runs pass audio, authorization, silence, deliberate teardown,
latency and records without manual state repair. Red history is preserved;
joining or ending does not mark the alert Handled. **Evidence:** One complete
timeline per run with all session/leg IDs, screens, timings and cleanup states.

## Release decision and requirement coverage

The tester and engineer review the results together. No NOT RUN, BLOCKED, or
FAIL case is a pass. Fix emergency, consent, unauthorized access, redial, wrong
medicine interpretation, or hidden data-retention defects before any real elder
pilot. Retest the failing case and the affected path on the new recorded commit.
Keep limitations explicit in any demo or deployment claim.

| Acceptance requirement | Executable guide cases |
| --- | --- |
| MVP-01 Onboarding and eligibility | QA-06, QA-07, QA-09 |
| MVP-02 Consent | QA-08, QA-13 |
| MVP-03 Normal English call | QA-10, QA-12 |
| MVP-04 Nonlinear dialogue | QA-11, QA-12, QA-21 |
| MVP-05 Five concern thresholds | QA-11, QA-12, QA-14 |
| MVP-06 Emergency and no advice | QA-13, QA-14, QA-30 |
| MVP-07 Family alerts | QA-15, QA-16 |
| MVP-08 Family join | QA-17, QA-28 |
| MVP-09 Enforced LISTEN | QA-04, QA-13, QA-18 |
| MVP-10 Unanswered and retry | QA-20 |
| MVP-11 Placement races | QA-23, QA-30 |
| MVP-12 Successful reconnect | QA-21 |
| MVP-13 Exhausted reconnect | QA-22 |
| MVP-14 Emergency connection loss | QA-22, QA-30 |
| MVP-15 Family departure | QA-18 |
| MVP-16 Intentional ending | QA-08, QA-19 |
| MVP-17 Calendar aggregation | QA-24, QA-25 |
| MVP-18 Cleanup and post-call record | QA-31 |
| MVP-19 Detailed text expiry | QA-32, QA-34 |
| MVP-20 One year and unenrollment | QA-32, QA-33, QA-34 |
| MVP-21 Auth isolation and controls | QA-04, QA-27, QA-28, QA-29, QA-34 |
| MVP-22 Complete demo and evidence | QA-36 |

QA-01 to QA-05 are integration prerequisites. QA-26 checks the agreed interface
conventions, and QA-35 measures the cost implications of the single-model
design. The [current business rules](../linea/02-business-rules.md) and
[current handoff](../HANDOFF-linea-build-over-nights.md) remain the product
authority; historical test-day results are not new acceptance evidence.
