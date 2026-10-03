Accordion from reap. Use via `window.Reap.Accordion` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AccordionProps {
items: { title: string; content: React.ReactNode }[]; openIndex: number | null; setOpenIndex: React.Dispatch<React.SetStateAction<number | null>>
}
```

## Examples

### Default

```jsx
() => {
	const [openIndex, setOpenIndex] = useState<number | null>(0);
	return (
		<div style={{ maxWidth: 480 }}>
			<Accordion items={items} openIndex={openIndex} setOpenIndex={setOpenIndex} />
		</div>
	);
}
```

### AllCollapsed

```jsx
() => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	return (
		<div style={{ maxWidth: 480 }}>
			<Accordion items={items} openIndex={openIndex} setOpenIndex={setOpenIndex} />
		</div>
	);
}
```
