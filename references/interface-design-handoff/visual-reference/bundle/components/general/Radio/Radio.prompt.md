Radio from reap. Use via `window.Reap.Radio` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface RadioProps {
variant?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'base'; label?: string; name?: string; id?: string; checked?: boolean; disabled?: boolean; readOnly?: boolean; autoFocus?: boolean; error?: string; className?: string; wrapperClassName?: string; [key: string]: any
}
```

## Examples

### Group

```jsx
() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Radio name="mode" id="r-auto" label="Automatic" defaultChecked />
    <Radio name="mode" id="r-manual" label="Manual" />
    <Radio name="mode" id="r-off" label="Disabled" disabled />
  </div>
)
```

### Variants

```jsx
() => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Radio name="v1" id="v-primary" label="Primary" variant="primary" defaultChecked />
    <Radio name="v2" id="v-success" label="Success" variant="success" defaultChecked />
    <Radio name="v3" id="v-error" label="Error" variant="error" defaultChecked />
  </div>
)
```
