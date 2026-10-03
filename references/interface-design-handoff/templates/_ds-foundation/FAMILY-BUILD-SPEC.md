# Reap DS — Component family build spec (handoff to repo + `/design-sync`)

> **Why this doc exists.** The DS linter reports 22 of 88 Figma component families
> implemented. The missing 66 **cannot be closed from inside this design-system
> project** — `components/` and `_ds_bundle.css` are read-only synced source. They
> are built once in the **reap repo** (React + Tailwind + `hue-*` idiom) and then
> re-synced. This is the spec for that work, read straight from the mounted `.fig`.

---

## 0. Status palette — decision of record (build FIRST)

The kit ships its status variables as **grayscale placeholders**, not real colors —
confirmed by materializing `Variable collection`:

| Figma var | Kit value (stub) | ❌ do not use |
|---|---|---|
| `--normal` | `rgb(179,178,178)` | light gray |
| `--warning` | `rgb(66,66,66)` | dark gray |
| `--fault` | `rgb(30,30,30)` | near-black |
| `--offline` | `rgb(228,228,228)` | lighter gray |
| `--main-black` / `--second-black` | `rgba(0,0,0,0.2)` | — |

**Source of truth = the keystone palette** (anchored on Ovanova sky-blue), already
built in `templates/severity-system/`. Land these as real tokens in the repo
(replace the grayscale stubs):

```
--status-normal:  #009DE4;  --status-normal-soft:  #E6F7FF;  --status-normal-text:  #03587F;
--status-warning: #E08600;  --status-warning-soft: #FFF4E2;  --status-warning-text: #8F5500;
--status-offline: #6B7177;  --status-offline-soft: #EEF0F1;  --status-offline-text: #474C51;
--status-fault:   #D92D20;  --status-fault-soft:   #FDECEA;  --status-fault-text:   #9E1B12;
--status-anomaly: #8B5CF6;  --status-anomaly-soft: #F1EAFE;  --status-anomaly-text: #5B21B6;
```

Also fix in the same pass: PlantGrid / PlantInfoWindow map Warning→gray and
Offline→red (wrong); normalize the three `event_type` vocabularies
(UPPER+numeric / lower+failure / filter-labels) to one enum; fix the
`InverterStatus` bug that folds Fault counts into `normalCount`.

---

## 1. `--tw-*` token / selector findings (export fix, not a token gap)

The linter's "301 selector-scoped custom properties" and "152 unclassifiable
tokens" are **Tailwind framework internals** in the generated `_ds_bundle.css`
(`--tw-translate/rotate/skew/scale/ring/shadow/pan/pinch-zoom`, the `::before,
::after` / form-`:focus` reset vars). They are not theme tokens and must not move
to `:root`. Fix at the **export step** in the repo:

- strip the `--tw-*` namespace from token extraction, **or**
- emit `/* @kind other */` on those declarations at generation time.

A real first-party `:root` block (the 55 kit variables, `@kind`-classified) is
already materialized at `templates/_ds-foundation/fig-tokens.css` — adopt it as the
seed for the repo's token file.

---

## 2. The 66 unbuilt families

Reap already ships `Button, Input, Checkbox, Radio, Select, CardSwitch,
CustomSwitch, SearchInput, DateFilter, Accordion, Carousel, Spinner, HelperDialog,
ErrorElement, BasicTable, SimpleTable, UtilityTimeOfUseTable, ChartLabel,
FormLabel, GraphTooltip, InfoTooltip, StatBox` (22). Most of the gap below is
**variant breadth** on those, plus genuinely new primitives.

> Build each as `components/<group>/<Name>/<Name>.jsx` + `<Name>.d.ts` +
> `<Name>.prompt.md`. Drive variants from **props**, not one component per Figma
> variant (Figma exports 1,100 Button symbols — that's the variant matrix below,
> not 1,100 files).

