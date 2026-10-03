StatBox from reap. Use via `window.Reap.StatBox` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StatBoxProps {
item: { name: string; stat: string | number; previousStat?: string | number; change?: string; changeType?: 'increase' | 'decrease' }
}
```

## Examples

### Increase

```jsx
() => (
	<div style={{ maxWidth: 320 }}>
		<StatBox item={{ name: 'Energy produced today', stat: '482 kWh', previousStat: '410 kWh', change: '12%', changeType: 'increase' }} />
	</div>
)
```

### Decrease

```jsx
() => (
	<div style={{ maxWidth: 320 }}>
		<StatBox item={{ name: 'Grid import', stat: '38 kWh', previousStat: '64 kWh', change: '9%', changeType: 'decrease' }} />
	</div>
)
```

### Plain

```jsx
() => (
	<div style={{ maxWidth: 320 }}>
		<StatBox item={{ name: 'Active inverters', stat: '12' }} />
	</div>
)
```
