StatusBadge from reap. Use via `window.Reap.StatusBadge` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StatusBadgeProps {
status: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly'; variant?: 'solid' | 'soft' | 'outline' | 'soft-outline'; size?: 'xs' | 'sm' | 'md' | 'lg'; count?: number; label?: string; className?: string
}
```

## Examples

### EveryStatus

```jsx
() => (
  <div style={row}>
    <StatusBadge status="normal" />
    <StatusBadge status="warning" />
    <StatusBadge status="fault" />
    <StatusBadge status="offline" />
    <StatusBadge status="anomaly" />
  </div>
)
```

### Variants

```jsx
() => (
  <div style={row}>
    <StatusBadge status="fault" variant="solid" />
    <StatusBadge status="fault" variant="soft" />
    <StatusBadge status="fault" variant="outline" />
    <StatusBadge status="fault" variant="soft-outline" />
  </div>
)
```

### SizesWithCount

```jsx
() => (
  <div style={row}>
    <StatusBadge status="warning" size="xs" />
    <StatusBadge status="warning" size="sm" count={3} />
    <StatusBadge status="warning" size="md" count={12} />
    <StatusBadge status="warning" size="lg" count={104} label="Warnings" />
  </div>
)
```
