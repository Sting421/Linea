# 05 · Buttons

Appearance only. **Every button BEHAVIOUR is `04-interaction.md` and nothing here restates it.**

Why in `memory/topics/design-system.md`, "BUTTONS, the appearance layer" and "`Button/index.tsx` READ IN
FULL".

---

## Five variants, and the placement rule that makes the hierarchy real

| Variant | Appearance |
|---|---|
| `primary` | solid fill, white label. **ONE per screen region, no exceptions** |
| `secondary` | outline, grey at rest, blue on hover. **The default for everything else** |
| `tertiary` | no border, label only. Low stakes, in table, in row, repeated actions |
| `icon-only` | square, at any of the three levels above. **Accessible name REQUIRED** |
| `destructive` | outline first, on the fault ramp |

⛔ **One primary per region is the load bearing rule.** Without it the hierarchy is decoration, because a
screen with three solid buttons has no primary at all. **Region means a card, a panel, a modal footer or a
page header**, not the whole viewport.

---

## The primary

✅ **White on `hue-sky-800`.** Measures **7.76:1** against white, so it passes AA with room. **No new hex, no
new token, an existing step used correctly.**

⛔ **The DS Button template's solid primary FAILS AA and this corrects it rather than adopting it.** White on
`hue-sky-500` `#009DE4` measures about **3.0:1** against the 4.5:1 floor for 14px text. Confirmed three times
independently. **Do not "restore" the template's 500 fill.**

✅ **THE PRIMARY DOES NOT DARKEN ON HOVER.** The fill stays `hue-sky-800` in every state. Hover is a **one
step elevation lift**, `elev-1` to `elev-2`, plus the contract's press scale.

**Why, so it is not reopened.** The ramp is 50, 100, 300, 500, 600, 800, 900 with **no step between 800 and
900**. `hue-sky-800` to `hue-sky-900` is a **1.31:1** step, below the roughly 1.5:1 threshold for a
perceptible surface to surface change, **and they are different hues**, teal leaning to navy, so it would
read partly as a hue shift rather than a darken.

⛔ **Two options were considered and REJECTED. Do not re-propose either.** Hovering to `hue-sky-900`, and
adding a `hue-sky-700` step to the ramp.

⚠️ **The hover has a dependency.** It needs `elev-1` and `elev-2`, which do not exist yet. **A component
needing a button before those land uses the SECONDARY rather than improvising a primary hover.**

---

## The secondary, tertiary, icon-only and destructive

**The secondary already shipped and is promoted rather than re-derived.** Rest is a grey border with an
`ink-700` label. Hover tints the surface to `hue-sky-50` and takes the label to `hue-sky-800` at 7.76:1.
**Reuse it. Re-deriving a second outline button is how two secondaries end up on one screen.**

**Tertiary** is a bare label in `ink-600`, hover tints to `ink-50`. ⚠️ `ink-600` is the FLOOR, so a tertiary
may not be lightened to look quieter. **If it needs to be quieter than `ink-600` it should not be a button.**

**Icon-only** is square with equal padding on all four sides and the glyph inherits the level's label colour.
An accessible name is **required**, not optional. ⚠️ **The icon census applies**, several glyphs carry
hardcoded fills or no viewBox, so an icon-only button cannot assume its glyph recolours or scales. See
`09-traps.md`.

**Destructive** takes the fault ramp, outline by default.
✅ **An outline destructive needs no confirmation. A SOLID destructive is permitted ONLY with hold to
confirm.** The pattern is declared, `clip-path: inset(0 100% 0 0)` overlay, **2s linear on press, 200ms ease
out snap back on release**, slow where the user is deciding and fast where the system responds. Outline stays
the default because it is cheaper and most destructive actions here are reversible.

⛔ **The earlier reason, that destructive stays outline "because this app has no confirm dialog pattern yet",
was WRONG and is corrected.** A confirmation pattern IS declared, it just is not a dialog.

---

## Sizes ✅ DECLARED IN THE DS. Adopt, never invent.

⛔ **READ THE RIGHT FILE.** There are three files named `Button.dc.html`. The real one is
`design/templates/form-controls/Button.dc.html` with `form-controls/ButtonGallery.dc.html` beside it.
`domain-control-readout/Button.dc.html` is a domain readout's local button, and reporting from it is how this
got measured wrong once already.

| Size | Type | Padding | Radius | Gap | Computed height |
|---|---|---|---|---|---|
| `sm` | 13.5px | `7px 13px` | **8px** | 6px | ~31px |
| `md` (default) | 14px | `9px 16px` | **9px** | 7px | ~35px |
| `lg` | 15px | `11px 20px` | **10px** | 8px | ~41px |

All three at `font-weight:600`, `line-height:1.1`, `letter-spacing:.005em`, `box-sizing:border-box` with a
1px border. **Heights are derived, not declared.**

⛔ **RADIUS SCALES WITH SIZE, 8 / 9 / 10.** The claim that radius is "settled at 9px" was wrong and is
retracted. 9px is `md` only.

