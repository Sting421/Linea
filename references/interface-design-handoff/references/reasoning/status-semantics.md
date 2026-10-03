# Status & event semantics

> The keystone taxonomy everything status-related hangs off (palette, badges, donut, Area 3 normalization). DR-doc draft: `../../status-event-semantics.md`. Current as of 2026-07-16.

## Two-level model

- **Level 1 — Status** (the badge, one at a time): **Normal** (healthy, incl. online) · **Offline** (connectivity) · **Warning** (e.g. AC voltage out of bounds, DC battery voltage low) · **Fault** (hardware only: battery failed, firmware stack error) · **Anomaly** (operational: PV production collapse, battery contribution collapse, grid instability, missing unit in a multi-battery system).
- **Level 2 — Conditions**: the specific reason list under each issue status, surfaced on click-in with context + recurrence timeline + the reused inverter Metrics chart.
- **Online folded into Normal; Anomaly added** (Peter, 2026-07-09 call). Anomaly is a peer status AND derived (no manufacturer code emits it).
- **Precedence (Keith 2026-07-23, matches the DR):** fault > anomaly > warning > offline > normal. Anomaly outranks Warning because an anomaly is an actual operational deviation (PV/battery collapse, grid instability) while a Warning is an out-of-bounds caution that may self-correct. NOTE: 2.1/820 shipped `STATUS_SEVERITY` as fault > warning > anomaly (the 7/20 "correction" followed that buggy order); reordered on feature/820 to match this (fix LANDED on the branch 2026-07-24; rides into dev when !983 merges). Still open to Peter's input, but this is the intended order and what the DR states.
- The DR section is worded as **decided** (clean proposal for Peter to audit); genuinely-open items ride in the Peter message. Don't mistake "decided in the doc" for locked — pending items below.

## Canonical palette (reconciled DS tokens — authoritative)

normal **#009DE4** · offline **#6B7177** · warning **#E08600** · fault **#D92D20** · anomaly **#8B5CF6** (+ soft/text/border tiers per AREA-BUILD-GUIDE §1). The softer hexes (#FFC571/#B9B9B9/#FF6870) were legacy kit values that 2.1 originally shipped; PR !983 (AB#820) fixes the repo to canonical. Status hues are **reserved for status meaning** — see [design-system](design-system.md).

## Normalizer (shipped, PBI 2.1 + 820)

`theme/status.ts` (tokens) + `app/utils/status.ts` (normalizer + `statusToHex`), vitest-covered. Rules: online→normal fold; **anomaly is pass-through-only (never derived client-side)**; ambiguous event codes → null. Severity today is frontend-normalized from `event_type` (backend out of scope); recommend a backend-normalized field later. The old mess it fixes: THREE unreconciled `event_type` vocabularies (UPPERCASE+numeric fleet/timeline; lowercase incl. `failure` per-plant; filter-button labels), no enum anywhere.

## Event codes (seed map: `ovanova-iot-frontend/docs/event-code-status-map.md`)

- Platform already emits a top-level status in places ("status is offline/warning") — level-1 partly platform-provided; W/E/named codes are level-2 conditions.
- Two schemes: EG4/Lux `W###`/`E###` (W=warning, E=error); SolArk named `_Fault` codes + numeric ids. **Manufacturer severity ≠ our status**: many SolArk `_Fault` codes are grid/electrical = Warning by Peter's definition, so no blind `_Fault→Fault`.
- Informational events exist (`Grid_Mode_changed`) = inbox-only, not incidents. "No AC Connection"/`AC_NoUtility` ≠ platform "offline" (reporting but no grid).
- Source: **#power-plant-alerts** Slack channel (AI-generated briefings; trust codes/names, treat cause/suggestion prose as format examples). It's effectively a working prototype of the Area 3 incident detail.
- Map is a **seed, not authoritative** — reconcile with Peter + the API code catalog before applying to the DR conditions table.

## Pending Peter (sent 7/11, awaiting replies)

1. Two-level model + anomaly-as-status confirm. 2. Precedence order (esp. where Offline sits vs reporting-but-no-grid). 3. The ambiguous code→status mappings (`_Fault` grid/electrical bucket, Fan Stuck W009, Battery open W027, No-AC W016 vs Offline, GFCI 23, Parallel_System_Stop 41, comms cluster W000/E000/W030). 4. Does the API return a normalized top-level status or only raw codes (build lever; folded into the 19:47 message via Slack edit). 5. Is the AI cause/suggested-checks breakdown a planned dashboard feature. 6. Extend the conditions list.

## Changelog

- 2026-07-16: page created from §18 (7/09 call, event-code harvest, 2.1/820 facts).
- 2026-07-20: corrected the provisional precedence to the shipped order fault > warning > anomaly > offline > normal (verified against `STATUS_SEVERITY`; the earlier fault>anomaly>warning was wrong). Still provisional pending Peter.
- 2026-07-23: precedence set to **fault > anomaly > warning > offline > normal** (Keith), matching the DR. The 7/20 change was backwards — it followed the buggy shipped order rather than the DR intent. `STATUS_SEVERITY` on feature/820 is being reordered to flip anomaly above warning (folds into PR !983 before merge).
- 2026-09-18: ⛔ **the seed-map pointer was broken and is corrected.** It cited `../../event-code-status-map.md`, which resolves to the `dashboard-requirements` root where no such file exists. The file lives in the repo at `ovanova-iot-frontend/docs/`. ⭐ **Found only on a second pass, because the first scan checked markdown links and this citation is in backticks.** A backticked path carries the same provenance weight as a link and needs the same check.
