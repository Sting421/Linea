# MVP implementation and evidence — 4 October 2026

## Current handoff

### Follow-up: failed interpretation and skipped medicine in the next phone test

The teammate's terminal confirmed the running symlink still targeted `1d66ce2`,
so the newly observed calls did not run the preceding handoff fixes. Both saved
calls copied the profile medicine name after the sleep answer; no dose answer was
reported. Preserve those historical records. The earlier completion flag is not
evidence of a complete four-beat check-in.

The interpreter evidence gate already rejects that copied answer. A second guard
now prevents a legacy/external drug-name answer from satisfying the medicine beat.
On interpretation failure, the bridge preserves the elder's exact report in a
pending connection alert and transcript, asks for a repeat without advancing the
question, and returns a normal completion response. Three consecutive failures
end the call as incomplete without withdrawing future-call consent or scheduling
a redial. Existing emergency behavior and family LISTEN silence are preserved.
Logs now expose exception class/upstream HTTP status without private message text.
Database/runtime failures can still return 503; this is not a blanket success mask.

Health now includes the configured release hash. The release updater verifies that
the restarted API reports its intended hash before declaring success, rolling back
on mismatch. No database migration is required.

Two real GPT-4.1 synthetic checks passed: a sleep answer led to the Biogesic dose
question, and mild lower-back pain was retained without silence, an invented fall,
or a severity label. This symptom alone is outside the five supported categories.
Retrieval timed out for the first sample; the configured fallback interpretation
still asked the medicine question. These checks made no calls or database writes.
Browser-audio reliability remains deferred; the reported brief join/disconnection
was observed on the old release and has not been revalidated on the current build.
The follow-up backend suite passed 202 tests, including the 13 PostgreSQL cases
and streaming/non-streaming interpretation-outage recovery. The updater passed
Bash syntax validation. No frontend files changed in this follow-up.

The user requested a bounded handoff so phone testing can resume. No further
feature expansion is part of this pass. Backend verification passed 195 tests,
including 13 PostgreSQL integration tests; frontend verification passed 41 tests,
type checking, and a production build. One existing Starlette deprecation warning
remains. These checks establish implementation behavior, not live acceptance.

This patch adds an explicit reported-large-excess/poisoning fact to the existing
policy, preserves unresolved assessment labels in the dashboard, stops repeated
clarification after its budget, and prevents a missing dose answer from being
treated as an established omission. No migrations or real test records were added.

Model evaluation is still imperfect. With the new fact, the configured mini model
passed 10/10 additional extraction cases but 39/41 core fixture cases: it inferred
an unreported medicine result and omitted a later chest-pain concern. The larger
GPT-4.1 comparison passed 40/41, missing an unnamed medicine's dose result. Its
subsequent extraction-description revision passed 40/41 core cases; all medicine
and emergency outcomes passed that sample. The remaining recovered-fall case
asked about other episode features and stayed pending, rather than returning the
fixture's expected Routine result. Its facts had no explicit absence of emergency
features. This conservative extra clarification is not being hidden as a pass.
Final comparison report: `.local/model-check-20261003T231433963494.json`.
These results must not be represented as full semantic acceptance. Existing
deployment model settings are unchanged. Earlier reports:
`.local/model-check-20261003T230710330968.json`,
`.local/model-check-20261003T230728631666.json`, and
`.local/model-check-20261003T230903856810.json` respectively.

The next step is deployment and a controlled phone-to-AI test using the checklist
in `testing/README.md`. Use the observed transcript and saved results to report
failures; do not rely on the app as a clinically validated monitoring service.
The sections below retain earlier work and evaluation history.

For the next controlled test, the recommended evaluated configuration is
`LINEA_SEMANTIC_MODEL=gpt-4.1-2025-04-14` in `/etc/linea/backend.env` before the
release updater restarts the API and worker. The updater preserves this setting;
pulling code alone does not switch an existing model. Model cost and phone latency
have not been accepted. No default or private environment was silently changed.
The additional normal-completion and ending fixtures are prepared but were not
executed in this bounded handoff; only the original ten edge cases were run.

The user chose one family account for this MVP. Separate family invitations,
shared-account provisioning, and independent family identities are excluded from
this pass. Browser family audio is implemented for the signed-in profile owner;
simultaneous sessions under the same account share a UID and are not supported.
Do not mark the older multi-member acceptance scenarios as passed.
The user subsequently deprioritized notifications. Existing push infrastructure
is retained, but further notification work and device-delivery acceptance are
deferred and do not block the next calling test.

Browser-to-phone participation is also excluded from this MVP pass. Browser
microphone/RTC joining and family briefing/LISTEN testing are deferred alongside
notification delivery. Existing code is retained. The implementation handoff
focuses on phone-to-AI check-ins, consent, semantic interpretation, persisted
records, scheduling/endings, and dashboard display. The user will perform live
phone testing after implementation and automated verification. Code tests do not
establish live acceptance.

