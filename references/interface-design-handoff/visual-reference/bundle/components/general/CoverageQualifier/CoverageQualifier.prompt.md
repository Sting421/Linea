CoverageQualifier from reap. Use via `window.Reap.CoverageQualifier` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CoverageQualifierProps {
reporting?: number | null; total?: number | null; sampled?: number | null; partial?: boolean; noun?: string; warnBelow?: number; forceWarn?: boolean; className?: string
}
```

## Examples

### HealthyAndBelowThreshold

```jsx
() => (
  <div style={row}>
    <CoverageQualifier reporting={46} total={48} />
    <CoverageQualifier reporting={38} total={48} />
    <CoverageQualifier reporting={12} total={48} forceWarn noun="plants reporting" />
  </div>
)
```

### PartialAndNoData

```jsx
() => (
  <div style={row}>
    <CoverageQualifier reporting={100} total={240} sampled={100} partial />
    <CoverageQualifier reporting={null} total={null} />
  </div>
)
```
