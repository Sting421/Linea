GraphWrapper from reap. Use via `window.Reap.GraphWrapper` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface GraphWrapperProps {
children: any; title?: any; subtitle?: any; className?: any; titleClassName?: any; helperContent?: any; helperTone?: 'light' | 'dark'
}
```

## Examples

### TitleAndSubtitle

```jsx
() => (
  <div style={{ maxWidth: 560 }}>
    <GraphWrapper title="Energy produced" subtitle="Last 24 hours">
      <div style={area}>Chart area</div>
    </GraphWrapper>
  </div>
)
```

### WithHelpTip

```jsx
() => (
  <div style={{ maxWidth: 560 }}>
    <GraphWrapper title="Grid import" subtitle="Rolling 7 days" helperContent="Energy drawn from the grid, summed per hour.">
      <div style={area}>Chart area</div>
    </GraphWrapper>
  </div>
)
```
