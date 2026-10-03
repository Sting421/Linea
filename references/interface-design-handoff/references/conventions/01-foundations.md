# 01 · Foundations

Colour, the token architecture, and the contrast floors everything else is checked against.

Why in `memory/topics/design-system.md`, "Three-palette color system" and "Measured contrast ratios on the
ink ramp against white".

---

## The tokens rule

⛔ **Components CONSUME tokens. Never hardcode a hex.** Take colour from the Tailwind utilities the `theme/`
files generate, or from `statusToHex` for raw hex consumers such as Recharts.

⛔ **There is no `:root` layer and there is not going to be one.** Tokens are TypeScript in `theme/`, spread
into `tailwind.config.ts` under `theme.extend`. A CSS custom property layer would be a second system.

⛔ **`design/tokens.css` and `_ds-foundation/fig-tokens.css` are VALUE REFERENCES ONLY. Do not drop either
into the repo.** `fig-tokens.css` is a raw Figma dump whose status vars are grayscale placeholders, it has no
categorical set and no anomaly, and wiring from it produces a component that looks plausible and is wrong.

⛔ **Never write a class the resolved config cannot resolve, even knowing a later merge will make it
resolve.** It emits no CSS, nothing errors, and no test catches it. This is DL-29.

---

## The three palettes, three jobs

Locked 2026-07-15. The cut is simple. Health signal takes status. A value split into categories takes
categorical. A single series or anything decorative takes the brand ramp.

### 1. Status ✅ BUILT · `theme/status.ts` · 5 families × 4 roles

Reserved for a value's health or state. **Only ever means status.**

| Status | solid | soft | text | border |
|---|---|---|---|---|
| normal | `#009DE4` | `#E6F7FF` | `#03587F` | `#8AD9FD` |
| warning | `#E08600` | `#FFF4E2` | `#8F5500` | `#F8D399` |
| anomaly | `#8B5CF6` | `#F1EAFE` | `#5B21B6` | `#C9B2FA` |
| offline | `#6B7177` | `#EEF0F1` | `#474C51` | `#CDD1D4` |
| fault | `#D92D20` | `#FDECEA` | `#9E1B12` | `#F4B5AE` |

- **The canonical set is exactly these five. There is no "Online".** Fold any legacy `online` value into
  `normal` at the data boundary.
- **Severity order in code is fault, anomaly, warning, offline, normal**, `STATUS_SEVERITY` in
  `app/utils/status.ts`. Anomaly outranks warning because it is an operational deviation rather than a
  hardware condition.
- ⛔ **Violet reads as anomaly and nothing else, ever.** Never a category, never an accent, never a chart
  colour.
- **Anomaly is derived**, computed from telemetry patterns, never present in a source feed. **It renders at
  zero as a disabled row, it is not hidden** (DL-34). A zero means the feed never said anomaly, not that
  detection ran and found none.
- **Dots use the solid token.** There are no separate dot hexes.
- **Status labels come from `STATUS_LABELS`, never from a per-consumer string**, or the same status renders
  three ways across three surfaces.

⚠️ **`#6B7177` is BOTH `status-offline` and a DS neutral ink, byte identical.** A find and replace repointing
neutrals to ramp tokens silently rewrites the offline status token. **Classify every instance by meaning,
never by value.**

### 2. Categorical ✅ BUILT · `theme/categorical.ts` · 10 values

For charts that split a value into categories. **One canonical colour per energy concept, in every chart.**

| Concept | Token | Hex |
|---|---|---|
| Solar / PV | `cat-solar` | `#EAB308` |
| Battery and SOC | `cat-battery` | `#1FA845` |
| Grid import, net grid | `cat-grid-import` | `#0B7285` |
| Grid export | `cat-grid-export` | `#1F4173` |
| Home load | `cat-load` | `#E0521E` |
| Generator | `cat-generator` | `#7F5539` |
| Self consumption | `cat-self` | `#C2418F` |
| Curtailed | `cat-curtailed` | `#A8B0B7` |
| Backup and emergency power | `cat-backup` | `#22C3D6` |
| Sankey hub node | `cat-hub` | `#3A434B` |

- `cat-curtailed` is the only grey category and is deliberately lighter than `status-offline`.
- `cat-hub` is structural, a flow diagram's hub node, not a data category.
- ⛔ **The inverter throughput series are NOT categorical.** `total_dc_to_ac` and `inverter_power` are
  throughput totals rather than categories, so they take the brand ramp at `hue-sky-600` (DL-86).
- ⚠️ **`cat-backup` sits three degrees of hue from `cat-grid-import`**, dE 31.2 at a 2.62 contrast ratio, so
  that one pair separates on brightness alone and is the combination that fails for reduced contrast
  sensitivity.
