# Ovanova — Area Build Guide (design → repo handoff)

> **⛔ READ THIS BEFORE THE INSTRUCTION BELOW. Corrected 2026-08-21.**
>
> **A template is only the source of truth for a component that does not exist in the repo yet.**
> The paragraph below was written under **DL-6** (2026-07-14, blanket DS-first) and still reads as
> though `templates/` outranks the repo in every case. It does not, and has not since **DL-13**
> (2026-07-21) made the repo the primary source of truth, refined by **DL-17** (2026-07-28) into the
> rule that actually governs this file:
>
> - **Component does NOT exist in the repo** → the template is the starting point. Build from it.
>   Everything below applies as written.
> - **Component DOES exist in the repo** → **the repo is the port source, not the template.** Never
>   port a template into a second screen when a shipped implementation exists.
>
> **Why this is not a wording nit.** The design system carries vendored sibling copies of components
> that have since shipped and evolved in the repo: **PlantCard ×3, Sparkline ×3, SeverityBadge ×3,
> PlantMap ×3, AlertStripRow ×3.** Following the instruction below for any of those means porting a
> stale copy over a newer implementation, and the divergence is silent because both look plausible.
> This is the exact hazard DL-17 was written to close.
>
> Two consequences that follow: the design system receives the repo's evolved components at each
> **area boundary** (A1's sync is 7.1 / AB#745, task 899), not the other way round; and a repo-born
> component still needs an index row in §7 pointing at its repo path, since an undiscoverable
> component is what caused the task-845 duplicate-design detour.
>
> Net-new for **Area 2 specifically** is designed in code, not in Design first, per **DL-15**
> (2026-07-27).

**Drop this file in the repo (e.g. `docs/AREA-BUILD-GUIDE.md`).** When asked to build out
an Area (1 Fleet, 2 Plant Detail, 3 Alerts/Incidents), implement against the components
designed in the Ovanova IoT Design System project — not from scratch and not from the
legacy screens. For a component with no repo implementation yet, the design source of truth is
the `templates/` tree of that project; each
component is a self-contained `templates/<slug>/<Name>.dc.html` whose inline styles carry
the exact spec (hexes, spacing, radii, type sizes, sample data, interaction logic in the
embedded `class Component`).

⛔ **CORRECTED 2026-09-03. THE SECOND SENTENCE OF THIS WARNING WAS FALSE AND IT COST A WRONG
RECOMMENDATION.** `design/templates/` **IS** on disk in the working tree, all **54 slug folders**,
listed 2026-09-03. PR !994 untracked the path and left the working copy in place, which is what
`git rm --cached` does, so the files never went anywhere.

**What is TRUE and is the part worth keeping.** The path is **gitignored and untracked**, so every
GIT-based check reports absent, and "check if the DS is present" silently evaluates to "absent" if
you ask git rather than the filesystem. The tracked, versioned copies live on the
`chore/ds-templates-reference` branch.

⚠️ **So there are TWO copies and they have now drifted. READ THE DISK, NOT THE BRANCH.**

⛔ **ROUTE REWRITTEN 2026-09-03. The old instruction here read the templates off
`chore/ds-templates-reference` via `git show`. That branch is MERGED into `dev` and has not moved
since `00b115e`, 2026-07-16. It carries 106 tracked files against 108 on disk, it has no `toast/`
slug at all, and it has none of the four galleries. So the old route returned July content and said
nothing about being out of date, which is the worst possible failure mode for a lookup that exists
to stop somebody building from a stale copy.**

The route is the filesystem:

```sh
:: list every template (cmd.exe)
dir /s /b design\templates\*.dc.html

:: read one
type design\templates\<slug>\<Name>.dc.html
```

The branch is HISTORY, not the lookup. Reach for it only to see what a template used to say, and
know that it stops at 2026-07-16.

⛔ **Checking out `chore/ds-templates-reference` overwrites the on-disk copies with the July ones,
silently, because those files are tracked on that branch.** Anything placed on disk since then is
lost with no warning and no diff to notice. Do not check it out.

**What is on disk that is not on the branch, as of 2026-09-03.** Four slugs were couriered from
Design and placed by hand. `callout/` gained `Callout.dc.html` (replaced, content-identical, LF
rather than CRLF). `tag/` gained `TagGallery.dc.html` and a replaced `Tag.dc.html` (also
content-identical). `severity-system/` gained `SeverityBadgeGallery.dc.html` and replaced
`SeverityBadge.dc.html` and `SeveritySystem.dc.html`. `toast/` is a NEW slug carrying
`Toast.dc.html` and `ToastMobileGallery.dc.html`. `callout/` also gained `CalloutGallery.dc.html`.
The harness files (`ds-base.js`, `support.js`) and the `.thumbnail` assets were deliberately not
placed, matching every other slug on disk.

✅ **All nine files are on disk and all four slugs carry a gallery**, confirmed by directory listing
2026-09-03.

If no template exists for what you are building, say so in the hand-back — "no DS template" is a
finding, and it is different from "I did not look".

⚠️ **STALE SIBLING, measured 2026-09-03.** `domain-control-readout/SeverityBadge.dc.html` still
declares five variants, `solid soft outline dot dot-only`. `severity-system/SeverityBadge.dc.html`
declares three, `solid soft outline`. **`severity-system/` is canonical.** The dot variants were
dropped 2026-07-22 by AB#825 Decision 1, so the `domain-control-readout/` copy is pre-decision and
building a dot variant from it reintroduces something already ruled out. This is the vendored
sibling trap named in `CLAUDE.md` under DL-17, caught here in the wild.

⛔ **STALE FOOTER LINE, negated 2026-09-07.** `domain-control-readout/ControlReadout.dc.html`'s footer
says the end user does not get the Control tab. **That is FALSE and it loses to a signed decision.**
DL-3, accepted 2026-07-09 on Peter's own call, confirms the end-user control trim as work mode plus
backup reserve SOC, which means the end user DOES get the tab with exactly those two fields editable.
**The role split is ADMIN edit, USER edit, UTILITY read.** Ruled again by Keith 2026-09-06 while
building 7.2 / `AB#953`, where Code had independently read it the same way.

⚠️ **Do not build to that footer and do not re-derive the question from it.** Under DL-60 a declared
convention beats a DS template, and the board card is the filing surface that carries the decision.
**The canonical template lives in Keith's Claude Design project and has not been corrected there**, so
this line is the catch until it is. Second stale template line found in one week, after the
SeverityBadge sibling above.

How to use: before building a screen region, open the referenced `.dc.html`, lift its
literal values and behavior, and port to React + Tailwind per the repo's conventions.

⛔ **ONE EXCEPTION TO "LIFT THE LITERAL VALUES", ADDED 2026-09-03. DO NOT LIFT THE FONT.**
**81 of the 100 templates on disk name `Space Grotesk`**, most of them via a live
`fonts.googleapis.com` link, and **Space Grotesk is DELETED** by 7.2 / `AB#991`. The display
face is **Overused Grotesk** (variable, 300 to 900, carries titles and all numerals) and prose
is **Opening Hours Sans** (single cut, weight 400, so no bold utility can land on it). See the
TYPOGRAPHY section of `CLAUDE.md`.

**Every other literal in a template still governs.** Sizes, weights, tracking, leading, spacing,
radii and hexes are all lifted as written. It is the family name alone that is stale, and it is
stale across essentially the whole inventory rather than in a few files, so there is nothing to
grep for and no subset to distrust.

⚠️ **The templates are not going to be fixed file by file.** Keith ruled 2026-09-03 that a
re-export of individual files is not worth a round trip with Design, so this note is the fix and
it covers all 81. **A newly authored template should still arrive clean** — `toast/Toast.dc.html`
does, and it is the only one in the tree with no font reference at all.

**Tokens are TypeScript, not CSS.** There is no `:root` / `tokens.css` layer in this repo —
do not create one. `theme/status.ts` holds the status hexes and `theme/colors.ts` the
`hue-sky` brand ramp; `tailwind.config.ts:24` spreads both into the `status-*` /
`hue-sky-*` utilities, and `app/utils/status.ts` (`statusToHex`) reads them for raw-hex
consumers like Recharts. Components consume those tokens and never hardcode a hex. The
status palette in §1 below is the current, reconciled set — it matches `theme/status.ts`
on `dev` exactly, soft/text/border tiers included.

---

## 0 — Sibling copies: TEN components exist twice, pick the right one

Ten template basenames appear under more than one slug (counted off the table below, 2026-09-02; the header said nine while the table listed ten). ⚠️ **`Button` may be a THIRD copy rather than a second** — a 2026-09-01 file search returned three files named `Button.dc.html` and this table lists two slugs. Enumerate them and add the missing row before trusting this table for Button. The copies are not identical —
the Area-1-tuned ones carry that screen's sizing, density and sample data. Lifting the
wrong one produces a component that looks subtly off and reads as "the DS was not
followed". Two components have already been rebuilt from scratch because the sibling was
never found (845's StatTile, 3.5's AlertStripRow), so check this table before you port.

| Component | Copies (slug/) | Use for Area 1 |
|---|---|---|
| AlertStripRow | `fleet-alert-strip/` · `area1-fleet-overview/` | **`area1-fleet-overview/`** |
| CoverageLabel | `fleet-coverage-label/` · `area1-fleet-overview/` | **`area1-fleet-overview/`** |
| PlantCard | `fleet-plant-card/` · `area1-fleet-overview/` | **`area1-fleet-overview/`** for layout, but **READ BOTH** (2026-08-24) |
| Sparkline | `chart-primitives/` · `area1-fleet-overview/` | **`area1-fleet-overview/`** |
| Area1Map (map) | `fleet-map/PlantMap.dc.html` · `area1-fleet-overview/Area1Map.dc.html` | **`area1-fleet-overview/`** |

⚠️ **PlantCard, measured 2026-08-24, and this file disagrees with itself about it.** The dedupe table above sends you
to `area1-fleet-overview/PlantCard.dc.html`; the component inventory further down lists the per-plant card as
`fleet-plant-card/PlantCard.dc.html`. **Both rows are in this file.** What the two copies actually are: byte-identical
except that `area1-fleet-overview/` is fluid (`width:100%; max-width:360px`) and `fleet-plant-card/` is fixed at
`250px`, **and the design-intent comment exists only on `fleet-plant-card/`** — the copy the dedupe table tells you
not to use. That comment is the only place the template states what a tap does (*"Tap to open Area 2"*).

**So for PlantCard: port layout from `area1-fleet-overview/`, read intent from `fleet-plant-card/`, and expect
neither to describe behaviour.** Both copies are purely presentational, with no `<a>`, `<button>`, `role` or
`tabindex` anywhere. The interaction contract comes from **DL-56** and is recorded in the memory wiki's
`topics/design-system.md`, not here and not in the template.
| StatusDonut | `status-donut/` · `chart-primitives/` | `status-donut/` (no Area 1 copy) |
| SeverityBadge | `severity-system/` · `domain-control-readout/` | `severity-system/` (canonical) |
| Button | `form-controls/` · `domain-control-readout/` | `form-controls/` (canonical) |
| Chip | `ui-chip/` · `domain-control-readout/` | `ui-chip/` (canonical) |
| Switch | `ui-primitives/` · `domain-control-readout/` | `ui-primitives/` (canonical) |

**Rule: for Area 1 work, the `area1-fleet-overview/` copy wins** where one exists — that is
the precedent AB#732 set. Where there is no Area 1 copy, use the canonical slug named
above; the `domain-control-readout/` copies are that domain's in-context instances, not the
component's spec. The slug tables in §2–§6 name the canonical copy, so cross-check them
against this table when building Area 1.

---

## 1 — Color system (three palettes, three jobs)

**Status palette — reserved for a value's health/state. Only ever means status.**

| Status | solid | soft | text | border |
|---|---|---|---|---|
| Normal | `#009DE4` | `#E6F7FF` | `#03587F` | `#8AD9FD` |
| Warning | `#E08600` | `#FFF4E2` | `#8F5500` | `#F8D399` |
| Anomaly (derived) | `#8B5CF6` | `#F1EAFE` | `#5B21B6` | `#C9B2FA` |
| Offline | `#6B7177` | `#EEF0F1` | `#474C51` | `#CDD1D4` |
| Fault | `#D92D20` | `#FDECEA` | `#9E1B12` | `#F4B5AE` |

Rules:
- The canonical status set is exactly these five. **There is no "Online" status** — fold
  any legacy `online` value into `normal` at the data boundary.
- **Anomaly is derived** (computed from telemetry patterns, never in source status feeds).
  It ranks between Warning and Offline. **Donuts and legends no longer hide it at zero (overridden 2026-08-11, DL-34).** Every canonical status keeps its row and a zero count renders disabled, exactly as Fault's always has; the old rule applied two treatments to one visible situation. Caveat to carry: anomaly is specified below as derived at render time from telemetry patterns, and no such derivation exists yet, so a zero on display means the feed never says anomaly rather than that detection ran and found none.
- Severity order everywhere: fault → warning → anomaly → offline → normal.
- Dots use the solid token (no separate dot hexes).
- **Violet reads as Anomaly and nothing else** — never a category, accent, or chart color.

**Categorical palette (`--cat-*`) — for charts that split a value into categories.**

⛔⛔ **THE TABLE BELOW IS THE DESIGN DECLARATION AND IT IS NOT WHAT THE REPO EXPOSES. Checked 2026-09-16.**
There is no `--cat-*` CSS custom property layer in this project and there is not going to be, the project
deliberately has no `:root` token layer. The implementation is **`theme/categorical.ts` spread as the fourth
colour source in `tailwind.config.ts`, which yields Tailwind `cat-*` utilities**, not CSS variables. ⛔ **And
that file is on `feature/1004-trends-chart-design`, NOT on `origin/dev`**, verified with
`git cat-file -e origin/dev:theme/categorical.ts`, which fails. **So a component authored against `cat-*` today
passes review and renders without colour for anyone on `dev`.** ⚠️ **The live set is TEN values, not the five
below.** A tenth, `cat-backup` `#22C3D6` for backup and emergency power output, was added 2026-09-16 under
DL-86, with its 3-degree hue gap from the neighbouring cyan recorded in the wiki's design-system page. ⭐ **And
the inverter series deliberately take the BRAND ramp at `hue-sky-600` rather than any categorical value**,
because `total_dc_to_ac` and `inverter_power` are throughput totals rather than categories. **Read
`theme/categorical.ts` for the current set, never this table.**

| Concept | Token | Hex |
|---|---|---|
| Solar / PV | `--cat-solar` | `#EAB308` |
| Battery | `--cat-battery` | `#1FA845` |
| SOC | `--cat-soc` | `#1FA845` (shares battery — same physical concept) |
| Grid import / net grid | `--cat-grid-import` | `#0B7285` |
| Grid export | `--cat-grid-export` | `#1F4173` (navy — never violet) |
| Home load | `--cat-load` | `#E0521E` |
| Generator | `--cat-generator` | `#7F5539` |
| Self-consumption | `--cat-self` | `#C2418F` |
| Curtailed | `--cat-curtailed` | `#A8B0B7` (only grey category; lighter than status-offline) |

Same concept = same color in every chart. Device-telemetry extension (per-device
drilldown): AC power `#EAB308`, DC voltage `#0B7285`, temperature `#E0521E`, frequency
`#1F4173` — hue reuse is fine because these never co-render with the flow charts.
"Net grid" as a single signed series takes `--cat-grid-import`; if split, export takes
`--cat-grid-export`.

**Brand ramp (sky, primary `#009DE4`)** — single-series, sequential, decorative.
Non-status UI accents come from: navy `#1F4173`, teal `#0E9384`, orange `#E08600`-family
rust `#E0521E`, green `#1FA845`. Never reuse a status hue decoratively.

---

## 2 — Shared status components (build once, use in every Area)

| Component | Template | Notes |
|---|---|---|
| SeverityBadge | `severity-system/SeverityBadge.dc.html` | ⛔ **CORRECTED 2026-09-03. THREE variants, solid/soft/outline. The `dot` variant was DROPPED on 2026-07-22** aligned to AB#825, Decision 1, standalone `StatusDot` is the dot and the badge's variant enum lost dot and dot-only. This line carried the fourth variant for six weeks. Use the standalone `StatusDot` for a dot. sm/md/lg actually resize (sm 11px/2.5×9, md 12.5px/3.5×11, lg 14px/5×14); optional ×count |
| Status & severity showcase | `severity-system/SeveritySystem.dc.html` | Palette, vocabulary-normalization map (3 legacy `event_type` vocabularies → one enum), in-context uses |
| StatusDot | `ui-primitives/StatusDot.dc.html` | 3 sizes, optional pulse, all 5 statuses |
| StatusDonut (click-to-filter) | `status-donut/StatusDonut.dc.html` | Proportional donut + "Label · N" legend; segments/legend rows are a filter control (default/hover/selected states, multi-select, clear affordance) — **replaced** the fixed-disc PlantStatusGraph; shipped in PBI 2.3 (AB#726, re-merged as PR 992) and `dev` renders `FleetStatusDonut` |
| Tag / chip | `tag/Tag.dc.html`, `ui-chip/Chip.dc.html` | Tag: soft/solid/outline across statuses. Chip: 9 tones incl. teal (working modes — Peak Shaving is teal, not violet) |
| Alert strip row | `fleet-alert-strip/AlertStripRow.dc.html` | Severity-coded compact row, deep-links to Area 3 |
| Callout | `callout/Callout.dc.html` | Info/Success/Warning/Error banners |
| PlantStatusCell | repo-born: `app/containers/Plant/PlantStatusCell.tsx` | Status column cell for the /microgrids landing: normalizes the raw field, renders StatusBadge or the Unknown pill with the DL-44 title reveal. Born on !1025 |
| plantStatusFilter | repo-born: `app/containers/Plant/plantStatusFilter.ts` | Chip options derived from STATUS_LABELS + statusToHex, exact-match predicate over normalizeStatus, passed to ComplexTable through its filterOptions/filterPredicate props. Born on !1025. Note: ComplexTable's DEFAULTS for these props were built for the events tab, and AB#948 moves events off ComplexTable, so the defaults lose their consumer |
| equipmentModel | repo-born: `app/containers/Plant/PlantHome/Equipment/equipmentModel.ts` | Pure model for the Equipment tab. Five-status inverter tally derived from each inverter's `current_status` via normalizeStatus, because the counts endpoint carries no anomaly field. Device-row join by the feed's `name` against `serial_number`. `device_type` display normalization, since the feed sends `Inverter` capitalized while `AddDeviceModal`'s literals are lowercase. Capped-count copy that claims only what the envelope's `count` supports. `rowIsSelected` keyed on the SERIAL rather than the row index, so duplicate feed rows resolve to one selected device. And `deviceListHelpNote(rows)`, which derives the help tooltip clause by clause from the rendered rows so no clause can promise something the screen does not show. Born on !1029 |
| DeviceInventoryList | repo-born: `app/containers/Plant/PlantHome/Equipment/DeviceInventoryList.tsx` | One type-agnostic table for all device types, replacing the inverter accordion (`PlantInvertersList.tsx`, DELETED by !1029). Ports the events table's anatomy from !1027 (56px rows, muted sentence-case headers on a hairline, `overflow-x-auto` around `table-auto w-full`) but deliberately NOT its header hover, because those headers sort and these do not; a hover state on a non-interactive header suggests an action that does not exist. Row click selects, Enter and Space work, `role="grid"` with `aria-selected` on selectable rows and nothing on the rest. Carries the accordion's Metrics and Settings navigations verbatim, which still address the same inverter by two different identifiers and differ in history behaviour (Metrics replaces, Settings pushes); both are 6.2 / AB#951's to settle. Born on !1029 |

## 3 — Area 1 · Fleet Overview

| Region | Template |
|---|---|
| Whole screen (role-aware: aggregator / utility / end-user) | `area1-fleet-overview/Area1FleetOverview.dc.html` |
| Fleet map (schematic + MapLibre, status pins, capacity sizing, map↔list sync) | `fleet-map/PlantMap.dc.html` (Area-1-tuned copy: `area1-fleet-overview/Area1Map.dc.html`) |
| Plant popover (pin click → identity/status, capacity + live metrics, View plant CTA to Area 2) | `plant-popover/PlantPopover.dc.html` |
| Per-plant card (end-user portfolio) | `fleet-plant-card/PlantCard.dc.html` ⚠️ **contradicts the dedupe table above, which names `area1-fleet-overview/`. See the note below.** |
| Fleet list table (status cells, selection, pagination) | `complex-table/ComplexTable.dc.html` |
| Coverage label ("N of M reporting") | `fleet-coverage-label/CoverageLabel.dc.html` |
| KPI tiles | `evolved-statbox/EvolvedStatBox.dc.html`, `chart-primitives/StatTile.dc.html` (with sparkline) |
| Exception donut + status filter | `status-donut/StatusDonut.dc.html` |

## 4 — Area 2 · Plant Detail

| Region | Template |
|---|---|
| Plant shell (identity + tabs frame) | `domain-plant-shell/` |
| Today panels (PV/Load/Net grid + SOC right axis) | `today-panels/TodayPanels.dc.html` |
| Generation purpose donut | `generation-purpose/GenerationPurpose.dc.html` |
| Energy balance Sankey | `chart-sankey/SankeyChart.dc.html` (hub node is neutral slate `#3A434B`, not navy) |
| How loads are met (100% stacked) | `load-balancing/LoadBalancing.dc.html` |
| Source mix bars (kW stacked, gradient fills) | `chart-primitives/LoadBalancingBar.dc.html` |
| Per-device drilldown (metric tabs) | `per-device-drilldown/PerDeviceDrilldown.dc.html` |
| Scheduler (working modes; Peak shaving = teal) | `domain-scheduler/Scheduler.dc.html` |
| Control readout | `domain-control-readout/ControlReadout.dc.html` ⛔ **its footer's "end-user does not get the Control tab" line is STALE and negated, see the block in section 0** |
| Capacity facts | `capacity-facts/CapacityFacts.dc.html` |
| Battery safety, weather, maintenance log, photos | `battery-safety/`, `weather-card/`, `maintenance-log/`, `plant-photos/` |
| Device/plant CRUD modals | `device-plant-crud/DevicePlantCrud.dc.html` |
| Power flow schematic | `domain-power-flow/PowerFlow.dc.html` |
| Tab map + shell revalidation (plantTabs) | repo-born: `app/containers/Plant/PlantHome/plantTabs.ts` — five-tab list, route-id to tab-index map, shared-param whitelist (from/to/utility_id), shouldRevalidate predicate. Born on !1026. NOTE for 2.2: the predicate must be revisited when live vitals land on the shell |
| Tab placeholder card (TabPlaceholder) | repo-born: `app/containers/Plant/PlantHome/TabPlaceholder.tsx` — honest empty-state card for tabs a later item fills (Trends until 4.1, Control until 7.x). Born on !1026 |
| Subscription / notification settings | `domain-subscription-settings/SubscriptionSettings.dc.html` |

## 5 — Area 3 · Alerts & Incidents

| Region | Template |
|---|---|
| Incident console (current/history, filters, table) | `domain-incident-console/IncidentConsole.dc.html` |
| Notification inbox (nav bell dropdown) | `domain-notification-inbox/NotificationInbox.dc.html` |
| Incident map | `fleet-map/PlantMap.dc.html` with `mode="incidents"` |
| Severity chips / event-type tags | `tag/Tag.dc.html`, `severity-system/SeverityBadge.dc.html` |

## 6 — Primitives & chart layer (any Area)

- **Charts** (wrap Recharts): `chart-primitives/` — TimeSeriesChart, LoadBalancingBar,
  StatusDonut (gallery copy), InverterPie, GenerationRadial, FreqVoltageScatter, Sparkline,
  StatTile. ⛔ **"All already on the categorical palette" is a DESIGN-TEMPLATE claim, not a repo claim, and it
  must not be read as one.** The seven Trends charts in the repo carry 51 raw hex literals and zero reads of
  any token, measured 2026-09-04, and the retoken is built but unmerged on `feature/1004-trends-chart-design`.
- **UI**: `ui-primitives/` (Avatar, StatusDot, Progress — teal scheme replaces violet),
  `ui-chip/`, `ui-breadcrumbs/`, `pagination/`, `dropdown/`, `form-controls/`,
  `calendar/`, `time-filter/`, `icon-set/`.
- **Evolved reskins of existing repo components** (`evolved-*`): Accordion, CardSwitch,
  Carousel, ChartLabel, DateFilter, ErrorElement, FormLabel, GraphTooltip, HelperDialog,
  InfoTooltip, SearchInput, Spinner, StatBox, Table — the styling shown is the target for
  the code component of the same name.

  ⛔ **`DateFilter` IS A TRAP IN THIS LIST, measured 2026-09-07. There are TWO date pickers and the reskin
  target is the one nobody sees.** `evolved-datefilter` names `app/components/Forms/DateFilter/index.tsx`,
  which is `react-day-picker` 8.10.1 in a Headless UI popover wearing a shadcn class map. It is **reachable but
  decorative**, five routes render it, both mounts pass no props so the trigger reads "Select Date" forever, its
  seven preset labels are plain `<div>`s with no handler, seven of its classes are shadcn tokens this theme
  never defines and emit nothing, and `react-day-picker`'s stylesheet is imported nowhere. Its disposition is
  Keith's, fix or delete, and reskinning it before that is answered would be work on a component that may not
  survive.
  ⚠️ **The picker users actually operate is a different library with no DS template at all**,
  `react-tailwindcss-datepicker` 1.7.2 at `Navbar.tsx:158` and `Trends/TrendsDateRange.tsx:105`. Its look is the
  library's stock blue and grey with `primaryColor` left at its default, and its future days are struck through
  because the library hardcodes `line-through` on disabled days. **Restyling it means app-side rules under the
  existing `.date-picker` hook at `app/tailwind.css:41`, a `primaryColor` swap, a fork, or a different library**,
  and any hook override is a third-party override a library upgrade can silently drop.
- **Repo-born icons** (`icons/LineChart.tsx`, `icons/Sliders.tsx`, `icons/Wrench.tsx`): the icon
  set's only currentColor-clean stroke glyphs besides what shipped before; drawn to the
  SVGProps/24-viewBox/currentColor contract, named from the DS gallery vocabulary. Born on !1026.

---

## 7 — Behavioral contracts to preserve

⛔ **READ THIS FIRST, added 2026-09-02.** Nine design conventions were declared 2026-09-01 and they are the
authority for all component work: the interaction contract, elevation and shadow, the close button, button
appearance and sizes, shape and radius, button elevation, the card system, alignment and spacing, grids and
responsiveness, plus typography. **They live in the repo-root `CLAUDE.md`, not in this file**, deliberately, so
there is one copy and it cannot drift. The contracts numbered below are the older per-component behaviours and
they sit UNDER those conventions where the two meet.

⚠️ **Most of the nine are RECORDED and NOT APPLIED, and the two sentences that followed here are CORRECTED
2026-09-02.** ✅ **The elevation tokens EXIST**, `theme/elevation.ts` with `elev-0` to `elev-6` on
`feature/745-elevation-scale` at `038ff64`, folded into 7.1 / AB#745 and **not on `dev` and not consumed by
any call site**, so `shadow-elev-*` emits nothing on `dev` today. ✅ **Typography SHIPPED as `!1033`** (7.2 /
AB#991), PR open, not merged, so the two faces and ten type tokens are on a branch and not on `dev` either.
⛔ **Until each merges, authoring a component against `shadow-elev-*` or `font-display` for the NEW face passes
review and renders wrong.**

⭐⭐ **THE SCALE GAINED A SECOND CHANNEL ON 2026-09-07 (DL-68, Keith). Each `elev-n` now carries a SURFACE FILL
beside its shadow.** A component names what it is, a resting card, a popover, a modal, and receives both.
⛔ **A component never picks a grey and never sets its own background to get depth.**
✅✅ **THE TONE VALUES ARE NOW RULED, DL-69, 2026-09-08 (Keith). ONE STEP, NOT THREE.** The measurement is done
and the "expect roughly three tone steps" guess above was WRONG, so do not re-add it.
- **Base, the page ground, is `hue-ink-100` `#EDF1F4`**, a 1.136 step below white. ⛔ **The page background is
  currently not set anywhere in the app, so this is an ADDITION rather than a change**, and it lands on every
  route at once.
- **`elev-1` through `elev-6` ALL stay `#FFFFFF`.** Cards, popovers and modals share the ceiling and are
  separated by shadow alone.
- **`elev-0` takes the tone of whatever contains it**, `ink-100` on the page and white inside a card. It is a
  rule, not a value.
- **The sidebar leaves the tone scale entirely** and takes a dark ground, `hue-ink-900` `#20262B` proposed and
  awaiting Keith's eye.
- **Both riders take `hue-ink-50` `#F4F7F9`**, the `ComplexTable` header (today stock `bg-gray-100`) and
  `PowerFlowChart`'s nine hardcoded `#F9F9F9` tiles. They become insets, which is the role `hue-ink-50`
  already carries at `StatCard/index.tsx:179`. **No fourth value is minted.**
⛔ **THE TEXT RULE IS PER SURFACE, NOT GLOBAL, and this is the part most likely to be over applied.** `ink-600`
measures 4.35 on `ink-100` and FAILS AA 4.5, so **small text sitting directly on the page ground moves to
`ink-700`** (7.24). ✅ **`ink-600` stays correct on cards** at 4.94 on white, and most text in this app lives on
a card, so most text does not change. Page headings are large text, need only 3.0, and clear `ink-600`, so they
do not move either.
⭐ **The reason, because it changes how the work is judged.** Every shadow in the app currently falls on white
cast by a white card, so the seven declared elevation levels render as almost nothing. **The page leaving white
switches the shadow scale ON rather than adding one tone level.** Three tone steps were rejected because the
middle level lands around 1.056 and 1.076, under the roughly 1.05 floor where a step stops reading, and a
marginal step reads as a dirty panel rather than as hierarchy. ⛔ **If it still reads flat after this, the
remedy is tuning shadow VALUES in the browser per DL-68, not adding tone steps.** Names carry purpose,
never colour. Canonical in the wiki's `design-system.md` under ELEVATION AND SHADOW, and mirrored in the
repo-root `CLAUDE.md` under DEPTH. **Keith's stated problem is that the interface looks flat, and that sentence
is the specification the tuning answers to.** Application of the conventions is filed as five items, `AB#993` Button, `AB#995`
typography roles, `AB#997` interaction contract, `AB#999` layout hygiene, `AB#1002` responsiveness. Check
`CLAUDE.md` for what is buildable before assuming a convention is live.

1. **Status normalization**: map all three legacy `event_type` vocabularies (UPPER+numeric,
   lowercase incl. `failure`, filter labels) to the 5-status enum; `online` → `normal`.
   The mapping table is rendered in `severity-system/SeveritySystem.dc.html`.
2. ⛔ **Donut filter — DEAD. SUPERSEDED 2026-08-22 by DL-53, which overrode a locked spec decision.
   The status donut is NO LONGER A FILTER CONTROL.** It is a hover-to-inspect exception readout that emits
   no filter events. **Do not rebuild click-to-filter on the donut and do not "restore" it as a regression.**
   DL-54 adds the map's eased re-fit on a legend filter change, which is the legend's job, not the donut's.
   Both land on AB#737 / 4.4. Historical text, kept only so the removal is recognisable: *clicking a segment
   or legend row toggles that status into the fleet filter (multi-select); active selection dims other
   segments and shows a clear control.*
3. **Anomaly**: derived at render time; **shown at zero as a disabled row, NOT hidden (overridden 2026-08-11, DL-34, superseding this contract)**; violet everywhere.
4. **Fault-slice bug — fixed on `dev`, keep it fixed**: the legacy `InverterStatus` fed its
   Fault slice from `normalCount`. That is corrected (`InverterStatus.tsx` now binds
   `faultCount`), so this is a do-not-reintroduce contract, not a live defect: every status
   is its own slice in any port or rebuild.
5. **Map pins**: status color is dominant; capacity sizing optional (`sizeByCapacity`).
6. **Legend counts**: "Label · N" format via SeverityBadge/legend rows.

## 8 — Known gaps (design side, don't block on them)

- **`aggregator-dashboard` is missing from both this index and the templates branch** — it
  is not under `design/templates/` on `chore/ds-templates-reference` (branch last updated
  `00b115e`, 2026-07-16), so there is nothing to index yet. Design's 28 July audit reached
  neither artifact; it needs couriering from Design before it can be referenced here.
- 66 Figma component families are un-built in code. ✅ **THE POINTER IS RESTORED 2026-09-03. `DESIGN-SYNC-HANDOFF.md` DOES EXIST**, at **`design/templates/_ds-foundation/DESIGN-SYNC-HANDOFF.md`**, 19,411 bytes, alongside `FAMILY-BUILD-SPEC.md`, `REGROUPING-SPEC.md`, `README.draft.md`, `fig-tokens.css` and `fig-typography.css`. ⛔ **The 2026-09-02 removal was WRONG and its stated verification is the reason why.** The search ran across `docs/` with a positive control, so the instrument worked and the territory was wrong, and "not in `docs/`" was written down as "does not exist". The foundation folder sits under `design/templates/`, which this same guide then claimed was not in the working tree, which is exactly why a `docs/`-scoped search could not see it. That claim is itself corrected above, the path IS on disk. Cite it by the full path above.
- `fig-tokens.css` still ships `purple-lt`/`purple-dt` scheme modes from the kit — retire
  or rename at the kit level (violet is anomaly-reserved).
- Tailwind runtime vars (`--tw-*`) in the synced bundle are linter noise — exclude at the
  export step, not by hand.

## 9 — Icon traps, measured (added 2026-08-28 from AB#941 / 2.2)

**Three classes of icon in this repo cannot be used the way a caller expects. Check before rendering one.**

1. **Hardcoded-fill glyphs** — recorded earlier in the census; they ignore `currentColor`.
2. **Gradient illustrations** — `Battery` and `Panels` are illustrations, not glyphs, and are
   **unusable at 15px mono**. AB#941 added seven line icons rather than shrink them: `Clock`,
   `Refresh`, `SolarPanel`, `InverterUnit`, `BatteryLine`, `Sun`, `CalendarDays`, all in the
   `LineChart` idiom, the same class of addition AB#940 made for the tab icons.
3. ⛔ **No-viewBox glyphs, which is the newest and the least obvious.** `icons/EmptyImage.tsx`
   declares `width` 64 and `height` 56 and **no `viewBox`**, so ANY scaled render clips the
   drawing. AB#941 repaired it at the call site by passing `viewBox="0 0 64 56"` through the props
   spread and left the shared file untouched, which means **the next caller hits the same clip.**
   Rule: an icon here cannot be assumed to scale. A caller rendering one off its native size checks
   for a `viewBox` first.

**Import convention: by direct path (`icons/Clock`), not through the barrel.** That is what the tab
icons do, and it is why AB#941 added seven files without touching `icons/index.ts`. Keep it that
way while the merge queue is deep: the barrel is a same-spot-addition target and two branches adding
entries to it conflict, which is exactly how `vite.config.ts` conflicted between AB#940 and AB#948.

## 10 — The DS capacity card differentiates by ICON, not by colour (measured 2026-08-28)

`capacity-facts/CapacityFacts.dc.html` has **no per-tile colour semantics.** It differentiates by
**icon** (SolarPanel / Inverter / Battery on the nameplate row, Sun / CalendarDays / LineChart on
generation) and carries exactly **two value colours**: nameplate `#20262B` and generation `#1F4173`.
Both are **exact token matches** (`hue-ink-900`, `hue-sky-900`), so a port needs no new tokens for
the values.

⚠️ **One divergence with no token behind it:** the generation eyebrow labels are `#5A7A93`, absent
from the ramp. AB#941 used `hue-ink-400` on both rows rather than introducing a hex, per tokens-only.
If that grey is deliberate it needs a token; if not, the repo is the better reference now.

**And the template contradicts itself elsewhere on the chip question:** `plant-popover` says
explicitly not to hand-roll the status chip and to import the badge, while `domain-plant-shell`
hand-rolls one with hex values. **The keystone wins**, on tokens-only grounds. AB#941 did not port
the PlantShell chip.
