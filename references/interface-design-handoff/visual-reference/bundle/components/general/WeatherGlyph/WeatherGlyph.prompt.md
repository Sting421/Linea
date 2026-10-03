WeatherGlyph from reap. Use via `window.Reap.WeatherGlyph` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface WeatherGlyphProps {
weatherIcon?: string; size?: number; title?: string
}
```

## Examples

### EveryCondition

```jsx
() => (
  <div style={row}>
    <WeatherGlyph weatherIcon="01d" title="Clear" />
    <WeatherGlyph weatherIcon="02d" title="Partly cloudy" />
    <WeatherGlyph weatherIcon="04d" title="Overcast" />
    <WeatherGlyph weatherIcon="10d" title="Rain" />
  </div>
)
```

### Sizes

```jsx
() => (
  <div style={row}>
    <WeatherGlyph weatherIcon="01d" size={24} title="Clear" />
    <WeatherGlyph weatherIcon="01d" size={40} title="Clear" />
    <WeatherGlyph weatherIcon="01d" size={64} title="Clear" />
  </div>
)
```
