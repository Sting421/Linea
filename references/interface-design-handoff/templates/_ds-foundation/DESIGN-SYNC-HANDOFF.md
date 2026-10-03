# Reap Design System — `/design-sync` Handoff

**One doc to drive the next repo update + re-sync.** Everything the design system needs
that *cannot* be done from inside the synced project (it's read-only generated source)
lives here. Work top to bottom — each section says exactly what to change in the `reap`
repo. When done, run `/design-sync`; it re-imports the code and regenerates the published
design system (components, tokens, README, sidebar). The skill accepts commit notes/
feedback for future runs.

**Companion files** (same folder `templates/_ds-foundation/`, copy into the repo as seeds):
- `fig-tokens.css` — the kit variables, `@kind`-classified, ready to seed the repo `:root`.
- `README.draft.md` — the new picker README (also inlined verbatim in §2).
- `fig-typography.css` is intentionally empty — the kit ships **no** TEXT/EFFECT styles, so
  the type direction is defined in §5, not imported.

---

## §0 — Apply order (TL;DR)

1. **Tokens first (§5)** — land the status palette + token foundation. Everything reads these.
2. **README (§2)** — replace the repo's readme source.
3. **Regroup (§3)** — move component folders + edit each `@dsCard group` → the 9 groups.
4. **Build families (§4)** — close the 66-family gap, in tier order.
5. **Porting standard (§6)** — apply as you touch each component (brand lives in tokens).
6. **Re-sync** — run `/design-sync`, pass commit notes for next time.

> The two linter lines you can ignore (they're framework internals, not real gaps):
> the **301 selector-scoped `--tw-*` props** and **152 unclassifiable tokens** are
> Tailwind's own runtime vars in the generated `_ds_bundle.css`. Fix at the export step
> (§4.1), not by moving them to `:root`.

---

## §1 — What's still open (the gap this doc closes)

| Area | State today | This doc |
|---|---|---|
| Picker README | describes the original imported kit; now wrong | §2 — replace |
| Sidebar groups | 6 synced folders (forms/general/labels/stats/tables/tooltips) | §3 — 9 functional groups |
| Component families | 22 of 88 in the bundle | §4 — build the 66 |
| Status palette | grayscale stubs in the kit | §5 — real keystone palette |
| Token foundation | components hardcode hex; no `:root` token layer | §5 + §6 — token-driven port |

---

## §2 — README replacement

Replace the repo's readme source with the following (verbatim copy of `README.draft.md`):

```markdown
# Ovanova IoT Design System (reap)

The component library behind the Ovanova Microgrid Platform. Plain **React + Tailwind**
components from the `reap` Remix app — **no theme provider or root wrapper to mount**.
Styling comes entirely from the bundled stylesheet (`styles.css`, which `@import`s the
compiled Tailwind utilities + component CSS). Render any component directly; it is styled
as soon as `styles.css` is on the page.

> **Looking for the visual reference?** Open **`Ovanova Design System.html`** — the
> branded, grouped showcase with every component rendered live. That is the document to
> review and send; this README is the build guide.

## What's inside

This system covers **Areas 1–3** of the Dashboard Requirements (Fleet Overview; Plant
Detail & Power Flow; Alerts & Events). It contains:

- **22 upstream `reap` components**, evolved to the current brand.
- **Net-new components** built to fill gaps (status indicators, severity badge, calendar,
  pagination, tags, callouts, complex tables, and the assembled domain surfaces).
- **A keystone Status & Severity system** — the shared palette + `SeverityBadge` every
  alert, dot, and KPI reads from.

### Maturity legend

| Badge | Meaning |
|---|---|
| **Existing** | Ships in `reap` today, used as-is. |
| **Evolved** | Existing component reskinned to the current brand tokens. |
| **Net-new** | Built here to fill a gap; ready for repo adoption. |
| **Provisional** | Built hi-fi but pending a product decision (per-mode controls, the Area 3 lifecycle). |

## The 9 component groups

1. **Foundations** — tokens, the keystone status palette, icons.
2. **Actions** — Button and primary action affordances.
3. **Inputs & Form Controls** — fields, toggles, selects, date controls, calendar.
4. **Navigation** — Tabs, Pagination.
5. **Data Display** — tables, KPI tiles, charts, status indicators.
6. **Feedback & Status** — Spinner, ErrorElement, Progress.
7. **Overlays** — tooltips, callouts, dropdowns, help dialogs.
8. **Containers & Layout** — Accordion, Carousel.
9. **Domain (Ovanova)** — assembled area surfaces: plant shell, fleet map, power flow,
   scheduler, incident console, notification inbox.

## Styling idiom — Tailwind utilities + the `hue-*` palette

Style your own layout/glue with Tailwind utility classes. This system extends Tailwind
with a custom brand palette (use as `bg-*`, `text-*`, `border-*`, `ring-*`):

| Family | Shades | Typical use |
|---|---|---|
| `hue-sky` | 50, 100, 300, 500, 600, 800, 900 | primary brand blue — `bg-hue-sky-800` is the primary action, `hue-sky-900` for headings |
| `hue-neutral` | 300, 400, 500, 600, 700 | body & secondary text |
| `hue-slate` | 100, 200, 300, 400 | borders, dividers, muted surfaces |
| `hue-zinc` | 300, 400, 500, 600, 800 | dark text / neutral UI |
| `hue-green` | 500 | success / positive trend |
| `hue-red` | 400, 600 | danger / destructive (`big_red`) |
| `hue-orange` + accents | `hue-orange` 50/300 · `hue-ember` 300 · `hue-rose` 50 · `hue-stone` 50 · `hue-gray` 300 | accents / warnings / tints |

Standard Tailwind colors (`gray-*`, `indigo-*`, `red-*`, `green-*`, `blue-*`) are also
used throughout and are available to you.

**Do not invent classes outside Tailwind + this palette.** A few shipped components
reference legacy names that are NOT in this theme (`input-primary`, `text-highlight-*`,
`accent-primary`, `bg-highlight-*`, `size-26.1`, `rounded-4.1`, `shadow-200`); those
render unstyled in the real app too — don't imitate them.

## Loading

React must be on the page first, then add these two lines once:

    <link rel="stylesheet" href="styles.css">
    <script src="_ds_bundle.js"></script>

Components are then available at `window.Reap.*`. Mount into a dedicated child node so the
two React trees don't collide:

    const { Accordion } = window.Reap;
    ReactDOM.createRoot(document.getElementById('ds-root')).render(<Accordion />);

## Where the truth lives

- **`Ovanova Design System.html`** — the live, grouped visual reference (send this).
- `styles.css` and its imports — the exact compiled utilities/palette.
- `components/<group>/<Name>/` — each component's `.prompt.md` (usage), `.d.ts` (prop
  contract), and `.html` (variant grid).
- `_ds_bundle.js` — the whole-DS browser bundle (`window.Reap`).
- `templates/` — reusable starting points (the domain surfaces, evolved components, the
  status/severity system).

> Note: the auto-generated `--tw-*` entries in the token list are Tailwind's internal
> runtime variables, not brand tokens — ignore them when picking colors; use the `hue-*`
> palette above.
```

---

## §3 — Sidebar regrouping (6 → 9 groups)

**Mechanism (confirmed in the synced source):** a component's group is set in two places
that must match — the **folder** `components/<group>/<Name>/` and the **`@dsCard group="…"`
comment on line 1 of `<Name>.html`**. To move a component: `git mv` the folder **and**
edit that comment. The `.jsx`/`.d.ts`/`.prompt.md` ride along; only the `.html` comment
needs editing.

### Target groups (slug → label)

| Slug | Sidebar label |
|---|---|
| `foundations` | Foundations |
| `actions` | Actions |
| `inputs` | Inputs & Form Controls |
| `navigation` | Navigation |
| `data-display` | Data Display |
| `feedback` | Feedback & Status |
| `overlays` | Overlays |
| `layout` | Containers & Layout |
| `domain` | Domain |

> The sidebar prints the raw slug and sorts alphabetically. For nicer labels and/or the
> logical order above, set a per-group title/order in the sync config, or prefix slugs
> with a number (`1-foundations`, …).

### Moves for the 22 existing components

| Component | From | To | New `@dsCard group` |
|---|---|---|---|
| Button | `general/Button` | `actions/Button` | `actions` |
| Input | `general/Input` | `inputs/Input` | `inputs` |
| Radio | `general/Radio` | `inputs/Radio` | `inputs` |
| CardSwitch | `forms/CardSwitch` | `inputs/CardSwitch` | `inputs` |
| CheckBox | `forms/CheckBox` | `inputs/CheckBox` | `inputs` |
| CustomSwitch | `forms/CustomSwitch` | `inputs/CustomSwitch` | `inputs` |
| DateFilter | `forms/DateFilter` | `inputs/DateFilter` | `inputs` |
| SearchInput | `forms/SearchInput` | `inputs/SearchInput` | `inputs` |
| Select | `forms/Select` | `inputs/Select` | `inputs` |
| FormLabel | `labels/FormLabel` | `inputs/FormLabel` | `inputs` |
| BasicTable | `tables/BasicTable` | `data-display/BasicTable` | `data-display` |
| SimpleTable | `tables/SimpleTable` | `data-display/SimpleTable` | `data-display` |
| UtilityTimeOfUseTable | `tables/UtilityTimeOfUseTable` | `data-display/UtilityTimeOfUseTable` | `data-display` |
| ChartLabel | `labels/ChartLabel` | `data-display/ChartLabel` | `data-display` |
| StatBox | `stats/StatBox` | `data-display/StatBox` | `data-display` |
| ErrorElement | `general/ErrorElement` | `feedback/ErrorElement` | `feedback` |
| Spinner | `general/Spinner` | `feedback/Spinner` | `feedback` |
| HelperDialog | `general/HelperDialog` | `overlays/HelperDialog` | `overlays` |
| GraphTooltip | `tooltips/GraphTooltip` | `overlays/GraphTooltip` | `overlays` |
| InfoTooltip | `tooltips/InfoTooltip` | `overlays/InfoTooltip` | `overlays` |
| Accordion | `general/Accordion` | `layout/Accordion` | `layout` |
| Carousel | `general/Carousel` | `layout/Carousel` | `layout` |

Then **delete the now-empty `forms/ general/ labels/ stats/ tables/ tooltips/` folders.**
`foundations`, `navigation`, `domain` start empty and fill from §4 builds.

---

## §4 — Component family build (22 → 88)

The linter reports 22 of 88 Figma families built. The 66 missing are repo work: build each
as `components/<group>/<Name>/<Name>.jsx` + `<Name>.d.ts` + `<Name>.prompt.md`. Drive
variants from **props**, not one component per Figma variant (the kit exports ~1,100 Button
symbols — that's the variant matrix, not 1,100 files).

### 4.1 `--tw-*` export fix (do this once)
The "301 selector-scoped props" + "152 unclassifiable tokens" are Tailwind internals
(`--tw-translate/rotate/skew/scale/ring/shadow/pan/pinch-zoom`, the `::before,::after`
and form-`:focus` reset vars). **Do not** move them to `:root`. At the export step either
strip the `--tw-*` namespace from token extraction, or emit `/* @kind other */` on those
declarations at generation time.

### 4.2 Tier 1 — primitives (no reap equivalent; build first)

| Family | Variant axes | Notes |
|---|---|---|
| `_Dot` | Size 3 | status dot → status palette (SeverityBadge `dot` models this) |
| `_Avatar company icon` | Size 6 | square logo chip |
| `_Avatar online indicator` | Size 6 · Online 2 | presence dot overlay |
| `Avatar` | Size 6 · Placeholder 2 · Text 2 · Status icon 3 · State 3 | image / initials / icon |
| `Avatar label group` | Size 4 · Status icon 3 · State 3 | avatar + name + sub-label |
| `Dropdown` family (`Dropdown`, `Dropdown menu`, `_Dropdown list header`, `_Dropdown list item`) | Type 3 · Open 2 / Icon·Checkbox·Shortcut / State 4 | menu system |
| `Tooltip` | Supporting text 2 · Theme 2 · Arrow 7 | new (reap has Info/Graph only) |
| `Help icon` | Open 2 · Supporting text 2 · Tooltip 7 | composes Tooltip |
| `Progress` | size 4 · colorScheme 7 | bar; colorScheme → palette |
| `Switch` | size 3 · isChecked 2 · isDisabled 2 · colorScheme 6 | superset of reap CustomSwitch |
| `Tab` / `Tabs` | variant 5 · size 3 / variant 4 · isFitted · colorScheme | new |
| `Map` | Size 6 | static map tile (see shared-map work) |
| `Cursor` | State 3 | map/interaction cursor |

### 4.3 Tier 2 — variant breadth on existing reap components

| Family | Variant axes | Maps to |
|---|---|---|
| `Button` / `_Button base` / `button content` | Size 5 · Hierarchy 6 · Icon 5 · Destructive 2 · State 4 | extend reap `Button` |
| `Input` / `Input field` / `_Input field base` / `InputGroup` | size 4 · variant 3 · isInvalid · isDisabled · leading/trailing · addons | extend reap `Input` |
| `Checkbox` (×3) / `_Checkbox base` / `Checkbox Control` | size · checked · indeterminate · type · state · colorScheme 6 | extend reap `CheckBox` |
| `Radio` / `Radio Control` | size 3 · defaultChecked · colorScheme 5–6 · isDisabled | extend reap `Radio` |
| `Select` | size 3 · isDisabled · isInvalid | extend reap `Select` |

### 4.4 Tier 3 — calendar, charts-as-components, misc
`Calendar`, `Calendar Month/Year Field`, `Calendar Select Group`, `day` (8),
`Bar Chart - Stacked XS/S/M/L`, `Chart Events XS/S/M/L`, `Tag`, `File`/`File box`,
dividers, `Bell`, `Cancel`, `Collapse`, `Payment method icon` (117 — only if billing UI
is in scope). Triage by whether Areas 1–3 actually use them.

### 4.5 Icons (~95 glyphs) — one pass
Materialize as **icon-data** (a single `icon-data.js` map + `<Icon>` wrapper), not one
`.jsx` per glyph. Covers `chevron-*`, `arrow-*`, `check*`, `help-circle`, `info`, `home`,
`settings`, `search-*`, `users`, device glyphs (`Laptop02`, `Monitor01`, `Modem02`,
`Printer`, `Signal02`), etc.

---

## §5 — Token foundation + type (build FIRST)

The kit ships its status variables as **grayscale placeholders**, not real colors
(`--normal` light gray, `--warning` dark gray, `--fault` near-black, `--offline` lighter
gray). **Source of truth = the keystone palette** (anchored on Ovanova sky-blue), already
built in `templates/severity-system/`. Land these as real tokens in the repo (replace the
stubs):

```css
--status-normal:  #009DE4;  --status-normal-soft:  #E6F7FF;  --status-normal-text:  #03587F;
--status-warning: #E08600;  --status-warning-soft: #FFF4E2;  --status-warning-text: #8F5500;
--status-offline: #6B7177;  --status-offline-soft: #EEF0F1;  --status-offline-text: #474C51;
--status-fault:   #D92D20;  --status-fault-soft:   #FDECEA;  --status-fault-text:   #9E1B12;
--status-anomaly: #8B5CF6;  --status-anomaly-soft: #F1EAFE;  --status-anomaly-text: #5B21B6;
```

**Color reservation rule:** the five status hues are reserved for status meaning only.
Decorative/UI accents use the non-status accent set (navy #1F4173, teal #0E9384,
orange #E08600→use rust #E0521E if colliding with warning, green #1FA845) — never a status hue.
Violet reads as Anomaly everywhere; the former violet chip/scheduler accent is now teal.

**Three palettes, three jobs:**
- Health/state of a value → `--status-*` (only ever means status).
- A value split into categories (generation by purpose, load by source, energy flows) → `--cat-*`, one canonical color per concept, identical across all charts.
- Single-series / sequential / decorative → the brand sky ramp.

```css
--cat-solar:       #EAB308;  /* solar / PV */
--cat-battery:     #1FA845;  /* battery */
--cat-soc:         #1FA845;  /* SOC — shares battery hue (same physical concept) */
--cat-grid-import: #0B7285;  /* grid import / net grid */
--cat-grid-export: #1F4173;  /* grid export (navy — never violet) */
--cat-load:        #E0521E;  /* home load */
--cat-generator:   #7F5539;  /* generator */
--cat-self:        #C2418F;  /* self-consumption */
--cat-curtailed:   #A8B0B7;  /* curtailed — only grey category, lighter than status-offline */
```

Device-telemetry extension (per-device drilldown): metrics reuse the categorical hue
whose physics rhymes — hue reuse across charts is fine when the concepts never co-render:
`--cat-metric-power: #EAB308` (AC power = generation family), `--cat-metric-voltage: #0B7285`
(electrical/grid cyan), `--cat-metric-temp: #E0521E` (heat/ember), `--cat-metric-freq: #1F4173`
(grid deep blue). Violet is never a metric color.

Note for implementation: the Today·Power chart's "Net grid" is a single signed series
(import+export in one line) mapped to `--cat-grid-import`; if it is ever split into
separate import/export series, the export series takes `--cat-grid-export`.

Seed the rest of `:root` from the companion **`fig-tokens.css`** (55 kit variables,
`@kind`-classified; it also carries the kit's full light/dark/data-mode color matrix).

**Same-pass data fixes** (bugs found in the kit/components):
- PlantGrid / PlantInfoWindow map **Warning→gray** and **Offline→red** — wrong; use the
  status tokens above.
- Three `event_type` vocabularies (UPPER+numeric / lower+failure / filter-labels) →
  normalize to one enum.
- `InverterStatus` bug folds **Fault counts into `normalCount`** — fix the tally.

**Type direction** (kit ships no text styles): headings/display → **Space Grotesk** via a
`--font-display` token; body → the token sans stack. Don't hardcode font-family in
components — read the token.

---

## §6 — Porting standard (the contribution rule)

**Components read tokens; the brand lives in the tokens.** Inspection of the current 22
shows the wall the system hit: each is a thin re-export styled with compiled Tailwind
utilities (`text-indigo-900`, `color-[#04587f]`) + hardcoded SVG hex (`fill:#1f4173`),
and **none read a first-party `:root` token** — so redefining tokens reskins nothing.

When porting each component into the repo, refactor it to **consume** the token foundation;
do not re-hardcode the new brand:
- Map Tailwind theme colors to token-backed vars (`theme.extend.colors` → `var(--…)`), so
  `bg-primary` = `var(--hue-sky-800)`.
- Replace hardcoded SVG `fill`/`stroke` hex with `currentColor` or a token var.
- Status/severity colors come from `--status-*` (§5), never literals.

**Acceptance test:** changing a token value reskins the component with no component edit.
If a brand change requires touching component source, the port failed.

### Taxonomy + maturity (for the showcase and repo folders)
One **function-based** grouping (the 9 in §3) — never net-new-vs-existing, never build-tier.
Maturity is a **per-component badge**: **Existing** (untouched reap) · **Evolved**
(reskinned via token port) · **Net-new** (built for Ovanova) · **Provisional** (structure
not locked: scheduler options, Area-3 lifecycle, Online-vs-Normal). Dual-home resolutions:
**SeverityBadge → Data Display**; **Progress → Feedback & Status**.

---

## §7 — Apply checklist

1. Land tokens (§5) — status palette + `fig-tokens.css` seed + the three data fixes.
2. Replace the readme source (§2).
3. Regroup: `git mv` each row in §3 + edit its `@dsCard group`; delete the 6 empty folders.
4. `--tw-*` export fix (§4.1).
5. Build families: Tier 1 → Tier 2 → icons → Tier 3 by need (§4); port each per §6.
6. Run **`/design-sync`** — components, tokens, README, and the 9-group sidebar regenerate;
   the 22→88 count closes as families land. Pass commit notes for future runs.
