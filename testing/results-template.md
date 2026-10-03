# Linea MVP test run results

Follow the [guide](README.md) and [conversation cases](conversation-cases.md).
No checks have been executed by generating this file. Every row is NOT RUN.

## Run details

- Run name and date:
- UTC start and end:
- Tester names and roles:
- Web URL and deployed commit:
- API URL and deployed commit:
- Environment and actual mode:
- Model snapshot and interpreter or prompt version:
- Provider project and ASR or TTS configuration:
- Browser and device versions and network:
- Synthetic profile and account aliases and local timezone:
- Setup and failure injection methods:
- Evidence folder without keys tokens raw audio or real elder data:

## Result rules

Use NOT RUN, PASS, FAIL, or BLOCKED. Fill actual results and evidence before
choosing PASS. Every subcheck must pass. Keep a detailed record below for each
case or subcheck. Preserve failures when retesting a fix on a new build.

## Application and integration results

| Case | Test | Status | Actual result and evidence | Bug or retest |
| --- | --- | --- | --- | --- |
| QA-01 | Server health and deployed contract | NOT RUN | | |
| QA-02 | Credentials and provider configuration | NOT RUN | | |
| QA-03 | Automated regression checks | NOT RUN | | |
| QA-04 | Actual provider envelopes and authentication | NOT RUN | | |
| QA-05 | One model interpretation request per turn | NOT RUN | | |
| QA-06 | Sign in and sign out | NOT RUN | | |
| QA-07 | First setup and profile validation | NOT RUN | | |
| QA-08 | Consent yes no and ambiguity | NOT RUN | | |
| QA-09 | Scheduling and calling hours | NOT RUN | | |
| QA-10 | Normal phone check-in | NOT RUN | | |
| QA-11 | Complete conversation suite | NOT RUN | | |
| QA-12 | Voice recognition and nonlinear conversation | NOT RUN | | |
| QA-13 | Emergency priority and persistence | NOT RUN | | |
| QA-14 | Medication and no advice | NOT RUN | | |
| QA-15 | Alert content and truthful notification status | NOT RUN | | |
| QA-16 | Push permissions and delivery failures | NOT RUN | | |
| QA-17 | Authorized join and audible briefing | NOT RUN | | |
| QA-18 | LISTEN and family departure | NOT RUN | | |
| QA-19 | Leave and End call for everyone | NOT RUN | | |
| QA-20 | Unanswered call and one later retry | NOT RUN | | |
| QA-21 | One reconnect after an unexpected drop | NOT RUN | | |
| QA-22 | Exhausted reconnect and emergency connection loss | NOT RUN | | |
| QA-23 | Races duplicates and stale events | NOT RUN | | |
| QA-24 | Calendar outcomes and immutable history | NOT RUN | | |
| QA-25 | Dashboard chart counts and scope | NOT RUN | | |
| QA-26 | Interface conventions and accessibility | NOT RUN | | |
| QA-27 | Authentication and family data isolation | NOT RUN | | |
| QA-28 | RTC authorization token expiry and secret boundaries | NOT RUN | | |
| QA-29 | Webhook verification and forged events | NOT RUN | | |
| QA-30 | Dependency failures and restart recovery | NOT RUN | | |
| QA-31 | Resource cleanup and post-call records | NOT RUN | | |
| QA-32 | Ninety day and one year expiry | NOT RUN | | |
| QA-33 | Unenrollment and cancellation | NOT RUN | | |
| QA-34 | Provider recording retention and backups | NOT RUN | | |
| QA-35 | Measured cost per logical check-in | NOT RUN | | |
| QA-36 | Three complete runs without restarting | NOT RUN | | |

## Original conversation results

Text/model results are separate from real ASR/voice evidence under QA-12.

