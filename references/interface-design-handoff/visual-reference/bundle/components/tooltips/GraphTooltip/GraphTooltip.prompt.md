GraphTooltip from reap. Use via `window.Reap.GraphTooltip` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface GraphTooltipProps {
name?: string; graphData: any
}
```

## Examples

### SolarPoint

```jsx
() => (
  <GraphTooltip name="Solar output" graphData={{ payload: [{ name: 'Solar output', value: '4.2 kW', payload: { fill: '#009DE4' } }] }} />
)
```

### BatteryPoint

```jsx
() => (
  <GraphTooltip graphData={{ payload: [{ name: 'Battery', value: '78%', payload: { fill: '#3DCE54' } }] }} />
)
```
