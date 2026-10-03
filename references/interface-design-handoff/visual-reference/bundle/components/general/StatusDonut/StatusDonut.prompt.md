StatusDonut from reap. Use via `window.Reap.StatusDonut` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StatusDonutProps {
counts: Record<'normal' | 'offline' | 'warning' | 'fault' | 'anomaly', number>; title?: string; help?: string; entityLabel?: string; populationLabel?: string; unavailable?: number; unavailableNote?: string; className?: string
}
```
