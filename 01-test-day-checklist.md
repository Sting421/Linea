> **CURRENT OVERRIDE --- 3 October 2026:** The historical test results
> below remain valid, but product policy has changed since test day.
> English is the MVP/demo language. Retry now includes a later second
> attempt. Safety detection is semantic/contextual with deterministic
> policy. First-call consent yes continues into the check-in. Use the
> current `linea/05-mvp-lock.md` and
> `HANDOFF-linea-build-over-nights.md` for current behavior.

# Current MVP acceptance matrix

For a step-by-step runbook, use [Linea MVP verification guide](testing/README.md).
It maps every requirement below to concrete checks and provides conversation
scripts, a blank results tracker, and commands to create a private test run.
Preparing these files does not change any acceptance status below.

Assembled 3 October 2026 from the agreed product rules. **Every case below is
NOT RUN.** This is a specification, not a record of new test results. The
historical test-day results later in this file remain separately labeled.

Use the current handoff, `linea/02-business-rules.md`, and
`linea/policy-fixtures.yaml` as the behavioral contract. Record results with
date, tester, environment/build, expected versus actual behavior, timestamps,
and evidence without exposing secrets or real elder data.

| ID | Scenario | Pass condition | Status |
| --- | --- | --- | --- |
| MVP-01 | Family onboarding and call eligibility | Authorized family creates the one-medicine elder profile and contacts; ordinary schedules require granted consent; first consent call is explicitly supported; calling-hours rules hold. | NOT RUN |
| MVP-02 | First-call consent | Clear yes continues into check-in in the same call; no ends politely and stops scheduled calls; ambiguity never grants consent; elder words and timestamp persist. | NOT RUN |
| MVP-03 | Normal English check-in | Eligible scheduled/call-now phone rings within the existing sixty-second target. Sleep, medicine, feeling, and anything-else beats are covered naturally; short questions, elder interruptions, and pronunciation "lin-ya" work; no introduction recording or SMS. | NOT RUN |
| MVP-04 | Non-linear dialogue | Multiple facts, pronouns, interrupted questions, out-of-order answers, corrections, and pending clarifications follow the saved context; unrelated yes/no never fills the wrong field. | NOT RUN |
| MVP-05 | All five concern policies | All 41 documented conversation fixtures satisfy their expected conditions, including negation/history, Routine clarification, Significant transparency, escalation, and medication uncertainty. Test novel paraphrases too; examples passing alone do not establish general classifier accuracy. | NOT RUN |
| MVP-06 | Emergency and no-advice behavior | Emergency response bypasses extra questions and ordinary beats; fixed script begins within the existing two-second target after the relevant utterance is available to the backend; no diagnosis/dosing advice. The ordinary ten-minute limit must not autonomously close an active emergency. | NOT RUN |
| MVP-07 | Family alerts | Exact words and correct subject reach in-app alert/push within ten seconds of the relevant utterance becoming available; pending assessment is labeled; Routine notification stays quiet; Significant/Emergency notification is announced appropriately; retries deduplicate and escalations update. | NOT RUN |
| MVP-08 | Family join and briefing | An authorized family member joins the live phone call, both sides hear each other, and the deterministic briefing is heard once they are actually present; an unauthorized account cannot obtain a usable token. | NOT RUN |
| MVP-09 | Enforced LISTEN | Backend empty completions prevent interjections during family conversation; a think hint is not treated as enforcement; emergency words from the elder still trigger the fixed response. Do not assume the telephony agent hears family browser speech. | NOT RUN |
| MVP-10 | Initial unanswered/failed call | First failure notifies family with the planned retry; second initial attempt occurs fifteen minutes after the first ends; a second failure exhausts that budget. The scheduler does not create extra immediate attempts. | NOT RUN |
| MVP-11 | Placement races | Active calls block retry/reconnection; a successful manual call cancels pending automatic work; repeated scheduler/webhook events cannot start concurrent calls or consume duplicate attempts. | NOT RUN |
| MVP-12 | Unexpected drop and successful reconnection | Exactly one reconnection is attempted promptly after the old leg ends; Linea acknowledges the interruption and restores answers, consent, unfinished topics, and safety state. Confirm actual family presence before LISTEN. No fifteen-minute wait or full script restart. | NOT RUN |
| MVP-13 | Reconnection failure or second drop | No further automatic redial; family is notified; partial data and all phone legs remain; unfinished day is Yellow unless Red applies. The logical check-in's reconnect budget does not reset. | NOT RUN |
| MVP-14 | Emergency connection loss | Family receives an immediate connection-lost update; one eligible reconnect resumes emergency behavior, not ordinary check-in; persistence/notification failures do not prevent the fixed spoken response. | NOT RUN |
| MVP-15 | Family departures | One member leaving while another remains keeps LISTEN. After the last member leaves with elder present, Linea asks once whether there is anything else and closes naturally, except when safety needs attention. | NOT RUN |
| MVP-16 | Intentional endings | Elder stop/consent refusal and authorized End call for everyone suppress redial. Leave affects only the acting family member. End-for-everyone terminates the required phone/agent resources without falsely marking alerts handled or the check-in complete. | NOT RUN |
| MVP-17 | Calendar aggregation | Completed normal call is Green; normal retry/reconnection can clear a transient call failure; Routine/medicine uncertainty/incomplete outcomes are Yellow; Significant/Emergency events keep Red. Pending retry/reconnect labels display; handled status does not rewrite history. | NOT RUN |
| MVP-18 | Call cleanup and post-call view | Stop the agent promptly using verified teardown; existing target is within thirty seconds after session end, with idle timeout as backstop. Summary and transcript appear within sixty seconds of final logical check-in end. A temporary reconnectable drop is not premature finalization. | NOT RUN |
| MVP-19 | Ninety-day detailed-text expiry | Synthetic records immediately before/at expiry demonstrate correct access and cleanup of transcript, summary, quote, and duplicate free-text evidence. Structured history remains; consent excerpt retention does not preserve the entire first-call transcript. | NOT RUN |
| MVP-20 | One-year expiry and unenrollment | Structured history expires at its original deadline; updates do not reset it. Active profile, contacts, and consent records end with enrollment. Verify no hidden retained text in event JSON or application diagnostics. | NOT RUN |
| MVP-21 | Authentication, isolation, and data controls | Invalid custom-endpoint bearer tokens are rejected; family data is isolated; RTC tokens are restricted to authorized call/UID. No raw audio is stored. Verify provider recording/retention and backups rather than assuming application deletion controls them. | NOT RUN |
| MVP-22 | Full demo and submission | Three consecutive complete runs without restart: phone call, concern with exact-phrase alert, authorized family join, briefing, silence, deliberate ending, summary/calendar. Submission artifacts map claimed features to actual code and evidence. | NOT RUN |

