# Repository design guide excerpt

Snapshot of the design and skill sections of the local repository guide. Original wording is retained, including historical contradictions and names. Read the handoff corrections first. Non-design workflow sections are omitted.

## ⛔ AGENT SKILLS — the four that bind, and the four that were REMOVED

Ruled 2026-09-02 (Keith). Eight skills were installed. **Four are kept and four are gone.** They live in
`.agents/skills/`, and `.claude/skills/` holds symlinks to them. ⚠️ **`.claude/skills/` is NOT the source. Read
`.agents/skills/`.**

**Consult these by name rather than loading all four.** Each one backs specific declared conventions, so the
table is a router, not a reading list.

⛔ **CONSULT THEM AT PLAN TIME, AND SAY IN THE PLAN WHAT EACH ONE CHANGED. Added 2026-09-07 because they did
not fire.** On `AB#953` all four were available and none was opened until Keith asked outright whether they had
been, by which point the work was built. They then changed five things about the motion in that diff, so they
were the right skills carrying the right content. Two of them declare `disable-model-invocation: true` and will
never invoke themselves, and this line is the only thing that makes them run. **So for any task touching a
component, motion, typography, elevation, an overlay or a toast, name the skills you consulted in the plan and
state per skill what it changed or that it changed nothing.** A plan that does not mention them is incomplete,
not merely terse. Consulting them after the build is a correction pass, and it costs a rebuild every time.

| Skill | Load it when | What it actually backs here |
|---|---|---|
| **`emil-design-eng`** | any component polish, motion decision, toast or overlay work | **The highest-value skill in this repo.** Three of the four corrections to the toast spec came from it — percentage `translate()` over hardcoded px, transitions over keyframes (keyframes restart from zero, transitions retarget), and same-direction enter and exit which is the symmetric-exit rule. Carries a **Sonner Principles** section, and the toast template is still unbuilt. Also Component Building Principles, Performance Rules, Accessibility. |
| **`apple-design`** | typography, elevation, reduced motion, gesture and sheet work | §15 typography is where the type scale's tracking and leading came from. §14 reduced motion is behind the close-button rule. §12 materials and depth is behind the `elev-0..6` scale. |
| **`review-animations`** | reviewing any diff that touches motion | `disable-model-invocation: true`, so it only runs when invoked. Carries the Ten Non-Negotiable Standards. ⭐ **Track record here** — it produced the hover-gating finding that became real scope on task 899. It is a craft gate on motion and does NOT replace the audit against the plan of record. |
| **`pick-ui-library`** | a genuinely NEW library need, nothing else | `disable-model-invocation: true`. 4.6 KB lookup. Maps toasts to Sonner, which pairs with `emil-design-eng`. ⛔ **MapLibre, Headless UI, Recharts and Tailwind are SETTLED. Do not use this skill to re-litigate a made choice** — new needs only. |

### ⭐ TWO HOUSE SKILLS, staged 2026-09-07, install them

Written by Cowork in `docs/skills-to-install/`, which is a delivery bay rather than a source, because Cowork can only write `docs/**` and this file. **Install both, `.agents/skills/<name>/SKILL.md` with a symlink at `.claude/skills/<name>`**, then say so and the staged copies are superseded.

| Skill | Load it when | Why it exists |
|---|---|---|
| **`verification-battery`** | any hand-back, any baseline, before claiming a suite is green or a utility emits or a scan is clean | The figure discipline. Both sides measured in one environment, every number with its command, a control behind every zero, per-file attribution for anything that moved, and the corpus rule that stops a lint figure being compared across a real repo and a worktree. Also how to characterise a flake rather than re-run it away. |
| **`merge-order-simulation`** | asked for a merge order, to re-derive one, or whether two branches collide | The safe-clone method, the overlap matrix with its positive control, running an alternative order to prove the adopted one optimal, reading the three index stages BEFORE describing a conflict, resolving by named ref never `--ours`, and the per-pull-request survival check. |

⛔ **Neither carries a declaration or a prohibition, and neither should ever be given one.** Those live in this file, which loads every session. A prohibition inside a skill fires only when the skill is invoked, and the four design skills above sat unread through a whole build. **A procedure can be looked up when needed. A prohibition has to already be present.**

### ⛔ REMOVED, with the reason each. Do not reinstall any of them.

- **`smooth-shadow-ring`** — ⛔ **INERT, measured.** Its own description scopes it to "a Tailwind project that
  has `shadow-plugin` installed" and **that plugin is absent** — not in `package.json`, not installed, and
  `tailwind.config.ts` loads only `@tailwindcss/forms` and `@tailwindcss/typography`. All four of its
  utilities emit NO RULE under an emit check with passing positive controls. So it read as enforced guidance
  while nothing applied it, **and it routes elevation through utilities that do not exist**, which conflicts
  directly with `elev-0..6`. Its reasoning is still sound advice; the repo just never implemented it.
- **`improve-animations`** — an audit-then-plan workflow. **Duplicated the house workflow**, which is the
  sequence file for position and the audit for hand-backs. Two workflow systems for one job means the staler
  one wins by being easier to leave alone.
- **`find-animation-opportunities`** — its purpose is proposing new motion work. **Removed on scope, not on
  taste.** Its own posture section preaches restraint and that was never the problem; a skill that generates
  unasked-for work is the wrong tool while the convention retrofit is being absorbed unbilled.
- **`animation-vocabulary`** — a reverse-lookup glossary. It **was** load-bearing once, its tabular-numbers
  definition ("fixed-width digits so numbers don't shift around as they change") is the test that widened the
  tabular-figures ruling, and it defined the number-ticker and text-morph effects that were then rejected.
  ⚠️ **That value is already extracted into the declared conventions**, so keeping it double-homes a
  definition, which is this project's number-one drift mode.

✅ **THE FOUR ARE DELETED FROM DISK as of 2026-09-02 12:51**, measured by Code and reported in
`docs/agent-mail/from-code/skills-prune.md`. Both skill paths are ignored via `.git/info/exclude`, `git
ls-files` over them returns zero with a positive control, so the deletion was local housekeeping and rides no
PR. `.agents/skills/` now lists exactly the four kept, and `.claude/skills/` exactly their four symlinks.
⚠️ **This file still cites the removed skills in six places below as the SOURCE of rulings** (hold-to-confirm,
the do-not-animate-read-data rule, the toast's percentage translate, swipe-to-dismiss, the accordion
exception). ⛔ **Those rulings STAND. The citations are provenance for decisions already recorded here and in
the wiki, and they now point at files that no longer exist.** Read them as "this is where the rule came from",
not as "go and open this". Nothing needs re-deriving.
⚠️ **One live dead pointer remains and it is CODE'S, not this file's.** `skills-lock.json` at the repo root,
ignored via `.git/info/exclude`, still carries lockfile entries for all three removed `.agents` skills with
`skillPath` values pointing at deleted directories. Whichever tool owns that lockfile should regenerate it, or
its three entries want removing. Routed to Code in `docs/agent-mail/from-cowork/skills-prune.md`.

⚠️ **A skill is advice, not authority.** Where a skill and a declared convention in this file disagree, **the
convention wins** — it was ruled against this codebase with measurements. Say which skill you consulted in the
hand-back, so a recommendation's provenance is checkable rather than assumed.


## Design system (reference)

The repo (`app/` + `theme/`) is the source of truth for how components look and behave (DL-13). The design-system layer is reference material, not a required build input — its files live under `docs/` and `design/templates/`, which are local-only and gitignored, so they may be absent on any given checkout. When they're present, consult them; when they're absent, build from the repo's existing components and the `theme/` tokens — do not block on them.

