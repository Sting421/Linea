# 09 · Traps

Things that look wrong and are deliberate, things that look fine and are broken, and the names that mislead.

⭐ **Read this before "fixing" anything you did not come here to fix.** Every entry below cost someone real
time at least once.

---

## Icons · five defect classes, so never assume a glyph behaves

⛔ **An icon in this set may not recolour, may not scale, and may not be the size its name implies. Check
before you use one.**

| Class | What it means |
|---|---|
| **hardcoded fill before the props spread** | the glyph cannot be recoloured. A `className` with a colour is silently ignored |
| **no `viewBox`** | the glyph does not scale. Sizing utilities do nothing |
| **non square or unexpected `viewBox`** | it does not align optically with its neighbours at the same declared size |
| **fixed `width`/`height` attributes** | the same, and they beat the utility |
| **stroke where the set is fill, or the reverse** | it reads at a different visual weight in a row of others |

⚠️ **`Shield` carries a hardcoded fill AND a 43 × 49 viewBox.** It is the worked example of two classes at
once.

**Icon-only buttons are where this bites hardest**, because the glyph IS the control. See `05-buttons.md`.

### The DS icon queue

**Standing rule.** ⭐ **Use the glyphs on the declared DS icon library. A repo icon with no declared DS source
is design debt.** When a glyph you need does not exist, **build it in the repo's own idiom AND say plainly
that it is a DS queue item, naming the glyph.**

⛔ **Neither agent edits `ds-bundle/` and neither adds to the DS.** Only Keith can, in his Claude Design
project. **So the deliverable from a build is the named queue item, not the DS change.**

**Currently queued.** `Expand`, two Control mode glyphs, and a `Shield` that cannot recolour. **Do not add a
fifth silently.**

---

## Sibling copies · the design system holds stale twins of shipped components

⛔ **The design system carries vendored sibling copies of components that have since shipped and evolved in
the repo.** `PlantCard`, `Sparkline`, `SeverityBadge`, `PlantMap` and `AlertStripRow` each exist three times.

**So "consult the template" on one of those means copying a stale version over a newer one, silently, because
both look plausible.**

✅ **The rule that resolves it.** **A template is the starting point for a component that does NOT exist in
the repo yet. Once a component exists in the repo, the repo is the port source.** You never port a template
into a second screen when a shipped implementation exists.

**The sync runs the other way at AREA BOUNDARIES.** The repo publishes its evolved components into the design
system, which then holds them as the new templates.

⭐ **When two slugs hold the same component, the COMPONENT NAMED slug beats the SURFACE NAMED slug.** A
standalone `ui-chip/` or `severity-system/` folder is canonical over a `domain-*` folder's local copy, because
the domain folder's copy was made to illustrate that surface rather than to define the component.

⛔ **Also read the right file when a NAME appears more than once.** Three files are called `Button.dc.html`
and only `form-controls/Button.dc.html` is the real one. **Before reading "the X template", file search X and
say how many exist.**

### Reaching the templates at all

⛔ **`design/templates/` is gitignored and untracked, so "consult the DS if present" silently evaluates to
"absent" whenever the check asks git rather than the filesystem.** That has caused at least two components to
be built from scratch when a template existed. **The files ARE on disk.** List the directory, do not ask git.

⛔ **Do NOT read the templates off `chore/ds-templates-reference` and do NOT check that branch out.** It is
frozen at July, it carries fewer files than the disk does, and **checking it out overwrites the on disk copies
with the July versions silently, with no diff and no warning.** A `git show` against it returns July content
and reports success, which is a stale read that announces nothing.

---

## Names that mislead

| You see | It actually is |
|---|---|
| `PlantPopover` in a design document | `PlantInfoWindow.tsx` in the repo. Same component, two names |
| DS `secondary` | a SOLID GREY FILL. Our secondary is the grey OUTLINE, which maps to the DS's `outline` |
| DS `loading` | our `pending`. It was in the DS all along and simply never built |
| `shadow-xs` | a **project** key in `theme/boxShadow.ts`, not Tailwind v4 naming |
| `#6B7177` | **two different meanings.** See `01-foundations.md` before touching it |
| `.claude/skills/` | **symlinks.** The source is `.agents/skills/` |

---

## Deliberate, do not "fix"

⛔ **`severityTally` has NO CALLER and is KEPT ON PURPOSE.** Its only consumer was a severity pill row that was
removed. Its delegation test still exercises it, so it is orphaned rather than rotting, and **Area 3's locked
spec requires exactly what it computes**, so it is pre committed.
⭐ **The rule that decides these is PROVENANCE. A helper the branch itself added goes with the thing it served.
A helper that predates the branch is a ruling, not a tidy up.**

