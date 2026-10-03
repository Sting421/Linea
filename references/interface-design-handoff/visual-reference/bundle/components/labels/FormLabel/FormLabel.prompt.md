FormLabel from reap. Use via `window.Reap.FormLabel` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface FormLabelProps {
label: string; isRequired?: boolean; className?: string
}
```

## Examples

### Labels

```jsx
() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <FormLabel label="Plant name" isRequired />
    <FormLabel label="Description" />
  </div>
)
```
