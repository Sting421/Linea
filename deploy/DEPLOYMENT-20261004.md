# API and worker deployment — 4 October 2026

Deployed commit: `311bd5e36f6a357384a05d34fd466f031eed3795` from `origin/keith-branch`.

Active API/worker release: `/opt/linea/current` → `/opt/linea/releases/311bd5e36f6a357384a05d34fd466f031eed3795`.
Installed `/opt/linea/ops/preflight-calling.py` matches the script from that commit.
The `manual_call_hours` migration was not reapplied. No migration command was run.
Existing frontend release was retained.

47 targeted API, voice runtime, lifecycle and preflight tests passed locally.
Locked backend dependencies match the previous release; hosted `pip check` passed.
Candidate runtime construction, speech-file access and journal access passed under the actual `linea` service identity.
Candidate health and HTTPS health passed. `linea-api` was restarted on the new release.
The private backend environment and previous preflight script were backed up on the host.

Provider configuration checks passed: configured semantic model access returned 200;
the configured outbound number is owned, voice-capable and associated with a SIP trunk;
English ARES and managed OpenAI TTS properties match the staged configuration;
non-mutating webhook HMAC and completion bearer probes passed.
The user confirmed the actual Agora notification Secret and enabled callback in this session.
Actual provider-originated callbacks and phone speech have not been tested by this deployment.

Updated preflight returned 0 before startup and after startup. It found one matching
private owner/profile scope and zero calls, provider agents, queued commands, callbacks,
retry/reconnection schedules, recovery files or due scheduler proposals. At 05:36
Asia/Manila the audit correctly reported outside automatic calling hours and manual
calls allowed at any time. Existing consent is pending, so the first call requests consent.

`linea-voice` was started after the checks passed. Both API and voice services are active.
The real worker wrote an advancing heartbeat, including `2026-10-03T21:36:29.549820+00:00`
(05:36:29 on 4 October, Asia/Singapore), measured at age 0.37 seconds.
No heartbeat, call record or acceptance result was fabricated.

The deployed dashboard handler evaluated against the real configured account records
reports `voice_connected=true`; profile scope, consent eligibility and no active call
were confirmed. This is an operator evaluation of the actual backend handler, not an
authenticated browser-session test. No call was placed. Browser and phone acceptance
remain untested. Global health correctly reports `voice_connected=false` because general
live acceptance remains gated while the configured account has scoped calling enabled.

Voice remains disabled for automatic startup on boot, consistent with a scoped session.
