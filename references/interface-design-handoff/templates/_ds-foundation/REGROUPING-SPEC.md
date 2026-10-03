# Sidebar Re-grouping Spec — 6 groups → 9 groups

**Goal:** make the design-system browser's left sidebar show the 9 functional groups
(Foundations, Actions, Inputs & Form Controls, Navigation, Data Display, Feedback &
Status, Overlays, Containers & Layout, Domain) instead of the current 6
(forms, general, labels, stats, tables, tooltips).

This is a **repo-side change** — it cannot be done from inside the synced project. After
applying it in the `reap` repo, run `/design-sync` to regenerate the sidebar.

---

## How grouping works (confirmed from the synced source)

A component's group is set in **two places that must match**:

1. **Folder:** `components/<group>/<Name>/`
2. **Card comment:** line 1 of `components/<group>/<Name>/<Name>.html` —
   `<!-- @dsCard group="<group>" -->`

To move a component to a new group you must do **both**: move the folder, and edit the
`@dsCard group="…"` value to the new slug. (The `.jsx`, `.d.ts`, `.prompt.md` move with
the folder; only the `.html` comment needs editing.)

---

## Target groups (slug → sidebar label)

| Slug | Suggested label | Holds |
|---|---|---|
| `foundations` | Foundations | tokens, status palette, icons (net-new) |
| `actions` | Actions | Button |
| `inputs` | Inputs & Form Controls | fields, toggles, selects, labels |
| `navigation` | Navigation | Tabs, Pagination (net-new) |
| `data-display` | Data Display | tables, KPI tiles, charts, status cells |
| `feedback` | Feedback & Status | loading, empty, progress |
| `overlays` | Overlays | tooltips, dialogs, callouts, dropdowns |
| `layout` | Containers & Layout | Accordion, Carousel |
| `domain` | Domain | assembled Ovanova surfaces (templates) |

> **Label vs slug:** the current sidebar prints the raw slug (`forms`, `general`, …). If
> your sync config supports a per-group display title, set the labels above; otherwise the
> slug is what shows, so pick a slug you're happy reading.
>
> **Order:** the sidebar sorts groups alphabetically. To force the logical order above,
> either prefix slugs with a number (`1-foundations`, `2-actions`, …) or set an explicit
> order in the sync config. Without that, expect alphabetical.

---

## Moves for the 22 existing components

Each row: move the folder, then set `@dsCard group="<new>"` in that component's `.html`.

| Component | From | To | New `@dsCard group` |
|---|---|---|---|
| Button | `general/Button` | `actions/Button` | `actions` |
| Input | `general/Input` | `inputs/Input` | `inputs` |
| Radio | `general/Radio` | `inputs/Radio` | `inputs` |
| CardSwitch | `forms/CardSwitch` | `inputs/CardSwitch` | `inputs` |
| CheckBox | `forms/CheckBox` | `inputs/CheckBox` | `inputs` |
| CustomSwitch | `forms/CustomSwitch` | `inputs/CustomSwitch` | `inputs` |
| DateFilter | `forms/DateFilter` | `inputs/DateFilter` | `inputs` |
| SearchInput | `forms/SearchInput` | `inputs/SearchInput` | `inputs` |
| Select | `forms/Select` | `inputs/Select` | `inputs` |
| FormLabel | `labels/FormLabel` | `inputs/FormLabel` | `inputs` |
| BasicTable | `tables/BasicTable` | `data-display/BasicTable` | `data-display` |
| SimpleTable | `tables/SimpleTable` | `data-display/SimpleTable` | `data-display` |
| UtilityTimeOfUseTable | `tables/UtilityTimeOfUseTable` | `data-display/UtilityTimeOfUseTable` | `data-display` |
| ChartLabel | `labels/ChartLabel` | `data-display/ChartLabel` | `data-display` |
| StatBox | `stats/StatBox` | `data-display/StatBox` | `data-display` |
| ErrorElement | `general/ErrorElement` | `feedback/ErrorElement` | `feedback` |
| Spinner | `general/Spinner` | `feedback/Spinner` | `feedback` |
| HelperDialog | `general/HelperDialog` | `overlays/HelperDialog` | `overlays` |
| GraphTooltip | `tooltips/GraphTooltip` | `overlays/GraphTooltip` | `overlays` |
| InfoTooltip | `tooltips/InfoTooltip` | `overlays/InfoTooltip` | `overlays` |
| Accordion | `general/Accordion` | `layout/Accordion` | `layout` |
| Carousel | `general/Carousel` | `layout/Carousel` | `layout` |

After these moves the **old folders `forms/`, `general/`, `labels/`, `stats/`, `tables/`,
`tooltips/` are empty and should be deleted.**

### Resulting distribution (existing components only)
- **actions** (1): Button
- **inputs** (9): Input, Radio, CardSwitch, CheckBox, CustomSwitch, DateFilter, SearchInput, Select, FormLabel
- **data-display** (5): BasicTable, SimpleTable, UtilityTimeOfUseTable, ChartLabel, StatBox
- **feedback** (2): ErrorElement, Spinner
- **overlays** (3): HelperDialog, GraphTooltip, InfoTooltip
- **layout** (2): Accordion, Carousel
- **foundations / navigation / domain**: 0 existing — populated by net-new builds (below)

---

## Net-new components — which group they join when built

These don't exist in the repo bundle yet (built hi-fi as templates in this project; see
`FAMILY-BUILD-SPEC.md` for repo build instructions). When you build them as real
`components/<group>/<Name>/`, use these groups so they land correctly:

- **foundations:** StatusDot, SeverityBadge*, icon set, design tokens
- **inputs:** Calendar, Switch
- **navigation:** Tabs, Pagination
- **data-display:** ComplexTable, Tag, Avatar, StatTile, chart primitives *(SeverityBadge may live here instead of foundations — your call)*
- **feedback:** Progress
- **overlays:** Tooltip, Callout, Dropdown
- **domain:** the assembled surfaces (PlantShell, PlantMap, PowerFlow, Scheduler, IncidentConsole, NotificationInbox) — these are template-level compositions, not atomic components; keep as templates unless you want them as cards.

---

## Apply checklist

1. For each row above: `git mv` the folder, then edit line 1 of the `.html`
   (`@dsCard group="…"`).
2. Delete the now-empty `forms/ general/ labels/ stats/ tables/ tooltips/` folders.
3. (Optional) set per-group display labels and/or numeric ordering in the sync config.
4. Run `/design-sync` → the sidebar regenerates into the 9 groups.

Until this is applied and re-synced, the grouped experience lives in
`Ovanova Design System.html` (the branded showcase document).
