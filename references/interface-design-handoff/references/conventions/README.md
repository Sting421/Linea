# Design conventions

**Ovanova Microgrid Aggregation Platform.** The rules a component is built against, stated as rules.

Built 2026-09-22 from a full read of `memory/topics/design-system.md` (3,220 lines), the decision log's
design sections, `docs/AREA-BUILD-GUIDE.md`, the design system sync ledger, and every file in the repo's
`theme/` directory.

---

## What these files are, and what they are not

**These carry the DECISION. The wiki carries the REASONING.** Same split `memory/topics/conventions.md`
declares for board fields and PR descriptions, applied one layer up.

- A file here says what to build, at what value, with what prohibited.
- `memory/topics/design-system.md` says why it was ruled that way, what was measured, what was rejected,
  what was retracted and on what date.

⛔ **If you want to know why a rule exists, read the wiki. Do not add the why here.** The moment a file here
starts arguing for a rule it becomes a second copy of the wiki, and two copies of one definition is this
project's number one drift mode.

⛔ **These do not supersede anything.** Where a file here and the wiki disagree, the wiki is right and the
file here is stale. Fix the file.

---

## The rule that matters more than any value below

⛔⛔ **MOST OF THIS IS DECLARED AND NOT BUILT. A rule can be canonical and completely absent from the running
app at the same time.**

Nine conventions were ruled on 2026-09-01. The values live in the wiki. A good part of the token side still
does not exist in the repo. So **check the build state before authoring against a rule**, because a class the
resolved config cannot resolve emits no CSS, passes review, and renders wrong with nothing erroring at any
layer.

**Every file here marks each rule.**

| Mark | Meaning |
|---|---|
| ✅ BUILT | the token exists in `theme/` and is wired into `tailwind.config.ts`. Author against it |
| ⚠️ DECLARED | ruled and recorded, token absent or unmerged. Do NOT author against it yet |
| ⛔ DEBT | shipped code that breaks the rule. Named so it is not mistaken for the standard |

---

## Build state, read 2026-09-22

⛔ **THIS IS A WORKING TREE READ, NOT A BRANCH MEASUREMENT.** The tree sits on whatever branch was last
checked out, so a file being present here does not prove it is on `dev`. Settle any row that matters with
`git show origin/dev:<path>` before acting on it.

| Token family | File | State |
|---|---|---|
| status, 5 families × 4 roles | `theme/status.ts` | ✅ BUILT, wired |
| categorical, 10 values | `theme/categorical.ts` | ✅ BUILT, wired |
| ink ramp, 12 steps | `theme/ink.ts` | ✅ BUILT, wired |
| brand ramp | `theme/colors.ts` | ✅ BUILT, wired. Four deprecated ramps still exported alongside it |
| type scale, 10 tokens | `theme/fontsize.ts` | ✅ BUILT, wired. `size-13` still present beside them |
| display face, Overused Grotesk | `theme/fontFamily.ts` | ✅ BUILT, wired |
| body face, Opening Hours Sans | none | ⛔ **`@font-face` exists, nothing references it.** See below |
| elevation scale, `elev-0..6` | none | ⚠️ DECLARED. `theme/elevation.ts` does not exist |
| surface tone, DL-69 | none | ⚠️ DECLARED |
| radius scale | `theme/borderRadius.ts` | ⛔ 3 keys, `2.5xl` 20px, `2lg` 10px, `4xl` 43px. Matches no declared band |
| spacing scale | `theme/spacing.ts` | ✅ 3 keys, all live, all following key × 4px. `68` is the nav rail |
| shadow | `theme/boxShadow.ts` | ⛔ 4 unsystematic keys, `500` `card` `llg` `xs`. Not the declared scale |
| prose typography | `theme/typography.ts` | ⛔ A stub carrying raw `#333` and `#3182ce`. Not tokens |

**The body face finding, and it needs confirming rather than acting on.** `app/tailwind.css` declares
`@font-face` for Opening Hours Sans, so the file downloads. `theme/fontFamily.ts` carries exactly one key,
`display`. There is no `sans` override and no `body` key, and the string "Opening Hours" appears in no other
file in the repo. So body text still resolves to the viewer's own system stack and the browser fetches a face
nothing renders.

That contradicts the 2026-09-02 ruling, which was explicit that `sans` is overridden rather than supplemented
and that the blast radius was the point. ⛔ **This is a read, not a measurement. Confirm with
`git show origin/dev:theme/fontFamily.ts` before it instructs anything.**

---

## The spine, in five sentences

Five ideas decide almost everything here. Nearly every specific rule below falls out of one of them.

1. **Shape says what a thing is, before colour says anything about it.**
2. **Shadow means height and nothing else.**
3. **Colour comes from three palettes with three jobs, and a status hue never decorates.**
4. **Card size comes from how wide the card is, not from how important it is.**
5. **Two typefaces, one for identity and every numeral, one for prose.**

---

## Index

| File | Covers |
|---|---|
| `01-foundations.md` | The three palettes, status semantics, the token architecture, contrast floors |
| `02-form.md` | Radius bands, the depth scale, surface tone, elevation by hierarchy |
| `03-typography.md` | Two faces, face by role, the ten type tokens, tabular figures |
| `04-interaction.md` | Six states, six rules, timing, easing, prohibitions, hover semantics, the close button |
| `05-buttons.md` | Five variants, the DS size table, appearance rules, the DS hierarchy mapping |
| `06-cards.md` | Two axes, density values, height, text overflow, the header, the eyebrow |
| `07-layout.md` | Breakpoints, the two mechanism rule, the priority ladder, alignment and spacing |
| `08-messaging-and-charts.md` | Chips, banners, toasts, chart layout, the categorical palette in use |
| `09-traps.md` | Icon defect classes, sibling copies, naming traps, known shipped defects |

## Maintenance

**Edit in place.** A rule that changes is corrected where it sits, not appended to. Each file carries a
one line changelog entry for the change.

**A new file only for a genuinely distinct concept.** Nine files cover the nine declared conventions plus
foundations and traps. A tenth wants a reason.

⚠️ **When a ⚠️ DECLARED row becomes ✅ BUILT, the README table is the thing that goes stale first.** Update
it in the same turn as the token lands.
