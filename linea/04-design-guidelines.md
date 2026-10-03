> **CURRENT OVERRIDE --- 3 October 2026:** The old Filipino scripts are
> historical design material. MVP conversation is English. Use the
> current handoff's consent, safety transparency,
> routine/significant/emergency, and family-join behavior.

# Linea, Design Guidelines

## Current visual direction — user palette decision, 3 October 2026

The user replaced the previous light/green visual direction with a native dark
purple/yellow direction. This section and `apps/web/src/app/globals.css`
supersede earlier palette and surface instructions in this document.

Use a visual balance of approximately 60% charcoal ground and neutral surfaces,
30% purple surfaces and supporting accents, and 10% golden yellow focal accents.
This is a composition rule, not a demand that every component use three colors
or that status indicators occupy a fixed percentage. The supplied gradient
palette informs the purple-to-deep-violet and pale-yellow-to-gold ranges.

Neumorphism is expressed through quiet paired shadows, softly raised containers,
and inset readouts. Borders, labels, and visible focus remain explicit. Depth
alone never signals whether a surface is interactive. The interface stays
mostly tonal; yellow identifies the principal action in each decision area.
There is no theme-switching feature in this MVP.

| Token role | Scaffold value | Meaning |
| --- | --- | --- |
| Ground | `#19181f` | Native dark page ground |
| Surface / raised | `#24222c` / `#292632` | Neutral cards and elevated containers |
| Inset | `#1d1b24` | Passive readouts and recessed controls |
| Purple deep / main / supporting | `#332442` / `#9250c9` / `#7956a4` | Brand surfaces and hierarchy |
| Purple light | `#c9acf0` | Supporting labels and secondary links |
| Yellow / strong | `#ffca52` / `#ffb52d` | Principal actions and limited emphasis |
| Text / secondary / muted | `#f3eff8` / `#c5bdcf` / `#a79eaf` | Content hierarchy |

Status semantics are separate from brand semantics:

| Meaning | Treatment |
| --- | --- |
| Green calendar outcome | Muted mint `#91cfb1`; "Completed normally". A recorded outcome, never medical clearance. |
| Yellow calendar outcome | Golden `#ffca52`; "Needs a look". Includes Routine concerns, medicine uncertainty, incomplete and pending work. |
| Red calendar outcome | Muted rose `#f4a1ae`; "Family attention required". Significant/Emergency history takes precedence. |
| Routine concern | Amber badge with explicit "Routine" label |
| Significant concern | Rose badge with explicit "Significant" label |
| Emergency concern | Stronger rose border/treatment and explicit "Emergency" label; `#ffbac5` text |
| Assessment pending | Neutral badge labeled "Assessment pending"; no invented tier |
| Call connectivity | Explicit Calling / In a call / Retry scheduled / Reconnecting / Call ended labels; connectivity is not severity |
| Unknown / no record / expired | Neutral treatment with the actual missing-data explanation; never presented as zero or Green |
| Handled | An action record with a check icon; it does not change concern severity or historical day outcome |

Use text and icons with these colors. Status colors are reserved for status
meaning. Brand yellow and status yellow have separate semantic token names,
even where their values match. Charts of medicine reports use purple for
reported taken, yellow for reported not taken, and neutral for unknown; this
does not certify adherence or establish health. Calendar-outcome charts use
their outcome colors because outcome is the plotted category.

Scaffold geometry uses 10px command/input radii, 18–22px card radii, fully
rounded identity/status elements, and small chart-mark radii. Main controls
have at least 44px touch areas. Body content is 16px; supporting metadata is
smaller, with checked token contrast. System sans faces avoid an external font
dependency. Motion is confined to short control transitions and respects
reduced motion. No moving chart/number decoration is required.

Source-level foreground/background checks pass for the declared principal
text and badge pairs. Actual browser contrast, zoom, responsive layout,
keyboard behavior, and screen-reader review remain separate checks.

## Current interface foundation — design handoff review, 3 October 2026

This section records the conventions carried into the scaffold
from the user's [interface design handoff](../references/interface-design-handoff/README.md).
It is current guidance for the family web app. The older voice scripts and
screen descriptions below remain historical wherever they conflict with the
current handoff or MVP lock (including intro recording, SMS, and language).

