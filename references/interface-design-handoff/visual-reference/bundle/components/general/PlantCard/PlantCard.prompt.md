PlantCard from reap. Use via `window.Reap.PlantCard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface PlantCardProps {
name: string; status: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly' | null; href: string; detail?: React.ReactNode; photo?: string | null; accent?: string; flat?: boolean; anchor?: 'card' | 'title' | 'arrow'; metrics?: { label: string; value: string | null; tone?: 'default' | 'power' | 'saved'; icon?: React.ReactNode }[]; metricColumns?: 2 | 3; meta?: string | null; statusFallback?: React.ReactNode; soc?: number | null; focused?: boolean; onFocusPlant?: () => void; onActivate?: () => void; activateLabel?: string; arrow?: React.ReactNode; readout?: React.ReactNode; className?: string
}
```
