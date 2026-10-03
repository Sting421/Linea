> **CURRENT OVERRIDE --- 3 October 2026:** This PRD is retained for
> product context, but current scope is governed by `05-mvp-lock.md`.
> English is MVP language. Retry has been added as a required second
> attempt after an unanswered/failed first attempt. Intro audio and SMS
> remain out of MVP. Semantic safety classification and
> Routine/Significant/Emergency policy are required.

# Linea, Product Requirements Document

Version 1.1, 3 October 2026. Owner: Team KEIAS. Status: confirmed as the
build. Telephony tests passed on 2 October.

## 1. Summary

Linea is a daily voice check-in for elders that works on any phone,
including a basic keypad phone. Every morning the AI calls the elder,
greets her by name in her language, asks how she slept and whether the
morning medicine was taken, and listens. When something sounds wrong it
keeps her talking and alerts the family with her exact words. A family
member anywhere can join the same live call from a web app and is
briefed by the AI before taking over. The family sees a calendar of
green, yellow and red days.

The primary interface is the phone call. The elder never sees a screen.
The family's web app is secondary and could be replaced by SMS without
changing the product.

## 2. The problem, with evidence

Filipino elders increasingly live apart from their adult children, who
work in Manila or abroad, and the daily contact that catches a missed
dose or a fall does not happen because the phone call is the only
channel and it happens when there is time.

  -----------------------------------------------------------------------
  Fact                    Figure                  Source
  ----------------------- ----------------------- -----------------------
  Elders in the           9.2 million aged 60 and PSA 2020 Census of
  Philippines             over in the 2020        Population and Housing,
                          census, up from 7.5     via Commission on
                          million in 2015         Population and
                                                  Development

  Growth                  Projected to about 13   PSA projections via CPD
                          million by 2030; the    
                          country becomes an      
                          aging society (14       
                          percent seniors)        
                          between 2030 and 2035   

  Living arrangements     12 percent of older     LSAHP Wave 2 (DRDF,
                          Filipinos live alone;   ERIA)
                          59 percent live with at 
                          least one child         

  Children abroad         One in ten households   LSAHP Wave 2, chapter 3
                          of older persons has a  
                          member currently        
                          abroad, up from 4       
                          percent in Wave 1       

  OFWs                    2.19 million overseas   PSA Survey on Overseas
                          Filipino workers in     Filipinos, December
                          2024, up 1.5 percent    2025

  Dependence on children  Older Filipinos rely on LSAHP Wave 2 executive
                          remittances from        summary
                          children in the country 
                          (58 percent) and abroad 
                          (18 percent)            

  Health burden           20 percent have         LSAHP Wave 2 executive
                          difficulty with at      summary
                          least one activity of   
                          daily living; falls and 
                          non communicable        
                          diseases are prevalent  

  Connectivity            Half of older persons'  LSAHP Wave 2, chapter 3
                          households have         
                          internet access, which  
                          means half do not       

  Out of pocket           67 percent of           LSAHP Wave 2
                          healthcare costs for    dissemination forum
                          older persons are paid  
                          out of pocket           
  -----------------------------------------------------------------------

Still to find before the submission: the share of seniors who own a
mobile phone, and medication adherence among Filipino seniors with
hypertension or diabetes. Until found, the pitch says "most" rather than
a number.

## 3. Users

  -----------------------------------------------------------------------
  User              Who they are      What they need    How they interact
  ----------------- ----------------- ----------------- -----------------
  The elder         60 and over, in   Someone to ask    Answers a phone
                    the province,     about her day and call. Nothing
                    often alone       her medicine, in  else.
                    during the day,   her language, at  
                    may have hearing  a time she        
                    loss, speaks      expects, from a   
                    Tagalog or        voice she trusts  
                    Bisaya, owns a                      
                    basic phone or a                    
                    smartphone she                      
                    does not use                        

  The family member Adult child in    A daily signal    Web app: setup,
  (primary          Manila or abroad, that mom is fine, calendar, alerts,
  customer)         has a smartphone  an alert with     join call
                    and a browser,    details when she  
                    worries daily,    is not, and a way 
                    cannot call every to be in the call 
                    morning           fast              

  The nearby        Lives in the same To be told when   SMS alert
  relative or       barangay or       to go check       
  helper            house, no app                       
                    needed                              

  Later: barangay   Covers many       A weekly summary  Web summary (More
  health worker or  elders            of elders under   time tier)
  RHU nurse                           care              
  -----------------------------------------------------------------------