### Tier 1 — primitives (no reap equivalent; build first)
| Family | Variant axes (from .fig) | Notes |
|---|---|---|
| `_Dot` | Size: 3 | status dot; wire to status palette. SeverityBadge `dot` already models this. |
| `_Avatar company icon` | Size: 6 | square logo chip |
| `_Avatar online indicator` | Size: 6 · Online: 2 | presence dot overlay |
| `Avatar` | Size: 6 · Placeholder: 2 · Text: 2 · Status icon: 3 · State: 3 | image / initials / icon |
| `Avatar label group` | Size: 4 · Status icon: 3 · State: 3 | avatar + name + sub-label |
| `Dropdown` / `Dropdown menu` / `_Dropdown list header` / `_Dropdown list item` | Type 3 · Open 2 / Icon·Checkbox·Shortcut·Header / State 4 | menu system |
| `Tooltip` | Supporting text 2 · Theme 2 · Arrow 7 | new; reap has InfoTooltip/GraphTooltip only |
| `Help icon` | Open 2 · Supporting text 2 · Tooltip 7 | composes Tooltip |
| `Progress` | size 4 · colorScheme 7 | bar; wire colorScheme to palette |
| `Switch` | size 3 · isChecked 2 · isDisabled 2 · colorScheme 6 | superset of reap CustomSwitch |
| `Tab` / `Tabs` | variant 5 · size 3 / variant 4 · size 3 · isFitted · colorScheme | new |
| `Map` | Size: 6 | static map tile; see shared-map work |
| `Cursor` | State: 3 | map/interaction cursor |

### Tier 2 — variant breadth on existing reap components
| Family | Variant axes | Maps to |
|---|---|---|
| `Button` / `_Button base` / `button content` | Size 5 · Hierarchy 6 · Icon 5 · Destructive 2 · State 4 | extend reap `Button` (`variant` → hierarchy; add size/icon/state) |
| `Input` / `Input field` / `_Input field base` / `InputGroup` | size 4 · variant 3 · isInvalid · isDisabled · leading/trailing · addons | extend reap `Input` |
| `Checkbox` (×3 sets) / `_Checkbox base` / `Checkbox Control` | size · checked · indeterminate · type · text · supporting · state · colorScheme 6 | extend reap `CheckBox` |
| `Radio` / `Radio Control` | size 3 · defaultChecked · colorScheme 5–6 · isDisabled | extend reap `Radio` |
| `Select` | size 3 · isDisabled · isInvalid | extend reap `Select` |

### Tier 3 — calendar, charts-as-components, misc standalones
`Calendar`, `Calendar Month/Year Field`, `Calendar Select Group`, `day` (8),
`Bar Chart - Stacked XS/S/M/L`, `Chart Events XS/S/M/L`, `Payment method icon`
(117 — only if billing UI is in scope), `Component Log in`, `Component Sign up`,
`Tag`, `File` / `File box`, dividers, `Bell`, `Cancel`, `Collapse`. Triage by
whether Areas 1–3 actually use them.

### Icons (~95 glyphs) — one pass
Materialize the icon set as **icon-data** (single `icon-data.js` map + `<Icon>`
wrapper), not one `.jsx` per glyph. Covers `chevron-*`, `arrow-*`, `check*`,
`help-circle`, `info`, `home`, `settings`, `search-*`, `users`, device glyphs
(`Laptop02`, `Monitor01`, `Modem02`, `Printer`, `Signal02`), etc.

---

## 3. Build order
1. Status palette tokens + the three data fixes (§0).
2. `--tw-*` export fix (§1).
3. Tier 1 primitives → Tier 2 breadth → icons → Tier 3 by need.
4. Re-run `/design-sync`; the 22→88 count closes as families land in the bundle.

---

## 4. PORTING STANDARD — components read tokens, the brand lives in the tokens

**This is the rule the port must follow, not optional.** Inspection of the current
22 components shows why the design system hit the "can't reskin in place" wall:

- Every component is a thin re-export from the generated `_ds_bundle.js`.
- They are styled with **compiled Tailwind utility classes** (`text-indigo-900`,
  `color-[#04587f]`) plus **hardcoded hex in SVGs** (`fill:#1f4173`, `stroke:#00ACFA`).
