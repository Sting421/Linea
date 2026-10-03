> **CURRENT OVERRIDE --- 3 October 2026:** FastAPI is the deterministic
> product brain. Safety uses semantic structured classification followed
> by deterministic policy. MVP conversation is English. Listen mode is
> enforced by empty completions. Initial connection has two automatic attempts,
> with the second fifteen minutes after the first unanswered/failed attempt ends.
> Notify family after the first failure with the retry plan. A successful
> manual call cancels the pending retry; another active call blocks placement.
> One separate reconnection is allowed after an established conversation drops.
> Persist a logical check-in across phone legs and restore conversation state.
> Verify disconnect detection and replacement-leg handling against Agora;
> historical request bodies do not establish those behaviors.

# Linea, Project Architecture

Version 1.0, 1 October 2026. Exact Agora field names are in
`../shared/agora-platform-reference.md`. Copy request bodies from here
rather than retyping.

## 1. Components

``` mermaid
flowchart LR
  subgraph Elder
    P["Elder's phone, any phone"]
  end
  subgraph Telephony
    TW[Twilio Elastic SIP Trunk]
  end
  subgraph Agora
    CA[Conversational AI Engine agent]
    RTC[RTC channel]
    TEL[Telephony gateway]
  end
  subgraph Ours
    API[FastAPI backend]
    SCH[Scheduler job]
    DB[(Supabase Postgres)]
    WEB[Next.js family app on Vercel]
  end
  subgraph Vendors
    ASR[ARES or Google ASR]
    TTS[Azure or Google TTS]
    LLM[GPT-4.1 mini or Gemini 2.5 Flash]
  end
  SCH -->|call API| TEL
  TEL --> TW --> P
  TEL --> RTC
  CA --> RTC
  CA -->|audio| ASR
  CA -->|text| API
  API -->|completion| LLM
  CA -->|reply text| TTS
  API <--> DB
  WEB <--> API
  WEB -->|Web SDK join| RTC
  API -->|"speak, think, leave, history"| CA
```

The elder's phone is on a normal phone line. Agora's telephony gateway
bridges the SIP call into an RTC channel, where the agent and, when
invited, the family member's browser also sit. Our FastAPI backend is
the agent's language model endpoint, so every elder utterance passes
through our rules before any model sees it.

## 2. Sequences

### 2.1 Morning call

``` mermaid
sequenceDiagram
  participant S as Scheduler
  participant A as FastAPI
  participant AG as Agora call API
  participant E as Elder's phone
  participant C as Agent
  participant F as Family app
  S->>A: due check-ins at 08:00
  A->>A: build properties (script, voice, rules)
  A->>AG: POST /call {sip.to_number, properties}
  AG->>E: ring
  E-->>AG: answer
  C->>E: greeting (first call: intro audio or speak)
  loop each turn
    E->>C: speech
    C->>A: POST /v1/chat/completions (turn_id)
    A->>A: rules: alert scan, medicine logging, advice check
    A-->>C: short reply text
    C->>E: TTS
    opt alert matched
      A->>F: push and SMS with exact phrase and join link
    end
  end
  C->>E: warm close
  A->>AG: POST /agents/{id}/leave
  A->>AG: GET /agents/{id}/history
  A->>A: summary, day color
```

### 2.2 Family join

``` mermaid
sequenceDiagram
  participant F as Family browser
  participant A as FastAPI
  participant AG as Agora REST
  participant C as Agent
  participant E as Elder
  F->>A: POST /calls/{id}/join
  A->>A: issue RTC token for channel, uid
  A-->>F: token, channel, uid
  F->>F: Web SDK join, publish mic, subscribe
  A->>AG: POST /agents/{id}/speak {briefing, INTERRUPT}
  C->>E: briefing (family hears too)
  A->>AG: POST /agents/{id}/think {"listen mode", inject}
  F->>E: family talks
  F->>A: POST /calls/{id}/leave
  A->>AG: POST /agents/{id}/think {"family left, ask once, close"}
```