## 4. Goals and non goals

Goals for the MVP - Place a scheduled outbound call to a real Philippine
mobile and hold a two to four minute check-in in Filipino. - Log
medicine taken or not taken, and a mood word, per day. - Detect a short
list of alert triggers from the elder's words and alert the family with
the exact phrase. - Let a family member join the live call from the web
app and hear a ten second briefing. - Show a calendar of green, yellow
and red days with transcripts.

Non goals, for every tier - Medical advice, diagnosis, triage scores, or
medication changes. Linea never does these. - Replacing emergency
services. Linea reads out 911 and the nearest contact, nothing more. -
Replacing the family's own calls. Every alert is an invitation to join.

## 5. Scope by tier

### 5.1 MVP, built in the 12 hours

  -----------------------------------------------------------------------
  ID                      Requirement             Acceptance criteria
  ----------------------- ----------------------- -----------------------
  K-01                    Elder profile exists    Profile is created from
                          with name, language     the web app and read by
                          (`fil-PH` default),     the backend
                          phone in E.164,         
                          medicine list with time 
                          of day, call time,      
                          consent flag, and up to 
                          three family contacts   

  K-02                    Scheduled outbound call The elder's phone rings
                          at the elder's call     within 60 seconds of
                          time through Agora      the scheduled time;
                          telephony               demo uses a "call now"
                                                  button as well

  K-03                    Greeting plays the      Recorded intro is
                          family's recorded intro audible before the
                          on the first call, then agent speaks on call
                          the agent greets by     one; later calls skip
                          name                    it

  K-04                    Check-in script: sleep, All four beats occur in
                          morning medicine, how   order unless the elder
                          are you feeling,        steers away; agent
                          anything else           returns to unfinished
                                                  beats once

  K-05                    Medicine logging        Saying the medicine was
                                                  taken writes
                                                  `taken=true`; saying it
                                                  was not writes
                                                  `taken=false`; unclear
                                                  writes `unknown`

  K-06                    Alert triggers          Any trigger phrase from
                                                  the rules file produces
                                                  an alert within 10
                                                  seconds, containing the
                                                  exact transcript
                                                  segment

  K-07                    Family alert delivery   Alert reaches the
                                                  family member as web
                                                  push or SMS, with a
                                                  join link

  K-08                    Family join             Family member joins the
                                                  live channel from the
                                                  web app and is heard on
                                                  the elder's phone
                                                  (confirmed in test B3);
                                                  the agent speaks a
                                                  briefing through the
                                                  speak endpoint
                                                  (confirmed in B4) and
                                                  the backend sets listen
                                                  mode so the agent
                                                  returns empty replies
                                                  unless the elder says
                                                  "Linea"

  K-09                    Post call summary       Within 60 seconds of
                                                  call end, a two
                                                  sentence summary and
                                                  the transcript appear
                                                  on the calendar day

  K-10                    Calendar                Green for completed
                                                  call with medicine
                                                  taken, yellow for
                                                  missed call or medicine
                                                  not taken or unknown,
                                                  red for alert

  K-11                    Safety rule: emergency  On an emergency trigger
                          phrases                 the agent stays on the
                                                  line, speaks the
                                                  emergency script, reads
                                                  911 and the nearest
                                                  contact, and alerts all
                                                  contacts

  K-12                    No medical advice rule  A request for advice is
                                                  answered with a fixed
                                                  script and a family
                                                  alert of type
                                                  `advice_requested`

  K-13                    Data retention          Agora per session
                                                  retention opt out is
                                                  set; our transcripts
                                                  are kept 90 days by
                                                  default

  K-14                    Submission artifacts    Public GitHub repo,
                                                  README mapping features
                                                  to code, two minute
                                                  video, website URL
  -----------------------------------------------------------------------

