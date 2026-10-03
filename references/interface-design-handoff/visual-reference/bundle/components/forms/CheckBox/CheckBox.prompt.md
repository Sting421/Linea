CheckBox from reap. Use via `window.Reap.CheckBox` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CheckBoxProps {
name: string; label: string; checked: boolean; onChange: (e?: any) => void
}
```

## Examples

### Checked

```jsx
() => {
  const [on, setOn] = useState(true);
  return <div style={{ maxWidth: 280 }}><CheckBox name="notify" label="Email me on plant alerts" checked={on} onChange={() => setOn(!on)} /></div>;
}
```

### Unchecked

```jsx
() => {
  const [on, setOn] = useState(false);
  return <div style={{ maxWidth: 280 }}><CheckBox name="beta" label="Enable beta dashboard" checked={on} onChange={() => setOn(!on)} /></div>;
}
```
