PreviewCard from reap. Use via `window.Reap.PreviewCard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface PreviewCardProps {
title: string; state?: 'live' | 'placeholder'; value?: string | number | null; unit?: string; delta?: number | null; invertDelta?: boolean; help?: string; eyebrow?: string; caption?: string; sparkline?: React.ReactNode; loading?: boolean; loadingLabel?: string; href?: string; linkLabel?: string; emptyLabel?: string; className?: string
}
```

## Examples

### AreaOneInstances

```jsx
() => (
  <div style={row}>
    <PreviewCard
      title="Grid condition"
      value={49.98}
      unit="Hz"
      caption="Rolling 24h · 128 sites"
      sparkline={<Trend />}
    />
    <PreviewCard
      title="Financial impact"
      state="placeholder"
      caption="Savings and tariff impact"
    />
  </div>
)
```

### LiveDeepLinks

```jsx
() => (
  <div style={row}>
    <PreviewCard title="Estimated savings" value="$1,284" caption="This month" href="/savings" />
    <PreviewCard title="Events" value={12} caption="Last 7 days" href="/events" sparkline={<Trend />} />
  </div>
)
```

### EmptyAndZero

```jsx
() => (
  <div style={row}>
    <PreviewCard title="Grid condition" value={null} caption="Rolling 24h" href="/grid" />
    <PreviewCard title="Events" value={null} emptyLabel="No events in range" href="/events" />
    <PreviewCard title="Curtailment events" value={0} caption="Zero is a value, not empty" href="/events" />
  </div>
)
```