## 3. Tech stack

  -------------------------------------------------------------------------------------------
  Layer        Choice           Package or service                 Why
  ------------ ---------------- ---------------------------------- --------------------------
  Voice agent  Agora            REST `join`, `call`, `think`,      Custom LLM endpoint is
               Conversational   `speak`, `leave`, `history`        only available in
               AI Engine,                                          cascading mode
               cascading mode                                      

  Telephony    Twilio Elastic   Twilio Console                     Agora documents Twilio
               SIP Trunking,                                       step by step
               number imported                                     
               in Agora Agent                                      
               Studio                                              

  ASR          ARES `fil-PH`    `asr.language`                     Zero setup; Google Chirp 2
               (default vendor,                                    for Cebuano if T3 passes
               no key)                                             

  TTS          Microsoft Azure  `tts.vendor: microsoft`,           In Agora's base vendor
               Speech, Filipino `params.key, region, voice_name`   list, has fil-PH voices
               neural voice                                        (**verify** names such as
                                                                   `fil-PH-BlessicaNeural`)

  LLM          OpenAI GPT-4.1   OpenAI or Google SDK               Fast, cheap, tool calling;
               mini or Gemini                                      the script and rules do
               2.5 Flash,                                          not depend on it
               called from our                                     
               backend                                             

  Backend      Python 3.12,     `fastapi`, `httpx`, `pydantic`,    Team's fastest path; one
               FastAPI, uvicorn `apscheduler`                      service hosts the custom
                                                                   LLM endpoint, tools,
                                                                   webhooks and scheduler

  Backend      Render or Fly.io Dockerfile                         Agora must reach the LLM
  hosting      free tier                                           endpoint; serverless cold
               (always on,                                         starts would add delay to
               public HTTPS)                                       every turn

  Database     Supabase         `supabase-py` on the server,       Auth, storage for the
               Postgres with    `@supabase/supabase-js` in the web intro MP3, realtime for
               Row Level        app                                the alert list
               Security                                            

  Web app      Next.js 15,      `agora-rtc-sdk-ng` for the join    Deploys to Vercel in
               React 19,        call                               minutes; website URL for
               TypeScript,                                         the submission
               Tailwind                                            

  Alerts       Web Push through `pywebpush`, Twilio SDK            Same Twilio account as the
               the browser,                                        trunk
               Twilio                                              
               Programmable SMS                                    
               as fallback                                         

  Scheduler    APScheduler      `apscheduler`                      One process, no extra
               inside FastAPI                                      infra; move to Supabase
               for the MVP                                         cron later

  Tokens       Agora token      `agora-token-builder`              RTC tokens for the agent
               builder for                                         and for family joins
               Python                                              

  Secrets      Environment                                         Never in the repo
               variables on                                        
               Render and                                          
               Vercel                                              
  -------------------------------------------------------------------------------------------

## 4. Agora request bodies

### 4.1 Outbound call with full properties

``` json
{
  "name": "linea-{elder_id}-{yyyymmdd}",
  "sip": {
    "to_number": "+639XXXXXXXXX",
    "from_number": "+14236075541",
    "rtc_uid": "100",
    "rtc_token": "<token for channel, uid 100>"
  },
  "properties": {
    "channel": "linea-{elder_id}-{yyyymmdd}",
    "token": "<token for channel, uid 111>",
    "agent_rtc_uid": "111",
    "remote_rtc_uids": ["100"],
    "idle_timeout": 60,
    "advanced_features": { "enable_rtm": false },
    "asr": { "language": "fil-PH" },
    "tts": {
      "vendor": "microsoft",
      "params": {
        "key": "<azure key>",
        "region": "southeastasia",
        "voice_name": "fil-PH-BlessicaNeural"
      },
      "skip_patterns": [3, 4]
    },
    "llm": {
      "url": "https://<backend>/agora/v1/chat/completions",
      "api_key": "<shared secret>",
      "vendor": "custom",
      "style": "openai",
      "system_messages": [{ "role": "system", "content": "<built per elder, see design guidelines>" }],
      "params": { "model": "linea-v1", "elder_id": "<id>", "call_id": "<id>" },
      "max_history": 32,
      "greeting_message": "Magandang umaga po, Nanay Rosa. Si Linea po ito.",
      "failure_message": "Sandali lang po."
    },
    "turn_detection": {
      "type": "agora_vad",
      "interrupt_mode": "interrupt",
      "silence_duration_ms": 1200,
      "prefix_padding_ms": 800,
      "threshold": 0.5
    },
    "parameters": {
      "silence_config": { "timeout_ms": 8000, "action": "speak", "content": "Nandito pa po ako. Kumusta po kayo?" }
    }
  }
}
```

Field names confirmed on 2 October against a live call: `sip.rtc_uid`
and `sip.rtc_token` are the gateway's uid and token, and on telephony
calls `remote_rtc_uids` must contain exactly that one uid. The `name`
must be unique per live session, otherwise Agora returns `TaskConflict`
with the running `agent_id`. The App ID for the Linea project is
`7ab960ee43524673ab868ef4bb60c636`. Per session retention opt out is
added here once the field name is confirmed in the Console.

### 4.2 Speak briefing on family join

