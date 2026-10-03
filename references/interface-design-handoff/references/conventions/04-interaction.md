# 04 · Interaction

The authority for all component work. Six states, six rules, and what a hover is allowed to promise.

Why in `memory/topics/design-system.md`, "THE INTERACTION CONTRACT" and "The close button".

⭐ **This was EXTRACTED, not designed.** `PreviewCard/index.tsx` and `AlertsList.tsx` between them already
carry the whole contract, shipped and working. Timing and easing come from the repo's own `emil-design-eng`
skill.

---

## The principle

**One treatment means one thing.** A control's appearance answers exactly one question at a time, and the
same question always gets the same answer. **Where a state is absent it is absent by decision, not by
omission.**

---

## The six states, on every `<button>` and `<Link>`

| State | Means |
|---|---|
| `rest` | the control doing nothing |
| `hover` | pointer over it. GUARDED, never fires on touch |
| `focus-visible` | keyboard reached it. Tab only, never on click |
| `press` | being pressed |
| `pending` | **BUSY, not unavailable.** Keeps the brand blue, because the action IS live |
| `disabled` | unavailable. **Reads as ABSENT** |

⭐ **`pending` closes a real gap.** 28 files do form submit and none declares a busy state. **It is the one
place the brand blue belongs on a control that cannot be clicked**, because the action exists and is in
flight. A pending button keeps its variant and gains the blue, it does not become a primary.

⛔ **`disabled` must NEVER take the brand blue.** Sky is this system's affordance colour, the focus ring, the
outline button, the hover tint, so a blue disabled control reads as available. **Disabled is `ink-400` on
`ink-50` with `cursor-not-allowed`.**

⛔ **The `not-allowed` cursor stays, and a branded custom cursor was REJECTED.** It is a learned convention
that means "you cannot do this" without being taught, and `cursor: url()` overrides a user's enlarged or high
contrast OS pointer. **Do not re-propose it.**

---

## The six cross cutting rules

1. **Pointer guard.** `[@media(hover:hover) and (pointer:fine)]`. Touch devices fire hover on tap, which
   leaves a stuck hover state.
   ✅ **AUTOMATIC FOR TAILWIND UTILITIES. Do NOT hand write the guard around a `hover:` utility.**
   `tailwind.config.ts` carries `future: { hoverOnlyWhenSupported: true }`, emit verified with a control run.
   ⛔ **The flag does NOT reach raw CSS `:hover` rules, and those still need it by hand.** Three hand written
   guards in `app/tailwind.css` wrap raw rules and must stay. **The distinction is whether the guard wraps a
   utility or hand written CSS, and that is the rule, not the count.**
2. **Keyboard parity.** Every hover declaration has a paired `group-focus-within`. **Not optional.** This is
   what stops a keyboard user losing an affordance a mouse user gets.
3. **Focus ring.** `focus-visible:outline outline-2 outline-offset-1 outline-hue-sky-500`. Note
   `focus-visible`, never `focus`.
4. **Press.** `active:scale-[0.97]` on controls. One step darker on rows and cells, where scale shifts
   layout. ⛔ **`active:scale-97` emits NO RULE in this config. Use the bracketed form.**
5. **Motion guard.** Cancel a movement with the same variant that set it, so `active:scale-[0.97]` pairs with
   `motion-reduce:active:scale-100`. ⛔ **Never a bare `motion-reduce:transform-none` against a state variant.** It
   loses on specificity and cancels nothing (corrected 2026-09-23). **Reduced motion means fewer and
   gentler, NOT zero.** Keep colour and opacity, remove movement and position.
6. **Timing scoped to the properties that change**, never `transition-all`.

---

## Timing and easing

| | Duration |
|---|---|
| Press feedback | 100 to 160ms |
| Tooltips, small popovers | 125 to 200ms |
| Dropdowns, selects | 150 to 250ms |
| Modals, drawers | 200 to 500ms |

**Under 300ms for anything UI, and exit faster than enter.**

| Motion | Curve |
|---|---|
| entering or exiting | `cubic-bezier(0.23, 1, 0.32, 1)` |
| moving on screen | `cubic-bezier(0.77, 0, 0.175, 1)` |
| a hover or colour change | plain `ease` |
| constant motion | `linear` |
| ⛔ **NEVER** | `ease-in`. It delays the initial movement at exactly the moment the user is watching |

**Popovers are origin aware, modals are not.** A popover scales from its trigger. A modal stays centred
because it is anchored to nothing.

---

## Prohibitions

1. ⛔ **Never `focus:outline-none` without a replacement in the same rule.**
   ✅ **ONE EXPLICIT EXCEPTION: Headless UI panels.** `<MenuItems>`, `<ListboxOptions>`, `<ComboboxOptions>`
   and `<Dialog>` take programmatic focus on open and the library documents the pattern. **Those 16 sites are
   correct and a sweep must not "fix" them.** The genuine defect is 7 focusable controls.
