ChartTooltip from reap. Use via `window.Reap.ChartTooltip` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ChartTooltipProps {
active?: boolean; payload?: any[]; label?: unknown; labelFormatter?: (label: any, datum?: any) => React.ReactNode; prefix?: string; unit?: string; extra?: (datum: any) => { name: string; value: unknown; color?: string; prefix?: string; unit?: string; display?: string; shape?: 'circle' | 'square'; status?: React.ReactNode }[]; groups?: { label: string; keys: string[]; total?: boolean }[]; rows?: (datum: any) => { name: string; value: unknown; color?: string; prefix?: string; unit?: string; display?: string; shape?: 'circle' | 'square'; status?: React.ReactNode }[]
}
```
