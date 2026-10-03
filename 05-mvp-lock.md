> **CURRENT OVERRIDE --- 3 October 2026:** This document is superseded
> in substance by the regenerated packet. Use it as the current MVP
> contract only after applying the current-session decisions in the
> handoff: English MVP, semantic safety, Routine/Significant/Emergency,
> same-call consent continuation, and second call attempt after
> failure/no-answer.

> **SAFETY POLICY UPDATE — 3 October 2026:** The five concern thresholds,
> medicine ambiguity handling, and non-linear conversation rules are now in
> `02-business-rules.md`, sections S-01 through S-09, as delegated by the
> current handoff. Those rules replace conflicting historical safety examples
> below. This adds no MVP concern or feature.

> **RETRY LOCK — 3 October 2026:** Two initial automatic connection attempts per scheduled
> check-in, with the second fifteen minutes after an unanswered/failed first
> attempt ends. Notify family after the first failure with the retry plan.
> A successful manual call cancels the pending retry. Never start a retry
> while another call for that elder is active.

> **RECONNECTION LOCK — 3 October 2026:** One separate automatic reconnection
> per logical check-in after an unexpected drop during an established call.
> Reconnect promptly once the old leg ends, acknowledge the drop conversationally,
> and continue from saved context. Preserve consent and safety state; an active
> Emergency continues its emergency response. No reconnect after an explicit
> stop or intentional close. Failed reconnection or another drop ends automatic
> redial and notifies family. See the current business rules for details.

> **CALENDAR LOCK — 3 October 2026:** Red takes precedence over Yellow over
> Green. A completed normal retry resolves a missed-call outcome, preserving
> both attempts. Routine concerns and incomplete/failed check-ins are Yellow;
> Significant/Emergency events remain Red despite a later successful call or
> a handled alert. Pending retries display "Retry scheduled" with provisional
> Yellow unless Red already applies. See the current business rules for details.

# Linea, the MVP lock

> **RETENTION LOCK — 3 October 2026:** Transcripts, summaries, and alert
> quotations expire after 90 days. Structured call/medicine/alert/calendar
> history expires after one year. Profiles, contacts, and consent records are
> kept while enrolled. No raw call audio. The current business rules define
> expiry handling, including the narrow consent-evidence exception.

> **ACCEPTANCE MATRIX:** `../01-test-day-checklist.md` now begins with the
> current MVP acceptance cases. All are NOT RUN; historical vendor test passes
> are background evidence and do not establish the implementation passes.

> **FAMILY DEPARTURE LOCK — 3 October 2026:** After the last family member
> leaves, Linea asks the remaining elder once whether there is anything else,
> then closes naturally unless unresolved safety needs attention. "Leave"
> affects only that member. "End call for everyone" is a separate intentional
> session end, with no automatic reconnection and no implied alert resolution.

Written 3 October 2026. This is the scope being built in the 12 hours.
It is deliberately smaller than the PRD's MVP table, because the PRD was
written before test day and this was written after it. Where the two
differ, this file wins. Nothing is added to it during the build without
being written here first, by the lead, with the time.

## The one user story

Nanay Rosa, 72, lives in Bohol with a keypad phone. Her daughter Ana
works in Dubai. Every morning at 8, Linea calls Nanay Rosa, greets her
by name, asks how she slept and whether she took her Losartan, and
listens. One morning she says she fell yesterday. Within ten seconds
Ana's phone shows the alert with those exact words. Ana taps join, hears
Linea say what her mother said, and talks to her mother. Nanay Rosa
never touched anything but the green button on her phone.

Everything in the MVP serves that story. Anything that does not is out.

## In scope, exactly

  -----------------------------------------------------------------------
  \#                      Feature                 Done means
  ----------------------- ----------------------- -----------------------
  1                       Elder profile with      Created from the web
                          name, honorific,        app, read by the
                          language `fil-PH`,      backend
                          phone in E.164, call    
                          time, one medicine with 
                          time of day, consent    
                          flag, up to three       
                          contacts                

  2                       "Call now" from the web Phone rings within 60
                          app, and a scheduled    seconds of either
                          call at the call time   

  3                       The check-in script     All four beats happen
                          with four beats and a   in order on a normal
                          warm close, driven by   call; the elder can
                          our backend as the      wander and Linea
                          agent's brain           returns once

  4                       Medicine logging as     The answer is stored
                          taken, not taken or     per call
                          unknown                 

  5                       Alert triggers in code  The exact phrase is
                          for five classes: fall, stored and sent within
                          breathing, chest pain,  10 seconds
                          dizziness, medicine not 
                          taken                   

  6                       Family alert as web     Ana's phone shows the
                          push and an in app      alert while the call is
                          alert list              live

  7                       Family join from the    Ana is heard on Nanay
                          web app into the live   Rosa's phone and hears
                          call, briefing through  her; Linea briefs then
                          speak, listen mode      stays quiet
                          enforced by empty       
                          replies                 

  8                       Emergency script in     Saying "masakit ang
                          code for breathing and  dibdib ko" produces the
                          chest pain, reading 911 script within 2
                          and the nearest         seconds; asking for
                          contact, and the no     advice produces the
                          advice script           fixed line

  9                       Post call summary and   Appear on the day
                          transcript from the     within 60 seconds of
                          history endpoint        call end

  10                      Calendar of the current Today's call sets
                          month with green,       today's color correctly
                          yellow and red days,    
                          tap to open the day     

  11                      Consent on the first    A "no" ends the call
                          call, recorded as her   and stops the schedule
                          words                   

  12                      Agent stopped with      No agent runs after a
                          leave at call end, idle call ends
                          timeout 60 as backstop  

  13                      Public GitHub repo with Submitted
                          README feature map, two 
                          minute video, website   
                          URL, submission form    
                          filled                  
  -----------------------------------------------------------------------