2. ⛔ **No layout shifting hover.** No `font-bold` on hover, no padding, size or border width change on hover. A heavier weight as a RESTING state, such as the sidebar's current row (DL-132), is allowed, because it changes on navigation, not under the pointer.
3. ⛔ **No raw hex and no legacy gray in a NEW interaction state.**
4. ⛔ **Never `transition: all`.** Name the properties.
5. ⛔ **Never enter from `scale(0)`.** Start at `scale(0.95)` with opacity. Nothing in the real world appears
   from nothing.
6. ⛔ **Never animate a keyboard initiated action.** Those repeat hundreds of times a day and animation makes
   them feel slow.

### ⚠️ The one ruled exception to prohibition 2

The Control tab's work mode dropdown grows the highlighted row to reveal its description and Watch link,
`grid-template-rows` 0fr to 1fr with an opacity fade, 150ms on the strong ease out. Keith compared it against
radio cards in the browser and chose the reveal.

**The mitigations are part of the exception**, so a second site would have to carry them too. The panel is
portalled to the foreground so the page beneath never reflows, nothing dims or blurs, keyboard driven
highlight moves swap with no animation, reduced motion is instant with colour kept.

⛔ **Scoped to that one popover. It is NOT a precedent.** A growing row anywhere else needs its own ruling.

---

## The six hover semantics, COMPOSITE SURFACES only

⚠️ **These do not apply to controls.** A control's hover is one state in the machine above. These are for
cards, cells, rows and pins. Keeping the two separate is why "tint" means one thing.

| | Promise | Treatment | Reduced motion |
|---|---|---|---|
| **Lift** | this navigates | `elev-2` to `elev-4` | drop the translate, keep colour and shadow |
| **Tint** | a readout, inspect it | the element's own `status-*-soft` step | unaffected |
| **Reveal** | there is more here | hidden control or readout fades in, in place | fade only, no slide |
| **Link** | its counterpart is over there | lands on the TARGET, not the hovered thing | pan and highlight land instantly |
| ⛔ ~~Tilt~~ | **RETIRED, DL-87.** Removed from the codebase. Do not re-add a tilt semantic | | |
| **Inert** | nothing will happen | none, `cursor: default` | n/a |

✅ **Tint is buildable today.** `theme/status.ts` carries the full four tier set and all five
`bg-status-*-soft` utilities emit, emit checked with a negative control.

⛔ **A tinted element must NEVER acquire a click handler** (DL-53). Tint means readout, and a hover state is
exactly what invites someone to wire one.

⛔ **Reveal must be reachable by keyboard focus**, not hover alone, or the control is hidden from every
keyboard user.

**Link declares its direction.** Some surfaces sync both ways, some are one way. Say which.

⚠️ **Lift is NOT buildable yet**, it needs `elev-2` and `elev-4`.

---

## The close button

**Every close button in the app is identical. No local variants.**

| State | Treatment |
|---|---|
| rest | bare grey X, `ink-600`, **no outline**. `ink-500` fails AA at 3.19:1 and this glyph is small |
| hover | **THREE changes together, one colour.** The X turns blue, a blue outline appears, the X rotates 90 degrees |
| focus-visible | the contract's ring, **same blue** at a different width or offset |
| press | `scale(0.97)` |
| reduced motion | **drop the rotation, KEEP the outline AND the recolour.** Motion goes, colour stays |
| duration | 100 to 160ms, plain `ease` |

**The blue is `hue-sky-500`**, the same value as the focus ring. ⭐ **One blue for both the glyph and the
outline is what makes hover read as a single event rather than two effects that coincide.**

⛔ **ROTATE 90 DEGREES, NEVER 45.** An X is two strokes at 45 and 135, so 90 maps the set onto itself and the
glyph lands looking identical, which is the intended effect. **45 lands it on a plus sign**, which reads as
"add" on a control that closes things.

⛔ **Use CSS `outline`, never `border`.** A border appearing on hover shifts layout by 1px, and layout
shifting hover is prohibited above. `outline` does not participate in layout.

⚠️ **There is NO close button template in the DS.** Searched for close, dismiss and icon-button, zero
matches. This component and the blue are ours.

---

## Two standing rulings that constrain new work

⛔ **The chart legend cluster is COVERED, not exempt.** Eleven files of real controls with an inline
`background:none; border:none; padding:0` reset and no interaction states at all. Exempting the largest
coherent group of bare controls would hollow out the contract.

⛔ **The 61 legacy gray hover declarations in GridGuardian, Settings and Configuration are FROZEN.** Bind new
work only, and **do not tidy a handful piecemeal** and leave an area half converted.

⚠️ **The focus ring is a MIGRATION, not the incumbent.** `outline-hue-sky-500` appears 9 times against
`ring-blue-500` at 14 and `ring-indigo-500` at 8, both stock Tailwind and outside this project's ramp.
**Bind new work to it, and do not mass convert existing blues without a work item that says so.**

**It ships as documented classes, not a shared helper.** A helper is one more shared file while branches are
open. Extract at the boundary sync.

---

## Changelog

- 2026-09-22: created from the full design-system read.
- 2026-10-01: the no font-bold line scoped to hover, a resting heavier weight allowed (DL-132).