## Provider gates before end-to-end acceptance

1. Prove the custom LLM request/response shape, call association, authentication,
   and real speech delivery. Confirm empty replies do not cause filler speech.
2. Confirm real disconnect/participant events, duplicate/out-of-order handling,
   call-end versus agent-end semantics, and how a replacement phone leg and
   family connection can be established. No endpoint or payload is assumed.
3. Confirm that phone audio, family join, and exact speak playback still work
   with the custom backend and current English ASR/TTS configuration.
4. Measure latency with a defined clock origin. Record ASR/end-of-speech delay
   separately from backend classification, alert delivery, and speech start.
   The targets above are acceptance targets, not measured results.
5. Confirm recording/retention settings and remaining provider minutes for the
   actual test environment. Use in-app channels and synthetic data for most
   development checks; reserve phone calls for integration verification.

## Demo staging under the current tiers

The former "fell yesterday means red" shortcut is obsolete. If clarification
establishes recovery and the incident is Routine, expect Yellow. For a Red
demo day, use an explicitly Significant scenario, for example a fall with
ongoing non-emergency lower-leg pain, or an Emergency scenario that exercises
the fixed response. A successful family join does not itself change the tier.

No new acceptance checks were executed during the product-definition session.

---

# Historical Linea test day checklist, Friday 2 October 2026

Purpose: by the end of today we know whether Linea is buildable on
Saturday, every unknown in the docs is answered or downgraded to a known
fallback, and the docs are finalized so Saturday is execution only.

Everything here is testing vendors with throwaway scripts, which the
rules allow. No product code is written today. Keep every throwaway
script in a `scratch/` folder that does not go in the product repo.

Order matters. Section A is setup that blocks everything else. Section B
is the tests, in the order they unblock each other. Section C is the
decision at the end of the day. Section D is what we change in the docs
tonight based on results.

Time budget: about 8 hours of working time across the team, with the
Twilio and Agora setup done by two people in parallel in the first two
hours.

------------------------------------------------------------------------

