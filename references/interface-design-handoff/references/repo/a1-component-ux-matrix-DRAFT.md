# A1 component × role UX matrix — ⛔ ABANDONED 2026-08-21. DO NOT FILL. DO NOT REBUILD FOR ANOTHER AREA.

> **Keith's ruling, 2026-08-21.** This scaffold is abandoned, not paused. **You do not owe it 13 sections.** It
> is kept on disk as a record of a format that was tried and dropped, and because the Presence matrix in §1
> and the resolved questions in §0 are still true and are cited elsewhere.
>
> **Why it died, and the dates matter because they are counter-intuitive.** The scaffold was created
> **2026-07-26**, on the premise of **DL-6** (2026-07-14, "DS-first: the design system is the source of
> truth"), where UX intent is written up front and components are built from it. But **DL-13 had already
> superseded DL-6 five days earlier, on 2026-07-21**, making the repo the primary source of truth. Then
> **DL-17** (2026-07-28) made the consequence explicit: once a component exists in the repo, the repo owns
> its look, and the design system reconciles at **area boundaries** rather than up front. So this file was
> built two days into the window between the inversion and the inversion being written down. **Its premise
> was already dead when it was created**, which is why it was never filled and why nobody noticed for a
> month. Area 1 shipped without it.
>
> **What carries its job now, and this is the part to remember:**
> - **Per-role intent** lives in the locked Area 1 spec's per-role hierarchy table and band composition.
> - **The build target per component** lives in the owning PBI's Acceptance Criteria in `a1-work-items.md`.
>   That is the authoritative component-to-PBI mapping, and it is authoritative because agents check ACs off.
> - **The design-system reconcile** happens at the area boundary, per DL-17, hooked into **7.1 / AB#745**
>   (task 899, `/design-sync`).
>
> **Do not rebuild this for Area 2.** **DL-15** (2026-07-27) already rules that A2 net-new components are
> designed in code rather than DS-first, so the format has no consumer there either.

Purpose: capture the UI/UX intent per component, per role, so each A1 PBI has a real build target and the Excalidraw wireframes are backed by written behavior. Prefilled from the authoritative Excalidraw (black) frames; **?** = needs your confirm; _(fill)_ = your UX intent goes here. This feeds the PBI AC and the Area 1 spec.

Roles: **Aggregator** (default multi-plant operator) / **Utility** (territory-scoped) / **End-user** (portfolio, often 1 plant). **Full-map** is a mode, not a role (section at the end).

---

## 0. Structural questions to settle first (these change the PBI set)

- **Q1 — RESOLVED (Keith 7/26).** The aggregator per-plant cards ARE the fleet list. 4.3 = per-plant card list + a mini viewport window beside it (second FleetMap instance, separate from the main map). NOT synced to / filtered by the main map. Card click auto-pans the mini viewport to that pin + drops the PlantPopover. No separate 3.7 PBI. ⛔ **Q1 is INCOMPLETE, do not read it as exhaustive (noted 2026-08-21).** It names the pan and is silent on click-through, and that silence was mistaken for a denial: Cowork read Q1 against task 852 and recommended deleting 852's "Click-through to plant detail" bullet. AB#736's Acceptance Criteria carry **both** affordances and mark click-through "preserved". The governing text is AB#736's AC and the locked A1 spec's decision #9, both of which now state both. Do not cite Q1 for card-click behaviour.
- **Q2 — CLOSED by the locked spec (2026-07-29).** Area 1 decision #8 reads "Utility and End-user do NOT get the Full Map View; their KPIs stay scope-fixed per #1." So the entry is **aggregator only**. ⚠️ The wireframes reportedly show it on end-user too, which now conflicts with the locked spec. The spec wins until Keith says otherwise; if the wireframes are the intent, decision #8 needs amending rather than the matrix.
- **Q3 — CLOSED by the locked spec (2026-07-29).** The hierarchy table carries one row, "Production KPI + sparkline", marked Primary for both Aggregator and Utility. Utility gets the **same treatment as the aggregator**, coverage qualifier and sparkline included.
- **Q4 — RESOLVED (Keith 2026-07-29).** End-users get **click-to-filter regardless of portfolio size**. No role carve-out and no size threshold: decision #2's affordance ("clicking Fault · 12 filters list and map to those 12") applies identically for a two-plant portfolio and a twelve-hundred-plant fleet. One behavior, one component.
- **Q5 — RESOLVED (Keith 7/26).** Same card component, two placements: aggregator = card list beside a mini viewport (4.3); end-user = scrollable card row, no mini viewport, click centers the MAIN map + drops the PlantPopover (5.3). No per-card embedded map.

---

## 1. Presence matrix (shown per role)

| Component | Aggregator | Utility | End-user |
|---|---|---|---|
| Sidebar nav (area 1–5, logo, logout) | ✓ | ✓ | ✓ |
| Welcome / "hello message <random>" | ✓ | ✓ | ✓ |
| Search bar | ✓ | ✓ | ✓ |
| Avatar | ✓ | ✓ | ✓ |
| Fleet Status + Exception Donut | ✓ primary | ✓ primary | ✓ primary |
| Production KPI (+ Coverage + Sparkline) — period energy, not live power (DL-23) | ✓ primary | ✓ primary (same as aggregator, Q3 closed) | — |
| Grid condition → Area 6 | ✓ preview (mid-row) | ✓ primary (slot 3) | — |
| Financials → Area 7 | ✓ preview (mid-row) | — (settled: none) | ✓ primary (slot 3) |
| Fleet battery state | ✓ widget (mid-row) | ✓ secondary | ✓ primary (slot 2) |
| Map + status pins | ✓ | ✓ | ✓ |
| Map controls (Pins / Clusters / Filters) | ✓ | ✓ | ✓ |
| "View Map" full-map entry | ✓ | — (settled: none) | — (spec decision #8: aggregator only) |
| Pin popover → Area 2 | ✓ | ✓ | ✓ |
| Active alerts (strip → Area 3) | ✓ (fuller list) | ✓ strip | ✓ strip |
| Per-plant card list + mini viewport (= the fleet list; not main-map-synced) | ✓ | — | — |
| Per-plant card scrollable row (click centers MAIN map + popover) | — | — (settled: none) | ✓ |
| Capacity roll-ups (DC/AC, Storage, Export) | ✓ tertiary | ✓ | ✓ |

---

## 2. Per-component UX intent

For each: **Behavior/interaction · States (default / loading / empty / error) · Per-role deltas · Deep-link · Data source · Notes.** Prefilled where the wireframe or memory already decides it.

### Shell / chrome (all roles)
- **Sidebar nav** — area 1–5 + logo + logout. Behavior: _(fill — active-state, collapse?)_ · States: _(fill)_ · Deltas: _(fill)_
- **Welcome / hello message** — greeting header, "<random>" implies a rotating message. Behavior: _(fill — rotating copy? per-time-of-day?)_ · Data source: _(fill)_ · Notes: confirm app-shell vs new (R7).
- **Search bar / Avatar** — Behavior: _(fill — search scope? avatar menu?)_

### Fleet Status + Exception Donut
- Behavior: click a segment to filter the map + list (prefilled). · States: default / loading / **empty (all-normal → ?)** / error _(fill)_ · Per-role: all three roles click-to-filter, no carve-out by portfolio size (Q4 resolved 2026-07-29) · Deep-link: none (in-page filter) · Data source: `plantStatus` counts (2.3 donut). · Notes: single donut; StatusDot swap **done** — 825 merged, `app/components/StatusDot/` exists on `dev`.

### Production KPI + Coverage + Sparkline
- Behavior: shows energy over the SELECTED date range (DL-23), label follows the active range rather than hardcoding "Today"; refreshes on loader revalidation, not on a timer · States: coverage qualifier drives display; warnBelow 0.85 interim (#6c) · Per-role: utility identical to aggregator, coverage qualifier and sparkline included (Q3 closed) · **Data source — settled 2026-07-31, supersedes the earlier per-plant plan:** both the figure and the sparkline come from **`sector_energy_breakdown.total_pv_output`** on `summary/plant-capacity-summary/`, which Home's loader already fetches. It is a fleet-level array of time buckets: sum ALL buckets for the headline figure, plot them for the sparkline. The previous approach (sum per-plant `total_pv_output` from `plant-daily-summary` with `page_size` >= fleet size) is superseded — no second endpoint, no paging. See `a1-work-items.md:255` and `:366`. Caveat carried from the measurement: bucket width is not predictable from the range and `truncated_date` semantics are unconfirmed, so the sparkline plots shape only and its axis stays unlabelled pending a backend answer · Notes: no placeholder tile for the not-yet-available live-power figure, its slot collapses when empty (DL-24)

### Grid condition → Area 6
- Behavior: _(fill — live grid state? click → Area 6)_ · Per-role: **utility = primary KPI**; aggregator = mid-row preview/deep-link · States: _(fill)_ · Deep-link: Area 6 · Notes:

### Financials → Area 7
- Behavior: _(fill)_ · Per-role: **end-user = primary**; aggregator = mid-row preview; **utility = absent (settled)** · Deep-link: Area 7 · Notes:

### Fleet battery state
- Behavior: _(fill)_ · Per-role: aggregator mid-row widget / utility secondary / **end-user primary** · States: DD row if fields thin (3.4) · Data source: _(fill)_ · Notes:

### Map + status pins
- Behavior: pan/zoom; Search-This-Area; bounds-seeded; pins colored by status; optional capacity-sizing toggle (default off); legend. · States: loading / empty / error _(fill)_ · Deep-link: pin popover → Area 2 · Data source: MapLibre GL + MapTiler (DL-5). · Notes: kept simple but elevated (Peter 7/22).
- **Map controls** — Status Pins / **Clusters** / Filters. Behavior: _(fill — clustering thresholds? filter set beyond the donut?)_ · Notes: clustering is new work (R3), not yet in a task.

### Active alerts (strip / list → Area 3)
- Behavior: severity-coded rows (fault>anomaly>warning>offline>normal); row → detail; strip → Area 3. · States: **empty (no active alerts)** _(fill)_ · Per-role: **aggregator = fuller multi-row list**; utility + end-user = strip · Data source: `allPlantEvents` + Epic 2 normalizer · Notes:

### Per-plant card list + mini viewport (aggregator, 4.3) — RESOLVED 7/26
- Behavior: fleet list rendered as per-plant cards (DS template port); full fleet, sortable, NOT synced to / filtered by the main map. Mini viewport (second FleetMap instance) beside the list; card click auto-pans it to that pin + drops the PlantPopover; main map untouched. Click-through to Area 2: _(fill — from the card, the popover, or both?)_ · States: loading / empty / error _(fill)_ · Card contents: _(fill)_

### Per-plant card scrollable row (end-user, 5.3) — RESOLVED 7/26
- Behavior: same card component, horizontal scrollable row, no mini viewport; card click centers the MAIN map on that pin + drops the PlantPopover. · States: works for the 1-plant case · Card contents: same as aggregator? _(confirm)_

### Capacity roll-ups (DC/AC, Storage, Export)
- Behavior: _(fill — static rollup? click-through?)_ · Per-role: aggregator tertiary; utility + end-user secondary · Data source: `plantCapacitySummary` — **but do not bind its fields as-is** (measured 2026-07-30, recorded at `a1-work-items.md:357-359`): `total_dc_power` is ~373x too high (`614814` vs a true nameplate sum of ~1648 kW — backend aggregation bug, open DD row); `total_dc_power` and `total_ac_power` arrive **array-wrapped** (`[614814]`, `[2067]`) despite `types/index.d.ts` typing all six as `number`, so any arithmetic returns `NaN`; `total_export_power` is a `-10` sentinel, not data, which is why the tile renders `--` (open DD row). AC and BESS are trustworthy once unwrapped. 3.7/835 rebinds Export to summed export **energy** from `sector_energy_breakdown`, not this field · Notes:

---

## 3. Full-map mode (Epic 6)

- **Map viewport** — full-bleed; pins + clustering; Search-This-Area. Behavior: _(fill)_
- **KPI stack** — 3 KPIs, **left rail**, viewport-bound (every figure labeled in-view). Which 3 KPIs? _(fill)_
- **Per-plant list** — right side; sortable; synced to viewport + selection. Behavior: _(fill)_
- **Selected-plant panel** — appears on selection; summary → deep-link Area 2. Behavior: _(fill)_
- **Presentation** — overlay over the **dimmed dashboard**; URL-addressable; state-preserving exit.
- **Entry / gating** — aggregator only, per spec decision #8 (Q2 closed 2026-07-29). Utility and End-user do not get the Full Map View.

---

## 4. How this maps back to the PBIs

Once filled, each block's intent folds into the owning PBI's Acceptance Criteria in **`a1-work-items.md`** — the plan of record, which carries the AC for every PBI: donut → 2.3/4.4; production KPI → 3.2; capacity strip → 3.7/835 (split from 3.2); grid/financials previews → 3.6; fleet battery → 3.4; map + pins + controls + popover → 4.1/4.2; card list + mini viewport → 4.3; end-user card row → 5.3; full-map → 6.1–6.3; role deltas → 5.2/5.3.

> **⛔ SETTLED 2026-08-21 (Keith's ruling). There is no authoritative build map, and there does not need to be. The Acceptance Criteria are the mapping.** Each PBI's ACs name their own components, which is why they can be checked off; a second mapping beside them would be a second tracker, and the staler tracker wins by being easier to leave alone. **The inline list above is historical. Do not cite it, do not promote it, and do not maintain it.**
>
> **Measured against the board export, 2026-08-21, so the reasons are numbers and not opinion:**
> - **It covers 14 of the 38 Area 1 PBIs (37%).** It maps only the component-shaped ones. Absent: every Epic 1 item (1.1 to 1.7), Epic 2's primitives (2.1, 2.2, 2.4 to 2.9), and 3.1, 3.3, 3.5, 5.1, 5.4, 5.5, 7.1.
> - **One of its 14 mappings is wrong.** It sends `popover → 4.1/4.2`. The popover's real home is **AB#836 / PBI 4.5, "Port PlantPopover redesign"**, which is Done. **4.6** (AB#837, fleet map vs DS template) is missing from the list too.
> - So "the most complete component→PBI mapping that exists anywhere" was true only against a field of zero, and promoting it would have promoted a defect.
>
> **Prior state, kept for the record.** This block previously cited `a1-sprint-prep-DRAFT.md`, Part 2 for AC and Part 0 for an "authoritative component→PBI build map". **That file does not exist**: not on disk, not in any branch's history, not in any session scratch. The AC half was repointed at `a1-work-items.md` (37 AC blocks) on 2026-08-03 and that half was correct. The build-map half is now closed by the ruling above rather than repointed.
