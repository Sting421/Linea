ErrorElement from reap. Use via `window.Reap.ErrorElement` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ErrorElementProps {
message: string
}
```

## Examples

### NoData

```jsx
() => (
  <div style={{ height: 120, border: '1px solid #E1EBEF', borderRadius: 8 }}>
    <ErrorElement message="No data available!" />
  </div>
)
```