**Which one wins depends on whether the component already exists here (DL-17, 2026-07-28), and getting this backwards is the expensive mistake.** A template is the starting point for a component that does **not** exist in the repo yet. **Once a component exists in the repo, the repo is the port source, and you never port a template into a second screen when a shipped implementation exists.** The design system carries vendored sibling copies of components that have since shipped and evolved here — **PlantCard ×3, Sparkline ×3, SeverityBadge ×3, PlantMap ×3, AlertStripRow ×3** — so "consult the template" applied to one of those means copying a stale version over a newer one, silently, because both look plausible. The sync runs the other way at **area boundaries**: the repo publishes its evolved components into the design system, which then holds them as the new templates (A1's boundary sync is 7.1 / AB#745, task 899). For **Area 2 specifically**, net-new components are designed in code rather than in Design first (DL-15).

**How to actually reach the templates — do this, do not skip it.** `design/templates/` is gitignored and untracked, so "consult the DS if present" silently evaluates to "absent" whenever the check asks git rather than the filesystem. That has now caused two components to be built from scratch when a template existed (845's StatTile, 3.5's AlertStripRow). **The files ARE on disk**, **105** `.dc.html` files, counted by `find` at the source and through the worktree junctions on 2026-09-25 and again 2026-09-28. ⚠️ An earlier line here said 54 slug folders and 108 files, listed 2026-09-03. That figure is stale and the three-file gap is not investigated. `!994` untracked the path with `git rm --cached` and left the working copy in place, so nothing ever went anywhere.

⛔ **ROUTE REWRITTEN 2026-09-03. Read the DISK. Do not read the branch.** The instruction here used to be `git show chore/ds-templates-reference:design/templates/<slug>/<Name>.dc.html`. That branch is **merged into `dev` and frozen at `00b115e`, 2026-07-16**. It carries 106 files against 108 on disk, it has no `toast/` slug, and it has none of the four galleries couriered on 2026-09-03. A `git show` against it returns **July content and reports success**, which is a stale read that announces nothing.

```
:: cmd.exe — list every template
dir /s /b design\templates\*.dc.html

:: read one
type design\templates\<slug>\<Name>.dc.html
```

⛔ **Do not check out `chore/ds-templates-reference`.** Its 106 files are tracked there, so checking it out overwrites the on-disk copies with the July versions silently, with no diff and no warning. Everything placed on disk since 2026-07-16 is lost that way. Treat the branch as history only.

`docs/AREA-BUILD-GUIDE.md` maps components to their template paths and carries the current on-disk inventory including the four slugs couriered 2026-09-03; check it first. If no template exists, say so in the hand-back — "no DS template" is a finding worth recording, and it is different from "I did not look".

Reference material (local-only, may be absent):

- `docs/AREA-BUILD-GUIDE.md` — the index: the color system, the per-Area region→component map, and the behavioral contracts (§7: status normalization, the donut filter, anomaly derived + hidden at zero, the do-not-port bugs — preserve these in component work).
- `design/templates/<slug>/<Name>.dc.html` — per-component reference. Its inline styles carry example values and its embedded `class Component` carries interaction logic.

Always authoritative (tracked):

- `theme/` — the token source (TypeScript, **not** CSS). `theme/status.ts` holds the status hexes and `theme/colors.ts` the `hue-sky` brand ramp; `tailwind.config.ts` spreads them into the `status-*` / `hue-sky-*` utilities, and `app/utils/status.ts` (`statusToHex`) reads them for raw-hex consumers like Recharts. There is **no** `:root` / `tokens.css` layer in this repo.

Spacing (hard rule since AB#882, 2026-08-05): `theme/spacing.ts` holds **one convention** — every key is a Tailwind scale step whose value is the key × 4px. It is currently `{15, 29, 68}` and every key is live.

- **A literal pixel value does not get a theme entry.** Use an arbitrary value: `w-[526px]`, not `w-526`. A key whose name is its own value is not a token (DL-28).
- There was a third, now-dead convention where key `N.1` meant N pixels. It is gone. Do not reintroduce it, and do not copy a class like `pb-50.1` or `size-4.5` out of existing code: 44 such classes were removed because they emitted no CSS at all, and one propagated into new code this week by exactly that route.
- **`app/utils/spacingScale.test.ts` fails the suite** on any spacing class whose key the resolved scale lacks, naming the class and its file and line. Its prefix list is a closed allow-list, so it misses rather than false-alarms.
- `tailwind.config.ts` spreads `spacing` only. Do **not** re-add `height`, `width` or `padding` entries; stock Tailwind derives all three from `spacing`, and the duplicates were removed as proven no-ops.
- Test files are excluded from the Tailwind content glob. Leave that exclusion in place: without it, test fixtures emit real CSS into the production stylesheet.

### ⛔ THE INTERACTION CONTRACT is declared. Read it before ANY component work.

Canonical at `C:\cowork\dashboard-requirements\memory\topics\design-system.md`, section **"THE INTERACTION CONTRACT"**. Declared 2026-09-01. It was **extracted from `PreviewCard/index.tsx` and `AlertsList.tsx`**, which between them already carry the whole thing, so it describes something shipped rather than something invented. Timing and easing come from this repo's own `.claude/skills/emil-design-eng`.

**SIX states on every `<button>` and `<Link>`:** rest · hover · focus-visible · press · **pending** · disabled.

- **`pending` is BUSY, not unavailable**, and it is the one place the brand blue belongs on a control that cannot be clicked, because the action is live and in flight. 28 files do form submit and none declares this today.
- ⛔ **`disabled` must NEVER take the brand blue.** Sky is this system's affordance colour, so a blue disabled control reads as available. Disabled is `ink-400` on `ink-50` with `cursor-not-allowed`, and it reads as absent.
- ⛔ **The `not-allowed` cursor stays. A branded custom cursor was rejected** — it is a learned convention, and `cursor: url()` overrides a user's enlarged or high-contrast OS pointer. Do not re-propose it.

**Six cross-cutting rules, all already in the shipped pair:** the `[@media(hover:hover) and (pointer:fine)]` guard (⛔ CORRECTED 2026-09-30, measured on the emit. `tailwind.config.ts` sets `future.hoverOnlyWhenSupported`, so a plain `hover:` is ALREADY guarded by that media query. The arbitrary prefix sorts AFTER `active:` in the output, so on a control carrying both it overrides the press and hides it. **Use plain `hover:` on new work.** Existing arbitrary guards are left alone unless something already touches them. Measured by Code on the plan for A1 7.11 AB#1046, `from-code/1046.md` 2026-09-30 23:24, section 7 item 10.) · a paired `group-focus-within` for EVERY hover · `focus-visible:outline outline-2 outline-offset-1 outline-hue-sky-500` · `active:scale-[0.97]` ⛔ **CORRECTED 2026-09-17. This previously read `active:scale-97`, which emits NO RULE in this Tailwind config.** A contract that names a class the build does not have is a defect in the contract. The repo's real idiom is the bracketed form on controls and one-step-darker on rows · `motion-reduce:active:scale-100`, cancelling a movement with the same variant that set it ⛔ **CORRECTED 2026-09-23. This previously read `motion-reduce:transform-none`, which loses to `active:scale-[0.97]` on specificity and cancels nothing, so the press still scaled under reduced motion.** Do not "simplify" it back · timing scoped to the properties that change.

**Six prohibitions.** ⛔ Never `focus:outline-none` without a replacement in the same rule. ✅ **One explicit exception, measured 2026-09-01 on `0decd5d`: Headless UI panels.** Of 47 occurrences, 24 are paired and 23 are bare, but 16 of those 23 sit on `<MenuItems>` (10), `<ListboxOptions>`/`<ComboboxOptions>` (4) and `<Dialog>` (2), where the panel takes programmatic focus and the library documents this pattern. **Those 16 are correct. Do not "fix" them.** The genuine defect is **7 focusable controls** (`<button>`, `<Button>`, `<ComboboxButton>`). ⚠️ An earlier version of this line said the commonest focus utility here removes the indicator; **that overstated it and is retracted.** ⛔ No layout-shifting hover, no `font-bold`, no padding or size change. ⛔ No raw hex or legacy gray in a NEW interaction state. ⛔ Never `transition: all`. ⛔ Never enter from `scale(0)`, start at `scale(0.95)`. ⛔ Never animate a keyboard-initiated action.

**Never `ease-in`.** Enter and exit take `cubic-bezier(0.23, 1, 0.32, 1)`, on-screen movement takes `cubic-bezier(0.77, 0, 0.175, 1)`, a hover or colour change takes plain `ease`. Under 300ms for any UI animation, exit faster than enter.

**Composite surfaces (cards, cells, rows, pins) have six hover SEMANTICS** — lift, tint, reveal, link, tilt, inert — and those are separate from the control states above. A control's hover is one state in the machine; it is never one of the six. Values in the wiki section.

✅ **`tint` is buildable today. Measured 2026-09-01:** `theme/status.ts` on `0decd5d` carries the full four-tier set (20 keys) and every `bg-status-*-soft` utility **emits**, emit-checked with a negative control. ⚠️ **The 2026-07-28 finding that told you to avoid status tokens entirely because the soft tier did not compile is SUPERSEDED. Do not re-add that instruction.** ⛔ `lift` is NOT buildable yet, since it is `elev-2` to `elev-4` and those tokens do not exist (see the shadow section below).

⚠️ **The focus ring is a MIGRATION, not the incumbent.** Blue edges on elevated surfaces measured 2026-09-01: `ring-blue-500` 14, `border-hue-sky-800` 13, `outline-hue-sky-500` 9, `ring-indigo-500` 8, `border-hue-sky-500` 7, `ring-indigo-600` 5, `border-blue-300` 5, plus eleven more. **`blue-*` and `indigo-*` are stock Tailwind and are not in this project's ramp at all.** So the contract's `outline-hue-sky-500` is a minority today. **Bind new work to it, and do not mass-convert existing blues without a work item that says so.**

⛔ **Two standing rulings that constrain new work.** The chart legend cluster (eleven files, real controls with an inline `background:none; border:none; padding:0` reset and no interaction states at all) **is covered by the contract, not exempt.** And the 61 legacy-gray hover declarations in GridGuardian, Settings and Configuration are **FROZEN** — bind new work only, and **do not tidy a handful piecemeal** and leave an area half converted.

The contract ships as **documented classes for now**, not a shared helper. A helper is one more shared file while nine branches are open; it gets extracted at the boundary sync.

✅ **`!1037` / `AB#953` MERGED 2026-09-21**, so the patterns below are on `dev`. The 2026-09-17 banner that sent readers to `feature/953-interim-control` is spent. The rulings themselves stand.

⚠️ **TWO CONSEQUENCES OF THAT, both built in `AB#953` / `!1037` on 2026-09-07 and on `dev` since 2026-09-21, so read them before you copy either pattern.**

**A new button takes the SECONDARY until the elevation tokens land.** Control's Save is the shipped secondary, the grey outline with the blue hover tint that Edit Plant wears at `PlantHome/index.tsx:105`, **not** the DS write strip's solid Confirm. The primary's hover is a one-step elevation lift, `elev-1` to `elev-2`, and those tokens live on the unmerged `feature/745-elevation-scale` branch and not on `dev`. ⛔ **Do not improvise a primary hover to get a solid button.** ✅ **Rider recorded on `AB#745` / 7.1: once its tokens land, Control's Save takes the primary.**

**An inline info tooltip is now duplicated, and the second copy is deliberate but temporary.** `Control/InfoHint.tsx` is built on `StatusDonut`'s inline tooltip markup and classes, **copied rather than imported**, hover gated with a 100ms open delay and paired with `focus-within`. Same reason as the contract above, a shared helper is one more shared file while the queue is unflushed. ⛔ **So there are two homes for this pattern as of 2026-09-07. Do not add a third.** It is a named candidate for extraction at the boundary sync, along with the contract's classes.

### ⛔ BUTTON APPEARANCE is declared. Five variants, and the DS default is one of them corrected.

Canonical at `C:\cowork\dashboard-requirements\memory\topics\design-system.md`, section **"BUTTONS, the appearance layer"**. Declared 2026-09-01. **Appearance only** — every button BEHAVIOUR is the interaction contract above, and this does not restate it.

**Five variants.** `primary` solid fill with a white label · `secondary` grey outline at rest, blue on hover · `tertiary` bare label, no border · `icon-only` square, at any of those three levels · `destructive` on the fault ramp, outline by default.

⛔ **CORRECTED 2026-09-01. An earlier version of this line said destructive is "never solid, because this app has no confirm-dialog pattern yet." That reason was WRONG.** A confirmation pattern IS declared in the house skills — it just is not a dialog. `animation-vocabulary` names **"Hold to confirm — a progress effect that fills up while the user holds a button"**, and `find-animation-opportunities` names the seam plus the implementation: **`clip-path: inset(0 100% 0 0)` overlay, 2s linear on press, 200ms ease-out snap-back on release** (asymmetric timing — slow where the user decides, fast where the system responds). ✅ **So: outline destructive needs no confirmation, and a SOLID destructive is permitted ONLY with hold-to-confirm.** Outline stays the default because it is cheaper and most destructive actions here are reversible.

⛔ **ONE primary per screen region**, where region means a card, a panel, a modal footer or a page header. Two solid buttons side by side means neither is the primary.

⛔ **The primary is white on `hue-sky-800`, NOT the DS template's `hue-sky-500`.** White on 500 measures about **3.0:1** and fails AA; `hue-sky-800` measures **7.76:1** against white and contrast is symmetric, so the corrected fill passes with room. This uses an existing ramp step, so it needs no new token. **Do not "restore" the template's 500 fill** if you find it in a template or an older component.

✅ **The secondary already exists and shipped in `!1026`** as Edit Plant, reseated to a rest-grey outline when the solid primary turned out to fail. Grey border, `ink-700` label, hover tints to `hue-sky-50` with the label at `hue-sky-800`. **Reuse it rather than deriving a second outline button.**

⚠️ **`ink-600` is the floor for a tertiary's label** (4.94:1 on white; `ink-500` fails at 3.19:1). A tertiary that needs to be quieter than `ink-600` should not be a button.

⚠️ **Icon-only buttons REQUIRE an accessible name**, and the icon census applies: glyphs in this set variously carry hardcoded fills before the props spread, or no `viewBox`, so never assume one recolours or scales.

✅ **THE PRIMARY DOES NOT DARKEN ON HOVER. Ruled by Keith 2026-09-01.** The fill stays `hue-sky-800` in every state; hover is a **one-step elevation lift** (`elev-1` → `elev-2`) plus the contract's `active:scale-[0.97]` for press (bracketed, corrected 2026-09-23). Why: measured 2026-09-01, the `hue-sky` ramp is 50, 100, 300, 500, 600, 800, 900 — **no 200, no 400, no 700, nothing between 800 and 900** — and `#03587F` → `#1F4173` is a **1.31:1** step across a hue shift, so there is no in-ramp darken to make. ⛔ **Hovering to 900, and adding a `hue-sky-700` step, were both considered and REJECTED. Do not re-propose either.** ⚠️ The lift needs `elev-1`/`elev-2`, which ship with task 899, so until then **use the secondary for a new button rather than improvising a primary hover.**

### ⛔ BUTTON SIZES ARE ALREADY DECLARED IN THE DS. Adopt, never invent.

⛔ **READ THE RIGHT FILE.** There are three `Button` files under `design/templates/`. The real one is **`design/templates/form-controls/Button.dc.html`**, with **`form-controls/ButtonGallery.dc.html`** beside it. `domain-control-readout/Button.dc.html` is a domain readout's local button and reporting from it is how this got measured wrong once already. **Before reading "the X template", file-search X and say how many exist.**

| Size | Type | Padding | Radius | Gap | Computed height |
|---|---|---|---|---|---|
| `sm` | 13.5px | `7px 13px` | **8px** | 6px | ~31px |
| `md` (default) | 14px | `9px 16px` | **9px** | 7px | ~35px |
| `lg` | 15px | `11px 20px` | **10px** | 8px | ~41px |

All three: `font-weight:600`, `line-height:1.1`, `letter-spacing:.005em`, `box-sizing:border-box` with a 1px border. Heights are derived, not declared.

⛔ **RADIUS SCALES WITH SIZE, 8 / 9 / 10. An earlier line here said "radius is settled at 9px" — that was WRONG and is retracted.** 9px is `md` only.

⚠️ **The prop enum declares five sizes (`xs` `sm` `md` `lg` `xl`); the gallery defines three.** `xs` and `xl` have **no visual definition anywhere. Do not guess values for them** — report and stop.

⚠️ **AB#950's buttons are `md` drifting, not a fourth size.** `h-9` `px-3` `text-[13px]` `rounded-[9px]` against `md`'s ~35px / 16px / 14px. Reconcile toward `md` when something touches it; do not treat it as a compact size.

**The DS also declares a `hierarchy` enum, and it does NOT match our variant names.** `primary | secondary | tertiary | outline | ghost | link`, plus a `destructive` boolean and a `loading` boolean. ⛔ **Name collision that matters: the DS `secondary` is a SOLID GREY FILL (`#F1F4F6`, label `#46505A`). Our secondary is the grey OUTLINE button, which maps to the DS's `outline` hierarchy** (white fill, 1px `#CFE8F6`, label `#1F4173`). `tertiary` renders as `secondary` and `link` renders as `ghost`, so six names are four treatments. ✅ **The DS `loading` state IS our `pending`** — a 14px spinner with `border-top-color:transparent`, the fill kept, `cursor:default`. It was in the DS all along and simply never built. ⛔ **The DS `disabled` is `opacity:.5` on the blue fill; that is a half-opacity blue and our own rule forbids blue on disabled. Do NOT adopt it** — disabled is `ink-400` on `ink-50`.

⚠️ **`#CFE8F6` (the DS outline border) has no token** — it sits between `hue-sky-100` and `hue-sky-300`. It is also **exactly the hardcoded `border-[#CFE8F6]` on FleetMap's Search-This-Area pill**, so that hex is a faithful port of the DS outline button, not a stray. Leave it; do not "fix" it to a nearby token.

⚠️ **There is NO close-button and NO icon-only template in the DS** (searched 2026-09-01, zero matches). Those two are ours.

### ⛔ SHAPE IS A DECLARED CHANNEL, and radius is not a free choice. Ruled by Keith 2026-09-01.

Measured across all 909 `border-radius` declarations in `design/templates/`. **The DS has four radius bands and they split by ROLE.** A component takes the band its role puts it in.

| Band | Value | Role |
|---|---|---|
| Fully round | `999px` / `50%` | a LABEL, STATE, TOGGLE or identity — never a command. chips, tags, severity badges, status dots, switches, avatars, chip-scale selection tokens |
| Soft rectangle | 6–10px | a COMMAND or INPUT. **buttons (8/9/10 by size)**, inputs, selects, pagination, segmented controls, dropdown triggers, popover inner surfaces |
| Container | 12–14px | a SURFACE that holds things. cards, panels, popovers, modals |
| Micro mark | 4px | a MARK, not a component. swatches, progress caps, legend keys |

⛔ **A pill button is PROHIBITED, and so is a square one.** Not one button-scale control in the DS is a pill, and 0px appears nowhere at all. Reasons, so this is not reopened as taste: chips and tags already own fully-round (a pill button and a filter chip would be the same shape, collapsing the command-vs-label signal); a ~17px pill inside a 12px card is a child rounder than its parent; and 8px on a 31px control is already a quarter of its height, so the round-leaning brief is met.

⛔ **"Solar panels are square so controls should be square" is REJECTED.** Panels belong to the DATA layer, which is already rectangular — equipment cells, tables, the map, the panel and inverter glyphs. **Do not re-raise this as a skeuomorphic argument.**

### ⛔ BUTTON ELEVATION FOLLOWS SURFACE, NOT IMPORTANCE. Ruled by Keith 2026-09-01.

⚠️ **This narrows `elev-1`.** It was "resting controls, buttons, inputs, small affordances" — one step for every control. **A control with no fill has nothing to raise, so it cannot cast a shadow regardless of its importance.** Importance is carried by fill and weight; height is carried by whether a surface exists.

| Variant | Elevation |
|---|---|
| `primary` (solid fill) | `elev-1` rest → `elev-2` hover |
| `secondary` (our outline) | **`elev-0` always** — the border does the edge work |
| `tertiary` / `ghost` | **`elev-0` always** — no surface to lift |
| `destructive` (outline) | **`elev-0` always** |
| `icon-only` | the elevation of whichever level it wears |
| **`disabled`, every variant** | **`elev-0`** — not raised; it reads as ABSENT |
| **`pending`, every variant** | keeps its REST elevation, **never lifts** — busy, not inviting |

⛔ **The outline rule prevents a named anti-pattern**, not a style preference: a border plus a shadow on one elevated edge is the double-edge artifact. **An outline button at `elev-1` rebuilds it.**

⛔ **A graded-by-importance scale (primary `elev-2`, secondary `elev-1`, tertiary `elev-0`) was considered and REJECTED**: `elev-2` is the resting-CARD step, so a primary resting there would cast the same shadow as the card containing it.

⚠️ **The rule that resolves absolute tokens against relative language: a control never RESTS at or above its container's step, and a hover may reach that step but never pass it.** A primary at `elev-1` inside an `elev-2` card is correct; its hover to `elev-2` is the ceiling. If a surface needs more lift than that, **the container moves, not the button.**

### ⛔ ALIGNMENT AND SPACING. Ruled by Keith 2026-09-01. Canonical in the wiki, same section name.

⚠️ **The agent skills live in `.agents/skills/`.** `.claude/skills/` holds symlinks to them, four and four, nothing else. ⛔ **CORRECTED 2026-09-02, the earlier text here said `smooth-shadow-ring` existed only in `.claude/skills/`. It was deleted that day and now exists nowhere**, see the AGENT SKILLS section above for why. Cite `.agents/skills/`.

⛔⛔ **There is no spacing system today, in either the DS or the app. Measured 2026-09-01.** The DS is a smooth ramp of 25 distinct gap values (5–12px carries 472 of 629), not a scale. The app is worse: **44 distinct spacing values, 22 of them off the 4px grid** (four sub-pixel: 2.5, 3.5, 4.5), **140 arbitrary spacing uses across 49 distinct values**, and ⛔ **472 of 855 flex/grid containers (55.2%) declare NO gap and no space utility at all.**

✅ **1. USE TAILWIND'S STOCK SPACING SCALE. Mint NO new spacing tokens.** The DS's on-grid values (6, 8, 10, 12, 14, 16) already cover 360 of 629 declarations and are all existing utilities; the off-grid ones (7, 9, 5, 11, 18, 22, 13) cover 232 and **every one is within 1–2px of an existing step. Round them.** ⚠️ A 1px gap difference is not perceptible — that argument applies to a *radius* on a small pill, not to a gap. ⛔ **Do NOT add keys to `theme/spacing.ts`.** Its three existing keys (`15: 60px`, `29: 116px`, `68: 272px`) are Figma leftovers and can go when 899 touches the file. ✅ **Radius is the exception and DOES need tokens** (9px is absent from Tailwind's scale) — those go in `theme/borderRadius.ts`.

✅ **2. NEW TOKENS IN `rem`. Stop minting px arbitrary values. No migration, no sweep.** Existing px arbitraries are replaced only when something already touches them. Measured: **528 px arbitraries against 17 rem**, and **122 are TYPE** (`text-`/`leading-`/`tracking-`). ✅ No explicit root `font-size` exists, so user text scaling works — which makes those 122 **the live accessibility defect; they will not scale.** Source: `apple-design` §15.

⛔ **A BUG, not a convention.** `app/components/Button/index.tsx` hard-codes **`min-w-[128px]` on five variants around a text label** — the label overflows at increased text size. 202 px-locked dimensions hold text in total.

✅ **3. TABULAR FIGURES ARE REQUIRED wherever digits CHANGE IN PLACE or SIT IN A COLUMN.** Measured: `tabular-nums` appears 27× in `app/**` and **zero times in every table** (`ComplexTable`, `PlantsList`, `EventsTable`, `DeviceInventoryList`, `UtilityTable`). All 27 sit on cards, badges, donuts and alert rows. ⛔ `ComplexTable` renders **eight numeric columns** from `PlantsList` with proportional digits. The house test is whether digits change, not whether they're in a column (`animation-vocabulary`: "Essential for tickers, timers, and counters") — and this app's card figures are websocket-fed, so they change in place. ⚠️ **Whether the self-hosted Space Grotesk subset ships `tnum` is UNVERIFIED** — if it does not, all 27 are already inert. Do not build on it until confirmed.

⛔ **This does NOT license animating a figure.** `find-animation-opportunities` §4: **"Data the user is trying to read or act on should not move for style."** So a **number ticker** or **text morph** on a live value is REJECTED even though the glossary names both.

✅ **ONE RULED EXCEPTION, the digit morph on the Overview power flow card (`AB#944`), Keith 2026-09-24.** `PowerFlowHero`'s changing values (strip values, picture labels, energy totals, device list readings) morph through `powerFlow/MorphValue.tsx`. Keith was offered the rule's cross-fade and chose the morph. **The mitigations are part of the exception.** Only the digits that changed move, 0.45em of travel with a 2px blur over 200ms on the strong ease-out, rising for an increase and falling for a decrease, 30ms stagger per changed digit, capped at 90ms so a whole figure settles by about 290ms. Tabular figures throughout. Reduced motion becomes a 200ms cross-fade with no stagger. Screen readers hear the whole value once. CSS keyframes only, no animation package. ✅ **Ruled by Keith 2026-09-24 after the motion review.** The digits line up on the decimal point, so the point never moves when the number of decimals changes, and the shared number formatter is not touched. A value's first real reading, including one replacing a `--`, appears without animating, so only a later change morphs. ⛔ **It is the approved pattern for a value that changes while the user watches, and nothing else.** Another live value adopts it only under a work item that names it, reuses `MorphValue` rather than a second implementation, and carries every mitigation. A value that only changes on load never morphs. Canonical in the wiki's `design-system.md` under tabular figures.

✅ **4. NUMERIC COLUMNS RIGHT-ALIGN. Text columns left-align. Headers match their column.** ⛔ A defect fix, not a preference: all three tables left-align numeric columns today, and `text-right` appears **4 times in the whole app with not one on numeric content**.

✅ **5. A SHARED VALUE EDGE NEEDS A GRID.** ⛔ `justify-between` (160 uses vs `grid-cols-2` at 26) pushes each value to **its own container's** edge, so values align only when containers are identical widths — in `PlantHeader/CapacityFacts.tsx:78,104` and `PlantPhotosCard.tsx:12` they are not, and **the ragged edge is structural, not a missing class.** Label/value pairs that must align across rows use a two-column grid; `justify-between` is for a standalone row only.

✅ **6. `items-center` on every icon-plus-label flex row.** 44 of 115 (38%) lack it, which reads as a wobble down a list.

### ⛔ ICONS COME FROM THE DECLARED DS ICON LIBRARY. Standing rule, Keith 2026-08-31.

Keith, in substance, *all I want is that we are using the icons we have on our declared icon library from the DS. If the icon library from the DS does not have expand, then add it in.*

**A repo icon with no declared DS source is design debt.** The fix is to add the glyph to the library, not to leave the repo as the only place it exists. So when a glyph you need does not exist, **build it in the repo's own idiom AND say plainly that it is a DS queue item**, naming the glyph. ⛔ **Neither agent edits `ds-bundle/` and neither adds to the DS.** Only Keith can, in his Claude Design project, so the deliverable from your side is the named queue item.

**Live instances.** `icons/Expand.tsx` (4.1 / `AB#945`) was built in the mono LineChart idiom because the repo set had no expand glyph, and whether the DS library carries one is still open. **And two mode glyphs shipped local to `app/containers/Plant/PlantHome/Control/` in `AB#953` / `!1037`**, because `Shield` in the shared set has a hardcoded fill and a 43 by 49 viewBox and no plug glyph exists at all. **Then `Humidity` and `WindSpeed`** (`AB#1028`, the weather card), since neither exists in the shared set and the DS weather template carries no SVG. **And a chevron right** (`AB#944`, the power flow device list), where the rows use Heroicons' outline chevron right, the glyph the Events rows use, because the DS library declares none. ⚠️ **Those six, plus a `Shield` that cannot recolour, were the DS icon queue at seven on 2026-09-24.** ⛔ CORRECTED 2026-09-30, that count is stale. The wiki carries eleven, `!1052` added six more, and A1 7.11 adds Sign Out (the library has no sign out glyph). Read the current queue in the wiki's design-system page, never this sentence. Do not add one silently. ⛔ **Also corrected, the chevron right.** The library DOES declare one, `IconLinearIdArrowRightSLine` in `design/templates/icon-set/IconGallery.dc.html`, and three templates draw a chevron right. So "the DS library declares none" above is wrong, and the `AB#944` rows' Heroicons chevron is a mismatch to the library, not a gap in it. Measured by Code on the plan for A1 7.11 AB#1046, `from-code/1046.md` 2026-09-30 23:24, section 7 item 10.

⛔ **NEVER animate spacing.** No animated `gap`, `padding` or `margin`, and no reflow on hover. `emil-design-eng` Performance Rules: only `transform` and `opacity` skip layout and paint. ✅ **One exception: a height animation is permitted for a ONE-SHOT layout reveal** a person or condition triggers (a banner, an accordion — `animation-vocabulary` calls it *Accordion / Collapse*), **never for anything continuous, gesture-driven, or repeated across a list.**

⚠️ **ONE RULED EXCEPTION EXISTS AND IT IS BUILT BUT NOT MERGED. Do not read it as a defect, and do not extend it.** ⛔ **It lived on `feature/953-interim-control` and was NOT on `dev`, measured 2026-09-17.** ✅ UPDATED 2026-09-30, it is on `dev` now. `AB#953` is Done and `ModeOptionRow.tsx` is on `dev`, per Measured by Code on the plan for A1 7.11 AB#1046, `from-code/1046.md` 2026-09-30 23:24, section 7 item 10. The exception still stands, and still is not to be extended. See the banner above. Keith ruled it on 2026-09-06 after comparing both options in the browser. The Control tab's work mode dropdown (`app/containers/Plant/PlantHome/Control/ModeOptionRow.tsx`, `AB#953`, PR `!1037`) **grows the highlighted row** to reveal its description and Watch link, `grid-template-rows` 0fr to 1fr with an opacity fade, 150ms on the strong ease-out, `overflow-hidden` inside. That breaks three rules at once, no layout-shifting hover, the one-shot-only height rule above, and `review-animations` standard seven. **The mitigations Keith scoped are part of the exception, so a second site would have to carry them too:** the panel is portalled into the foreground so the page beneath never reflows, nothing dims or blurs, keyboard-driven highlight moves swap with no animation (`group-focus-visible/panel:transition-none`), and reduced motion is instant with colour kept.

⛔ **Scoped to that one popover. It is NOT a precedent.** A growing row anywhere else needs its own ruling, and the compliant alternative offered at the time was a two-pane crossfade. Canonical in the wiki's `design-system.md` under interaction rule 2.

### ⛔ GRIDS AND RESPONSIVENESS. Ruled by Keith 2026-09-01. Canonical in the wiki, same section name.

⛔⛔ **A SHIPPED DEFECT, MEASURED 2026-09-01, KEITH TO FILE. THERE IS NO NAVIGATION BELOW 1024px.** The rail is `hidden lg:fixed lg:flex` (`Sidebar.tsx:74`); the mobile drawer at `Layout/index.tsx:23` **can never open** because `setSidebarOpen(true)` is never called anywhere in `app/**`; and its panel holds only the close button because `{/* <HamburgerMenu/> */}` is commented out at `:64` with its import at `:6`. `HamburgerMenu.tsx` exists (79 lines) and is never rendered. ⛔ CORRECTED 2026-09-30, it is not "imported nowhere". It is re-exported through `app/containers/index.ts` and rendered by nothing. Measured by Code on the plan for A1 7.11 AB#1046, `from-code/1046.md` 2026-09-30 23:24, section 7 item 10. **Do not "fix" this incidentally inside another PBI — it is a filed defect, not a convention gap.**

✅ **Breakpoints: Tailwind's stock five, no `screens` override.** `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536. Declared meaning:

| | Meaning | Content grid | Card band |
|---|---|---|---|
| `base` <640 | phone. Nav is a drawer | 4 col | 1-up |
| `sm` 640 | large phone | 4 col | 1-up |
| `md` 768 | tablet portrait. Nav collapsed | 8 col | 2-up |
| `lg` 1024 | **rail appears at its full 272px width** (⛔ CORRECTED 2026-09-30. This row read "rail appears, ICON-ONLY". A1 7.11 AB#1046 criterion 1 rules one width and no icon-only state, and the code has never had one. Do not build an icon-only rail from this table.) | 8 col | 2-up |
| `xl` 1280 | laptop. Rail at full 272px, the same as at `lg` | 12 col | 3-up |
| `2xl` 1536 | desktop | 12 col | 4-up |

✅ **Shell inset: 24px at `lg`+, 16px at `md`, 12px at `base`/`sm`.** ⛔ **Supersedes the `px-2` (8px) at `Layout/index.tsx:73`**, which is currently unconditional. This closes the AB#875 8px question.

⛔⛔ **THE TWO-MECHANISM RULE. MEDIA queries drive the SHELL ONLY** (nav collapse, page margins, page-level column count, route layout). **CONTAINER queries drive COMPONENTS ONLY** (card density, internal layout). ⚠️ **Measured: 160 of 252 responsive-prefix occurrences (63%) are on components and are therefore violations** — heaviest in `BatchTimeSelectionModal` (25), `AppointmentDetailModal` (17), `BatchCommandsModal` (13), `CreatePlant` (12), plus `sm:` padding inside `Input`, `StatBox` and five `Add*Modal` files. **Bind new work correctly; convert existing only under a work item that says so.**

✅ **ONE RULED EXCEPTION, the power flow card's strip and picture (`AB#944`), Keith 2026-09-24.** They read their OWN measured width in script rather than a container query, because the strip's balanced column count (six cards go 6, 3 and 3, or 2 by 3, never one alone) and the picture's zoom below 440px are arithmetic a container query cannot express. **It is still the component responding to its container, never the viewport.** From `a563da7`, at 2xl only, it also reads its own measured HEIGHT, so the card ends level with the Inverter Status and Generation Purpose stack beside it. The breakpoint stays in the page grid, which sets `--power-flow-fit` on the card's cell, and the card only ever measures its own box. A 15rem floor sits on the picture region inside the card, never on the card, so a short stack cannot shrink the picture to nothing (Keith, 2026-09-24). The card's energy totals use container queries. ⛔ **Scoped to that card, not a precedent.** Anything else that can be written as a container query is written as one.

✅ **CONTENT PRIORITY LADDER. Every multi-field surface declares ONE field priority order, once; each breakpoint takes the top N.** Dropping is deterministic, not per-surface judgement. ⛔ **Nothing is silently dropped** — a field removed at a breakpoint stays reachable (row expand, detail view, or an explicitly scrollable variant). ⛔⛔ **A STATUS, FAULT, ALERT or SEVERITY FIELD IS PRIORITY 1 AND NEVER DROPS AT ANY BREAKPOINT.** Correctness rule, same class as "a toast is never the only carrier". If the layout cannot hold the fault indicator, **the layout changes, not the indicator.**

⛔ **NO PX-LOCKED FIRST COLUMN below `lg`.** Measured: **38 of 42 arbitrary grid templates lock their first column** — `grid-cols-[300px_1fr]`×22, `grid-cols-[180px_1fr]`×16. **At a 320px viewport a 300px first column leaves 20px for everything else.** Use a fraction or `minmax()`. **This is the highest-leverage change for narrow viewports.**

⛔ **AN ACTIONS COLUMN IS PINNED IN EVERY TABLE** (`sticky right-0`). Measured: `ComplexTable` does it (`:405` header, `:450` cell) and is **the only one of six tables that does.**

⛔ **FOUR `min-w-[1092px]` sites force PAGE-LEVEL horizontal scroll at 1280 today, corrected 2026-09-09. The fifth was `PlantEvents/EventsTable.tsx` and `AB#949` removed it. ⛔ Do not re-add the events entry to this list. The remaining four are `GridGuardian.remote-update`, `GridGuardian.Set-Record`, `GridGuardian.update-record` and `Notifications`**, because none sits inside an `overflow-x` container and nothing masks overflow at the document level: `GridGuardian.remote-update/route.tsx:10`, `GridGuardian.Set-Record/route.tsx:10`, `GridGuardian.update-record/route.tsx:10`, `Notifications/route.tsx:10`. **1092 + the 272px rail = ~1364px of viewport needed.** A laptop problem, not a phone problem.

⚠️ **`flex-wrap` pseudo-grids number 49 across 32 files — more than the 45 fixed `grid-cols`.** The commonest multi-item layout in the app has no column count at all. ⚠️ **Nothing anywhere reaches 12 columns; the widest declared is `grid-cols-7`.**

✅ **The viewport floor is correct and needs no change.** `root.tsx:183` ships `<meta name="viewport" content="width=device-width, initial-scale=1" />` with no `maximum-scale` and no `user-scalable=no`, so pinch-zoom is not locked. No `min-width` on `html`/`body`. No document-level `overflow-x: hidden`.

⛔⛔ **DO NOT DELETE `68` FROM `theme/spacing.ts`. `68: "272px"` IS THE NAV RAIL WIDTH** — `lg:w-68` at `Sidebar.tsx:74` and `lg:pl-68` at `Layout/index.tsx:71`. An earlier version of the spacing note called all three keys removable Figma leftovers; **that was wrong and deleting this one breaks the sidebar and the shell offset together.** `15: 60px` and `29: 116px` are unverified — **check the call sites before removing anything.**

### ⛔ THE CARD SYSTEM: two axes. Ruled by Keith 2026-09-01. Canonical in the wiki, section "THE CARD SYSTEM".

⚠️ **Measured 2026-09-01: the DS declares almost NO `min-height` anywhere** (about twelve hits across 100 templates, all on chart shells, spinners and page shells, **none on a card**). Card height is entirely content-driven today, which is why cards read as inconsistent.

⛔ **Size does NOT come from importance. It comes from the slot.** Do not collapse these two axes.

**AXIS 1 — DENSITY, chosen by the card's RENDERED WIDTH.** Governs padding, title size, radius, and nothing else.

| Density | Padding (h × v) | Title | Radius |
|---|---|---|---|
| `compact` — band cards, 3-up/4-up grids, sidebars | 12 × 12 | 13px | 10px |
| `standard` — the workhorse, 2-up grids, most of Area 2 | 18 × 16 | 15px | 12px |
| `feature` — a screen's primary surface, full/near-full width | 18 × 20 | 18px | 14px |
| `inset tile` — a card INSIDE a card | 14 × 12 | none (eyebrow only) | 10px, **flat** |

**AXIS 2 — PROMINENCE, chosen by hierarchy.** Governs content and treatment, **never geometry**: whether there is a title at all, whether the figure takes the display face and large step, which elevation it rests at, whether it carries metadata/action/footer.

⛔ **`compact` does NOT mean less important.** An Area 1 primary band card is **high prominence, compact density** — that combination is the point of the split. Padding-to-width RATIO is what reads as tight or bloated: 18px in a 240px card is cramped, 12px in a 900px card looks unfinished.

⛔ **NO `min-height` on any card, at any density.** A floor reserves space content does not fill, which is the "too empty" failure. Height falls out of consistent anatomy. ✅ **Equal heights in a row are a GRID STRETCH on the row (`items-stretch`), never a height on the card.** ✅ **One exception, ruled 2026-09-23.** An empty-state placeholder inside a card may declare the height of the populated element it replaces, and exactly that height, so the card reads the same with and without data. It is not a card floor and does not license one. The irradiance empty state on the plant weather card is the standing instance.

**Cards are DYNAMIC by default. Density steps down as the card narrows.**

⛔ **Use CONTAINER queries, NOT media queries.** The same card appears in a 4-up band and a 2-up layout **at the same viewport width**; a media query cannot tell them apart and would give both the same density. That is the bug this rule prevents. ✅ **Measured: `tailwindcss` is 3.4.3** (⛔ CORRECTED 2026-09-30, 3.4.3 is the `package.json` range. `yarn.lock` pins **3.4.16**, which is what builds. Measured by Code on the plan for A1 7.11 AB#1046, `from-code/1046.md` 2026-09-30 23:24, section 7 item 10.) **Originally measured as 3.4.3 and `@tailwindcss/container-queries` is NOT installed** (native utilities only land in Tailwind 4), but **Tailwind 3 arbitrary variants pass at-rules through**, so `[@container(min-width:_Npx)]:` works with `[container-type:inline-size]` on the parent. **No `tailwind.config.ts` or `package.json` change, so this is NOT queue-gated.** `truncate` and `line-clamp-*` are already in core.

**Text overflow.**

- **card title** — ONE line, `truncate`, **never wrap**. A wrapping title changes card height and reintroduces the inconsistency.
- **eyebrow** — one line, truncate. **labels and names** — truncate, and put the full string in a `title` attribute.
- **descriptive prose** — `line-clamp-2` only, a fixed clamp so height stays predictable.
- ⛔ **NEVER ELLIPSIS A NUMBER. This is a correctness rule, not a style rule.** A truncated figure is a **wrong figure**, and this app exists to report figures people act on: `1,845,540.12` clipped to `1,845,5…` reads as a real, far smaller number. When a figure does not fit: **fewer decimals, step the unit up (kWh → MWh), or step the type size down. Never clip.** Applies to every figure, delta, count and percentage.

**THE CARD HEADER. Every card carrying important content has one, and it is uniform.**

| | Value |
|---|---|
| Face | display face (Overused Grotesk), weight 600 |
| Colour | `hue-sky-900` `#1F4173` — already consistent across the DS |
| Size | by DENSITY: 18 / 15 / 13. **Never by importance** |
| Case | **TITLE CASE** |
| Layout | title left, metadata right, one flex row, `space-between` |
| Overflow | one line, truncate |

⛔ **TITLE CASE IS A DELIBERATE OVERRIDE OF THE DS, negated here so it is not "corrected" back.** **MEASURED 2026-09-21, EIGHT of eight genuine DS card titles are sentence case**, not the two this line used to claim. The eight are `Battery safety`, `Capacity & generation`, `Capacity rollups`, `Fleet status`, `Generation purpose`, `How loads are met`, `Maintenance & audit log` and `Site photos`. Three title-case strings in the templates are a page title and two proper nouns rather than card titles. **Keith ruled TITLE CASE anyway on 2026-09-21, knowing the count**, so the override below stands as a deliberate call against eight rather than a casual one against two. **Keith ruled Title Case and it overrides the DS on every card.** Finding sentence case in a template is **NOT** evidence of the standard. This is a **named exception to DL-13** (bring the repo toward the Design version), on Keith's ruling.

✅ **The eyebrow gets ONE set of values**, ending the worst drift in the DS (it appears in 30+ non-gallery templates at 10/10.5/11px, weight 600 and 700, three letter-spacings, two colours): **11px, uppercase, weight 600, `letter-spacing:0.05em`, `hue-ink-500` `#8A9199`.** ⛔ `#B4BBC1` is untokenised and dies; weight 700 and the 0.03em/0.09em spacings are drift, not variants.

### ⛔ TWO CARD IDIOMS ARE LIVE ON THE FIVE PLANT TABS, and `GraphWrapper` is the old one. Measured 2026-09-09.

⚠️ **MERGED 2026-09-22 as `91ebb2f` (`!1041`, A2 4.4 / `AB#1004`), so THE TABLE BELOW IS HISTORICAL.** 4.4 restyled `GraphWrapper` onto the new idiom, which is meant to leave one idiom across the tabs that use it. ⛔ **The rewrite of this section is DUE and not yet done.** It waits on a measurement, and 4.5 / `AB#1022`'s step one inventories every Trends chart. Until then, read the files on `dev`, not this table.

| | card | title |
|---|---|---|
| **NEW**, Control (`AB#953`) and Events (`AB#949`) | `rounded-[14px] bg-white p-5 shadow-500` | `truncate font-display text-lg font-semibold text-hue-sky-900` |
| **LEGACY**, Overview, Trends and Equipment | `rounded-lg bg-white p-10 shadow-500` | `font-bold text-lg` on the BODY face |

✅ **BUILD AGAINST THE NEW ONE.** `ControlCard.tsx:137` is the reference and Events matches it exactly. ⛔ **Do NOT converge on `GraphWrapper` because three tabs still use it.** On 2026-09-09 a census pointed there and made the newer card look like the divergence, when the newer card was right and was drifting from Control by two pixels.

⛔⛔ **RETIRED 2026-09-16 BY DL-84, AND NEGATED EXPLICITLY RATHER THAN DELETED SO NOBODY PUTS IT BACK. `GraphWrapper`'s OWNER IS NOW A2 4.4 / `AB#1004`, NOT A1 7.8.** `AB#1025` / 7.8's criterion 7 is STRUCK and its Description now says in so many words that the component belongs to 4.4 and that 7.8 touches nothing on it. **4.4 restyles `GraphWrapper` itself rather than moving the charts off it**, which was ruled against Cowork's recommendation and Keith's reading of the risk was the better one, that striking 4.4's criterion would make a billed A2 item wait on an unbilled A1 item with no date. ⚠️ **The blast radius was measured and accepted, 29 consumer files and 30 call sites, only 7 of them Trends.** `AB#1004` carries a criterion specifically for the other 22 so the item cannot go `Done` with Home quietly broken. ✅ **The work MERGED 2026-09-22 as `91ebb2f`.** Do not act on the retired prohibition below.

⛔ **The retired text, kept for the record only, DO NOT FOLLOW IT.** *"`GraphWrapper` has an owner and it is A1 7.8. Do not retrofit it inside another PBI."* One component sits behind three tabs, so fixing it in each tab's own item is how three variants get created. 7.8 also carries the surface-depth application, `Forms/DateFilter`'s reskin and the plant shell header, for the same shared-chrome reason. **Until it lands, switching from Events or Control to Overview, Trends or Equipment steps the card radius and the title face. That is known, filed and not yours to fix in passing.**

⚠️ **OPEN AND DELIBERATELY UNASSERTED, 2026-09-14.** 6.2 / `!1040` added a **device view body** under Equipment, a resolver plus an inverter body with a detail field block, a header state badge and a pager. **Whether that new body uses the NEW card idiom or the legacy one is NOT read here and must not be assumed from this table**, which was measured on 2026-09-09 against the five tab surfaces and not against a body that did not exist then. One grep settles it. ⛔ **Either way it is not yours to change in passing**, the overlay's whole composition and chrome belong to **6.3 / `AB#1012`** under DL-75.

⭐ **Inset tiles inside a card follow `ControlCard.tsx:30-42`'s `Readout`**, `rounded-[10px] border border-hue-ink-100 bg-hue-ink-50 px-4 py-3`, eyebrow at `text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-hue-ink-500`, figure at `font-display text-lg font-semibold tabular-nums text-hue-ink-900`. Radius 10 sits one step below the 14 of the card holding it, which is the declared inset-tile relationship. ⛔ **A read-only tile row is NOT interactive.** No `aria-pressed`, no pointer cursor, no hover. `AB#949` ships a test pinning that, because a tile that also filtered would rebuild the conflict its pill row was removed for.

### ⛔ TWO REGISTRY FILES CAUSE EVERY MERGE CONFLICT IN THIS REPO. Measured across two queues.

**Both conflicts the 2026-09 queue produced were in one of two files.** `app/containers/Plant/PlantHome/TabPlaceholder.test.tsx`, which enumerates the tabs, and `vite.config.ts`. **Neither is a coincidence.** They are registry-shaped, so every item in their class has a legitimate reason to edit the same few lines, and two items in flight guarantees a collision.

⛔ **`TabPlaceholder.test.tsx` will do it again.** A2 4.5 (Trends composition) and 6.2 (Equipment drill-in) will both have a reason to touch it. **If you are asked to build both in parallel, say so before starting.** The options are building in series, or splitting that test file per tab so each item owns its own guard, and the split is not yet decided.

⚠️ **UPDATED 2026-09-14. 6.2 has SHIPPED as `!1040` with no conflicts**, so the two items above were never in flight together and the predicted third collision did not happen. **The prediction is NOT retired**, it was avoided by building in series, which is one of the two options it named. **4.5 is now the next item with a reason to open that file**, and whatever opens it alongside 4.5 is the next collision. The split is still undecided.

⭐ **When a conflict does land there it is usually a COMBINE, not a pick-a-side.** The 2026-09-09 resolution needed the Trends sentences and `it` title from one branch and the Control sentence and `describe` rename from the other, because post-merge both tabs had left the placeholder. **Taking either side whole ships a GREEN test whose name describes the wrong world.**

### ⛔ BANNERS, NOTIFICATIONS AND CHIPS. UX declared 2026-09-01. Canonical in the wiki, same section name.

⚠️ **Read the right file. `Chip` exists TWICE** (`ui-chip/Chip.dc.html` and `domain-control-readout/Chip.dc.html`) **and `SeverityBadge` exists twice** (`severity-system/` and `domain-control-readout/`). ✅ **Canonical is the standalone folder** in both cases. ⛔ **There is NO toast / snackbar template anywhere in the DS** — `NotificationInbox` is a persistent LIST, not a transient notification. Do not build a toast from it.

**The governing principle: these differ by who started it and what a miss costs.**

| | Started by | Lives | Leaves | A miss costs |
|---|---|---|---|---|
| **chip** | nobody — it is a FACT | inline, in a card | with its parent only | nothing, it is still on screen |
| **banner** (`Callout`) | a CONDITION | **in** the layout | user dismiss, or condition clears. ⛔ **NEVER a timeout** | a lot |
| **notification** (toast) | an EVENT | **above** the layout | a timer | **nothing — that is the constraint** |

⛔ **A TOAST IS NEVER THE ONLY CARRIER. This is a correctness rule, not a UX preference.** Everything a toast says must ALSO land in the notification inbox or alerts list as the durable record. **An operator who looked away for four seconds must not lose a fault.** If a message has nowhere durable to live, **it is a banner, not a toast.**

⛔ **ONE CHANNEL PER MESSAGE.** The same event never fires both a toast and a banner.

**CHIP — no lifecycle. It changes value.** `ui-chip/Chip.dc.html`: Space Grotesk 600 **12.5px**, `line-height:1`, `border-radius:999px`, `padding:5px 12px`, optional 7px leading dot, nine colour families. One size, no variants.
- Appears with its parent, **no entrance of its own.** ⛔ **NEVER animate chips in on a data refresh** — they render in rows of 5–10 and a stagger on every poll is the frequency problem the house skill says to remove.
- A **value** change cross-fades the **label only** (opacity ~150ms). ⛔ **Never animate the pill's width** — it reflows the row.
- A **status-family** change (green→red) transitions colour over 100–160ms, plain `ease`. That one *should* be noticed.
- An **interactive** chip (filter/selection) is a different component and takes the full six-state contract.

**BANNER — in the layout, so it reflows.** `callout/Callout.dc.html`: `padding:14px 16px`, `radius:10px`, tinted bg + 1px matching border, 22px circular severity icon, title 13.5px, body 13px, action link 12.5px.
- Appears by animating **its own height** plus opacity, 150–250ms, `cubic-bezier(0.23,1,0.32,1)`. It pushes content, so without a height animation the page jumps. ⛔ Never from `scale(0)`, never a slide (it is inline).
- ⛔ **PERSISTENT. No timeout, ever, at any severity.** It may update its text in place.
- A second banner of the same severity **coalesces with a count. It does not stack.** ⛔ Max two visible.
- Exits at 120–180ms, reverse of enter, **collapsing its height** so content does not snap upward.
- ⛔ **Dismissal is remembered per CONDITION INSTANCE, not per session.** A banner returning on every navigation trains people to dismiss without reading.
- ⛔ **A banner carrying a FAULT is never dismiss-only** — dismissing hides the notice, not the condition, so the condition must stay visible on its own surface.
- ⚠️ Its dismiss `x` (`#7FA8BE`, 16px, no outline) **diverges from the close-button spec below. The close-button spec wins** — reconcile the Callout toward it.

**NOTIFICATION (toast) — does not exist yet; build to this.** ⛔ **CORRECTED 2026-09-01: the first version of this spec violated three house rules at once. All three are now folded in.**
- **One corner, always the same one.** Recommended top right, so the transient copy sits beside the inbox icon holding the durable copy.
- ⛔ **Enters on a PERCENTAGE translate of its own size — `translateY(100%)` or `translateX(100%)` — NOT a hardcoded px offset**, 200ms, `cubic-bezier(0.23,1,0.32,1)`. House rule verbatim (`find-animation-opportunities`): *"Dismissable surfaces (toasts, sheets) that exit a different way than they entered → symmetric paths; `translateY(100%)` percentages, not hardcoded pixels."* An earlier version said "~8px offset" and was wrong on both counts.
- ⛔ **CSS TRANSITIONS, NEVER KEYFRAMES.** `review-animations/STANDARDS.md` names toasts as the case: keyframes restart from zero, transitions retarget, and toasts are added rapidly. Use `@starting-style` for entry without JS.
- ⭐ **SWIPE TO DISMISS is the named house idiom for a toast** (`animation-vocabulary`). Dismiss on **velocity, not distance**: `Math.abs(distance)/elapsedMs > ~0.11` — a flick is enough. Rubber-band at the boundary rather than hard-stopping.
- **Dwell by severity, and the timer PAUSES on hover and on focus-within:** info 4s · success 4s · warning 8s · ⛔ **error and fault NEVER auto-dismiss.** ⛔ Never under 4s (unreadable), never over 10s for anything auto-dismissing.
- ⛔ **MAX THREE visible.** Newest nearest the origin corner; past three, coalesce into "+N more" pointing at the inbox. A wall of toasts blocks the UI it is reporting on.
- ⛔ **Exit REVERSES the enter path** — the same translate percentage back out, ~150ms so it is faster than enter. **Symmetric PATH, asymmetric DURATION.** An earlier version said "fade + slot collapse", which is a different geometry from the enter and is exactly what the symmetric-paths rule prohibits. The remaining stack then reflows on `cubic-bezier(0.77,0,0.175,1)` (the on-screen movement curve).
- **Keyboard dismiss removes it immediately, no exit animation**, per the contract's prohibition on animating keyboard-initiated actions.
- **Reduced motion:** fade only, no slide, and the stack reflow lands instantly.
- **A11y:** `role="status"` + `aria-live="polite"` for info/success; `role="alert"` + `aria-live="assertive"` for warning/error. ⚠️ **Pause-on-focus is what makes the dwell timer safe for a screen-reader user** still being read the message when the timer expires.

⛔ **The error asymmetry is the point: you cannot auto-dismiss a fault.** An error toast holds until dismissed. If that feels wrong for a case, **the message was a banner all along.**

### ⛔ STATE TEXT THAT ASKS FOR AN ACTION CARRIES A BUTTON. Ruled by Keith 2026-09-25 (DL-114).

When an empty, failed or other state line asks the reader to do something, such as changing the date range, it
gets an explicit button **below** the text naming the action, for example **Change date range**, the label the
Trends header control took on 2026-09-18 (`ef5dd0c`). A state that asks for nothing (no blackouts recorded,
loading, not built yet) carries no button. The button follows the button appearance rules above, the secondary
until the elevation tokens land, and at most one primary per region.

⛔ **Do not make a word inside the sentence the control.** The clickable "range" in `ProductionKpi` and
`EventsTable` (2026-08-20) is SUPERSEDED for new work. Those two sites are retrofit candidates owned elsewhere,
so do not change them in passing. ⛔ **The date picker is found by TWO hooks, and both must survive any header work.**
The input id `date-range-picker-input` (`DATE_RANGE_INPUT_ID` in `utils/common.ts`), which `ProductionKpi` uses
alone, and the `.date-picker` class, which `EventsTable` uses. `openDateRangePicker` tries the id first, then the
class. Dropping either breaks a range link with no error. Corrected 2026-09-25, this said one hook.

### ⛔ THE CLOSE BUTTON is fully spec'd. Every close button in the app is identical. No local variants.

Canonical in the wiki's design-system page, section "The close button". Spec'd by Keith 2026-09-01.

- **rest** — bare grey X, `ink-600`, **no outline**. (`ink-500` fails AA at 3.19:1 and this glyph is small.)
- **hover** — THREE changes together, all one colour: the **X turns blue**, a **blue outline appears**, and the **X rotates 90°**.
- **the blue is `hue-sky-500`** — the same value as the focus ring, distinguished from it by width or offset, never by a second blue.
- **focus-visible** — the contract's ring. **press** — `scale(0.97)`.
- **reduced motion** — drop the rotation, **KEEP the outline and the recolour.** Motion goes, colour stays.
- **duration** 100–160ms, plain `ease`.

⛔ **ROTATE 90°, NEVER 45°.** An X is two strokes at 45° and 135°, so 90° maps the set onto itself and the glyph lands looking identical, which is the intent. **45° lands it on a plus sign**, which reads as "add" on a control that closes things.

⛔ **Use CSS `outline`, never `border`** — a border appearing on hover shifts layout by 1px, and layout-shifting hover is prohibited by the contract.

⚠️ **One shipped exception to layout-shifting hover exists**, the Control dropdown's revealing rows. See the ONE-SHOT reveal rule above for its scope and its mitigations. It does not license a border-on-hover anywhere.

⛔# ⛔ DEPTH: one scale, TWO channels, DECIDED and NOT BUILT. Do not apply either, and do not invent values.

⭐ **UPDATED 2026-09-07 (Keith). The scale now carries a SURFACE FILL beside each shadow.** His stated problem
is that the interface looks flat, and that sentence is the specification the tuning answers to, so a level that
does not read as further forward than the one behind it is wrong however correct its numbers are.

**One system, not two.** The seven levels and their names are unchanged and **each gains a surface tone**. A
component names what it IS, a resting card, a popover, a modal, and receives both a shadow and a fill.
⛔ **A component never picks a grey and never sets its own background to get depth.** Two separate systems and
tone-only were both considered and rejected, the reasons are in the wiki under `ELEVATION AND SHADOW`.

⛔ **NO TONE VALUE EXISTS YET AND NONE MAY BE INVENTED.** The shipped surface palette gets measured before any
value is declared, because declaring a palette without reading the one in the tree is how both token files in
this repo became junk drawers. ⚠️ **The small-text contrast floor is re-checked against every candidate tone**,
`hue-ink-500` already fails on white and `hue-ink-600` is the floor there, so a darker surface moves that line.

⚠️ **Expect roughly three usable tone steps against seven shadow levels.** White is the ceiling in light mode.
Tone supplements the shadow channel rather than mirroring it, and two levels may share a tone.

**Names carry purpose, never colour.** ⛔ **No token name mentions a grey.**

**Home is `theme/elevation.ts`**, the file the shadow tokens already occupy. It lands under task 899 / 7.1 /
`AB#745`, never inside an unrelated PBI. The app-wide retrofit is a separate A1 7.x item.

⛔# ⛔ The shadow half: values are DECIDED but NOT BUILT. Do not apply them, and do not invent one either.

A six-step elevation scale was declared 2026-09-01 and lives in `C:\cowork\dashboard-requirements\memory\topics\design-system.md`, section "ELEVATION AND SHADOW". **The tokens do not exist yet.** It lands as its own change under task 899 / 7.1 / AB#745, never inside an unrelated PBI.

✅ **THE QUEUE IS EMPTY AND THE TOKEN GATE IS CLEAR. Measured 2026-09-01 on `origin/dev` = `ee76dc3`.** All nine of the standing order merged; nine remote branches deleted. ⛔ **CORRECTED 2026-09-02 by a full ref enumeration. THE COUNT WAS WRONG. There are ELEVEN non-`dev` refs plus `main`, not five.** The five named here (`feature/ci-fix`, `feature/mapbox-fix`, `feature/poc-loaders`, `fix-plant-search`, `fix/api-hosts`) are real but incomplete. **The substance survives** — the six beyond them are also stale, and five of the eleven are `ahead:0`, holding nothing `dev` lacks, so they are deletable stubs rather than queue entries. ⚠️ **But two carry 2026 dates and read as current at a glance, `feature/726-status-donut` (2026-07-20) and `feature/area.1.1` (2026-07-14).** Method was a loop over `git branch -r --format=...` running `git log -1 --date=short` per branch, with the token column carrying its own positive control, the top row fires so the eleven blanks beneath it are real. Full table in `docs/agent-mail/from-code/branch-reads.md`. ⛔ **Do not re-assert five.** `git diff --name-only origin/dev...BRANCH -- tailwind.config.ts theme/` returns **zero for every one of them.** ⛔ **Do not quote `0decd5d` or `8e8f8ec` as `dev` any more.**

⛔ **So the "wait for the queue" clause is GONE, and nothing replaces it. Task 899 / 7.1 / AB#745 can build `theme/elevation.ts` now.** ⚠️ **But the SCOPE rules below do NOT lift.** Token work still lands in its own change and never inside an unrelated PBI — that was always about scope discipline, not about conflicts, and an empty queue does not change it.

**So on any component work in an unrelated PBI, until the scale actually ships:**

- **Use whatever shadow utility the surrounding surface already uses.** Match the neighbour, do not improve it.
- **Do NOT add a shadow key to `theme/` or `tailwind.config.ts`.** That is the conflict this decision exists to avoid, and doing it inside an unrelated PBI means resolving the same collision twice.
- **Do NOT hardcode a `box-shadow` arbitrary value** to approximate the new scale. That breaks the tokens rule below and is harder to migrate than leaving it alone.
- **If a design pass asks for a shadow that does not exist yet, say so and leave it.** Report it rather than building it.

**One half of the decision DOES apply now, and costs nothing:** shadow means **elevation only**. It is never decoration, never a way to separate two things sitting at the same height, and never a substitute for a border. If a proposed shadow is not saying "this surface is above that one", it is the wrong tool regardless of which utility is used.

**The vocabulary, so you can name an elevation before the tokens exist.** Ruled additive as `elev-0` … `elev-6`, a NEW key that sits alongside Tailwind's `shadow-*` rather than replacing it — overriding `shadow-*` would silently restyle every existing call site and no test here can catch a shadow change. When the scale ships it lands in a new `theme/elevation.ts` spread into `tailwind.config.ts` under `theme.extend.boxShadow`.

| Token | Surface |
|---|---|
| `elev-0` | flush — table rows, chips, badges, anything inside a card |
| `elev-1` | resting controls — buttons, inputs, small affordances |
| `elev-2` | resting cards — capacity band, stat tiles, alerts widget, `PlantCard` at rest |
| `elev-3` | raised — a card focused or selected from outside |
| `elev-4` | hover lift on a navigational card, dropdowns, the map's floating list |
| `elev-5` | popovers and content-bearing tooltips |
| `elev-6` | modals and dialogs only |

Hover on a navigational card is a **two-step lift, `elev-2` to `elev-4`**. That is the number behind the DS template's `style-hover`, which only ever said "a lifted shadow".

✅ **`shadow-plugin` is ABSENT, measured 2026-09-01.** Not in `package.json`, not installed, not registered in `tailwind.config.ts` (plugins are `@tailwindcss/forms` and `@tailwindcss/typography` only), and all four `smooth-shadow-ring` utilities emit **NO RULE** under an emit check whose positive controls passed. ⛔ **So `.claude/skills/smooth-shadow-ring` is INERT in this repo. Do not cite its utilities and do not treat its guidance as enforced** — its reasoning is still sound advice, but nothing in the build applies it. ✅ This also confirms `elev-*` collides with nothing.

⚠️ **`theme/boxShadow.ts` is the only shadow source and there is no `theme/elevation.ts`.** Four custom keys today: `500`, `card`, `llg`, `xs`. **So `shadow-xs` here is a project key, not Tailwind v4 naming.**

✅ **The scale's colour is RULED near-neutral (Keith, 2026-09-01), and it was re-confirmed against the counter-argument.** `#0F0F10` for `elev-1`…`elev-5`, `#101828` for `elev-6` only. His reason: a shadow should look like a shadow, and a tinted scale reads as a coloured edge instead. ⛔ **`card` is already a two-layer shadow TINTED NAVY** at `rgb(16 42 79)`, and matching it was recommended and **rejected**. **So a card moving from `shadow-card` to `elev-2` shifts its shadow hue from navy to neutral, across every DS card at once — that is INTENDED.** Task 899 ships it as a visible design change named in the PR description, not as a silent token swap. **Do not "fix" the divergence in either direction and do not pre-tint anything.**

**The exact values are canonical in the wiki section named above and are deliberately NOT duplicated here**, so the two cannot drift. Read them from there when task 899 builds this; until then you should be naming elevations, not writing them.

### ⛔ CHART LAYOUT is RULED (DL-64, 2026-09-04). Charts sharing an axis align, charts that do not get their own zone.

Canonical at `C:\cowork\dashboard-requirements\memory\topics\design-system.md`, section **"THE TRENDS
NINE"**, and in `decision-log.md` at **DL-64**. **The measurements and the rejected options are deliberately
NOT duplicated here, so the two cannot drift.**

**What binds you when you build any surface carrying more than two charts.** Charts on a shared axis are laid
out so the axis lines up and the axis is drawn ONCE, not per chart. Charts on a different axis are separated
into their own zone. The reason is a correctness argument rather than a preference, a two-column grid renders
two charts at different pixel widths over different ranges, so a reader who scans a vertical slice down the
page concludes something false.

⚠️ **F-pattern and Z-pattern are the WRONG models for a dense analytical surface and were considered and
rejected.** Do not reintroduce them. The reasons are in the wiki section named above.

⚠️ **ON THE TRENDS GRID, SUPERSEDED 2026-09-25 BY DL-113.** Every Trends chart sits in its own card with its own date
axis, one column below `xl` and two from `xl`, and the shared surface is gone. Alignment still holds, because every
card has one width and one domain. Anywhere else, the drawn-once rule above stands.

⏳ **FORWARD NOTE, 2026-09-26, updated 2026-09-28. On `feature/1022-trends-design-pass`, in review as `!1049`, NOT merged.** The two zone headings go (DL-120), grid frequency and grid voltage become ONE Grid Quality chart on two value axes, each centred on the payload's own nominal (DL-121), and from `xl` the grid is six columns rather than two (DL-122). ⛔ Do not describe `dev` that way, and do not pre-apply any of it, until A2 4.5 / `AB#1022` merges. The chart treatment the branch carries is written up in `C:\cowork\dashboard-requirements\design-conventions\08-messaging-and-charts.md`, section Chart treatment. ⚠️ **Overview carries the same treatment on `feature/942-overview-today-panels`, in review as `!1043` at `699100c`, NOT merged (DL-123)**, and 21 shared chart files there are byte-identical to the Trends branch at `3b463f6`. So if `!1043` merges first, `dev`'s Trends tab runs the old Trends charts on the new shared helpers until `!1049` follows.

### ⛔ TYPOGRAPHY is DECLARED but NEITHER FONT FILE IS IN THE REPO. Do not build against it yet.

Declared 2026-09-01. Canonical in `C:\cowork\dashboard-requirements\memory\topics\design-system.md`, section "TYPOGRAPHY". Two faces replace two, and **Keith adds the files manually, so today the app still renders the old faces.**

| Role | Face | Replaces |
|---|---|---|
| display | **Overused Grotesk** | Space Grotesk |
| body | **Opening Hours Sans** | the inherited `ui-sans-serif, system-ui` stack |

✅ **THE FACES AND THE TEN TOKENS LANDED ON `dev` 2026-09-21 with `AB#991` / A1 7.2, so the prohibition that stood here is RETIRED.** Read on the merged tree rather than inherited: `public/fonts/` carries `overused-grotesk-latin-variable.woff2` and `opening-hours-sans-latin.woff2`, **Space Grotesk's file is gone**, `theme/fontFamily.ts` declares `display` as Overused Grotesk, and `theme/fontSize.ts` carries all ten tokens with their tracking and leading. **Authoring against the scale is now correct rather than forbidden.** ⚠️ **One thing to confirm before assuming it, not measured here.** `theme/fontFamily.ts` declares `display` and nothing else, so Opening Hours Sans sits in the repo without a family entry. **Check where the body stack is wired before treating it as available.** The `tnum` caution on both new faces is unchanged and lives below.

✅ **Format is RULED: WOFF2 converted from the TTF**, latin-subset, variable where the face publishes a variable file. The reason is the repo's own single self-hosted face — `@font-face` at `app/tailwind.css:1-10`, `src: url('/fonts/space-grotesk-latin-variable.woff2')`, `font-weight: 300 700`, 22,288 bytes, brotli-compressed. ⛔ **Do not add an OTF or a raw TTF, and do not add a static file per weight.**

⛔ **AMENDED 2026-09-02 by measurement: OVERUSED GROTESK CARRIES TITLES AND ALL NUMERALS, OPENING HOURS SANS CARRIES PROSE.** Opening Hours Sans ships ONE cut with **no `tnum` feature at all** and proportional digits (367/550/600/638 units), verified by HarfBuzz shaping with a control. So numbers in the body face can never column-align and the tabular-figures ruling is unsatisfiable there, permanently. **Wherever tabular figures apply, the DISPLAY face applies too.** ✅ This also CLOSES the buttons question: a 600-weight label cannot live on a single-cut face without synthetic bold, so buttons take the DISPLAY face and the DS Button template's `ui-sans-serif` default is overruled by capability. ⛔ **Never declare a weight range on Opening Hours Sans** — it is `font-weight: 400`, single value. A range invites synthetic bold, which reads smeared, is worst at small sizes and perturbs metrics.

**Face by text role, ruled.** Display carries identity, magnitude and every numeral. Body carries prose.

- **display**: hero and card figures, delta badge, card titles, page title, Callout and banner titles, chip label, **plus everything moved across below**.
- **body**: body text, textual table cells (plant names, serials), captions, form inputs, nav items, tooltips, toast and banner body.
- ⛔ **Moved to display 2026-09-02**: the eyebrow, table headers, **buttons**, numeric table cells, units, and anything live-updating.

⚠️ **Buttons are on the BODY face deliberately, not by oversight.** `design/templates/form-controls/Button.dc.html` sets `font-family: ui-sans-serif, system-ui` rather than Space Grotesk, so the DS already ruled it and the convention follows the DS. Moving buttons to the display face is a DS template change first, in that order, and never a local decision. ⚠️ **UNRESOLVED TENSION, flagged 2026-09-30.** The table ruling further down says "the display face keeps titles and control labels only", and names the page buttons as control labels. The two lines disagree, and neither is ruled over the other. Ask rather than pick. One scoped ruling exists: **the sidebar's row labels take the display face** (A1 7.11 AB#1046, Keith's Q5, 2026-09-30), and it says nothing about buttons.

**The type scale is ten rem tokens** (`display-xl` 2.375rem, `display-lg` 1.75, `title-lg` 1.125, `title-md` 0.9375, `title-sm` 0.8125, `body` 0.875, `body-sm` 0.8125, `label` 0.75, `eyebrow` 0.6875, `caption` 0.6875), each with a declared tracking and leading. **The exact tracking and leading values are canonical in the wiki section named above and are deliberately NOT duplicated here**, so the two cannot drift.

⚠️ **12.5px collapses to 12px (`label`).** That is a deliberate overrule, not a rounding: 12.5 is the most common arbitrary type value in `app/` at 31 uses **and** it is the DS chip and action-link size. The small band goes 11 / 11.5 / 12 / 12.5 / 13 down to 11 / 12 / 13. **Do not reintroduce a half-pixel type value anywhere.**

✅ **`tnum` (tabular figures) is MEASURED CLEAR on Space Grotesk, 2026-09-02.** The shipping `public/fonts/space-grotesk-latin-variable.woff2` carries GSUB `ccmp dnom frac liga locl numr pnum tnum`, read off the feature table. ⛔ **Still unmeasured on Overused Grotesk and Opening Hours Sans.** If you are asked to apply tabular figures to a column on either new face, say the support is unverified and leave it. It bites hardest on Opening Hours Sans, because two of the three tables render in the body stack. ⚠️ **`tnum` does NOT gate adding the fonts** — that was a Cowork framing error, corrected. What it gates is the tabular-figures half of the ALIGNMENT AND SPACING ruling, because `font-variant-numeric: tabular-nums` on a face without the feature compiles, emits and silently does nothing. ⛔ **The real requirement is on the CONVERSION COMMAND: `pyftsubset`'s default `--layout-features` set does NOT include `tnum`, so a naive subset strips tabular figures from a face that has them.** The existing 22 KB Space Grotesk subset kept its features, so copy that recipe rather than inventing one.

✅ **The order of work below was DISCHARGED by `AB#991` on 2026-09-21.** It is kept because it is the recipe for the next face, not because anything here is owed. It read: `tnum` verified first, then the files added, then the two `@font-face` blocks plus `theme/fontFamily.ts` in one commit **with Space Grotesk's block and file removed in that same commit** (or the app ships three faces and downloads one it never renders), then the ten tokens into `theme/fontSize.ts` (⛔ git tracks this file as `theme/fontsize.ts`, lowercase, noted 2026-09-30. On Windows both spellings open it, and a case-sensitive checkout does not). ⚠️ **Migrating the app's 122 px type arbitraries is SEPARATE work, was NOT part of that commit, and is still owed**, per the alignment ruling that new tokens carry no migration.

Tokens (hard rule): components **consume tokens; never hardcode a hex.**

- Take all color from the `theme/` tokens — the `status-*` (and `cat-*`, see the note below) Tailwind utilities, or `statusToHex` for Recharts.
  - ⚠️ **"Once the categorical module lands" is now a MERGE condition rather than an open question, 2026-09-16.** `theme/categorical.ts` EXISTS, ten values including `cat-backup` `#22C3D6` for backup and emergency power, spread as the fourth colour source in `tailwind.config.ts`, **and it reached `dev` with `!1041` on 2026-09-22 (`91ebb2f`).** The 2026-09-16 check that found it absent from `origin/dev` is spent. Re-run `git cat-file -e origin/dev:theme/categorical.ts` before relying on `cat-*` from a fresh branch. ⭐ **The inverter series deliberately do NOT take a categorical value**, they take the brand ramp at `hue-sky-600`, because `total_dc_to_ac` and `inverter_power` are throughput totals rather than categories (DL-86). The `hue-sky` ramp lives in `theme/colors.ts`.
- **Do NOT** wire colors from `design/templates/_ds-foundation/fig-tokens.css` (a local-only reference file) — its status vars are grayscale placeholders and it has no `--cat-*` or anomaly.
- Status hues are reserved for status meaning only. Decorative/UI accents use the non-status set (navy, teal, rust, green); violet is Anomaly and nothing else.
- ✅ **The retoken MERGED 2026-09-22 with `!1041` (`91ebb2f`)**, so the 51 count in the next paragraph is the pre-merge picture and is historical. 4.5's step one re-measures what is left. ⭐ **One thing about the item HAS changed and it matters more than the count.** `AB#1004`'s criterion 1 no longer says "no raw hex remaining in the seven files", it says **"no raw hex remaining anywhere on the tab"**. As written before, the criterion could have been fully satisfied while the two categorical charts still carried raw hex, because those were never among the seven the audit counted, so the item could have gone `Done` with the tab still mixed. **Do not restore a file-scoped or count-scoped reading of that criterion.**

⚠️ **HISTORICAL since `!1041` merged 2026-09-22. Kept for the record, do not quote the count as `dev`.** ⛔⛔ **KNOWN DEBT, MEASURED 2026-09-04. THE SEVEN TRENDS CHARTS BREAK THIS RULE 51 TIMES AND IT IS A FILED ITEM, NOT A CONVENTION GAP.** Raw six-digit hex literals per file, `EnergyGenerationGraph` 8, `EnergyStatisticsGraph` 10, `GridFrequencyGraph` 7, `GridVoltageGraph` 7, `BalanceOfSystemsGraph` 10, `DurationOfBlackoutsChart` 1, `LoadBalancingAreaGraph` 8. **Zero reads of `statusToHex`, `status-*` or `hue-*` in any of them**, and all seven sit in the legacy `GraphWrapper` rather than the card system. The fills are Recharts documentation defaults nobody replaced. ⛔ **Do NOT "fix" these incidentally inside another PBI.** One Trends design item owns all of it, four parts, axis normalisation plus tokens plus the card system plus the layout per DL-64, and a partial drive-by fix makes that item's diff unreadable. Same standing as the no-navigation-below-1024px defect above.

`ds-bundle/` is the **generated, published** design-system bundle (produced by `/design-sync`, which imports the repo's own components → bundle). It is read-only output: never hand-edit it. Fix source in `app/` + `theme/` and let a resync republish.

### ⛔ THE TYPOGRAPHY DECLARATION CONTRADICTS ITSELF ON NUMERIC TABLE CELLS. Ruled by the build 2026-09-09.

**The declaration says display carries "the eyebrow, table headers, buttons, numeric table cells, units" and separately says body carries "textual table cells (plant names, serials)".** ⛔ **A serial is listed under body and a numeric cell under display, and a serial IS numeric.** A date column is the same problem. **So the declaration supports either answer, which is what let a real defect look principled.**

✅ **THE RULING, and it needs confirming rather than re-deciding.** **Every data cell is on the BODY stack**, in tables and in detail panels, with `tabular-nums` kept wherever digits sit in a column. **The display face keeps titles and control labels only**, meaning the card title, the rows-per-page trigger, its options and the page buttons.

**Measured support.** `ComplexTable`, `DeviceInventoryList` and `PlantsList` all return **zero** `font-display` on cells. `AB#949`'s table was the only one putting a second face on a cell, so it was drift introduced in a column-collapse commit rather than a convention being followed.

⚠️ **The declaration gets tightened where it lives when the font files land.** A1 7.4 is where that happens. ⛔ **BOTH FACES ARE NOW IN THE REPO as of 2026-09-21, so the question IS forced** and A1 7.4 is no longer waiting on anything.

⛔ **AND A BOTTOM BORDER IS NOT A SAFE UNDERLINE ON ANYTHING WITH A RADIUS.** A one-sided border follows the radius and curves up at both corners, closing into a box that reads as an outlined button. Measured on the 6px console link, 2026-09-09. **Use a pseudo-element rule instead**, one pixel tall, inset to the content, hidden at rest and faded in on hover behind the pointer guard. It draws straight, cannot inherit the radius and shifts nothing. ⛔ Not an inset box-shadow either, since shadow means elevation here and nothing else.

