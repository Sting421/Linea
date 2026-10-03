StatusDot from reap. Use via `window.Reap.StatusDot` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StatusDotProps {
status: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly'; size?: 'sm' | 'md' | 'lg'; pulse?: boolean; label?: string; decorative?: boolean; className?: string
}
```

## Examples

### EveryStatus

```jsx
() => (
  <div style={row}>
    <StatusDot status="normal" label="Normal" />
    <StatusDot status="warning" label="Warning" />
    <StatusDot status="fault" label="Fault" />
    <StatusDot status="offline" label="Offline" />
    <StatusDot status="anomaly" label="Anomaly" />
  </div>
)
```

### Sizes

```jsx
() => (
  <div style={row}>
    <StatusDot status="normal" size="sm" label="Small" />
    <StatusDot status="normal" size="md" label="Medium" />
    <StatusDot status="normal" size="lg" label="Large" />
  </div>
)
```

### PulsingAndDecorative

```jsx
() => (
  <div style={row}>
    <StatusDot status="fault" pulse label="Live fault" />
    <StatusDot status="warning" decorative />
  </div>
)
```