⚠️ **The prop enum declares FIVE sizes, `xs` `sm` `md` `lg` `xl`, and the gallery defines THREE.** `xs` and
`xl` have **no visual definition anywhere. Do not guess values for them.** Report and stop.

⚠️ **The type size conflicts with the type scale and the SCALE WINS.** The DS small row says 13.5px and the
typography ruling bars a half pixel type value anywhere. Use 13px in rem.

---

## Appearance rules across all five

- **Labels are sentence case, verb first, no title case, no trailing punctuation.**
- **Icon plus label keeps the icon leading**, unless the icon means "onward", in which case it trails.
- **`pending` keeps its variant and gains the blue.** It does not become a primary.
- **`disabled` never takes blue.** `ink-400` on `ink-50` with `cursor-not-allowed`.

### Six prohibitions

```
never solid hue-sky-500 with a white label. It fails AA and the failure is measured
never a raw hex. The one in the app today is frozen legacy, not a precedent
never hover:font-bold or any weight change. It shifts layout
never two solid buttons side by side. That is the one primary rule stated as a shape
never an icon-only button without an accessible name
never a button styled as a link unless it navigates. That belongs to anchors
```

---

## The DS hierarchy, and it does NOT match our five variants

Read from `form-controls/Button.dc.html`. The prop schema is
`hierarchy: primary | secondary | tertiary | outline | ghost | link` plus separate `destructive` and
`loading` booleans.

| DS hierarchy | Rest treatment |
|---|---|
| `primary` | solid `#009DE4`, white label |
| `secondary` | **solid grey fill `#F1F4F6`**, label `#46505A` |
| `tertiary` | renders as `secondary` |
| `outline` | white fill, 1px `#CFE8F6`, label `#1F4173` |
| `ghost` | transparent, label `#1F4173` |
| `link` | renders as `ghost` |
| `destructive` solid | `#D92D20`, white label |
| `destructive` outline | white fill, 1px `#F2B7AF`, label `#D92D20` |

⛔ **NAME COLLISION THAT MATTERS. The DS `secondary` is a SOLID GREY FILL. Our secondary is the grey OUTLINE
button, which maps to the DS's `outline` hierarchy.** Our hierarchy stands. The mapping is recorded so nobody
re-derives it. Six names are really four treatments, since `tertiary` and `link` are aliases in the render.

✅ **The DS `loading` IS our `pending`**, a 14px spinner with `border-top-color:transparent`, the fill kept,
`cursor:default`. **So `pending` was not invented, it was already in the DS and simply never built.**

⛔ **The DS `disabled` is `opacity:.5` on the blue fill. Do NOT adopt it.** That is a half opacity blue, which
breaks our own rule, and at 50 percent the white label's contrast collapses below the already failing 3.0:1.

⚠️ **`#CFE8F6`, the DS outline border, has no token.** It sits between `hue-sky-100` and `hue-sky-300`. It is
also exactly the hardcoded `border-[#CFE8F6]` on the map's Search This Area pill, so that hex is a faithful
port of the DS outline button rather than a stray. **Either the ramp gains that step or the pill keeps its hex
with a reason written down.**

---

## ⛔ DEBT · `app/components/Button/index.tsx`, 30 lines carrying five findings

All five are **pre existing and revealed by reading**, so they ride the owning item's description rather than
filing as bugs.

1. ⛔ **NO VARIANT CARRIES A WEIGHT CLASS.** Not one of the five sets `font-semibold` or `font-bold`, so every
   label renders at 400 where the DS says 600. **Adding the display face alone would ship the new typeface at
   the wrong weight.** ⚠️ **The DS button spec is a package**, face, weight, line height, letter spacing and
   the three sizes with their own padding and radii. **Half of it is not half an improvement.**
2. ⚠️ **`font-sm` is not a Tailwind class and appears to emit nothing.** Strong candidate rather than a
   measured fact, and very likely how finding 1 went unnoticed.
3. ⛔ **The `default` variant DROPS `${className}`.** A caller styling a default variant button silently loses
   every class it passes. Silent, and invisible at the call site.
4. ⛔ **Token violation plus a convention breach on one line.** `bg-hue-sky-800 ... hover:bg-sky-700` mixes
   the project ramp with stock Tailwind, and **it darkens on hover**, which the ruling prohibits.
5. **`variant` and every other prop are typed `any`.**

**Plus `min-w-[128px]` on all five variants.** A floor rather than a clip, so the failure mode is label
wrapping at increased text size. ⭐ **The DS declares NO minimum width on any button size**, `grep -c
min-width` returns zero with a control, **so 128px is a repo invention and the fix is deletion.**

⭐ **This file should be the FIRST item in convention application work.** One file, thirty lines, carrying the
appearance ruling, the DS sizes, the shape bands, the hover prohibition, the token rule and the overflow
defect all at once. **Fixing it properly demonstrates six of the nine conventions.**

---

## Changelog

- 2026-09-22: created from the full design-system read.