## A. Setup that blocks the tests (first two hours)

  --------------------------------------------------------------------------------------------
  \#         Item             Owner      Done when      Notes
  ---------- ---------------- ---------- -------------- --------------------------------------
  A1         Agora Console    Each       Five accounts  Required by the handbook before
             accounts for all member     exist          arriving
             five members                               

  A2         Agora project    Lead       App ID, App    Credentials never go in a repo or a
             created,                    Certificate,   chat
             Conversational              Customer ID    
             AI Engine                   and Customer   
             enabled on it               Secret         
                                         recorded in    
                                         the team       
                                         secret store   

  A3         Agora Agent      Lead       Studio loads,  Studio is where numbers are imported
             Studio opened on            the phone      
             the project                 number import  
                                         page is        
                                         visible        

  A4         Twilio account   Backend    Account shows  Trial accounts can only call verified
             upgraded from               a balance and  numbers and may block international
             trial, with                 no trial       calls. Do this first, it can take time
             funds loaded                banner         

  A5         Twilio geo       Backend    Philippines    Without this every call to +63 is
             permissions                 toggled on     rejected
             enabled for the             under Voice    
             Philippines,                geo            
             mobile and                  permissions    
             landline                                   

  A6         Twilio phone     Backend    A US number is Philippine numbers need regulatory
             number bought,              owned          documents; do not wait for one
             voice capable                              

  A7         Twilio Elastic   Backend    Trunk exists   Follow Agora's SIP trunk guide step by
             SIP Trunk                   with the       step
             created, number             number under   
             assigned to it              Numbers        

  A8         Termination URI  Backend    ACL saved with Missing IPs mean Agora's outbound
             set on the                  every IP from  calls are rejected by Twilio
             trunk, Agora's              Agora's guide  
             SIP IPs added to                           
             the trunk IP                               
             Access Control                             
             List                                       

  A9         Number imported  Lead and   Number shows   Needed for outbound caller ID and for
             into Agora Agent Backend    as imported in any inbound test
             Studio,                     Studio         
             Origination URI                            
             copied back to                             
             the Twilio trunk                           

  A10        Azure Speech     Voice      A test         Primary TTS. Note the exact Filipino
             resource in                 synthesis in   voice names shown in the portal
             Southeast Asia,             `fil-PH` plays 
             key and region              from the Azure 
             recorded                    portal         

  A11        Google Cloud     Voice      A test request For the Cebuano test and the
             project with                works from the alternative voice
             Speech-to-Text              console        
             v2 and                                     
             Text-to-Speech                             
             enabled, service                           
             account key                                

  A12        LLM API key      Backend    A test         
             (OpenAI or                  completion     
             Google)                     works          

  A13        Postman or a     Backend    All six        Bodies are in
             `scratch/`                  requests saved `shared/agora-platform-reference.md`
             folder with curl            with           and `linea/03-architecture.md`
             scripts for                 placeholders   
             `join`, `call`,                            
             `speak`,                                   
             `think`,                                   
             `leave`,                                   
             `history`, with                            
             Basic Auth set                             

  A14        A throwaway      Backend    `curl` to the  Use ngrok or a free Render service.
             public HTTPS                URL returns    This is the "fake brain" for tests B4
             endpoint that               the fixed      and B7
             logs whatever               completion     
             Agora posts to                             
             it and returns a                           
             fixed chat                                 
             completion                                 

  A15        Agora RTC token  Backend    A token is     `agora-token-builder`
             generator                   produced for   
             working locally             uid 1001 and   
             for a channel               uid 2002       
             name and a uid                             

  A16        Two phones on    Demo       All four ready The hotspot laptop simulates a
             mobile data, one                           provincial connection
             laptop on Wi-Fi,                           
             one laptop on a                            
             phone hotspot                              
  --------------------------------------------------------------------------------------------

If A4 to A9 cannot be completed by noon because of Twilio account
verification delays, keep going with B1 and B3 to B6 on an in app
channel, and report the Twilio blocker to the team immediately. The
telephony decision cannot wait past tonight.

------------------------------------------------------------------------

## B. Tests, in order

Record every result in `docs/evidence/test-results-2026-10-02.md` with
time, who ran it, pass or fail, and a one line note. Screen record the
passes on a phone.

### B1. Agent in a web channel, Filipino voice (30 minutes)

Steps: `join` an agent into channel `test-b1` with
`remote_rtc_uids: ["*"]`, `asr.language: fil-PH`, Azure TTS with a
Filipino voice, a short Filipino system message, and a
`greeting_message`. Join the channel from a browser with the Web SDK
using a token for uid 2002. Talk to it in Tagalog for two minutes.

