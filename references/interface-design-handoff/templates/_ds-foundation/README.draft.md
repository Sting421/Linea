# Ovanova IoT Design System (reap)

The component library behind the Ovanova Microgrid Platform. Plain **React + Tailwind**
components from the `reap` Remix app — **no theme provider or root wrapper to mount**.
Styling comes entirely from the bundled stylesheet (`styles.css`, which `@import`s the
compiled Tailwind utilities + component CSS). Render any component directly; it is styled
as soon as `styles.css` is on the page.

> **Looking for the visual reference?** Open **`Ovanova Design System.html`** — the
> branded, grouped showcase with every component rendered live. That is the document to
> review and send; this README is the build guide.

---

## What's inside

This system covers **Areas 1–3** of the Dashboard Requirements (Fleet Overview; Plant
Detail & Power Flow; Alerts & Events). It contains:

- **22 upstream `reap` components**, evolved to the current brand.
- **Net-new components** built to fill gaps (status indicators, severity badge, calendar,
  pagination, tags, callouts, complex tables, and the assembled domain surfaces).
- **A keystone Status & Severity system** — the shared palette + `SeverityBadge` every
  alert, dot, and KPI reads from.

### Maturity legend

| Badge | Meaning |
|---|---|
| **Existing** | Ships in `reap` today, used as-is. |
| **Evolved** | Existing component reskinned to the current brand tokens. |
| **Net-new** | Built here to fill a gap; ready for repo adoption. |
| **Provisional** | Built hi-fi but pending a product decision (per-mode controls, the Area 3 lifecycle). |

---

## The 9 component groups

1. **Foundations** — tokens, the keystone status palette, icons.
2. **Actions** — Button and primary action affordances.
3. **Inputs & Form Controls** — fields, toggles, selects, date controls, calendar.
4. **Navigation** — Tabs, Pagination.
5. **Data Display** — tables, KPI tiles, charts, status indicators.
6. **Feedback & Status** — Spinner, ErrorElement, Progress.
7. **Overlays** — tooltips, callouts, dropdowns, help dialogs.
8. **Containers & Layout** — Accordion, Carousel.
9. **Domain (Ovanova)** — assembled area surfaces: plant shell, fleet map, power flow,
   scheduler, incident console, notification inbox.

---

## Styling idiom — Tailwind utilities + the `hue-*` palette

Style your own layout/glue with Tailwind utility classes. This system extends Tailwind
with a custom brand palette (use as `bg-*`, `text-*`, `border-*`, `ring-*`):

| Family | Shades | Typical use |
|---|---|---|
| `hue-sky` | 50, 100, 300, 500, 600, 800, 900 | primary brand blue — `bg-hue-sky-800` is the primary action, `hue-sky-900` for headings |
| `hue-neutral` | 300, 400, 500, 600, 700 | body & secondary text |
| `hue-slate` | 100, 200, 300, 400 | borders, dividers, muted surfaces |
| `hue-zinc` | 300, 400, 500, 600, 800 | dark text / neutral UI |
| `hue-green` | 500 | success / positive trend |
| `hue-red` | 400, 600 | danger / destructive (`big_red`) |
| `hue-orange` + accents | `hue-orange` 50/300 · `hue-ember` 300 · `hue-rose` 50 · `hue-stone` 50 · `hue-gray` 300 | accents / warnings / tints |

Standard Tailwind colors (`gray-*`, `indigo-*`, `red-*`, `green-*`, `blue-*`) are also
used throughout and are available to you.

**Do not invent classes outside Tailwind + this palette.** A few shipped components
reference legacy names that are NOT in this theme (`input-primary`, `text-highlight-*`,
`accent-primary`, `bg-highlight-*`, `size-26.1`, `rounded-4.1`, `shadow-200`); those
render unstyled in the real app too — don't imitate them.

---

## Loading

React must be on the page first, then add these two lines once:

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.Reap.*`. Mount into a dedicated child node so the
two React trees don't collide:

```jsx
const { Accordion } = window.Reap;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Accordion />);
```

---

## Idiomatic snippet

```tsx
<div className="rounded-md bg-white shadow-500 p-6 space-y-4">
  <h2 className="text-lg font-semibold text-hue-sky-900">Plant overview</h2>
  <StatBox item={{ name: 'Energy produced today', stat: '482 kWh',
                   previousStat: '410 kWh', change: '12%', changeType: 'increase' }} />
  <div className="flex gap-3">
    <Button variant="save">Export data</Button>
    <Button variant="outline">Filter</Button>
  </div>
</div>
```

---

## Where the truth lives

- **`Ovanova Design System.html`** — the live, grouped visual reference (send this).
- `styles.css` and its imports — the exact compiled utilities/palette.
- `components/<group>/<Name>/` — each component's `.prompt.md` (usage), `.d.ts` (prop
  contract), and `.html` (variant grid).
- `_ds_bundle.js` — the whole-DS browser bundle (`window.Reap`).
- `templates/` — reusable starting points (the domain surfaces, evolved components, the
  status/severity system).

> Note: the auto-generated `--tw-*` entries in the token list are Tailwind's internal
> runtime variables, not brand tokens — ignore them when picking colors; use the `hue-*`
> palette above.
