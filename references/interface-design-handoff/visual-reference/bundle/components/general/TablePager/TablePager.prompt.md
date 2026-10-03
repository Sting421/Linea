TablePager from reap. Use via `window.Reap.TablePager` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface TablePagerProps {
page: number; pageSize: number; total: number | null; hasNext?: boolean; sizes?: number[]; showRange?: boolean; range?: string | null; onPage: (page: number) => void; onPageSize: (size: number) => void
}
```

## Examples

### FirstPage

```jsx
() => (
  <div style={frame}>
    <TablePager page={1} pageSize={10} total={106} onPage={noop} onPageSize={noop} />
  </div>
)
```

### MiddlePageWithGap

```jsx
() => (
  <div style={frame}>
    <TablePager page={6} pageSize={10} total={106} onPage={noop} onPageSize={noop} />
  </div>
)
```

### LastPagePartial

```jsx
() => (
  <div style={frame}>
    <TablePager page={11} pageSize={10} total={106} onPage={noop} onPageSize={noop} />
  </div>
)
```

### OnePage

```jsx
() => (
  <div style={frame}>
    <TablePager page={1} pageSize={10} total={8} onPage={noop} onPageSize={noop} />
  </div>
)
```

### UnknownTotal

```jsx
() => (
  <div style={frame}>
    <TablePager page={2} pageSize={25} total={null} hasNext onPage={noop} onPageSize={noop} />
  </div>
)
```

### RangeHidden

```jsx
() => (
  <div style={frame}>
    <TablePager page={3} pageSize={10} total={106} showRange={false} onPage={noop} onPageSize={noop} />
  </div>
)
```