Pass: the greeting plays, Tagalog is understood, replies arrive within
about 1.5 seconds, the voice is clear. Fail: no greeting, poor
recognition, or a vendor error.

Record: which Azure voice name worked, how the voice sounds for an
elder, the silence window that felt right. Unlocks: B2, B3, B5. If this
fails, fix the vendor configuration before anything else, because every
later test depends on it.

### B2. Outbound call to a Philippine mobile (45 minutes, the decisive test)

Steps: `POST /call` with `sip.to_number` set to a teammate's Philippine
mobile in E.164, `sip.from_number` set to the Twilio number, the gateway
uid and token, and the same `properties` as B1 with channel `test-b2`.
Answer the phone. Talk for three minutes.

Pass: the phone rings within 15 seconds, the greeting is clear, two way
speech works, delay feels under 1.5 seconds, the call holds for three
minutes, and Agora shows the agent RUNNING. Partial: it rings and works
but delay is between 1.5 and 3 seconds, or audio is thin. Still
buildable; note it. Fail: no ring, call rejected by the trunk, one way
audio, or delay over 3 seconds.

If the trunk rejects the call, check the IP ACL first, then geo
permissions, then the number assignment. If Agora returns
`invalid_phone_format`, the number is not E.164.

Record: ring time, delay, call quality, the exact `sip` field names that
worked, Twilio's per minute charge shown in the Twilio log. Unlocks: B3,
B4, B6. Decides the product.

### B3. Browser joins the live phone call (30 minutes)

Steps: while a B2 style call is live, join the same channel from a
laptop with the Web SDK as uid 2002 and publish the microphone. Speak
from the laptop. Speak from the phone.

Pass: the person on the phone hears the laptop, the laptop hears the
phone, and the agent still responds to both. Partial: the laptop hears
the phone but the phone does not hear the laptop. The join becomes a
recorded moment in the demo and a question for Agora's engineer. Fail:
the laptop cannot join or hear anything.

Record: what each side heard, any echo, whether the agent kept
responding. Unlocks: B4. Decides whether the join is live on stage.

### B4. Speak, then go quiet (20 minutes)

Steps: during the B3 call, call `speak` with a 100 character Filipino
sentence and `priority: INTERRUPT`. Then call `think` with text
`[SYSTEM] A family member has joined. Do not speak unless addressed as Linea.`
and `on_listening_action: inject`. Talk between the phone and the laptop
for one minute without saying Linea. Then say "Linea" from the phone.

Pass: the sentence plays immediately, the agent stays silent for the
minute, and it answers when addressed. Partial: the agent still
interjects once or twice. Listen mode must then be enforced by the fake
brain returning empty replies, which is test B7. Fail: `speak` or
`think` return errors.

Record: whether the think instruction alone was enough, or whether the
backend must enforce silence. Unlocks: nothing blocking. Confirms the
join sequence in the architecture doc.

### B5. Every sentence reaches our server (20 minutes)

Steps: `join` an agent whose `llm.url` is the A14 fake brain, with
`llm.vendor: custom` and an `api_key`. Talk to it from a browser for ten
turns.

Pass: the fake brain logs every user sentence with `turn_id` and
`timestamp`, the bearer token arrives, and the fixed completion is
spoken back. Fail: nothing arrives, or arrives without the fields.

Record: the exact request shape Agora sends, especially how `llm.params`
and the query string on `llm.url` arrive, so the architecture doc's
`call_id` approach is confirmed. Unlocks: the rules in code. Confirms
the custom LLM contract.

### B6. Call without an answer (15 minutes)

Steps: `POST /call` to a teammate's phone and do not answer. Watch the
agent status and the idle timeout. Then `GET /history`.

Pass: the agent stops within the idle timeout, status goes to STOPPED,
and history is empty or shows only the greeting. Record: how long until
the agent stopped, what history returned. Unlocks: the `no_answer` rule
and the yellow day logic.

### B7. Enforced listen mode through the fake brain (15 minutes)

Steps: change the fake brain to return an empty completion unless the
last user message contains "linea". Repeat B4's one minute of talking.

Pass: complete silence from the agent until addressed. Record: whether
an empty completion causes any error or filler speech from the engine.
Unlocks: the listen mode enforcement in the architecture doc.

### B8. Emergency path timing (15 minutes)

