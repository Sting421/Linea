ChartLabel from reap. Use via `window.Reap.ChartLabel` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ChartLabelProps {
variant: 'blue' | 'yellow' | 'grey' | 'red' | 'orange' | 'green'; label: string
}
```

## Examples

### AllVariants

```jsx
() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <ChartLabel variant="blue" label="Solar production" />
    <ChartLabel variant="green" label="Battery charge" />
    <ChartLabel variant="orange" label="Grid import" />
    <ChartLabel variant="red" label="Peak demand" />
    <ChartLabel variant="yellow" label="Self-consumption" />
    <ChartLabel variant="grey" label="Offline" />
  </div>
)
```
