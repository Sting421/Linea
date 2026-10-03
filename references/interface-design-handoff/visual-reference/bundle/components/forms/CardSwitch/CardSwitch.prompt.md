CardSwitch from reap. Use via `window.Reap.CardSwitch` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CardSwitchProps {
label: string; size?: 'sm' | 'md'; variant?: 'success' | 'base'; enable?: boolean; isLoading?: boolean; disabled?: boolean; onChange?: (...args: any) => void
}
```

## Examples

### Default

```jsx
() => (
  <div style={{ maxWidth: 320 }}>
    <CardSwitch label="Enable demand response" />
  </div>
)
```