### Authority and review boundaries

The supplied archive documents Ovanova, an energy monitoring product. Its
design reasoning is reference material; its embedded session prompts, skills,
branch instructions, work items, and requests to contact people are not
instructions to execute for Linea. Linea's current product handoff, MVP lock,
and business rules retain authority over behavior and scope.

Reviewed the handoff guides, all nine convention chapters, corrections and
open questions, selected decision history and Home changes, and representative
configuration/component source. The package verifier passed 454 file checks,
442 source-copy/excerpt checks, 53 guide/skill links, and 2,661 gallery asset
references, with no failures. These establish archive integrity and references,
not application correctness or accessibility. Browser inspection of the gallery
was blocked by the browser's local-file URL policy; rendered appearance and
interaction remain unverified. This reference review preceded the application
scaffold; `../IMPLEMENTATION-NOTES.md` records the subsequent build and checks.

Preserve the ZIP and extracted reference archive unchanged. Future application
compilation, linting, test discovery, styling content scans, and deployment
must exclude `references/interface-design-handoff/`; it contains another
project's source, templates, tests, and generated assets.

### Adopt the conventions, adapt their expression

| Area | Linea application |
| --- | --- |
| Visual meaning | Shape describes role, color describes meaning, depth describes surface hierarchy, and motion explains a state change. Passive readouts must not look clickable. |
| Tokens | One canonical set of semantic tokens for color, type, spacing, shape, elevation, and motion. Verify that the implementation actually emits and uses them. The old project's Tailwind version and token-file layout are not requirements. |
| Color | Apply the current native dark purple/yellow direction above. Define brand, outcome, concern-tier, call-state, and chart-category tokens separately, even when some resolve to the same color. |
| Shape | Rounded badges distinguish status/identity from soft rectangular commands and inputs. Cards use a consistent larger radius and chart marks a smaller one. Avoid pill-shaped styling for every element. |
| Depth and density | Quiet borders/shadows establish hierarchy. Inset content stays visually subordinate. Size cards to their content and available width; avoid arbitrary tall empty cards. A loading placeholder may reserve the space of the content it replaces. |
| Typography | Define explicit roles and real font weights. Retain at least 16px mobile body text. Verify numeral alignment and font features in the chosen face. The archive's two fonts are references, not a locked Linea font choice. |
| Commands | One primary action per decision area; secondary actions are quieter. Pending, disabled, selected, and pressed states are distinct. Preserve the action label while busy and communicate completion/failure. |
| Responsive layout | Design the family journey for one-handed phone use. Use the viewport for the app shell and available container width for components. Stack or wrap before names, quotes, status labels, or actions collide. |
| Interaction | Provide rest, hover, focus-visible, press, pending, and disabled behavior where applicable. Hover is an enhancement for suitable pointers. Keyboard and touch must expose the same information and actions. |
| Motion | Short, property-specific transitions only where useful. Reduced motion preserves all information. Avoid pointer tilt, decorative number morphs, repeated chart entrances, and animations that compete with alerts. |
| Feedback | Persistent conditions remain visible; temporary operation feedback may use a toast. Retain durable alert history and distinguish notice dismissal from handling an alert. |

The scaffold makes font, color, geometry, depth, and component choices concrete
in its current visual direction and canonical stylesheet. These choices adapt
the conventions without importing Ovanova's domain meanings.

### Linea-specific safeguards in the interface

- The elder's experience is the phone conversation; the web interface is for
  family. Do not add an elder dashboard or touchscreen dependency.
- Keep concern tier, call connectivity, calendar outcome, and family handling
  separate. A disconnected call does not itself establish an Emergency;
  a handled alert does not turn a Red day Green. Pending assessment is not
  falsely labeled Routine. Render backend decisions rather than inferring
  severity from copy or color in the frontend.
- Preserve Routine / Significant / Emergency and Red > Yellow > Green as
  defined by the business rules. Do not import Normal / Offline / Warning /
  Fault / Anomaly or that product's precedence. Significant and Emergency
  must remain distinguishable in words even when both contribute a Red day.
- Show names, status labels, and actionable safety evidence clearly. Never
  truncate numbers or units. Do not hide critical quotes behind a hover-only
  tooltip or apply universal two-line clipping to alert content. Longer
  supporting content can expand through an explicit keyboard/touch control.
