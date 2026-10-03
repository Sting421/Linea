# Recording the actual MVP

Prepared 4 October 2026. Rehearsals are NOT RUN. A recording is partial evidence;
the full requirements in `README.md` and `01-test-day-checklist.md` still apply.

App: https://linea.aldrinvitorillo.dev. Frontend and API source commit:
`098e52a8a6e2ef44169f8446c200c82fbcc0c020`. Deployment/HTTP checks passed;
actual phone/browser features and both rehearsals remain NOT RUN.
English speech properties are staged but not tested on a phone. Agora Console
notification configuration/signing Secret still needs verification. At the
04:33 Manila/Singapore clock check, the profile was outside calling hours;
the earliest permitted call is 06:00 on 4 October, subject to fresh session
readiness and queue checks. Authorization includes policy retries/reconnection.

## Prerequisites

- Use the actual frontend URL, normal email/password signup, and the profile
  saved through the four-step app setup. Do not create admin/demo accounts, seed
  records, reset consent, or assign account/profile IDs in source code.
- Obtain explicit authorization for the teammate recipient and the test session:
  one normal check-in, then two complete concern/family-join rehearsals. Confirm
  whether policy-defined retries/reconnection are included. Record authorization
  privately, identifying the recipient by alias and number suffix in shared notes.
- Verify the normally created profile/owner relationship before setting the
  private scoped environment. Keep connected mode and the general live gate.
- Install Agora's actual notification Secret and outgoing telephony callback,
  plus verified English ASR/TTS properties. Preserve the existing SIP trunk.
- Inspect pending/inflight/uncertain commands, callbacks, active calls, journal
  recovery, and scheduler proposals immediately before worker start. Scope alone
  does not prevent scheduled calls to that profile. Schedule the session during
  the profile's true 06:00–21:00 local calling hours. Do not alter clocks/timezones
  or calling-hours checks to make a take possible.
  Run the read-only `scripts/preflight-calling.py` with the private backend
  environment and `--check-provider`; see `deploy/README.md`. A clean audit
  neither authorizes calls nor verifies the provider Secret or actual audio.
- Confirm a fresh voice-worker heartbeat and authenticated owner dashboard
  calling capability. Check that another account has no access. Global health
  may still report voice disconnected during scoped testing.
- Use separate phone and browser devices. Use headphones on the browser device,
  place devices apart, and avoid speakerphone feedback. Allow the site's microphone
  only when prompted for Join; check the browser's selected input and mute state.
  Test both directions with different spoken phrases, not a local playback test.
- Finish signup, profile/contact entry, and credentials before recording. The
  monitoring card displays the phone number: crop or mask private information in
  capture/editing. Never record Console secrets, environment files, tokens, auth
  links, email/password typing, or terminals displaying personal records.

## First verify the normal check-in

1. Sign in normally off-camera; open Monitoring and **Elder profile**. Verify the
   saved recipient, true timezone, routine and medicine without changing consent.
2. Return to Monitoring and click **Call now** once. Record request time and
   observed phone ringing time. Answer the actual phone and hear the AI greeting.
3. If consent is pending, answer the actual question: “Yes, I agree to daily
   check-ins and sharing them with my family.” If already granted, do not reset it.
