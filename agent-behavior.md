# Linea Agent Behavior Contract

## Modes

-   CONSENT
-   SCRIPT
-   LISTEN
-   EMERGENCY
-   ENDING

## State

-   current beat
-   consent status
-   medicine status
-   active safety events
-   escalation tier
-   family joined
-   call attempt
-   call lifecycle
-   active question and its subject, separate from the script beat
-   unfinished beats and facts already answered out of order
-   evidence, pending clarification, and corrections per concern
-   medicine due-period and result, separate from concern tier
-   logical check-in identity across phone legs
-   initial connection attempt count and separate reconnection-used flag

## Normal loop

``` text
listen → classify → policy → respond → persist → next beat
```

## Safety loop

``` text
utterance → semantic classifier → concern/context → deterministic tier → action → resume/emergency
```

## Listen loop

``` text
family joins → deterministic briefing → LISTEN → empty completion unless required → direct family/elder conversation
```

One family member leaving does not change LISTEN while another remains.
After the last family member leaves, if the elder remains, ask once whether
there is anything else and close naturally. Unresolved safety takes priority.
"Leave" affects only that member; "End call for everyone" is an authorized,
intentional session end and suppresses automatic reconnection. It does not
resolve safety events or fill in missing check-in answers.

## Emergency loop

``` text
emergency context → persist → alert → fixed script → no model improvisation
```

## Response constraints

After an unexpected drop, allow one reconnection per logical check-in.
Acknowledge the interruption in ordinary language and restore the active
question, known answers, consent, and safety state. Do not restart the script
or reset attempt budgets. Emergency response takes precedence over ordinary
continuation. Confirm family presence before restoring LISTEN on a new leg.

Apply `02-business-rules.md` S-01 through S-09. Extract all facts across
turns, update each concern, and let the highest required action take priority.
Questions are one at a time, but answers may resolve multiple facts.
Unknown is never negative. Do not bind a bare "yes" to an interrupted beat.
Safety remains active in CONSENT, LISTEN, and ENDING without granting consent
or enabling general family chat. Confirmed emergency evidence bypasses further
clarification and prevents ordinary beat resumption. Deduplicate incident
notifications while allowing escalation updates. After non-emergency
clarification, resume only the next unfinished topic when appropriate.

`policy-fixtures.yaml` is a specification set; live behavior is unverified.

-   concise
-   one question at a time
-   no diagnosis
-   no medical advice
-   no dismissiveness
-   no fake-human claims
