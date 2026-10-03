Input from reap. Use via `window.Reap.Input` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputProps {
label?: string; type?: 'text' | 'search' | 'email' | 'number' | 'textarea' | 'tel' | 'password' | 'checkbox' | 'file'; size?: 'md' | 'lg' | 'sm' | 'xs'; variant?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'; fullWidth?: boolean; bordered?: boolean; disabled?: boolean; readOnly?: boolean; autoFocus?: boolean; placeholder?: string; name?: string; id?: string; value?: any; defaultValue?: any; error?: any; isVerified?: boolean; prefix?: React.ReactNode; suffix?: React.ReactNode; [key: string]: any
}
```

## Examples

### WithLabel

```jsx
() => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
		<Input label="Plant name" placeholder="e.g. Riverside Solar" id="plant-name" />
		<Input label="Capacity (kW)" type="number" placeholder="0" id="capacity" />
	</div>
)
```

### States

```jsx
() => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
		<Input label="Email" type="email" value="ops@ovanova.co" id="email" />
		<Input label="Site code" value="INVALID" error="Site code not recognised" id="site" />
		<Input label="Disabled" value="Read only" disabled id="disabled" />
	</div>
)
```

### Password

```jsx
() => (
	<div style={{ maxWidth: 320 }}>
		<Input label="Password" type="password" value="supersecret" id="pw" />
	</div>
)
```