### 5.2 More time, roughly two weeks after the event

-   Bisaya recognition through Google Chirp 2 if T3 passed, with
    language per elder.
-   Evening call for evening medicine, and a "call me now" number the
    elder can dial (inbound).
-   Retry logic: unanswered call retried once after 15 minutes, then a
    yellow day and a family notice.
-   Family app as a native Android app with push notifications.
-   Weekly summary email to a barangay health worker or RHU nurse, with
    consent.
-   Mood trend and medicine adherence trend over 30 days.
-   Caller ID on a Philippine number, and a Philippine local trunk
    partner to bring the per call cost from international rates down to
    local rates.
-   Voice selection per elder (male or female voice, speed).

### 5.3 Full product vision

Linea becomes the daily voice layer between Filipino families and their
elders. The same call checks in, reminds, listens for change, and
connects the family at the moment it matters. The data becomes a quiet
health record that the elder's barangay health worker, RHU and HMO can
use with consent, so a week of poor sleep or a missed week of medicine
is seen before it becomes a hospital visit. The product expands to post
discharge follow up for hospitals, to other languages across the
Philippines, and to other countries with the same pattern of elders at
home and children abroad.

## 6. User flows

### 6.1 Setup (family member, web)

1.  Sign in. Create elder profile. Enter medicine list and call time.
    Add contacts.
2.  Record the intro message in the browser (10 to 15 seconds). Preview
    it.
3.  Read the consent text. Confirm that the elder will be asked for
    consent on the first call.
4.  Tap "Call now" for a test call, or wait for the scheduled time.

### 6.2 Morning call (elder, phone)

1.  Phone rings from the saved number. Elder answers.
2.  First call only: recorded intro plays. Agent asks for consent in
    plain words and records yes or no.
3.  Agent greets by name, asks about sleep, asks about the medicine,
    asks how she feels, asks if there is anything else.
4.  Elder talks. Agent listens with a longer silence window, repeats on
    request.
5.  Agent closes warmly and says when it will call again. Call ends.
    Agent leaves.

### 6.3 Alert and join (elder and family)

1.  Elder says a trigger phrase. Backend classifies it, logs an alert,
    sends web push and SMS with the exact phrase and a join link.
2.  Agent stays on the line, keeps the elder talking calmly, and if the
    trigger is an emergency class speaks the emergency script.
3.  Family member taps join. Browser joins the channel. Backend calls
    `speak` with a briefing, then `think` to put the agent in listen
    mode.
4.  Family talks to the elder. Agent stays silent unless addressed.
    Family member ends the call. Agent leaves.

### 6.4 After the call

1.  Backend fetches history, writes transcript and summary, sets the day
    color.
2.  Family sees the day on the calendar. Opens it to read the
    transcript.

## 7. Non functional requirements

  ---------------------------------------------------------------------
  Area                               Requirement
  ---------------------------------- ----------------------------------
  Latency                            Agent response within 1.5 seconds
                                     of end of speech in normal
                                     conditions

  Turn taking                        `silence_duration_ms` at 1200 for
                                     elders, tuned on the night

  Speech rate                        TTS rate at 0.85 to 0.9 of default

  Languages                          Filipino for MVP, Bisaya if T3
                                     passed

  Call length                        Target 2 to 4 minutes, hard stop
                                     at 10 minutes unless a family
                                     member is in the call

  Reliability                        If the agent fails to start, the
                                     family is notified and the day is
                                     yellow

  Privacy                            Transcripts are sensitive personal
                                     information under the Data Privacy
                                     Act of 2012 (RA 10173). Consent
                                     recorded, retention limited, Agora
                                     opt out set

  Cost                               About \$1.20 to \$1.80 per elder
                                     per day at MVP rates for a four
                                     minute call, measured against
                                     Twilio's \$0.203 to \$0.290 per
                                     minute to Philippine mobiles. The
                                     roadmap target is a few pesos per
                                     call through a Philippine local
                                     trunk partner
  ---------------------------------------------------------------------

