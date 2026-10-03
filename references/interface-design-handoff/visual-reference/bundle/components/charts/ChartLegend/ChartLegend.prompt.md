ChartLegend from reap. Use via `window.Reap.ChartLegend` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ChartLegendProps {
items: { key: string; name: string; source?: string; value?: string; color: string; opacity?: number; shape?: 'circle' | 'square'; status?: React.ReactNode }[]; hidden?: string[]; focused?: string | null; orientation?: 'row' | 'column'; readOnly?: boolean; onToggle?: (key: string) => void; onFocus?: (key: string | null) => void; className?: string
}
```
