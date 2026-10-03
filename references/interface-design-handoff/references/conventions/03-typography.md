# 03 · Typography

Two faces, one scale, and the reason numbers have to sit on the display face.

Why in `memory/topics/design-system.md`, "TYPOGRAPHY, declared 2026-09-01" through "The type scale".

---

## The two faces

| Role | Face | Replaces |
|---|---|---|
| display | **Overused Grotesk** | Space Grotesk |
| body | **Opening Hours Sans** | the inherited `ui-sans-serif, system-ui` stack |

**Both are self hosted, WOFF2, latin subset, variable where a variable file exists.** Space Grotesk set that
pattern at 22,288 bytes and the two new faces follow it rather than inventing a second delivery shape.

| File | Bytes | Axis | `tnum` |
|---|---|---|---|
| `overused-grotesk-latin-variable.woff2` | 28,028 | `wght 300-900` | ✅ works, uniform at 400, 600, 900 |
| `opening-hours-sans-latin.woff2` | 8,516 | static, single cut | ⛔ absent by design of the face |

⛔ **Never declare a weight range on Opening Hours Sans.** It is `font-weight: 400`, single value. A range
invites synthetic bold, which the browser produces by thickening outlines rather than selecting a heavier
design. It reads smeared, it is worst at small sizes, and it perturbs metrics.

⚠️ **Overused Grotesk's version string is `0.6`**, pre 1.0, so its metrics may shift upstream. Pin the file
rather than tracking the release.

### Build state

- ✅ **BUILT.** Both `@font-face` blocks exist in `app/tailwind.css`. Space Grotesk's block and file are gone.
- ✅ **BUILT.** `theme/fontFamily.ts` declares `display` as Overused Grotesk with a fallback stack.
- ⛔ **NOT BUILT.** There is no `sans` override and no `body` key. Nothing in the repo references Opening
  Hours Sans outside its own `@font-face`. **So body text still resolves to the viewer's system stack and the
  browser downloads a face nothing renders.**

**The ruling this breaks.** 2026-09-02, verbatim in substance, *there is no default font any more*, and
`sans` is **overridden** rather than supplemented. Adding a `body` key was considered and rejected precisely
because it is opt in and nothing renders the new face until every body role is touched.

⭐ **The blast radius is the POINT, not a side effect.** Overriding `sans` restyles every un tokened element
at once, including screens nobody has looked at. That is what "system wide" means. Expect text that was never
deliberately styled to change appearance on the first load, and do not treat it as a regression.

⚠️ **One precision.** A fallback stack stays behind both faces for the case where the WOFF2 fails over the
network. That is a failure path, not a styling decision. What is true is that **no element renders a system
face by design.**

⛔ **This finding is a working tree read. Confirm with `git show origin/dev:theme/fontFamily.ts` before it
instructs anything.**

---

## Face by role

**The display face carries identity, magnitude and EVERY NUMERAL. The body face carries prose.**

⛔ **That assignment was FORCED BY MEASUREMENT, not chosen.** Opening Hours Sans has no `tnum` feature at all.
Its digits are proportional at 367 / 550 / 600 / 638 units on a 1000 upm, so the `1` is barely two thirds the
width of the `0`. Verified by HarfBuzz shaping with a positive control, the same engine the browser uses, and
with `tnum` requested ON it returns the identical ragged widths. **Numbers in the body face can never column
align and will jitter when they update in place.**

**So wherever the tabular figures rule applies, the display face applies too**, because it is the only face
that can satisfy it.

| Takes the DISPLAY face | Stays on the BODY face |
|---|---|
| eyebrow, table headers, **buttons** | body copy and prose |
| numeric table cells, units | textual table cells (plant names, serials) |
| hero and card figures, delta badge | captions, tooltips, nav items, form inputs |
| card titles, page titles, banner titles, chip labels | toast and banner body |

✅ **Buttons are on the DISPLAY face and the DS template is overruled by capability.** The template sets
`ui-sans-serif, system-ui`, but a 600 weight label cannot live on a single cut face without synthetic bold.
The constraint and Keith's "major, important text" framing point the same way.

### ⚠️ The contradiction, ruled by the build and needing confirmation

The declaration lists **numeric table cells** under display and **textual table cells, plant names and
serials** under body. **A serial IS numeric, and so is a date column.** The declaration supports either
answer, which is what let a real defect look principled.