⛔ **`plantTabs.ts` drops URL params on purpose.** A tab navigation rebuilds the query string and re-adds only
`from`, `to` and `utility_id`. That is the declared carriage for tab navigation. **Bounds are Home map state
and a plant page has no map that reads them.**
⭐ **The test for a REAL dropper is the CONSTRUCTOR'S ARGUMENT, not the word `new`.**
`new URLSearchParams(searchParams)` is a copy and loses nothing. **A bare `new URLSearchParams()` is the
rebuild.** The two genuine droppers are already filed as Bug 28. **Do not file a fifth.**

⛔ **The date heal in `Navbar.tsx` is deliberate and is NOT route gated.** It runs on every navigation and
restores **dates only**. Map bounds are not healed. **The cost is measurable and is the symptom people chase**,
a bare plant arrival fires 16 date bearing calls twice, because the first render goes out dateless and the heal
re-navigates. **The doubling is the symptom. The dropper is the cause.**

⛔ **`loadBalancingResult` is declared on TWO routes on purpose.** The network tab shows it twice and that is
correct. Each route has its own consumer and `useLoaderData` is route scoped, **so it is one endpoint called by
two routes, not one fetch shared between two consumers.** A tidy that deletes either declaration breaks a chart
on whichever tab was not opened.
⭐ **The general rule: a loader key leaves a route only when its LAST consumer on that route leaves.**

⛔ **NO APP WRITTEN RANGE CAN HAVE A FUTURE `to`, so do not add a third clamp.** Two clamps already exist and
**they sit on different sides**, one at write time and one at read time. **Reasoning from either alone gets the
behaviour wrong, which has already happened once.**

⛔ **The commit author being the placeholder `a <a@b>` is DELIBERATE, not a leak.** The person is attached at
the PR and the commits stay neutral. **Do not rewrite authors and do not flag it as a defect.**

⛔ **The one dependency pin in `package.json` is tied to the Docker base image**, and this is the only note
recording it beside the Dockerfile comment. **Remove it when the base image moves to Node 22 or later**, not
before.

⛔ **`border-[#CFE8F6]` on the map's Search This Area pill is a faithful port of the DS outline button, not a
stray hex.** Leave it. Do not "fix" it to a nearby token.

---

## Known shipped defects · filed, not yours to fix in passing

⛔ **There is no navigation below 1024px.** Full account in `07-layout.md`.

⛔ **The seven Trends charts carry 51 raw hexes.** Full account in `08-messaging-and-charts.md`.

⛔ **`app/components/Button/index.tsx` carries five findings in thirty lines.** Full account in
`05-buttons.md`.

⛔ **The 61 legacy gray hover declarations in GridGuardian, Settings and Configuration are FROZEN.** Bind new
work only, and **do not tidy a handful piecemeal** and leave an area half converted.

⛔ **Four `min-w-[1092px]` sites force page level horizontal scroll at 1280.** A laptop problem, not a phone
problem.

⛔ **122 px type arbitraries will not scale with a user's own text size.** The migration is separate work and
is still owed.

**The shape they share.** ⭐ **Each has an owner or a filed item. A partial drive-by fix does not reduce the
work, it makes the owning item's diff unreadable and hides what actually changed.**

---

## Two process traps that produce wrong work

⚠️ **AFTER REMOVING A THING, GREP FOR ITS NAME ACROSS THE TREE.** Three instances in one day where a deletion
left behind an assertion, an enumeration or a helper elsewhere that still described the old world, **and none
of the three was visible in the diff of the deletion**, because each lived in a file the change never touched.
**It applies to a RESTORATION too**, since a negative assertion about a removed thing is a claim with a shelf
life.

⚠️ **BEFORE GREPPING A BUILT ARTIFACT, KNOW WHAT THE BUILD DOES TO THE THING YOU ARE GREPPING FOR.** Tailwind
compiles a hex into an **rgb triple in the declaration** and keeps the hex only in the escaped **selector**.
So after a tokenisation, a grep for the old hex finds the stale selector and reports failure, while a grep for
the new token name finds nothing because it compiles to the same triple. **Grep the triple.**
⭐ **This also enables a PROOF rather than an assertion for any exact value migration.** Extract the multiset
of colour values from CSS declarations before and after and diff it. **An exact tokenisation must leave it byte
identical**, and pair it with a positive check that the new selectors exist and the old ones are gone, **or a
build that emitted nothing would also "pass"**.

---

## Changelog

- 2026-09-22: created from the full design-system read.
