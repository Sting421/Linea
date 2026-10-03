StatCard from reap. Use via `window.Reap.StatCard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StatCardProps {
label: string; value?: string | number | null; unit?: string; delta?: number | null; invertDelta?: boolean; chip?: React.ReactNode; headerAction?: React.ReactNode; headerChip?: React.ReactNode; wrapHeader?: boolean; note?: string; breakdown?: { tone: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly'; count?: number | null; label?: string }[]; facts?: { label: string; value?: string | number | null; unit?: string; note?: string; icon?: React.ReactNode }[]; factColumns?: 1 | 2 | 3 | 4 | '2-4'; tabularValues?: boolean; loading?: boolean; footer?: React.ReactNode; emptyLabel?: string; className?: string; look?: 'default' | 'home'
}
```

## Examples

### CapacityFacts

```jsx
() => (
  <div style={{ maxWidth: 720 }}>
    <StatCard
      label="Fleet capacity"
      facts={[
        { label: 'DC', value: 612.44, unit: 'kW' },
        { label: 'AC', value: 498, unit: 'kW' },
        { label: 'Storage', value: 120.5, unit: 'kWh' },
        { label: 'Export', value: 450, unit: 'kW' },
      ]}
    />
  </div>
)
```

### HeadlineWithDelta

```jsx
() => (
  <div style={row}>
    <StatCard label="Energy produced today" value={482} unit="kWh" delta={12} note="vs 410" />
    <StatCard label="Grid import" value={38} unit="kWh" delta={-9} note="vs 64" />
  </div>
)
```

### StatusBreakdown

```jsx
() => (
  <div style={{ maxWidth: 340 }}>
    <StatCard
      label="Status in view"
      value="12 of 48"
      unit="plants"
      breakdown={[
        { label: 'fault', count: 2, tone: 'fault' },
        { label: 'warning', count: 3, tone: 'warning' },
        { label: 'offline', count: 1, tone: 'offline' },
      ]}
    />
  </div>
)
```

### EmptyAndAbsent

```jsx
() => (
  <div style={row}>
    <StatCard label="Fleet capacity" value={null} />
    <StatCard label="Events" value={null} emptyLabel="Not reporting" />
    <StatCard
      label="Fleet capacity"
      facts={[
        { label: 'DC', value: 612.4, unit: 'kW' },
        { label: 'Storage', value: null, unit: 'kWh' },
      ]}
    />
  </div>
)
```