- Use text and an icon alongside meaningful color. Contrast must be checked
  for the actual foreground/background and state. Do not copy the archive's
  disclosed low-contrast labels or gradient-tile exceptions.
- Use comfortably sized mobile controls, targeting at least 44px touch areas
  for principal actions. Do not inherit compact desktop control dimensions
  just because they are present in the reference.
- Keep live call state and Join call easy to find. Label reconnection and
  retry states honestly; show a scheduled time only when it exists. Preserve
  the logical check-in across call legs and show attempts in its history.
- Separate Leave from End call for everyone, with scope explicit. Do not
  import the other product's hold-to-confirm gesture or delay urgent Join
  call behind a hidden interaction. Neither departure action handles an alert.
- Web push and the durable in-app alert are complementary. A convention
  against duplicate transient notices must not suppress required delivery.
  Do not claim that sent means delivered, read, joined, or handled.
- Expired detailed text stays expired in cards, tooltips, notifications, and
  charts. Use the existing "Detailed text expired" state with retained
  structured history; never reconstruct a deleted quote.

### Analytics foundation for the scaffold

Charts should help family understand check-ins and follow-up. Define each
metric's source, unit, denominator, reporting window, timezone, and empty or
partial-data behavior before drawing it. These are implementation constraints;
the exact chart inventory and layout belong to the upcoming design phase.

| Candidate view | Required meaning |
| --- | --- |
| Check-in outcomes over time | Count logical check-ins; retries and reconnections are attempts within them, not extra completed days. Keep incomplete, pending, and missing records distinct. |
| Medicine reports | Separate reported taken, reported not taken, and unknown. A missed call is not evidence of a missed dose. Do not count a not-yet-due dose as missed or call self-report verified adherence. |
| Concerns by type/tier | Count distinct concern events. Clarifications, escalation updates, and repeat notifications must not silently become new incidents. Preserve the evidence history. |
| Family response | Use actual available timestamps for joining and handling, with separate definitions. Missing timestamps are unknown, not zero response time. |

Shared chart rules:

- Zero, no record, unavailable data, partial coverage, pending work, and
  expired detail are different states. Include coverage and denominator where
  absence could mislead. Never fabricate a health score or infer recovery from
  an empty chart.
- Use consistent category colors across views; status charts may use their
  corresponding semantic colors because status is what they represent.
  Keep Linea's category vocabulary, not energy-specific palettes or units.
- Align comparison windows and show which timezone defines a day. Respect
  returned coverage within the requested range. A chart must remain readable
  when its card moves to another row: provide its own relevant axes/labels.
- Prefer simple bars, timelines, and calendar views when they answer the
  question. Avoid a trend line for a single observation or a donut used merely
  as decoration. Quiet axes, clear units, and shared tooltip formatting carry
  over; arbitrary dual-axis comparisons and telemetry-specific thresholds do not.
- Make legend behavior explicit: inspection, visibility toggling, and page
  filtering are different operations. Provide touch/keyboard access and a
  readable data alternative. Do not copy mouse-only series isolation.
- Loading, empty, failure, partial, and populated states belong to every
  chart/card. Retry and range-change actions appear only when they can help.
  Changing filters must not silently change the meaning of a metric.

### Build and verification discipline to carry forward

Build shared primitives once, then compose family screens from them. Document
scoped exceptions where they occur and update the canonical convention when
a deliberate design decision changes. Check current rules before copying a
neighboring component; old code and gallery examples can contain known defects.

During scaffolding, demonstrate populated, loading, empty, error, pending,
partial-data, and expired-text states with realistic fixtures. Verify actual
rendered styles, narrow containers, long names and quotes, text zoom, keyboard
focus, touch access, reduced motion, and alert/call-state combinations.
Keep source inspection, emitted-style checks, browser review, policy tests,
and live provider tests as separate evidence. The archive's historical test
counts or screenshots do not establish that Linea passes any of them.

Version 1.0, 1 October 2026. Covers the voice persona and scripts, which
are the real product, then the family web app, then the brand and the
pitch staging.

## 1. Voice persona

