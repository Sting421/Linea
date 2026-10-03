Button from reap. Use via `window.Reap.Button` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ButtonProps {
variant?: 'save' | 'outline' | 'discard' | 'big_red'; onClick?: () => void; disabled?: boolean; className?: string; children?: React.ReactNode
}
```

## Examples

### Variants

```jsx
() => (
	<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
		<Button variant="save">Save changes</Button>
		<Button variant="outline">Outline</Button>
		<Button variant="discard">Discard</Button>
		<Button variant="big_red">Delete plant</Button>
		<Button>Default</Button>
	</div>
)
```

### Disabled

```jsx
() => (
	<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
		<Button variant="save" disabled>
			Save changes
		</Button>
		<Button variant="outline" disabled>
			Outline
		</Button>
		<Button variant="big_red" disabled>
			Delete plant
		</Button>
	</div>
)
```