Steps: with the fake brain, make it return the fixed emergency script
when the last user message contains "dibdib". Say "masakit ang dibdib
ko" on a call.

Pass: the script is spoken within 2 seconds, with 911 read out
correctly. Record: whether the TTS pronounces 911 and the contact number
acceptably in Filipino. If not, write the numbers as words in the
script.

### B9. Cebuano recognition (30 minutes, can run in parallel on another laptop)

Steps: record five Bisaya sentences. Run them through Google Cloud
Speech-to-Text v2 with `model: chirp_2` and `language_codes: ["ceb-PH"]`
directly. Then try the same through an Agora agent with Google as the
ASR vendor and that language code, if the Console shows Google as
available.

Pass: four of five correct through Agora. Partial: correct through
Google directly but not through Agora. Bisaya goes to the "more time"
tier and the demo elder speaks Tagalog. Fail: poor results everywhere.

Record: results per sentence, and whether Agora's Google ASR option
exists on our account.

### B10. Recorded intro delivery (15 minutes)

Steps: find out whether the current `join` body supports a pre recorded
audio greeting. If not, test playing the intro MP3 from the laptop into
the channel as a published audio track, or accept the cut.

Pass: the intro can be heard on the phone before the agent speaks.
Record: which method worked. If none, cut line 1 in the PRD applies and
the intro is described in the pitch.

### B11. Minutes and cost (10 minutes)

Steps: read the Conversational AI minutes used in the Agora Console and
the call charges in the Twilio log.

Record: minutes left, Twilio cost per minute to a Philippine mobile.
Decision: if under 150 minutes left, create a second App ID tonight and
message the organizers about credits.

### B12. Hotspot connection (15 minutes)

Steps: repeat B3 with the joining laptop on a phone hotspot instead of
Wi-Fi.

Pass: still clear. Record any difference.

------------------------------------------------------------------------

## C. The decision tonight

  -----------------------------------------------------------------------
  B2 result               B3 result               Decision
  ----------------------- ----------------------- -----------------------
  Pass                    Pass                    Build Linea on Saturday
                                                  with the live join.
                                                  Docs finalized as
                                                  written.

  Pass or partial         Partial or fail         Build Linea. The join
                                                  is demoed from a
                                                  recording made today or
                                                  tonight. Add the second
                                                  phone leg question for
                                                  Agora's engineer.
                                                  Change beat 4 of the
                                                  pitch to the recording.

  Fail, fixable (ACL, geo Any                     Fix and rerun B2
  permissions, trial                              tonight. If it passes
  account)                                        by midnight, Linea.

  Fail, not fixable       Any                     Build Kasangga. Run its
                                                  tests T4 to T6 on
                                                  Friday morning before
                                                  the flight.
  -----------------------------------------------------------------------

Write the decision at the top of `docs/README.md` with the time and who
agreed.

------------------------------------------------------------------------

## D. Finalizing the docs tonight, from the results

  -----------------------------------------------------------------------
  Result                            Doc change
  --------------------------------- -------------------------------------
  B1 voice name                     `linea/03-architecture.md` section
                                    4.1 `voice_name`, and the design
                                    guidelines voice selection

  B1 silence window that felt right `silence_duration_ms` in the
                                    architecture body and the business
                                    rules V-05

  B2 `sip` field names              Architecture section 4.1, remove the
                                    verify note

  B2 delay and quality              PRD non functional requirements,
                                    update the latency line to what was
                                    measured

  B3 outcome                        PRD K-08 acceptance, pitch beat 4,
                                    architecture sequence 2.2

  B4 and B7 outcome                 Architecture section 5.1 step 5 stays
                                    or is strengthened, business rule
                                    J-03

  B5 request shape                  Architecture section 5.1 request
                                    description, how `call_id` is passed

  B6 timing                         Business rule L-03 and O-03
                                    `idle_timeout` value

  B8 pronunciation                  Design guidelines emergency script,
                                    numbers as words if needed

  B9 outcome                        PRD scope tier for Bisaya, business
                                    rule V-04, design guidelines language
                                    section

  B10 outcome                       PRD K-03 and cut line 1, design
                                    guidelines first call script

  B11 minutes                       Prerequisites A2 note on second App
                                    ID, submission cost line

  Twilio per minute rate            Architecture section 12 cost
                                    estimate, business rule P-05

  Remaining verify items            Any still unverified becomes a named
                                    question for Agora's engineer onsite,
                                    listed in
                                    `00-prerequisites-and-discovery.md`
                                    section 5
  -----------------------------------------------------------------------

