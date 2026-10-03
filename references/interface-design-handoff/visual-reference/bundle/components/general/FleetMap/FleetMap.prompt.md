FleetMap from reap. Use via `window.Reap.FleetMap` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface FleetMapProps {
styleUrl: string; bounds?: { swLat: number; swLng: number; neLat: number; neLng: number } | null; fitKey?: string | number; fitPadding?: number | { top: number; right: number; bottom: number; left: number }; instantFirstFit?: boolean; maxZoom?: number; instantFit?: boolean; interactive?: boolean; showNavControl?: boolean; onMoveEnd?: (bounds: { swLat: number; swLng: number; neLat: number; neLng: number }) => void; onSearchArea?: (bounds: { swLat: number; swLng: number; neLat: number; neLng: number }) => void; onMapReady?: () => void; ariaLabel?: string; className?: string; children?: React.ReactNode
}
```

## Examples

### EmptyMapCanvas

```jsx
() => (
  <div style={{ maxWidth: 640 }}>
    <FleetMap styleUrl={blankStyle} className="h-[320px] rounded-[14px]" />
    <div style={{ marginTop: 8, fontSize: 12, color: '#6B7177' }}>
      The map canvas with no tiles. Tiles need a map key, so this shows the empty container.
    </div>
  </div>
)
```

## Related

`FleetMapPopup`