4. Follow the questions in their actual order. Suggested roleplay answers:
   “I slept well”; “I took [the profile's listed medicine] for today's dose period”;
   “I feel well today”; “There is nothing else I want to share.” Do not claim an
   actual dose was taken unless that is true or clearly part of agreed roleplay.
5. Let the normal farewell finish. Verify phone hangup and agent shutdown. Open
   **Open day record**, expand **Conversation transcript**, and verify the actual
   summary, medicine result, and saved words. Refresh and verify persistence.
6. Record provider agent/phone-leg/check-in IDs privately and confirm that no
   active resources or queued retry/reconnection remain before the next call.

Do not proceed to a recording rehearsal if consent, conversational replies,
medicine interpretation, hangup, or persisted records fail.

## Concern and family join: rehearse twice

Repeat this sequence twice using the same normally created profile. Each call
must produce its own actual records. Keep earlier takes and consent intact.

| Sequence | Words or click | Expected observation to verify |
| --- | --- | --- |
| Sign in/profile | Show successful sign-in, then **Elder profile**; crop private fields | Existing app-created profile and retained consent |
| Placement | Monitoring → **Call now** once; teammate answers | Actual ringing and AI greeting; no simulator controls |
| Routine | Answer sleep and the actual listed-medicine question | Spoken responses and the correct medicine result |
| Concern | “I slipped and fell yesterday. My left shin still aches mildly. I can get up and walk normally. I did not hit my head, neck, back, or hip. I have no severe pain or serious injury. It happened once.” | Existing policy should assess the reported ongoing pain as Significant if facts are extracted correctly; answer any actual clarification truthfully within the roleplay |
| Alert | Owner opens Monitoring or Alerts; wait for actual update | Significant alert with the actual quotation, incident identity and time. If absent/wrong, stop and investigate; never force its tier |
| Enter call | Actual alert → **Join call**, then live page → **Join call**; allow microphone | Authorized RTC connection and audible AI briefing; token issuance alone is insufficient |
| Family audio | Owner: “Can you hear me clearly?” Phone: “Yes, I can hear you. Can you hear me?” | Both participants independently hear the other; AI finishes briefing and shows LISTEN |
| LISTEN | Continue a short ordinary family exchange | AI does not resume routine questions. Verify actual silence, not only a UI label |
| End | **End for everyone** → confirm **End call for everyone** | Phone disconnects, agent leaves, microphone closes; no unintended retry |
| Persisted results | **Open day record** → **Conversation transcript**; show summary, medicine and alert | Results match this call's actual words; joining/ending does not mark the alert handled |
| Persistence | Refresh the app; reopen the same day/call | Same call/leg/alert records remain in Supabase and the UI |

Pause the phone script at the concern while the owner joins. Do not finish the
“anything else” exchange first if it would end the call. Answer real clarification
questions as asked. A different actual outcome is a finding, not something to edit
into the desired result. Do not say “stop calling me” to end a take: that is a real
consent withdrawal. Use the owner-controlled End for everyone action.

The day view aggregates multiple actual phone legs/check-ins. Open the specific
call when inspecting a take; do not delete earlier calls to simplify the calendar.
If family join interrupts remaining routine questions, the summary should honestly
say the check-in is incomplete. Do not turn that into a completed result for capture.
Do not promise a verbatim post-join family transcript until verified: the current
agent subscribes to the elder phone UID and LISTEN does not establish capture of
every browser participant's speech.

## Evidence and follow-up

Use a new ignored `artifacts/test-runs` folder for the session. Record API/web
commits, testers, authorization, UTC timestamps, true elder local time, request →
ringing, utterance → alert, end → cleanup, end → record availability, and actual
call/leg/agent/alert identities. Keep raw personal information private. Each
rehearsal needs independent phone and browser observations plus Supabase/provider
resource checks. The phone and agent must stop after each take; never silently
repair records or reset consent to count a failed rehearsal as passed.

- [ ] Normal check-in passed through actual phone/browser use and persisted.
- [ ] First full concern/join/LISTEN/end/refresh rehearsal passed.
- [ ] Second full rehearsal passed without state repair or history deletion.
- [ ] Browser microphone released and Agora phone/agent resources stopped after each.
- [ ] No unintended queued or scheduled calling remains after the session. Stop
      and disable the scoped voice worker when the authorized session ends.
- [ ] Push either verified on a real subscribed device or explicitly reported
      unverified. Preserve its implementation; the in-app alert is independently
      demonstrated.
- [ ] Review all 22 acceptance requirements, including emergencies/outages,
      retry/reconnect/races, account isolation, retention/provider copies, latency,
      cost and three uninterrupted full runs. Mark unexercised cases NOT RUN or
      BLOCKED. Two rehearsals do not satisfy the three-run acceptance requirement.
- [ ] Keep general live mode disabled until the full evidence-backed acceptance
      gate passes for the deployed build.
