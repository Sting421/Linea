# 02 · Form

Shape and depth. What a thing looks like it IS, before anything else is decided.

Why in `memory/topics/design-system.md`, "THE RADIUS CENSUS", "SHAPE IS A DECLARED CHANNEL", "ELEVATION AND
SHADOW", "BUTTON ELEVATION BY HIERARCHY", and DL-68 and DL-69 in the decision log.

---

## Shape ⚠️ DECLARED, applied per component

**Shape says what a thing IS, before colour says anything about it.** A component takes the band its ROLE
puts it in, never the band a designer prefers.

Measured across all 909 `border-radius` declarations in `design/templates/`. The DS does not have one radius,
it has four bands, and each band means something. Nobody had noticed until it was counted.

| Band | Value | What wears it |
|---|---|---|
| **Fully round** | `999px` or `50%` | a LABEL, a STATE, a TOGGLE or an identity. Never a command. Chips, tags, severity badges, status dots, switches, avatars, chip scale selection tokens |
| **Soft rectangle** | 6 to 10px | a COMMAND or an INPUT. Every real control, no exceptions. Buttons at 8/9/10 by size, inputs, selects, pagination, segmented controls, dropdown triggers, popover inner surfaces |
| **Container** | 12 to 14px | a SURFACE that holds other things. Cards, panels, popovers, modals |
| **Micro mark** | 4px | a MARK, not a component. Swatches, progress caps, legend keys |

### Prohibitions

⛔ **A pill button is PROHIBITED, and so is a square one.** Three reasons, on the record so it is not
reopened as taste.

1. **Chips, tags and severity badges already own fully round.** A pill button and a filter chip would be the
   same shape, which collapses the one non colour signal the system has for command against label.
2. **It inverts the nesting.** A pill at about 17px inside a 12px card is a child rounder than its parent,
   which reads as pasted on rather than contained.
3. **The round leaning brief is already met.** 8px on a 31px control is a quarter of its height.

⛔ **The "solar panels are square so controls should be square" argument is REJECTED.** It applies the
subject matter to the wrong layer. Panels belong to the DATA layer, which is already rectangular by nature,
the equipment cells, the tables, the map, the panel and inverter glyphs. A control layer that restates its
own subject matter stops reading as something you operate. **Do not re-raise this as a skeuomorphic
argument.**

### Two riders

⚠️ **Scale is part of the rule.** The time filter's quick range items ARE selectable and they ARE pills, but
they are chip scale, 12px type in about 20px of height. **Everything at 28px or taller with 13 to 15px type
is a soft rectangle.** The boundary is command against token, not interactive against not.

⭐ **The bands nest correctly.** A button at 8 to 10 inside a card at 12 to 14 is a child less round than its
parent, which is what makes it read as sitting inside rather than pasted on.

⛔ **DEBT · `theme/borderRadius.ts` is a junk drawer.** Three keys, `2.5xl` 20px, `2lg` 10px, `4xl` 43px.
None of them is a band. Radius is the one place the alignment ruling says new tokens ARE needed, because 9px
is absent from Tailwind's own scale.

---

## Depth ⚠️ DECLARED · `theme/elevation.ts` DOES NOT EXIST

**One scale, seven levels, TWO channels.** A component names what it IS, a resting card, a popover, a modal,
and receives both a shadow and a surface fill.

⛔ **A component never picks a grey and never sets its own background to get depth.**

⛔ **Do NOT author against `elev-*` yet.** The token file does not exist in the tree. Use whatever shadow the
surrounding surface already uses, match the neighbour rather than improve it, and do not hardcode a
`box-shadow` arbitrary value to approximate the scale.

### The governing principle

**Shadow expresses ELEVATION and nothing else.** The higher a surface sits, the wider the shadow it casts.
Never decorative, never a way to separate two things at the same height, never a substitute for a border.
Two surfaces at the same elevation get the same shadow even when they are different components.

**Keith's stated problem is the specification.** *"my main issue with the interface is everything looks
flat."* A level that does not read as further forward than the one behind it is wrong however correct its
numbers are.

### Channel 1, the shadow scale

Naming is **ADDITIVE**, `elev-0` to `elev-6`, sitting alongside Tailwind's `shadow-*` rather than overriding
it. Overriding would silently restyle every existing call site and nothing in the suite can catch a shadow
change.

Colour is **near neutral**, `#0F0F10` = `rgb(15 15 16)` for `elev-1` through `elev-5`, `#101828` =
`rgb(16 24 40)` for `elev-6` only.

| Token | Surface | Value |
|---|---|---|
| `elev-0` | flush with the page. Table rows, chips, badges, anything inside a card | `none` |
| `elev-1` | resting FILLED controls only. A solid primary, a filled input | `0 1px 2px 0 rgb(15 15 16 / 0.05)` |
| `elev-2` | resting cards. Capacity band, stat tiles, alerts widget, `PlantCard` at rest | `0 0 0 1px rgb(15 15 16 / 0.05), 0 1px 3px 0 rgb(15 15 16 / 0.10), 0 1px 2px 0 rgb(15 15 16 / 0.06)` |
| `elev-3` | raised. A card focused or selected from outside | `0 0 0 1px rgb(15 15 16 / 0.05), 0 4px 6px -1px rgb(15 15 16 / 0.08), 0 2px 4px -1px rgb(15 15 16 / 0.06)` |
| `elev-4` | hover lift on a navigational card, dropdowns, the map's floating list | `0 0 0 1px rgb(15 15 16 / 0.05), 0 10px 15px -3px rgb(15 15 16 / 0.10), 0 4px 6px -2px rgb(15 15 16 / 0.05)` |
| `elev-5` | popovers and content bearing tooltips | `0 0 0 1px rgb(15 15 16 / 0.05), 0 20px 25px -5px rgb(15 15 16 / 0.10), 0 10px 10px -5px rgb(15 15 16 / 0.04)` |
| `elev-6` | modals and dialogs ONLY | six layers, below |

