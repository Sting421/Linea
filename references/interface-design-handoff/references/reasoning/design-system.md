# Design system & DS process

> Keith owns the DS (Claude Design project, `.dc.html` components). Current as of 2026-07-22.

⛔ **THIS PAGE IS THE REASONING SURFACE. THE VALUES ALSO LIVE IN `../../design-conventions/`, TEN FILES, ADDED 2026-09-22 UNDER DL-102.** Those files state WHAT TO BUILD, with a build-state mark on every claim. **This page keeps every measurement, every rejected option and every derivation, and stays canonical for all of it.** ⛔ **Do not restate a reason in a convention file and do not restate a value here.** Three values are duplicated on purpose and are marked there, the elevation table, the type scale and the button size table. ⚠️ **When a ruling changes, BOTH surfaces move in the same turn**, the value there and the reasoning here, or the split becomes the drift it was built to prevent.

## DS role (DL-13, refined 2026-07-22)

The **repo/code is the primary source of truth** for what is built (shipped code, tokens in `theme/`, mechanics; `/design-sync` publishes repo→ds-bundle, no auto-codegen, so components live in and are published FROM the repo). **But for component work, build toward the Claude Design components** — Keith hand-curated them (extract the existing component, improve it, then design net-new), so they carry intentional design decisions and are the design intent, not a disposable reference. A repo/Design disagreement on a component's look or behavior means bring the repo toward the Design version, not override it. This refines DL-6 (blanket DS-first) rather than discarding the DS. Still holds as process: (1) **tokens** — consume `theme/` tokens, never hardcode; (2) **palette lock** — the three-palette system (locked 2026-07-15); (3) **DS layer stays LOCAL** (design/templates/ gitignored); (4) net-new is designed in Design first (priced design work). 2.2 predates this; 2.6/825 realigns it.

## Repo pipeline reality (Code investigation, 2026-07-15)

- `/design-sync` direction is **repo → ds-bundle** (publishes repo components); it never imports the DS zip. The DS→repo flow is the human/agent process above. `ds-bundle/` is generated + read-only.
- **Token source = `theme/` TS modules** (NOT a CSS `:root` layer; no tokens.css in the repo). `theme/status.ts` → `tailwind.config.ts` → `status-*` utilities; hue-sky ramp in `theme/colors.ts`. Editing `theme/` is resync-safe. The folder-root `tokens.css` here is a **value reference only — do not drop into the repo**.
- `fig-tokens.css` is a raw Figma dump with grayscale placeholder statuses — **never a palette source**. Authoritative palette = AREA-BUILD-GUIDE §1 + the `.dc.html` inline hexes.
- DS templates extracted to repo `design/templates/` (99 `.dc.html`, harness stripped; branch chore/ds-templates-reference). Guide canonical at repo `docs/AREA-BUILD-GUIDE.md`.
- **DS layer stays LOCAL** (Keith, 2026-07-15): `design/templates/` added to .gitignore; the chore PR is MOOT, do not open it. Peter's PRs carry only app code; Keith's agents read the DS layer locally.
- design-sync build is red at dev HEAD until 2.2 merges (barrel references StatusBadge/StatusDot which live on feature/725). Republish `/design-sync` after 820 merges.

## Three-palette color system (LOCKED 2026-07-15)

