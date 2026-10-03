> **CURRENT OVERRIDE --- 3 October 2026:** This regenerated packet
> supersedes old test-plan assumptions. MVP conversation language is
> English. A second call attempt after an unanswered/failed first
> attempt is now required; exact retry timing/count remains to be
> locked. Intro audio and SMS remain out of MVP. Semantic safety
> classification and deterministic Routine/Significant/Emergency policy
> are required.

# Prerequisites and discovery

> Status, 3 October 2026: T1 and T2 passed on test day, so Linea is the
> build. Section 2 items A1 to A9 are done. See
> `01-test-day-checklist.md` section F for results.

Prepared 1 October 2026. Everything here happens before the flight. The
rules allow research, brainstorming, wireframes and account setup before
the event, and require that the actual development happens during the 12
hour build. Testing a vendor's library or API with throwaway code is
research. Writing our product's code is not.

## 1. The decision rule, and the tests that drive it

  -----------------------------------------------------------------------------------------
  Test          How to run it                      Pass          Fail         Decides
  ------------- ---------------------------------- ------------- ------------ -------------
  T1. Telephony Buy a Twilio number, create an     The phone     Call         Linea (pass)
  to a          Elastic SIP Trunk, add Agora's SIP rings within  rejected, no or Kasangga
  Philippine    IPs to the IP ACL, import the      15 seconds,   ring, one    (fail).
  mobile        number in Agora Agent Studio, then the greeting  way audio,   
                call                               is clear, two or delay     
                `POST /v2/projects/{appid}/call`   way speech    over 3       
                with `sip.to_number` set to a      works, delay  seconds.     
                teammate's Philippine mobile in    feels under                
                E.164 (+63...). Use a throwaway    1.5 seconds,               
                agent with `greeting_message` set. and the call               
                                                   holds for 3                
                                                   minutes.                   

  T2. Family    While T1 is running, join the      The agent     The browser  Whether
  join on a     call's RTC channel from a browser  hears both    cannot hear  Linea's join
  live phone    with the Agora Web SDK as a second parties and   or be heard. moment is
  call          user, and set `remote_rtc_uids` to the browser                live or shown
                `["*"]` or to both UIDs.           hears the                  as a recorded
                                                   elder's line.              clip.

  T3. Cebuano   Record the same five Bisaya        At least four No path      Whether
  recognition   sentences. Run them through ARES   of five       through      Bisaya is
                with `asr.language` set to         sentences     Agora        promised
                `fil-PH`, then through Google      transcribed   handles      anywhere.
                Cloud Speech-to-Text v2 with model correctly by  Bisaya.      Linea demos
                `chirp_2` and language `ceb-PH`,   one path                   in Tagalog if
                directly and through Agora's       through                    this fails.
                Google ASR option if it accepts    Agora.                     
                that code.                                                    

  T4. Pose      Run MediaPipe Pose Landmarker      Angle         Reps         Kasangga's
  stability     (lite and full) in Chrome on a mid thresholds    miscounted   exercise set
                range Android phone, on five       that count    on more than and model
                teammates doing sit to stand, heel reps          one person,  choice.
                raise, marching, mini squat and    correctly for or under 10  
                hip abduction, in ordinary room    all five      frames per   
                light. Log hip, knee and ankle     people, at 15 second.      
                angles.                            frames per                 
                                                   second or                  
                                                   better.                    

  T5. Pose      Send a test event from a browser   Under 1.5     Over 3       Whether
  event to      to a backend that calls Agora's    seconds end   seconds.     corrections
  voice delay   `think` endpoint with              to end.                    are spoken
                `on_listening_action: inject`, and                            live or only
                time the agent's spoken reaction.                             counted.

  T6. Therapist Second browser joins the Kasangga  Video and     Agent drops  Whether the
  join with     channel and subscribes to the      audio both    or video     therapist
  video         patient's video track while the    arrive, agent fails.       join is live
                agent is active.                   still                      or recorded.
                                                   responds.                  

  T7. Free      Check Conversational AI minutes    Enough left   Under 100    How hard to
  minutes       used after T1 to T6 in the Agora   for 12 hours  minutes      push for
                Console.                           of testing,   left.        credits, and
                                                   meaning at                 whether to
                                                   least 150                  make a second
                                                   minutes.                   App ID.
  -----------------------------------------------------------------------------------------