## Observed phone result

At approximately 06:06–06:08 Asia/Manila, the user reported a full two-way phone
conversation. Supabase independently shows consent granted, elder and Linea turns,
a saved summary, an ended phone leg, and completed placement/teardown commands.
No raw audio was downloaded or stored. No provider callbacks were recorded;
authenticated provider polling and the completion bridge updated the lifecycle.

That attempt was marked complete but skipped the medicine beat: the classifier
copied the profile's medicine name into answers without a matching utterance.
Its saved dose result remained unknown. This does not pass all of MVP-03/04.
The original historical record is preserved, not rewritten to manufacture a pass.

## Changes in this patch

- Routine answer extraction now requires a nonempty exact quote from the latest
  elder utterance. Profile fields and retrieved examples cannot provide that
  evidence. A medicine name alone cannot complete the medicine beat: it needs
  an evidenced taken/not-taken/unknown dose result.
- The live OpenAI classifier now retrieves five related examples from the 41
  curated synthetic conversations using `text-embedding-3-small`, 256 dimensions.
  The corpus and its hash-checked index ship with the backend. Rebuild with
  `python scripts/build-curated-index.py` after corpus changes. This command
  makes one external batch embedding request using the configured OpenAI key.
- Each ordinary elder turn uses one embedding request plus the single structured
  interpretation request. No second conversational model is added. Elder query
  embeddings are not stored. Retrieval failure logs a generic diagnostic and
  continues structured interpretation; deterministic policy remains authoritative.
- Added notifications service and hourly retention service/timer. The push worker
  no longer depends on Agora, semantic model initialization, or voice acceptance.
  It requires enabled push and the three configured WEB_PUSH settings.
- Settings obtain the public push key from the authenticated backend, preventing
  stale frontend build keys. No private key is exposed. Scoped voice readiness is
  reported consistently with the signed-in account's calling capability.
- Added a release updater with preflight, dependency comparison, local index/key
  validation, and rollback. It preserves voice startup state, private configuration,
  and the separately configured speech file. It does not apply migrations or
  directly place calls. A running voice worker still performs normal scheduling.
- Teardown now attempts both phone hangup and agent leave even when the first
  provider request fails; unresolved cleanup remains retryable. Cancelled commands
  that never reached the provider become failed rather than indefinitely uncertain.
- Speech chunks also handle unbroken multibyte text without exceeding the provider
  byte limit. Concern quotations are now attached by the server from the exact
  received utterance, including short clarifications and the full 4,000-character
  input limit. This establishes provenance, not correctness of extracted facts.
- Concern-level medicine results use the same evidence gate as the main dose
  answer, preventing a duplicated unsupported/conflicting field from overriding
  the checked answer. Clarification questions now ask for missing facts instead
  of repeating an already answered recovery question.
- Browser audio cancels pending joins when the call/leg changes or the page
  unmounts. A late token response, microphone publication, or join confirmation
  cannot restore joined controls after hangup. Old SDK callbacks cannot expire
  or disconnect a newer session. A newly joined microphone resets the mute UI;
  failed network teardown still closes the local microphone and clears presence.
- Dashboard refreshes discard responses older than the latest applied result.
  Overlapping polls cannot restore an old active-call button after a newer ended
  state. Slow requests can still update the page while later polls are pending.
- Different concern types cannot overwrite each other's saved facts when the
  classifier reuses one incident ID. The additional concern receives a stable
  derived ID that can be reused on later turns. Medicine results are emitted
  once at the top level and copied into medicine concerns only after validation.
- Explicitly ending the current call preserves consent for future scheduled
  calls. Withdrawing future permission still sets consent to declined. Both
  suppress retries/reconnection and terminate the current session without
  marking incomplete work complete or resolving existing alerts.
- A latched emergency no longer ignores explicit ending/withdrawal requests.
  It uses a small structured control request, skips retrieval, and keeps its
  retained safety state. The request has a 1.5-second HTTP timeout; on model
  failure the fixed emergency behavior remains available. This does not prove
  the audible response target, and a failed interpretation cannot honor an
  unrecognized ending request. Normal phone hangup remains available.

## Verification and limits

The retained backend suite passed (186 cases, none skipped), including 13 real
PostgreSQL integration cases against an isolated local PostgreSQL 17 cluster.
Those tests applied all migrations and verified lease serialization, atomic
writes, manual versus automatic calling hours, cross-account row-level security,
notification leases, unenrollment, immutable expiry anchors, and access/cleanup
across detailed-text and structured-history expiry. No production data was used.
No SQL migrations changed in this patch. The web suite passed 40 cases, including
SDK cancellation and synthetic DOM tests for late join responses after call end
mute state after rejoining, and out-of-order dashboard refreshes. Type checking
and the production web build passed.
These tests do not establish actual browser microphone permissions or phone audio.