Also tonight - Fill `docs/evidence/` with screenshots of every source in
`evidence/sources.md`. - Record the daughter's intro MP3 and save it in
`scratch/` for Saturday. - Write the demo elder profile as JSON. -
Collect the phone numbers that will be used on stage and get consent
from their owners. - Rehearse the two minute pitch once with the
recordings from today as placeholders. - Pin package versions in a
`package.json` and `requirements.txt` draft kept in `scratch/`, so
Saturday's hour zero is copy, not research.

------------------------------------------------------------------------

## E. Saturday, hour zero, if everything above is done

Open the PRD's 12 hour plan. Confirm which product. Paste the Agora
bodies into the repo's config. Confirm the backend URL answers from the
internet. Confirm the free minutes. Start the clock.

------------------------------------------------------------------------

## F. Results, recorded 3 October 2026, 00:05 PHT

  -----------------------------------------------------------------------------
  Test                Result              Notes
  ------------------- ------------------- -------------------------------------
  A1 to A9            Done                Agora project Linea, App ID
                                          `7ab960ee43524673ab868ef4bb60c636`.
                                          RESTful API key created. Twilio
                                          upgraded, US number `+14236075541`,
                                          Elastic SIP Trunk
                                          `linea-keias.pstn.twilio.com`,
                                          credential list auth, number imported
                                          in Agora Phone Numbers on port 5060
                                          TCP, Philippines geo permissions
                                          enabled.

  B1                  Pass                Published agent `linea-test` tested
                                          in the browser from the Console.
                                          Managed defaults were Deepgram
                                          nova-3, GPT-4.1 mini, MiniMax English
                                          voice. Prompt without an end
                                          condition loops; irrelevant for the
                                          build since our backend owns the
                                          beats.

  B2                  Pass                First call placed with the Console's
                                          Outbound Campaigns tool (one contact
                                          CSV). Second and third calls placed
                                          by REST `POST /call` with
                                          `pipeline_id` and `sip.rtc_uid` 100
                                          and `sip.rtc_token`. Phone rang, two
                                          way speech worked. Ring time and
                                          delay to be written in by the tester.

  B3                  Pass                Browser joined channel `linea-b3`
                                          through webdemo.agora.io Basic Voice
                                          Call as uid 2002 while the phone call
                                          was live. The phone heard the
                                          browser. The join is live on stage.

  B4 speak            Pass                `speak` with `INTERRUPT` played the
                                          briefing text word for word,
                                          immediately.

  B4 think            Partial             A `think` instruction with `inject`
                                          did not silence the managed agent; it
                                          kept running its script. Listen mode
                                          must be enforced by our backend
                                          returning empty replies (rule J-03).

  B5 to B8            Deferred to build   These need our own custom LLM
                      hours 1 to 2        endpoint, which is the first thing
                                          built.

  B9 Cebuano          Not run             Demo elder speaks Tagalog. Bisaya
                                          stays in the More time tier.

  B10 intro audio     Not run             Cut line 1 applies unless hour 2
                                          finds a greeting audio field. The
                                          intro is described in the pitch.

  B11 minutes         Pass                RTC audio showed 3 minutes for the
                                          day. Agent minutes were not read;
                                          switch the Usage dropdown to
                                          Conversational AI Engine on build day
                                          morning. Twilio balance after setup
                                          was \$18.85 before calls.

  B12 hotspot         Not run             Test at the venue 30 minutes before
                                          the pitch.
  -----------------------------------------------------------------------------

Findings that changed the docs - Telephony agents subscribe to exactly
one uid, the SIP gateway. The agent does not hear the family browser.
The phone still hears the browser because the gateway carries the
channel mix. Listen mode is therefore natural on telephony calls and the
backend enforces it anyway for in app calls. - The Console's agent
builder exposes a `pipeline_id` and managed `resource_id` values for
Deepgram, OpenAI and MiniMax, usable in REST without keys. Linea uses
the full configuration path instead so our backend is the brain. -
Twilio SIP trunking to Philippine mobiles is priced at \$0.203 to
\$0.290 per minute. Cost per elder per day at MVP rates is about \$1.20
to \$1.80, not the \$0.50 first targeted. A local trunk partner is the
roadmap item that fixes this. - Credential list authentication on the
Twilio trunk worked; Agora's SIP IP list was not needed. - The base64 of
the RESTful API key was pasted into a chat during setup. Rotate that key
after the event.