``` json
{ "text": "Si Linea po ito. Nasa linya si Nanay Rosa. Nakatulog siya nang maayos, hindi pa niya nainom ang gamot sa umaga, at sinabi niyang nahulog siya kahapon. Ikaw na po.", "priority": "INTERRUPT" }
```

### 4.3 Think instruction for listen mode

``` json
{ "text": "[SYSTEM] A family member has joined. Enter listen mode: do not speak unless addressed as Linea or unless a safety trigger occurs.", "on_listening_action": "inject", "on_thinking_action": "ignore", "on_speaking_action": "ignore", "interruptable": true }
```

The backend also sets a `mode=listen` flag on the call so the custom LLM
endpoint returns an empty reply for non addressed turns, which is the
enforcement; the think instruction is the hint. Test B4 confirmed the
hint alone is not enough. On telephony calls the agent only hears the
phone line anyway, since it subscribes to the gateway uid alone, so the
family member is never heard by the agent and listen mode is effectively
natural; the backend rule still matters for the in app fallback and for
the elder addressing Linea while the family is on.

## 5. Our API contracts

### 5.1 Custom LLM endpoint (called by Agora)

`POST /agora/v1/chat/completions`, bearer `api_key`. Request is OpenAI
chat completions shape with `messages`, plus `turn_id` and `timestamp`
from Agora, plus our `params` echoed as model fields (**verify** how
params arrive; fall back to encoding `call_id` in `llm.url` as a query
string).

Processing order per request 1. Resolve `call_id` and load call state
(script beat, medicine results, mode). 2. Take the last user message.
Normalize. Run alert scan (rules A). Run advice detection (rule V-07).
Run medicine answer parsing if the current beat is medicine. 3. If
emergency class: return the emergency script text directly, raise
alerts, set `mode=emergency`. Do not call the model. 4. If advice
requested: return the fixed script. Raise alert. 5. If `mode=listen` and
the text does not contain "Linea": return a completion with empty
content. 6. Otherwise call the model with the system prompt, the script
state and the last 8 turns. Ask for at most two short sentences. Return
as a non streaming chat completion. 7. Persist the turn.

Response: standard chat completion JSON with one choice.

### 5.2 Web app endpoints

  ------------------------------------------------------------------------
  Method                Path                         Purpose
  --------------------- ---------------------------- ---------------------
  POST                  `/elders`                    Create or update
                                                     profile, medicine
                                                     list, contacts, call
                                                     time

  POST                  `/elders/{id}/intro`         Upload intro MP3 to
                                                     Supabase Storage

  POST                  `/elders/{id}/call-now`      Start a call
                                                     immediately (demo and
                                                     test)

  GET                   `/elders/{id}/days?month=`   Day colors, summaries

  GET                   `/calls/{id}`                Transcript, alerts,
                                                     status

  POST                  `/calls/{id}/join`           Issue RTC token for
                                                     the family member,
                                                     trigger briefing and
                                                     listen mode

  POST                  `/calls/{id}/leave`          Family member left

  POST                  `/alerts/{id}/handled`       Mark handled

  POST                  `/webhooks/agora`            Agent state and
                                                     history events (if
                                                     webhooks are
                                                     configured)
  ------------------------------------------------------------------------

## 6. Data model

``` sql
create table elders (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  name text not null,
  language text not null default 'fil-PH',
  phone_e164 text not null,
  call_time time not null,
  timezone text not null default 'Asia/Manila',
  consent_status text not null default 'pending', -- pending | granted | declined
  consent_recorded_at timestamptz,
  intro_audio_url text,
  created_at timestamptz default now()
);

create table medicines (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid references elders(id) on delete cascade,
  name text not null,
  time_of_day text not null -- morning | evening
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid references elders(id) on delete cascade,
  name text not null,
  phone_e164 text,
  account_user_id uuid, -- null for SMS only contacts
  is_primary boolean default false,
  is_nearby boolean default false
);

create table calls (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid references elders(id) on delete cascade,
  scheduled_for timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  agora_agent_id text,
  channel text,
  status text not null default 'scheduled', -- scheduled | ringing | in_call | ended | no_answer | failed
  mode text not null default 'script', -- script | listen | emergency
  beat text not null default 'greeting', -- greeting | sleep | medicine | feeling | anything | close
  summary text
);

create table turns (
  id bigserial primary key,
  call_id uuid references calls(id) on delete cascade,
  turn_id int,
  role text not null, -- user | agent
  content text not null,
  at timestamptz default now()
);

create table medicine_logs (
  id bigserial primary key,
  call_id uuid references calls(id) on delete cascade,
  medicine_id uuid references medicines(id),
  result text not null -- taken | not_taken | unknown
);

create table alerts (
  id bigserial primary key,
  call_id uuid references calls(id) on delete cascade,
  class text not null,
  severity text not null, -- low | medium | high | emergency
  phrase text not null,
  raised_at timestamptz default now(),
  handled_at timestamptz,
  handled_by uuid
);

create table days (
  elder_id uuid references elders(id) on delete cascade,
  day date not null,
  color text not null, -- green | yellow | red
  reason text,
  primary key (elder_id, day)
);
```