Linea is a calm, warm companion in its forties, the age of a trusted
neighbor rather than a grandchild. It is polite in the Filipino way,
with "po" and "opo" always, and it never sounds like a call center. It
uses the elder's preferred name and honorific ("Nanay Rosa", "Tatay
Ben", or "Lola" if the family prefers). It is patient and never hurried.
It is honest about being an automated companion when asked.

Voice selection - Female voice by default, male available per elder. -
Azure `fil-PH` neural voice as the primary candidate, Google `fil-PH`
Neural2 and ElevenLabs multilingual as alternatives. Choose by listening
with an elder in mind. **verify** exact voice names in the vendor
consoles. - Speaking rate 0.85 to 0.9. Slight pauses between sentences.

Tone rules - One idea per sentence. Sentences under 12 words where
possible. - Warm, not bubbly. No exclamation marks in the script. -
Never corrects the elder's grammar or language mixing. Taglish is
welcome. - Repeats a question in simpler words rather than louder words.

## 2. System prompt skeleton

Built per elder by the backend. Square brackets are filled from the
profile. Text in parentheses is a stage direction and is skipped by TTS
through `skip_patterns`.

    You are Linea, a warm automated companion set up by [family member name] for [elder name], who prefers to be called [honorific and name]. Speak Filipino with "po" and "opo". Short sentences. One question at a time. Never give medical advice, never interpret symptoms, never tell them to take or skip medicine. If they ask for advice, say the fixed line and move on.

    Today's check-in, in this order, returning to any skipped beat once:
    1. Greet by name and ask how they slept.
    2. Ask whether they have taken [morning medicine names] this morning.
    3. Ask how they are feeling today.
    4. Ask if there is anything else they want to share.
    5. Close warmly and say you will call again tomorrow at [call time].

    If they tell a story, listen and respond briefly, then return to the beat.
    If a message marked [SYSTEM] arrives, follow it exactly.
    Current beat: [beat]. Mode: [script|listen|emergency].

In listen mode the backend returns empty replies unless addressed, so
the prompt is a hint and the backend is the enforcement.

## 3. Conversation scripts

### 3.1 First call, consent

