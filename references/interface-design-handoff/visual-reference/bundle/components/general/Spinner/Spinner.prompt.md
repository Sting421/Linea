Spinner from reap. Use via `window.Reap.Spinner` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface SpinnerProps {
message?: string; className?: string; ignoreContainerClass?: boolean
}
```

## Examples

### WithMessage

```jsx
() => (
	<div style={{ height: 140, border: '1px solid #E1EBEF', borderRadius: 8 }}>
		<Spinner message="Loading plant data…" />
	</div>
)
```
