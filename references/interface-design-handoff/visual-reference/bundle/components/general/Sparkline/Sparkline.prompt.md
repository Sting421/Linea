Sparkline from reap. Use via `window.Reap.Sparkline` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface SparklineProps {
values?: number[]; color?: string; className?: string
}
```

## Examples

### Default

```jsx
() => (
  <div style={box}>
    <Sparkline />
  </div>
)
```

### CustomValuesAndColour

```jsx
() => (
  <div style={{ display: 'flex', gap: 24 }}>
    <div style={box}>
      <Sparkline values={[12, 18, 15, 22, 30, 28, 36, 41, 39, 47]} />
    </div>
    <div style={box}>
      <Sparkline values={[48, 44, 46, 38, 35, 30, 31, 24, 20, 18]} color="#E08600" />
    </div>
  </div>
)
```