✅ **The ruling.** **Every data cell is on the BODY stack**, in tables and in detail panels, with
`tabular-nums` kept wherever digits sit in a column. **The display face keeps titles and control labels
only.** Measured support: `ComplexTable`, `DeviceInventoryList` and `PlantsList` all return zero
`font-display` on cells.

⚠️ **Tighten the declaration where it lives.** Both faces are now in the repo, so nothing is blocking the
question any more.

---

## The type scale ✅ BUILT · `theme/fontsize.ts` · 10 tokens

Sizes are **rem**, not px. 122 of the app's 528 px arbitraries are type values and that is the live
accessibility defect, because a px type value does not scale with a user's own text size.

The px column is the rendered value at a 16px root and is informational only. **Do not author against it.**

| Token | rem | at 16px | Tracking | Leading |
|---|---|---|---|---|
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

**Tracking tightens as size grows and opens as it shrinks.** The endpoints are the ruled values, -0.02em on
display and +0.05em on the eyebrow, with 0 as the body default. Leading runs 1.05 tight on display to 1.5 on
body text.

### ⛔ The 12.5 to 12 collapse

**The app's small type band of 11 / 11.5 / 12 / 12.5 / 13 collapses to 11 / 12 / 13.** Half pixel type steps
are not a system, they are the residue of authoring against a mockup.

The casualty is **12.5px, the most common arbitrary type value in the app at 31 uses, and also the DS chip
and action link size.** It becomes 12px, the `label` token.

⛔ **Do not reintroduce a half pixel type value anywhere.** This includes `13.5px`, which the DS small button
row does specify. **The DS row and the ruling conflict on that number and the ruling wins.**

⚠️ **DEBT.** `size-13` is still present in `theme/fontsize.ts` beside the ten tokens. The declaration said the
ten replace the practice it represents.

---

## Tabular figures

✅ **REQUIRED wherever digits CHANGE IN PLACE or SIT IN A COLUMN.** The test is whether digits change, not
whether they are in a column, and this app's card figures are websocket fed so they change in place.

⛔ **DEBT, and it is the wrong way round.** `tabular-nums` appears 27 times in `app/**` and **zero times in
any table**. All 27 sit on cards, badges, donuts and alert rows. `ComplexTable` renders eight numeric columns
with proportional digits.

⚠️ **One nuance from DL-19, and it is not a contradiction.** A large standalone hero figure reads better
**proportional**. Three figures in one row read better tabular. **Only the consumer knows which it is**, so a
primitive stays neutral and the surface opts in. The rule was never tabular against proportional, it is
whether the figures are scanned together.

⛔ **This does NOT license animating a figure.** Data the user is trying to read or act on does not move for
style. A number ticker or a text morph on a live value is rejected even though the house glossary names both.

✅ **One ruled exception, the digit morph on the Overview power flow card, Keith 2026-09-24.** Only the digits that changed move, 0.45em of travel with a 2px blur over 200ms on the strong ease-out, rising for an increase and falling for a decrease, 30ms stagger per changed digit, capped at 90ms so a whole figure settles by about 290ms. Tabular figures throughout. Reduced motion becomes a 200ms cross-fade with no stagger. Screen readers hear the whole value once. CSS keyframes only, no animation package. ✅ **Ruled by Keith 2026-09-24 after the motion review.** The digits line up on the decimal point, so the point never moves when the number of decimals changes, and the shared number formatter is not touched. A value's first real reading, including one replacing a `--`, appears without animating, so only a later change morphs.
⛔ **It is the approved pattern for a value that changes while the user watches, and nothing else.** Another live
value adopts it only under a work item that names it, reusing the same component and every mitigation. A value
that only changes on load never morphs.

⚠️ **On conversion, the requirement is on the COMMAND.** `pyftsubset`'s default `--layout-features` set does
NOT include `tnum`, so a naive subset kills tabular figures on a face that has them. The existing 22 KB Space
Grotesk subset preserved its features, so there is a working recipe to copy.

---

## Changelog

- 2026-09-22: created from the full design-system read. Body face wiring recorded as a finding.
- 2026-09-24: the digit morph exception added, ruled by Keith for the power flow card and approved as the pattern for live values only. Reasoning in `memory/topics/design-system.md` (DL-108).
