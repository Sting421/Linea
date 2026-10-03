# 06 · Cards

Two axes, because size and importance are not the same thing.

Why in `memory/topics/design-system.md`, "THE CARD CENSUS" and "THE CARD SYSTEM".

---

## The root cause this system fixes

Cards read as "sometimes too thick, sometimes too short, sometimes too empty". **Measured, the cause is one
thing.** Across 100 DS templates there are about twelve `min-height` declarations and **not one is on a
card**. So card height is entirely content driven, which is exactly the failure. Two cards side by side with
different content volumes end up different heights, and a card with a thin payload ends up looking empty.

**There was no size system for cards, the same way there was none for buttons.**

---

## Axis 1 · DENSITY, chosen by the card's rendered WIDTH

Governs padding, title size and radius. **Nothing else.**

| Density | Padding (h × v) | Title | Radius | Where |
|---|---|---|---|---|
| `compact` | 12 × 12 | 13px | 10px | band cards, 3-up and 4-up grids, sidebars |
| `standard` | 18 × 16 | 15px | 12px | the workhorse, 2-up grids, most of Area 2 |
| `feature` | 18 × 20 | 18px | 14px | a screen's primary surface, full or near full width |
| `inset tile` | 14 × 12 | none, eyebrow only | 10px, **flat** | a card INSIDE a card |

⭐ **Why density follows width rather than importance.** Padding to width RATIO is what reads as tight or
bloated. 18px inside a 240px band card is cramped. 12px inside a 900px feature card looks unfinished.

⛔ **Do not read the density names as an importance ranking.** `compact` does not mean less important. **An
Area 1 primary band card is high prominence and compact density**, and that combination is the whole point of
the split. It was unreachable while tier meant size.

---

## Axis 2 · PROMINENCE, chosen by hierarchy

Governs content and treatment, **never geometry**.

- whether there is a title at all, or an eyebrow only
- whether the figure takes the display face and the large step
- which elevation the card rests at
- whether it carries metadata, an action or a footer

---

## Height, anatomy only

⛔ **NO `min-height` on any card, at any density.** A floor reserves space the content does not fill, which

✅ **One exception, ruled 2026-09-23.** An empty-state placeholder inside a card may declare the height of the populated element it replaces, and exactly that height, so the card reads the same with and without data. It is not a card floor and does not license one.
produces the "too empty" failure. **Height comes out consistent because the anatomy is consistent**, a density
fixes padding and title size, and prominence fixes how many content rows exist.

✅ **Where cards genuinely must match height side by side, that is a GRID STRETCH on the row**
(`items-stretch`), never a height on the card. **The row owns equal heights. The card never does.**

---

## Cards are DYNAMIC by default

**Density steps DOWN as the card narrows**, feature to standard to compact, and the card responds to **its own
width, not the viewport's.**

⛔ **CONTAINER queries, NOT media queries, and the reason is not stylistic.** The same card appears in a 4-up
band and in a 2-up layout **at the same viewport width**. A media query cannot tell those apart and would give
both the same density. **That is the bug this rule exists to prevent.**

✅ **Achievable with no config change.** `tailwindcss` is 3.4.3 and the container queries plugin is not
installed, but Tailwind 3 arbitrary variants pass at-rules through, so `[@container(min-width:_Npx)]:` works
with `[container-type:inline-size]` on the parent. **No `tailwind.config.ts` or `package.json` change.**
`truncate` and `line-clamp-*` are already in core.

---

## Text overflow

| Element | Rule |
|---|---|
| **card title** | ONE line, `truncate`, **never wrap.** A wrapping title changes card height and reintroduces the inconsistency this whole system removes |
| **eyebrow** | one line, truncate |
| **labels and names** | truncate, and carry the full string in a `title` attribute so it stays reachable |
| **descriptive prose** | `line-clamp-2` only, a fixed clamp so height stays predictable |
| ⛔ **numeric values** | **NEVER TRUNCATE** |

⛔ **NEVER ELLIPSIS A NUMBER. This is a correctness rule, not a style rule.** A truncated figure is not a
shortened figure, it is a **wrong figure**, and this application exists to report figures people act on.
`1,845,540.12` clipped to `1,845,5…` reads as a real and much smaller number.

**When a figure does not fit, the exits are: fewer decimals, step the unit up (kWh to MWh), or step the type
size down. Never clip.** Applies to every figure, delta, count and percentage.

---

## The card header

**Every card carrying important content has one, and it is uniform.**

| | Value |
|---|---|
| Face | display face, weight 600 |
| Colour | `hue-sky-900` `#1F4173` |
| Size | **by DENSITY, 18 / 15 / 13. Never by importance** |
| Case | **TITLE CASE** |
| Layout | title left, metadata right, one flex row, `space-between` |
| Overflow | one line, truncate |

⛔ **TITLE CASE IS A DELIBERATE OVERRIDE OF THE DS. Negated here so it is not "corrected" back.** Measured
2026-09-21, **eight of eight genuine DS card titles are sentence case**. Keith ruled Title Case anyway knowing
the count, so the override stands as a deliberate call against eight rather than a casual one against two.

**Finding sentence case in a template is NOT evidence of the standard.** This is a named exception to the
rule that the repo moves toward the Design version.

⚠️ **It does not contradict the prose convention.** Keith's writing rules bar title case headings in prose he
sends. **A UI card header is a label, not prose.** The two coexist and neither is evidence about the other.

---

## The eyebrow

✅ **ONE set of values, ending the worst drift in the system.**

**11px, uppercase, weight 600, `letter-spacing: 0.05em`, `hue-ink-500` `#8A9199`.**

The idiom appears in at least 30 non gallery templates at 10 / 10.5 / 11px, weights 600 and 700, three
different letter spacings and two colours. ⛔ **`#B4BBC1` is untokenised and dies. Weight 700 and the 0.03em
and 0.09em spacings are drift, not variants.**

---

## The inset tile

A card inside a card. Already in the DS as the capacity card's nameplate tiles, and already consistent with
both the radius bands and the elevation rule.

**Reference implementation.** `rounded-[10px] border border-hue-ink-100 bg-hue-ink-50 px-4 py-3`, eyebrow at
`text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-hue-ink-500`, figure at
`font-display text-lg font-semibold tabular-nums text-hue-ink-900`.

**Radius 10 sits one step below the 14 of the card holding it**, which is the declared inset relationship.

⛔ **A read only tile row is NOT interactive.** No `aria-pressed`, no pointer cursor, no hover. A tile that
also filtered would rebuild the conflict the donut's click-to-filter was removed for.

---

## ⛔ DEBT · the card idiom is split and the conforming one is not the newest

✅ **`GraphWrapper` IS the card system**, ruled 2026-09-21. Measured, it is the only surface on the platform
matching the declared **feature** density exactly, 18 × 20 with radius 14 and an 18px title.

⛔ **The `p-5` idiom on Events and Control matches NO declared step.** `p-5` is 20 × 20, two pixels off the
system. Both ship it and both are wrong.

⭐ **The durable lesson.** The reconciliation that produced it compared **card against card rather than card
against the token**, converging the newer card onto the newest sibling, **so both landed off the scale while
matching each other.** Compare against the declared value, never against the neighbour.

**Extraction of a shared `Card` component was rejected twice**, both times as right architecture wrong
moment.

---

## Changelog

- 2026-09-22: created from the full design-system read.
