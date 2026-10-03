# Ovanova IoT Design System (reap) — how to build with it

These components come from the Ovanova IoT (`reap`) Remix app. They are plain
**React + Tailwind** components — there is **no theme provider or root wrapper to
mount**. Styling comes entirely from the bundled stylesheet (`styles.css`, which
`@import`s the compiled Tailwind utilities + component CSS). Render any component
directly; it is styled as soon as `styles.css` is on the page.

## Styling idiom — Tailwind utilities + the `hue-*` palette

Style your own layout/glue with Tailwind utility classes. This system extends
Tailwind with a custom brand palette (use these as `bg-*`, `text-*`, `border-*`,
`ring-*`):

| Family | Shades available | Typical use |
|---|---|---|
| `hue-ink` | 50, 100, 175, 200, 300, 400, 500, 600, 700, 800, 900, 950 | the canonical neutral for text, borders and surfaces, use it for every new neutral |
| `hue-sky` | 50, 100, 300, 500, 600, 800, 900 | primary brand blue — `bg-hue-sky-800` is the primary action color, `hue-sky-900` for headings |
| `hue-neutral` | 300, 400, 500, 600, 700 | deprecated near miss neutral, use `hue-ink`. Older body and secondary text |
| `hue-slate` | 100, 200, 300, 400 | deprecated near miss neutral, use `hue-ink`. Older borders, dividers, muted surfaces |
| `hue-zinc` | 300, 400, 500, 600, 800 | deprecated near miss neutral, use `hue-ink`. Older dark text and neutral UI |
| `hue-green` | 50, 500, 700 | success / positive trend |
| `hue-red` | 50, 400, 600, 700 | danger / destructive (`big_red`) |
| `hue-orange` | 50, 300 · `hue-ember` 300 · `hue-rose` 50 · `hue-stone` 50 (deprecated near miss neutral, use `hue-ink`) · `hue-gray` 300 | accents / warnings / tints |

Standard Tailwind colors (`gray-*`, `indigo-*`, `red-*`, `green-*`, `blue-*`) are
also used throughout the components and are available to you.

### Status palette

Canonical operational-status tokens (use for status-colored UI only — badges,
pins, donut segments, event severity; not for generic accents). Four tiers per
status: `status-{x}` (solid), `status-{x}-soft`, `status-{x}-text`,
`status-{x}-border` — per AREA-BUILD-GUIDE §1:

| Status | solid | soft | text | border | Meaning |
|---|---|---|---|---|---|
| `status-normal` | #009DE4 | #E6F7FF | #03587F | #8AD9FD | plant/device healthy (includes "online") |
| `status-warning` | #E08600 | #FFF4E2 | #8F5500 | #F8D399 | electrical/grid condition out of bounds |
| `status-anomaly` | #8B5CF6 | #F1EAFE | #5B21B6 | #C9B2FA | computed operational anomaly (derived; violet is anomaly-only) |
| `status-offline` | #6B7177 | #EEF0F1 | #474C51 | #CDD1D4 | not reporting |
| `status-fault` | #D92D20 | #FDECEA | #9E1B12 | #F4B5AE | hardware/protection fault |

Severity order everywhere: fault → anomaly → warning → offline → normal
(DR precedence; the AREA-BUILD-GUIDE §1 order is outdated pending a DS-side update).
Chips/badges use soft bg + text ink (+ border tier for rings); dots and pins
use the solid tier.

Use as `bg-status-fault`, `text-status-warning`, `fill-status-normal`, etc. For
chart fills that need raw hex (Recharts), read them via `statusToHex` from
`app/utils/status.ts` rather than hardcoding.

**Do not invent classes outside Tailwind + this palette.** A few shipped
components reference legacy utility names that are NOT defined in this theme
(`input-primary`, `text-highlight-*`, `accent-primary`, `bg-highlight-*`,
`size-26.1`, `rounded-4.1`, `shadow-200`); those render unstyled in the real app
too — don't imitate them.

## Component usage notes

- **Button** — `variant`: `save` (primary blue), `outline`, `discard`, `big_red`
  (destructive). Pass `children` for the label, `onClick`, `disabled`.
- **Input** — pass `label`, `placeholder`, `type`, `error` (renders an error
  message), `value`. Has a built-in show/hide toggle for `type="password"`.
- **StatBox** — KPI tile: `item={{ name, stat, previousStat?, change?, changeType? }}`
  where `changeType` is `'increase' | 'decrease'` (green ↑ / red ↓ badge).
- **Accordion** — controlled: pass `items`, `openIndex`, and `setOpenIndex`
  (you own the open-index state).
- **BasicTable** / **UtilityTimeOfUseTable** — data tables; pass `tableColumns`
  (TanStack `ColumnDef[]`) + `tableData`, or `timeOfUseData` respectively.
- **CheckBox / Radio / Select / CardSwitch / CustomSwitch / SearchInput /
  DateFilter** — form controls; see each component's `.prompt.md` + `.d.ts`.

## Where the truth lives

Read `styles.css` and its imports for the exact compiled utilities/palette, and
each component's `<Name>.d.ts` (its prop contract) and `<Name>.prompt.md` (usage)
before composing.

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