1. **STATUS** palette (see [status-semantics](status-semantics.md)) — a value's health/state. Status hues **reserved for status meaning**; violet is EXCLUSIVELY anomaly (never in categorical charts). Blue is the accepted brand/normal dual-use exception.
2. **CATEGORICAL** palette (`--cat-*`) — a value split into categories. Final set: solar/PV **#EAB308** · battery/SOC **#1FA845** · grid-import **#0B7285** · grid-export **#1F4173** (navy) · home-load **#E0521E** · generator **#7F5539** · self-consumption **#C2418F** · curtailed **#A8B0B7** · Sankey hub node **#3A434B** (neutral slate). One canonical color per energy concept across ALL charts. ⭐ **TENTH VALUE ADDED 2026-09-16 (DL-86), backup and emergency power output `#22C3D6` (`cat-backup`).** It applies to the `EPS` series and to `Emergency Power`, which are one concept that had been carrying two unrelated colours, a pale yellow and a purple. ⚠️ **It is three degrees of hue from grid-import**, dE 31.2 at a 2.62 contrast ratio, so the pair separates on brightness alone and is the one combination that fails for reduced contrast sensitivity. ⛔ **The inverter throughput series are NOT categorical**, they read `total_dc_to_ac` and `inverter_power`, so they take the brand ramp at `hue-sky-600` per the cut. ⚠️ **The locked set now occupies nearly all the non-status hue space, so an eleventh value will be family-adjacent to something**, and that is a constraint on the next request rather than a reason to refuse it.
3. **BRAND ramp** (hue-sky, #009DE4/#03587F/#1F4173) — single-series/sequential/decorative.

The cut: health signal → status; category breakdown → categorical; single-series → brand. Non-status accents = navy/teal/rust/green (orange omitted: #E08600 IS warning). Watch item: accents orange/rust are family-adjacent to warning/fault — keep decorative leans on teal/green.

## DS-side items on Keith's plate (he owns the DS)

- **DONE in the DS (2026-07-22, aligned to AB#825, out for review):** Spec fix 1 — StatusBadge `uppercase` prop removed. Spec fix 2 — StatusDot `size` sm/md/lg = 7/9/11px (md 9 default, 2px white halo; StatusDotGallery lg corrected 12→11). Decision 1 — standalone StatusDot is the dot; StatusBadge variant enum = solid/soft/outline only (dot/dot-only dropped). Decision 2 — count formats recorded canonical: badge `×N` (only when N>0, muted/tabular), donut-legend `· N`. Applied across SeverityBadge (×3) + the SeveritySystem showcase + StatusDotGallery.
- DS-cleanup prompt (Cowork #2): SENT to Claude Design + COMPLETED 2026-07-22 (reference hygiene per DL-13, not a build gate; 5 files edited, out for review). The recurring DS punchlist (style holes, read-only synced source) had no new or actionable items this pass.
- **Severity-order divergence (DS follow-up, 2026-07-23):** the repo now ranks `STATUS_SEVERITY` = fault > anomaly > warning > offline > normal (fixed on feature/820 per the DR precedence). AREA-BUILD-GUIDE §1 + SeveritySystem.dc.html still say fault > warning > anomaly, so the DS reference now lags the code. Repo wins (DL-13); DS-side task = update the guide + SeveritySystem to anomaly>warning. Deliberate divergence noted in PR !983. **DONE 2026-07-25:** Claude Design updated 6 files — AREA-BUILD-GUIDE §1, SeveritySystem.dc.html, + the live `rank()` sort maps in PlantMap + 3 area-1 templates (fault:0/anomaly:1/warning:2/offline:3/normal:4). Guide + template behavior now match the repo's STATUS_SEVERITY.
- **GUIDE PARTLY REPAIRED IN-REPO 2026-08-03** (the templates branch is still frozen, so the courier job stands for the templates half). Fixed: the `:root` instruction is now an explicit prohibition rather than a deletion, so nobody re-adds the layer; the copy-the-templates instruction is replaced by the `git show` technique; StatusDonut is past tense; the fault-slice line is reframed as a do-not-reintroduce contract. Added: **a new §0 Sibling copies, placed before §1** so it is read before a template is chosen, and a §8 note that `aggregator-dashboard/` is missing from the index *and* the templates branch. Guide grew 153 → 210 lines; anchors moved — tokens now line 31, §0 at 41, §1 at 70, §7 at 185, §8 at 200. **Known exception to §0's "area1-fleet-overview wins" rule: `PlantCard` already uses the gallery's shadow, not the Area 1 screen's, which is why AB#732's note says 4.3 may need a second token.** The rule generalises one precedent to five components and this is the one that went the other way.
- **⚠️ THE GUIDE AND THE TEMPLATES BRANCH WERE BOTH FROZEN AT 2026-07-16, AND DESIGN'S 7/28 AUDIT REACHED NEITHER (measured 2026-08-03).** `docs/AREA-BUILD-GUIDE.md` is dated 16 July; `chore/ds-templates-reference`'s last commit is `00b115e`, same vintage. **The courier job is double, not single** — guide *and* templates branch. Consequences live today: no `aggregator-dashboard/` entry (the whole A1 dashboard screen invisible to Code), no sibling-copies section, and two lines that are actively wrong as *instructions* rather than merely stale. **Line 14 tells a builder to put tokens in `:root`** — there is no `:root` layer in this repo, tokens are TypeScript in `theme/` spread into Tailwind at `tailwind.config.ts:24`, and following that line would create a CSS-variable layer the project deliberately does not have. **Lines 9–10 instruct copying `design/templates/` into the repo**, which PR !994 deliberately untracked. Two smaller decays: line 72 describes the StatusDonut swap as future (it merged), line 141 describes the fault-slice bug as live (fixed on dev). The status palette at lines 22–28 **is** trustworthy verbatim — 820 reconciled it.
- **The nine sibling copies, enumerated (2026-08-03).** This is the list the guide's missing §8 would carry, and the reason components keep getting rebuilt from scratch: a builder porting one has a coin-flip chance of lifting the wrong copy with nothing warning a sibling exists. `AlertStripRow` (fleet-alert-strip · area1-fleet-overview) · `CoverageLabel` (fleet-coverage-label · area1-fleet-overview) · `PlantCard` (fleet-plant-card · area1-fleet-overview) · `Sparkline` (chart-primitives · area1-fleet-overview) · `StatusDonut` (status-donut · chart-primitives) · `SeverityBadge` (severity-system · domain-control-readout) · `Button` (form-controls · domain-control-readout) · `Chip` (ui-chip · domain-control-readout) · `Switch` (ui-primitives · domain-control-readout). 54 slugs on the branch; the guide documents exactly one of these duplications inline (line 82, the Area1Map copy). **For Area 1 work the `area1-fleet-overview/` copy wins** — that is the precedent set when AB#732 chose it over the gallery.
- **DS templates are readable without the working tree having them (technique, 2026-07-28):** `design/templates/` is absent from the current checkout, but the 7/15 extraction is COMMITTED on branch `chore/ds-templates-reference`. Agents can read any template with `git ls-tree -r --name-only chore/ds-templates-reference` to find the path, then `git show chore/ds-templates-reference:design/templates/<slug>/<Name>.dc.html`. Used successfully in the 845 restyle. **Caveat: it is a 7/15 snapshot** — anything added since (e.g. `aggregator-dashboard/`, the updated AREA-BUILD-GUIDE) is NOT there and still needs couriering.
- **StatTile geometry (measured from the .dc.html, 2026-07-28)** — the reference for any KPI/preview surface: 12px radius · `16px 18px 12px` padding · 10px vertical rhythm · label 12.5px/500 at `0.01em` · value 38px/700 at `-0.015em`, line-height 1 · unit 14px/500 baseline-aligned · sparkline band `margin: 2px -2px 0`, height 44px (a 2px overhang inside the padding, NOT full-bleed). PreviewCard (845) now matches this exactly. Four DS neutrals in it have no token equivalents (`#E2E7EB`, `#6B7177`, `#20262B`, `#8A9199`) — mapped to nearest, pending the neutral-ramp reconciliation.
- **Space Grotesk is NOT loaded in the repo (verified 2026-07-28):** the DS sets headings/values in Space Grotesk, but the repo declares no `fontFamily` anywhere (no webfont, no @font-face, nothing in `theme/typography.ts` or `tailwind.config.ts`). Every DS port therefore drifts typographically — 845 matched StatTile's size/weight/tracking on the system stack rather than quietly adding a webfont (correct call). **Needs a filed work item**: load the DS heading face properly, or record a deliberate decision to render the DS type in the system stack.
- **Neutral palette not tokenized:** the DS's structural grays (e.g. #E2E7EB / #E4E9ED / #F4F7F9 + inks, used by StatusDonut) are not status tokens. Porting convention for now = nearest `gray-*` / `hue-*` utility or arbitrary value (unblocks 2.3). DS-side task queued: add a neutral ramp to `theme/` so they are consumed as tokens (Cowork board).
- **AB#870's actual footprint on `dev`, measured 2026-08-03.** DS neutral literals survive in exactly three component files: `StatusDonut/index.tsx` (seven sites: `#E4E9ED` as `GRAYED_SEGMENT`, `#E2E7EB` card border, `#8A9199`, `#9AA3AB`, `#F4F7F9` hover, `#20262B`, `#6B7177`), `CoverageQualifier/index.tsx` (`#8A9199`), `StatusDot/index.tsx` (`#3A434B`). Two test files assert on the hexes and move with them: `StatusDonut.test.tsx:35` and `app/utils/status.test.ts:186`. Everything else neutral-shaped on `dev` is already a Tailwind utility. **`StatusBadge` carries no neutral literal at all** — pure `status-*` tokens plus `text-white` — so it is out of the ramp's scope regardless of branch.
- **⚠️ `#6B7177` is BOTH a DS neutral ink and `status-offline`** (`theme/status.ts:10`), byte-identical. A find-and-replace repointing neutrals to ramp tokens would silently rewrite the offline status token, and repointing `StatusDonut/index.tsx:233` (a row's secondary text, ink meaning) to a *status* token would be equally wrong in the other direction. Every `#6B7177` site must be classified by meaning, not matched by value. Same trap class as `hue-red-50` / `status-fault-soft` recorded under the PreviewCard anatomy above.
- **PreviewCard anatomy AMENDED 2026-07-28 (Keith, after seeing StatTile rendered):** the delta chip is now IN — `delta?: number | null` + `invertDelta?`, rendering StatTile's pill (↑4.2% / ↓8.5%, tabular-nums), suppressed outside `value` mode (a delta beside an em-dash is derived from data that isn't there). Chip sits level with the value (outer row `align-items:center; gap:10px`; inner row `align-items:baseline; gap:5px` for value+unit) at one step smaller than StatTile's: 12px / `3px 9px`. Interaction added too: 24px round arrow affordance (sky border + soft fill, 4px shift, 150ms `cubic-bezier(.23,1,.32,1)`, `group-active:scale-95`), whole-card hover via a named `group/card` applied only when the card links, and the click target is **title text + arrow only** (two anchors to one href; the arrow's is `aria-hidden` + `tabIndex={-1}` so AT announces one link and the keyboard gets one stop). Reduced motion drops movement only, keeps the colour transition. **Required four additive tokens in `theme/colors.ts`** (the one shared-file exception to 845's new-files-only scope): `hue-green-50 #E7F8EC`, `hue-green-700 #15702F`, `hue-red-50 #FDECEA`, `hue-red-700 #9E1B12` — dev had no dark or soft green, so a token-only chip was impossible. **Two notes for the neutral-ramp item to absorb:** `hue-red-50` near-duplicates the existing `hue-rose-50 #FFF0F1`; and `#9E1B12`/`#FDECEA` are also exactly `status-fault-text`/`status-fault-soft` in the incoming 4-tier set, so after !983 the same colours exist under both a status and an accent name — the chip deliberately uses the ACCENT names, since status hues are reserved for status meaning and a trend delta is not a status.
- DS showcase gap: **PreviewCard** was missing (PBI 3.6 anatomy agreed: title row + → affordance, headline KPI, optional sparkline, footer microcopy, live vs placeholder states; delta chip added 7/28). Distinct from Per-plant card. **Closest DS sibling = StatTile** (`templates/chart-primitives/StatTile.dc.html`, KPI tile with sparkline + delta; the sparkline itself is `templates/chart-primitives/Sparkline.dc.html`, both showcased in `ChartPrimitives.dc.html`) — PreviewCard must inherit StatTile's visual language (full-bleed sparkline with gradient fill + endpoint dot, value type scale, padding/radius) even though its anatomy differs (arrow affordance, footer microcopy, placeholder state; no delta chip).
- **CORRECTED 2026-07-28 (verified at `AREA-BUILD-GUIDE.md:87` by both Code and Cowork): StatTile was NEVER missing from §3.** Line 87, inside `## 3 — Area 1 · Fleet Overview`, reads: `| KPI tiles | evolved-statbox/EvolvedStatBox.dc.html, chart-primitives/StatTile.dc.html (with sparkline) |`. Both KPI tiles were listed, in the Area 1 section, under a row named "KPI tiles". The genuine §3 gap is narrow: **Sparkline** is in §6 only (lines 121–122). **So the 845 divergence was NOT a guide gap — it was the guide's own KPI-tiles row not being consulted before designing a KPI-shaped card.** Failure chain worth remembering: Code offered the guide-gap explanation as a root cause, Cowork accepted it without checking the tracked file it had access to, recorded it as a systemic finding, and dispatched Claude Design to fix it — three steps of propagation off one unverified claim. **Rule: a claim that becomes memory (or dispatches another agent) gets verified against the source first.** Design's audit was still net-valuable (see below) — but **check its guide edit for a DUPLICATE StatTile §3 row when the DS drop lands.**
- **Guide completeness does still matter (the audit's real finds, 2026-07-28):** `docs/AREA-BUILD-GUIDE.md` is the index Code consults, and Design's sweep found genuine holes independent of the StatTile false alarm. **Design's full guide audit (2026-07-28) found the gap was much larger and fixed it:** StatTile + Sparkline now have §3/§6 rows with paths; **`aggregator-dashboard/` was entirely absent** (the whole A1 dashboard screen was invisible to Code); §6 was prose-only, now explicit tables with paths (added Switch, Tabs, Tooltip, CustomSwitchDemo, the five form-controls, complex-table, device-plant-crud); unpathed folder refs (`domain-plant-shell/`, `battery-safety/`, `weather-card/`, `maintenance-log/`, `plant-photos/`) now name entry files; `fleet-alert-strip` added to Area 1. **New §8 "Sibling copies"** — the root cause of from-scratch duplicates: 8 components are vendored into screen slugs (SeverityBadge ×3, Sparkline ×3, **PlantCard ×3**, **PlantMap ×3**, AlertStripRow ×3, CoverageLabel, StatusDonut, control-readout primitives), canonical source now named per component + the rule to grep the index before building. **New §9** = full index of all 46 slugs + entry files. Guide lives canonically in the REPO (`docs/`), which Design cannot write to — its edits land in Design's workspace and must be couriered into the repo by Keith, or Code still can't see them.
- New DS templates 7/15: **PlantPopover placed** (popover redesign, commit 31f8378 = new A1 item, Cowork #8; 820 only recolored the chip). **fleet-map redesign IS placed — RESOLVED 2026-07-28 (was wrongly carried as pending since 7/15).** The correct export landed on `chore/ds-templates-reference` at commit **00b115e, 2026-07-16** ("update fleet-map template spec to latest export"), rewriting `design/templates/fleet-map/PlantMap.dc.html` (+111/−27). Verified as the real map, not another popover dup: 21 maplibre references, "Search this area" ×2, 15 pin refs, a legend, zero PlantPopover. The earlier stale-zip incident was never reconciled after the fix, so memory carried a dead blocker for 12 days. Both ports (4.5/AB#836 popover, 4.6/AB#837 fleet-map) are now gated ONLY on 820 + 2.2 merging. Note the template has no clustering (that is 4.2/851's own work).
- **Two Area 1 templates disagree on the alert card, and the repo followed the screen (2026-08-02, found building AB#732).** `Area1FleetOverview.dc.html` and `AlertStripGallery.dc.html` specify different **card padding, separator inset and shadow** for the same component. `AlertsList` followed `Area1FleetOverview.dc.html` on the grounds that the Area 1 screen is authoritative for an Area 1 panel, and the note was deliberately cut from PR !999 because it is a DS-side question, not something Peter reviews. ~~**Reconcile the two templates so the next port has one answer.**~~ ⛔ **CLOSED 2026-09-07 (Keith), do NOT reconcile them.** `AlertsList` is in the repo and the repo copy is what the next build reuses, the templates are reference only under DL-13. Reopen only if a template is ever the source for a new port of this card. This is the same class as the §8 sibling-copies finding: a component vendored into more than one screen slug drifts, and nothing detects it until someone builds from the wrong copy. Related, from the same build: `AlertStripRow` is now in the repo (`app/components/AlertStripRow/`, exported alongside `AlertStripCard` and `AlertStripDivider`) but **unpublished** — it needs a `/design-sync` pass to reach the bundle.
- **The product now has TWO card languages and eventually one has to win (2026-07-31, Keith's decision knowingly taken).** The **house card** (`rounded-xl` 12px, `px-[18px] py-4`, `shadow-xs`) is what `FleetStatusDonut` and `ProductionKpi` use. The **DS card** (14px radius, no padding, the new `card` shadow token) is what the alerts widget uses, chosen over house-card consistency so the DS row ports faithfully. **Consequence Keith accepted: the alerts widget visibly differs from its own band neighbours** — tighter rows, larger radius, heavier shadow. Intended, disclosed in !999, and a reviewer will notice. Area 1 carries both until the card question is settled. Note also that `PlantCard` uses the *gallery's* shadow rather than the Area 1 screen's, so 4.3 may need a second token.
- **Typography scope RULED by Keith 2026-08-02, during AB#869's planning: Space Grotesk on headings and DS figure values ONLY; body text stays on the regular sans.** Two typefaces is the intended end state, not an accident to clean up later. Code raised a third reading while planning — that the DS templates set the family on **whole row containers**, which would sweep in body text and effectively make Space Grotesk the default sans across all ~480 weighted elements. **Keith's ruling treats that as the templates being loose rather than as design intent**, so the scope does not widen to match them, and a DS figure that needs the face gets it on the element rather than the container. The recorded line below was already correct; this settles it against a live challenge.
- **The two-typeface end state is now EVIDENCED, not inferred (AB#869 build, 2026-08-03).** `ui-primitives/StatusDot.dc.html:36` pins its label to `font-family: ui-sans-serif, system-ui, sans-serif` **explicitly** — the DS does not merely omit the face on some elements, it specifies the system stack on one. Cite this as the precedent for future "should this get Space Grotesk?" questions. The build also settled where the face goes: **at the DS component root when that component contains only DS chrome**, which is what `StatusDonut.dc.html:17` and `CoverageLabel.dc.html:17,24` do, not per text element. **REFINED 2026-08-03 while scoping the Epic 3 follow-up: root application is the exception, not the default — it holds for only one of the next four components.** `StatusBadge` takes it at the badge root (`SeverityBadge.dc.html:16-42`, all five variants). `ProductionKpi` is per element — figure value, delta, label — because both tile templates target elements rather than the tile root (`StatTile.dc.html:17,21,24`; `EvolvedStatBox.dc.html:18,23,28,32`). `AlertsList` gets the card title only. **`AlertStripRow` is the instructive one: its template DOES set the family on the row root (`AlertStripRow.dc.html:16`) and that must not be copied**, because the row carries the event message and plant name, which are body text. The template is loose exactly where Keith's ruling predicted, and the operative test stays "does this container hold body text", never "does the template set it here". Applying per element would have left "Clear filter", "of N plants" and "No data" in the system face inside a card whose other text was not.
- **Tailwind key for the face is `fontFamily.display` → the `font-display` utility** (AB#869). Later component work reuses this key rather than inventing a second. Known collision to live with: the built CSS carries both a `font-display: swap` descriptor and a `.font-display` rule, so **verification must grep `font-family:Space Grotesk`, never the class name** — the minifier also strips the quotes, so even the value grep needs the unquoted form.
- **`theme/fontsize.ts` defines exactly one key, `size-13`, and no DS component uses it** — `StatusDonut` writes the arbitrary `text-[13px]` in four places instead. Pre-existing across the merged ports. Candidate cleanup: adopt the token or drop it as dead.
- Typography: Space Grotesk headings + plain body. Map engine: **MapLibre GL + MapTiler** (approved). Dev uses Keith's own MapTiler account/key (no billing needed, dev-only; resolved 2026-07-20). Prod intent = org-owned account/billing, not a personal account.

## `StatusDonut`'s contract changed 2026-08-11 (AB#878)

**It is now a five-status donut plus an optional non-status row, and the count of entities excluded from the
segments is part of its API.** New `unavailable` prop; the centre renders a **denominator** when it is
non-zero (`"103 of 106 plants"`, reusing the vocabulary its filtered state already shipped rather than
inventing one); a sixth row sits under a rule with a **hollow** dot so it cannot read as a segment.

**Neither the row nor the dot is coloured or animated, deliberately.** Plants with no derivable status are
**missing telemetry, not in a fault state** — colour or motion there would outrank a real fault, which renders
completely static. The token rules reach the same conclusion independently, since status hues are reserved for
status meaning. Weight and structure carry the distinction instead.

**Why the count moved inside the card**, since the plan argued the opposite: `StatusDonut` renders its own card
chrome, so anything a *consumer* renders is outside that card **by construction**, and no restyling of the
consumer's markup connects it to the figures it qualifies. That is structural, not cosmetic.

**Anomaly no longer hides at zero** (DL-34) — every canonical status keeps its row, a zero renders disabled as
Fault's always did.

**Not built, surfaced by the same design pass:** the spinner-to-card swap teleports on load and on utility
switch, and legend rows have no press feedback. Also pre-existing and one word to fix: hovering a segment
thickens it 26 → 30 but `stroke-width` is not in the transition list, so the colour fades while the thickness
snaps — in a file `feature/869` and `feature/870` both edit.

## `animate-status-pulse` retuned and guarded 2026-08-12 (AB#891)

**The shared status-pulse token changed for every future consumer**, and it was free to change because it had
none: `tailwind.config.ts` shipped the `status-pulse` keyframe and `StatusDot` exposed a `pulse` prop, and
**nothing in the app switched it on**. AB#891 is its first consumer.

| | Before | After |
|---|---|---|
| `transform` at 100% | `scale(2.6)` | `scale(2.1)` |
| `opacity` at 0% | `0.55` | `0.32` |
| duration | `1.6s` | `2.4s` |

**It had no reduced-motion guard at all.** Added at the token in `app/tailwind.css` as a
`@media (prefers-reduced-motion: reduce)` rule zeroing `.animate-status-pulse`, deliberately **not** at the one
call site, so any future consumer inherits it rather than re-deciding it.

**Scoped to fault only**, not to all five statuses. The alerts panel is in permanent view beside data an
operator reads, so pulsing every row converts motion from signal into texture: two pulsing faults is a
peripheral cue, ten pulsing dots is noise.

**There are now two status-motion systems in the app and they are unrelated.** This token, and the fleet map's
`fleet-pin-ping` (divergence #2 below), where **pace and intensity both carry severity** across four speeds.
`fleet-pin-ping` does not exist on `dev` at all: 0 occurrences, against 5 on `feature/735` and `fix/878`, which
sit at merge positions 19+. So the two have never been on the same tree and were tuned independently. **When
735 and 878 land, they need reconciling into one motion vocabulary** — a fault dot pulsing at 2.4s in the
alerts panel beside a fault pin pinging at 1200ms on the map is one status speaking at two speeds on one
screen.

**`AlertStripRow` hand-rolls its own dot rather than using `StatusDot`**, which is why `pulse` was never
available to it and why the token had to be reached for directly. **Folded into task 899's scope** (the DL-17
design-sync reconcile under PBI 7.1) rather than filed, 2026-08-12.

## `StatusDot` has a decorative mode, and its truth table is recorded so the next consumer does not re-derive it (AB#871, 2026-08-22)

**`StatusDonut`'s legend is `StatusDot`'s FIRST render site in the app.** Measured by Code 2026-08-22 via
`grep -rn "StatusDot" app/`: before this, zero consumers outside its own test file. So "shipped" for this
component meant "exists with tests", not "rendered anywhere", and that is what made an API change to it
risk-free.

**Why the mode had to exist.** The component always announced its status exactly once, which is good design
and could not express the legend's case: the legend already carries the status name in a sibling text span, so
`StatusDot`'s own `aria-label` produced *"Normal Normal · 96"*. Passing `label` was not an escape, since that
renders a second visible text span. **The prop is opt-in and the default is unchanged.**

| `label` | `decorative` | Visible output | The dot's aria | Who supplies the name | Times announced |
|---|---|---|---|---|---|
| absent | `false` (default) | dot only | `aria-label="Normal"` | StatusDot's own dot | once |
| present | `false` | dot + label text | `aria-hidden="true"` | StatusDot's visible label span | once |
| absent | `true` | dot only | `aria-hidden="true"` | the caller's sibling content | zero, by StatusDot |
| present | `true` | contradictory | contradictory | undefined | **forbidden by the type** |

**The fourth row is forbidden rather than defined, and the reason is worth keeping.** `label` asks the
component to render visible text, and visible text is itself an accessible-name source, so it is announced
whatever `decorative` claims, while `decorative` asserts the caller has already named the dot. Both cannot
hold. A permissive implementation would make `decorative` a silently ignored no-op in that combination, and
**this repo's no-comment standard leaves nowhere in the file to record that**, so the type carries it:
`StatusDotBase & ({ label?: string; decorative?: false } | { label?: never; decorative: true })`. The test
asserts the rejection with `@ts-expect-error`, which is a real assertion here because `tsconfig.json` has no
`exclude` and so `tsc` covers test files.

**The DS template carries no aria attributes at all** (`design/templates/ui-primitives/StatusDot.dc.html`),
so the aria behaviour is a repo-side addition rather than a design requirement, and design contradicts none of
this. The template otherwise corroborates the shipped component exactly: 9px, `box-shadow:0 0 0 2px #fff`,
`flex:0 0 auto`, `gap:7px`, hexes matching `theme/status.ts`. ⚠️ **`StatusDonut` appears TWICE in the DS**,
under `chart-primitives/` and `status-donut/`, which is the vendored-duplicate hazard the build guide's banner
warns about.

**Consuming it in a legend or a row that already names the status:** `<StatusDot status={x} decorative
className="flex-none" />`. `size` is omitted because `md` is already 9px, and `flex-none` goes on the outer
wrapper, which does not carry it by default (the inner wrapper does).

**Related and already scoped, not a new finding:** `AlertStripRow` hand-rolls its own dot for the same reason
this prop now solves, and it is already folded into task 899's DL-17 reconcile. `decorative` is what makes that
swap possible when 899 runs.

## The four deprecated neutral ramps are still live across the app, measured rather than estimated (2026-08-22)

**227 occurrences across 61 files, or 59 files excluding `.test.` files.** Command, from Code:

```
grep -rn -o -E "hue-(neutral|slate|stone|zinc)-[0-9]+" app/ --include=*.tsx --include=*.ts
```

By ramp: `hue-neutral` 158 · `hue-slate` 38 · `hue-zinc` 26 · `hue-stone` 5. Heaviest single files:
`GoogleMaps/PlantInfoWindow.tsx` (14), `_.GridGuardian.remote-set/ForcesDischarge.tsx` (11),
`_.GridGuardian.remote-set/AcCharge.tsx` (11), `Home/AlertsList.tsx` (9).

**Not filed, deliberately.** This is migration-sized rather than bug-sized. Recorded here so the number exists
with its method, because it first arrived as "roughly 60 files" with no command attached and that is how a
figure becomes folklore. **The class has a filing precedent if Keith wants one:** 2.7, 2.8 and 2.9 were all
filed as DS-debt PBIs under Epic 2.

✅ **Closed by the same measurement: the AB#878 follow-up is discharged.** Five deprecated `hue-neutral-*`
utilities had shipped in `StatusDonut`'s No-status row and tooltip, left as authored and needing either a
commit on 878 or a small item. Commit `a6c4222` ("Move the No-status row onto the live neutral ramp") already
cleared them on `dev`; `grep -c "hue-neutral" app/components/StatusDonut/index.tsx` returns `0`. The row now
uses `hue-ink-*` and `hue-gray-*`, and `hue-gray` is not one of the deprecated four. **Nothing to fix, and the
follow-up should not be carried forward again.**

## PreviewCard's Grid figure diverges from its template, and the reason is a backend gap (AB#733, 2026-08-14)

**The template specifies grid frequency. The card ships grid share of supply.** Recorded here because a divergence with no written reason gets "corrected" back by whoever reads the template next.

**This is not the usual repo-versus-design disagreement, and DL-13 does not resolve it.** DL-13 says bring the repo toward the Design version. That presumes the Design version is buildable. Here it is not: frequency exists at fleet scope on no endpoint. The per-plant source needs a `plantId`, and paging 106 rows is the pattern PBI 3.7 explicitly rejected for this card's sibling; `plant-daily-summary`'s `min_grid_frequency` is a **minimum per plant**, so aggregating it reports the worst reading in the fleet rather than the grid's frequency. A different quantity under the template's label is worse than an honest substitution.

**The template is right about the quantity.** Frequency deviation from nominal is the standard grid condition signal and frequency is a system-wide property, so a fleet reading is meaningful. Do not record this as the design being ill-conceived. It asks for the correct thing.

**What ships instead:** `grid_energy` as a share of grid + solar + battery + generator, from `grid-load-balancing`, which Home already fetches. Reads as grid reliance rather than grid health, so **the card currently answers a different question from the one it was designed to answer** and its label and unit say share, not condition. The card takes the template's chrome, typography and layout; it does not take its label, unit or footer, which encode frequency. Same discipline as AB#835, which took the fact typography and `hue-ink` values and left the Export button and the "Across N sites" note.

**Filed as a DD row** under "Non-blocking, when convenient" (fleet-level grid frequency, New, Requested), and raised with Peter directly. **If a fleet frequency source lands, this card changes to frequency and it is a swap rather than a rebuild** — the anatomy already matches.

**Process note, third instance.** The guide-first check ran *after* the figure question had already gone out for a ruling, so the first ruling was made without the template in evidence and had to be revisited. `AREA-BUILD-GUIDE.md` and the template come before the question, not after it. Prior instances: 845's StatTile and 3.5's AlertStripRow were built from scratch with templates present; 847's StatCard was aligned late.

### PreviewCard's token migration, and its typeface (recorded here because it was stripped from the PR)

Seven deprecated tokens, not the six first counted. All seven carried `@deprecated Near-miss neutral. Use hue-ink-*`.

| Was | Hex | Now | Hex | |
|---|---|---|---|---|
| `hue-slate-200` | `#E1EBEF` | `hue-ink-200` | `#E2E7EB` | restores StatTile's value |
| `hue-zinc-600` | `#616161` | `hue-ink-600` | `#6B7177` | restores StatTile's value |
| `hue-zinc-800` | `#303030` | `hue-ink-900` | `#20262B` | restores StatTile's value |
| `hue-neutral-400` | `#8A8F91` | `hue-ink-500` | `#8A9199` | restores StatTile's value |
| `hue-slate-300` | `#CDDEEF` | `hue-ink-300` | `#B6BEC5` | nearest step, no stated reference |
| `hue-slate-400` | `#8FA0B9` | `hue-ink-400` | `#9AA3AB` | nearest step, no stated reference |
| `hue-stone-50` | `#F8F8F8` | `hue-ink-50` | `#F4F7F9` | nearest step, no stated reference |

Four of the seven **restore** a value the 2026-07-28 build note had recorded as a forced substitution: it said StatTile's four neutrals had no exact tokens, which stopped being true when !1002 added `hue-ink`. So this migration is a **colour correction**, not an exact re-tokenization, and the AB#870 byte-identical-multiset criterion does not apply to it (see [incidents](../incidents.md) for why).

**Placeholder legibility, resolved.** The 7/28 note warned that if Home's surface ever approached `#F8F8F8` the Financial instance needed re-checking, and the fill was `hue-stone-50` = `#F8F8F8`. Home's mid-row sits on white (`<html class="h-full bg-white">`; neither `Layout` nor `Home` sets a surface), so the warning's condition never obtained. The fill still does almost no work at `#F4F7F9` on white, so **the dashed border remains the load-bearing cue**, now `#B6BEC5` rather than `#CDDEEF` and therefore darker against white.

**Typeface, with one deliberate divergence.** `PreviewCard` set no `font-family` at all, so everything on it inherited the stock UI sans.

| Element | Template | Shipped |
|---|---|---|
| figure | Space Grotesk 700 (StatTile 38px, Area 1 preview tile 30px) | display face |
| delta badge | Space Grotesk 600 (StatTile only) | display face |
| label | inherited sans | **display face — divergence** |
| unit, caption, pending note | inherited sans | inherited sans |

The label diverges from both templates on purpose: `StatCard`'s heading moved onto the display face on AB#835, and two cards sharing one screen with different heading faces read as an oversight. The figure keeps the face in placeholder mode too, where it holds an em dash — same slot, empty.

## StatCard against the Area 1 template — three findings, one of them a DS self-contradiction (2026-08-13)

From PBI 3.7 / AB#835's alignment pass. All three matter beyond this component.

### The build guide's row name is a trap

`docs/AREA-BUILD-GUIDE.md` maps "Capacity facts" to `capacity-facts/CapacityFacts.dc.html`. **That is the
wrong template.** Its row sits under "## 4 — Area 2 · Plant Detail" and the template's own description scopes
it to a per-plant header card. The reference for the Area 1 capacity strip is the **TERTIARY block of
`area1-fleet-overview/Area1FleetOverview.dc.html`**, reached through the "Whole screen (role-aware)" row of the
Area 1 table.

**The component is called capacity facts and the template called CapacityFacts is the wrong one.** Match on the
Area, then the block, never on the name.

### The token debt and the design gap were the same gap

Every neutral 847's StatCard used carries `@deprecated Near-miss neutral. Use hue-ink-*` in `theme/colors.ts` —
and in each case the ink value is the **exact hex the template specifies**, while the deprecated one is a
near-miss:

| Was | Now | Template |
|---|---|---|
| `hue-slate-200` #E1EBEF | `hue-ink-200` #E2E7EB | #E2E7EB |
| `hue-zinc-800` #303030 | `hue-ink-900` #20262B | #20262B |
| `hue-neutral-400` #8A8F91 | `hue-ink-500` #8A9199 | #8A9199 |
| `hue-stone-50` #F8F8F8 | `hue-ink-50` #F4F7F9 | #F7FAFC |
| `hue-slate-100` #E6EEF2 | `hue-ink-100` #EDF1F4 | #EEF2F5 |

So migrating a component off the deprecated ramps and aligning it to its template are **one action, not two**.
The four legacy families are not merely untidy; they are where the drift lives. Worth knowing for the 179
remaining legacy call sites: each is a candidate design correction, not just a rename.

**And StatCard set no `font-family` at all**, so its heading and figures inherited the stock UI sans while
`StatusDonut` and `CoverageQualifier` beside them already ran on `font-display`. Keith caught that, not the
template sweep, because the sweep read the declarations it was already thinking about (colour, size) and not the
ones it was not.

### Applied, and deliberately not

**Applied:** the token migration, the fact typography (label 10px/700 at 0.05em tracking, value 22px, unit
12px), and the opt-in numerals below.

**Not applied, each for a reason.** The template's **inline fact layout** (bare columns, leading heading block,
vertical divider) is its biggest structural difference and needs a `factLayout` variant — recorded as a
candidate. **Card chrome** (14px radius, the two-layer shadow) stays as it is, because `ProductionKpi` and
`AlertsList` draw identical chrome independently and matching one template here would make the capacity card the
odd one out; that is a cross-cutting pass. The template's **Export button** is a feature not in any AC, and its
**"Across N sites" note is a coverage qualifier by another name**, which AB#835 explicitly does not ship.

### The DS contradicts itself on numerals — see DL-36

`StatTile.dc.html` carries two `tabular-nums`, **both on the delta badge**; `EvolvedStatBox.dc.html` has none.
So the KPI-tile primitives put tabular figures on the badge and never on the value — and 847's test already
forbade tabular on the value, citing them. **That citation was checked rather than trusted, and it is accurate.**

But `Area1FleetOverview`'s tertiary block sets `font-variant-numeric: tabular-nums` **on the capacity value**.
The primitives and the Area 1 composition genuinely disagree, and both are right.

**Resolved as an opt-in `tabularValues` prop, default false** (Keith, 2026-08-13). The reconciliation is that
the rule was never tabular versus proportional: **it is whether the figures are scanned together.** A standalone
hero figure reads better proportional; three figures in one row read better tabular. Only the consumer knows
which it is, so the primitive stays neutral and the strip opts in. 847's test and both primitives are untouched.

## `clusterLabel`'s "N off" is unreachable after AB#891 — accepted, not fixed (2026-08-12)

**`AlertStripRow`'s cluster label was a feature powered by the bug AB#891 removed.** `clusterLabel` returns
`${count} off` only when a cluster row's status is `offline`, and after 891 **no alert row can be offline**: no
`EVENT_CODE_STATUS` entry maps to it, and neither live `event_text` nor `event_type` carries the word
(`topics/codebase.md:78` — a silent device cannot emit an event announcing it is silent). Every offline row in
the 652-event fixture came from the device-status fallback 891 deleted.

**Keith's call: accept it. Nothing filed, nothing deleted.** Checked first and it is **not** a spec gap — the A1
spec's alerts region never asks for offline clustering, so this is unreached code rather than an unmet
requirement. Its three tests now call `clusterLabel` directly on constructed rows, so they exercise the
function's contract rather than a production path, which is legitimate.

**If offline alerts are ever wanted they come from `plant-status`, not the event feed** — the source the fleet
donut uses. That is an Area 3 question, where the spec does carry Offline in the severity enum
(`specs/area3-alerts-events.md:6`).

## Fleet map: where the repo and the DS template disagree (AB#837, recorded 2026-08-11)

**This is the record AB#837 was rescoped to produce.** That PBI existed to bring the DS fleet-map redesign into a repo that had no map of its own. AB#734 and AB#735 then built one, and Keith's design decisions during that work diverged from `design/templates/fleet-map/PlantMap.dc.html` in nine places. ⛔ **A tenth was added 2026-08-24 and WITHDRAWN the same day; it was convergent, not divergent. See the convergent list below.** Per DL-13 the repo is the source of truth for how components look and behave, and per DL-17 the DS reconciles at area boundaries. **So the DS reconciles TOWARD the repo on all nine. A future re-export must not silently reintroduce the template's version.**

| # | Template | Repo | Why the repo diverges |
|---|---|---|---|
| 1 | **Pin form:** 22px disc, 2.5px white border, drop shadow, with a 2×7px tail beneath so the pin points at a coordinate | 28px ring, status colour on the border, no tail | The popover already draws its own tail pointing down at the pin (!1009). A tailed pin plus a tailed card puts two tails together. Keith's call 2026-08-11, and it kept the map as the visual pass approved it |
| 2 | **Pulse:** none, pins are static | Continuous, with **pace and intensity both** carrying severity: fault 1200ms strongest → anomaly 1800 → warning 2400 → normal 3600 calmest | Keith asked for it. Pace carries severity, which makes it encoding rather than decoration, which is why it sits in 4.2 and not 4.6. **Offline and underivable statuses do not pulse at all**, because a pulse asserts liveness an underivable status cannot support (DL-31) |
| 3 | **Representation:** one, at every zoom | Past `DETAIL_ZOOM` the disc cross-fades to the plant's own image and the ring takes over the status colour | Keith asked for it: zoomed out a pin answers "where", zoomed in it answers "which", and status stays present at both zooms on a different part of the pin. Falls back to a letter avatar because `plant_photo` is **null for every plant in the fixture** |
| 4 | **Legend:** bottom-left, display-only status counts | Same position and order, but **clicking a status filters the map**. Multi-select, empty means all, three states (hover / pressed / dimmed) | Keith asked for it, matching the plants table's own filter. Three states rather than two because two cannot distinguish "nothing filtered" from "something else is" |
| 5 | **Capacity sizing:** `clamp(26, 46, 24 + √c × 1.1)`, an absolute curve | 26–36px, interpolated by √ **relative to the plants currently in scope** | The template's curve was calibrated on its own 90–410 kW samples. On this fleet's 12–24 kW it returns 28, 29, 29, 29 against a pin already 28 — a 1px spread, invisible. Absolute would need re-tuning against a capacity profile that is **disputed** (the fleet DC sum is wrong by ~373x), which would bake a live defect into a design constant. Cost accepted: sizes cannot be compared across two filters |
| 6 | **Search this area:** a control the user presses | Gone. The map refetches as it moves, debounced 400ms, through its own endpoint | Keith asked why he should have to press a button. The capability stays in the `FleetMap` wrapper, so 4.1's component API is unchanged and any other consumer can still be asked |
| 7 | **Basemap:** keyless CARTO (positron / voyager / dark-matter) | MapTiler, keyed | DL-5 approved MapTiler. Dev runs on Keith's personal key; an org-owned account is a prod-time item. **The template's own note flags this as "the repo map decision"** |
| 8 | **Zoom rescaling:** `rescaleMarkers()` on the `zoom` event, `clamp(0.55, 1.3, 1.6 − z × 0.13)`, larger when zoomed out | Not implemented | **Unowned rather than rejected.** 4.2 never scoped it and 4.6's original AC2 forbade behaviour change, so it belonged to nobody. If adopted the composition is `size(capacity) × zoomScale(z)`, capacity setting the base and zoom a global multiplier |
| 9 | **Pin entrance:** none | New pins arrive staggered across a **fixed window** | Keith asked for it. Only new pins animate: markers are keyed by plant id, so a plant surviving a refetch keeps its element and does not move, which is what reads as continuity rather than a redraw. A per-pin step would make five plants look instant and a hundred take three seconds on a map that refetches after every pan |

**Convergent, so not divergences:** the loading pill (both have one); the popover card itself, which is 4.5's DS port of the template; and **world wrapping plus the zoom floor, added here 2026-08-24.** `PlantMap.dc.html:217-218` already carries `renderWorldCopies: false` and `minZoom: 2`, and 6.1 / AB#742's build gave the repo the same thing, so the change moved the repo TOWARD the template and a re-export preserves it rather than undoing it. ⚠️ **This was first written as divergence 10 with its template column marked NOT ESTABLISHED, on the false claim that `PlantMap.dc.html` sat on `chore/ds-templates-reference` and could not be read. The whole `design/templates/` tree is on the working tree and always was.** Corrected the same day by reading it. Two lessons: a template column marked unknown is a prompt to go and look rather than a finding, and a convergence recorded as a divergence would have sent `/design-sync` at 7.1 hunting for a conflict that does not exist.

**Two open items the template raises and nobody owns:** its popover enters over 800ms and exits instantly, which is asymmetric and out of budget, and capacity resizing snaps rather than transitioning (doing it properly means moving size from `width`/`height` to `transform`, since transitioning layout across ~106 elements would be the wrong fix). Both were surfaced during the 4.2 build and deliberately not taken.

## PlantCard: the interaction contract the template does not carry (4.3, recorded 2026-08-24)

**Read from `design/templates/` on the working tree, both copies, 2026-08-24.** Recorded because the template is presentational and the build needs a contract it cannot supply.

**What the template actually contains.** Slots, in order: `plantName`, five status booleans, `statusLabel`, `socPct`, `socText`, `today`, `selfSuff`, `power`, `saved`. **No `<a>`, no `<button>`, no `role`, no `tabindex`, anywhere in either copy.** The card root carries `cursor: pointer` and a card-wide `style-hover` (border to `#8AD9FD` plus a lifted shadow). And `fleet-plant-card/PlantCard.dc.html` carries a design-intent comment the other copy does not: *"End-user portfolio framing (Area 1): one card per plant replacing list density. Header = plant name + status badge; SOC gauge; 2×2 metric grid (SOC / Today / Self-sufficiency / Saved). **Tap to open Area 2.**"*

**So the template answers one question and cannot answer the other.** Whole card taps through to Area 2. It draws no second affordance and no hover behaviour beyond the border-and-shadow lift, so **the mini viewport's pan has nothing in the template to hang on.**

**The divergence, from Keith's ruling on 2026-08-24 (see DL-56).** The repo keeps whole-card-navigates and **adds an ambient pan the template has no concept of**: the mini viewport follows hover on pointer devices and follows the current card during the list's autoscroll. ~~**The PlantPopover is removed from the card entirely.**~~ So the divergence is additive rather than contradictory, which is why it reconciles toward the repo per DL-13 without the template being wrong about anything it does say.

⚠️ **AMENDED later the same day, 2026-08-24, and the removed-entirely clause is negated above rather than deleted. One template, THREE click models, and the template's own stated intent is right for only two of them.**

| Placement | Card body click | Navigation | Hover | Popover |
|---|---|---|---|---|
| **4.3** aggregator dashboard list | ⛔ **focuses the plant, does NOT navigate** (reversed 8/24 at the visual pass) | **a dedicated arrow** | pans the mini viewport | none |
| **5.3** end-user portfolio row | navigates | the whole card | pans the MAIN map | none |
| **6.2** full-map floating list | **opens the popover** | **a dedicated smaller arrow** | highlights the pin, reveals a minimal inline readout | **yes, click-triggered** |

**What this does to the template comparison.** `fleet-plant-card/`'s design-intent comment says *"Tap to open Area 2."* That is correct for 4.3 and 5.3 and **wrong for 6.2**, where tapping the body opens a popover and only the arrow reaches Area 2. **The template is not wrong, it is under-specified**: it was authored for the end-user portfolio framing, which is 5.3, and it never contemplated a third placement. Do not "fix" the comment; treat it as scoped to its own framing.

**Two additive things the template has no concept of, both 6.2-only.** A **dedicated arrow control** inside the card, which the slot list has no place for, so 6.2 needs a new slot rather than a repurposed one. And a **hover-revealed inline readout** (an icon and a value), which is a fourth interaction state on a card whose only authored state is `style-hover`. Since `style-hover` is pointer-only as drawn, and 5.3 also needs that treatment reachable programmatically, **the hover treatment has to become a class or data attribute regardless** — 6.2 makes that two consumers rather than one.

**The popover's call sites, corrected.** DL-56 as first written said the pin becomes the popover's only call site. It is not: the popover retires from the aggregator card (4.3) and the end-user card (5.3) and **gains a new one in the full-map card (6.2)**. The rule underneath is what survived: **the popover is never triggered by hover or by automatic motion, and an explicit click may trigger it.** 4.3 and 5.3 lose it because their single click is spent on navigation; 6.2 keeps it because its click is not.

**New on the popover itself, and it is not a card concern.** It becomes **edge aware**: on opening it computes where its pin sits in the frame and flips down, left, right or up to stay in view, and **the map never pans to make room**. ⚠️ **Measure before building** — MapLibre's `Popup` auto-selects its anchor from the space available in the map container when `anchor` is unset, so this may cost a prop rather than a placement engine. Whether the ported popover is a MapLibre `Popup` is Code's to read out of the code.

**Two things for whoever ports it, both of which bit on the way here.**

⚠️ **The intent comment is on the NON-canonical copy.** `AREA-BUILD-GUIDE.md:81` names `area1-fleet-overview/` as the copy that wins, and that is the copy missing the sentence that states what a tap does. The two files are otherwise byte-identical except for width: `area1-fleet-overview/` is fluid (`width:100%; max-width:360px`) and `fleet-plant-card/` is fixed at `250px`. **Read both before porting**; the canonical copy is right about layout and silent about behaviour.

⚠️ **The guide contradicts itself on this component.** Its dedupe table at `:81` sends you to `area1-fleet-overview/`, while its inventory table at `:164` lists "Per-plant card (end-user portfolio)" as `fleet-plant-card/PlantCard.dc.html`. Both rows are in the same file. Noted on the guide itself as well.

**The contract that fell out of it, 2026-08-24, and it serves all three placements without per-placement branching.** `href` required everywhere. `onFocusPlant?` fired on hover in every placement, plus by the autoscroll's current card in 4.3 only. **`focused?` driven from outside the card**, which is 5.3's pin-to-card highlight and 6.2's *"pin select and card select synced both ways"* — **the same prop, which is the strongest evidence the split is right.** No popover prop anywhere.

⚠️ **The template's hover treatment is not reachable programmatically as drawn.** It is expressed as `style-hover` (border to `#8AD9FD` plus a lifted shadow), so only a real pointer triggers it. **A `focused` state driven from pin selection needs that same treatment available as a class or data attribute**, or 5.3's pin-to-card highlight cannot render what the template draws. Catch this at the port rather than at the visual pass.

**A whole-card anchor cannot be built literally.** A button nested inside a link is invalid markup, so the card cannot be one anchor plus a pin control if a second control is ever added. PreviewCard already solved this shape on 2026-07-28: the title text is the anchor, card-wide hover runs off a `group/card` scope, and dead space is deliberately inert. Follow that here even though 4.3 currently needs only one hit target, so a later control does not force a rewrite.

## AB#940's design pass, 2026-08-25 — two DS defects, an icon-set census, and the repo taking the lead on the tab treatment

- **The DS Button template's solid primary FAILS AA contrast as specified.** White label on `hue-sky-500` `#009DE4` measures about **3.0:1** against the 4.5:1 requirement for 14px text (Code's derivation, re-derived independently by Cowork from relative luminance; both agree). The repo does not use the solid primary anywhere as of `!1026`; Edit Plant ships the OUTLINE hierarchy instead. Boundary sync must correct the template, not import it.
- **The `hue-sky` ramp has no hover-viable dark step between 800 and 900.** `#03587F` (800) is a teal-blue and `#1F4173` (900) changes hue family to indigo-navy, so hover-to-900 reads as a colour change rather than a darkening. This is the ramp saying a solid sky-800 button has no good hover state. Worth a ramp addition at the boundary sync; until then, outline + `hue-sky-50` tint is the pattern that works (shipped on `!1026`).
- **Icon-set census (measured during AB#940):** the existing set is nearly barren of currentColor-clean glyphs — StatisticIcon/EditPen/PowerFlow hardcode `#03587F` fills, HomeLine/Signal hardcode `#616161` strokes, PowerGeneration/SystemWork use gradients, and **`Equipment.tsx` is an embedded PNG bitmap that can never recolor**. Three new stroke icons joined the set to the SVGProps/24-viewBox/currentColor contract, named from the DS gallery vocabulary: `LineChart`, `Sliders`, `Wrench`. (`Edit2` was created and deleted within the same item when its only consumer went — the orphan rule applied to its own work.)
- **The tabs-frame half of the PlantShell template is CONSUMED as of `!1026`; 2.2's design pass is the header identity half.** The repo now leads the DS on this component in three ways the boundary sync publishes back: the sliding measured underline (the template specifies static 150ms colour transitions only), active-tab-only icons (the template's tabs are text-only), and the corrected button hierarchy above.

## The equipment status strip: six stat cells at 38px, the StatTile size (AB#950, 2026-08-27)

AB#950 rebuilds `PlantInverterStatuses.tsx` as **six cells in the existing `GraphWrapper` strip** (All plus
the five keystone statuses), each a stat pair in the 948 idiom: value on the display face, muted label below.

- **Figure size is 38px, declared and shipped**, matching `StatTile` rather than the Area 1 preview tile's
  30px. Verified in the emitted stylesheet (`font-size:38px`) rather than in source. The frame's plan had
  called it "the 40px-family scaled down", which was a third size by implication; the audit made it pick one
  of the two recorded sizes and it picked the larger.
- **Colors come from `statusToHex` only.** The hardcoded `#32F8B0` "All" fill is deleted, so this screen
  stops being a tokens-only exception.
- **`statusToHex` was never the anomaly gap.** It resolves all five statuses through
  `statusColors['status-<s>']` with `theme/status.ts` carrying the hexes; the missing anomaly lived in this
  tile component's own four-status list. Corrected against the 8/18 census.
- **Anomaly renders present-and-disabled at zero per DL-34**, with DL-34's caveat carried in visible text
  under the strip: a zero means the feed never said anomaly, not that detection ran and found none.

## The equipment strip and table after Keith's visual pass (rulings 2026-08-27)

- **Hovering a status cell tints that cell with a light step of its own status colour**: light blue Normal,
  light grey Offline, light yellow Warning, light red Fault, light purple Anomaly. **Token steps from the
  status ramps, never new hexes.**
- ⚠️ **Tile hover is a READOUT affordance, not a filter.** DL-53 removed the fleet donut's click-to-filter
  and made it hover-to-inspect, so a tint on these tiles must not acquire a click handler. Stated because a
  hover state is exactly what invites someone to wire one.
- **The anomaly qualifier under the strip is DELETED** at Keith's instruction. See the DL-34 amendment: the
  caveat now travels only on the `anomaly_count` DD row, so that row is load-bearing rather than tidy.
- **`Settings` becomes a square icon-only button; `Metrics` keeps its label.** Both move onto the DS buttons
  with DS interaction states. ⚠️ Two recorded traps apply: the DS Button template's solid primary **fails AA**
  (white on `hue-sky-500` measures about 3.0:1) and the `hue-sky` ramp has **no hover-viable dark step**
  between 800 and 900. `!1026` already resolved this once by reseating Edit Plant as a rest-grey outline
  button; reuse that rather than re-deriving it.
- **The count moves to the right of the title row**, on the same line as `Devices`.
- **The table takes the events table `!1027` shipped as its reference**, port rather than reinvent.
- ⛔ **Two defects from the pass.** The table overflows horizontally at a narrower viewport and clips the
  Actions column with `Settings` entirely off screen, which makes a carried affordance unreachable. And
  **none of this item's new interactives show a focus ring**: `!1026`'s keyboard-only ring exists and the new
  clickable rows and row buttons simply do not participate in it. Port it, ring on Tab and none on click.

## Measured contrast ratios on the ink ramp against white (2026-08-27)

Computed from the token hexes in `theme/ink.ts` with the WCAG relative-luminance formula, during AB#950's
outline-button work. **Recorded because the AA trap on this project's record exists precisely because a
design-system default failed once, so these should not be re-derived by inference.**

| Token | Hex | Against white | Verdict at 4.5:1 |
|---|---|---|---|
| `hue-ink-500` | | 3.19:1 | ⛔ FAILS small text |
| `hue-ink-600` | `#6B7177` | **4.94:1** | ✅ passes |
| `hue-ink-700` | | 8.22:1 | ✅ passes |
| `hue-sky-800` | | 7.76:1 | ✅ passes (the outline button's hover text) |

**So `ink-600` is the floor for small body text on white and `ink-500` is not usable for it.** AB#950's
compact row buttons ship at `text-[13px]` in `ink-600`, which is why the number was needed.

## Two more entries for the icon census (2026-08-27)

- **`HelpIcon`'s hardcoded fill sits BEFORE the props spread**, so it cannot be overridden by a prop and needs
  a call-site recolor to take `currentColor`. Fourth member of this family alongside StatisticIcon, EditPen
  and PowerFlow.
- **`Setting` is currentColor-clean** and was used as-is for AB#950's square icon button.

## The device table's keyboard and assistive-tech treatment (AB#950, 2026-08-27)

The table takes `role="grid"` with an aria-label; selectable rows expose `aria-selected` true or false and
non-selectable rows expose nothing, because `aria-selected` is not valid on rows of a plain table. **The
limitation is named rather than hidden: APG grids expect arrow-key navigation and this one is Tab-navigated.**
That simplification is deliberate. If a later item adds arrow-key movement, the pattern completes rather than
changes.

## The DS capacity-card template differentiates by ICON, not by colour (measured 2026-08-28 during 2.2)

Code read `capacity-facts/CapacityFacts.dc.html` rather than assuming, because Keith asked directly whether
the card should reflect per-tile colour semantics for DC, AC and BESS. **It has none.** The template
differentiates the tiles by **icon** (SolarPanel / Inverter / Battery on the nameplate row, Sun /
CalendarDays / LineChart on the generation row) and carries exactly **two value colours**: nameplate
`#20262B` and generation `#1F4173`. Both are **exact token matches**, `hue-ink-900` and `hue-sky-900`, so
the port needed no new tokens for the values.

⚠️ **One template divergence with no token behind it:** the generation eyebrow labels are `#5A7A93`, which is
not in the ramp. `!1030` used `hue-ink-400` on both rows rather than introducing a hex. If that grey is
deliberate rather than incidental it needs a token; if not, the repo is now the better reference.

## ⛔ A FOURTH class of icon defect: `EmptyImage.tsx` has no viewBox and cannot scale (found 2026-08-28)

`icons/EmptyImage.tsx` declares `width` 64 and `height` 56 and **no `viewBox`**, so any scaled render clips
the drawing. `!1030` fixed it **at the call site** by passing `viewBox="0 0 64 56"` through the props spread
and left the shared icon file untouched, which is correct restraint for a branch that does not own it, and
also means **the next caller hits the same clip.**

This joins the icon census as its own category alongside the hardcoded-fill entries and the gradient
illustrations. The practical rule: an icon in this set cannot be assumed to scale, and a caller that renders
one at a non-native size checks for a `viewBox` first.

**Also recorded from the same pass:** the repo's existing `Battery` and `Panels` icons are gradient
illustrations and are **unusable at 15px mono**, which is why `!1030` added seven line icons (Clock, Refresh,
SolarPanel, InverterUnit, BatteryLine, Sun, CalendarDays) in the LineChart idiom, the same class of addition
`!1026` made for the tab icons. All seven import by direct path, so `icons/index.ts` was not touched.

## ⭐ DS QUEUE, Keith's ruling 2026-08-31: icons come from the declared DS icon library, and a missing glyph gets ADDED to the DS

Keith, verbatim in substance: *all I want is that we are using the icons we have on our declared icon library
from the DS. If the icon library from the DS does not have expand, then add it in.*

**This is a standing rule, not a one-off.** A repo icon with no declared DS source is design debt, and the
fix is to add the glyph to the library rather than to leave the repo as the only place it exists.

**Live instance, 4.1 / AB#945.** `icons/Expand.tsx` was built in the mono LineChart idiom, with a `viewBox`,
because Code measured that the repo's icon set has no expand glyph. ⚠️ **What was NOT measured is whether the
DS icon library has one**, which is a different question from the repo folder and has been asked of Code.

Two outcomes and both are cheap. If the DS library carries an expand glyph, the repo icon is replaced by a
port of it. If it does not, the repo icon stands and **the DS gains an expand glyph as a queue item**, so the
two converge instead of drifting.

⛔ **THE QUEUE GREW TO FOUR ON 2026-09-07, and it grew because this rule was NOT in the repo's `CLAUDE.md` until then.**
Code never saw it. `AB#953` / `!1037` shipped **two mode glyphs local to `Control/`**, because `Shield` in the
shared set has a hardcoded fill and a 43 by 49 viewBox and no plug glyph exists at all. Code recorded the fact
in its PR decisions, correctly, but had no rule telling it to name a DS queue item. **The four it held then: expand, the
Grid Guardian glyph, the Pre-PTO glyph, and a `Shield` that cannot recolour.** ✅ **The rule is mirrored
into the repo file now**, with those four named, so the next build adds nothing silently. Only Keith can add to
the DS. ⚠️ **The live count is SIX, below.**

⛔⛔ **THE QUEUE IS SIX AS OF 2026-09-23, and Code's own count of five is one short.** The `AB#1028` weather
template port built **`Humidity` and `WindSpeed`** as new repo icons, because **neither exists in the shared set
and the DS weather template carries no SVG at all.** Both were built in the set's own idiom, a 24 unit viewBox
stroked in `currentColor` with the props spread last so they recolour and scale, which is the right way to add
one and does not make it any less a queue item.

⚠️ **The discrepancy is worth naming rather than quietly reconciling.** Code listed the standing queue as
*"Expand, the two Control mode glyphs and the Shield"* and called the new total five. **The two Control mode
glyphs ARE the Grid Guardian and Pre-PTO glyphs this page already names separately**, so the two lists describe
the same four items and Code collapsed two of them into one entry. **Four plus two is six.**

⛔ **SEVEN AS OF 2026-09-24.** `AB#944`'s device list rows use **Heroicons' outline chevron right**, the same glyph
the shipped Events rows use, and the DS library declares no chevron right, so it is a queue item (catch-up entry 19
in `from-code/944.md`). The repo `CLAUDE.md`'s live instances list was four and stale, and now names all seven.

```
expand                              Grid Guardian glyph          Humidity        (new 2026-09-23)
Shield, cannot recolour             Pre-PTO glyph                WindSpeed       (new 2026-09-23)
```

⛔ **ELEVEN AS OF 2026-09-25, recorded 2026-09-28.** `AB#1028`'s Plant Information card draws its section headings with **four Heroicons outline glyphs**, document text (permission to operate), cog (system), map pin (site) and users (contacts), at stroke 2 to match the repo `Clock`. The repo set has no document or map pin, and its `Users` icon **has no viewBox and a hardcoded stroke of `#616161`**, so it can neither scale nor recolour, the same class of defect as `EmptyImage` and a candidate fix. Code's catch-up entry 65 in `from-code/1028.md` 10:35, found unemitted three days after the build.

```
document text (Heroicons)    cog (Heroicons)    map pin (Heroicons)    users (Heroicons)    (new 2026-09-25)
```

⚠️ **And a seventh candidate, same family as `Shield`.** `HorizonSun` **bakes `#03587F` before the props
spread, so it cannot recolour.** Code considered it for the weather card's sunrise row and backed out for
exactly that reason, which was the right call, and it left the icon imported nowhere in `app/`. **Not counted
above until Keith rules whether it joins the queue or the icon is simply retired.**

⛔ **Cowork does not edit the DS bundle and Code does not hand-edit it either** (repo convention). Adding the
glyph is Keith's action through Claude Design, which is why it lands here as a queue item rather than as a
build instruction.

⛔ ⭐ ELEVATION AND SHADOW, declared 2026-09-01 (day 77). RECORDED, NOT APPLIED

⛔# ⭐⭐ TWO CHANNELS AS OF 2026-09-07 (DL-68). The scale now carries a SURFACE FILL beside each shadow

**The problem, in Keith's words.** *"my main issue with the interface is everything looks flat."* ⭐ **That
sentence is the specification, not a preface to it.** A level that does not read as further forward than the
one behind it is wrong however correct its numbers are, and that is the test the browser pass applies.

**Where it came from.** A dark-mode reference deck Keith brought on 09-07, where the page is near-black and
every surface in front of it steps lighter. The idea ports, the direction inverts, the values do not carry over
at all.

**Ruled, one system rather than two.** The seven levels and their names are unchanged. **Each level gains a
surface fill alongside its shadow**, so a component names what it IS and receives both. ⛔ **A component never
picks a grey.** Two independent systems were rejected on purpose rather than cost, the scale exists so depth
stops being a per-component judgement and two dials hand that judgement back. Tone-only was rejected on
headroom, the platform is light-mode first and the room between white and a clean grey is small.

⛔ **NO TONE VALUE IS DECLARED AND NONE MAY BE INVENTED.** The shipped surface palette is measured first.
Declaring a palette without reading the one in the tree is how both token files became junk drawers, which is
recorded further down this page. Brief is with Code as of 09-07.

⚠️ **Expect about three usable tone steps against the shadow channel's seven.** White is the ceiling, so the
base has to move down for any step to exist, and tone is the coarser channel. It supplements the shadow scale
rather than mirroring it, and levels may share a tone.

⚠️ **The contrast floor is re-checked per tone, not once.** `ink-500` already fails small text on white and
`ink-600` is the floor there, so a darker surface moves that line. Any tone whose floor is worse than white's
gets stated with its floor rather than quietly adopted.

✅ **Shadows ship at their DECLARED values below and are tuned in the browser afterwards.** A value change is
one edit in `theme/elevation.ts` because call sites name the level, so the numbers stay cheap forever. ⛔ **The
structure is the expensive part and it is now fixed**, seven levels, two channels, names that carry purpose.
⭐ **Cowork told Keith the opposite an hour before the ruling**, that re-tuning after shipping would touch
every call site. That was wrong and it pointed at a false urgency.

**Names carry purpose, never colour.** One system means the tone belongs to the level, so the levels name it
already. ⛔ **No token name mentions a grey.** A colour name is a lie the day anything tints, and it turns a
dark-mode swap into a rewrite. Nothing on record says Peter has asked for dark mode.

**Ownership.** The tokens ride 7.1's elevation commit `038ff64` on `feature/745-elevation-scale`, the file the
shadow tokens already live in. Code builds. **The app-wide retrofit is a NEW A1 7.x item**, the same shape as
7.4 applying typography roles and 7.5 applying the interaction contract. Keith files it.


⛔ **This is a DECISION, not a shipped state.** Owner is task **899** under 7.1 / AB#745, which already owns
the porting-debt resolution per DL-29, and which is where a PR for this work links rather than going up
untraceable.

⭐ **THE GATE IS MUCH NARROWER THAN "WAIT FOR THE QUEUE", MEASURED 2026-09-01.** This section first said the
change applies when the queue flushes. **That was assumed rather than measured and it is too strong.** Code
ran `git diff --name-only origin/dev...BRANCH -- tailwind.config.ts theme/` across all twelve open branches:

```
--  theme/                      >> ZERO of twelve touch it, across all eleven files in the directory
--  tailwind.config.ts          >> ONE branch, feature/736-plant-card-list
--  positive control            >> 736 returns nonzero, so the eleven zeros are measurements not a broken
                                   pathspec. theme/ separately confirmed to exist and be populated, since a
                                   pathspec against a missing directory also returns zero for everything
```

**And 736's hit is a false positive for this purpose.** Its whole `tailwind.config.ts` diff is three lines,
`future: { hoverOnlyWhenSupported: true }`, sitting ABOVE `theme.extend` and touching no token, no colour and
no scale. A `boxShadow` key goes INSIDE `theme.extend`. **So the queue contains zero token edits.**

⚠️ **Expect clean, do not assert clean, and settle it by simulation.** The 8/27 reading that `vite.config.ts`
was a superset and would merge clean either order was REFUTED by the 8/28 merge, because git conflicts on
same-spot additions inside one object literal regardless of content. The recorded lesson is that a merge
question cannot be answered by reading two files. This case has the distant-block shape that DID auto-merge
(`types/index.d.ts`) rather than the same-literal shape that did not, which is a reason to expect clean and
not a proof. **Throwaway clone, apply the tokens, merge 736, look.**

⚠️ **One filter edge, flagged by Code rather than assumed.** The measurement did not cover `app/tailwind.css`,
and `feature/742-full-map-shell` and `feature/736-plant-card-list` both touch it. **That file matters here**,
because `animate-status-pulse`'s reduced-motion guard was deliberately placed at the token in
`app/tailwind.css` rather than at its call site. So **scope the change before trusting the gate**: purely
`theme/` plus a `tailwind.config.ts` key means one branch is in play, and touching `app/tailwind.css` means
742 and 736 both are.

### The principle, Keith 2026-09-01

**Shadow expresses ELEVATION and nothing else. The higher a surface sits, the wider the shadow it casts.**
Shadow is never decorative, never a way to separate two things at the same height, and never a substitute for
a border. Two surfaces at the same elevation get the same shadow even when they are different components.

### The scale, six steps

⭐ **The reference Keith supplied is Tailwind's own default scale, resoftened.** Geometry matches almost
one-to-one and only the alphas differ, which makes this a **re-tuning of a system the repo already has**
rather than a new one. Values below are the reference's, read off the source images.

✅ **DECLARED 2026-09-01. Names and colour are Keith's rulings, values below are canonical and paste-ready.**

**Naming ruled ADDITIVE, `elev-0` to `elev-6`.** ⛔ **Do NOT override Tailwind's `shadow-*` scale.** Overriding
would silently restyle every existing `shadow-*` call site across twelve unmerged branches at once, and
**nothing in the suite can catch a shadow change** (vitest runs node with no jsdom, every component test is
`renderToStaticMarkup` plus string assertions). Additive means existing classes keep working and migration is
per call site whenever someone gets to it. The name also states the meaning, which `shadow-md` does not.

**Colour ruled NEAR-NEUTRAL with the top step tinted**, mirroring the reference exactly. `#0F0F10` =
`rgb(15 15 16)` for `elev-1` through `elev-5`. `#101828` = `rgb(16 24 40)` for `elev-6` only, including its
hairline.

**Home: a new `theme/elevation.ts`**, following the `theme/status.ts` and `theme/colors.ts` pattern, spread
into `tailwind.config.ts` under `theme.extend.boxShadow`. Not inline in the config, so it matches how every
other token family in this repo is sourced.

✅ **THE QUEUE GATE IS GONE, measured 2026-09-01. `dev` = `ee76dc3`, all nine merged, and the only five
branches left on the remote are legacy and return zero on `theme/` and `tailwind.config.ts`.** So this is
buildable now under task 899 / 7.1 / AB#745. ⚠️ **The SCOPE rule survives the gate**, token work still lands in
its own change and never inside an unrelated PBI. Only the "wait for the queue" clause lifted.

**The contact hairline is `0 0 0 1px` at 5%, on `elev-2` and above, and NOT on `elev-1`.** A hairline on a
button is a border by another name and buttons carry their own.

| Token | Surface it belongs to | Value |
|---|---|---|
| `elev-0` | flush with the page. Table rows, chips, badges, anything inside a card | `none` |
| `elev-1` | resting **FILLED** controls only. A solid primary, a filled input. ⛔ An outline, ghost or tertiary control is `elev-0`, see BUTTON ELEVATION BY HIERARCHY | `0 1px 2px 0 rgb(15 15 16 / 0.05)` |
| `elev-2` | resting cards. The capacity band, stat tiles, the alerts widget, `PlantCard` at rest | `0 0 0 1px rgb(15 15 16 / 0.05), 0 1px 3px 0 rgb(15 15 16 / 0.10), 0 1px 2px 0 rgb(15 15 16 / 0.06)` |
| `elev-3` | raised. A card focused or selected from outside | `0 0 0 1px rgb(15 15 16 / 0.05), 0 4px 6px -1px rgb(15 15 16 / 0.08), 0 2px 4px -1px rgb(15 15 16 / 0.06)` |
| `elev-4` | hover lift on a navigational card, dropdowns, the map's floating list | `0 0 0 1px rgb(15 15 16 / 0.05), 0 10px 15px -3px rgb(15 15 16 / 0.10), 0 4px 6px -2px rgb(15 15 16 / 0.05)` |
| `elev-5` | popovers and content-bearing tooltips, including `PlantPopover` | `0 0 0 1px rgb(15 15 16 / 0.05), 0 20px 25px -5px rgb(15 15 16 / 0.10), 0 10px 10px -5px rgb(15 15 16 / 0.04)` |
| `elev-6` | modals and dialogs ONLY, including 4.1's enlarge modal | six layers, below |

✅ **`elev-6` TAKES THE FULL SIX-LAYER TREATMENT, Keith 2026-09-01.** One modal is on screen at a time, so the
paint cost that rules the stack out everywhere else does not apply, and this is the one surface where the
quality is visible. It is the reference's **tighter** stack (uniform 6%, minus-half-blur spreads), tinted to
`#101828` = `rgb(16 24 40)` like the rest of step 6.

```
0 0 0 1px      rgb(16 24 40 / 0.06),
0 1px 1px -0.5px  rgb(16 24 40 / 0.06),
0 3px 3px -1.5px  rgb(16 24 40 / 0.06),
0 6px 6px -3px    rgb(16 24 40 / 0.06),
0 12px 12px -6px  rgb(16 24 40 / 0.06),
0 24px 24px -12px rgb(16 24 40 / 0.06)
```

**Note it is the ONLY step that holds Y equals blur at 1:1** and the only one with uniform alpha. Steps 1 to 5
inherit Tailwind's wandering ratios and hand-set alphas. That inconsistency is deliberate, not an oversight,
and nobody should "fix" one to match the other.

**Hover is a two-step lift, 2 to 4.** One step is not perceptible at these alphas and three reads as a jump.
This is the numeric definition of the "lift" hover treatment, which until now existed only as the DS
template's `style-hover` (border plus an undefined "lifted shadow").

### Three rules taken from the six-layer reference, without taking the six layers

The last reference image is a different philosophy, six layers at one uniform alpha. **It is not adopted as
the general scale**, because six `box-shadow` layers per element is a real paint cost on a screen carrying
100-plus map pins and a long table, and it forfeits Tailwind's built-ins at every call site. Three of its
ideas are adopted anyway.

1. ⭐ **The contact hairline.** Its first layer is `Y 0, blur 0, spread 1`, a ring rather than a shadow, and
   it is what makes an object read as SITTING ON the page instead of floating over it. **Add it as the first
   layer of every step from 2 upward.** Highest-value idea in the reference.
2. **Y equals blur, 1:1, whenever anyone invents a new shadow.** The reference holds this exactly in all
   twelve of its layers. It reads as one light source overhead. ⚠️ The six-step scale above does NOT hold it
   (ratios wander 1:2 to 1:3), which is a deliberate inconsistency inherited from Tailwind and worth knowing
   before someone "fixes" one step to match.
3. **Negative spread at minus half the blur** when a shadow is wide enough to halo. The reference's tighter
   stack does this exactly (`3/-1.5`, `6/-3`, `12/-6`, `24/-12`), keeping wide layers under the object.

**Why uniform alpha works there and is not needed here.** The reference never hand-tunes opacity. Six layers
at 5% compound to about **26.5%** where they all overlap near the object and thin out where only the widest
reach, so the falloff is produced by geometry rather than by choosing numbers. The six-step scale achieves a
similar curve with two layers and hand-set alphas, which is the trade being made.

**Reserve the full six-layer stack for the modal**, step 6, where one element is on screen and the quality is
most visible.

### ✅ The shadow colour, RULED 2026-09-01 (Keith). NEAR-NEUTRAL, and it is ruled twice over.

**`#0F0F10` = `rgb(15 15 16)` for `elev-1` through `elev-5`, `#101828` = `rgb(16 24 40)` for `elev-6` only.**

**Keith's reason, and it is the reason to keep rather than the value.** A shadow should look like a shadow.
Tinting the whole scale makes the shadow read as a coloured edge rather than as absence of light, which is the
one thing shadow is for in this system.

⛔ **This ruling was re-put and re-confirmed the same day, so do not reopen it on the argument below.** The
measurement found that `shadow-card`, the repo's existing card shadow, is **already tinted navy** at
`rgb(16 42 79)`, and Cowork recommended matching it so the migration would be invisible. **Keith ruled
near-neutral anyway.** Cowork's earlier lean toward tinting to `hue-ink-900` `#20262B` is also rejected.

⚠️ **The consequence, which is now INTENDED rather than accidental.** When a card moves from `shadow-card` to
`elev-2`, its shadow hue shifts from navy to neutral. **That is a visible design change across every DS card
at once**, and task 899 should ship it as such, named in the PR description, rather than as an invisible token
swap. It is the point of the change, not a side effect of it.

### ⭐ What this unlocks on the two-card-languages contradiction

The 2026-07-31 record says the product has two card languages and eventually one has to win, house card
(`rounded-xl` 12px, `px-[18px] py-4`, `shadow-xs`) against DS card (14px radius, no padding, the `card`
shadow token). **Declaring elevation resolves the SHADOW half without touching radius or padding**, because
both languages are resting cards, both are elevation 2, and therefore both get the same shadow by rule.

✅ **CLOSED IN FULL later the same day.** The remaining radius-and-padding half is settled by THE CARD SYSTEM
below, which makes both of them **densities of one card rather than two card languages**. House card at
`rounded-xl` 12px with `px-[18px] py-4` IS `standard`; the DS card at 14px IS `feature`. **So the month-old
contradiction was never two languages, it was one language with two unlabelled densities.** Do not re-open it
as a disagreement.

### ✅ MEASURED 2026-09-01, and one result changes the colour question

**The repo's only shadow source is `theme/boxShadow.ts`. There is no `theme/elevation.ts`.** Four keys, all
custom, so `shadow-xs` here is a project key and not Tailwind v4 naming. Values in [codebase](codebase.md).

✅ **`shadow-plugin` is ABSENT** — not in `package.json`, not installed, not registered, and all four
`smooth-shadow-ring` utilities emit **NO RULE** under an emit check whose positive controls passed. ⛔ **So
the repo's `smooth-shadow-ring` agent skill is INERT.** Its reasoning still holds as advice and is why the
scale bakes its hairline in by hand, but nothing enforces it and none of its utilities exist. ✅ **`elev-*` is
therefore fully additive and collides with nothing.** The additive ruling is confirmed rather than merely
chosen.

⛔ **The one result that changes a decision. `shadow-card` is ALREADY a two-layer shadow and it is TINTED
NAVY** at `rgb(16 42 79)`, `0 1px 2px rgba(16,42,79,.04), 0 8px 22px rgba(16,42,79,.05)`. That is the closest
existing thing to a layered elevation in this repo, and **it disagrees with the near-neutral `#0F0F10` ruled
for `elev-1` through `elev-5`.** A card migrating from `shadow-card` to `elev-2` would visibly shift its
shadow hue from navy to neutral, across every DS card at once. **That is a consequence, not a blocker, and it
put the colour question back to Keith**, who ruled near-neutral anyway with a reason. See the colour section
above. **The consequence is that the migration is a visible change rather than a silent one**, and that is now
intended.

⚠️ **Values were read off screenshots rather than from a token file**, so they are transcriptions. The colour
ruling keeps them as written, so nothing needs re-deriving.

## ⭐⭐ THE INTERACTION CONTRACT, declared 2026-09-01 (day 77). THE AUTHORITY FOR ALL COMPONENT WORK

⛔ **Code reads this before any component work.** The repo `CLAUDE.md` carries a pointer and the state list;
this section is canonical for the values. Written against the measured interaction inventory in
[codebase](codebase.md), not against our own notes, after that inventory showed only 39 of 98 interactive
files carry any hover treatment at all.

⭐ **This was EXTRACTED, not designed.** `PreviewCard/index.tsx` and `AlertsList.tsx` between them already
carry the whole contract, shipped and working. Everything below is transcription plus the gaps they do not
cover. Timing and easing come from the repo's own `.claude/skills/emil-design-eng` skill.

### The principle

**One treatment means one thing.** A control's appearance answers exactly one question at a time, and the
same question always gets the same answer. Where a state is absent it is absent by decision, not by omission.

## ⛔ ZERO IS NOT SUPPRESSED, THE INDICATOR CARRIES THE MEANING (Keith, 2026-09-11)

Ruled against Cowork's and Code's shared position that an all-zero telemetry series must be treated as absent
and not plotted. **Keith's ruling is the opposite and it generalises past this one readout.** His words,
*"absent data has no problems being shown, whats important is there are indicators that clearly carry that
message. if for example a battery shows 0% while an indicator says 'these are live updates', then theres no
other interpretation for that info other than the battery is clearly zero instead of no data."*

**The rule.** A zero renders. What makes it honest is the surrounding state, a liveness indicator, a last
updated stamp, an explicit no-data treatment where there is genuinely no data. ⛔ **Hiding a zero to avoid
being misread is the wrong fix, because it removes information to compensate for a missing label.** Add the
label.

⚠️ **This is NOT in tension with the Bug 26 family and the distinction is worth holding.** Bug 26 is about a
value the APP INVENTED being presented as one the user chose. A zero the device actually reported is a real
reading. **Substituted versus real is the line, not zero versus non-zero.**

⭐ **It also points forward at the customer-facing surface.** Keith's reference is the Sigenergy app's power
flow diagram, a house illustration with solar, home, grid, DC charger and battery each carrying a live figure
(`0 kW · 15%` on the battery, `9.7 kW` on the charger), where a zero sits beside a percentage and reads
correctly because the frame is obviously live. **Battery is expected to be one of the flows in our own
version.** ⚠️ Which devices get their own detail view is still Peter's to answer, so this is a direction
rather than a spec.

### The SIX states, for every `<button>` and `<Link>`

```
--  rest            >> the control doing nothing
--  hover           >> pointer over it. GUARDED, never fires on touch
--  focus-visible   >> keyboard reached it. Tab only, never on click
--  press           >> being pressed
--  pending         >> BUSY, not unavailable. Keeps the brand blue, because the action IS live
--  disabled        >> unavailable. Reads as ABSENT
```

⭐ **`pending` is new and it closes a real gap.** 28 files do form submit and none declares a busy state.
**It is the one place the brand blue belongs on a non-interactive-looking control**, since the action exists
and is in flight. ⛔ **Disabled must never take the brand blue.** Sky is this system's affordance colour (the
focus ring, the outline button, the hover tint), so a blue disabled control reads as available. Disabled
desaturates.

### The six cross-cutting rules, all proven in the shipped pair

1. **Pointer guard.** `[@media(hover:hover) and (pointer:fine)]`. Touch devices fire hover on tap, which
   leaves a stuck hover state. ⭐ **NOW AUTOMATIC FOR TAILWIND UTILITIES ONLY. Emit-verified 2026-09-01 with a
   control run.** `tailwind.config.ts` carries `future: { hoverOnlyWhenSupported: true }`, in `dev` since
   `!1024`, and a probe compiled with `hover:bg-white` emits **character-for-character**:

   ```
   @media (hover: hover) and (pointer: fine) { .hover\:bg-white:hover { … } }
   ```

   The control run without the flag emitted the same rule **unwrapped**, so the flag is what produces the query
   rather than it being a Tailwind default.

   ✅ **So DO NOT hand-write the guard around a Tailwind `hover:` utility. It is already there.**
   ⛔ **BUT the flag does not reach raw CSS `:hover` rules, and those still need it by hand.** Measured: 8
   hand-written guards exist in 5 places, and **only 4 are removable** — the four in `PreviewCard/index.tsx`
   (`:39`, `:53`, `:54`, `:55`) wrap Tailwind utilities and are now redundant, while the three in
   `app/tailwind.css` (`:196`, `:335`, `:485`) wrap raw `:hover` rules on `.fleet-map-entry`,
   `.plant-popover-close` and `.plant-card` and **must stay**. ⚠️ **The distinction is whether the guard wraps a
   utility or hand-written CSS, and that is the rule, not the count.**
2. **Keyboard parity.** Every hover declaration has a paired `group-focus-within`. Not optional. This is what
   stops a keyboard user losing an affordance a mouse user gets.
3. **Focus ring.** `focus-visible:outline outline-2 outline-offset-1 outline-hue-sky-500`. Note
   `focus-visible`, never `focus`.
4. **Press.** `active:scale-[0.97]` on controls. One step darker on rows and cells, where scale shifts layout.
   ⛔ **Corrected 2026-09-23. This line read `active:scale-97`, which emits NO RULE in this config.** The repo
   `CLAUDE.md` and `design-conventions/04-interaction.md` were corrected on 2026-09-17 and this page, the
   canonical one, was missed for six days.
5. **Motion guard.** Cancel a movement with the same variant that set it, so `active:scale-[0.97]` pairs with
   `motion-reduce:active:scale-100`. Reduced motion means fewer and gentler, NOT zero — keep colour and
   opacity, remove movement and position.
   ⛔ **Corrected 2026-09-23 (DL-107). This line read `motion-reduce:transform-none`, and that class can never
   cancel the press.** Measured by Code in a compile of `app/tailwind.css`. `.active\:scale-\[0\.97\]:active` is
   one class plus a state, specificity (0,2,0). `.motion-reduce\:transform-none` is one class inside its media
   query, (0,1,0), so it loses and the press still scales. `motion-reduce:active:scale-100` is also (0,2,0) and
   is emitted later, so it wins by order. The working form already sat at `EventsTable.tsx:248`. ⚠️ **The same
   arithmetic holds for any `hover:` or `focus:` transform**, reasoned from specificity rather than measured,
   so cancel each with its own variant. **Every file that followed the old line copied the defect**, seven
   sites at `eef84d6`, and the app-wide fix is `AB#997` criterion 6.
6. **Timing scoped to the properties that change**, never `transition-all`.

### Timing, from `emil-design-eng`

| | Duration |
|---|---|
| Press feedback | 100 to 160ms |
| Tooltips, small popovers | 125 to 200ms |
| Dropdowns, selects | 150 to 250ms |
| Modals, drawers | 200 to 500ms |

**Under 300ms for anything UI, and exit faster than enter.**

### Easing

```
--  entering or exiting        >> ease-out. cubic-bezier(0.23, 1, 0.32, 1)
--  moving on screen           >> ease-in-out. cubic-bezier(0.77, 0, 0.175, 1)
--  a hover or colour change   >> plain `ease`
--  constant motion            >> linear
--  ⛔ NEVER ease-in           >> it delays the initial movement at exactly the moment the user is watching
```

⭐ **`cubic-bezier(0.23, 1, 0.32, 1)` is already in `PreviewCard`**, so the house curve is confirmed rather
than invented.

### ⛔ Prohibitions. Three from the inventory's own defects, three from the skill

1. ⛔ **Never `focus:outline-none` without a replacement in the same rule.** You may remove the default
   outline only if you draw your own. ✅ **ONE EXPLICIT EXCEPTION, measured 2026-09-01: Headless UI panels.**
   `<MenuItems>`, `<ListboxOptions>`, `<ComboboxOptions>` and `<Dialog>` take programmatic focus on open and
   the library documents `focus:outline-none` there, so those **16 sites are correct and a sweep must not
   "fix" them.** ⚠️ The earlier framing here, that the app's commonest focus utility removes the indicator,
   **overstated it and should not be quoted**: 24 of the 47 are paired and the genuine defect is **7 focusable
   controls**. Figures and method in [codebase](codebase.md).
2. ⛔ **No layout-shifting hover.** No `font-bold`, no padding, size or border-width change. Two
   `hover:font-bold` sites exist and they reflow text under the cursor. ⚠️ **ONE RULED EXCEPTION, Keith
   2026-09-06, scoped to a single popover.** The Control tab's work-mode dropdown (`ModeOptionRow.tsx`,
   `AB#953`) grows the highlighted row to reveal its description and Watch link, `grid-template-rows` 0fr to
   1fr with an opacity fade, 150ms on the strong ease-out. Keith compared it against radio cards in the
   browser and chose the reveal. Mitigation he scoped, the panel is portalled to the foreground so the page
   beneath never reflows, keyboard-driven highlight moves swap with no animation, reduced motion is instant.
   It also overrides the one-shot-only height rule below and review-animations standard seven. **Not a
   precedent for a second site**, a second one is its own ruling.
3. ⛔ **No raw hex and no legacy gray in a NEW interaction state.** One `hover:bg-[#2a5596]` exists.
4. ⛔ **Never `transition: all`.** Name the properties.
5. ⛔ **Never enter from `scale(0)`.** Start at `scale(0.95)` with opacity. Nothing in the real world appears
   from nothing.
6. ⛔ **Never animate a keyboard-initiated action.** Those repeat hundreds of times a day and animation makes
   them feel slow.

**Popovers are origin-aware, modals are not.** A popover scales from its trigger; a modal stays centred
because it is anchored to nothing.

### The SIX hover semantics, for COMPOSITE SURFACES only

⚠️ **These do not apply to controls.** A control's hover is one state in the machine above. These are for
cards, cells, rows and pins. Keeping the two separate is why "tint" means one thing.

| | Promise | Treatment | Reduced motion |
|---|---|---|---|
| **Lift** | this navigates | `elev-2` to `elev-4` | drop the translate, keep colour and shadow |
| **Tint** | a readout, inspect it | the element's own `status-*-soft` step | unaffected |
| **Reveal** | there is more here | hidden control or readout fades in, in place | fade only, no slide |
| **Link** | its counterpart is over there | lands on the TARGET, not the hovered thing | pan and highlight land instantly |
| ⛔ ~~**Tilt**~~ **RETIRED 2026-09-16, DL-87** | ~~decorative, promises nothing~~ | **REMOVED FROM THE CODEBASE.** Do not re-add a tilt semantic | n/a |
| **Inert** | nothing will happen | none, `cursor: default` | n/a |

✅ **TINT IS BUILDABLE. Measured and closed 2026-09-01.** The concern was that `status-*-soft` named a token
family that the 2026-07-28 measurement said did not compile on `dev`. It compiles now. `theme/status.ts` on
`0decd5d` carries the full four-tier set, 20 keys, and all five `bg-status-*-soft` utilities **EMIT**,
emit-checked with a negative control. Values are in [codebase](codebase.md). **No fallback step is needed and
the 7/28 finding is superseded there, negated in place rather than deleted.**

⛔ **A tinted element must NEVER acquire a click handler** (DL-53). Tint means readout, and a hover state is
exactly what invites someone to wire one.
⛔ **Reveal must be reachable by keyboard focus**, not hover alone, or the control is hidden from every
keyboard user.
**Link declares its direction.** 6.2 syncs pin and card both ways, 4.3 is one-way.
⭐ **`elev-3` is already defined as "focused or selected from outside", which IS link's target state on a
card.** The token was written for this before the semantic had a name.
⛔ **RETIRED 2026-09-16 BY DL-87. THE TILT IS REMOVED FROM THE CODEBASE ENTIRELY**, `slotTilt.ts` and its
test deleted, 105 lines net. Keith's 2026-09-01 ruling that it stays is superseded by his own later ruling, and
the house skill's argument is the one that won. ⚠️ **AND THE CLAIM BELOW WAS WRONG BY SEVEN.** Measured
2026-09-16, the tree tilted **eight of nine slots and six already carried live charts**, so the condition
attached to the 09-01 ruling fired when 4.3 mounted the charts, a month before anyone noticed. Original text
kept for the record.

⚠️ **Tilt has ONE call site (4.1's placeholder slot cards) and the house skill argues against generalising
it** — its frequency framework says hover effects seen tens of times a day should be reduced or removed, and
it blesses decorative mouse-tracking only where the surface is not functional data. Keith ruled it stays. Do
not extend it to a data-bearing surface without a new ruling.

### Keith's four rulings, 2026-09-01

```
--  the chart legend cluster   >> COVERED, not exempt. Eleven files of real controls with real state and no
                                  hover, focus ring or press. Exempting the largest coherent group of bare
                                  controls would hollow out the contract. Their inline
                                  `background:none; border:none; padding:0` reset goes
--  the 61 legacy-gray decls   >> ⛔ FROZEN, do NOT migrate. They sit in GridGuardian, Settings and
                                  Configuration, all outside A2. Large mechanical job, no visible gain until
                                  finished. **Do not tidy a handful piecemeal** and leave an area half
                                  converted. Bind NEW work only
--  disabled tokens           >> `ink-400` text on `ink-50`, plus `cursor-not-allowed`. WCAG exempts
                                  inactive controls from the contrast minimum, so a muted step is legitimate
                                  here even though it would fail for live text
--  how it ships              >> DOCUMENTED CLASSES now, a shared helper later. A helper is one more shared
                                  file across nine open branches. Extract it at the boundary sync when the
                                  queue is empty
```

⛔ **The `not-allowed` cursor stays, and a custom cursor was REJECTED 2026-09-01.** Two reasons. It is a
learned convention that means "you cannot do this" without being taught, so replacing it spends a signal
channel for decoration. And `cursor: url()` overrides the OS cursor, breaking any user who has set an
enlarged or high-contrast pointer. **Do not re-propose a branded cursor.**

### ✅ Hover blue and focus blue, ruled 2026-09-01

**ONE colour, differing by width or offset.** Never two blues nested on the same element, which is what a
hovered-and-keyboard-focused control would otherwise render. Same colour with different weight is how two
states read as one system.

### ✅ Both open measurements are now CLOSED, and both came back against the assumption

**The popover has no blue edge at all.** `PlantInfoWindow.tsx:117` on `dev` reads
`border border-hue-gray-300 bg-white ... shadow-llg`, so the edge is a **1px grey border** at
`hue-gray-300` = `#D8DCE4` plus a black-at-10-percent shadow, `shadow-llg` = `0px 4px 20px 0px #0000001A`.
Both tokenised, nothing hardcoded. ⛔ **And `rgba(31,65,115,0.20)` is not in the popover and not anywhere in
`app/**`.** It is the DS template's shadow, which the 836 port deliberately did not adopt because reproducing
it meant hardcoding a colour. The nearest live relative is `rgba(31,65,115,0.14)` on FleetMap's
Search-This-Area pill. So the close button's "follow the popover's blue" **has no blue to follow**, and that
ruling needed re-taking. ✅ **IT WAS RE-TAKEN THE SAME DAY AND IT IS SETTLED. The blue is `hue-sky-500`**, one
colour for the glyph and the outline, distinguished from the focus ring by width or offset rather than by
colour. ⛔ Do not read this paragraph as an open question, and do not go looking for a source value again, both
candidates were measured absent. See the close-button section below.

**Focus is 7 controls, not 18 upward.** 47 occurrences of `focus:outline-none`, 24 paired, 23 bare, but 16 of
the 23 are Headless UI panels where the library documents that pattern. ⛔ **So prohibition 1's framing
overstated the defect and is corrected in [codebase](codebase.md), and the prohibition now carries an
explicit Headless UI exception** so a sweep does not "fix" 16 correct call sites.

### ⚠️ What the reads OPENED, which is more than they closed

**Interaction blue is not a token decision today, it is a coin flip.** The blue-edge census found seventeen
distinct values on elevated surfaces, led by `ring-blue-500` at 14 and `ring-indigo-500` at 8. ⛔ **`blue-*`
and `indigo-*` are stock Tailwind and are not in this project's ramp at all**, and together they outnumber
the `hue-sky` edges. The contract's `outline-hue-sky-500` focus ring appears 9 times. So the ring is not the
incumbent, it is a minority, and adopting it is a migration rather than a continuation.

**The `hue-sky` ramp has holes**, no 200, no 400, no 700, and nothing between 800 and 900. Full table in
[codebase](codebase.md). This is why the primary's hover has no in-ramp answer.

## ⭐ THE TRENDS NINE, MEASURED 2026-09-04. Seven share a time axis, two do not, and the axis has five names

Measured by reading each chart's `XAxis dataKey` and its Recharts element. Not inferred from titles.

| slot | chart | X axis key | kind |
|---|---|---|---|
| energy generation over range | `BarChart` | `Month` | time |
| grid frequency | `LineChart` | `time` | time |
| grid voltage | `LineChart` | `time` | time |
| energy statistics | `AreaChart` | `Date` | time |
| load shifting | `AreaChart` | `Time` | time |
| blackout duration | `ComposedChart` | `date` | time |
| production review | `BarChart` | `Month` | time |
| **balance of systems** | `BarChart` | `Inverter` | ⛔ **categorical, per device** |
| **financial trend** | `ComposedChart` | `category` | ⛔ **categorical** |

⛔ **Nothing in `trendsSlots.ts` knows which is which.** The registry classifies by `tier` and by `expected`
(migration or net-new), neither of which is the axis, so the layout currently mixes two incompatible question
types into one rhythm. **This is the fact DL-64 rests on.**

⚠️ **The same time axis is labelled FIVE ways.** `Month`, `time`, `Date`, `Time`, `date`. Side by side in a
grid that reads as five charts measuring five different things when they measure one. **The axis-normalisation
step in DL-64 fixes this by construction** and is the cheapest half of that decision.

✅ **RESOLVED 2026-09-16, and the DS gains its first chart-height figure.** A chart in a stacked time column
takes **260px**, as `STACKED_CHART_HEIGHT` in `app/utils/trendsAxis.ts`, **plus an axis gutter for the one
chart that draws the shared axis**, because a hidden `XAxis` reserves no height and without the gutter that
chart's plot rectangle ends up shorter than the ones above it. Zone two keeps 400. ⛔ **The card carries NO
`min-height` at any density** per the 2026-09-01 anatomy-only ruling, and the six `min-h-[400px]` strings that
breached it are gone from the Trends call sites. ⚠️ **260 is a raw number rather than a token because Recharts
requires one and no chart-height scale exists.** This entry is that scale's first row.

⚠️ **Chart heights were hero-sized for something that is one of seven.** 400 to 500px each, corrected from
475 by measurement 2026-09-16. A stacked column
needs them shorter, and the enlarge modal already exists for going deep on one.

## ⛔⛔ NONE OF THE SEVEN TRENDS CHARTS USES THE DESIGN SYSTEM. Measured 2026-09-04, Keith's own catch

Found on his visual pass of `!1035`, then counted by Code. **51 raw six-digit hex literals across the seven**,
and **zero** reads of `statusToHex`, `status-*` or `hue-*` in any of them.

| chart | raw hex literals |
|---|---|
| EnergyGeneration | 8 |
| EnergyStatistics | 10 |
| GridFrequency | 7 |
| GridVoltage | 7 |
| BalanceOfSystems | 10 |
| DurationOfBlackouts | 1 |
| LoadBalancingArea | 8 |

⛔ **And every one is wrapped in the legacy `GraphWrapper` rather than the card system.** The fills are
Recharts documentation defaults that nobody ever replaced. This is the tokens-only rule broken seven times
over on a customer-facing tab, and it violates the same convention the Button `min-w-[128px]` note names.

**What the DS actually offers here, per Code's read of the on-disk templates.** There is **no per-chart
template** for these six chart types. What exists is `chart-primitives`, `evolved-graphtooltip`,
`evolved-chartlabel`, `status-donut`, and the build guide's categorical palette rule (same concept means same
colour, violet reserved for anomaly). **So the treatment is primitives plus palette plus tokens, not a
template port.**

⭐⭐ **THIS FOLDS INTO DL-64 RATHER THAN BEING A THIRD ITEM.** The Trends charts need one design pass with
four parts, and filing them separately is how one surface's work fragments across a lane.

1. **Axis normalisation.** One X domain and one label format. Kills the five-different-key-names problem.
2. **Tokens.** The 51 hexes onto `theme/` tokens and the categorical palette rule.
3. **The card system.** Off `GraphWrapper` and onto the declared card densities and header.
4. **The two-zone layout.** Time charts stacked with the axis drawn once, categorical charts in their own row.

⚠️ **Sized honestly this is not a three-pointer.** Seven components, four dimensions. It is also the item
that makes the Trends tab look designed rather than assembled, which is what Peter sees when he opens it.

## ⚠️ TWO UNDECLARED THINGS ON THE TRENDS SLOT CARD, found 2026-09-04 while answering a layout question

**1. The cards TILT in 3D on pointer move, and the interaction contract does not declare it.**
`slotTilt.ts` computes a perspective `rotateX`/`rotateY` up to 1.5 degrees from the pointer's position in the
card's rect, and `TrendsSlotCard` applies it via `setTilt` on **every `mousemove`**, across up to nine cards.
✅ It checks `prefers-reduced-motion` and disables, which is right, and `hoverTilt: false` opts a slot out.

⛔ **But the declared contract lists SIX hover semantics for composite surfaces (lift, tint, reveal and three
more) and tilt is not among them.** So this is undeclared rather than prohibited, and it is on the surface 4.3
is about to fill. ⚠️ **Two separate concerns.** A React state update per mouse event on nine cards is a
performance smell. And a pointer-tracked continuous transform reads as "each card is a discrete object you can
pick up", which fights the comparable-set reading a history surface wants, so it is layout-adjacent rather
than merely decorative. **Keith's design call, not filed.**

**2. `tier` in the slot registry is read by NOTHING.** ✅ Geometry comes from the `wide` field, which is
correct and honours the ruling that size comes from the SLOT and never from importance. So the two axes are
properly separated. ⛔ But that leaves `tier: 'primary' | 'secondary'` as a declared field with no consumer,
which is the same shape as the `claimedBy` field rejected on 4.3 the same day. **Either it drives the
prominence axis or it goes.**

## ⛔ WHERE THE DS TEMPLATES ACTUALLY LIVE, and the branch route is RETIRED (2026-09-03)

**The templates are on DISK, in the working tree, at `design/templates/<slug>/<Name>.dc.html`.** 54 slug
folders, 108 `.dc.html` files as of 2026-09-03. The path is gitignored and untracked (`.gitignore:7:design/templates/`
plus `.git/info/exclude`), so **every git-based check reports absent while the files are sitting right there.**
Ask the filesystem, never git.

⛔ **`chore/ds-templates-reference` IS NO LONGER A READ ROUTE.** It is merged into `dev` (0 ahead, 179 behind)
and frozen at `00b115e`, 2026-07-16. It carries 106 tracked files against 108 on disk, it has **no `toast/`
slug** and **none of the four galleries**. So `git show chore/ds-templates-reference:design/templates/...`
returns July content and exits 0, which is a stale read that announces nothing. It was the instruction on two
surfaces until 2026-09-03 and both were rewritten to read the disk.

⛔ **Never check that branch out.** Its 106 files are tracked there, so a checkout materialises the July
versions over the on-disk ones silently, no diff and no warning, and everything placed since 2026-07-16 is
gone. The branch is history only.

**What Design couriered and Keith placed by hand, 2026-09-03.** Four zips, nine `.dc.html` files, harness and
`.thumbnail` assets deliberately not placed (matching every other slug on disk, none of which carries
`support.js` either). `callout/` replaced `Callout.dc.html`; `tag/` replaced `Tag.dc.html` and gained
`TagGallery.dc.html`; `severity-system/` replaced `SeverityBadge.dc.html` and `SeveritySystem.dc.html` and
gained `SeverityBadgeGallery.dc.html`; `toast/` is a NEW slug with `Toast.dc.html` and
`ToastMobileGallery.dc.html`; `callout/` also gained `CalloutGallery.dc.html`. `Callout.dc.html` and
`Tag.dc.html` were content-identical to the disk copies, CRLF against LF and nothing else, so for those two
slugs the only new artifact is a gallery.

✅ **All nine files are on disk and all four slugs carry a gallery**, confirmed by directory listing.

⛔ **`Toast.dc.html` is the ONLY file in the whole template tree with no font reference.** The other 81 of 100
name Space Grotesk, which 7.2 / AB#991 deletes, so the guide now carries a DO-NOT-LIFT-THE-FONT exception
covering the entire inventory. Every other literal in a template still governs.

## ⚠️ THE VENDORED-SIBLING TRAP, caught in the wild (measured 2026-09-03)

DL-17 warns that the DS carries stale vendored sibling copies of components that have since evolved in the
repo, and names SeverityBadge as one of the five. Here is the live instance, measured rather than inferred.

- `domain-control-readout/SeverityBadge.dc.html` declares FIVE variants, `solid soft outline dot dot-only`.
- `severity-system/SeverityBadge.dc.html` declares THREE, `solid soft outline`.

**`severity-system/` is canonical.** The dot variants were dropped 2026-07-22 by AB#825 Decision 1, so the
`domain-control-readout/` copy is pre-decision, and building a dot variant off it reintroduces something
already ruled out. Not fixed by hand, because the sibling copies are Design's to reconcile and an edit here
would only create a third version. Flagged in `AREA-BUILD-GUIDE.md` with `severity-system/` named canonical.

⭐ **The generalisable form. When two slugs carry the same component name, the one named for the COMPONENT
beats the one named for the SURFACE that embeds it.** `severity-system/` over `domain-control-readout/`. The
surface-named copy is a snapshot taken when that surface was designed, and it stops moving.

## ⛔ NAMING, and it has already sent one reader to a file that does not exist

**`PlantPopover` is a DESIGN name. No file by that name exists anywhere in the tree.** The real component is
`app/components/GoogleMaps/PlantInfoWindow.tsx`. Recorded here 2026-09-02 after Code handed it back, because
the design name appears across the locked spec, this page, the decision log, two sequence files and the repo's
work-item doc, and a frame citing it by that name points a builder at nothing.

The repo doc already carries the same note inside PBI 4.5's block. It is stated twice on purpose, once where
Code reads and once where Cowork frames, which is two audiences rather than drift.

## The close button, first entry in the component layer (Keith 2026-09-01)

**Keith's want, verbatim in substance:** every close button in the app behaves identically. Rest is a bare X,
hover adds a blue outline and rotates the X.

⛔ **This is a COMPONENT SPEC, not the `tilt` hover semantic, and filing it under tilt would break the thing
Keith is after.** The house glossary splits them itself, *3D tilt / Flip* is rotation in 3D space toward the
cursor, *Rotate* is a spin around a point. 4.1's slot cards do the first and promise nothing. A close button
does the second, on a control, and it IS promising something, which makes it feedback. A semantic leaves room
to interpret; a spec does not, and uniformity is the whole point here.

✅ **FULLY SPEC'D 2026-09-01 after Keith's clarification. Hover changes THREE things at once, and the glyph
recolouring is one of them.** The earlier version of this spec had the outline turning blue and missed that
the X itself does too.

```
--  rest                        >> bare grey X. No outline. `ink-600` (ink-500 fails AA at 3.19:1 and this
                                   glyph is small)
--  hover                       >> THREE changes together, one colour:
                                   1. the X turns blue
                                   2. a blue outline appears
                                   3. the X rotates 90 degrees
--  focus-visible               >> the ring, per the interaction contract, same blue at a different width
--  press                       >> scale(0.97)
--  reduced motion              >> drop the rotation, KEEP the outline AND the recolour. Motion goes,
                                   colour stays
--  duration                    >> 100 to 160ms, press-feedback band, plain `ease` since it is a hover
                                   colour change
```

⭐ **One blue for both the glyph and the outline.** That is what makes hover read as a single event rather
than as two effects that happen to coincide, and it follows the standing ruling that hover blue and focus blue
are one colour differing by width or offset.

⚠️ **ROTATE 90 DEGREES, NEVER 45.** An X is two strokes at 45 and 135 degrees, so 90 maps the set onto itself
and the glyph spins and lands looking identical, which is the intended effect. **45 degrees lands it on a plus
sign**, which reads as "add" on a control that closes things.

⛔ **Use CSS `outline`, never `border`.** A border appearing on hover shifts layout by 1px unless a
transparent border sits at rest, and layout-shifting hover is prohibited by the contract. `outline` does not
participate in layout.

### ✅ The blue, RULED 2026-09-01 after two dead ends

**The blue is `hue-sky-500`**, the same value as the focus ring, applied to both the glyph and the outline on
hover and distinguished from the ring by width or offset rather than by colour. **This is not a new decision,
it is the standing one-blue ruling applied**, and it dissolves the hovered-and-keyboard-focused collision
instead of managing it.

⛔ **Two candidate sources were checked and neither exists. Do not go looking again.**

**The popover has no blue edge.** Measured on `dev`,
`PlantInfoWindow.tsx:117` carries a 1px `border-hue-gray-300` (`#D8DCE4`, grey) plus `shadow-llg` (black at
10 percent). ⛔ **And `rgba(31,65,115,0.20)` is not in the popover, and not anywhere in `app/**`** — it is the
DS template's shadow, which the 836 port deliberately declined in order to avoid hardcoding a colour.
`#8AD9FD` exists only in `theme/` as `hue-sky-300` and `status-normal-border`, never as an edge in `app/`.

**And the DS has no close button either.** `design/templates/` searched 2026-09-01 for close, dismiss and
icon-button, **zero matches**. So there was never a value to look up in either place, which is why the ruling
falls back on the system's own rule rather than on a reference.

⚠️ **What makes the choice a real one rather than a formality.** `outline-hue-sky-500` appears **9 times** in
`app/**` against `ring-blue-500` at **14** and `ring-indigo-500` at **8**, both of which are stock Tailwind
and outside this project's ramp. So adopting the `hue-sky-500` ring is a **migration**, not a continuation of
the incumbent. Worth knowing before it is declared, because the sweep is larger than the contract implied.

## BUTTONS, the appearance layer (Keith 2026-09-01)

**Scope. This section is appearance only.** Every behaviour a button has is already settled by THE
INTERACTION CONTRACT above, six states and six rules, and nothing here restates it. What was missing is the
hierarchy: which button looks like what, and which one a given placement is allowed to reach for. Declared,
not applied. Queue-gated with the rest of today's work and owned by task 899 for the sweep, while individual
PBIs adopt as they touch a surface.

### Five variants, and a placement rule that makes the hierarchy real

```
--  primary        >> solid fill, white label. ONE per screen region, no exceptions
--  secondary      >> outline, grey at rest, blue on hover. The default for everything else
--  tertiary       >> no border, label only. Low stakes, in-table, in-row, repeated actions
--  icon-only      >> square, any of the three levels above, accessible name REQUIRED
--  destructive    >> outline first, never solid, on the fault ramp
```

**One primary per region is the load-bearing rule.** Without it the hierarchy is decoration, because a screen
with three solid buttons has no primary at all. Region means a card, a panel, a modal footer, a page header,
not the whole viewport.

### The primary's fill, which corrects a DS default rather than adopting it

⛔ **The DS Button template's solid primary FAILS AA.** White on `hue-sky-500` measures about 3.0:1 against
the 4.5:1 floor. This is a recorded trap, not a suspicion, and it has been on the record since AB#940.

✅ **The house primary is white on `hue-sky-800`.** Contrast is symmetric, and `hue-sky-800` measures
**7.76:1** against white in the 2026-08-27 ramp table above, so white on `hue-sky-800` passes with room. **No
new hex, no new token, an existing step used correctly.** Do not "restore" the template's 500 fill.

⛔ **THE PRIMARY'S HOVER STEP IS MEASURED AND THERE IS NO IN-RAMP ANSWER. Keith's to rule.** Measured
2026-09-01 from `theme/colors.ts`. The ramp is 50, 100, 300, 500, 600, 800, 900 and **has no step between 800
and 900.** `hue-sky-800` is `#03587F` at L 0.0853, `hue-sky-900` is `#1F4173` at L 0.0531. The contrast
between the two is **1.31:1**, below the roughly 1.5:1 threshold for a perceptible surface-to-surface step,
**and they are different hues**, 800 teal-leaning and 900 navy, so the change would read partly as a hue shift
rather than as a darken. Full table in [codebase](codebase.md).

✅ **RULED 2026-09-01 (Keith). DO NOT DARKEN THE PRIMARY ON HOVER.** The fill stays `hue-sky-800` in every
state and the hover feedback is a **one-step elevation lift**, `elev-1` to `elev-2`, plus the contract's
existing `active:scale-[0.97]` for press (the bracketed form, corrected 2026-09-23). No new token, no ramp edit, and it reuses a vocabulary declared the same
day rather than inventing a second one. The house skill's frequency argument also lands directly here, a
primary's hover fires constantly and a colour flash is the effect that skill says to reduce.

⛔ **Two options were considered and REJECTED. Do not re-propose either.** Hovering to `hue-sky-900` and
accepting a 1.31:1 step that reads as a hue change. And adding a `hue-sky-700` step to the ramp, which is a
new token and a `theme/colors.ts` edit inside the queue gate.

⚠️ **The ruling has a dependency worth naming.** It needs `elev-1` and `elev-2`, which do not exist yet and
land with task 899. Until then the primary's hover is **pending its tokens rather than undecided**, and a PBI
that needs a primary before 899 should use the secondary instead of improvising a hover.

### The secondary is `!1026`'s shipped button, promoted rather than re-derived

`!1026` already solved this once, reseating Edit Plant as a rest-grey outline button when the solid primary
turned out to fail. **That shipped, it was Keith-verified, and it becomes the house secondary.** Rest is a
grey border with an `ink-700` label, hover tints the surface to `hue-sky-50` and takes the label to
`hue-sky-800` at 7.76:1. Reuse it. Re-deriving a second outline button is how two secondaries end up on one
screen.

### Tertiary, icon-only and destructive

- **Tertiary** is a bare label in `ink-600`, hover tints to `ink-50`. ⚠️ `ink-600` is the FLOOR for small text
  on white at 4.94:1 and `ink-500` fails at 3.19:1, so a tertiary button may not be lightened to look
  quieter. If it needs to be quieter than `ink-600` it should not be a button.
- **Icon-only** is square with equal padding on all four sides, and the glyph inherits the level's label
  colour. An accessible name is **required**, not optional, and the icon census applies: several glyphs in
  this set carry hardcoded fills or no viewBox, so an icon-only button cannot assume its glyph recolours or
  scales. AB#950's square `Settings` is the live instance.
- **Destructive** takes the fault ramp. ⛔ **THE REASON GIVEN EARLIER WAS WRONG AND IS CORRECTED.** It said
  destructive stays an outline "because this app has no confirm-dialog pattern yet". **A confirmation pattern
  IS declared in the house skills, it just is not a dialog.** `animation-vocabulary` names
  **"Hold to confirm — A progress effect that fills up while the user holds a button"**, and
  `find-animation-opportunities` names the exact seam: **"Destructive actions confirmed with a plain click
  where a hold-to-confirm fill would prevent slips"**, with the implementation
  `clip-path: inset(0 100% 0 0)` overlay, **2s linear on press, 200ms ease-out snap-back on release**. That is
  `STANDARDS.md`'s asymmetric-timing rule applied, slow where the user is deciding and fast where the system
  responds.
  ✅ **So the ruling becomes: an outline destructive needs no confirmation, and a SOLID destructive is
  permitted only with hold-to-confirm.** Outline stays the default because it is cheaper and most destructive
  actions here are not irreversible. ⚠️ `apple-design` agrees on the restraint, its *Agency* principle says to
  reserve a confirmation dialog for "genuinely destructive, irreversible actions (use sparingly; overusing it
  trains people to click through)".

### Appearance rules that apply across all five

- ✅ **SIZES ARE ALREADY DECLARED IN THE DS. Adopt them, do not invent them.** ⛔ **The read that said "one
  size, no variants" was against the WRONG TEMPLATE.** It read
  `design/templates/domain-control-readout/Button.dc.html`, a domain readout's local button. The real Button
  lives at **`design/templates/form-controls/Button.dc.html`** with **`form-controls/ButtonGallery.dc.html`**
  beside it, and the gallery has a "Sizes" section with three fully specified buttons. Keith remembered this
  and asked for the lookup. See the incident note below.

  | Size | Type | Padding | Radius | Gap | Computed height |
  |---|---|---|---|---|---|
  | `sm` | 13.5px | `7px 13px` | **8px** | 6px | ~31px |
  | `md` (default) | 14px | `9px 16px` | **9px** | 7px | ~35px |
  | `lg` | 15px | `11px 20px` | **10px** | 8px | ~41px |

  All three at `font-weight:600`, `line-height:1.1`, `letter-spacing:.005em`, `box-sizing:border-box` with a
  1px border, so the heights above are derived and not declared.

- ⛔ **RADIUS IS NOT A SINGLE VALUE, and the earlier "settled at 9px" claim is WRONG and retracted.** Radius
  **scales with size**, 8, 9, 10. The 9px agreement between AB#950 and the domain template was a coincidence
  of both being the middle size. AB#950's `rounded-[9px]` at `h-9` is correct for `md` and would be wrong on
  a `sm` button.
- ⚠️ **The prop schema declares FIVE sizes, `xs` `sm` `md` `lg` `xl`, and the gallery defines THREE.** `xs`
  and `xl` exist as enum options with **no visual definition anywhere**. Either they get defined or the enum
  narrows. Do not guess values for them.
- ⚠️ **AB#950's shipped buttons are a near-miss on `md`, not a fourth size.** `h-9` (36px) `px-3`
  `text-[13px]` `rounded-[9px]` against `md`'s ~35px, 16px padding and 14px type. Same box, tighter padding,
  smaller type. **Treat it as `md` drifting rather than as a compact size**, and reconcile it toward `md` when
  something touches it.
- ⚠️ **A limit that bounds any later check.** Of 251 `<button>` / `<Button>` tags in `app/**`, **180 (72%)
  carry no geometry at all** and rendered height is padding-and-line-height driven for **242 of the 251**, so
  a static sweep can never verify a height convention. Only a browser resolves those.
- **Labels are sentence case, verb first, no title case, no trailing punctuation.**
- **Icon plus label keeps the icon leading** unless the icon means "onward", in which case it trails.
- **`pending` is the one place the brand blue belongs**, per the contract. A pending button keeps its variant
  and gains the blue, it does not become a primary.
- **`disabled` never takes blue.** `ink-400` on `ink-50` with `cursor-not-allowed`, per the contract, and the
  custom-cursor idea stays REJECTED.
### ⛔ The real Button template also declares a HIERARCHY, and it does not match our five variants

Read from `form-controls/Button.dc.html` 2026-09-01. The prop schema is
`hierarchy: primary | secondary | tertiary | outline | ghost | link` plus a separate `destructive` boolean and
a `loading` boolean. Rendered fills:

| DS hierarchy | Rest treatment |
|---|---|
| `primary` | solid `#009DE4` (= `hue-sky-500`), white label |
| `secondary` | **solid grey fill `#F1F4F6`**, label `#46505A` |
| `tertiary` | renders as `secondary` |
| `outline` | white fill, **1px `#CFE8F6`** border, label `#1F4173` (= `hue-sky-900`) |
| `ghost` | transparent, label `#1F4173` |
| `link` | renders as `ghost` |
| `destructive` solid | `#D92D20`, white label |
| `destructive` outline | white fill, 1px `#F2B7AF`, label `#D92D20` |

**Four divergences from our declaration, all of them deliberate and all of them now traceable.**

1. ⛔ **The DS `secondary` is a FILLED GREY, not an outline.** Our secondary is `!1026`'s grey **outline**
   button, which maps to the DS's `outline` hierarchy, not its `secondary`. **The names collide with
   different meanings**, which is exactly the kind of thing that gets "corrected" back. Our hierarchy stands;
   the mapping is recorded so nobody re-derives it.
2. ⛔ **The DS primary is `#009DE4` = `hue-sky-500`, confirming the AA failure a third time.** Our reseat to
   `hue-sky-800` is a correction of this template, and the correction is now sourced.
3. ⛔ **The DS `disabled` is `opacity:.5` on the primary fill with `cursor:not-allowed`.** That is a
   half-opacity blue, so it **violates our own rule that disabled never takes blue**, and at 50 percent on
   white the white label's contrast collapses well below the primary's already-failing 3.02:1. **Our
   `ink-400` on `ink-50` ruling deliberately overrides this.** Do not adopt the DS disabled.
4. ✅ **The DS has `loading` and it IS our `pending`**, a spinner at 14px with `border-top-color:transparent`,
   the fill kept, and `cursor:default`. ⭐ **So `pending` was not invented today, it was already in the DS and
   simply never built.** The contract's claim that 28 files submit and none declares a busy state stands, and
   now the treatment has a source.

⚠️ **`tertiary` and `link` are aliases in the render**, so the six-way enum is really four treatments. And
⛔ **`#CFE8F6`, the DS outline border, has no token** — it sits between `hue-sky-100` `#E6F7FF` and
`hue-sky-300` `#8AD9FD`. ⭐ **It is also exactly the hardcoded `border-[#CFE8F6]` on FleetMap's
Search-This-Area pill**, so that "one hardcoded blue border" in the census is not a stray, it is someone
porting the DS outline button faithfully with no token to use. **Either the ramp gains that step or the pill
keeps its hex with a reason written down.**

### ⭐ THE RADIUS CENSUS. Shape is ALREADY a semantic channel in this DS, and nobody had noticed.

Measured 2026-09-01 across every `.dc.html` in `design/templates/`, 909 `border-radius` declarations. **The DS
does not have one radius, it has four bands, and each band means something.** This was found while Keith asked
whether buttons should lean round or square, and it answers the question by measurement rather than by taste.

| Band | Value | What wears it |
|---|---|---|
| **Fully round** | `999px` or `50%` | Chip, Tag, SeverityBadge, StatusDot, Avatar, Switch, PlantPhotos dots, StatusDonut legend, TimeFilter's quick-range chips |
| **Soft rectangle** | 6 to 10px | **Button (8 / 9 / 10)**, TimeFilter trigger and dropdown (10) and its inner controls (9, 8, 6), Pagination (7, 10), inputs in `Primitives` (7), PlantPopover inner (8), StatusDonut inner (8) |
| **Container** | 12 to 14px | WeatherCard (14), TodayPanels, PlantPopover, PlantPhotos, SeveritySystem panels, most cards (12) |
| **Micro mark** | 4px | SeveritySystem swatches, Progress bar caps, small legend marks |

⭐ **The split is by ROLE, not by taste.** Fully round is worn by **labels, states, toggles and avatars**, none
of which is a command. Soft rectangle is worn by **every real control in the system without exception**.
⛔ **Not one button-scale control anywhere in the DS is a pill**, and ⛔ **not one control anywhere is square**,
since 4px appears only on marks and 0px appears nowhere at all.

⚠️ **Scale is part of the rule.** TimeFilter's quick-range items ARE selectable and they ARE pills, but they
are chip-scale, 12px type in about 20px of height. Everything at 28px or taller with 13 to 15px type is a soft
rectangle. **So the boundary is not "interactive versus not", it is "command versus token".**

⭐ **And the bands nest correctly.** A button at 8 to 10 inside a card at 12 to 14 is a child less round than
its parent, which is what makes it read as sitting inside rather than pasted on. A pill button at ~17px inside
a 12px card would invert that.

### ✅ SHAPE IS A DECLARED CHANNEL. Ruled 2026-09-01 (Keith).

**Shape says what a thing IS, before colour says anything about it.** Four bands, and a component takes the
band its role puts it in, never the band a designer prefers.

```
--  fully round (999px / 50%)   >> a LABEL, a STATE, a TOGGLE or an identity. Never a command.
                                   chips, tags, severity badges, status dots, switches, avatars,
                                   chip-scale selection tokens
--  soft rectangle (6 to 10px)  >> a COMMAND or an INPUT. Every real control, no exceptions.
                                   buttons (8 / 9 / 10 by size), inputs, selects, pagination,
                                   segmented controls, dropdown triggers, popover inner surfaces
--  container (12 to 14px)      >> a SURFACE that holds other things. cards, panels, popovers, modals
--  micro mark (4px)            >> a MARK, not a component. swatches, progress caps, legend keys
```

⛔ **Buttons stay in the soft-rectangle band. A pill button is PROHIBITED**, and so is a square one.

**Keith's brief was round-leaning, and this delivers it without spending a channel.** Three reasons on the
record so the ruling is not reopened as taste.

1. ⛔ **Chips, tags and severity badges already own fully-round.** A pill button and a filter chip would be the
   same shape, which collapses the one non-colour signal the system has for command against label.
2. ⛔ **It would invert the nesting.** A pill at about 17px inside a 12px card is a child rounder than its
   parent, which reads as pasted on rather than contained.
3. ✅ **The brief is already met.** 8px on a 31px control is a quarter of its height. That is round-leaning
   already, so the only live question was whether to go further, and further is where the cost is.

⛔ **The "solar panels are square so controls should be square" argument is REJECTED, and the reason matters
more than the ruling.** It applies the subject matter to the wrong layer. Panels belong to the DATA layer,
which is already rectangular by nature, the equipment cells, the tables, the map, the panel and inverter
glyphs. **A control layer that restates its own subject matter stops reading as something you operate.** Do
not re-raise this as a skeuomorphic argument.

⭐ **What Keith gains from the ruling rather than gives up.** Fully-round becomes deliberate rather than
inherited. Every state, selection token and toggle goes round BY RULE, which is a softer overall read than
pill buttons alone would have produced, and it costs nothing because the DS already does it.

### ✅ BUTTON ELEVATION BY HIERARCHY. Ruled 2026-09-01 after Keith asked whether it was accounted for.

**It was not, and the gap was real.** `elev-1` was declared as "resting controls, buttons, inputs, small
affordances", one step for every control regardless of hierarchy. So a ghost button and a solid primary would
have cast the same shadow.

⭐ **The reframe that makes it coherent. Elevation follows SURFACE, not importance.** Those two correlate here
but they are not the same thing, and surface is the one that is physically true: **a control with no fill has
nothing to raise, so it cannot cast a shadow no matter how important it is.** Importance is carried by fill and
weight; height is carried by whether there is a surface at all.

```
--  primary (solid fill)        >> elev-1 at rest, elev-2 on hover
--  secondary (our outline)     >> elev-0 always. The border does the edge work
--  tertiary / ghost            >> elev-0 always. No surface exists to lift
--  destructive (outline)       >> elev-0 always, same reason as secondary
--  icon-only                   >> takes the elevation of whichever level it wears
--  disabled, EVERY variant     >> elev-0. A disabled control is not raised, it reads as ABSENT
--  pending, EVERY variant      >> keeps its REST elevation and never lifts. It is busy, not inviting
```

⛔ **The outline rule is not a stylistic choice, it prevents a named anti-pattern.** A border plus a shadow on
the same elevated edge is the double-edge artifact, and Cowork produced exactly that mistake earlier the same
day in the first lift spec. An outline button at `elev-1` would rebuild it.

⛔ **A graded scale by importance was considered and REJECTED.** Primary `elev-2`, secondary `elev-1`, tertiary
`elev-0` reads well in a list and breaks in place: `elev-2` is the resting-card step, so a primary resting at
`elev-2` inside a card would cast the same shadow as the card containing it. **Same failure as a pill button
inside a 12px card**, a child claiming a property its parent owns.

⚠️ **One genuine tension, named rather than papered over.** The `elev-*` values are ABSOLUTE shadows, while the
language around them ("one step up on hover") is relative to a container. **The rule: a control never RESTS at
or above its container's step, and a hover may reach that step but never pass it.** A primary at `elev-1`
resting inside an `elev-2` card is correct, and its hover to `elev-2` is the ceiling case where the button
comes up to the card's plane. If a later surface needs a primary that lifts further, the container is the thing
that has to move, not the button.

### ⭐ THE CARD CENSUS, measured 2026-09-01. Keith's complaint has a single root cause.

Keith reported cards being "sometimes too thick, sometimes too short, sometimes too empty" and asked for
uniform sizing by hierarchy. **Measured across `design/templates/`, and the cause is one thing.**

⛔ **The DS declares almost NO `min-height` anywhere.** Across 100 templates there are about twelve hits and
they sit on chart shells, spinners and page shells, **not on a single card**. So **card height is entirely
content-driven**, which is exactly the failure Keith described: two cards side by side with different content
volumes end up different heights, and a card with a thin payload ends up looking empty. **There is no size
system for cards, same as there was none for buttons before today.**

**The card shell, two real instances measured.**

| | `CapacityFacts` | `WeatherCard` |
|---|---|---|
| Radius | 14px (inferred from the container band) | **14px** |
| Border | `1px #E2E7EB` (= `hue-ink-200`) | `1px #E2E7EB` |
| Header padding | `15px 18px 0` | `16px 14px 12px` |
| Body padding | `14px 18px 4px` | varies by row |
| Title face | Space Grotesk 600 | Space Grotesk 600 |
| Title size | **18px** | **15px** |
| Title colour | **`#1F4173`** (= `hue-sky-900`) | **`#1F4173`** |
| Title case | **sentence case** ("Capacity & generation") | **sentence case** |

✅ **Three things are already consistent and should simply be declared**: the display face at weight 600, the
title colour `hue-sky-900`, and the left-title / right-metadata flex row with `space-between`.
⛔ **Two things drift**: title size (18 against 15) and horizontal padding (18 against 14). **The house card on
record is `px-[18px] py-4`, so 18 is the majority and WeatherCard's 14 is the outlier.**

**The inset tile, which is a THIRD tier nobody had named.** `CapacityFacts`'s nameplate tiles are
`background:#F7FAFC`, `border:1px solid #EEF2F5`, `border-radius:10px`, `padding:12px 14px`, and **flat**.
⭐ **So the DS already has card-inside-card, with its own smaller radius, smaller padding and no elevation**,
which is consistent with both the radius bands and the elevation rule declared today.

**The eyebrow label, and it is the most drifted thing in the system.** Same idiom everywhere, different values.

| | Seen |
|---|---|
| Size | 10px, 10.5px, 11px |
| Weight | 600 and 700 |
| Letter-spacing | 0.03em, 0.05em, 0.09em |
| Colour | `#8A9199` (= `hue-ink-500`) and `#B4BBC1` (⛔ **no token**, near `hue-ink-300` `#B6BEC5` but not equal) |
| Case | uppercase, consistently |

⚠️ **The uppercase eyebrow is used in at least 30 non-gallery templates**, so it is a real idiom and not
scaffolding. It needs one set of values, not a new invention.

### ✅ THE CARD SYSTEM, ruled 2026-09-01 (Keith). TWO AXES, because size and importance are not the same thing.

⛔ **Cowork's first pass conflated them and Keith caught it.** His objection: a card tier defined as a size
breaks across areas, because Area 1's primary cards **cannot be large** regardless of their importance, they
have to fit a band alongside other components. **That is correct, and it means one tier scale cannot carry
both jobs.**

⭐ **The split. DENSITY is chosen by the card's rendered WIDTH. PROMINENCE is chosen by its hierarchy.**

```
AXIS 1 - DENSITY, from the card's own width. Governs padding, title size, radius.
--  compact     >> narrow slots. band cards, 3-up and 4-up grids, sidebars
                   12px horizontal padding, 12px vertical, 13px title, radius 10
--  standard    >> the workhorse. 2-up grids, most of Area 2
                   18px horizontal, 16px vertical, 15px title, radius 12
--  feature     >> the primary surface of a screen, full or near-full width
                   18px horizontal, 20px vertical, 18px title, radius 14
--  inset tile  >> a card INSIDE a card. Already in the DS as CapacityFacts' nameplate tiles
                   14px horizontal, 12px vertical, no title, eyebrow only, radius 10, FLAT

AXIS 2 - PROMINENCE, from hierarchy. Governs content and treatment, never geometry.
--  is there a title at all, or an eyebrow only
--  does the figure take the display face and the large step
--  which elevation the card rests at
--  whether it carries metadata, an action, or a footer
```

⭐ **Why density has to follow width rather than importance.** Padding-to-width RATIO is what makes a card read
as tight or bloated. 18px inside a 240px band card is cramped; 12px inside a 900px feature card looks
unfinished. **So a card can be high prominence and compact density at the same time**, which is exactly Area
1's primary band cards, and that combination was unreachable while tier meant size.

⛔ **Do not read the density names as an importance ranking.** A `compact` card is not a less important card.

### ✅ Height: ANATOMY ONLY, ruled 2026-09-01 (Keith). No min-heights.

⛔ **No `min-height` on any card, at any density.** A floor reserves space the content does not fill, which
produces the "too empty" failure Keith named. **Height comes out consistent because the anatomy is consistent**,
a density fixes padding and title size, and prominence fixes how many content rows exist.

✅ **THE ONE EXCEPTION, ruled 2026-09-23 (Keith), DL-106.** An empty-state placeholder inside a card may declare
the height of the populated element it replaces, and exactly that height, so the card reads the same with data
and without it. **It is not a card floor and it does not license one.**

⭐ **Why it is an exception rather than a violation.** The rule bans a floor because a floor reserves space the
content does not fill. A placeholder holding the exact height of the chart it stands in for reserves no empty
space, because the space belongs to the chart and is occupied in one state by the chart and in the other by the
message that replaces it. **It produces the consistent anatomy this rule exists for.** ⚠️ **Why it had to be
written down rather than left as judgement.** The text above bans a floor on any card at any density, and the
inset tile is one of the four densities, so read literally the placeholder breaks the rule. **The next agent
follows the text**, so an unstated exception gets "fixed" by the next sweep. First instance, the irradiance empty
state on the plant weather card, `min-h-[168px]` against the 168px chart it replaces, kept by Keith's ruling that
the card is right as built. ⚠️ **That tile is not a strict inset tile**, its padding is `px-4 py-6` against the
declared 14 by 12, so the exception is granted to the placeholder role and not to the inset tile's geometry.

✅ **Where cards genuinely must match height, side by side in a row, that is a GRID STRETCH on the row**
(`items-stretch`), not a height on the card. **The row owns equal heights. The card never does.**

### ✅ Cards are DYNAMIC by default, ruled 2026-09-01 (Keith)

**Density steps DOWN as the card narrows**, feature to standard to compact, and the card responds to **its own
width, not the viewport's.**

⛔ **This means CONTAINER queries, not media queries, and the reason is not stylistic.** The same card appears
in a 4-up band and in a 2-up layout **at the same viewport width**. A media query cannot tell those apart and
would give both the same density, which is the bug this rule exists to prevent.

✅ **Measured 2026-09-01, and it is achievable with no config edit.** `tailwindcss` is **3.4.3** and
`@tailwindcss/container-queries` is **NOT installed**; native container-query utilities only arrive in Tailwind
4. But Tailwind 3 arbitrary variants pass at-rules through, so `[@container(min-width:_Npx)]:` works, and the
parent takes `[container-type:inline-size]` as an arbitrary property. ⭐ **So this needs no
`tailwind.config.ts` or `package.json` change and is therefore NOT queue-gated.** ✅ `line-clamp` and
`truncate` are already in Tailwind 3.4 core, no plugin needed.

### ✅ Text overflow rules. One of these is a safety rule, not a style rule.

```
--  card title        >> ONE line, truncate with ellipsis, NEVER wrap. A wrapping title changes card
                         height, which reintroduces the inconsistency this whole section removes
--  eyebrow           >> ONE line, truncate
--  labels, names     >> truncate, and carry the full string in a `title` attribute so it stays reachable
--  descriptive prose >> `line-clamp-2` ONLY, a fixed clamp so height stays predictable. Never clamp-none
--  ⛔ NUMERIC VALUES >> NEVER TRUNCATE. See below.
```

⛔ **NEVER ELLIPSIS A NUMBER. This is the one rule here that is about correctness rather than appearance.** A
truncated figure is not a shortened figure, it is a **wrong figure**, and this application exists to report
figures to people who act on them. `1,845,540.12` clipped to `1,845,5…` reads as a real and much smaller
number. **When a figure does not fit, the exits are: reduce unit precision, step the unit up (kWh to MWh),
or step the type size down. Never clip.** Applies to every figure, delta, count and percentage.

### ⚠️ The header rule, with Keith's TITLE CASE ruling and the divergence it creates

✅ **Ruled 2026-09-01: card titles are TITLE CASE.** Every card carrying important content has a header, and
the header is uniform.

```
--  face          >> the display face, Space Grotesk, weight 600
--  colour        >> `hue-sky-900` = #1F4173. Already consistent across the DS, so this is codified
--  size          >> by DENSITY, 18 / 15 / 13. Never by importance
--  case          >> TITLE CASE (Keith's ruling)
--  layout        >> title left, metadata right, one flex row, space-between. Already the DS pattern
--  overflow      >> one line, truncate
```

⛔ **THE DIVERGENCE, negated explicitly so nobody "corrects" it back.** Both measured DS card titles are
**sentence case** ("Capacity & generation"). **Keith ruled Title Case, which OVERRIDES the DS on every card in
the system.** This is deliberate. The DS will keep saying sentence case, so **a future reader who finds
sentence case in a template must NOT treat it as the standard.** DL-13 says bring the repo toward the Design
version; **this is a named exception to that, on Keith's ruling.**

⚠️ **And it does not contradict the prose convention.** Keith's writing rules bar title-case HEADINGS in prose
he sends. **A UI card header is a label, not prose.** The two rules coexist and neither is evidence about the
other.

✅ **The eyebrow gets ONE set of values**, ending the worst drift in the system: **11px, uppercase, weight 600,
letter-spacing 0.05em, `hue-ink-500` `#8A9199`.** ⛔ The `#B4BBC1` variant is untokenised and dies. Weight 700
and the 0.03em and 0.09em spacings are drift, not variants.

## ⭐⭐ GRIDS AND RESPONSIVENESS. Opened 2026-09-01 (day 77) from Keith's reference decks. PARTLY OPEN.

⚠️ **Status. The reference reading and the conflict with our own record are DONE. The app-side measurement is
NOT, so the grid itself is not declared yet.** Do not treat anything below as ruled except where marked.

### ⭐ Reference decks absorbed, and ONE of the three is the relevant one

Three sources: Adrian K (@uiadrian) on grid fundamentals, Jan Mraz (@janm_ux) on per-platform grid specs, and
ui.martin on grid terminology and benefits.

⛔⛔ **COWORK ERROR, CORRECTED BY KEITH 2026-09-01. Cowork called this product a "desktop app". IT IS A WEB
APPLICATION.** That is not a wording fix, it changes which reference applies and it changes the whole shape of
the convention.

**Why it matters.** A desktop app owns its window and can be designed on one canvas. **A web application is
delivered in a browser at an arbitrary viewport width and has to hold up across all of them.** So:

- ⛔ **No single frame is "the" design target.** 1440 is a canvas for drawing on, not a contract.
- ✅ **The grid must be a BREAKPOINT SYSTEM, not a grid.** A single column count is not an answer.
- ✅ **The app-shell structure still applies** (a nav rail, a header, a content area), which is what Jan's
  desktop-app column is really describing. **We take the shell structure from there and the multi-viewport
  obligation from the responsive device set.** Neither reference alone is our product.

⚠️ **Keep this correction visible.** "Desktop app" reasoning leads to a fixed canvas and a fixed column count,
which is exactly the wrong instinct for this codebase.

⛔ **The other reference distinction still holds and is separate: an APP-SHELL grid is not a MARKETING-SITE
grid**, and Jan gives both side by side:

| | Website Desktop | **Desktop App** |
|---|---|---|
| Frame | 1440 x 1024 | 1440 x 1024 |
| Side margin | **104** | **24** |
| Columns | **12**, stretch | **8**, stretch |
| Gutter | 16 | 16 |
| Nav | none | **240 fixed rail** |
| Content area | 1240 (Adrian's version, 100px margins) | **1200** |
| Header | none | **80 heading panel** |

⭐ **Ovanova is a web application with an app shell.** So the marketing-site grid, the 100 to 104px margins and
12 columns that most tutorials teach, is the WRONG reference. A marketing site spends its width on centred
prose. **A data application spends its width on data, which is why the app column drops to 24px margins and 8
columns and gives 240px permanently to a nav rail.** ⚠️ **But we take that as the shell's SHAPE at a wide
viewport, not as the product's fixed geometry**, because a web application has no fixed viewport.

**Jan's other two, recorded for completeness but NOT our platform:** iOS native 375 x 812, 24 margin, 16
gutter, 8 columns, with 44 status / 50 tab bar / 34 home indicator; Android 360 x 800, 24 margin, 16 gutter,
8 columns, with 52 status / 40 nav. ui.martin's device set is Desktop 1440x1024, Tablet 768x1024, Mobile
320x640, with 12 / 8 / 4 columns respectively.

### ⭐⭐ Adrian's LAST slide matters more here than his grid numbers

> *"When/if you're more experienced, you'll find yourself designing without any layout grids at all, using
> 4-8px spacing increments and auto-layout as your only source of truth."*

And earlier, on his own column grids: *"I use column grids as a quick reference but usually turn them off when
designing."*

⭐ **That describes what this codebase already is.** Tailwind has no column-grid primitive. Layout is flex and
grid utilities plus the spacing scale, which is auto-layout by another name. **So a 12-column or 8-column grid
declared here would be documentation that never appears in the code**, and it would be unenforceable and
undrifted-from only by luck.

✅ **The consequence for how this gets declared. A column grid is a REFERENCE for Keith and Claude Design. What
belongs in the repo convention is the part that actually renders:** the breakpoint set, the shell contract (nav
width, header height, content inset), the column COUNT per breakpoint as a grid-template, and the gutter as a
spacing value. **Declare the renderable half as rules and the column grid as a reference, and say which is
which.**

### ⚠️ What Adrian's other slides do and do not settle for us

- **8pt grid, 8 / 16 / 24 / 32 / 40 / 48 / 56 / 64.** ⛔ **Already superseded by today's spacing ruling**, which
  adopted Tailwind's stock 4px scale. Adrian's own caveat covers it, *"designers might sometimes use 4 points
  instead of 8"*. **Do not re-open the 8pt question.**
- **8pt against 5pt.** Moot. It is a Bootstrap-versus-fluid argument and this project is neither.
- **Row grids**, which he says are *"especially useful for designing complex web and mobile dashboard views"*,
  so nominally us. ⚠️ **But an 8px row grid IS just vertical rhythm on the spacing scale**, which today's
  ruling already provides. **Recorded as not-needed rather than skipped**, unless a real baseline problem shows
  up.
- **Terminology, from ui.martin and Adrian, adopted as the house words:** **margin** is the outer inset,
  **gutter** is the space between columns, **column** is the content track. Use these three exactly and do not
  call a gutter a margin.

### ⛔⛔ THE CONFLICT. Our shipped side margin is 8px. The app-grid reference says 24px.

⭐ **This is the one place the record already has a decision, and it was left explicitly reversible.**
`open-questions.md` item 9, settled 2026-08-02:

> *"AB#875 aligned the shell padding to the sidebar's real width, so content sits 8px from the sidebar edge,
> down from 24px, both gutters equal. Whether that looks right is a frontend design call, which is Keith's, not
> the CTO's. **The shipped 8px stands unless Keith changes it.**"*

⛔ **So the shipped inset is 8px on both sides and the desktop-app reference says 24px. That is a 3x
difference on the single most structural measurement in the product**, and the record anticipated Keith
revisiting it.

⚠️ **And it now also collides with today's card ruling.** Card densities set their own padding, compact 12,
standard and feature 18. **With an 8px shell inset, a compact card's content sits 20px from the viewport edge
and a feature card's sits 26px**, so the optical inset of content changes depending on which density happens
to be in that slot. **At 24px shell inset the same drift exists but is proportionally smaller.** Either way
**the shell inset and the card padding have to be ruled together, not separately.**

### ✅✅ RULED 2026-09-01 (Keith). The breakpoint system.

**Keith asked for breakpoints defined with components adapting BOTH size and content, then ruled all three
questions.** ✅ **1. Keep Tailwind's stock five.** ✅ **2. FULLY RESPONSIVE TO PHONE** (this overrides Cowork's
recommendation, see the scope note below). ✅ **3. Shell inset 24 / 16 / 12.**

✅ **On Keith's condition "as long as those are standard" — they are.** `sm` 640, `md` 768, `lg` 1024, `xl`
1280, `2xl` 1536 are Tailwind's documented defaults, unchanged in 3.4, and this project has no `screens`
override. **Nothing custom, nothing to learn, no config edit.**

**Kept because what was missing is not values, it is MEANING.**
Nobody has ever made a breakpoint decision here, so the values are already stock and already understood by
anyone who knows Tailwind. **Overriding them costs a config edit plus a learning tax on every future
contributor, for no gain if the stock thresholds land where the product's real thresholds are.** They do, see
the arithmetic below.

| | Tailwind | What it MEANS for this product | Content grid | Card band |
|---|---|---|---|---|
| `base` | < 640 | phone. Nav is a drawer or bottom bar | 4 col | 1-up |
| `sm` | 640 | large phone, small tablet portrait | 4 col | 1-up |
| `md` | 768 | tablet portrait. Nav still collapsed | 8 col | 2-up |
| `lg` | **1024** | ⭐ **the nav rail APPEARS here** | 8 col | 2-up |
| `xl` | 1280 | laptop. The design canvas lives here | 12 col | 3-up |
| `2xl` | 1536 | desktop. Full fleet tables fit | 12 col | 4-up |

✅ **The 4 / 8 / 12 content grid is reference-backed**, it is exactly ui.martin's column set for
mobile / tablet / desktop. The card bands are derived from it, a 12-col grid gives 4-up at 3 columns each, an
8-col gives 2-up at 4 each, a 4-col gives 1-up.

⭐ **Why the rail collapses below `lg`, derived arithmetic rather than taste.** With the reference 240px rail:
at 1024 the content area is **784px**, which carries 2-up comfortably. At 768 it would be **528px**, which
carries almost nothing. **So `lg` is where the rail can afford to exist, and stock 1024 is the correct
threshold without inventing one.**

⚠️ **AND A REAL AWKWARDNESS TO NAME. The design canvas is not a breakpoint.** 1440 sits between `xl` 1280 and
`2xl` 1536. **So drawing at 1440 in Figma means drawing the `xl` case only**, and `2xl` and `lg` go undrawn.
That is how a design that looks right in Figma ships broken on a 1536 monitor and on a 1280 laptop.
**Either the canvas set grows to three frames (1280, 1440 as a check, 1536) or the undrawn cases get
verified in the browser instead.** Keith's call, but it should be a call rather than an accident.

⛔ **THE TABLE PROBLEM, derived and NOT yet measured.** The fleet table needs about **1092px** (a known
`min-w-[1092px]` in the app). Add a 240px rail and 2 x 24px margins and it wants **~1380px of viewport**.
**So the main fleet table does not fit without horizontal scroll below roughly 1380**, which is above `xl` and
only comfortable near `2xl`. ⚠️ **Derived from a recorded width plus reference numbers, so Code must confirm
it.** If it holds, tables need a declared fallback below `xl` rather than a scrollbar.

### ⭐⭐ THE TWO-MECHANISM RULE. This is the architectural half and it resolves this morning's tension.

⛔ **The SHELL is viewport-driven. COMPONENTS are container-driven.**

```
--  MEDIA queries    >> the SHELL only. Nav collapse, page margins, the page-level column count,
                        route-level layout. The shell knows the viewport because it IS the viewport
--  CONTAINER queries >> COMPONENTS only. Card density, a card's internal layout, whether a chip row
                        wraps. A card does NOT know the viewport, it knows its slot
```

✅ **RULED EXCEPTION 2026-09-24 (Keith, DL-108), the power flow card's strip and picture read their own measured
width in script.** The strip's balanced column count and the picture's zoom below 440px are arithmetic a container
query cannot express. It is still container-driven, the component measures its own box and never the viewport, so
the split this rule protects holds. ✅ **Extended to height at 2xl, 2026-09-24 (Keith, at `a563da7`).** From `a563da7`, at 2xl only, it also reads its own measured HEIGHT, so the card ends level with the Inverter Status and Generation Purpose stack beside it. The breakpoint stays in the page grid, which sets `--power-flow-fit` on the card's cell, and the card only ever measures its own box. A 15rem floor sits on the picture region inside the card, never on the card, so a short stack cannot shrink the picture to nothing (Keith, 2026-09-24). **Why the split still holds.** The only media query is the page grid's, which is the shell's under this rule, and the card reads a custom property from its cell rather than a breakpoint. ⛔ **Scoped to that card.** The card's energy totals use container queries.

⛔ **Never set a component's internal density from a media query**, because the same card appears in a 4-up
band and a 2-up layout at the same viewport width. ⛔ **And never decide the shell from a container query.**
✅ **This is consistent with the card ruling made earlier today** and it is the reason both mechanisms exist
rather than one.

### ⭐⭐ CONTENT ADAPTATION. The priority ladder, which is what stops this becoming 40 improvised decisions.

**Keith asked for content to adapt, not just size.** Size adaptation is the table above. **Content adaptation
needs a mechanism, or every surface invents its own and the system is gone.**

✅ **The mechanism. Every multi-field surface declares ONE priority order for its fields, once. Each breakpoint
takes the top N.** A table with eight numeric columns declares the order 1 to 8; `2xl` shows eight, `xl` shows
five, `md` shows three, `base` shows two. **Dropping becomes deterministic and reviewable instead of a
judgement call per surface per breakpoint.**

⛔ **NOTHING IS EVER SILENTLY DROPPED. A field removed at a breakpoint must stay REACHABLE** by a row expand, a
detail view, or an explicitly scrollable variant. Hiding data to make a layout fit, with no way back to it, is
the failure this rule exists to prevent.

⛔⛔ **A STATUS OR FAULT FIELD IS PRIORITY 1 AND NEVER DROPS, AT ANY BREAKPOINT.** This is a correctness rule,
not a layout rule, and it is the same class as "a toast is never the only carrier". **In a monitoring product,
hiding a fault to fit a phone is a safety failure.** If the layout cannot hold the fault indicator, the layout
changes, not the indicator.

⭐ **The fully-responsive ruling makes the priority ladder MANDATORY rather than useful.** Under
"usable but not optimised" a table could have got away with a scrollbar. **Under fully-responsive-to-phone
every multi-field surface has to survive a 320px viewport, which is impossible without a declared priority
order.** So the ladder is now the mechanism the whole ruling rests on, not an optional nicety.

### ✅ The shell inset, RULED 2026-09-01 (Keith). It replaces the 8px.

```
--  lg and above   >> 24px
--  md             >> 16px
--  base and sm    >> 12px
```

⛔ **This supersedes the shipped 8px and closes `open-questions.md` item 9**, which said the 8px stands unless
Keith changes it. **He has changed it.** The 8px was chosen to align with the sidebar's edge (AB#875), which is
a reason about the sidebar rather than about how content reads.

⚠️ **It is ruled TOGETHER with card padding, deliberately.** Card densities carry 12 / 18 / 18 of their own, so
at `lg` and above a compact card's content sits 36px from the viewport edge and a feature card's 42px. That
residual drift is accepted; what is not accepted is the 8px case where the shell contributed almost nothing and
the card padding was the only inset.

### ⛔⛔ CORRECTED 2026-09-02. PETER ASKED FOR MULTI-DEVICE ON DAY 3. The scope note below was WRONG.

⛔ **The claim "Peter has never scoped mobile" is false and was never checked against the channel.** Primary
source, Peter in the Slack DM, **2026-06-19 13:35 CST, day 3 of the engagement**, verbatim:

> *"Working in here, for the first areas I am looking for evolution of the design, ensuring they work well,
> **they look good across multiple devices**, and we can collaborate on the new areas"*

**So multi-device was one of three things he named as what he wanted from the first areas, at the outset.** It
is not new scope and Keith is not asking for permission.

⚠️ **What IS genuinely open is how far "multiple devices" goes.** It could mean desktop plus tablet or it
could include phone, and that ambiguity is the only thing the conversation needs to settle. **The question
becomes how far, not whether.**

⭐ **Second primary-source find, same read. The visual pass was already PROMISED to Peter on 2026-08-17.**
Keith told him A1 is *"complete on function but not fully furnished yet, there are visual inconsistencies and
spacing stuff across screens that i already know about, the polish pass was always the sprints closing step and
the scope growth ate it"*, that he would *"run one visual pass over the merged whole as the first piece of the
a1 remainder"* once the queue landed, and invited Peter to send anything he spotted. **The queue landed
2026-09-01.** So the retrofit is a promise arriving on schedule rather than a new initiative.

⚠️ **Consequence for DL-59 worth carrying. The A1 half of the retrofit was already inside the $1k bundle** as
the polish pass Keith scoped and priced. So absorbing it is not a concession there, it is the deal. What goes
beyond the promise is writing the conventions down as a system, which is the part nobody asked for.

⛔ **The Notion Work Knowledge Base has NO independent record of Peter's day-3 statement**, checked. ⚠️ **That KB is RETIRED as of 2026-09-12 under DL-77, so do not go back to it to re-check this or anything else. The finding stands as written and the reasoning below is the durable half.** It is
reconstructed from the wiki, the wiki never captured it, so the whole derived chain lost it. **Slack is the
only place it lives. Search the channel, not the digest, for what a person said.**

Historical text follows, retained so the correction is legible.

### ⛔⛔ SUPERSEDED SCOPE NOTE. Fully-responsive-to-phone is a REAL SCOPE INCREASE and Peter has not agreed it.

✅ **Keith ruled fully responsive to phone and said he will raise it with Peter. Recorded now precisely because
it is not yet agreed.**

⚠️ **What it costs, stated plainly so the conversation with Peter has a basis.** It is not a convention, it is
a body of work. Every multi-field surface needs a declared priority ladder. Every table needs a card or list
fallback below `xl`. The nav needs a drawer or bottom-bar mode. And the app's current responsive coverage is
**unmeasured but suspected to be near zero**, since `tailwind.config.ts` has never had a `screens` decision and
a recorded AB#950 defect is already a horizontal-overflow failure.

⛔ **It does NOT belong inside task 899.** 899 is the design-token and convention sweep. **Full phone
responsiveness is its own scope and wants its own work item once Peter has seen it**, otherwise it disappears
into a task that was never sized for it. ⚠️ **Keith owns the board, so this is his to file, and it should not
be filed before the Peter conversation** or the board asserts a scope Peter has not agreed.

⚠️ **Cowork recommended "usable but not optimised" and was overruled.** Recorded without re-arguing it. The
reasoning for the recommendation was that this is a desk-used fleet console and Peter has never scoped mobile;
Keith's counter is that the decision should be recorded now and negotiated after, which is a defensible order
of operations.

### ✅ MEASURED 2026-09-01 on `ee76dc3`. Seven reads, and one of them is a shipped defect.

⛔⛔ **THE HEADLINE. BELOW `lg` THERE IS NO NAVIGATION AT ALL.** Not a convention gap. A shipped defect, and it
predates today's ruling.

Three facts compound into it:

1. **The rail is hidden below `lg`** — `Sidebar.tsx:74`, `hidden lg:fixed lg:flex`.
2. **The mobile drawer exists but CANNOT BE OPENED.** `Layout/index.tsx:23` has the `Dialog … lg:hidden`, but
   **`setSidebarOpen(true)` is never called anywhere in `app/**`.** The only references are the
   `useState(false)` initialiser and the close button.
3. **Even if it opened, it is empty.** The `DialogPanel` contains only the close button. The nav content is
   commented out, `{/* <HamburgerMenu/> */}` at `Layout/index.tsx:64`, with the import commented at `:6`.
   `HamburgerMenu.tsx` exists, 79 lines, and **is imported nowhere.**

⛔ **So at every viewport below 1024px a user can only reach whatever route they landed on.** No rail, no
working drawer, no drawer contents. ⚠️ **This is a Bug and it is Keith's to file. It is NOT part of the
responsiveness scope conversation with Peter**, because the product is already shipped in this state and it
fails independently of whether phone support is agreed.

### Responsiveness is a handful of files, and 63% of it is in the wrong half

318 tsx/ts files, tests excluded. **40 files (12.6%) carry any responsive prefix.**

| Prefix | Occurrences | Files |
|---|---|---|
| `sm:` | **178** | 27 |
| `2xl:` | 29 | 3 |
| `lg:` | 23 | 13 |
| `md:` | 18 | 11 |
| `xl:` | 4 | 3 |
| `max-*`, `min-[Npx]`, `max-[Npx]` | **0** | — |

✅ **Both zeros carry positive controls** and are real. ✅ **No shadow breakpoint set**, confirmed: no `screens`,
no presets, no second config, and all nine `@media` blocks in `app/tailwind.css` are `prefers-reduced-motion`
(6) and hover/pointer (3). **Zero width-based media queries in CSS.**

⛔ **Against the ruled two-mechanism split, 160 of the 252 occurrences (63%) are VIOLATIONS** — media queries
doing component work, which should be container queries.

| | Files | Occurrences |
|---|---|---|
| Shell / route (`routes/`, `root.tsx`, `containers/Layout/`) | 11 | 92 |
| **Component (violations)** | **29** | **160** |

Heaviest: `BatchTimeSelectionModal` (25), `AppointmentDetailModal` (17), `BatchCommandsModal` (13),
`CreatePlant` (12), plus `sm:` padding inside `Input`, `StatBox` and five `Add*Modal` files.

⚠️ **`sm:` alone is 178 of 252.** So most "responsive" work here is a single small-screen tweak on a modal, not
a system. **Code's verdict, quoted: "a handful of files, not a system … a body of work, not a tidy-up."**

### The shell, measured. The 8px is confirmed and there is no breakpoint-varying inset at all.

| | Value | Where |
|---|---|---|
| Nav rail width | **272px** (`lg:w-68`) | `Sidebar.tsx:74` |
| Rail visibility | hidden below `lg`, appears at 1024 | `Sidebar.tsx:74` |
| Shell offset for the rail | `lg:pl-68` = 272px, exactly the rail | `Layout/index.tsx:71` |
| Content padding | **`px-2` = 8px both sides, `py-2` = 8px** | `Layout/index.tsx:73` |
| Header | sticky, **no explicit height**, `px-4 sm:px-6 lg:px-8` | `Navbar.tsx:137` |
| Max-width / centring | **none, full-bleed** | no `mx-auto`/`max-w-*` in Layout or root |

⚠️ **The rail is 272px, not the reference's 240.** So the `lg` arithmetic tightens: at 1024 the content area is
**752px**, not 784. Still carries 2-up (about 344px per card at 24px margins and a 16px gutter), so **`lg` stays
the correct rail threshold.**

⛔ **`px-2` is UNCONDITIONAL.** The shell has never had a breakpoint-varying inset, so the ruled 24 / 16 / 12
is three new declarations rather than an edit to one. Gap at `lg` is 16px.

⚠️ **272px is 26.6% of a 1024 viewport** against 19% of 1440. **Open question worth a ruling: should the rail
narrow or go icon-only at `lg` and take its full 272 only at `xl` and above.**

### Column counts. Nothing implements the ruled 12-column grid.

- **Fixed `grid-cols-N`, 45 total:** `1`×19, `2`×17, `3`×7, `7`×1, `4`×1. **Dominant is 1 and 2, 36 of 45.**
- **Responsive `grid-cols-N`, 20 total** across nine combinations. **So grids do change at breakpoints, but only
  20 times in the whole app.**
- ⛔ **Arbitrary templates, 42 uses, and 38 of them are PX-LOCKED FIRST COLUMNS**:
  `grid-cols-[300px_1fr]`×22 and `grid-cols-[180px_1fr]`×16. **These do not reflow at all.** ⚠️ **At a 320px
  viewport a 300px first column leaves 20px for the rest.** This is a bigger obstacle to phone support than the
  tables are.
- ⛔ **`flex-wrap` pseudo-grids: 49 occurrences across 32 files, MORE than the 45 fixed `grid-cols`.** So the
  commonest multi-item layout in the app **has no column count at all**, and it is the population the ruled
  column grid has to convert.
- ⚠️ **The widest grid declared anywhere is `grid-cols-7`. Nothing reaches 12.** The ruled 12-column `xl` grid
  is currently aspirational.

### Five fixed widths force page-level horizontal scroll, and the derivation was right

**11 occurrences at or above 600px, 4 distinct.** `max-w-*` caps rather than forces, so the harmful set is the
**five `min-w-[1092px]`**: `EventsTable.tsx:393`, `GridGuardian.remote-update/route.tsx:10`,
`GridGuardian.Set-Record/route.tsx:10`, `GridGuardian.update-record/route.tsx:10`, `Notifications/route.tsx:10`.

⛔ **All five are the harmful shape, a ≥600px fixed width NOT inside an `overflow-x` container.** Four of the
five files contain no `overflow-x` at all. ⭐ **The fifth, `EventsTable`, was settled by indentation rather than
assumed**: its `overflow-x-auto` at `:248` sits at indent 10 inside a different component, while the
`min-w-[1092px]` at `:393` is at indent 4, the outermost element of the exported component. **It wraps the
scroll container, not the reverse.**

✅ **Six `overflow-x-auto` containers exist and all six are tables.** ⛔ **And nothing masks overflow at the
document level** (Read 6), so these five **visibly scroll the page sideways** rather than being clipped.

⭐ **Cowork's derived estimate was right.** It predicted the fleet table wants ~1380px of viewport; measured, it
is **1092 + 272 rail = ~1364px**. **So five routes already scroll horizontally at `xl` (1280).** Not a phone
problem. A laptop problem, today.

### AB#950's overflow defect is structurally FIXED, and it exposed an inconsistency

`DeviceInventoryList.tsx` on `ee76dc3`: **no fixed or min-width constraint** (only `w-full` at `:59` and `:94`),
**inside `overflow-x-auto`** at `:93` wrapping `table-auto w-full` at `:94`, Actions still last (`:97`), nothing
pinned. ✅ **The mechanism that caused the August defect is gone**, and the Actions column is reachable by
scroll. ⚠️ **The residual behaviour needs a browser and Code said so rather than guessing.**

⛔ **The inconsistency it surfaced. `ComplexTable` PINS its actions column** (`sticky right-0 z-20` on the
header at `:405`, `z-10` on the cell at `:450`) **and is the ONLY one of the six tables that does.** ✅ **New
rule: an actions column is pinned in every table, not one.** An action you have to scroll to find is an action
users stop using.

### The viewport floor is correct and needs no change

✅ `root.tsx:183` ships `<meta name="viewport" content="width=device-width, initial-scale=1" />` — **no
`maximum-scale`, no `user-scalable=no`, so pinch-zoom is not locked.** ✅ No `min-width` on `html`, `body` or the
outermost element. ✅ No document-level `overflow-x: hidden`.

### ✅✅ THREE MORE RULINGS, from the measurement. Keith 2026-09-01.

```
--  the actions column  >> PINNED in EVERY table (`sticky right-0`), not one. `ComplexTable` already does
                           it (:405 header, :450 cell) and is the only one of six. An action you have to
                           scroll to find is an action people stop using
--  the rail at `lg`    >> ICON-ONLY at `lg`, full 272px at `xl` and above. 272 is 26.6% of a 1024
                           viewport against 19% of 1440, so the wide-viewport width is the wrong width
                           for a narrow one
--  px-locked templates >> ⛔ A grid template may NOT lock its first column in px below `lg`. The 38
                           `grid-cols-[300px_1fr]` and `[180px_1fr]` uses become a fraction or a
                           `minmax()`. **This is the single highest-leverage change for phone support**,
                           since a 300px first column at a 320px viewport leaves 20px for everything else
```

### ✅ Read 7 came back CLEAN, and Code's caveat on it is the useful part

**No status, fault, alert or severity field is hidden at any breakpoint.** Only two hide-plus-breakpoint
instances exist in the entire app and both are navigation chrome, the drawer (`Layout/index.tsx:23`) and the
rail (`Sidebar.tsx:74`). ✅ Positive control fired, and a second control confirmed the fields exist in quantity
to be hidden (status 667, fault 177, severity 81, alert 2).

⭐ **Code's caveat, quoted, and it is the honest reading: "the clean result here is a consequence of the coverage
gap rather than of discipline."** Nothing is dropped at a breakpoint because almost nothing responds to
breakpoints. ⚠️ **So the priority ladder has no violations to remediate, and that is not reassurance. It means
the ladder is being built onto a blank surface**, which is easier but carries no existing precedent to follow.

## ⭐⭐ ALIGNMENT AND SPACING. Measured 2026-09-01 (day 77), and the token side is empty.

### ⛔ First correction: the agent skills live in `.agents/skills/`, NOT `.claude/skills/`

`.claude/skills/` holds **symlinks** to `.agents/skills/`, with one exception: **`smooth-shadow-ring` is a real
directory that exists ONLY in `.claude/skills/`**, which is consistent with it being the inert one. The seven
real skills are `animation-vocabulary`, `apple-design`, `emil-design-eng`, `find-animation-opportunities`,
`improve-animations` (plus `AUDIT.md` and `PLAN-TEMPLATE.md`), `pick-ui-library`, `review-animations` (plus
`STANDARDS.md`). **Cite `.agents/skills/` when pointing anyone at them.**

### ⛔⛔ THE REPO HAS NO SPACING SCALE AND NO RADIUS SCALE. Both token files are junk drawers.

`theme/spacing.ts`, in full, three keys:

```
15: "60px"   ·   29: "116px"   ·   68: "272px"
```

`theme/borderRadius.ts`, in full, three keys:

```
"2.5xl": "20px"   ·   "2lg": "10px"   ·   "4xl": "43px"
```

⛔⛔ **COWORK ERROR, CORRECTED 2026-09-01 BY MEASUREMENT, AND IT WAS ABOUT TO BREAK THE SIDEBAR.** Cowork wrote
that all three `spacing` keys are Figma leftovers that "can go when 899 touches the file". **`68: "272px"` IS
LOAD-BEARING. It is the nav rail's width.** `containers/Layout/Sidebar.tsx:74` uses `lg:w-68` and
`containers/Layout/index.tsx:71` uses `lg:pl-68` to offset the shell by exactly the rail width. ⛔ **Deleting
`68` breaks the sidebar and the shell offset together.** `15: 60px` and `29: 116px` remain unverified and may
well be junk, but **they must be checked the same way before anything is removed, not assumed.**

⭐ **Standing lesson. "This token file looks like junk" is a hypothesis about the file. Whether a key is used is
a fact about the CALL SITES**, and Cowork had not looked at any. Same shape as the four-tier ladder, a
confident conclusion from a partial view.

⭐ **The rest are one-off pixel-pushes.** `60`, `116` and `43` look like Figma-export leftovers.
**So everything spatial in this app runs on Tailwind's stock 4px scale plus arbitrary values**, and today's
radius bands have **no token home at all** apart from `2lg` = 10px, which happens to be the inset-tile and
compact-card step. ⚠️ **9px, the DS Button's `md` radius, is not in Tailwind's scale and is not a token.**

✅ **The queue gate is clear, so both files can now be filled properly under task 899**, alongside
`theme/elevation.ts`. **That is the same change, not three changes.**

### ⛔⛔ RETRACTED. There is no four-tier ladder. Cowork inferred one from a partial read and the exact count killed it.

⛔ **Cowork read 400 of 830 `gap` declarations, saw four clusters, and wrote them up as a "relationship
ladder". The full histogram shows a SMOOTH RAMP, not clusters.** The tiers were an artefact of reading a
subset. Recorded as a retraction rather than quietly replaced, because the ladder was a good-sounding idea and
it would otherwise come back.

**The real histogram, measured 2026-09-01 on `chore/ds-templates-reference` at `00b115e`, 83 real templates
with the 17 galleries excluded. 629 declarations, 25 distinct values.**

| px | n | px | n | px | n |
|---|---|---|---|---|---|
| **6** | **89** | 12 | 61 | 13 | 9 |
| **8** | **79** | 16 | 39 | 2 | 7 |
| **7** | **79** | 5 | 37 | 20 | 4 |
| **10** | **65** | 14 | 27 | 28 | 3 |
| **9** | **62** | 11 | 21 | 30, 24 | 2 each |
| | | 18 | 14 | 1 | 2 |
| | | 4 | 12 | 64, 40, 3, 26, 17 | 1 each |
| | | 22 | 10 | | |

⭐ **5 through 12 carries 472 of 629, or 75%.** It is a continuous ramp with no gaps and no clustering.
**25 distinct values across 629 declarations with no clustering means nobody was choosing from a set.**

⛔ **SO THE CONCLUSION FLIPS. The DS has no spacing system either.** It has a habit, small gaps in the 5 to 12
range, and 25 values. That is the same finding as buttons, radius, sizes and elevation: **a house style with no
scale behind it.**

⚠️ **Two smaller corrections in the same read.** The gallery split earned its keep (38px exists only in
galleries) but Cowork's guess that 40 and 64 were gallery scaffolding was **wrong** — both are in real
templates, one occurrence each, genuine one-off outliers. And the grand total across all forms is **830, not
817**, because `row-gap` and `column-gap` were being caught by a `gap:` substring. Three `row-gap`/`column-gap`
uses exist, plus **29 two-value `gap: R C` shorthands**, dominated by a 16px row gap against 18 to 26px
columns, which IS a deliberate two-axis decision and the one piece of real structure in the set.

### ⛔⛔ THE APP SIDE IS WORSE THAN THE BUTTONS WERE, and this is the answer to Keith's complaint

Measured on `dev` `ee76dc3`, `app/**`, tests excluded.

| Family | Uses | Distinct | Scale | Arbitrary |
|---|---|---|---|---|
| `gap-*` | 320 | 39 | 28 | 11 |
| `space-x/y-*` | 189 | 18 | 18 | 0 |
| padding | 1051 | 98 | 74 | 24 |
| margin | 516 | 69 | 55 | 14 |

- **44 distinct spacing values in px**, and **22 of the 44 are off the 4px grid**, including four **sub-pixel**
  values (`2.5`, `3.5`, `4.5`).
- **140 arbitrary spacing uses across 49 distinct values.** Top: `px-[9px]`×10, `gap-[7px]`×8, `gap-[25px]`×8,
  `px-[10px]`×7, `mr-[30px]`×7. Two are `rem` (`mt-[3.5rem]`, `mt-[2rem]`), one is negative (`mt-[-6px]`).
- ⛔⛔ **472 of 855 flex/grid containers (55.2%) declare NO gap and NO space utility at all.** Worst offenders
  `BatchCommandsModal` (39), `BatchCommands` (15), `ModelSettings` (12), `StatusDonut` (11).

⭐ **That last figure IS the complaint.** Keith reported cards reading as inconsistent, sometimes too thick,
sometimes too empty. **More than half the containers in the app never make a spacing decision**, so their
children sit at whatever the default is. **Buttons were 17 ad hoc combinations. Spacing is 44 values, half
off-grid, and a coin-flip chance any given container spaces its children deliberately.** The complaint was
understated.

### ⭐ ALIGNMENT, measured for the first time. Four findings and two are defects.

⛔ **Numeric columns are LEFT-ALIGNED in all three tables.** `ComplexTable`'s `<th>` carries no align class at
all (so browser-default left) and its `<td>` carries none either. `EventsTable` (:256) and
`DeviceInventoryList` (:100) declare `text-left` explicitly.

⛔ **`ComplexTable` is the worst case and it is the fleet's main table.** `PlantsList` feeds it **eight numeric
columns** — `dc_capacity_kw`, `ac_continous_capacity_kw`, `bess_kwh`, `total_pv_output`, `total_dc_to_ac`,
`total_charge`, `total_ac_charge`, `total_discharge` — each rendered as `${value} kW` or `kWh`, **every one
left-aligned with no alignment class anywhere.** Columns of figures that cannot be compared down the column.

⚠️ **`text-right` exists 4 times in the whole app and NOT ONE is numeric.** `PlantInfoWindow:155` (a popover
text value), `BatchCommands:474` and `BatchTimeSelectionModal:749` (hour labels in a time grid),
`PlantsTimeline:143`. Against `text-left` 51 and `text-center` 35.

⛔ **The label/value idiom is `justify-between` (160 uses), not a grid** (`grid-cols-2` 26, `ml-auto` 6, `<dl>`
5). **`justify-between` pushes the value to its own container's right edge, so values share an edge only when
the containers are identical widths.** In `PlantHeader/CapacityFacts.tsx:78,104` and `PlantPhotosCard.tsx:12`
the rows sit in independently sized cards, **so the value edges do not line up across rows.** ⭐ **That is a
structural ragged edge, not a missing class**, and no amount of alignment utilities fixes it.

⚠️ **44 of 115 icon-plus-label flex rows (38%) have no `items-center`**, which is the commonest optical
misalignment and reads as a wobble down a list. Concentrated in `StatusDonut` (5), `PlantHome/index.tsx` (3),
`ViewToggle` (2), `FleetPlantCards` (2), `AppointmentDetailModal` (2), the four Configuration list files, plus
`AlertsList:190`, `EventsTable:163`, `CapacityFacts:40`, `PlantHeader/index.tsx:48`.

### ⛔⛔ TABULAR FIGURES. Cowork predicted zero and was WRONG, and the truth is a worse shape than absence.

**`tabular-nums` appears 27 times in `app/**` across 10 files, and 154 times in `design/templates/`.** So the
convention exists.

⛔ **But it is ZERO in every table.** `ComplexTable`, `PlantsList`, `EventsTable`, `DeviceInventoryList`,
`UtilityTable` — all zero.

⭐ **Every one of the 27 sits on a card, badge, donut or alert row**, all DS-era components: `StatusDonut` (3),
`PlantCard` (2), `StatCard` (2), `CoverageQualifier` (2), `AlertsList` (2), `FleetPlantCards` (2),
`AlertStripRow`, `PreviewCard`, `StatusBadge`, `BatchPlantsTable`.

⛔ **So the exact surface that needs tabular figures has none.** `ComplexTable` renders eight numeric columns
with proportional digits. **This is a split convention pointing the wrong way, which is worse than an absence
because it looks handled.**

⛔ **AND COWORK'S FIRST RECOMMENDATION WAS TOO NARROW. Corrected against the house glossary.** It said tabular
figures are "mandatory on a column, optional on a single figure". `animation-vocabulary` declares:
**"Tabular numbers — Fixed-width digits so numbers don't shift around as they change. Essential for tickers,
timers, and counters."** ⭐ **The house test is whether the digits CHANGE, not whether they sit in a column.**
In this app the card figures are live and websocket-fed, so a single figure that updates in place shifts its
own width as it changes, which is the exact defect the glossary names.

✅ **So the rule is: tabular figures are REQUIRED wherever digits change in place OR sit in a column.** That
covers the tables (columns) and the live card figures (changing), which together is almost every figure in the
product. The 27 existing declarations are therefore correctly placed and merely incomplete, not misplaced.

⛔ **One thing this does NOT license, and the same skills prohibit it.** `find-animation-opportunities`, section
4: **"Data the user is trying to read or act on should not move for style."** So a **number ticker** or a
**text morph** on a changing figure is REJECTED, even though `animation-vocabulary` names both. Tabular digits
stop a figure from shifting; they are not permission to animate it. A live figure changes value without
animating.

✅ **RULED EXCEPTION 2026-09-24 (Keith, DL-108), the digit morph on the Overview power flow card.** Keith asked
for continuity when the card's values update, was offered this rule's cross-fade as the compliant default, and
chose the morph. **Why it does not break the rule's purpose.** The rule protects a figure someone is reading. The
morph moves only the digits that changed, so the reader sees WHICH part changed rather than the whole figure
redrawing, and it settles in 200ms. Only the digits that changed move, 0.45em of travel with a 2px blur over 200ms on the strong ease-out, rising for an increase and falling for a decrease, 30ms stagger per changed digit, capped at 90ms so a whole figure settles by about 290ms. Tabular figures throughout. Reduced motion becomes a 200ms cross-fade with no stagger. Screen readers hear the whole value once. CSS keyframes only, no animation package. ✅ **Ruled by Keith 2026-09-24 after the motion review.** The digits line up on the decimal point, so the point never moves when the number of decimals changes, and the shared number formatter is not touched. A value's first real reading, including one replacing a `--`, appears without animating, so only a later change morphs.
⭐ **Keith approved it as THE pattern for a value that changes while the user watches**, not as a one-off. He
asked for a work item to carry it to the app's other live numbers where that applies. ⛔ **At the ruling only one
other surface is known to update values in place**, the Equipment tab's small flow panel on the inverter socket.
Everything else changes on load, where a morph never plays. So it stays inside `AB#944` until a census of live
numbers shows more, and a value that only changes on load never morphs.

⚠️ **AND IT MAY ALL BE INERT. UNRESOLVED, and it is a 10-second check Keith can do.** The app self-hosts a
**variable, latin-subset Space Grotesk** (`@font-face` at `app/tailwind.css:1-10`,
`/fonts/space-grotesk-latin-variable.woff2`, `font-weight: 300 700`, 22,288 bytes, brotli-compressed).
**Static inspection cannot see inside a brotli-compressed woff2, so the absence of a `tnum` tag in a raw scan
proves nothing.** ⛔ **If the subset does not ship `tnum`, all 27 existing `tabular-nums` declarations are
silently doing nothing.** The check: devtools on any `StatCard` figure, confirm computed
`font-variant-numeric: tabular-nums`, then toggle it. **If digit widths do not visibly shift, the feature is
not in the font.**

⚠️ **And two of the three tables do not even render in the display face.** `ComplexTable` and
`DeviceInventoryList` carry zero `font-display` uses, so their figures render in the **inherited sans**.
`EventsTable` has 4. **So for two tables the tabular question is about the inherited stack, not Space Grotesk.**

### px against rem, measured. The type values are the live risk, not the spacing.

**528 px arbitrary values in `app/**`, 182 distinct.** Against **17 rem arbitraries**, so px outnumbers rem
about **31 to 1** in arbitrary values.

| Category | Uses |
|---|---|
| dimension (`w`/`h`/`min-*`/`max-*`/`size`) | 220 |
| spacing | 138 |
| **type (`text-`/`leading-`/`tracking-`)** | **122** |
| radius | 38 |
| other, position | 10 |

Top values: `text-[12.5px]`×31, `text-[13px]`×15, `text-[11.5px]`×14, `text-[11px]`×13, `h-[52px]`×13,
`text-[12px]`×12.

✅ **No explicit root `font-size` anywhere.** The single `font-size: 13px` in `app/tailwind.css:422` is scoped
to an avatar rule, not `html` or `:root`. **So `rem` means the browser default and user font scaling works
today.** ⛔ **Which makes the 122 px TYPE values the live accessibility risk — they will not scale at all.**

⛔ **A CONCRETE BUG, not a convention issue.** `app/components/Button/index.tsx` hard-codes
**`min-w-[128px]` on five variants around a text label**, so at an increased type size the label overflows a
fixed box. **202 px-locked dimensions hold text in total**, 90 distinct, including `h-[52px]`×13 and
`h-[48px]`×6 as row heights and `min-w-[1092px]`×5 and `min-w-[500px]`×5 on table containers.

### ⭐ THE GOVERNING PRINCIPLE, from `apple-design` rather than invented

> **"Proximity implies relationship."** (`apple-design`, section 16, Grouping & mapping.) And from the same
> section, **"if you need a label to explain a control, the mapping is weak."**

⭐ **So spacing is not decoration and it is not rhythm for its own sake. It is the channel that says which
things belong together.** ⚠️ **The retracted four-tier ladder was an attempt to say the DS already encoded
this. It does not.** The principle stands on its own and has to be imposed rather than extracted, which is the
opposite of how the interaction contract went.
The skill's *Simplicity* principle says the same thing from the other end, **use hierarchy (order, spacing,
contrast) so the most important thing is the most obvious**, and its *Craft* principle sets the bar:
**"every spacing, timing, and alignment value is a deliberate choice you can defend."**

### ⛔ TWO CONSTRAINTS FROM THE SKILLS THAT BITE DIRECTLY

⛔ **`emil-design-eng`, Performance Rules: "Only animate transform and opacity. Animating `padding`, `margin`,
`height`, or `width` triggers all three rendering steps."** ⚠️ **This CONTRADICTS what was written earlier today
for the banner**, which says it animates its own height on enter. **Resolved rather than left standing: a
height animation is permitted ONLY for a one-shot layout reveal that a person triggers or a condition fires
(a banner, an accordion), never for anything continuous, gesture-driven, or repeated across a list.** A banner
entering once is not a 60fps concern. ⚠️ One ruled exception exists, the Control dropdown's revealing rows,
recorded under interaction rule 2 above with its scope and mitigation. ⛔ **Spacing itself is NEVER animated** — no animated `gap`, no animated
`padding`, no reflow-on-hover. That was already prohibited by the interaction contract's no-layout-shift rule
and now it has a performance reason as well as a design one.

⛔ **`apple-design`, section 15: "Respect the user's text-size setting. Scale layout WITH the text — spacing in
`rem`/`em`, not fixed px — so a larger font doesn't break the layout."**

⭐ **CORRECTION, and it makes this far cheaper than first stated.** Cowork first wrote that fixing this means
switching a whole system to `rem`. **That is wrong.** `tailwind.config.ts` was read directly and **every token
family sits under `theme.extend`**, so **Tailwind's stock scales survive intact** — and Tailwind's default
spacing scale is **already in `rem`** (`4` = `1rem`), as is its default type scale (`text-sm` = `0.875rem`).

✅ **So the app is ALREADY mostly rem-based through the defaults.** The px divergence is only in two places,
the **arbitrary values** (`gap-[7px]`, `text-[13px]`, `rounded-[9px]`) and the **six custom px tokens**
(`spacing` 60/116/272, `borderRadius` 20/10/43, `fontSize` `size-13` = 13px). ⛔ **The whole custom type scale
is ONE key.** `theme/fontsize.ts` is `{ "size-13": "13px" }` and nothing else.

⭐ **Which reframes the ruling.** It is not "convert the system to rem". It is **"express the new tokens in rem
and stop minting px arbitrary values"**, which is a much smaller decision and mostly forward-looking.

## ✅✅ ALIGNMENT AND SPACING, RULED 2026-09-01 (Keith). All five.

### 1. ✅ THE SPACING SCALE IS TAILWIND'S OWN. Mint NO new spacing tokens.

⛔ **This REVERSES Cowork's first recommendation, which Keith had already approved, because the basis
dissolved.** The first version said to add the DS's odd steps (7, 9, 11, 13, 18, 22) to `theme/spacing.ts` so
its rhythm became tokens. **The full histogram showed there is no rhythm** — a smooth ramp over 25 values with
no clustering — so tokenising it would have preserved noise. **The retraction is recorded above and as an
incident.**

✅ **The ruling. Use Tailwind's stock scale and round the off-grid values onto it.** The arithmetic that makes
it safe:

- The DS's on-grid values (6, 8, 10, 12, 14, 16) already account for **360 of 629** declarations and are all
  existing utilities.
- The off-grid ones (7, 9, 5, 11, 18, 22, 13) account for **232**, and **every one sits within 1 or 2px of an
  existing step.**

⛔ **AND A COWORK ERROR CORRECTED IN THE SAME BREATH.** Cowork warned that "1px differences are real at these
sizes, especially inside chips and badges". **That is true of a RADIUS on a small pill. It is false of a GAP.**
7 against 8 between an icon and its label is not perceptible. The radius argument was misapplied to spacing.

✅ **So `theme/spacing.ts` gains nothing.** Its three junk values (`15: 60px`, `29: 116px`, `68: 272px`) can go
when 899 touches the file. ⚠️ **Radius is the exception and DOES need tokens**, because 9px is genuinely absent
from Tailwind's scale and the shape bands need naming. That lands in `theme/borderRadius.ts`, not
`theme/spacing.ts`.

### 2. ✅ NEW TOKENS IN `rem`. Stop minting px arbitrary values. No migration.

Sourced to `apple-design` section 15, "spacing in `rem`/`em`, not fixed px — so a larger font doesn't break
the layout".

✅ **Forward-looking only.** Existing px arbitraries get replaced when something touches them, never swept.
The measurement makes the priority obvious: **528 px arbitraries against 17 rem, and 122 of them are TYPE**
(`text-`, `leading-`, `tracking-`). ✅ No explicit root `font-size` exists anywhere, so user text scaling
works today, which means **those 122 are the live accessibility defect. They will not scale at all.**

⛔ **One concrete bug falls out of this and it is a Bug, not a convention.**
`app/components/Button/index.tsx` hard-codes **`min-w-[128px]` on five variants around a text label**, so at
an increased text size the label overflows a fixed box. 202 px-locked dimensions hold text in total.

### 3. ✅ TABULAR FIGURES ARE REQUIRED WHEREVER DIGITS CHANGE IN PLACE **OR** SIT IN A COLUMN.

Widened from Cowork's first version (columns only) against the house glossary's own test. Full reasoning and
the ticker prohibition are in the tabular-figures section above. ⚠️ **Blocked on one 10-second check Keith
owns**, whether the self-hosted Space Grotesk subset actually ships `tnum`, because if it does not then the 27
existing declarations are already inert.

### 4. ✅ NUMERIC COLUMNS RIGHT-ALIGN. Text columns left-align. Headers match their column.

⛔ **This is a defect fix, not a preference.** All three tables left-align their numeric columns today, and
`ComplexTable` carries **eight numeric columns from `PlantsList` with no alignment class anywhere**.
`text-right` appears **4 times in the whole app and not one instance is numeric.** Figures with varying digit
counts cannot be compared down a column when they are left-aligned, whatever the font does.

### 5. ✅ A SHARED VALUE EDGE NEEDS A GRID. `justify-between` is for a standalone row only.

⛔ **The current idiom cannot deliver alignment and no class fixes it.** `justify-between` (160 uses against
`grid-cols-2` at 26) pushes each value to **its own container's** right edge, so values share an edge only when
the containers are identical widths. In `PlantHeader/CapacityFacts.tsx:78,104` and `PlantPhotosCard.tsx:12` the
rows sit in independently sized cards, **so the value edges genuinely do not line up.** ⭐ **Structural, not a
missing utility.**

✅ **So: label-and-value pairs that need to align with the rows above and below use a two-column grid.**
`justify-between` is reserved for a single row where nothing needs to align with anything else.

### ✅ 6. Optical alignment. `items-center` on every icon-plus-label row.

**44 of 115 (38%) lack it today**, which reads as a wobble down a list. Worst in `StatusDonut` (5),
`PlantHome/index.tsx` (3), `ViewToggle` (2), `FleetPlantCards` (2), `AppointmentDetailModal` (2), the four
Configuration list files, plus `AlertsList:190`, `EventsTable:163`, `CapacityFacts:40`,
`PlantHeader/index.tsx:48`.

### ⭐ The single number that answers Keith's original complaint

⛔ **472 of 855 flex and grid containers, 55.2%, declare NO gap and NO space utility at all.** More than half
the containers in the app never make a spacing decision. **Keith reported cards reading as inconsistent,
sometimes too thick, sometimes too empty. The complaint was not just correct, it was understated.** Buttons
were 17 ad hoc combinations; spacing is 44 distinct values with 22 off-grid, four of them sub-pixel, plus 140
arbitrary escapes. **Applying this convention is a sweep, and it belongs to task 899.**

## ⭐⭐ BANNERS, NOTIFICATIONS AND CHIPS. Coverage measured, UX declared 2026-09-01 (day 77)

### What the DS actually has, measured. Coverage is uneven and one of the three does not exist.

| Keith's name | DS template | Gallery | Verdict |
|---|---|---|---|
| **Chip** | `ui-chip/Chip.dc.html` | ✅ `ChipGallery.dc.html` | **Fully defined.** Needs no design work |
| **Banner** | `callout/Callout.dc.html` (its own description calls it an "inline contextual banner") | ⛔ **NONE** | Defined for one size and four severities only |
| **Notification** | `domain-notification-inbox/NotificationInbox.dc.html` | ⛔ NONE | ⛔ **This is an INBOX, a persistent list. It is NOT a transient notification** |
| **Tag** | `tag/Tag.dc.html` | ⛔ NONE | Defined, six variants, no size variants |
| **Severity badge** | `severity-system/SeverityBadge.dc.html` | ⛔ NONE | Defined |
| **Alert strip row** | `fleet-alert-strip/AlertStripRow.dc.html` | ✅ `AlertStripGallery.dc.html` | Defined |

✅ **SUPERSEDED 2026-09-03. A TOAST TEMPLATE NOW EXISTS**, built by Keith in Claude Design and delivered as `toast/Toast.dc.html` (37,917 b) plus `toast/ToastMobileGallery.dc.html` (13,500 b). ⛔ Placement is unruled as of writing, see `docs/agent-mail/from-code/ds-templates-courier.md`. ⭐ **The slug `toast/` fits the house pattern**, bare names for primitives and `domain-` for composites, confirmed against all 54. The claim below was true when written and is kept because the toast spec in `CLAUDE.md` was authored against NO template, by reasoning from `emil-design-eng` and `review-animations`, so there is now an artifact to reconcile that spec against and the reconciliation has not been done. Historical claim follows.

⛔ **THERE WAS NO TOAST, SNACKBAR OR TRANSIENT NOTIFICATION TEMPLATE ANYWHERE.** Searched the full 100-template
inventory. **The thing whose entire nature is appearing, waiting and leaving is the one thing the DS never
described**, which is why its UX has never been specified either. **That is the real gap, not polish.**

⚠️ **DUPLICATES, and this is the same trap that made the Button read come back wrong today.** `Chip` exists
**twice** (`ui-chip/Chip.dc.html` and `domain-control-readout/Chip.dc.html`) and `SeverityBadge` exists
**twice** (`severity-system/` and `domain-control-readout/`). ✅ **Canonical is the standalone folder in both
cases**, `ui-chip/` and `severity-system/`, because those carry the galleries and the richer variant sets. The
`domain-control-readout/` copies are that readout's local versions. **Name the file in any future read.**

**Chip, measured in full.** Space Grotesk 600 at **12.5px**, `line-height:1`, `border-radius:999px`,
`padding:5px 12px`, optional leading 7px dot, `white-space:nowrap`. **Nine colour families**: neutral for
facts, five status hues mirroring SeverityBadge, and the Area 2 working-mode set (navy, teal, orange, rust).
**One size only, no size variants.** ✅ Consistent with the shape ruling, a chip is a token and wears fully
round.

**Banner (`Callout`), measured in full.** `padding:14px 16px`, `border-radius:10px`, tinted background with a
matching 1px border, a 22px circular severity icon, title Space Grotesk 600 at **13.5px**, body **13px**,
optional action link at 12.5px with a 1px underline border, and a dismiss `x` at 16px in `#7FA8BE`. Four
severities off the status palette. ⚠️ **Its dismiss `x` diverges from the close-button spec ruled today**
(`#7FA8BE` at 16px with no outline, against a bare `ink-600` glyph with a blue hover outline and 90 degree
rotation). **The close-button spec wins, it is the app-wide one. Reconcile the Callout toward it.**

### ⭐ The governing principle. These three differ by WHO STARTED IT and WHAT A MISS COSTS.

That is the whole system, and every rule below falls out of it.

```
--  chip           >> nobody started it. It is a FACT rendered inline. It has no lifecycle at all,
                      it changes VALUE. It never arrives and never leaves on its own
--  banner         >> a CONDITION started it. It lives IN the layout and leaves only when the user
                      dismisses it or the condition clears. Missing it is expensive, so it NEVER times out
--  notification   >> an EVENT started it. It lives ABOVE the layout and leaves on a timer.
                      Missing it must cost NOTHING, which is the constraint everything else obeys
```

⛔ **THE LOAD-BEARING RULE, and it is a correctness rule for a monitoring product. A TOAST IS NEVER THE ONLY
CARRIER.** Everything a transient notification says must ALSO land in the notification inbox or the alerts
list as the durable record. **An operator who looked away for four seconds must not lose a fault.** If a
message has nowhere durable to live, it is not a toast, it is a banner.

⛔ **ONE CHANNEL PER MESSAGE.** The same event never fires both a toast and a banner. Double-reporting is how
people learn to read neither.

### CHIP. No lifecycle. Value changes, and that is all.

```
--  appearing      >> with its parent, no entrance of its own. ⛔ NEVER animate chips in on a data refresh.
                      They render in rows of five to ten and a stagger on every poll is precisely the
                      frequency problem the house skill says to remove
--  displayed      >> a VALUE change cross-fades the LABEL only, opacity, about 150ms.
                      ⛔ Never animate the pill's width. It would reflow the row and shift everything beside it
--  displayed      >> a STATUS FAMILY change (green to red) transitions colour over 100 to 160ms, plain
                      `ease`. This one SHOULD be noticed, it is a real state change
--  disappearing   >> only with its parent. No exit of its own
```

⚠️ **An interactive chip is a different component.** A filter or selection chip takes the interaction
contract's six states in full. It stays fully round because it is chip-scale, per the shape ruling.

### BANNER. In the layout, so it reflows, and it never times out.

```
--  appearing      >> it PUSHES content, so it must animate its own height or the page jumps.
                      Height plus opacity, 150 to 250ms, `cubic-bezier(0.23, 1, 0.32, 1)`.
                      ⛔ Never from `scale(0)`, and never a slide from off screen, it is inline
--  displayed      >> PERSISTENT. ⛔ No timeout, ever, at any severity. It may update its text in place
--  displayed      >> a second banner of the same severity COALESCES with a count. It does not stack.
                      ⛔ Max two visible. Past that, one banner that summarises, or the page becomes banner
--  disappearing   >> user dismiss, or the condition clearing. Exit is the reverse of enter at 120 to 180ms,
                      faster than enter, and it COLLAPSES ITS HEIGHT as part of the exit so content does not
                      snap upward
--  dismiss glyph  >> the close-button spec, app-wide. Not the Callout template's current `x`
```

⛔ **Dismissal is remembered per CONDITION INSTANCE, not per session.** A banner that returns on every
navigation trains people to dismiss without reading, which destroys the channel.

⛔ **A banner carrying a FAULT is never dismiss-only.** Dismissing hides the notice, not the condition, so the
condition must stay visible on its own surface. **Otherwise dismiss becomes a way to make a fault invisible.**

### NOTIFICATION (toast). Above the layout, transient, and it does not exist yet.

⛔ **CORRECTED 2026-09-01 after reading `review-animations/STANDARDS.md` and `find-animation-opportunities`.
The first version of this spec violated three house rules at once.** All three are quoted below.

```
--  position       >> ONE corner, always the same one. Recommendation is top right, because it puts the
                      transient copy next to the inbox icon that holds the durable copy
--  appearing      >> ⛔ CORRECTED. `translateY(100%)` or `translateX(100%)`, a PERCENTAGE of the toast's
                      own size, NOT a hardcoded px offset. 200ms, `cubic-bezier(0.23, 1, 0.32, 1)`.
                      House rule, verbatim: "Dismissable surfaces (toasts, sheets) that exit a different
                      way than they entered -> symmetric paths; `translateY(100%)` percentages, not
                      hardcoded pixels." The earlier "about 8px offset" was wrong on both counts
--  mechanism      >> ⛔ CSS TRANSITIONS, NEVER KEYFRAMES. `STANDARDS.md` names toasts as the case:
                      "For anything triggered rapidly (toasts being added, toggles), transitions are
                      smoother", because keyframes restart from zero while transitions retarget.
                      Use `@starting-style` for entry without JS
--  swipe          >> ⭐ ADDED. Swipe to dismiss is the NAMED house idiom for a toast
                      (`animation-vocabulary`: "Swipe to dismiss - Dragging an element off-screen to
                      close it, like a drawer or toast"). Dismiss on VELOCITY, not on crossing a
                      distance threshold: `Math.abs(distance)/elapsedMs > ~0.11`. A flick is enough.
                      Rubber-band at the boundary rather than hard-stopping
--  displayed      >> dwell BY SEVERITY, and the timer PAUSES on hover and on focus-within.
                      info 4s · success 4s · warning 8s · ⛔ error and fault NEVER auto-dismiss
--  displayed      >> ⛔ never a dwell under 4s, it cannot be read. ⛔ never over 10s for anything that
                      auto-dismisses, it stops reading as transient
--  stacking       >> ⛔ MAX THREE visible. Newest nearest the origin corner. Past three, coalesce into
                      "+N more" pointing at the inbox. A wall of toasts blocks the UI it is reporting on
--  disappearing   >> ⛔ CORRECTED. The exit REVERSES the enter path, the same `translate` percentage back
                      out, at about 150ms so it is faster than enter. **Symmetric PATH, asymmetric
                      DURATION.** The earlier "fade plus slot collapse" was a different geometry from the
                      enter and is exactly what the symmetric-paths rule prohibits. The remaining stack
                      then reflows on `cubic-bezier(0.77, 0, 0.175, 1)`, the on-screen movement curve
--  keyboard       >> a keyboard dismiss removes it IMMEDIATELY, no exit animation, per the contract's
                      prohibition on animating keyboard-initiated actions
--  reduced motion >> no slide, fade only, and the stack reflow lands instantly
```

⛔ **The error asymmetry is the point. You cannot auto-dismiss a fault.** An error toast holds until dismissed,
which makes it behave like a banner while living in the toast channel. If that feels wrong for a given case,
the message was a banner all along.

**Assistive technology, and it is not optional given what this app reports.** `role="status"` with
`aria-live="polite"` for info and success. `role="alert"` with `aria-live="assertive"` for warning and error.
⚠️ **Pause-on-focus is what makes the dwell timer safe for a screen-reader user**, who may still be being read
the message when a four second timer expires.

### 📌 PINNED 2026-09-01 (Keith). Resumes after his Claude Design pass.

**Keith pinned this item at the end of day 77 and moves to alignment and spacing next.** ✅ **The UX above is
CLOSED and does not wait on the design pass.** What is pinned is the visual half only.

**Status by component, so the resume does not re-litigate settled parts.**

| | Visual status | Blocks a build? |
|---|---|---|
| **Chip** | ✅ **DONE.** Fully specified with a gallery. Do not touch it | No |
| **Banner** (`Callout`) | ⚠️ Buildable at one size. Needs a gallery with size variants, and its dismiss glyph reconciled to the close-button spec | No, it is polish |
| **Toast** | ⛔ **DOES NOT EXIST.** No template of any kind | ⛔ **YES. Nothing can be built against it** |
| **Tag**, **SeverityBadge** | Defined, no galleries | No |

**What Keith takes to Claude Design.** A `Callout` gallery with size variants plus the dismiss-glyph
reconcile, galleries for `Tag` and `SeverityBadge`, and ⛔ **a TOAST template created from nothing**, carrying
the four severities, the stack of three, and the "+N more" coalesced state.

✅ **RESOLVED 2026-09-03 (day 79). THE TEMPLATE EXISTS AND THE ITEM IS RULED NOT TO FILE.** Keith built the
toast template in Claude Design and it is couriered to `chore/ds-templates-reference`, so two of the three
legs of the risk below are gone. It is no longer a build from nothing and it is no longer template-less.
⛔ **The board item was declined deliberately, not forgotten.** The decisive fact is that **nothing in the
product consumes a toast today** — searched across this page, `open-questions.md` and the decision log with no
consumer found, and `NotificationInbox` is a persistent list rather than a substitute. An item whose consumer
does not exist cannot name a parent epic without inventing one, and the same shape was declined on 2026-08-30
for the socket-lifecycle test. **What converts it** is the first surface that needs to confirm a user action
succeeded or failed, most plausibly A2's control write path (7.2 / `AB#953`), or the first time someone builds
against the template and finds no component. **Paste-ready fields are held at `toast-item.md` in the wiki
root** so filing is a paste rather than a re-derivation. ⚠️ **Note what did NOT carry the argument.** "This was
a gap on our side" is a reason to absorb the cost, not a reason to keep it off the board, because DL-59 already
separated filing from billing. The no-consumer fact is what carried it. Original risk note follows.

⛔ **THE TOAST HAS NO WORK ITEM, and that is what makes it the risk on this page.** Everything else declared on
day 77 has a home in task 899 / 7.1 / AB#745. **A new component with a spec, no template and no board item is
the shape of thing that quietly never happens.** It needs a task filed once Keith decides whether it belongs
in A2 or later. **Keith owns every board edit, so this is his to file, not something to assume happened.**

### There is NO close-button template in the DS

Searched `design/templates/` 2026-09-01 for close, dismiss and icon-button. **Zero matches.** So the close
button is genuinely a new component and its blue is ours to choose, not a value to look up. Same for
`icon-only`, which the DS hierarchy does not contain at all.

### Six prohibitions

```
--  never solid `hue-sky-500` with a white label. It fails AA and the failure is measured
--  never a raw hex. The one in the app today, `hover:bg-[#2a5596]`, is frozen legacy, not a precedent
--  never `hover:font-bold` or any weight change. It shifts layout, prohibited by the contract
--  never two solid buttons side by side. That is the one-primary rule stated as a shape
--  never an icon-only button without an accessible name
--  never a button styled as a link unless it navigates. That is the `link` semantic and it belongs to anchors
```

### What buttons DO NOT settle

Behaviour, which the contract owns. And the type scale, which is still on Keith's original list along with
banners, notifications and chips. **Named so neither gets quietly absorbed into a button spec and lost.**

✅ **The card contradiction's radius and padding half is NO LONGER open** and was closed the same day by THE
CARD SYSTEM below. Do not re-list it here.

## ⭐⭐ TYPOGRAPHY, declared 2026-09-01 (day 77). RECORDED, NOT APPLIED. NEITHER FACE IS IN THE REPO YET.

The last item on Keith's original conventions list. Two sans-serif faces, system wide, one display and one
body. Both tables below were approved by Keith unchanged ("nothing to change from me"), and he has confirmed
he checked commercial licensing for both faces himself.

⛔ **Nobody builds against these faces until the files are in the repo.** Keith adds them manually. Until
`public/fonts/` carries them and `theme/fontFamily.ts` names them, every component keeps rendering Space
Grotesk and the inherited `ui-sans-serif, system-ui` stack. A component authored against the new scale before
the files land will look correct in review and wrong in the browser.

### ✅ RULED 2026-09-02 (Keith): THERE IS NO DEFAULT FONT ANY MORE. `sans` is overridden, not supplemented.

Keith's words: *"theres no default font anymore"*, confirming that the two faces cover every text role and that
nothing falls back to a system face by design.

⛔ **This settles a question the day-77 record did not know it had.** `theme/fontFamily.ts` is 220 bytes and
carries **exactly one key, `display`**. There is no `body` key and there never was. Body text has been
rendering **Tailwind's stock `font-sans`**, which resolves to the viewer's own system stack, so the body face
was never a token and never a file. Two options existed and they are not equivalent.

| Option | Effect | Verdict |
|---|---|---|
| Override `sans` in `theme.extend.fontFamily` | Opening Hours Sans becomes the default for every element with no explicit font. Zero component changes. | ✅ **RULED** |
| Add a new `body` key | Opt-in and safe, but nothing renders the new face until all eleven body roles are touched, so the change ships looking like it did nothing | ⛔ rejected |

**So the blast radius is the POINT, not a side effect.** Overriding `sans` restyles every un-tokened element at
once, including screens nobody has looked at, and that is what "system wide" means. ⚠️ The consequence to
expect and not treat as a regression is that text which was never deliberately styled will change appearance
on the first load after this ships.

⚠️ **One precision, because "no default font" is not literally achievable.** A fallback stack stays behind BOTH
faces for the case where the WOFF2 fails to load over the network. That is a failure path, not a styling
decision, and the stacks are kept. What is now true is that **no element renders a system face by design.**

⛔ **Net change to `public/fonts/` is ONE FILE OUT, TWO IN**, not two out. Space Grotesk is the only
self-hosted face in the repo, one file and one `@font-face` block. On the body side nothing is retired, a face
is ADDED where there was none.

**Ownership of the change, so nobody waits on the wrong agent.** Cowork converts the TTFs and writes the mail
prompt (`docs/**` is Cowork's per DL-49). **Keith** drops the finished WOFF2 into `public/fonts/` and pushes,
because every git operation is his. **Code** does the two `@font-face` blocks, `theme/fontFamily.ts`,
`theme/fontsize.ts`, and deletes Space Grotesk's block and file in the SAME commit. ⚠️ **The font files must be
in the tree in that same push or earlier** — if the `@font-face` blocks land first the build passes, nothing
errors, and the browser 404s the font and silently falls back, which presents as "the fonts did not work" with
nothing to debug.

⚠️ **STILL OPEN, and it is the one place Keith's stated principle and the approved table disagree: BUTTONS.**
The table puts them on the BODY face because the DS Button template sets `font-family: ui-sans-serif,
system-ui`. Keith's 2026-09-02 framing was "major, important text like titles", which arguably covers a primary
button label. **Not resolved. Either leave buttons on body and follow the DS, or move them to display and treat
it as a DS template change first.**
### ✅ RULED 2026-09-02 (Keith): OVERUSED GROTESK CARRIES TITLES AND ALL NUMERALS. OPENING HOURS SANS CARRIES PROSE.

⛔ **Forced by measurement, not chosen.** `OpeningHoursSans-Regular.otf` ships **one cut, no variable version**
(Uncut's own page, "1 cut, Variable: No") and **has no `tnum` feature at all**. Its full feature set is
`aalt ccmp dlig kern liga locl mark mkmk ss01`. Its digits are **proportional at 367 / 550 / 600 / 638 units**
on a 1000 upm, so the `1` is barely two thirds the width of the `0`.

✅ **Verified by HarfBuzz shaping with a positive control**, the same engine the browser uses. With `tnum`
requested ON, Opening Hours Sans returns the identical ragged widths, so the request is a no-op. Overused
Grotesk collapses all ten digits to a single advance at every weight (1116 at 400, 1170 at 600, 1250 at 900).

⚠️ **A first probe reported BOTH faces uniform at 500 and it was FALSE.** `uharfbuzz` cannot decompress WOFF2,
so every glyph resolved to `.notdef` at a default advance and the pass looked clean. **The control run, tnum
OFF expected ragged, is the only thing that caught it.** Recorded because it is the standing rule earning its
keep on the same day it was reinforced.

**So two of yesterday's assignments were unsatisfiable, permanently.** Numbers in the body face can never
column-align and will jitter when they update in place, which is precisely what the ALIGNMENT AND SPACING
tabular-figures ruling requires them not to do.

**The amendment, which replaces re-shuffling the role table.** Wherever the tabular-figures ruling applies,
**the display face applies too**, because it is the only face that can satisfy it.

| Takes the DISPLAY face | Stays on the BODY face |
|---|---|
| eyebrow, table headers, **buttons** | body copy and prose |
| numeric table cells, units | textual table cells (plant names, serials) |
| hero and card figures, delta badge | captions, tooltips, nav items, form inputs |
| card titles, page titles, Callout and banner titles, chip labels | toast and banner body |

✅ **This also CLOSES the open buttons question.** A 600-weight button label cannot live on a single-cut face
without synthetic bold, so the DS Button template's `ui-sans-serif` default is overruled by capability rather
than by taste. Keith's "major, important text" framing and the constraint point the same way.

⚠️ **Synthetic bold is the failure being avoided.** A single-cut face asked for `font-weight: 600` gets the
browser thickening outlines rather than selecting a heavier design. It reads smeared, it is worst at small
sizes, which is exactly where the eyebrow lives at 11px, and it perturbs metrics, so it works against the
alignment ruling too.

### The shipped files, measured 2026-09-02

Subset by Cowork from source and **verified after subsetting**, not before.

| File | Bytes | Axis | Glyphs / codepoints | `tnum` |
|---|---|---|---|---|
| `overused-grotesk-latin-variable.woff2` | **28,028** | `wght 300-900` | 314 / 231 | ✅ works, uniform at 400, 600, 900 |
| `opening-hours-sans-latin.woff2` | **8,516** | static, single cut | 208 / 201 | ⛔ absent by design of the face |
| *(removed)* `space-grotesk-latin-variable.woff2` | 22,288 | `wght 300-700` | 291 | present |

**36,544 bytes for two faces against 22,288 for the one removed**, so about 14 KB more on first load for a
full two-face system with a wider axis. Overused Grotesk came down from 204,160 bytes at source.

⚠️ Features with no remaining lookups after latin subsetting were dropped (`ccmp`, `mark`, `mkmk`, the `ss` and
`cv` alternate sets). Expected, and not a defect.

⚠️ **Overused Grotesk's version string is `0.6`**, a pre-1.0 release, so its metrics may shift in a future
version. Not a blocker. Pin the file rather than tracking upstream.
### The two faces

| Role | Face | Replaces | Source |
| --- | --- | --- | --- |
| display | **Overused Grotesk** | Space Grotesk | `https://github.com/RandomMaerks/Overused-Grotesk/tree/main/fonts/ttf` |
| body | **Opening Hours Sans** | the inherited `ui-sans-serif, system-ui` stack | `https://uncut.wtf/sans-serif/opening-hours-sans/` |

### Format ruling, WOFF2 converted from the TTF

Keith asked OTF or TTF. The answer is **neither goes in as-is. Take the TTF and convert to WOFF2.**

The reason is that the repo already has exactly one self-hosted face and it establishes the pattern.
`app/tailwind.css:1-10` carries a single `@font-face` with `src: url('/fonts/space-grotesk-latin-variable.woff2')`
and `font-weight: 300 700`, and the file is 22,288 bytes, latin-subset, variable, brotli-compressed. So the
pattern is **self-hosted, woff2, variable where a variable file exists, latin-subset**, and the two new faces
follow it rather than inventing a second delivery shape.

Two consequences worth stating before conversion:

- **Prefer a variable TTF if the face publishes one.** One file per face beats a static file per weight, and
  the existing `@font-face` block already assumes a weight range rather than a weight.
- **Latin-subset the conversion.** 22,288 bytes is the bar the existing face set. A full unsubsetted face is
  several times that and there is no non-latin content in the platform.

### ⚠️ TABULAR FIGURES, `tnum`. Corrected 2026-09-02, and it does NOT gate adding the fonts

⛔ **Cowork framed this as a gate on adding the fonts. It is not, and Keith caught it (2026-09-02).** Adding
the two faces is the WOFF2 files, two `@font-face` blocks, `theme/fontFamily.ts` repointed and Space Grotesk
dropped. `tnum` is a prerequisite for none of that.

**What it actually gates is the TABULAR FIGURES half of the ALIGNMENT AND SPACING ruling**, which is a separate
deliverable. `font-variant-numeric: tabular-nums` only does anything if the face carries a `tnum` OpenType
feature. On a face without it the utility compiles, emits, and **silently does nothing** — columns stay ragged
and live-updating figures jitter, with no error at any layer. That silence is the whole reason it needs a
deliberate check.

⚠️ **And the reason it sits beside CONVERSION rather than before it is narrower than first written.**
Subsetters strip layout features. **`pyftsubset`'s default `--layout-features` set does NOT include `tnum`**, so
a naive subset command kills tabular figures even on a face that has them. So the requirement is on the
conversion command, not on the ordering of the work.

✅ **SPACE GROTESK IS MEASURED AND CLEAR, 2026-09-02.** Read straight off the feature tables with `fontTools`.
The shipping `public/fonts/space-grotesk-latin-variable.woff2` (22,288 bytes, variable) carries GSUB
`ccmp dnom frac liga locl numr pnum tnum` and GPOS `kern mark mkmk`. The loose `SpaceGrotesk-Bold.ttf` in the
wiki folder carries the identical set. **So `tnum` is PRESENT in both, and the Space Grotesk re-check is
CLOSED.** ⭐ **The more useful finding is that the existing 22 KB subset PRESERVED its layout features**, so
there is a working recipe in the repo to copy rather than a new one to get right.

⛔ **Still unmeasured: Overused Grotesk and Opening Hours Sans.** Cowork does the check, not Keith — it is one
read of each TTF's feature table once the files sit anywhere in a connected folder. It matters most for
**Opening Hours Sans**, because two of the platform's three tables render in the body stack, so the body face
carries nearly all the columns. A face that genuinely lacks `tnum` needs a ruling from Keith, accept ragged
columns or fall back to a system stack in tabular contexts.

### Face assignment by text role, 17 roles

Approved as proposed. **The rule of thumb is that the display face carries identity and magnitude, the body
face carries everything a person reads for content.**

| # | Text role | Face | Note |
| --- | --- | --- | --- |
| 1 | Hero and card figures (the big numbers) | display | magnitude is the reason the display face exists |
| 2 | Delta badge | display | reads as part of the figure it modifies |
| 3 | Card titles | display | pairs with the CARD SYSTEM's Title Case header rule |
| 4 | Page title | display | |
| 5 | Callout title | display | body of the Callout stays body face |
| 6 | Chip label | display | |
| 7 | Body text | body | |
| 8 | Table headers | body | |
| 9 | Table cells | body | needs `tnum`, see above |
| 10 | Units | body | |
| 11 | Captions | body | |
| 12 | Eyebrow | body | 11px, uppercase, 600, +0.05em, `hue-ink-500`, per the CARD SYSTEM |
| 13 | Form inputs | body | |
| 14 | Nav items | body | |
| 15 | Tooltips | body | |
| 16 | Toast and banner body | body | title of a banner follows the Callout title rule |
| 17 | **Buttons** | **body** | ⚠️ see below |

⚠️ **Buttons are on the BODY face, and that is deliberate rather than an oversight.** The real DS Button
template at `design/templates/form-controls/Button.dc.html` explicitly sets `font-family: ui-sans-serif,
system-ui`, not Space Grotesk. So the DS has already ruled this, and the declaration follows the DS instead of
overriding it. If Keith wants buttons on the display face later, that is a DS template change first and a
convention change second, in that order.

### The type scale, ten tokens, rem based

Approved as proposed. Sizes are rem because the ALIGNMENT AND SPACING ruling put new tokens in rem and
because 122 of the app's 528 px arbitraries are TYPE values, which is the live accessibility defect. The px
column is the rendered value at a 16px root and is informational only, not a value to author against.

| Token | Size (rem) | at 16px root | Tracking | Leading |
| --- | --- | --- | --- | --- |
| `display-xl` | 2.375rem | 38px | -0.02em | 1.05 |
| `display-lg` | 1.75rem | 28px | -0.02em | 1.1 |
| `title-lg` | 1.125rem | 18px | -0.01em | 1.25 |
| `title-md` | 0.9375rem | 15px | -0.005em | 1.3 |
| `title-sm` | 0.8125rem | 13px | 0 | 1.35 |
| `body` | 0.875rem | 14px | 0 | 1.5 |
| `body-sm` | 0.8125rem | 13px | 0 | 1.5 |
| `label` | 0.75rem | 12px | 0 | 1.4 |
| `eyebrow` | 0.6875rem | 11px | +0.05em | 1.2 |
| `caption` | 0.6875rem | 11px | 0 | 1.4 |

Tracking tightens as size grows and opens as it shrinks, which is the `apple-design` §15 treatment. The
endpoints are the ruled values, -0.02em on display and +0.05em on the eyebrow, with 0 as the body default.
Leading runs 1.05 tight on display to 1.5 on body text.

### ⚠️ The 12.5 to 12 collapse, a deliberate change to an already-approved size

The scale's real effect is that the app's current small-type band of **11 / 11.5 / 12 / 12.5 / 13 collapses to
11 / 12 / 13**. Half-pixel type steps are not a system, they are the residue of authoring against a mockup.

The casualty is **12.5px, which is the most common arbitrary type value in the app at 31 uses, and is also the
DS chip and action-link size.** It becomes 12px (`label`).

This is recorded as a change, not as a rounding, because the DS already declared 12.5 for chips and action
links, so a previously approved size is being overruled by the scale. It is a half-pixel move on two component
families and the tradeoff is a three-step small band instead of a five-step one.

### What this affects, and the steps forward

**Affected surfaces.** `theme/fontFamily.ts` (both keys change value), `theme/fontsize.ts` (currently one key,
`size-13`, and the ten tokens replace the practice it represents), the `@font-face` block at
`app/tailwind.css:1-10` (one block becomes two), `public/fonts/` (one file becomes three, or two if Space
Grotesk is removed in the same pass), and the 122 px type arbitraries across the app.

**Steps, in order.**

1. Keith verifies `tnum` on both faces and re-checks Space Grotesk's. This is first because a failure changes
   the assignment table, not just the conversion.
2. Keith converts the TTFs to latin-subset variable WOFF2 and adds them to `public/fonts/`.
3. Code adds the two `@font-face` blocks and repoints `theme/fontFamily.ts`. Space Grotesk's block and file
   are removed in the same commit, not left behind, or the app ships three faces and downloads two it never
   renders.
4. Code adds the ten type tokens to `theme/fontsize.ts`.
5. Migration of the 122 px type arbitraries is **separate work and not part of the token commit**, consistent
   with the alignment ruling that new tokens carry no migration.

**Gates.** The token gate is CLEAR as of `ee76dc3`, so nothing here is queue-blocked. The `tnum` check is the
only open gate and it is Keith's.

**Nothing to file on the board yet.** Typography joins the day-77 output that Task 899 cannot hold, so it
belongs in the recommended split as its own item rather than being appended to a token PBI.

## ⛔ `Button/index.tsx` READ IN FULL 2026-09-02, and it is 30 lines carrying FIVE findings. None filed, all pre-existing.

Read while answering whether buttons could take the new display face inside AB#991. **They cannot usefully**,
and the reason is finding 1.

**1. ⛔ NO VARIANT CARRIES A WEIGHT CLASS.** Not one of the five sets `font-semibold` or `font-bold`, so every
button label renders at the default 400. **The DS Button template specifies 600.** So adding `font-display`
alone would ship Overused Grotesk at 400 where the DS says 600, which is the new typeface at the wrong weight
and is not obviously better than the system stack at 400. ⚠️ **The DS button spec is a package** — face,
weight 600, `line-height:1.1`, `letter-spacing:.005em`, and the three sizes with their own padding and radii
(sm 13.5px/`7px 13px`/r8, md 14px/`9px 16px`/r9, lg 15px/`11px 20px`/r10). **Half of it is not half an
improvement.**

**2. ⚠️ `font-sm` on lines 12 and 16 is not a Tailwind class and appears to emit NOTHING.** Tailwind's `font-*`
resolves to `fontFamily` or `fontWeight`; `sm` is neither, and `theme/fontFamily.ts` has no `sm` key. So it
reads as a weight declaration and does nothing, which is very likely how finding 1 went unnoticed for so long.
⛔ **Not yet confirmed by an emit check, so treat it as a strong candidate rather than a measured fact.** Same
family as the standing "the class exists but does nothing" rule.

**3. ⛔ The `default` variant DROPS `${className}`.** Lines 6, 9, 12 and 16 all interpolate the caller's
`className`; line 20 does not. So a caller styling a default-variant button silently loses every class it
passes. Silent, and invisible at the call site.

**4. ⛔ TOKEN VIOLATION plus a convention breach on one line.** Line 12 is
`bg-hue-sky-800 ... hover:bg-sky-700`. The rest state is the project's `hue-sky` ramp and the hover is
**Tailwind's stock `sky` palette**, so the two are unrelated colour systems on the same control. And it
**darkens on hover**, which the 2026-09-01 button ruling prohibits — primary hover lifts elevation and does
not darken.

**5. `variant` and every other prop are typed `any`.** Pre-existing, cosmetic beside the rest.

⚠️ **Also standing, from the day-77 grid round: `min-w-[128px]` on all five variants.** A floor rather than a
clip, so the failure mode is label wrapping, not truncation. ⭐ **PROVENANCE 2026-09-02 SETTLES THE FIX AND IT
IS DELETION.** `design/templates/form-controls/Button.dc.html` on `chore/ds-templates-reference` returns
`grep -c min-width` = **ZERO**, with `grep -c padding` = 6 as the control on the same file. **The DS declares
no minimum width on any button size, so 128px is a repo invention and nothing in the DS wants a floor there.**
Introduced `4ef8a41` 2024-06-19; changed by `0058a9d` 2024-11-04 and by `b4882d2` 2025-07-06, which is
**Peter's own "Big Red Button" commit** — so he has authored code in this component, worth knowing before
anything critical about it reaches a surface he reads.

⛔ **All five are REVEALED by reading, not introduced by any build, so under DL-45 they ride the owning item's
description rather than filing as Bugs.** Consistent with the three grid-round defects.

⭐ **Consequence for the split. `Button` should be the FIRST item in the convention-application work**, not part
of typography. It is one file, thirty lines, and it carries the button appearance ruling, the DS sizes, the
shape bands, the hover prohibition, the token rule and the label-overflow defect all at once. **Fixing it
properly is one small item that demonstrates six of the nine conventions**, which is a far better first
application than scattering the face across components.

## ⚠️ THE DATE PICKERS, and THERE ARE TWO. Read 2026-09-07, and the read reshaped the question

⛔⛔ **COWORK POINTED THE FIRST BRIEF AT THE WRONG COMPONENT.** `Forms/DateFilter` is NOT the picker Keith
screenshotted. Cowork inferred the component from `design/design-system-inputs.md` and this page's own
floor-carding note rather than asking which component was on screen. Everything below supersedes the first
version of this section.

**The picker Keith screenshotted** is `react-tailwindcss-datepicker` 1.7.2, mounted at
`app/containers/Layout/Navbar.tsx:158` and `app/containers/Plant/PlantHome/Trends/TrendsDateRange.tsx:105`.
⭐ **Keith owns the preset LIST and configures the RENDER.** All four of his complaints are library behaviour,
the two calendars from `useRange`, the shortcut column from `showShortcuts`, the struck-through future days
from `maxDate={new Date()}` in both mounts, and the vertical blue bar.

**⛔ A SECOND, DIFFERENT COMPONENT IS SHIPPED BROKEN and nobody has looked at it.**
`app/components/Forms/DateFilter/index.tsx`, 102 lines, `react-day-picker` 8.10.1 in a Headless UI popover
wearing the shadcn class map. Mounted at `Tables/BasicTable.tsx:50` and
`_.GridGuardian.remote-set/CommonSetting.tsx:23`, **both as a bare `<DateFilter />` with no props**, so the
trigger always reads "Select Date". Its seven preset labels are **plain divs with no handler**, so they do
nothing. **Seven of its classes emit no rule**, `text-muted-foreground`, `text-primary-foreground`,
`bg-primary`, `hover:bg-primary`, `bg-accent`, `bg-accent/50`, `text-accent-foreground`, all shadcn tokens this
theme never defines, and **`react-day-picker`'s stylesheet is imported nowhere**, so the grid has no base
styles either. ⭐ **This is the floor-carding this page records, and it is real. It is just not what Keith
saw.** Its own DS reskin target is `evolved-datefilter/EvolvedDateFilter.dc.html`. Needs its own filing
decision.

### ⛔ TWELVE presets, not fourteen. Cowork counted a screenshot by eye

The object is defined **twice and identically**, `Navbar.tsx:13-75` and `TrendsDateRange.tsx:7-68`, a `diff`
of the two returning one blank line. Twelve keys, `today` `yesterday` `last7Days` `lastWeek` `pastMonth`
`last90Days` `lastQuarter` `lastYear` `thisWeek` `currentMonth` `thisQuarter` `thisYear`. **The library's own
six defaults are replaced rather than appended.** ⚠️ Duplicated in two files, so any list change is two edits.

### The undefined-utility hypothesis, tested both ways and REFUTED for the picker that matters

`tailwind.config.ts:19` puts the library's `dist/index.esm.js` in `content`, so Tailwind compiles its classes,
and all twenty-five checked emit one rule each with controls. ⛔ **So "outdated" is not a compile problem.** It
is the library's stock look, Tailwind `blue-500` and `gray-300` with `primaryColor` left at its default `blue`.
**The cheap fix Cowork hoped for does not exist here.** The routes are a `primaryColor` swap, which recolours
every blue at once, app-side rules under the existing `.date-picker` hook at `app/tailwind.css:41`, a fork, or
a different library. ⚠️ **Any hook override is a third-party override a library upgrade can silently drop**, so
it wants a test or a note beside it.

### The four symptoms, each with its mechanism

- **Strikethrough is HARDCODED in the library**, `dist/index.esm.js:2460` and `:2462` append `line-through`
  whenever `isDateDisabled(day)`, and `:2348` does the same to disabled shortcuts. No prop turns it off.
  ✅ **One app-side rule under `.date-picker` on the disabled day buttons covers both mounts**, and
  `git grep -n line-through -- app` returns nothing with a control, so the treatment exists nowhere else.
- **Today and selected DO differ**, and a single-day selection of today collapses them. Today unselected takes
  `text-blue-500` on a plain cell. A selected start or end takes `bg-blue-500 text-white font-medium` with
  `rounded-full` when start equals end, and the selected branch wins when a day is both. That is exactly what
  Keith's screenshot showed.
- **The vertical blue bar is deliberate**, the library's `VerticalDash`, `h-7 w-1 rounded-full hidden md:block`
  in the primary colour, between the two calendars. Not a mistake.
- **The panel is stock**, `mt-2.5 shadow-sm border border-gray-300 rounded-lg bg-white`, no tone, and the
  digits are the inherited body stack with proportional figures inside `lg:text-xs`.

⚠️ **For `review-animations` when the day comes.** The library animates day hover with
`transition-all duration-300` and the popup with `transition-all ease-out duration-300`. Both are escalation
triggers under the house rules and **neither is ours to edit in place.**

## ⚠️ THE DATE FILTER, four problems named by Keith 2026-09-07 and PARKED with its split ruled

**Read from a screenshot of the open panel**, not from memory of the component. The field reads
`2026-09-07 to 2026-09-07`, and the panel is a left rail of **fourteen preset options in link blue with no
grouping and no separators**, beside two month calendars each carrying its own pair of chevrons.

**Keith's four, verbatim in substance.** The interface looks outdated. Too many date options and the list needs
better UX. ⛔ **The locked out future days look horrible, they are rendered as struck-through numbers.** And
better UX generally.

⛔ **PRE-EXISTING. Keith did not design or build this component**, confirmed by him on 09-07. That is the fact
the money turned on.

### What breaks a declared rule, so it needs no design decision

- ⛔ **Strikethrough is being used as the disabled state.** Line-through reads as deleted rather than
  unavailable. The house treatment already exists and `AB#953` shipped it on 09-06, muted text on a muted fill
  with `cursor-not-allowed`, and the elevation table says disabled reads as ABSENT.
- **The panel is flat.** A popover is `elev-5`, and under DL-68 it now also carries a surface tone. ⭐ **This
  component is the natural first consumer of the depth system**, which is an argument for doing it early.
- **A calendar is numerals in columns**, which is exactly the tabular-figures case. Numerals take the display
  face under the 09-02 typography ruling, and the digits here are proportional so the columns do not align.
- **The presets render in link blue.** Blue is the link colour and these are options.

### Judgement calls, Keith's to make

Fourteen presets ungrouped, which fall naturally into single days, rolling windows, this period so far, and the
previous complete period. A single day reading as a range in ISO. And whether today and selected share the
solid blue disc, unresolvable from one screenshot because the selected range was 07 to 07.

### ⚠️ One finding that is correctness rather than taste, and it is unmeasured

Some presets may offer ranges the app cannot honour. Long ranges already truncate, that was Bug 23, a backend
bucket-truncation row is open, and inverter metrics cap at `page_size` 200 so a month at minute resolution
returns a fraction. **If Last Year silently returns a slice, offering it is a defect and trimming the list is
the fix rather than the preference.** Needs measuring per preset.

### The split, ruled 2026-09-07 by Keith, and PARKED

**Convention half in now at no charge**, consistent with the five 7.x items. **Redesign half is new scope and
goes to Peter at the Area 1 close-out review**, not this week, because five PRs are unreviewed and the batch is
worth more. **Truncation half is a defect if it is real.** Tag Area 1, the filter serves Areas 1, 2 and 3.
⛔ Not the A2 allowance. ✅ **7.4, 7.5 and 7.6 were checked and do not already own this**, their scopes are
enumerated and count-based, so a new item double-homes nothing.

⭐ **WHAT "REDESIGN" MEANS HERE, clarified 2026-09-25 by Keith.** The parked redesign is the picker's OWN
interface, the panel that opens, with its presets, its two calendars, its greyed out days and its colours. **It
stays exactly as it is for now, and it stays parked.** ✅ **The date field in the header is NOT part of it.** The
closed box that shows the range and its clear button belongs to the header, and it gets restyled with the
header's own redesign (Keith, *"its current interface can stay the same for now. whats important is the header
gets the redesign"*). ⚠️ The library draws that box, so restyling it must go through the library's own class
props without touching the panel, and the header's step one read confirms that is possible. ✅ **Since `!1041`
merged 2026-09-22 the header holds the only mount of this picker**, `TrendsDateRange.tsx` is gone and Trends
now opens the header's picker. The other picker, `Forms/DateFilter`, is 7.8's and unaffected.
⚠️ **A known limit that goes with the parked panel, measured 2026-09-25 in the header's plan addendum.** Below 768 the open panel is as wide as the field and about 1,089 px tall, hanging from the sticky header, so on most phones its lower part cannot be scrolled into view. It was the same before the header work. ✅ **The header's closed field now shows a readable label** (DL-118), and the panel is still untouched.

### Two leads worth carrying into the measurement

`DateFilter` is listed as in the DS and serving Areas 1, 2 and 3 in `design/design-system-inputs.md`. And this
page records that several components reference utilities the theme never defines, `input` and `input-primary`
among them, and **render partly unstyled in the app as well as in the previews, which is the real shipped
state**. `DateFilter` is separately recorded as one of four components that floor-card in the preview harness.
⚠️ **Whether `DateFilter` is in that undefined-utility group is a HYPOTHESIS and not a finding.** If it is, then
outdated has a mechanical cause and a cheap fix rather than needing a redesign at all.


## ⛔ THE PLANT TAB CARD IS SPLIT THREE WAYS, AND `GraphWrapper` IS THE CONFORMING ONE (measured 2026-09-09, RETIRED AND REPLACED 2026-09-21)

⛔⛔ **THE 09-09 READING BELOW IS RETIRED. `GraphWrapper` IS NO LONGER THE OLD HALF.** A2 4.4 restyled it, and measured on 2026-09-21 it is **the only surface on the platform that matches the declared feature density exactly**, `px-[1.125rem] py-5` with radius 14 and an 18px title, which is 18 by 20 radius 14.

⛔ **And the `p-5` idiom the 09-09 entry treated as the newer, better half matches NO declared step.** `p-5` is 20 by 20. Events (`AB#949`) and Control (`AB#953`) both ship it and both are two pixels off the system. ⭐ **The reason nobody caught it is recorded below and is the durable lesson. The 09-09 reconciliation compared card against card rather than card against the token**, converging the events card onto Control's because Control's was the newest, so both landed off the scale while matching each other.

✅ **Keith ruled 2026-09-21 that `GraphWrapper` IS the card system.** `AB#1028`'s AC 5 is therefore a conformance check rather than a migration, and the two-pixel divergence on Events and Control is a finding against their own items rather than 3.4's to fix. **Extraction of a shared `Card` was rejected twice, inside 4.4 under DL-84 and inside 3.4 on 2026-09-21, both times as right architecture wrong moment.**

⚠️ **DL-84 also struck A1 7.8 / `AB#1025`'s criterion 7**, so 7.8 no longer owns the `GraphWrapper` retrofit. `AB#1004` does. **The density-aware title sizing that AC 1 wants has no owner once 4.4 closes**, and that is an open filing question rather than a gap in the system.

**What follows is the 09-09 record, kept because its method lesson outlives its conclusion.**

**Two idioms are live on the five plant tabs and a user moves between them.**

| | card | title |
|---|---|---|
| **New**, Control (`AB#953`) and Events (`AB#949`) | `rounded-[14px] bg-white p-5 shadow-500` | `truncate font-display text-lg font-semibold text-hue-sky-900` |
| **Legacy**, Overview, Trends and Equipment | `rounded-lg bg-white p-10 shadow-500` | `font-bold text-lg` on the BODY face |

⭐ **The comparison that mattered was not the expected one, and Code says so plainly.** Its first census pointed at `GraphWrapper`, which made the new events card look like the divergence. **The newest card on the platform is Control's, so the events card was converging on the wrong sibling by two pixels rather than diverging from the platform.** Reconciled to Control exactly, `px-[18px] py-5` to `p-5`, the title to `text-lg font-semibold`, the panel to `p-4`, the filter trigger gap to 6px.

⛔ **`GraphWrapper` IS THE RETROFIT TARGET AND IT NOW HAS AN OWNER, A1 7.8** (Keith, 2026-09-09, *"i vote it should be on 7.8"*). One component sits behind three tabs, so retrofitting it inside each tab's own composition item is how three variants get created. Same reasoning as the plant shell header, which 7.8 also carries. ⚠️ **Until it lands, switching from Events or Control to Overview, Trends or Equipment steps the card radius and the title face.** Two of five tabs on the new idiom is the honest state.

### ⛔ THE TYPOGRAPHY DECLARATION CONTRADICTS ITSELF ON NUMERIC TABLE CELLS (found 2026-09-09 by Keith, measured by Code)

Keith's words, *"i also noticed the table uses different typographies. shouldnt it only use one?"* **He was right and the defect was Code's**, `font-display` on the Device and Time columns with everything else on the body stack, two faces in one table.

⛔ **But the declaration is what let the drift look principled, and that is the durable finding.** It says display carries *"the eyebrow, table headers, buttons, numeric table cells, units"* and separately says body carries *"textual table cells (plant names, serials)"*. **A serial is listed under body and a numeric cell under display, and a serial IS numeric.** A date column is the same problem. The declaration can be read to support either answer.

✅ **RULED BY THE BUILD, and it needs confirming rather than re-deciding.** Every data cell is on the body stack in the table and the panel, `tabular-nums` stays wherever digits sit in a column, and **the display face keeps titles and control labels only**. Measured support, `ComplexTable`, `DeviceInventoryList` and `PlantsList` all return **zero** `font-display` on cells, so Code's table was the only one doing it.

⚠️ **The declaration should be tightened wherever it lives.** Nothing has forced the question because neither font file is in the repo yet.

### ⚠️ Four control radii on one card, and only one of them is owned

On the events card, 7px on the rows-per-page trigger, 8px on the filter triggers, 9px on the search field, 10px on the footer strip. **Only the 8px is `AB#949`'s and it is the DS small row exactly.** The other three arrived with `AB#948`. The DS declares 8, 9 and 10 by size, so the filter triggers and search are right, and **the 7px trigger carrying a 12.5px label is below the DS small row**, the same drift already recorded against `AB#950`. ⛔ **Unowned, and deliberately not fixed inside 5.2**, because reconciling it would move controls that item has no reason to touch.

### ⚠️ One invented type value killed, and one value spelled twice

`text-[13.5px]` was **an invented value dressed as a declared one**. The DS small button row does say 13.5px and the typography ruling bars a half-pixel type value anywhere, so **the DS row and the ruling conflict on that number and the ruling wins** (DL-60's precedence rule). The label is 13px in rem. The row sub-line's `text-[11.5px]` had no neighbour in its file at all and collapsed to `text-[12.5px]`, the size six shipped lines in the same file already use. ⛔ **`text-[12.5px]` was NOT converted to the declared 12px `label` token**, because converting only the new lines would split one card across two sizes. That belongs to the px-type migration.

## ⛔ TWO COMPONENT DEFECTS RECORDED 2026-09-18, both from the `AB#1004` build, NEITHER FILED

Both went through the filing gate and both came out at zero cost, for different reasons. **Recorded here so
the next item that touches either surface picks them up.**

**`app/components/Tooltips/InfoTooltip.tsx` has NO keyboard path at all.** It is a `div` with `onMouseEnter`
and nothing else, which is the same defect Keith found on the chart card help icon and which 4.4 fixed for the
16 cards carrying one. ⛔ **It is live in three places on Grid Guardian Remote Control**, and the record has
it that the Dashboard Requirements never names Grid Guardian while **Area 5 claims its content**. So this is
another area's surface and files with that area when Area 5 is scoped, per the proposal's boundary rule.
⭐ **The general point worth keeping. The card help icon and this are one defect class, a hover-only control
with no focus path**, and 4.4 fixed one instance of it. **Assume more instances rather than assuming two.**

**`icons/Info.tsx` carries a hardcoded stroke of `#00ACFA`, which is in no ramp, and declares a 24 by 24
viewBox around a path drawn to 20 by 20.** ⛔ **That makes it the FIFTH icon-defect class on this page**,
joining `EmptyImage` having no viewBox at all. There is no unbuilt Area 1 item to append it to, so it is
recorded rather than carded. ⚠️ **The viewBox half is the dangerous one**, because an icon whose viewBox does
not match its path cannot be scaled without the caller repairing it, and that failure is invisible until
somebody changes a size.


### ⭐ Boundary sync, parts borrowed across tabs, to extract into shared components (recorded 2026-09-25)

None of these is moved yet, on purpose. Each is borrowed where it lives, because several open branches touch the files, and extraction waits for the queue to empty.

- `OverviewCell` and `OverviewPlaceholderCard` (`PlantStatus/Overview/`), borrowed by Trends in 4.5 / `AB#1022`, and the card wrapper also carries 4.5's range-change fade on both tabs.
- `SectionHeading`, in `PlantInformation.tsx`. ⚠️ **Trends carries a LOCAL copy** with the same markup, because borrowing it pulled the plant information card and two map chunks into the Trends bundle (measured, accepted by Keith 2026-09-25). So there are two copies to fold into one.
- `HelpHint`'s tooltip classes. The header wanted a shared `TOOLTIP` constant for its × bubble, which clashes with `!1046`'s themed tooltip, so the split waits until `!1046` merges.

## Changelog

- 2026-09-22: decision surface split out to `../../design-conventions/` (DL-102). No content changed here. This page is now the reasoning half and stays canonical for every measurement and rejected option.

- 2026-09-09 (day 85, later): ⛔ **the entries above were written from the 13:50 hand-back and four addenda followed.** Two corrections. The severity tiles were TINTED with the badge tokens at 14:40 and REVERTED to fully neutral at 15:05, so no status ground survives. And a bottom border is NOT a safe underline on anything carrying a radius, it follows the curve and closes into a box, so the 15:05 technique is superseded by a pseudo-element rule. Plus the typography self-contradiction above.
- 2026-09-09 (day 85): the plant tab card's two idioms recorded with both value sets, `GraphWrapper` named as the retrofit target and given its owner (A1 7.8, Keith's ruling), the four unowned control radii on the events card, and the `text-[13.5px]` invented-value finding with DL-60's precedence rule deciding it. DL-69's values are now applied-by A1 7.8 rather than unowned.

- 2026-09-08 (day 84, riders ruled): ✅ **BOTH DL-69 RIDERS TAKE `hue-ink-50` `#F4F7F9`, Keith's word, and they ride the same change as the page.** The `ComplexTable` header (today stock `bg-gray-100` `#F3F4F6`) and `PowerFlowChart`'s nine hardcoded `#F9F9F9` tiles both become **insets**, which is the role `hue-ink-50` already carries as `StatCard/index.tsx:179`'s fact tile. ⭐ **No fourth value is minted**, because one value per role is the thing DL-69 exists to restore. ⚠️ **Cost stated and accepted, the table header gets marginally quieter than today**, 1.076 against white rather than 1.101, and if it reads too soft the remedy is tuning in the browser per DL-68 rather than a new token. Keith's directive in his own words, *"all i want is distinction and depth of levels"*.
  ✅ **`Forms/DateFilter` IS RULED FIX, with a HOME rather than a date (Keith, 2026-09-08).** ⛔ **It cannot ride A2 5.2 / `AB#949`**, they share no file and no surface, `Forms/DateFilter` is mounted only at `Tables/BasicTable.tsx:50` and `_.GridGuardian.remote-set/CommonSetting.tsx:23` and the Events tab does not use it. **The picker Keith screenshotted is a different library**, `react-tailwindcss-datepicker` at `Navbar.tsx:158` and `TrendsDateRange.tsx:105`. ⛔ **And it does not go before 5.2 either**, because all five of its mounts are the routes filed as `AB#1009` and disclosed to Peter on 09-08, which is unbought Area 5 surface. ⭐ **Its home is the design system stream**, the depth retrofit item, since `evolved-datefilter/EvolvedDateFilter.dc.html` already names itself this component's reskin target and fixing the component needs no change to those routes. ⚠️ **It delivers nothing visible until Area 5 lands**, because no user can reach it today, so it is done when the DS pass sweeps components or when Area 5 is scoped, whichever comes first.

- 2026-09-08 (day 84): ✅✅ **TONE IS RULED AS DL-69, ONE STEP AND NOT THREE.** Base is the page at **`hue-ink-100` `#EDF1F4`**, a 1.136 step below white. **`elev-1` to `elev-6` all stay `#FFFFFF`**, separated by shadow alone. **`elev-0` inherits its container's tone**, so it is a rule not a value. The sidebar leaves the tone scale and takes a dark ground, `hue-ink-900` `#20262B` proposed and awaiting Keith's eye.
  ⛔ **Text rule is PER SURFACE. Small text directly on the page ground moves to `ink-700`** (7.24 on `ink-100`), because `ink-600` measures 4.35 there and fails AA. ✅ **`ink-600` stays correct on cards** at 4.94 on white, and most text lives on a card, so most text is unchanged. Page headings are large text and clear 3.0 comfortably at `ink-600`, so they do not move.
  ⭐ **The rationale that matters for future passes.** Every shadow currently falls on white cast by a white card, so the seven declared elevation levels render as almost nothing. **The page leaving white switches on the shadow scale rather than adding one tone level**, which is the actual answer to "everything looks flat". Three tone steps were rejected because the middle level lands at roughly 1.056 and 1.076, under the ~1.05 floor where a step stops reading, and **a marginal step reads as a dirty panel rather than as hierarchy.**
  ⚠️ **Riders, both consequences.** The table header `bg-gray-100` `#F3F4F6` collides with the new page and must move to a theme token in the same change. `PowerFlowChart`'s nine `#F9F9F9` tiles will sit above a tinted page and read inverted.

- 2026-09-08 (day 84, 10:48): ⭐⭐ **THE SURFACE TONE MEASUREMENT IS BACK, and the enabling change is one nobody had named.** Source only on `origin/dev` `ee76dc3`, no value proposed, nothing declared. ⛔ **THE PAGE BACKGROUND IS NOT SET ANYWHERE. On every route it is the browser default, white.** Zero hits on `<body`/`<html>` className across `app`, `root.tsx` renders a bare `<body>` at `:187`, the shell carries padding only (`Layout/index.tsx:71`, `:73`), and `app/tailwind.css`'s 9 `background` occurrences are map pins, transition lists, two transparents and a scrollbar thumb. **So the base is already at the ceiling and no tone step can exist until the page moves down.** Additive rather than a change, and it touches every route at once.
  ⚠️ **THE UNPRICED CONSEQUENCE. There are 172 `bg-white` declarations in `app/`.** Today almost all paint white on white with no visual effect. **The moment the base moves, all 172 start reading as raised surfaces at once**, including the ones never meant to be surfaces.
  ⛔ **TEN distinct opaque neutral values ship and only FOUR come from `theme/`.** 823 `bg-*` occurrences across 107 distinct tokens. `bg-white` 172, `bg-gray-100` 57, `bg-gray-50` 52, `bg-gray-200` 28, `bg-gray-300` 19, `bg-hue-ink-50` 18, `bg-[#f9f9f9]` 9, `bg-hue-slate-100` 7, `bg-hue-ink-100` 5, `bg-hue-stone-50` 5, `bg-hue-ink-900` 4. **Six are stock Tailwind grays or raw literals, so a token change would move fewer than half the surfaces in the app**, and two of the four theme ones are already `@deprecated` at `theme/colors.ts:43,51`.
  ⛔⛔ **THE APP EXPRESSES EXACTLY TWO TONE LEVELS AND ONE IS AN ACCIDENT.** Level one is white and it carries **six roles**, the page, resting cards (`StatCard:126`, `PlantCard` `CARD_BASE`, `PreviewCard:26-27`), table body cells (`ComplexTable.tsx:450`), map floats (`bg-white/95`), popovers (`Forms/DateFilter/index.tsx:37`) and modals. Level two is a **single** genuine inset, `StatCard/index.tsx:179`'s `bg-hue-ink-50` fact tile. `bg-gray-100` on the table header (`ComplexTable.tsx:405`) is a third value but not a third level, and at `#F3F4F6` it is DARKER than the inset tile at `#F4F7F9`, so the two disagree about which is deeper. ⭐ **That is the measured answer to Keith's "everything looks flat", a page, a card, a popover and a modal are all `#FFFFFF`.**
  ⛔⛔ **THE TWO CONSTRAINTS COLLIDE AT ONE VALUE, and this is the ruling Keith owes.** Legibility, `hue-ink-50` `#F4F7F9` is the LAST surface on which `ink-600` still clears WCAG AA 4.5 for small text, at 4.59. One step darker at `gray-100` `#F3F4F6` it is **4.49 and fails**. Visibility, a step below about 1.05 stops reading as a step, so the usable window is roughly **1.07 to 1.25**, which is `hue-ink-50` through `hue-ink-200`. **The visible band starts where the legible band ends.** So either the base stops at `#F4F7F9` and keeps `ink-600` legal but buys only a 1.076 step, or the base goes deeper for a visible step and page small text moves to `ink-700`. ⚠️ `ink-500` fails on white at 3.19 and everything below, `ink-400` never reaches 3.0 on any of these surfaces.
  ⭐ **THREE TONE STEPS, and the reason is checkable.** Four perceptible stops inside a 1.07 to 1.25 window puts adjacent pairs under 1.05, which is the band where a step stops reading. Two would work and waste the range. **Grouping of the seven elevation levels**, base is `elev-0` when it IS the page, **surface** is `elev-1` `elev-2` `elev-3` (they already differ by shadow and **must not differ by tone or a selected card would change colour**), **float** is `elev-4` `elev-5` `elev-6` (detached from the page, so all three take the ceiling, which is white). `elev-0` is not really a level, flush means the tone of whatever contains it. ⚠️ **Three of seven sitting at white is what PRESERVES the 172 existing `bg-white` sites on overlays and modals.**
  ⛔ **CARDS CANNOT ALL STAY WHITE.** If base is below white and cards are white that is two tones and the third has nowhere to go. Cards taking the middle tone means editing the resting fill in `StatCard`, `PreviewCard` and `PlantCard`, three primitives, then the 172-site question for everything else.
  ⛔ **`PowerFlowChart` IS THE CONTAINED RETROFIT AND THE FIRST THING TO LOOK WRONG.** Nine components hardcode `bg-[#f9f9f9]` `#F9F9F9` (`DCBusBar:26`, `LuminPanel:82`, `PolarisLug:26`, `SimpleGrid:5`, `SimpleInverter:5`, `SimpleLoad:5`, `SimplePanels:5`, `SimpleStorage:5`, `Unknown:67`), a near-white that would sit ABOVE a tinted page rather than below it. One subsystem, so contained. Also load-bearing, the 25 `fleet-map` rules and the MapLibre canvas, the 22 black-alpha modal scrims whose resolved colour changes, and 5 `animate-pulse` skeletons. ✅ **Charts are NOT a constraint**, `fill="#fff"`/`fill="white"` across `app/components/Charts` and the PlantStatus graphs returns 0, so they inherit and follow. ⚠️ **The 44 `backgroundColor: '#xx000000'` values in `mockData.ts` are a red herring**, 8-digit hex with alpha `00`, fully transparent.
  ⚠️ **THE HONEST CAVEAT ON KEITH'S SENTENCE. Tone alone will not fix flat.** Maximum visible separation between page and a white card while keeping small text on `ink-600` is a **1.076** ratio, a real step but a quiet one. **The shadow channel does most of the work in every version of this**, and tone's job is to stop six roles sharing one value rather than to carry depth by itself.

- 2026-09-07 (day 83, late): ⛔⛔ **THE READ FOUND TWO PICKERS AND COWORK HAD BRIEFED THE WRONG ONE.** Keith's screenshot is `react-tailwindcss-datepicker` in the Navbar and Trends, not `Forms/DateFilter`. Twelve presets not fourteen, Cowork counted by eye. The undefined-utility hypothesis is REFUTED for the picker that matters and CONFIRMED for the other one, which is separately shipped broken with dead presets and no base styles. Strikethrough is hardcoded in the library and fixable with one app-side rule. Today and selected do differ. The blue bar is deliberate.

- 2026-09-07 (day 83, evening): ⚠️ **the date filter recorded with its four problems, its split and its park.** Strikethrough-as-disabled, a flat popover, proportional digits in a numeral grid and link-blue options are all convention violations with declared fixes. The preset redesign is new scope for Peter at the A1 close-out. A possible correctness finding sits under it, presets that offer ranges the app truncates. Pre-existing component, which is what settled the money.

- 2026-09-07 (day 83, evening): ⭐⭐ **DEPTH GETS A SECOND CHANNEL, DL-68.** Keith ruled one scale with two expressions after bringing a dark-mode reference deck, so every `elev-n` gains a surface fill beside its shadow. His stated problem, everything looks flat, is recorded as the specification the tuning answers to. Two independent systems and tone-only were both rejected with their prices. Shadows ship at declared values and get tuned in the browser, since a value change is one file. No tone value declared until Code measures the shipped palette and the per-tone contrast floor. ⛔ Cowork's earlier claim that re-tuning would touch every call site was wrong and is negated in place.

- 2026-09-07 (day 83, evening): ⛔ **the 08-31 DS icon-library ruling was NEVER mirrored to the repo**, so Code could not have followed it, and `!1037` shipped two local glyphs without naming a queue item. Rule now in the repo's `CLAUDE.md` with the queue at four, expand, Grid Guardian, Pre-PTO, and a `Shield` that cannot recolour.

- 2026-09-07 (day 83, evening): ✅ **THE REPO MIRROR IS RECONCILED for the three 09-07 design items**, so Code can see them. The dropdown exception is written into the repo's `CLAUDE.md` beside the never-animate-spacing rule AND beside the outline-not-border rule, with its scope and its four mitigations, and marked not a precedent. The secondary-button rule (a new button takes the secondary until 745's elevation tokens land) and the `InfoHint` duplication (two homes as of today, do not add a third) are written beside the interaction contract's shared-helper note. ⛔ **Reason this is worth a changelog line, a design decision recorded ONLY here is invisible to Code**, which cannot read `C:\cowork\`, so the next pass would have read the prohibition, seen the shipped dropdown and called it a defect.

- 2026-09-07 (day 83): ⚠️ **the first ruled exception to the no-layout-shift and one-shot-height rules recorded**, the `AB#953` Control dropdown's revealing rows, scoped to that popover with its mitigation, at Code's request from the hand-back. Also from that build, `Save` on Control ships as the secondary button because the primary's hover lift needs the elevation tokens still on the unpushed 745 branch, and the reserve field's info tooltip is `Control/InfoHint.tsx`, a LOCAL COPY of `StatusDonut`'s inline tooltip markup, not shared (Code, 09-07). Second copy of that pattern in the tree, shared-helper candidate at the next boundary sync.
- 2026-09-07 (day 83): the 08-02 alert-card template disagreement is CLOSED by Keith, not reconciled. Instruction at the top of the page negated in place.
- 2026-09-04 (day 80, later): ⛔⛔ **NONE OF THE SEVEN TRENDS CHARTS USES THE DESIGN SYSTEM**, Keith's catch on his `!1035` pass, counted by Code. **51 raw hex literals**, zero `statusToHex` or token reads, all seven in the legacy `GraphWrapper` rather than the card system, Recharts defaults never replaced. ⭐⭐ **Folds into DL-64 as ONE Trends design item with four parts** rather than three separate filings, axis normalisation, tokens, the card system, and the two-zone layout. ⚠️ The DS has no per-chart template for these six chart types, so the treatment is primitives plus the categorical palette plus tokens. Also surfaced, `BalanceOfSystemsGraph` swallows real errors by looking up a nonexistent errors key.
- 2026-09-04 (day 80): ⭐ **THE TRENDS NINE MEASURED, and it produced DL-64.** Seven charts share a time axis, **two are categorical** (balance of systems is per inverter, financial trend is per category), and the shared time axis carries **five different key names**. Read from each chart's `XAxis dataKey`, not inferred from titles. ⛔ The slot registry knows none of this, it classifies by `tier` and `expected`. **DL-64 rules that charts sharing an axis align with the axis drawn once and categorical charts get their own zone**, cheap axis normalisation first, layout second, and explicitly NOT inside 4.3. ⚠️ Two undeclared things found on the way, the slot cards apply a 3D pointer-tracked tilt the interaction contract does not list, with a state update per mousemove across nine cards, and `tier` is a field nothing reads.
- 2026-09-03 (day 79): ✅ **The four Design-couriered slugs are PLACED on disk by hand, all nine files**, `callout/` `tag/` `severity-system/` and a new `toast/`, harness and thumbnails skipped. ⭐ The first verification pass found eight, `callout/CalloutGallery.dc.html` absent, and Keith closed the gap the same hour. It was caught only because the pass LISTED THE FOLDERS instead of accepting the placement as reported, which is the cheap control paying for itself. ⛔ **The branch read route is RETIRED.** `chore/ds-templates-reference` is merged into `dev` and frozen at `00b115e` 2026-07-16, holding 106 files against 108 on disk with no `toast/` and no galleries, so `git show` against it returned July content and exited 0. Rewritten to read the disk on both surfaces Cowork owns, root `CLAUDE.md` and `docs/AREA-BUILD-GUIDE.md`, each with a do-not-check-it-out warning because a checkout silently overwrites the on-disk copies. ⛔ The false "templates are not in the working tree" claim negated in `docs/a1-work-items.md` too, kept rather than deleted since it is what produced a wrong recommendation. ⚠️ **DL-17's vendored-sibling trap caught live and measured**, `domain-control-readout/SeverityBadge.dc.html` declares five variants including the dropped `dot` and `dot-only` while canonical `severity-system/` declares three, so the component-named slug beats the surface-named one. ⛔ And my own courier note said "four-variant" where the measurement says five, an unmeasured count written into an instruction.
- 2026-09-02 (day 78): ⛔ **CORRECTED, and it was a factual error on a scope note. PETER ASKED FOR MULTI-DEVICE ON DAY 3.** Verbatim from the Slack DM, 2026-06-19 13:35 CST, he wanted the first areas to "look good across multiple devices" as one of three named asks. **So the recorded claim that he has never scoped mobile is false and was never checked against the channel.** The conversation becomes how far multi-device goes, not whether. ⭐ **And the visual pass was already PROMISED to Peter on 2026-08-17**, including that A1 carries known visual and spacing inconsistencies and that the polish pass was always the sprint's closing step which scope growth ate, with one pass over the merged whole owed once the queue landed. The queue landed 9/1. ⚠️ So the A1 half of the retrofit was already inside the $1k bundle and absorbing it is the deal rather than a concession. ⛔ The Notion KB has no independent record of either, being derived from the wiki, so **search the channel and not the digest for what a person said.**
- 2026-09-02 (day 78): ⛔ **`Button/index.tsx` read in full, 30 lines, FIVE findings.** Read to answer whether buttons could take the display face inside AB#991. **They cannot usefully, because NO variant carries a weight class** — every label renders at 400 while the DS specifies 600, so adding the face alone ships the new typeface at the wrong weight. The DS button spec is a package (face, 600, leading, tracking, three sizes with their own padding and radii) and half of it is not half an improvement. Also found: `font-sm` on two lines is not a Tailwind class and appears to emit nothing (candidate, not yet emit-checked), the `default` variant silently DROPS the caller's `className`, and line 12 pairs `bg-hue-sky-800` with `hover:bg-sky-700`, mixing the project ramp with Tailwind's stock palette AND darkening on hover, which the day-77 button ruling prohibits. All revealed by reading rather than by a build, so they ride the owning item under DL-45. ⭐ **Consequence: `Button` should be the FIRST convention-application item** — one file, thirty lines, demonstrating six of the nine conventions at once.
- 2026-09-02 (day 78, typography closed): ✅ **Keith ruled OVERUSED GROTESK CARRIES TITLES AND ALL NUMERALS, OPENING HOURS SANS CARRIES PROSE**, forced by measurement. ⛔ Opening Hours Sans has **no `tnum` at all** and proportional digits at 367/550/600/638, verified by HarfBuzz shaping, so the tabular-figures ruling is permanently unsatisfiable on the body face. The amendment is one sentence rather than a table reshuffle, wherever tabular figures apply the display face applies. ✅ **This closes the open BUTTONS question by capability**, since a 600-weight label cannot live on a single-cut face without synthetic bold. ⚠️ **A first probe said both faces were uniform and was FALSE**, `uharfbuzz` cannot read WOFF2 so every glyph came back `.notdef` at a default 500 advance; the control run caught it, which is the zero-needs-a-control rule paying for itself the day after it was reinforced. ✅ Both files converted, subset and verified AFTER subsetting, 28,028 and 8,516 bytes against Space Grotesk's 22,288. Code brief written to `docs/agent-mail/from-cowork/typography.md`.
- 2026-09-02 (day 78, typography ruling): ✅ **Keith ruled THERE IS NO DEFAULT FONT ANY MORE, so `sans` is OVERRIDDEN rather than supplemented.** This settled a question day 77 did not know it had: `theme/fontFamily.ts` carries exactly ONE key, `display`, and there is no `body` key, so body text has been rendering Tailwind's stock `font-sans` system stack all along. The rejected alternative was adding a `body` key, which is safe but ships looking like it did nothing until all eleven body roles are touched. ⚠️ The blast radius is the point, so text nobody deliberately styled WILL change on first load and that is not a regression. ⛔ Two further corrections: **net change is ONE file out and TWO in**, not two out, because the body face was never a file; and the font files must be in the tree in the same push as Code's commit or earlier, since a missing file 404s silently and presents as the change not working. Ownership written out explicitly, Cowork converts and writes the mail, Keith drops the files and pushes, Code does `app/**` and `theme/**`. ⚠️ **BUTTONS left OPEN**, the one place Keith's "major, important text" framing disagrees with the approved table's body-face assignment.
- 2026-09-01 (day 77, typography, DECLARED): ⭐⭐ **The last item on Keith's original conventions list, and the
  only one whose subject does not exist in the repo yet.** Two faces replace two, **Overused Grotesk** on
  display (in for Space Grotesk) and **Opening Hours Sans** on body (in for the inherited `ui-sans-serif,
  system-ui` stack). Keith confirmed commercial licensing on both himself. ✅ **Format ruled WOFF2 converted
  from the TTF**, latin-subset and variable where a variable file exists, because the repo's single existing
  self-hosted face sets that pattern exactly (`app/tailwind.css:1-10`, `space-grotesk-latin-variable.woff2`,
  22,288 bytes, `font-weight: 300 700`, brotli). ✅ **17 text roles assigned**, display carrying identity and
  magnitude (figures, delta badge, card titles, page title, Callout title, chip label) and body carrying
  everything read for content. ⚠️ **Buttons are on the BODY face on purpose**, because the real DS Button
  template at `design/templates/form-controls/Button.dc.html` sets `font-family: ui-sans-serif, system-ui`
  rather than Space Grotesk, so the declaration follows the DS instead of overruling it. ✅ **Ten rem type
  tokens declared** with tracking and leading columns, endpoints -0.02em on display and +0.05em on the eyebrow,
  leading 1.05 to 1.5. ⚠️ **12.5px collapses to 12px**, recorded as a deliberate overrule rather than a
  rounding, since 12.5 is the app's most common arbitrary type value at 31 uses AND the DS chip and action-link
  size. The small band goes 11 / 11.5 / 12 / 12.5 / 13 to 11 / 12 / 13. ⚠️ **CORRECTED 2026-09-02, `tnum` does NOT gate adding the fonts and Space Grotesk is now MEASURED CLEAR (`tnum` present in the shipping woff2 and the loose TTF). It gates only the tabular-figures half of the alignment ruling, and the real requirement is on the CONVERSION COMMAND because `pyftsubset` drops `tnum` by default. Also corrected, the font directory is `public/fonts/` and NOT `app/public/fonts/`. Originally written as**  ⛔ **STILL OPEN and gating an already
  ruled convention, `tnum` is unverified on both new faces** and unre-checked on Space Grotesk, which makes the
  tabular-figures ruling unbuildable until Keith checks it. It bites hardest on Opening Hours Sans because two
  of three tables render in the body stack. ⛔ **Nothing is applied and neither font file is in the repo.**
  Keith adds them manually, so a component authored against this scale today renders the old faces.
- 2026-09-01 (day 77, alignment and spacing, RULED): ⭐⭐ **The last item on Keith's original list except
  typography, and the round where reading the REMAINING FIVE agent skills changed four already-approved
  calls.** ⛔ **Cowork retracted its own four-tier "relationship ladder"** — inferred from 400 of 830 gap
  declarations, destroyed by the full histogram, which is a smooth ramp (5 to 12px carrying 472 of 629, 25
  distinct values, no clustering). **The conclusion inverted: the DS has no spacing system either.** Filed as
  an incident with the rule that a partial count may generate a hypothesis but must not be written as a named
  structure. ⛔ **So ruling 1 REVERSED after Keith had already approved it**, from "add the odd steps to
  `theme/spacing.ts`" to **"use Tailwind's stock scale and mint no new spacing tokens"**, because there was no
  rhythm to be faithful to. A second Cowork error corrected inside it, the 1px-is-visible argument is true of a
  radius on a pill and false of a gap. ✅ Ruling 2, **new tokens in rem, stop minting px arbitraries, no
  migration**, strengthened by measurement (528 px against 17 rem, 122 of them TYPE, no root font-size so those
  122 are the live accessibility defect). ⛔ **Then Keith asked whether the recommendations were skill-sourced,
  a provenance audit was run, and reading the five unread skills changed four things.** Tabular figures
  **widened** from columns-only to "wherever digits change in place OR sit in a column", per the glossary's own
  test, with number tickers and text morphs REJECTED on data. Destructive buttons: the stated reason (no confirm
  pattern exists) was **wrong**, since **hold-to-confirm is a named house pattern with an implementation**, so
  a solid destructive is now permitted with it. The toast spec **violated three house rules at once** and is
  corrected, percentage translate not hardcoded px, transitions not keyframes, symmetric exit path, plus
  swipe-to-dismiss on velocity which it had omitted entirely. And shimmer-on-hover is now properly rejected,
  since the glossary reserves shimmer for loading placeholders. ✅ Rulings 4, 5 and 6 declared, **numeric
  columns right-align** (a defect fix, `text-right` appears 4 times in the app and none on numeric content),
  **a shared value edge needs a grid** (`justify-between` at 160 uses cannot deliver alignment across
  independently sized cards, so the ragged edge is structural), and **`items-center` on every icon-plus-label
  row** (44 of 115 lack it). ⭐⭐ **The number that answers Keith's original complaint: 472 of 855 flex and grid
  containers, 55.2%, declare no gap at all.** Also recorded, the skills live in `.agents/skills/` not
  `.claude/skills/`, the hover guard is emit-verified automatic for Tailwind utilities with only 4 of 8
  hand-written guards removable, and a real Bug found, `Button/index.tsx` hard-codes `min-w-[128px]` on five
  variants around a text label.
- 2026-09-01 (day 77, banners, notifications and chips): ⭐ **UX DECLARED FOR ALL THREE ACROSS ALL THREE PHASES,
  and the coverage measurement found that one of the three does not exist.** ✅ Chip is fully defined in the DS
  with a gallery and needs no design work, 12.5px Space Grotesk 600, r999, `5px 12px`, nine colour families.
  Banner is `callout/Callout.dc.html`, defined for four severities but with **no gallery and no size variants**.
  ⛔ ~~There is NO toast, snackbar or transient-notification template anywhere in the 100-template inventory.~~ ✅ **SUPERSEDED 2026-09-03, `toast/Toast.dc.html` exists.** True as at 2026-09-01.
  `NotificationInbox` is a persistent LIST, not a transient notification, so the one component whose entire
  nature is arriving and leaving was the one never described, which is why its UX was never specified.
  ⚠️ **Two more duplicate-template traps found**, `Chip` and `SeverityBadge` each exist twice with a
  `domain-control-readout/` local copy, same shape as today's Button error, with the standalone folder ruled
  canonical in both cases. ⭐ **The governing principle: the three differ by who started it and what a miss
  costs**, which generates every rule. ⛔ **Two correctness rules came out of it, not style rules. A TOAST IS
  NEVER THE ONLY CARRIER**, since an operator who looked away for four seconds must not lose a fault, and if a
  message has nowhere durable to live it is a banner rather than a toast. And ⛔ **error and fault toasts NEVER
  auto-dismiss**, the one asymmetry in the dwell table. Also declared, one channel per message so nothing fires
  both a toast and a banner, banners never time out and coalesce rather than stack at a max of two, banner
  dismissal remembered per condition instance rather than per session, a fault banner never dismiss-only, chips
  never animating in on a data refresh, max three toasts with a "+N more" coalesce, pause-on-focus as the
  accessibility requirement that makes dwell timers safe, and the `Callout`'s dismiss glyph reconciled toward
  the app-wide close-button spec.
- 2026-09-01 (day 77, the card system): ⭐ **CARDS DECLARED ON TWO AXES, after Keith rejected the one-scale
  version.** His objection was that a tier defined as a size breaks across areas, since Area 1's primary band
  cards cannot be large no matter how important they are. Correct, and it split the model: **DENSITY comes from
  the card's rendered WIDTH** (compact 12x12 / 13px / r10, standard 18x16 / 15px / r12, feature 18x20 / 18px /
  r14, inset tile 14x12 / no title / r10 flat) and governs only padding, title size and radius, while
  **PROMINENCE comes from hierarchy** and governs content and treatment but never geometry. So high prominence
  plus compact density is now expressible, which it was not before. ✅ Height ruled **ANATOMY ONLY**, no
  min-heights at any density, with equal heights in a row owned by a grid stretch rather than by the card.
  ✅ Cards ruled **dynamic by default**, stepping density down as they narrow, and ⛔ **via CONTAINER queries
  not media queries**, because the same card sits in a 4-up band and a 2-up layout at the same viewport and a
  media query cannot tell those apart. Measured that this needs no config or package change on Tailwind 3.4.3,
  so it is not queue-gated. ✅ Text overflow rules declared, and ⛔ **one of them is a correctness rule rather
  than a style rule, NEVER ellipsis a number**, since a clipped figure reads as a real and much smaller one in
  an application whose whole job is reporting figures people act on. ✅ **Card headers ruled TITLE CASE**, which
  is a deliberate override of the DS since both measured card titles are sentence case, recorded as a named
  exception to DL-13 with the negation written so a future reader does not "correct" it back. The eyebrow
  label, the worst-drifted thing in the system across 30-plus templates, collapsed to one set of values.
  **Root cause of Keith's complaint found and recorded: the DS declares almost no `min-height` anywhere**, so
  card height was entirely content-driven.
- 2026-09-01 (day 77, shape and button elevation): ⭐ **SHAPE DECLARED AS A CHANNEL, from a census rather than
  from taste.** Keith asked whether buttons should lean round or square. Measuring all **909 `border-radius`
  declarations** in `design/templates/` showed the DS already splits radius into **four bands by role**, fully
  round for labels, states, toggles and identities, soft rectangle 6 to 10 for every command and input,
  container 12 to 14, micro mark 4. **No button-scale control in the DS is a pill and no control anywhere is
  square.** So buttons stay in the soft-rectangle band, a pill button and a square one are both prohibited,
  and the round-leaning brief is met at the chip and state layer where round already carries meaning. The
  "solar panels are square" argument rejected with its reason recorded, it applies the subject matter to the
  control layer when the data layer already carries it. ⭐ **BUTTON ELEVATION RULED, and Keith's question found
  a real gap.** `elev-1` had been declared for all resting controls undifferentiated, so a ghost button and a
  solid primary would have cast the same shadow. Reframed as **elevation follows SURFACE, not importance**,
  because a control with no fill has nothing to raise. Primary `elev-1` to `elev-2` on hover, every unfilled
  variant `elev-0` always, disabled `elev-0` in every variant, pending keeps its rest step and never lifts.
  A graded-by-importance scale rejected because `elev-2` is the resting-card step and a primary resting there
  would match its own container. `elev-1`'s row in the token table narrowed to filled controls only, and the
  absolute-versus-relative tension named with a rule, a control never rests at or above its container's step.
- 2026-09-01 (day 77, the four rulings and the WRONG-TEMPLATE catch): ⭐ **Keith ruled all four and one of his
  rulings was a correction that found a whole template.** ✅ Primary hover: **do not darken**, the fill stays
  `hue-sky-800` and hover is a one-step elevation lift; 900 and a new `hue-sky-700` both explicitly rejected.
  ✅ The close button's blue: **`hue-sky-500`, one colour for the glyph AND the outline**, applying the
  standing one-blue rule, after both candidate sources turned out not to exist. Keith's clarification also
  **completed the spec**, hover changes three things at once and the X itself recolours, which the earlier
  version had missed. ✅ Shadow colour: **near-neutral confirmed and re-confirmed**, against Cowork's
  recommendation to match the repo's navy `shadow-card`, on the reason that a shadow should look like a
  shadow. The navy-to-neutral shift on migration is therefore INTENDED and 899 ships it named. ⛔ **Sizes: the
  read was against the WRONG BUTTON TEMPLATE.** Keith said the DS had declared sizes, and it does.
  `form-controls/Button.dc.html` and `form-controls/ButtonGallery.dc.html` carry `sm` 13.5px / `7px 13px` /
  r8, `md` 14px / `9px 16px` / r9, `lg` 15px / `11px 20px` / r10, a six-way `hierarchy` enum, a five-option
  size enum of which only three are visually defined, and a `loading` state that IS our `pending`. **So
  "radius is settled at 9px" was wrong and is retracted, radius scales 8/9/10 with size.** Also recorded: the
  DS `secondary` is a filled grey and NOT our outline secondary, the DS `disabled` is a half-opacity blue that
  our own rule forbids, and `#CFE8F6` (the DS outline border, untokenised) is the same hex as FleetMap's one
  hardcoded blue border, so that stray is a faithful port rather than a mistake.
- 2026-09-01 (day 77, the six reads): ⭐ **the measurement round that turned today's three declarations from
  written down into buildable, and four of the six came back against the assumption.** ✅ CLOSED: the four-tier
  status set EXISTS and every `bg-status-*-soft` emits, so `tint` is buildable and the 7/28 avoid-status-tokens
  instruction is superseded and negated in place. `shadow-plugin` is ABSENT, so `elev-*` is confirmed fully
  additive and the `smooth-shadow-ring` skill is INERT here. ⛔ **This round's "radius settled at 9px"
  conclusion is RETRACTED by the entry above**, since its size read was against the wrong template.
  ⛔ OPENED OR OVERTURNED: the `hue-sky` ramp has **no step between 800 and 900** and the
  two differ by 1.31:1 across a hue change, so the primary's hover has no in-ramp answer and Keith rules.
  **The popover has no blue edge at all** and `rgba(31,65,115,0.20)` is nowhere in `app/**`, so the close
  button's "follow the popover" ruling had no source and needs re-taking. The focus defect is **7 controls,
  not 18 upward**, because 16 of the 23 bare sites are Headless UI panels behaving correctly, so prohibition 1
  gained an explicit exception and its overstated framing is retracted. And **`shadow-card` is already
  navy-tinted** at `rgb(16 42 79)`, which reopens the shadow-colour question in favour of tinting.
- 2026-09-01 (day 77, buttons): the button APPEARANCE layer declared, five variants with one primary per
  region as the load-bearing placement rule. The DS template's failing solid primary corrected to white on
  `hue-sky-800` at 7.76:1 using an existing step rather than a new token, and `!1026`'s shipped grey outline
  button promoted to the house secondary rather than re-derived. Tertiary floored at `ink-600` on the measured
  ramp. Destructive kept as an outline because no confirm pattern exists yet. Two things deliberately left
  unset and named as measurements, the primary's hover step (whether sky 800 to 900 reads as a darken) and the
  three size values (AB#950's 13px row buttons against the DS template's own numbers). Six prohibitions
  recorded, and the three things buttons do not settle named so they are not absorbed. ⛔ Also found while
  checking whether the contract was finished, and it is the larger finding of the two: **`tint`'s treatment
  names a token family that the 7/28 measurement says does not exist on `dev`**, since the four-tier
  `status-*-soft` set sat on 725, 726, 727 and 820. Twelve merges have landed since, so it must be read on
  `0decd5d` rather than assumed in either direction.
- 2026-09-01 (day 77, later): the close button recorded as the first COMPONENT SPEC rather than as a hover semantic, with Keith's ruling that tilt stays as one of the six and the rotating X is a separate thing. The 45-degree trap named (an X rotated 45 lands on a plus sign). Outline over border locked on the layout-shift prohibition. Two things open at the time of writing, the popover's actual outline value and the hover-blue against focus-ring-blue collision. ✅ **BOTH CLOSED LATER THE SAME DAY.** The popover was measured, `PlantInfoWindow.tsx:117` carries a grey `border-hue-gray-300` and no blue edge at all, and the collision is dissolved rather than managed by the one-blue ruling, `hue-sky-500` for both with width or offset doing the distinguishing.
- 2026-09-01 (day 77): ⭐ **ELEVATION DECLARED, and shadow now means one thing.** Six steps mapped to surface types, hover defined as a two-step lift which finally gives the DS template's "lifted shadow" a number, and the contact hairline adopted from the six-layer reference as the first layer of every card-level step. The reference scale identified as Tailwind's own resoftened, so this is a re-tune rather than a new system. Recorded and NOT applied, the token half is queue-gated and owned by task 899. Two things left open, the shadow colour (tint to the ink ramp or stay near-neutral) and the repo's current shadow tokens, which are unmeasured and Code's to read.
- 2026-08-31 (day 76): Keith's standing icon ruling recorded, icons come from the declared DS library and a missing glyph is added to the DS rather than left repo-only. Live instance is 4.1 / AB#945's Expand icon, with the DS-library check asked of Code.

- 2026-08-28 (day 73): the capacity-card template's icon-not-colour semantics recorded with its two exact token matches and the one label colour that has no token, plus **the fourth icon-defect class**, a no-viewBox glyph that cannot scale without the caller repairing it. Seven line icons added by `!1030` because the existing Battery and Panels icons are gradient illustrations unusable at mono sizes.
- 2026-08-27 (day 72, late): measured contrast ratios on the ink ramp against white (ink-500 3.19 fails, ink-600 4.94, ink-700 8.22, sky-800 7.76), so ink-600 is the floor for small text on white. HelpIcon added to the hardcoded-fill icon census, Setting confirmed currentColor-clean. The device table's role=grid treatment recorded with its Tab-versus-arrow-key simplification named.
- 2026-08-27 (day 72, night): Keith's visual-pass rulings on the equipment strip and table (status-tinted hover from token ramp steps, readout-only per DL-53, the anomaly qualifier deleted, Settings as a square icon button, both actions onto DS buttons with the AA and hover-step traps named and `!1026`'s resolution pointed at), plus the two defects found: horizontal overflow clipping the Actions column, and no focus ring on any new interactive.
- 2026-08-27 (day 72): the equipment status strip recorded, six stat cells at 38px (the StatTile size, chosen after the audit rejected an implied third size), tokens only with the `#32F8B0` All fill deleted, anomaly present-and-disabled at zero per DL-34 with its caveat in visible text. Also corrected: `statusToHex` was never the anomaly gap, the tile component's own four-status list was.
- 2026-08-25: AB#940 design-pass findings recorded above — the Button primary's AA fail, the sky ramp's missing hover step, the icon-set census with three currentColor additions, and the PlantShell tabs-frame half consumed with the repo leading the DS on slide/active-icons/button hierarchy. All verified in `from-code/940.md`'s addenda with emitted-declaration checks.

- 2026-08-24 (later): **fleet-map divergence 10 WITHDRAWN as convergent, and a PlantCard interaction record added.** The world-copy row was wrong twice over: the template already carries `renderWorldCopies: false` and `minZoom: 2` at `:217-218`, so the repo converged rather than diverged, and the row's "template NOT ESTABLISHED" note rested on a claim that `design/templates/` lived on `chore/ds-templates-reference` when the whole tree is on the working tree. **Reading it took one command.** Moved to the convergent list with both errors named. Separately, the new PlantCard section records what the template does and does not carry for 4.3: purely presentational, no interactive elements at all, whole-card `cursor: pointer` with "Tap to open Area 2" as its stated intent, and no hover behaviour for the mini viewport's pan to attach to. **The design-intent comment sits on the non-canonical copy**, and the `AREA-BUILD-GUIDE` contradicts itself between its dedupe table and its inventory table on which copy is authoritative.

- 2026-08-24: **added fleet-map divergence 10, world wrapping and the zoom floor, from the 6.1 / AB#742 build**, and corrected this section's own "nine places" and "all nine" to ten. **Recorded here rather than filed as a Bug, on Keith's ruling.** The gate is why: the change turns off MapLibre's own default, so there was never an open defect, and 4.1 / AB#734 is `Done` so it cannot absorb it either. `!1023`'s description flagged the change as untraceable to its work item, and **this row is what makes it traceable**, which a Bug filed already-fixed would not have done better. **The row's template column is deliberately blank rather than guessed**, because `PlantMap.dc.html` sits on `chore/ds-templates-reference` and was not read; it may prove convergent at the boundary sync. Same sitting: the `future.hoverOnlyWhenSupported` finding went to task 899's porting-debt scope rather than becoming a second Bug, since `a1-work-items.md:436` shows the `(hover: hover) and (pointer: fine)` gate was settled as the project's pattern on 2026-07-28 and nothing is broken today.

- 2026-08-22: **`StatusDot`'s decorative mode recorded with its truth table (AB#871), and the four deprecated neutral ramps measured with their command.** The truth table is here rather than only in the code because the fourth row is forbidden by the type and the repo's no-comment standard leaves nowhere in the file to say why. Also recorded: `StatusDonut`'s legend is `StatusDot`'s first render site anywhere in the app (zero consumers before it, measured), so "shipped" had meant "exists with tests"; the DS template carries no aria at all, making the aria behaviour a repo-side addition; and `StatusDonut` appears twice in the DS, under `chart-primitives/` and `status-donut/`. The ramp figure is **227 occurrences across 61 files**, not filed and deliberately so, but recorded with its grep because it first arrived as "roughly 60 files" with no method attached. ✅ **The AB#878 `hue-neutral` follow-up is closed** by `a6c4222`; it should not be carried forward again.
- 2026-08-14: **added the PreviewCard Grid-figure divergence record (AB#733).** The template specifies grid frequency; the card ships grid share of supply, because frequency exists at fleet scope on no endpoint and the two fallbacks either page 106 rows or aggregate a per-plant minimum into something that is not the grid's frequency. DL-13 does not resolve this class, since it presumes the Design version is buildable. Filed as a DD row (fleet-level grid frequency, Non-blocking, New, Requested) so the divergence has an end date rather than becoming permanent by default. Third instance of the guide-first check running late, this time after a ruling had already gone out.

- 2026-08-13: added the StatCard template-alignment record from PBI 3.7 — the AREA-BUILD-GUIDE row-name trap (`CapacityFacts` is the Area 2 template, not this one), the finding that the deprecated neutral ramps and the design gap are the same gap with five exact-hex corrections, StatCard shipping with no `font-family` at all, and the DS's numerals self-contradiction resolved as an opt-in prop (DL-36). Recorded what was deliberately not applied: the inline fact layout, card chrome, the Export button and the "Across N sites" note.
- 2026-08-12: recorded the `animate-status-pulse` retune, its new reduced-motion guard, and the fault-only scoping (AB#891, DL-35). Flagged that two independent status-motion systems now exist and must reconcile when 735 and 878 land.
- 2026-08-11: **added the fleet-map divergence record**, the deliverable AB#837 was rescoped to produce after AB#734 and AB#735 built a map the DS template no longer describes. Nine divergences, all reconciling toward the repo per DL-17. 4.6 dropped from Effort 2 to 1 and stopped being a code item; task 868 retitled from "Port fleet-map redesign into the repo".
- 2026-07-16: page created; consolidates the 7/14–7/15 DS threads (DS-first, palettes, handoff, integration investigation, local-layer decision).
- 2026-07-16: noted the neutral-palette gap (structural grays not tokenized) + the porting convention; queued the DS neutral-ramp task (from the 2.3 plan).
- 2026-07-20: MapTiler note updated — dev uses Keith's own account/key (no billing); org account is a prod item.
- 2026-07-21: StatusDot size decided (7/9/11, md 9, 2px halo); clears the 2.6 size gate.
- 2026-07-22: rewrote the opening section to DL-13 (repo is source of truth; DS is a reference) — the body still said "DS is the source of truth," contradicting DL-13. DL-13 also now formally recorded in the decision-log (it had only been cross-referenced); DL-6 marked superseded.
- 2026-07-22: refined the DS-role section — repo is the primary source of truth, but for COMPONENT work build toward the hand-curated Claude Design components (they are the design intent, not a disposable reference); corrected the earlier "repo wins on disagreement" framing (Keith's clarification).
- 2026-07-22: DS-cleanup (Cowork #2) completed by Claude Design — reference aligned to AB#825 (uppercase prop removed, badge dot-variant dropped, StatusDot 7/9/11 with lg fixed 12→11, count formats recorded). Marked the DS-side items done.
- 2026-08-24 (later still): **the PlantCard record extended to three click models after Keith's 6.2 rulings.** One template now serves three placements that disagree about what a body click does, and the template's own *"Tap to open Area 2"* intent is correct for two of them and wrong for the third. Recorded as under-specification rather than as a divergence, since the comment was authored for the end-user framing it names. Two additive 6.2-only needs logged (a dedicated arrow slot, and a hover-revealed inline readout), plus the observation that **making `style-hover` reachable as a class or data attribute now has two consumers rather than one**, which moves it from a workaround to a contract requirement. DL-56's "pin is the only popover call site" clause negated in place: 6.2 adds a call site.
- 2026-08-24 (late, correction): ⚠️ **"the three click models collapsed to two" is an OVERSTATEMENT and is corrected here rather than left standing.** What collapsed is the **anchor placement**: 4.3, 6.2 and now 5.3 all navigate from a small arrow, so the anchor is uniform across all three. **The body click is still three different things**: 4.3 focuses the plant, 6.2 opens the popover, 5.3 centres the main map. So the card has ONE navigation contract and THREE consumer-wired activations, which is exactly the shape the contract was written for and a better outcome than uniformity would have been. **Also settled the same evening: 5.3 followed onto the arrow** (Keith), for two reasons that were not consistency: its row is swept horizontally while every hover moves the only map on screen, and with `hoverOnlyWhenSupported` enforced a touch user otherwise had no gesture to move the map from the list.
- 2026-08-24 (evening): **the three click models collapsed to two before any of them shipped.** Keith reversed 4.3 at the visual pass: a dedicated arrow navigates and a card body click focuses the plant, which is **6.2's placement**. So 4.3 and 6.2 now agree and **5.3 is the odd one out**, with a whole-card anchor whose own AC says *"same as 4.3"* and is therefore self-contradicting until Keith rules on whether 5.3 follows. ⭐ **The contract absorbed the reversal for one prop**, `anchor="card"` to `anchor="arrow"`, because the seam was already there. **The first caller to use the escape hatch was the placement the escape hatch was designed around**, which is the strongest evidence yet for PreviewCard's anchor-as-a-child pattern: it was chosen so adding a control later would not force a rewrite, and it has now absorbed a ruling nobody anticipated, twice. Separately, **the shipped card carries two identity badges (id and utility) rather than the subtitle Code proposed**: address, else utility, else installer resolved to nothing on nearly every plant in this fleet, so the cards read as duplicates. **A fact about the data, not about the design.** Whether two identical badge treatments is right is one of four unruled judgement calls.
- 2026-09-18 (day 94): two component defects added above from the `AB#1004` build, `InfoTooltip` with no keyboard path (three call sites, on Area 5's surface so it files with that area) and `icons/Info.tsx` with an off-ramp stroke and a viewBox that does not match its path, which is the fifth icon-defect class. **Neither is filed and both went through the gate.**
- 2026-09-23 (day 99): ✅ **the no-min-height rule gained its one named exception, DL-106**, a placeholder holding the exact height of the populated element it replaces. Found by Code reading the rule's text against Cowork's reading of its purpose, and the two disagreed. **Landed on all three surfaces that state the rule in one commit**, here with the reasoning, `design-conventions/06-cards.md` and the repo-root `CLAUDE.md` with the decision only.
- 2026-09-23 (day 99, 18:00): ✅ **the interaction contract's press and motion guard corrected on Keith's OK (DL-107).** The motion guard now cancels with the same variant, `motion-reduce:active:scale-100`, since `motion-reduce:transform-none` loses to the press on specificity. ⚠️ **And this page still named `active:scale-97` six days after the 2026-09-17 correction reached the repo `CLAUDE.md` and `04-interaction.md`**, so it is corrected here twice, the contract line and the primary button's hover ruling, and once more in the repo `CLAUDE.md`'s own primary button ruling. All ten `design-conventions/` pages and the wiki `CLAUDE.md` grepped, no other mention, control `04-interaction.md` found.
- 2026-09-24 (day 100): ✅ **two exceptions ruled by Keith for the power flow card (DL-108).** The digit morph, approved as the pattern for live values with its mitigations, including the two Keith settled after the motion review (decimal aligned, no roll from a dash). And the strip and picture reading their own measured width in script. Both landed on all three surfaces, decision only in the repo `CLAUDE.md` and `design-conventions/`, reasoning here.
- 2026-09-24 (day 100, evening): **the power flow card's measured-size exception extended from width to height at 2xl**, on Keith's direction with Code at `a563da7`. The page grid sets `--power-flow-fit`, the card measures its own box, the 15rem floor sits on the picture region and not the card. Written on all three surfaces.
- 2026-09-24 (day 100, evening): **the DS icon queue is seven**, a chevron right added from `AB#944`. The repo `CLAUDE.md`'s live instances list, stale at four, now names all seven.
- 2026-09-25 (day 101): **what the parked date picker "redesign" means, clarified by Keith.** The picker's own panel stays as it is and stays parked. The date field in the header is the header's, restyled with the header redesign. Written under "The split, ruled 2026-09-07 by Keith, and PARKED".
- 2026-09-25 (day 101, 23:35): the phone calendar limit added to the picker note, and a boundary sync extraction list started.
- 2026-09-28 (day 104, 13:21): **the DS icon queue is eleven**, four Heroicons outline glyphs on Plant Information from `AB#1028`, recorded three days late from Code's unemitted catch-up entries. `Users` has no viewBox and a hardcoded stroke, a candidate fix. The weather card is named as the digit morph's second adopter, waiting on `!1046`.
