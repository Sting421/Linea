AlertStripRow from reap. Use via `window.Reap.AlertStripRow` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AlertStripRowProps {
status: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly'; title: string; subtitle: string; detail?: string | null; time: string; count?: number; label?: string; to?: string
}
```

## Examples

### EveryStatus

```jsx
() => (
  <div style={card}>
    <AlertStripRow status="fault" title="Inverter 2 protection trip" subtitle="Riverside Solar" detail="Unit INV-02" time="4m ago" />
    <AlertStripRow status="warning" title="Grid voltage out of bounds" subtitle="Harbor Microgrid" time="22m ago" />
    <AlertStripRow status="anomaly" title="Output below the expected curve" subtitle="Desert Array" detail="12% under" time="1h ago" />
    <AlertStripRow status="offline" title="Meter stopped reporting" subtitle="Hill Site 3" time="3h ago" />
    <AlertStripRow status="normal" title="Plant back online" subtitle="Lakeside Storage" time="5h ago" />
  </div>
)
```

### CountAndLabel

```jsx
() => (
  <div style={card}>
    <AlertStripRow status="warning" title="Battery temperature high" subtitle="Harbor Microgrid" time="9m ago" count={3} />
    <AlertStripRow status="fault" title="Communication lost" subtitle="Desert Array" time="40m ago" count={12} label="Faults" />
  </div>
)
```