## 8. Success metrics

For the demo: a call connects on stage, an alert appears with the exact
phrase, a second phone joins and is briefed, the calendar shows the day.

For a pilot: calls answered rate above 80 percent after week one, alerts
acted on within 30 minutes, family satisfaction asked weekly, and zero
cases of the agent giving advice.

## 9. Risks and mitigations

  -----------------------------------------------------------------------
  Risk              Likelihood        Impact            Mitigation
  ----------------- ----------------- ----------------- -----------------
  Twilio cannot     Closed, passed 2  Fatal             Confirmed on
  reach Philippine  October                             three live calls
  mobiles reliably                                      

  Foreign caller ID Medium            High              Recorded intro by
  is ignored or                                         the family,
  blocked as spam                                       number saved on
                                                        the elder's
                                                        phone, fixed call
                                                        time

  Bisaya not        Medium            Medium            Demo in Tagalog,
  supported through                                     honest roadmap
  Agora                                                 

  Elder cannot hear Medium            High              Slower rate,
  the voice                                             Azure or Google
                                                        neural voice,
                                                        repeat on request

  Agent gives       Low               High              Advice detection
  advice despite                                        in code before
  rules                                                 the model is
                                                        called; fixed
                                                        script

  Judges challenge  High              Medium            Consent recorded
  consent and                                           in elder's own
  dependency                                            voice; every
                                                        alert invites the
                                                        family in

  Agora minutes run Medium            Medium            Second App ID
  out during                                            ready; ask for
  testing                                               credits
  -----------------------------------------------------------------------

## 10. Twelve hour build plan

Assumes T1, T2 and T3 were run before the event and the profile and
intro are prepared.

  -----------------------------------------------------------------------
  Hours            Lane             Deliverable          Checkpoint
  ---------------- ---------------- -------------------- ----------------
  0 to 1           All              Repo, env vars,      All five can
                                    backend hello        push and the
                                    endpoint public,     backend URL
                                    Next.js deployed,    answers
                                    Supabase schema      
                                    applied              

  1 to 2           Voice, Backend   Agent joins a web    A browser test
                                    channel with the     call feels like
                                    Filipino voice and   a check-in
                                    the script in        
                                    `system_messages`,   
                                    in app test call     

  2 to 4           Engine           Outbound call to a   Phone rings,
                                    teammate's phone     agent talks. If
                                    with the same        not working by
                                    properties; recorded hour 4, switch
                                    intro as `greeting`  to in app calls
                                    audio or first       for the demo
                                    `speak`              

  2 to 5           Backend          Custom LLM endpoint  "nahulog ako"
                                    with script state,   creates an alert
                                    medicine logging,    on the family
                                    alert                phone
                                    classification, SMS  
                                    and push             

  4 to 6           Frontend         Setup form, record   Profile saved,
                                    intro, elder         call started
                                    profile, "Call now"  from the UI

  6 to 8           Backend,         Family join flow:    Second device
                   Frontend         token for channel,   joins and is
                                    join button, `speak` briefed
                                    briefing, listen     
                                    mode                 

  8 to 9.5         Backend,         Post call history    Calendar shows
                   Frontend         fetch, summary,      today correctly
                                    calendar colors,     
                                    transcript view      

  9.5 to 10.5      Demo             Three clean runs,    Three runs
                                    demo data for a      without a
                                    month of days        restart

  10.5 to 12       Demo, Lead       Video, README        Submitted
                                    feature map,         
                                    submission form,     
                                    pitch rehearsal      
  -----------------------------------------------------------------------