An actual API-backed, in-memory synthetic conversation exercised consent, sleep,
medicine, feeling, and closing. It asked the missing medicine beat and completed
only after an explicit dose answer. Separate chest-pain, negation, and fall cases
produced the expected deterministic outcomes. No test accounts, calls or medical
records were inserted. Measured backend turns took about 1.4–3.4 seconds; this
does not establish the two-second audible emergency target or broad model accuracy.

Ten additional held-out synthetic utterances were run through the real model and
retriever in memory. Observed severity, subject, medicine results, and scripted
responses matched the intended outcomes, but one dizziness episode initially
produced two alerts. The extraction instructions now keep associated red flags
inside their episode; the original utterance and two further phrasings subsequently
produced one emergency alert each. This is sample evidence, not proof of universal
deduplication or a pass for all 41 multi-turn fixtures. These runs created no real
accounts, calls, or Supabase records. Several emergency backend turns exceeded two
seconds (about 2.2–2.9 seconds); the two-second audible target is not achieved by
this evidence and still needs performance work and deployed measurement.

The full 41-case synthetic model evaluation subsequently exposed interpretation
errors that the earlier small sample did not reveal. Prompt/schema refinements
improved the results but have not established reliable passage of every case.
Examples include a short injury answer being confused with a dose answer and a
clarification failing to update its existing concern. Deterministic unit-test
success must not be presented as proof of model accuracy. The deployment model
has not been changed by evaluation-only comparisons.

A previous configured-model run (`gpt-4.1-mini-2025-04-14`) passed the runner's
core checks in 40/41 cases, with all expected severity outcomes matched. In
`chest_resolved_with_delayed_red_flags`, it gave the Emergency response but omitted
the separately required BREATHING concern record. This failure remains open.
The targeted injury/medicine and short-clarification rechecks passed after the
evidence-gate fix. Local synthetic report:
`.local/model-check-20261003T224751724389.json`.
An evaluation-only `gpt-4.1-2025-04-14` comparison also passed 40/41 core checks;
its remaining recovered-fall case stayed pending and asked about other episode
features rather than declaring Routine. It ran before the final dose-evidence
gate change and is not evidence for the configured/deployed model. Its local
report is `.local/model-check-20261003T224306290250.json`. No model was switched.

A grouped-concern schema experiment was removed after it introduced regressions
in the broader evaluation. Its targeted passes were insufficient to justify
shipping it. The retained changes keep the original concern-list format.
Four real API checks of the new emergency controls correctly distinguished
future-call withdrawal, ending only this call, reassurance, and refusing advice.
They took about 0.7–1.2 seconds each, excluding phone audio. Unit/runtime tests
also cover control-model failure and preservation of unresolved alerts/consent.
The browser reached the local sign-in and signup screens without a build error;
the browser session was signed out, so this does not verify authenticated screens.

The latest retained-schema full run passed 40/41 core cases, with no HTTP errors:
`.local/model-check-20261003T230416662877.json`. The previously missing breathing
record, fainting category, and isolated uncertain-dose cases passed this run.
However, `medicine_reported_large_excess` was classified Significant rather than
the required Emergency. This is an unresolved safety-interpretation failure and
blocks claiming MVP-05/06 complete. A prior targeted pass for the same utterance
does not cancel that failure. The model remains `gpt-4.1-mini-2025-04-14`; an
evaluation-only comparison of the abandoned grouped schema with GPT-4.1 also
failed four core cases and did not justify a model switch.

For the user's subsequent phone tests, still requiring deployed/device evidence:
the corrected complete four-beat call; provider callback delivery;
actual scheduled retry/reconnection; phone/agent cleanup
under failures; provider recording/retention configuration; and three uninterrupted
full recording runs. Existing policy/RTC tests do not substitute for these checks.
Do not generate a live-acceptance file or claim all 22 requirements pass.
Browser-to-phone participation and notification receipt/latency remain deferred
under the user's current scope and are not prerequisites for this handoff.

## Server deployment

Run from the server's existing Git checkout after ending test calls:

```bash
git fetch origin keith-branch
git show origin/keith-branch:deploy/update-backend.sh > /tmp/linea-update-backend.sh
sudo bash /tmp/linea-update-backend.sh origin/keith-branch
```

The optional `--enable-push` validates the installed public/private key pair and
starts the notifications service. Missing/mismatched keys stop the deployment
before services are stopped. Omitting it retains the previous push configuration.
The updater installs and enables the hourly retention timer; existing retention
rules remove only expired data. It leaves the frontend release separate.

For the local frontend, use this checkout's normal dev command. For a hosted
frontend, deploy/build the updated `apps/web` separately. Notification setup is
optional and deferred for this test; leave `--enable-push` off.

Before the next phone test, watch:

```bash
sudo journalctl -u linea-api -u linea-voice -f -o cat
```
