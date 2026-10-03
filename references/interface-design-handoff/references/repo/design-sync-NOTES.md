# design-sync notes — Ovanova IoT Design System (reap)

Repo-specific gotchas for `/design-sync`. Read before any re-sync.

## Repo shape
- This is a **Remix application**, not a packaged component library. There is no
  component `dist/` and no build that produces one. We run the converter in
  **package shape with a hand-authored barrel entry** (`.design-sync/entry.tsx`)
  passed via `cfg.entry`, because the repo ships components as `export default`
  (a few are named) — `export *` synth-entry cannot surface defaults on
  `window.Reap.*`.
- Component names + grouping come from `cfg.componentSrcMap` (explicit, since
  there is no `.d.ts` export tree to discover from).

## CSS / tokens
- Styling is **Tailwind**, and `app/tailwind.css` is uncompiled (`@tailwind`
  directives only). We compile a real stylesheet via `cfg.buildCmd`
  (`.design-sync/tailwind.config.ts` → `.design-sync/.cache/ds-tailwind.css`)
  and point `cfg.cssEntry` at it. **Re-run `cfg.buildCmd` before every
  `package-build.mjs`** — especially after authoring/editing previews, so
  preview-only utility classes land in the compiled CSS.
- The DS Tailwind config widens `content` to include `.design-sync/previews/**`
  and `.design-sync/entry.tsx` on top of `app/**` and `icons/**`.

## Known unstyled classes (real shipped state — not a sync bug)
- Several components reference utility classes that are **not defined** in this
  Tailwind theme (legacy/DaisyUI-style leftovers), so they render partially
  unstyled in BOTH the app and the previews. Do not try to "fix" these — they
  are the real shipped code. Examples seen: `input`, `input-primary`,
  `input-md`, `text-highlight-700`, `text-error-500`, `accent-primary`,
  `bg-gray-2000`, `text-primary-0`, `size-26.1`, `text-base-lg`,
  `bg-highlight-100`, `rounded-4.1`, `shadow-200`.
  - Affected: `Input`, `Radio`, `ChartLabel`, `GraphTooltip` (at least).

## Wave plan
- Wave 1 (current `entry.tsx`): presentational set that bundles + renders without
  app data/routing/maps. Some still need context at render and will floor-card:
  `SimpleTable`/`BasicTable` (Remix `Link`/`useSearchParams`), `DateFilter`
  (Popover), `HelperDialog` (Dialog overlay), `Carousel`.