## Out of scope, by decision

-   The family's recorded intro as audio on the call. Described in the
    pitch instead. If a greeting audio field is found in hour two, it
    may come back, only then.
-   SMS. Web push and the in app list carry alerts. SMS from a US number
    to Philippine mobiles risks being blocked for unregistered senders.
-   Retry of unanswered calls. An unanswered call is a yellow day with
    `no_answer` and a notice to Ana.
-   Bisaya. Nanay Rosa speaks Tagalog in the demo.
-   Evening calls, an inbound number, weekly summaries, trends, export
    and delete, native apps, more than one medicine.
-   Any mobile app. The family app is a web page.
-   Any screen for the elder, ever.

## Defaults chosen now, override by 9 AM or they stand

  ------------------------------------------------------------------------
  Decision               Default                    Why
  ---------------------- -------------------------- ----------------------
  Voice                  Microsoft Azure            In Agora's base TTS
                         `fil-PH-BlessicaNeural`,   list and has Filipino.
                         rate 0.9                   Listen to it in hour
                                                    one and swap to Google
                                                    if it is worse

  Speech recognition     ARES, `fil-PH`             No key, no setup

  Language model         GPT-4.1 mini, called from  Already on the
                         our backend                account. Gemini 2.5
                                                    Flash if the key is
                                                    faster to hand

  Backend hosting        A teammate's laptop        Free and fast to set
                         running FastAPI, exposed   up. The laptop stays
                         with a Cloudflare Tunnel   plugged in, sleep
                         or ngrok                   disabled, and does not
                                                    leave the table.
                                                    Render is the fallback
                                                    if the tunnel is flaky
                                                    in hour one

  Database               Supabase Postgres          Free tier, Auth and
                                                    Storage included

  Web app                Next.js on Vercel, mobile  Website URL for the
                         first, magic link sign in  submission

  Tokens                 `agora-token-builder` in   Confirmed working uids
                         Python, uids 100 for the   from test day
                         gateway, 111 for the       
                         agent, 2002 and up for     
                         family                     

  Call placement         REST `POST /call` with the Confirmed on test day
                         full `properties` object,  with `pipeline_id`;
                         `llm.url` pointing at our  full properties is the
                         backend                    same call with our
                                                    brain

  Alerts                 Web push through the       No SMS
                         browser, plus the alert    
                         list in the app            

  Calendar               Current month grid of      Stronger demo than a
                         colored circles, tap to    list, small enough to
                         open the day               build

  Demo elder             Nanay Rosa, 72, Bohol,     Written as the demo
                         Losartan in the morning,   JSON
                         daughter Ana in Dubai,     
                         alert phrase "nahulog ako  
                         kahapon"                   

  Demo devices           Keith's phone is Nanay     Numbers already in the
                         Rosa; a teammate's laptop  profile
                         is Ana                     
  ------------------------------------------------------------------------

## How we work the 12 hours

Lanes and owners are in `00-prerequisites-and-discovery.md` section 6.
The hour by hour plan is in `01-prd.md` section 10. The rules below are
how the plan is run.

-   Hour zero is setup only. Repo, env, tunnel URL, Supabase schema, a
    hello from the backend over the public URL, the Agora bodies pasted
    into config. No feature work until all five can push and the backend
    answers from the internet.
-   Hours one to two prove the brain. Our endpoint receives real
    requests from Agora (B5), answers them, and can go quiet on command
    (B7). Everything after depends on this, so nobody starts the web app
    until the brain answers.
-   Build the call before the calendar. The order is call, script,
    alerts, join, then summary and calendar. A demo with a working call
    and a plain list of days beats a beautiful calendar and a call that
    drops.
-   Every two hours, five minutes against the cut lines in the PRD. If
    behind, cut the next line. No discussion.
-   Hour ten is the feature freeze. From there it is bugs, demo data,
    three clean runs, video, README, form, pitch.
-   The demo is rehearsed three times in a row without a restart before
    anyone records the video.
-   One person owns the submission form from hour ten and nobody else
    edits it.

## Definition of done for the demo

A judge's phone rings. Linea greets by name in Filipino and asks about
sleep and medicine. The judge says they fell yesterday. Ana's screen
shows the alert with those words within ten seconds. A teammate taps
join and is heard on the judge's phone. Linea briefs in ten seconds and
goes quiet. The call ends, and the calendar shows today in red with the
summary. That sequence runs three times in a row at the table before it
runs once on stage.

## What we tell the judges we did not build, and why

The intro recording, SMS, retries, Bisaya and the evening call are all
in the PRD's next tier. We say so plainly, and we say that each one is a
day of work, not a rethink, because the hard part, the phone call with
the family inside it, is the part that works.