- ⚠️ **The set now occupies nearly all the non status hue space.** An eleventh value will be family adjacent
  to something. That is a constraint on the next request, not a reason to refuse it.
- **Per device drilldown reuses a categorical hue whose physics rhymes**, safe because per device metrics
  never co-render with the flow charts. AC power takes solar, DC voltage takes grid import, temperature takes
  load, frequency takes grid export.

### 3. Brand ramp ✅ BUILT · `theme/colors.ts` · `hue-sky`

Single series, sequential, decorative.

| Step | Hex | Note |
|---|---|---|
| 50 | `#F2F9FF` | |
| 100 | `#E6F7FF` | |
| 300 | `#8AD9FD` | also `status-normal-border` |
| 500 | `#009DE4` | brand primary, also `status-normal` |
| 600 | `#0081F8` | the inverter throughput series |
| 800 | `#03587F` | the primary button fill, headings |
| 900 | `#1F4173` | card titles |

⛔ **The ramp has holes and they are load bearing.** No 200, no 400, no 700, and **nothing between 800 and
900**. `hue-sky-800` to `hue-sky-900` is a 1.31:1 step across a hue shift, teal leaning to navy, so it reads
as a colour change rather than a darken. **This is why the primary button does not darken on hover.**

⛔ **Adding a `hue-sky-700` step was considered and REJECTED.** Do not re-propose it.

**Non status accents** are navy `#1F4173`, teal `#0E9384`, rust `#E0521E`, green `#1FA845`. ⛔ **Orange is
deliberately omitted, because `#E08600` IS the warning hue.** Use rust for a warm accent so it never false
signals as warning.

---

## The ink ramp ✅ BUILT · `theme/ink.ts` · 12 steps

The neutral system. Structural greys, borders, body text.

| Step | Hex | | Step | Hex |
|---|---|---|---|---|
| 50 | `#F4F7F9` | | 500 | `#8A9199` |
| 100 | `#EDF1F4` | | 600 | `#6B7177` |
| 175 | `#E4E9ED` | | 700 | `#46505A` |
| 200 | `#E2E7EB` | | 800 | `#3A434B` |
| 300 | `#B6BEC5` | | 900 | `#20262B` |
| 400 | `#9AA3AB` | | 950 | `#17222E` |

`175` is a real step, not a typo. It is the donut's grayed segment value.

### Contrast floors, measured

**Against white.**

| Token | Ratio | Verdict at 4.5:1 |
|---|---|---|
| `hue-ink-500` | 3.19:1 | ⛔ FAILS small text |
| `hue-ink-600` | **4.94:1** | ✅ passes. **This is the floor for small text on white** |
| `hue-ink-700` | 8.22:1 | ✅ passes |
| `hue-sky-800` | 7.76:1 | ✅ passes |

**Against the declared page ground `hue-ink-100`.**

| Token | Ratio | Verdict |
|---|---|---|
| `hue-ink-600` | 4.35:1 | ⛔ FAILS small text on the page ground |
| `hue-ink-700` | 7.24:1 | ✅ passes |

⛔ **THE TEXT RULE IS PER SURFACE, NOT GLOBAL, and this is the part most likely to be over applied.** Small
text sitting **directly on the page ground** moves to `ink-700`. `ink-600` stays correct on a card, and most
text in this app lives on a card, so most text does not change. Page headings are large text, need only
3.0:1, and clear `ink-600` at 4.35, so they do not move either.

⛔ **A tertiary button may not be lightened to look quieter.** If it needs to be quieter than `ink-600` it
should not be a button.

⚠️ **WCAG exempts inactive controls from the contrast minimum**, which is why `ink-400` on `ink-50` is
legitimate for disabled even though it would fail for live text.

---

## ⛔ DEBT · four deprecated ramps are still exported

`theme/colors.ts` still carries `hue-neutral`, `hue-slate`, `hue-stone` and `hue-zinc`, every one marked
`@deprecated Near-miss neutral. Use hue-ink-*.`

**227 occurrences across 61 files**, measured 2026-08-22 with
`grep -rn -o -E "hue-(neutral|slate|stone|zinc)-[0-9]+" app/ --include=*.tsx --include=*.ts`.

⭐ **Migrating a component off a deprecated ramp and aligning it to its template are ONE action, not two.**
In every checked case the `hue-ink` value is the exact hex the DS template specifies while the deprecated one
is a near miss. Each legacy call site is a candidate design correction, not just a rename.

⚠️ **Not filed.** This is migration sized rather than bug sized.

---

## Changelog

- 2026-09-22: created from the full design-system read.