Run T1 and T2 first, because they decide the product. Run T4 and T5 in
parallel on another machine, because they decide Kasangga's scope either
way.

## 2. Accounts and access

  -----------------------------------------------------------------------
  Item                    Owner                   Done when
  ----------------------- ----------------------- -----------------------
  Agora Console account   Each member             Five accounts exist,
  for every team member                           one is the team project
  (required by the                                owner
  handbook)                                       

  Agora project with      Lead                    Stored in the team's
  Conversational AI                               secret store, never in
  Engine enabled, App ID                          the repo
  and App Certificate                             
  recorded, Customer ID                           
  and Customer Secret for                         
  Basic Auth                                      

  Agora Agent Studio      Lead                    Studio loads
  opened once, so number                          
  import is possible                              

  Twilio account with a   Backend                 T1 can run
  number and an Elastic                           
  SIP Trunk, with geo                             
  permissions enabled for                         
  the Philippines                                 

  Google Cloud project    Voice                   T3 can run
  with Speech-to-Text v2                          
  and Text-to-Speech                              
  enabled, service                                
  account key                                     

  Microsoft Azure Speech  Voice                   A test synthesis in
  resource as the                                 fil-PH plays
  fallback TTS, since                             
  Azure is in Agora's                             
  base TTS vendor list                            
  and has Filipino neural                         
  voices (**verify**                              
  exact voice names)                              

  LLM API key (OpenAI     Backend                 A test completion works
  GPT-4.1 mini or Google                          
  Gemini 2.5 Flash)                               

  Supabase project        Backend                 Connection string works
  (Postgres, Auth,                                
  Storage)                                        

  Vercel project linked   Frontend                A blank Next.js deploys
  to the GitHub repo                              

  Hosting for FastAPI     Backend                 A hello endpoint is
  (Render, Fly.io or                              reachable over HTTPS,
  Railway free tier, or a                         because Agora must call
  Vercel Python function)                         it

  GitHub repo created,    Lead                    Link ready for the
  public, with this                               submission form
  `docs/` folder                                  
  committed                                       

  Domain or Vercel URL    Frontend                URL written in the
  decided for the                                 submission draft
  submission's website                            
  field                                           
  -----------------------------------------------------------------------

## 3. Data to prepare before the flight

This is preparation, not building. Prepare as text and files, not as
code.

