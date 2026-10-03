InfoTooltip from reap. Use via `window.Reap.InfoTooltip` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InfoTooltipProps {
content: React.ReactNode
}
```

## Examples

### Default

```jsx
() => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: 14, color: '#444343' }}>State of charge</span>
    <InfoTooltip content="Percentage of usable battery capacity currently stored." />
  </div>
)
```
