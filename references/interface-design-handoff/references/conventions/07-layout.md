# 07 · Layout

Breakpoints, what drives what, and the five alignment rulings.

Why in `memory/topics/design-system.md`, "GRIDS AND RESPONSIVENESS" and "ALIGNMENT AND SPACING".

⚠️ **This is a WEB APP, not a desktop app.** It is opened in a browser at whatever width the browser happens
to be, and multi device was asked for on day 3.

---

## Breakpoints ✅ Tailwind's stock five, no `screens` override

| | Meaning | Content grid | Card band |
|---|---|---|---|
| `base` <640 | phone. Nav is a drawer | 4 col | 1-up |
| `sm` 640 | large phone | 4 col | 1-up |
| `md` 768 | tablet portrait. Nav collapsed | 8 col | 2-up |
| `lg` 1024 | **rail appears, ICON ONLY** | 8 col | 2-up |
| `xl` 1280 | laptop. Rail at full 272px | 12 col | 3-up |
| `2xl` 1536 | desktop | 12 col | 4-up |

**Shell inset: 24px at `lg`+, 16px at `md`, 12px at `base` and `sm`.** This supersedes the unconditional 8px
currently shipped.

⚠️ **Nothing in the app reaches 12 columns today. The widest declared is `grid-cols-7`.**

---

## ⛔⛔ THE TWO MECHANISM RULE

**MEDIA queries drive the SHELL ONLY.** Nav collapse, page margins, page level column count, route layout.

**CONTAINER queries drive COMPONENTS ONLY.** Card density, internal layout.

✅ **One ruled exception, the power flow card's strip and picture, Keith 2026-09-24.** They read their own
measured width in script, because a balanced column count and a zoom factor are arithmetic a container query
cannot express. Still the component responding to its container, never the viewport. From `a563da7`, at 2xl only, it also reads its own measured HEIGHT, so the card ends level with the Inverter Status and Generation Purpose stack beside it. The breakpoint stays in the page grid, which sets `--power-flow-fit` on the card's cell, and the card only ever measures its own box. A 15rem floor sits on the picture region inside the card, never on the card, so a short stack cannot shrink the picture to nothing (Keith, 2026-09-24). ⛔ **Scoped to that card,
not a precedent.**

⚠️ **Measured, 160 of 252 responsive prefix occurrences (63 percent) are on components and are therefore
violations.** Heaviest in the batch and detail modals, plus `sm:` padding inside shared inputs and stat
boxes. **Bind new work correctly. Convert existing only under a work item that says so.**

---

## Content priority ladder

**Every multi field surface declares ONE field priority order, once. Each breakpoint takes the top N.**
Dropping is then deterministic rather than per surface judgement.

⛔ **Nothing is silently dropped.** A field removed at a breakpoint stays reachable, through a row expand, a
detail view, or an explicitly scrollable variant.

⛔⛔ **A STATUS, FAULT, ALERT or SEVERITY FIELD IS PRIORITY 1 AND NEVER DROPS AT ANY BREAKPOINT.** Correctness
rule, same class as "a toast is never the only carrier". **If the layout cannot hold the fault indicator, the
layout changes, not the indicator.**

---

## Grid prohibitions

⛔ **NO PX LOCKED FIRST COLUMN below `lg`.** Measured, 38 of 42 arbitrary grid templates lock their first
column, `grid-cols-[300px_1fr]` 22 times and `grid-cols-[180px_1fr]` 16 times. **At a 320px viewport a 300px
first column leaves 20px for everything else.** Use a fraction or `minmax()`. **This is the highest leverage
change for narrow viewports.**

⛔ **AN ACTIONS COLUMN IS PINNED IN EVERY TABLE**, `sticky right-0`. Measured, one of six tables does it.

⛔ **Four `min-w-[1092px]` sites force page level horizontal scroll at 1280.** None sits inside an
`overflow-x` container and nothing masks overflow at the document level. **1092 plus the 272px rail is about
1364px of viewport needed.** A laptop problem, not a phone problem.

⚠️ **`flex-wrap` pseudo grids number 49 across 32 files, more than the 45 fixed `grid-cols`.** The commonest
multi item layout in the app has no column count at all.

✅ **The viewport floor is correct and needs no change.** The viewport meta carries no `maximum-scale` and no
`user-scalable=no`, so pinch zoom is not locked. No `min-width` on `html` or `body`, no document level
`overflow-x: hidden`.