Linea - One demo elder profile: name, age, language, medicine list with
times, family contacts, call time. - The daughter's recorded intro
message, 10 to 15 seconds, in Filipino, as an MP3. - Twenty sample elder
utterances for testing, including five alert triggers ("nahulog ako
kahapon", "hirap akong huminga", "masakit ang dibdib ko", "hindi ako
nakainom ng gamot", "nahihilo ako"). - The emergency number script. The
Philippines' national emergency number is 911.

Kasangga - One demo patient profile and a five exercise plan with sets,
reps and the one correction per exercise. - Angle thresholds from T4, as
a JSON file. - A nurse or physical therapist contact who can review the
exercise set and the safety rules for an hour this week.

Both - Photos for the pitch: a keypad phone on a kitchen table, a
printed exercise sheet, a real solar roof is no longer needed. - The two
minute pitch written and rehearsed once.

## 4. Evidence to gather, with where to look

The PRDs already cite the figures below. The team should open each
source and keep a screenshot in `docs/evidence/`.

  -----------------------------------------------------------------------
  Figure                  Status                  Source
  ----------------------- ----------------------- -----------------------
  9.2 million Filipinos   Cited                   PSA 2020 Census via
  aged 60 and over in                             Commission on
  2020, up from 7.5                               Population and
  million in 2015                                 Development

  Senior population       Cited                   PSA projections via CPD
  projected to about 13                           
  million by 2030, aging                          
  society between 2030                            
  and 2035                                        

  2.19 million OFWs in    Cited                   PSA Survey on Overseas
  2024                                            Filipinos, December
                                                  2025 release

  12 percent of older     Cited                   Longitudinal Study of
  Filipinos live alone,                           Ageing and Health in
  59 percent live with at                         the Philippines (LSAHP)
  least one child                                 Wave 2

  One in ten households   Cited                   LSAHP Wave 2, chapter 3
  of older persons has a                          
  member currently                                
  abroad, up from 4                               
  percent in Wave 1                               

  Half of older persons'  Cited                   LSAHP Wave 2, chapter 3
  households have                                 
  internet access                                 

  20 percent of older     Cited                   LSAHP Wave 2 executive
  persons report                                  summary
  difficulty with at                              
  least one activity of                           
  daily living; falls are                         
  prevalent                                       

  67 percent of           Cited                   LSAHP Wave 2
  healthcare costs for                            dissemination forum,
  older persons are paid                          ERIA
  out of pocket                                   

  Cerebrovascular         Cited                   PSA 2024 provisional
  diseases were the third                         causes of death,
  leading cause of death                          reported by Inquirer,
  in 2024 with 68,736                             September 2025
  deaths, 9.8 percent of                          
  701,861 deaths                                  

  33,710 registered       Cited                   PRC figure in Senate
  physical therapists as                          bill on the Philippine
  of 21 November 2021                             Physical Therapy Act

  DOH names physical      Cited                   DOH briefing, September
  therapists among the                            2022
  professions the country                         
  lacks                                           

  Home exercise adherence Cited                   Frontiers systematic
  after stroke is between                         review of stroke
  17.8 and 62 percent in                          patients' home
  published studies                               rehabilitation
                                                  experiences

  Fear of falling and     Cited                   Babbar et al.,
  fatigue are the most                            adherence to home based
  common barriers to home                         neuro rehabilitation,
  exercise after stroke                           74 patients

  Still to find: share of Open                    PSA, DOH, Philippine
  seniors with their own                          Physical Therapy
  mobile phone; number of                         Association
  PTs per province                                
  -----------------------------------------------------------------------

## 5. Questions still owed to the organizers

-   The semi final MVP criterion mentions assessing Kiro and Quick
    integration, while the FAQ exempts us. Is that 30 percent scored
    against us, and how?
-   Does Community count as a domain for the 25 percent domain fit? It
    appears in the track type but not in the criterion text.
-   Will Agora provide credits for the champions track, and how much?
-   When does the 12 hour build start and end exactly, and is it
    continuous?
-   Does starting from Agora's official sample apps count as allowed
    open source?
-   Will an Agora engineer be onsite during the build?
-   Is a website URL acceptable in place of a Play Store link?
-   What is the schedule for the 5 October presentation at SMX?

## 6. Team roles for the night

Five people, five lanes. Names to be filled in by the team.

  -----------------------------------------------------------------------
  Lane              Owns              Linea             Kasangga
  ----------------- ----------------- ----------------- -----------------
  Lead and backend  FastAPI, custom   Scheduler and     Event injector
                    LLM endpoint,     outbound call     and session state
                    tools, database,                    
                    Agora REST calls                    

  Voice and agent   Agora join body,  Elder script and  Coach persona and
                    ASR and TTS       alert triggers    exercise scripts
                    choice, prompts,                    
                    turn detection                      
                    tuning                              

  Frontend          Next.js app on    Family app,       Patient client
                    Vercel, Agora Web calendar, join    with camera,
                    SDK               call              therapist console

  Engine            The product's     Telephony, Twilio MediaPipe, angle
                    specific engine   trunk, retries    rules, state
                                                        machines

  Demo and          Demo data,        Judge's phone and Mat, lighting,
  submission        rehearsal, video, recorded fallback phone stand,
                    form, GitHub                        recorded fallback
                    README, pitch                       
  -----------------------------------------------------------------------

## 7. Build day runbook, shared

-   Hour 0, before any code: confirm which product, paste the Agora
    request body from the architecture doc into a Postman collection,
    confirm the backend URL is reachable from the internet, confirm the
    free minutes.
-   Every two hours: a five minute standup against the PRD's cut line
    table. If behind, cut, do not discuss.
-   Hour 10: freeze features. Only bugs, demo data and the video from
    here.
-   Hour 11: submission form filled from the PRD's draft, GitHub README
    updated with a feature to code map, video uploaded.
-   Hour 12: submitted. Then rehearse the two minutes twice.

## 8. Things to bring

A headset with a good microphone for the demo phone, a phone hotspot as
backup internet, a phone stand or tripod for Kasangga, an extension
cord, chargers, and the recorded fallback videos on a USB stick as well
as in the cloud.