- **None read a first-party `:root` token.** So redefining tokens reskins nothing,
  and `components/` + `_ds_bundle.css` + `styles.css` are all read-only here.

When porting each component into the reap repo, **refactor it to consume the token
foundation** (`templates/_ds-foundation/fig-tokens.css` → the repo's `:root`), do
**not** re-hardcode the new Ovanova brand:

- Map Tailwind theme colors to token-backed CSS vars (e.g. Tailwind `theme.extend.colors`
  pointing at `var(--status-*)` / `var(--hue-sky-*)`), so `bg-primary` = `var(--hue-sky-800)`.
- Replace hardcoded SVG `fill`/`stroke` hex with `currentColor` or a token var.
- Status/severity colors come from the `--status-*` tokens (§0), never literals.
- Type: headings → Space Grotesk via a `--font-display` token; body → token stack.

**Acceptance test for the port:** changing a token value reskins the component with
no component edit. If a brand change requires touching component source, the port
failed this standard. Brand lives in tokens; components only read them.

---

## 5. Taxonomy of record (function-based) + maturity badges

The reviewer-facing showcase (`Ovanova Design System.html`) and the eventual repo
folders use ONE function-based grouping — **not** net-new-vs-existing, **not** build-tier
(tier/maturity is a per-component badge, never a group):

**Foundations** (tokens, Status & Severity palette, Icons) · **Actions** (Button) ·
**Inputs / form controls** (Input, Select, CheckBox, Radio, CardSwitch, CustomSwitch,
DateFilter, SearchInput, Switch, **FormLabel** — labels form fields, lives here) ·
**Navigation** (Tabs) · **Data display** (BasicTable, SimpleTable, UtilityTimeOfUseTable,
chart primitives, ChartLabel, StatBox, StatTile, Avatar, StatusDot, **SeverityBadge**) ·
**Feedback & status** (Spinner, ErrorElement, **Progress**) · **Overlays** (Tooltip,
GraphTooltip, InfoTooltip, HelperDialog) · **Containers / layout** (Accordion, Carousel) ·
**Domain — Ovanova** (Fleet/Shared Map, + power-flow diagram, working-mode scheduler,
incident console, notification inbox as built).

Dual-home resolutions: **SeverityBadge → Data display** (not Domain); **Progress →
Feedback & status** (not Data display). `Callout` and `ComplexTable` do **not** exist
yet — add as Net-new only when a screen needs them; do not pre-build.

Maturity badges (per component, shown in the showcase): **Existing** (untouched Reap),
**Evolved** (reskinned to brand via token-driven port), **Net-new** (built for Ovanova),
**Provisional** (structure not locked — scheduler options, Area-3 lifecycle screens,
Online-vs-Normal).

---

## 6. README revision — apply on re-sync (the picker README is stale)

The synced `README.md` (shown in the design-system picker) still describes the
*original imported kit* and is now wrong on several points. It is read-only synced
source here — **update it in the repo and re-sync**, do not hand-edit. Corrected
framing for the re-sync:

- ❌ "no charting layer" → ✅ chart primitives ship (wraps Recharts): time-series,
  bar, donut, pie, radial, scatter, sparkline, StatTile.
- ❌ "status color is ad-hoc / no token layer" → ✅ keystone `--status-*` palette
  (Normal/Warning/Offline/Fault + derived Anomaly; legacy Online folds into Normal) + a real token foundation (`fig-tokens.css`).
- ❌ "system stack, no custom typeface" → ✅ Space Grotesk for display/headings.
- ❌ "kit of primitives, component-only" → ✅ now also: SeverityBadge, StatusDot,
  Avatar, Switch, Progress, Tabs, Tooltip, Icons, and the Fleet/Shared Map.
- Add the **function-based taxonomy** (§5) and **maturity badges** as the org model,
  and the **porting standard** (§4: components read tokens) as the contribution rule.
- Keep the accurate parts: `window.Reap` global, one compiled stylesheet, Tailwind
  `hue-*` utility idiom — but note brand now flows through tokens, not hardcoded hex.