---

## ⛔⛔ A SHIPPED DEFECT · there is no navigation below 1024px

The rail is `hidden lg:fixed lg:flex`. The mobile drawer **can never open**, because `setSidebarOpen(true)` is
never called anywhere in `app/**`. Its panel holds only the close button, because the hamburger is commented
out with its import left in place. A hamburger component exists, 79 lines, imported nowhere.

⛔ **Do not "fix" this incidentally inside another item. It is a filed defect, not a convention gap.**

---

## Alignment and spacing, five rulings plus one

### 1. ✅ USE TAILWIND'S STOCK SPACING SCALE. Mint NO new spacing tokens.

The DS is a smooth ramp of 25 distinct gap values rather than a scale, and 5 to 12px carries 472 of 629
declarations. Its on grid values (6, 8, 10, 12, 14, 16) already cover 360 of those and are all existing
utilities. **The off grid ones are every one within 1 to 2px of an existing step. Round them.**

⛔ **Do NOT add keys to `theme/spacing.ts`.**

⛔⛔ **DO NOT DELETE `68`. `68: "272px"` IS THE NAV RAIL WIDTH**, used by the sidebar and the shell offset
together. All three existing keys follow the convention that the key is a Tailwind scale step whose value is
key × 4px.

⛔ **A literal pixel value does not get a theme entry.** Use an arbitrary value, `w-[526px]` not `w-526`. **A
key whose name is its own value is not a token.**

⛔ **A dead convention existed where key `N.1` meant N pixels. It is gone.** Do not reintroduce it and do not
copy a class like `pb-50.1` or `size-4.5` out of existing code. 44 such classes were removed because they
emitted no CSS at all. A guard test fails the suite on any spacing class whose key the scale lacks.

✅ **Radius is the exception and DOES need tokens**, because 9px is absent from Tailwind's scale.

### 2. ✅ NEW TOKENS IN `rem`. No migration, no sweep.

Existing px arbitraries are replaced only when something already touches them. Measured, **528 px arbitraries
against 17 rem, and 122 of them are TYPE values.** No explicit root font size exists, so user text scaling
works, **which makes those 122 the live accessibility defect. They will not scale.**

⛔ **A bug, not a convention.** `app/components/Button/index.tsx` hard codes `min-w-[128px]` on five variants
around a text label, so the label overflows at increased text size. 202 px locked dimensions hold text in
total.

### 3. ✅ TABULAR FIGURES wherever digits CHANGE IN PLACE or SIT IN A COLUMN.

See `03-typography.md`. Measured, `tabular-nums` appears 27 times and **zero times in any table.**

### 4. ✅ NUMERIC COLUMNS RIGHT ALIGN. Text columns left align. Headers match their column.

⛔ **A defect fix, not a preference.** All three tables left align numeric columns today, and `text-right`
appears four times in the whole app with **not one on numeric content**.

### 5. ✅ A SHARED VALUE EDGE NEEDS A GRID.

⛔ `justify-between` pushes each value to **its own container's** edge, so values align only when containers
are identical widths. Where they are not, **the ragged edge is structural, not a missing class.** Measured,
`justify-between` 160 uses against `grid-cols-2` at 26.

**Label and value pairs that must align across rows use a two column grid. `justify-between` is for a
standalone row only.**

### 6. ✅ `items-center` on every icon plus label flex row.

44 of 115 lack it, which reads as a wobble down a list.

---

## Motion and layout

⛔ **NEVER animate spacing.** No animated `gap`, `padding` or `margin`, and no reflow on hover. Only
`transform` and `opacity` skip layout and paint.

✅ **One exception. A height animation is permitted for a ONE SHOT layout reveal** a person or condition
triggers, a banner or an accordion. **Never for anything continuous, gesture driven, or repeated across a
list.**

⚠️ The one ruled exception beyond that is the Control tab's work mode dropdown. See `04-interaction.md`.

---

## Changelog

- 2026-09-22: created from the full design-system read.
- 2026-09-24: the measured-width exception added for the power flow card's strip and picture, ruled by Keith (DL-108).
- 2026-09-24 (evening): the exception extended to height at 2xl, the page grid setting `--power-flow-fit` on the card's cell (Keith, `a563da7`).