Cut lines, in order, if behind at the hour 6 or hour 8 checkpoint 1. Cut
the recorded intro as audio; say it in the pitch instead. 2. Cut SMS;
keep web push or an in app alert list. 3. Cut the transcript view; keep
the summary and the colors. 4. Cut the calendar month view; keep a list
of days. 5. Cut live telephony for the demo; use the in app call and
show the recorded phone call video. This is the last cut and it changes
the pitch.

Never cut: alert on trigger phrase, family join with briefing, no
medical advice rule, consent on first call.

## 11. Open questions

-   Which TTS vendor sounds best in Filipino for an elder: Azure (fil-PH
    neural), Google (fil-PH Neural2) or ElevenLabs multilingual? Decide
    by listening during T1.
-   Can the family's recorded intro be played through the agent as pre
    recorded greeting audio, or must it be sent through `speak` as text?
    If audio greeting is not available in the current API, the intro is
    played by the backend through a short pre roll agent, or dropped
    (cut line 1).
-   Closed: on telephony calls the agent subscribes to the gateway uid
    only and does not hear the family member. The phone still hears the
    family member (test B3). This is fine for the product.

## 12. Submission form draft

See `docs/linea/04-design-guidelines.md` section 9 for the pitch script,
and the table below for the written form.

  ---------------------------------------------------------------------
  Field                              Draft
  ---------------------------------- ----------------------------------
  Project name                       Linea

  Project overview                   Linea is a daily voice check-in
                                     for elders that works on any
                                     phone. It calls the elder each
                                     morning in her language, checks
                                     medicine and mood, alerts the
                                     family with her exact words when
                                     something is wrong, and lets a
                                     family member join the same call
                                     from anywhere.

  Target market                      Adult children of elders who live
                                     apart from them, especially OFW
                                     families and Manila based families
                                     with parents in the provinces,
                                     followed by barangay health
                                     centers and LGU senior citizen
                                     offices.

  Pain point, with evidence          9.2 million Filipinos were 60 and
                                     over in 2020, projected to reach
                                     about 13 million by 2030 (PSA). 12
                                     percent of older Filipinos live
                                     alone and one in ten of their
                                     households has a member abroad
                                     (LSAHP Wave 2). 2.19 million
                                     Filipinos worked overseas in 2024
                                     (PSA). Half of older persons'
                                     households have no internet, so an
                                     app will never reach them.

  The how                            An Agora conversational agent
                                     dials the elder through telephony
                                     each morning. Our backend is the
                                     agent's brain, holding the
                                     profile, the medicine list and
                                     coded safety rules. Alerts reach
                                     the family with the trigger
                                     phrase. A family member joins the
                                     live call from the web app and is
                                     briefed by the agent.

  Strategic integration              Agora Conversational AI Engine
                                     runs the agent, Agora telephony
                                     places the call to a normal phone,
                                     a multi user channel lets the
                                     family join the same call, a
                                     custom LLM endpoint carries our
                                     logic, the speak endpoint delivers
                                     the family briefing, custom
                                     instructions switch the agent to
                                     listen mode, and the per session
                                     retention opt out protects
                                     privacy.

  Sustainability and growth          A monthly fee per elder paid by
                                     the family, then LGU and health
                                     center licenses. Roadmap: a
                                     Philippine local trunk partner to
                                     bring call cost to local rates,
                                     Bisaya, evening calls, weekly
                                     summaries for barangay health
                                     workers, post discharge follow up
                                     for hospitals.

  Video                              Two minute walkthrough: setup, the
                                     morning call, an alert, the family
                                     joining, the calendar.

  GitHub                             Public repo with backend, web app,
                                     and a README that maps each
                                     claimed feature to the code.

  Website URL                        The family web app with a demo
                                     login.
  ---------------------------------------------------------------------
