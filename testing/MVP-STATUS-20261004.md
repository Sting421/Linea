# MVP implementation and evidence — 4 October 2026

The user chose one family account for this MVP. Separate family invitations,
shared-account provisioning, and independent family identities are excluded from
this pass. Browser family audio is implemented for the signed-in profile owner;
simultaneous sessions under the same account share a UID and are not supported.
Do not mark the older multi-member acceptance scenarios as passed.
The user subsequently deprioritized notifications. Existing push infrastructure
is retained, but further notification work and device-delivery acceptance are
deferred and do not block the next calling test.

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
- Each elder turn uses one embedding request plus the existing single structured
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

## Verification and limits

The retained backend suite passed (175 cases, none skipped), including 13 real
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

The latest configured-model run (`gpt-4.1-mini-2025-04-14`) passed the runner's
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

Still requiring deployed/device evidence: the corrected complete four-beat call;
family browser microphone/playback and briefing/LISTEN; provider callback delivery;
actual scheduled retry/reconnection; phone/agent cleanup
under failures; provider recording/retention configuration; and three uninterrupted
full recording runs. Existing policy/RTC tests do not substitute for these checks.
Do not generate a live-acceptance file or claim all 22 requirements pass.
Push receipt and latency remain deferred under the user's current scope.

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
