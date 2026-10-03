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
  byte limit. Whitespace-only concern quotations cannot supply model evidence.
- Browser audio cancels pending joins when the call/leg changes or the page
  unmounts. A late token response, microphone publication, or join confirmation
  cannot restore joined controls after hangup. Old SDK callbacks cannot expire
  or disconnect a newer session. A newly joined microphone resets the mute UI;
  failed network teardown still closes the local microphone and clears presence.

## Verification and limits

The retained backend suite passed (165 cases, none skipped), including 13 real
PostgreSQL integration cases against an isolated local PostgreSQL 17 cluster.
Those tests applied all migrations and verified lease serialization, atomic
writes, manual versus automatic calling hours, cross-account row-level security,
notification leases, unenrollment, immutable expiry anchors, and access/cleanup
across detailed-text and structured-history expiry. No production data was used.
No SQL migrations changed in this patch. The web suite passed 39 cases, including
SDK cancellation and synthetic DOM tests for late join responses after call end
and mute state after rejoining. Type checking and the production web build passed.
These tests do not establish actual browser microphone permissions or phone audio.

An actual API-backed, in-memory synthetic conversation exercised consent, sleep,
medicine, feeling, and closing. It asked the missing medicine beat and completed
only after an explicit dose answer. Separate chest-pain, negation, and fall cases
produced the expected deterministic outcomes. No test accounts, calls or medical
records were inserted. Measured backend turns took about 1.4–3.4 seconds; this
does not establish the two-second audible emergency target or broad model accuracy.

Still requiring deployed/device evidence: the corrected complete four-beat call;
family browser microphone/playback and briefing/LISTEN; provider callback delivery;
push receipt and latency; actual scheduled retry/reconnection; phone/agent cleanup
under failures; provider recording/retention configuration; and three uninterrupted
full recording runs. Existing policy/RTC tests do not substitute for these checks.
Do not generate a live-acceptance file or claim all 22 requirements pass.

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
frontend, deploy/build the updated `apps/web` separately. In Settings, choose
Enable browser notifications and grant browser permission. Actual push receipt
still requires an alert and a subscribed device; saving a subscription is not proof.

Before the next phone test, watch:

```bash
sudo journalctl -u linea-api -u linea-voice -u linea-notifications -f -o cat
```