| Case | Status | Actual facts policy and reply | Evidence | Bug or retest |
| --- | --- | --- | --- | --- |
| fall_recovered_after_clarification | NOT RUN | | | |
| fall_unknown_before_clarification | NOT RUN | | | |
| fall_ongoing_leg_pain | NOT RUN | | | |
| fall_reassurance_cannot_cancel_inability_to_get_up | NOT RUN | | | |
| near_fall_preserves_actual_event | NOT RUN | | | |
| breathing_familiar_resolved_exertion | NOT RUN | | | |
| breathing_new_but_resolved | NOT RUN | | | |
| breathing_current_severe | NOT RUN | | | |
| chest_current_mild_conservative_fallback | NOT RUN | | | |
| chest_resolved_without_associated_features | NOT RUN | | | |
| chest_resolved_with_delayed_red_flags | NOT RUN | | | |
| chest_recurrence_between_episodes | NOT RUN | | | |
| chest_remote_assessed_history | NOT RUN | | | |
| chest_negation_and_third_party_story | NOT RUN | | | |
| dizziness_isolated_resolved | NOT RUN | | | |
| dizziness_persistent | NOT RUN | | | |
| dizziness_recurrent_but_resolved_now | NOT RUN | | | |
| dizziness_recent_neurological_features_resolved | NOT RUN | | | |
| dizziness_new_inability_to_walk | NOT RUN | | | |
| faint_fully_recovered_without_emergency_circumstances | NOT RUN | | | |
| faint_during_exertion | NOT RUN | | | |
| medicine_explicit_taken | NOT RUN | | | |
| medicine_intention_is_not_completion | NOT RUN | | | |
| medicine_uncertain_after_clarification | NOT RUN | | | |
| medicine_repeated_omissions | NOT RUN | | | |
| medicine_repeated_unknown_not_missed | NOT RUN | | | |
| medicine_access_barrier | NOT RUN | | | |
| medicine_not_due_yet | NOT RUN | | | |
| medicine_reported_doctor_stop | NOT RUN | | | |
| medicine_possible_extra_dose | NOT RUN | | | |
| medicine_reported_large_excess | NOT RUN | | | |
| medicine_other_drug_no_approved_omission_policy | NOT RUN | | | |
| interrupted_medicine_yes_belongs_to_injury_question | NOT RUN | | | |
| one_answer_contains_two_facts | NOT RUN | | | |
| later_emergency_overrides_resolved_dizziness | NOT RUN | | | |
| symptom_clarification_exhausted | NOT RUN | | | |
| explicit_subject_correction | NOT RUN | | | |
| emergency_in_listen_mode | NOT RUN | | | |
| emergency_during_consent | NOT RUN | | | |
| repeated_same_incident_no_duplicate_alert | NOT RUN | | | |
| new_details_upgrade_existing_incident | NOT RUN | | | |

## Held out conversation results

Text/model results are separate from real ASR/voice evidence under QA-12.

| Case | Status | Actual facts policy and reply | Evidence | Bug or retest |
| --- | --- | --- | --- | --- |
| held_out_fall_recovered | NOT RUN | | | |
| held_out_other_person_current_fall_emergency | NOT RUN | | | |
| held_out_breathing_new_resolved | NOT RUN | | | |
| held_out_breathing_negated | NOT RUN | | | |
| held_out_chest_current_small_ache | NOT RUN | | | |
| held_out_chest_remote_reviewed | NOT RUN | | | |
| held_out_dizziness_recovered | NOT RUN | | | |
| held_out_dizziness_resolved_speech_change | NOT RUN | | | |
| held_out_medicine_future_intention | NOT RUN | | | |
| held_out_medicine_possible_duplicate | NOT RUN | | | |

## Detailed case record template

Copy this section for each case or subcheck.

- Case ID and subcheck:
- Tester and UTC start and end:
- Actual deployed commits:
- Synthetic setup and actual steps:
- Check in and phone leg and provider session and event IDs:
- Expected behavior from guide or fixture:
- Actual extracted facts and deterministic decision:
- Actual spoken or UI or notification behavior:
- Timings and clock origins:
- Model request count and tokens:
- Evidence paths:
- Status and reason:
- Bug or blocker and fix commit and retest run:

## Cost record template

Record actual billable units, applicable unit price/date/currency, credits,
and paid-rate subtotal for each component. Include model, recognition,
synthesis, runtime, RTC, telephony, retrieval, all legs, and any allocated
hosting cost. Do not double count items included in another provider bundle.

| Type | Check in ID | All legs | Model tokens and requests | Voice and phone cost | Other cost | Paid rate total | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Normal | | | | | | | |
| Clarification heavy | | | | | | | |
| Unanswered then retry | | | | | | | |
| Dropped then reconnected | | | | | | | |

## Final run review

- Counts of PASS and FAIL and BLOCKED and NOT RUN:
- Three QA-36 run IDs and separate evidence:
- Unresolved bugs and limitations:
- Engineer review and date:
- Tester review and date:
- Decision and scope such as demo only or more integration work or pilot readiness:

Required cases that are failed, blocked, or not run prevent a readiness claim.
Complete cost measurement alone does not establish a profit margin.