Row Level Security: a user sees elders where `account_id` matches, or
where they are a contact with an account.

## 7. Environment variables

    AGORA_APP_ID=
    AGORA_APP_CERTIFICATE=
    AGORA_CUSTOMER_ID=
    AGORA_CUSTOMER_SECRET=
    AGORA_FROM_NUMBER=+14236075541
    AGORA_SIP_GATEWAY_UID=100
    LLM_ENDPOINT_API_KEY=            # shared secret Agora sends as bearer
    AZURE_SPEECH_KEY=
    AZURE_SPEECH_REGION=southeastasia
    OPENAI_API_KEY= or GOOGLE_API_KEY=
    SUPABASE_URL=
    SUPABASE_SERVICE_ROLE_KEY=
    TWILIO_ACCOUNT_SID=
    TWILIO_AUTH_TOKEN=
    TWILIO_SMS_FROM=
    VAPID_PUBLIC_KEY= / VAPID_PRIVATE_KEY=
    PUBLIC_BASE_URL=https://<backend>

## 8. Deployment

-   Backend: Docker image on Render (Singapore region) or Fly.io (sin).
    Health check on `/health`. Keep one always on instance so Agora
    never hits a cold start.
-   Web: Vercel, production branch `main`, preview on PRs.
-   Database: Supabase, Southeast Asia region.
-   The demo environment is the production environment. No staging on
    the night.

## 9. Security

-   Agora calls our LLM endpoint with a bearer token; reject requests
    without it.
-   RTC tokens expire in one hour and are issued per call and per uid.
-   Family join tokens are issued only to account users who are contacts
    of the elder.
-   Agora Basic Auth credentials live only on the backend.
-   No audio stored. Transcripts under RLS.

## 10. Observability

-   Log every Agora REST call and response status with `call_id`.
-   Log every custom LLM request with `turn_id`, classification result,
    and model latency.
-   If `enable_rtm` and `enable_metrics` are turned on, surface agent
    latency metrics in the backend logs. Optional for the MVP.
-   A `/debug/calls/{id}` page in the web app for the team on the night,
    hidden behind a flag.

## 11. Failure modes and fallbacks

  -----------------------------------------------------------------------
  Failure                 Detection               Fallback
  ----------------------- ----------------------- -----------------------
  `call` returns non 200  HTTP status             Retry once, then day
                                                  yellow `system`, family
                                                  notified

  Call not answered       Agent idle timeout, no  Day yellow `no_answer`
                          user turns              

  Our LLM endpoint slow   Agora speaks            Keep the endpoint fast:
  or down                 `failure_message`       rules first, model with
                                                  a 2 second timeout,
                                                  canned fallback line

  ASR misses Filipino     Low quality transcript  Alert phrases include
  words                                           common misrecognitions;
                                                  agent repeats the
                                                  question

  Family cannot join      Join error in browser   Show the live
  (token or network)                              transcript and a "call
                                                  her directly" button
                                                  with the elder's
                                                  number. On the night,
                                                  webdemo.agora.io Basic
                                                  Voice Call with a temp
                                                  token is the zero code
                                                  fallback for the join

  Agora minutes exhausted 4xx from Agora          Second App ID in env,
                                                  switch by flag

  Telephony fails at the  T1 style test fails on  In app call with the
  venue                   stage                   browser as the elder's
                                                  phone, plus recorded
                                                  video
  -----------------------------------------------------------------------

## 12. Cost estimate per elder per day at MVP rates

About 4 minutes of Conversational AI at \$0.10 per minute after free
minutes, about 4 minutes of Twilio SIP trunking to a Philippine mobile
at \$0.203 to \$0.290 per minute (read from the Twilio geo permissions
page on 2 October), Azure TTS characters for roughly 400 words, and ARES
at no extra charge. That is roughly \$1.20 to \$1.80 per elder per day
at MVP rates. The roadmap item that brings it down is a Philippine local
trunk partner, since Twilio prices by destination and a local carrier
terminates to Philippine mobiles for a fraction of the international
rate. Shorter calls help too.