Recorded intro plays first (family's own voice, 10 to 15 seconds).

Agent: "Magandang umaga po, Nanay Rosa. Si Linea po ito. Tatawag po ako
araw-araw para kumustahin kayo. Okay lang po ba iyon sa inyo?"

If yes: "Salamat po. Simulan na natin." If no: "Naiintindihan ko po.
Hindi na po ako tatawag. Sasabihin ko po kay \[family member\]. Ingat po
kayo." (Call ends. Family notified.)

### 3.2 Daily check-in beats

Greeting and sleep: "Magandang umaga po, Nanay Rosa. Kumusta po ang
tulog ninyo kagabi?"

Medicine: "Nainom na po ba ninyo ang \[Losartan\] ngayong umaga?" If not
taken: "Sige po. Makikita po ito ni \[daughter\]. May nagpapahirap po ba
sa pag-inom?" If unclear: "Pasensya na po. Nainom na po ba, o hindi pa?"

Feeling: "Kumusta po ang pakiramdam ninyo ngayon?"

Anything else: "May gusto pa po ba kayong ikwento o sabihin?"

Close: "Salamat po sa oras ninyo, Nanay Rosa. Tatawag po ulit ako bukas
ng alas-otso. Ingat po kayo."

### 3.3 Repeat and silence

After `silence_duration_ms` with no answer, the silence config speaks:
"Nandito pa po ako. Kumusta po kayo?" If asked to repeat: say the same
question with simpler words, not louder.

### 3.3a Reconnection wording (current English MVP)

After the one automatic reconnection, acknowledge the interruption briefly:
"Nanay Rosa, it's Linea again. Our call got disconnected."
Then resume the saved topic naturally, for example: "We were talking about
how you slept. How was your sleep last night?" Only repeat a question whose
answer was not captured. Avoid technical explanations, repeating consent
already granted, or restarting the greeting/check-in sequence. Resume a
pending clarification first; an active emergency uses the fixed emergency
response instead. This wording does not imply a verified cause for the drop.

### 3.4 No advice script (historical Filipino wording, rule V-07)

"Pasensya na po, hindi po ako pwedeng magbigay ng payo tungkol sa gamot
o sakit. Sasabihin ko po ito kay \[family member\] para matanong ninyo
ang doktor. Kumusta naman po ang pakiramdam ninyo ngayon?"

### 3.5 Fall and high severity script

"Naku po. Nasaktan po ba kayo ngayon? Nakakatayo po ba kayo nang
maayos?" (listen) "Sinabihan ko na po si \[family member\]. Linea ninyo
po ako dito. Umupo muna po kayo kung kailangan."

### 3.6 Emergency script (fixed, rule A-03)

"Naiintindihan ko po. Mahalaga po ito. Tumawag po kayo sa 911 ngayon, o
kay \[nearest contact\] sa \[number\]. Sinabihan ko na po ang pamilya
ninyo. Nandito lang po ako habang hinihintay natin sila."

Then the agent keeps the elder talking with short questions ("Nakaupo na
po ba kayo?") and no advice. It never ends the call on its own.

### 3.7 Low mood and self harm script

Low mood: "Salamat po sa pagsabi. Mahirap po talaga iyon. Nandito po
ako. Gusto po ba ninyong magkwento pa?" Self harm phrases set severity
to emergency: "Mahalaga po kayo. Hindi po kayo nag-iisa. Pwede po kayong
tumawag sa National Center for Mental Health crisis line, 1553.
Sinabihan ko na po ang pamilya ninyo. Nandito po ako." (Never ask about
method or plan. **verify** the current crisis line number before the
demo.)

### 3.8 Family join briefing (speak endpoint, under 512 bytes)

In the family member's language. Pattern: who is on the line, the three
answers so far, the alert if any, then "Ikaw na po" or "Over to you."

Example: "Si Linea po ito. Nasa linya si Nanay Rosa. Nakatulog siya nang
maayos, hindi pa niya nainom ang Losartan, at sinabi niyang nahulog siya
kahapon. Ikaw na po."

## 4. Accessibility for elders

-   Speech rate 0.85 to 0.9 of default. Pause 300 to 400 milliseconds
    between sentences through punctuation.
-   Silence window 1200 milliseconds before the agent speaks, because
    elders take longer to answer.
-   Agent never interrupts the elder. `interrupt_mode: interrupt`
    applies to the elder interrupting the agent, which should always
    work.
-   Calls at the same time every day. Elders are helped by routine.
-   The caller ID is saved on the phone as "Linea". The family sets this
    up during onboarding.
-   Hearing loss: the voice is in a mid pitch range; avoid very high or
    very fast voices.
-   No menus, no key presses, no "press one". The only input is talking.

## 5. Family web app

Audience: an adult child on a phone browser, often at night after a
shift abroad. Mobile first, one hand, low light.

Screens 1. Sign in. Email magic link through Supabase Auth. 2. Elder
setup. Name, nickname, language, phone, call time, medicines (name and
time of day), contacts. Record intro with a big red record button and a
preview. 3. Home. This month's calendar. Each day a filled circle:
green, yellow, red, grey for future. Today is outlined. Tap a day to
open it. 4. Day view. Summary in two sentences, medicine results as
pills, alerts with the exact phrase in quotes, transcript below in a
collapsible section. "Join call" button appears only while a call is
live. 5. Alerts list. Newest first, exact phrase, time, class, "Mark
handled". 6. Live call. Join state, mute, leave. The transcript scrolls
live if the data channel is on; otherwise a simple "In call with Nanay
Rosa" with a timer. 7. Settings. Export data, delete elder, notification
preferences.

Visual language - Typography: a humanist sans such as Inter or Source
Sans, large sizes, 16px minimum body on mobile. - Colors: warm off white
background, deep green for "good day", amber for "attention", red for
"alert", a muted plum for brand accents. Never rely on color alone; each
day circle also carries a small icon or label. - Motion: none beyond
simple transitions. This is a reassurance app, not a dashboard. - Copy:
plain English or Filipino per account language. "Nanay Rosa slept well
and took her medicine" rather than "Adherence: 100%".

Empty and error states - No calls yet: "Her first call is tomorrow at
8:00. You will see it here." - First failed attempt: "Nobody answered at
[time]. Retry scheduled for [retry time]." with a "Call now" button.
- Both attempts failed: "We couldn't complete today's check-in after two
attempts." - System failure: "We could not place the call." Only display a
retry time when an eligible retry is actually scheduled.

Calendar outcomes use the current business rules: Red over Yellow over Green.
A completed normal retry can turn a missed-call day Green while preserving
both attempts. Routine concerns, medicine not taken/unknown, and incomplete
check-ins are Yellow. Significant/Emergency events remain Red after a later
successful call or a handled alert. Pending retries display "Retry scheduled"
with provisional Yellow unless Red already applies.

## 6. Notifications

### Current family call controls and departure

"Leave" disconnects only the acting family member. "End call for everyone"
is a separate explicit action; make its scope clear in the UI. Neither action
marks an alert handled. Keep the agent in LISTEN if another family member
remains. When the last family member leaves and the elder remains, say:
"Nanay Rosa, it's just us again. Is there anything else you'd like to share?"
Then close naturally. An unresolved safety concern takes precedence over
closing, and an active emergency continues its fixed response.

### Current expired-data display

After 90 days, replace transcript, summary, and quotation content with
"Detailed text expired". Continue showing structured calendar and event
history for one year, for example "Fall reported; family joined". Do not
recreate the deleted quotation in a tooltip, notification preview, or summary.
Consent evidence follows its separate enrollment retention rule.

### Historical notification text

Web push and SMS text pattern: "Linea: Nanay Rosa said \"nahulog ako
kahapon\" at 8:04. Tap to join the call: `<link>`{=html}". Under 160
characters where possible. Emergency class adds "Emergency." at the
start.

## 7. Content and language rules

-   Filipino default in the call. Family app in English or Filipino per
    account.
-   Honorifics always. No first name alone for the elder.
-   No exclamation marks in agent speech. No emoji anywhere in the call.
    Emoji allowed sparingly in the app.
-   Numbers spoken in words in Filipino where natural ("alas-otso").

## 8. Brand

-   Name: Linea.
-   Pronunciation: "lin-ya", from Filipino "linya", meaning "line".
    Use this pronunciation in spoken introductions and verify it with the
    chosen TTS voice; the written product name remains Linea.
-   One-sentence description: "Linea is a voice-first, fully automated welfare
    check system purpose-built for older adults."
-   Current scaffold mark: two connected line forms suggest an L and a
    second person on the line, with purple and yellow accents. The local SVG
    asset is `apps/web/public/linea-mark.svg`. Verify small-size legibility in
    browser review.
-   Tagline: "Keeping families connected, one LINEA at a time"
    Preserve the capitalized LINEA in the tagline; use Linea in ordinary copy.
-   Tone of voice in writing: warm, plain, never clinical, never cute.

## 9. Pitch staging

Two minute pitch, semi finals

  -----------------------------------------------------------------------
  Beat                    Seconds                 What happens
  ----------------------- ----------------------- -----------------------
  1                       0 to 20                 Photo of a keypad phone
                                                  on a province kitchen
                                                  table. "Nine million
                                                  seniors. Two million of
                                                  their children abroad.
                                                  Half of their
                                                  households have no
                                                  internet. This phone is
                                                  the only device most of
                                                  them will ever use."

  2                       20 to 40                "Linea calls lola every
                                                  morning, in her
                                                  language, and asks
                                                  about her medicine. She
                                                  needs nothing new."
                                                  Play the daughter's
                                                  recorded intro.

  3                       40 to 85                A judge's phone rings.
                                                  Linea greets them by
                                                  name and asks about
                                                  breakfast and medicine,
                                                  in Filipino. The judge
                                                  says they fell
                                                  yesterday. The family
                                                  screen shows the alert
                                                  with those exact words.

  4                       85 to 105               A teammate taps join.
                                                  Linea briefs them in
                                                  ten seconds and goes
                                                  quiet.

  5                       105 to 120              "Remove voice and there
                                                  is no product. Remove
                                                  Agora and there is no
                                                  call. That is why it is
                                                  built this way."
  -----------------------------------------------------------------------

Five minute pitch adds the calendar, the consent design, the data rules,
the barangay health roadmap and the cost per elder per day, and lets a
judge take the whole call.

Staging checklist: the judge's number collected and consented before the
pitch, saved in the demo profile; venue Wi-Fi tested with a real call 30
minutes before; headset on the demo laptop; recorded call video on a USB
stick and in the cloud; the family app open on a second phone with push
enabled.
