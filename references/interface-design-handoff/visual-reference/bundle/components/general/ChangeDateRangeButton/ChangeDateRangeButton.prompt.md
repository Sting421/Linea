ChangeDateRangeButton from reap. Use via `window.Reap.ChangeDateRangeButton` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => <ChangeDateRangeButton />
```

### InAnEmptyState

```jsx
() => (
  <div
    style={{
      maxWidth: 360,
      padding: 24,
      textAlign: 'center',
      borderRadius: 14,
      background: '#fff',
      boxShadow: '0 0 5px 0 #A3ABB940',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
    }}
  >
    <span style={{ fontSize: 13, color: '#6B7177' }}>No events in this date range.</span>
    <ChangeDateRangeButton />
  </div>
)
```