- Later waves: Charts (recharts + Remix), ConfigurationTable, GoogleMaps, Maps
  (mapbox-gl — verify it doesn't break the IIFE at load), Modals, Photos,
  Graphs, Utility. Add to `entry.tsx` + `componentSrcMap`; if one breaks the
  whole bundle build, exclude it (`componentSrcMap: {Name: null}` won't help a
  barrel export — remove the export line) and record here.
- Wave 2 and 3 first built 2026-10-02 from the replayed merge of the fifteen open
  pull requests (tree b44c0be3e462bb897f00ce85af9c1fe12753095b), 43 components,
  `window.Reap` 43 exports, `_ds_bundle.js` 3,497,541 bytes (it was 1,026,830 at
  22 components, the growth came in with the charts and the map, the share per
  library was not measured).
  Added to the original 22 (minus HelperDialog): StatusBadge, StatusDot,
  StatusDonut, CoverageQualifier, Sparkline, FleetMap, PreviewCard, StatCard,
  TablePager, AlertStripRow, ChangeDateRangeButton, ChartLegend, ChartTooltip,
  Donut, ErrorScreen, GraphWrapper, HelpHint, LiveLineChart, PlantCard,
  PlantInfoWindow, FleetMapPopup and WeatherGlyph.
- Seven components were built, then taken out of the bundle on 2026-10-02 because a
  design cannot use them standalone, and they stay out until they have a story that
  does not need a Remix data router. DurationOfBlackoutsGraph,
  FinancialImpactAnalysisGraph, LoadShiftingAreaGraph, LoadBalancingBarGraph and
  PowerFlowChartWrapper take no props and read `useLoaderData`. UtilitySelect and
  PlantTypeahead need the router. Their sources are unchanged in the repo.
- Guidelines are retired. `guidelinesGlob` is `[]`, so nothing under `docs/` is ever
  published, and the project's two old guidelines files are in the upload's deletes
  (`guidelines/index.md`, `guidelines/docs/grid-guardian.md`). Never build in a folder
  that has a `docs/` with the default glob, it would publish every `docs/*.md`.
- HelperDialog was removed. The component was deleted from the repo on 2026-09-17
  (af51d46a, AB#1004) so its entry line, map entry and preview are gone, and the
  re-sync deletes its six files from the project.

## Floor cards and near-empty renders on the 2026-10-02 build
- 12 components ship the floor card because they need data, a router or props the
  converter cannot invent: Carousel, SimpleTable, ChartLegend, ChartTooltip, Donut,
  ErrorScreen, FleetMapPopup, HelpHint, LiveLineChart, PlantCard, PlantInfoWindow
  and StatusDonut. Authoring them is the next step and the data bound ones need a
  decision on how to supply a router first.
- Authored on 2026-10-02. First StatusBadge, StatusDot and WeatherGlyph because the
  render check flagged them, then AlertStripRow, GraphWrapper,
  ChangeDateRangeButton, CoverageQualifier, FleetMap and Sparkline, which painted
  almost nothing with default props. FleetMap's preview is a blank style canvas with
  a caption, because tiles need a key. PreviewCard's preview lost its dead
  `pendingNote` prop, which had leaked into `PreviewCard.prompt.md`.

## Contract drift (dtsPropsFor is hand written, so it rots)
- Every `dtsPropsFor` entry was compared against the source on the merged tree with
  the TypeScript checker (name, optionality and literal union values). Corrected:
  StatusBadge (variant soft-outline, size xs), StatusDot (pulse, label, decorative),
  CoverageQualifier (sampled, partial), StatusDonut (the filter props were removed
  from the component), StatCard, PreviewCard, FleetMap, GraphTooltip.
- Left alone on purpose: Button (its source types props as `any`), Input (`className`
  sits under the index signature), CardSwitch (`label` is optional on the function
  and required in the unused `ICardSwitch`).
- Re-run that comparison whenever a component in `componentSrcMap` changes. The
  script is `props-drift.cjs` in `docs/agent-mail/from-code/design-sync-tools/` of
  the main folder (local only, gitignored) and takes the build tree root as its
  argument.

## Build environment, 2026-10-02
- No Playwright chromium was cached, so validate and capture ran against Edge
  through `DS_CHROMIUM_PATH` (Edge 154.0.4258.48 at
  `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`), no download.
- The staged `.ds-sync/` from 2026-08-02 was stale (real code differences, not line
  endings). It was re-copied from the current skill before the build.
- The brand fonts need `build-inputs.mjs` step 1c. The app declares them with
  root relative `/fonts/` urls, which the converter cannot resolve from a stylesheet
  under `.cache`, so step 1c rewrites them to `../../public/fonts/`. Without it
  validate prints `[FONT_DANGLING]` for Overused Grotesk and Opening Hours Sans and
  every design renders in a fallback face.
- The safelist now carries `hue-ink` (all twelve steps, 175 and 950 included),
  `shadow-card` and `shadow-elev-0` to `shadow-elev-6`. Tailwind prints
  "safelist pattern shadow-elev doesn't match any classes" on any tree without
  `theme/elevation.ts`. That warning is expected until the elevation branch merges.
  The ten `cat-*` colours (six utilities each) and the ten type scale tokens
  (`text-display-xl` to `text-caption`) are safelisted too, 60 and 10 emitted rules.

## Conventions header, edited 2026-10-02
- It was validated against the build first, every class, hex, component and prop it
  names verified, then edited. The palette table gained a `hue-ink` row with all
  twelve steps, the four ramps `theme/colors.ts` marks deprecated (`hue-neutral`,
  `hue-slate`, `hue-zinc`, `hue-stone`) are marked deprecated near miss neutrals, and
  green and red gained their 50 and 700 steps. It still says nothing of the new
  components, the two faces or the type scale.

## Floor cards / statically-unrenderable
- **Carousel** ships the floor card on purpose: `react-alice-carousel` builds its
  stage with JS layout + resize cycles that don't run in static headless
  capture, so authored slides collapse to zero height. No preview is authored.
- **SimpleTable** ships the floor card: it imports Remix `Link`/`useSearchParams`
  and needs a Router context that the preview harness doesn't provide.
- **Spinner** previews render the loading message; its glyph
  (`/icons/spinner.svg`) is served from the app `/public` dir at runtime and is
  not part of the DS bundle, so the image itself won't load in previews.
- **DateFilter / HelperDialog / InfoTooltip** render their trigger/closed state;
  the popover/dialog/tooltip open on interaction, which static capture can't do.

## Known render warns (triaged, legitimate)
- ChartLabel: color dots invisible (undefined `bg-highlight-*`) — faithful.
- Radio "Variants": all render red (component hardcodes `checked:bg-red-500`;
  `accent-*` variant classes undefined) — faithful, axis doesn't visibly vary.

## Build pipeline (load-bearing)
- `cfg.buildCmd` = `node .design-sync/build-inputs.mjs`, which does TWO things
  before every `package-build.mjs`: (1) compiles Tailwind →
  `.cache/ds-tailwind.css` (cfg.cssEntry) and appends `react-alice-carousel`
  CSS; (2) esbuild-prebuilds `entry.tsx` → `.cache/ds-entry.mjs` (cfg.entry).
- `prebuild.mjs` imports the converter's `reactShim` from `.ds-sync/lib/bundle.mjs`
  so React compiles to `window.React` (no bare imports, no "Dynamic require of
  react"). Do NOT mark react `external` in the prebuild — that reintroduces the
  dynamic-require crash.
- Windows gotchas already fixed in build-inputs.mjs: run Tailwind via
  `node node_modules/tailwindcss/lib/cli.js` (NOT the `.cmd` shim with
  shell:false — fails silently), and dynamic-import prebuild via
  `pathToFileURL` (a raw `d:\…` path is not a valid ESM specifier).
- `.design-sync/tailwind.config.ts` safelists the full `hue-*` palette across
  bg/text/border/ring/fill/stroke + custom shadow/rounded scales, because
  designs render against the SHIPPED `styles.css` (JIT-compiled) — without the
  safelist the agent could only use classes the synced components happen to use.

## Re-sync risks
- `cfg.buildCmd` produces BOTH inputs; if it's skipped, components render
  unstyled and/or the bundle is stale.
- The barrel entry (`entry.tsx`) is a hand-maintained sync input — keep it in
  step with `componentSrcMap`. Adding a component means editing BOTH, then
  re-running buildCmd so the new component is in `.cache/ds-entry.mjs`.
- Playwright must match the cached chromium build (currently chromium-1217 →
  playwright@1.59.0, installed in `.ds-sync`); set
  `PLAYWRIGHT_BROWSERS_PATH=$LOCALAPPDATA/ms-playwright` when validating.
- `.d.ts` props come from `cfg.dtsPropsFor` (hand-written), since the prebuilt
  ESM carries no types. If a component's real props change, update dtsPropsFor.
- FallBack was intentionally excluded; SimpleTable/Carousel intentionally floor.