**`elev-6` takes the full six layer treatment**, tinted to `rgb(16 24 40)`. One modal is on screen at a time,
so the paint cost that rules the stack out everywhere else does not apply, and this is the one surface where
the quality is visible.

```
0 0 0 1px         rgb(16 24 40 / 0.06),
0 1px 1px -0.5px  rgb(16 24 40 / 0.06),
0 3px 3px -1.5px  rgb(16 24 40 / 0.06),
0 6px 6px -3px    rgb(16 24 40 / 0.06),
0 12px 12px -6px  rgb(16 24 40 / 0.06),
0 24px 24px -12px rgb(16 24 40 / 0.06)
```

**The contact hairline is `0 0 0 1px` at 5 percent, on `elev-2` and above, and NOT on `elev-1`.** A hairline
on a button is a border by another name and buttons carry their own. The hairline is what makes an object
read as sitting ON the page rather than floating over it.

**Hover is a two step lift, 2 to 4.** One step is not perceptible at these alphas and three reads as a jump.

⚠️ **`elev-6` is the only step holding Y equals blur at 1:1 and the only one with uniform alpha.** Steps 1 to
5 inherit Tailwind's wandering ratios and hand set alphas. **That inconsistency is deliberate. Nobody should
"fix" one to match the other.**

**Three rules for any new shadow.** Y equals blur at 1:1, it reads as one light source overhead. Negative
spread at minus half the blur when a shadow is wide enough to halo. The contact hairline first.

### Channel 2, surface tone · DL-69

**ONE step, not three.** The values were measured and the three step version was rejected.

| Level | Fill |
|---|---|
| **Base, the page ground** | `hue-ink-100` `#EDF1F4`, a 1.136 step below white |
| `elev-1` through `elev-6` | **all `#FFFFFF`**. Cards, popovers and modals share the ceiling and separate by shadow alone |
| `elev-0` | **takes the tone of whatever contains it.** `ink-100` on the page, white inside a card. A rule, not a value |
| The sidebar | leaves the tone scale entirely and takes a dark ground. `hue-ink-900` `#20262B` proposed, awaiting Keith's eye |

⭐ **THE REASON IS NOT TONE, IT IS THAT THE SHADOW SCALE HAS NEVER BEEN VISIBLE.** Every shadow in the app
currently falls on white, cast by a white card, so all seven declared levels render as close to nothing.
**Moving the page off white does not buy one level of depth, it switches on the seven already declared and
never seen.**

⛔ **Three steps was rejected because its middle level cannot be seen.** Base to card lands around 1.056 and
card to overlay around 1.076, both under the roughly 1.05 floor where a step stops reading. **A marginal tone
step looks WORSE than none**, it reads as a dirty panel rather than as hierarchy.

⛔ **If it still reads flat after this, the remedy is tuning shadow VALUES in the browser, NOT adding tone
steps.**

**Two riders, consequences rather than choices.** The table header at stock `bg-gray-100` `#F3F4F6` is within
a hair of the new page ground and must move to a token in the same change. `PowerFlowChart`'s nine hardcoded
`#F9F9F9` tiles will sit ABOVE a tinted page rather than below it, so the diagram reads inverted until
addressed. **Both take `hue-ink-50` `#F4F7F9`, the inset role. No fourth value is minted.**

**Names carry purpose, never colour.** ⛔ **No token name mentions a grey.** A colour name is a lie the day
anything tints, and it turns a dark mode swap into a rewrite.

---

## Elevation by hierarchy

⭐ **Elevation follows SURFACE, not importance.** Those correlate but are not the same thing, and surface is
the one that is physically true. **A control with no fill has nothing to raise, so it cannot cast a shadow
however important it is.** Importance is carried by fill and weight. Height is carried by whether a surface
exists at all.

| Variant | Elevation |
|---|---|
| `primary`, solid fill | `elev-1` at rest, `elev-2` on hover |
| `secondary`, our outline | **`elev-0` always.** The border does the edge work |
| `tertiary` / `ghost` | **`elev-0` always.** No surface exists to lift |
| `destructive`, outline | **`elev-0` always** |
| `icon-only` | the elevation of whichever level it wears |
| **`disabled`, every variant** | **`elev-0`.** Not raised, it reads as ABSENT |
| **`pending`, every variant** | **keeps its REST elevation, never lifts.** Busy, not inviting |

⛔ **The outline rule prevents a named anti pattern, it is not a style preference.** A border plus a shadow
on one elevated edge is the double edge artifact. An outline button at `elev-1` rebuilds it.

⛔ **A graded scale by importance was considered and REJECTED.** Primary at `elev-2` would cast the same
shadow as the card containing it.

⚠️ **The rule that resolves absolute tokens against relative language.** A control never RESTS at or above
its container's step, and a hover may reach that step but never pass it. A primary at `elev-1` inside an
`elev-2` card is correct, and its hover to `elev-2` is the ceiling. **If a surface needs more lift than that,
the container moves, not the button.**

---

## Changelog

- 2026-09-22: created from the full design-system read.
