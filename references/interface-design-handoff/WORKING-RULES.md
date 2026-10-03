# Ovanova interface working rules

Read [corrections and open questions](CORRECTIONS-AND-OPEN-QUESTIONS.md) alongside this file. These are project conventions; actual implementation availability must be checked in the destination branch.

## Tokens and color

Tokens live in TypeScript under `theme/` and are composed by `tailwind.config.ts`. Consume them through Tailwind or their exported values. Raw-hex status consumers use `statusToHex`. The template foundation CSS is a visual reference, not the app's token architecture. Do not edit the generated `ds-bundle`.

| Meaning | Source and rule |
| --- | --- |
| Operational status | `theme/status.ts`. Normal, Warning, Anomaly, Offline, Fault. Solid for dots, soft/text/border for badges. |
| Severity precedence | Fault → Anomaly → Warning → Offline → Normal, through `STATUS_SEVERITY`. |
| Category | `theme/categorical.ts`. Keep one color per energy concept across charts. |
| Brand and throughput | `hue-sky` in `theme/colors.ts`. Inverter throughput uses `hue-sky-600`. |
| Neutral | `hue-ink`. Do not introduce the deprecated neutral/slate/stone/zinc families into new treatments. |

Violet belongs to anomaly. Normalize online to normal at the boundary. An unresolved status stays a non-status neutral. The UI normalizer passes anomaly through; it does not invent anomaly detection. The anomaly row at zero remains a disabled readout. Use shared labels rather than per-consumer spellings.

Read [foundations](references/conventions/01-foundations.md) for palette values and historical contrast measurements. Contrast depends on the actual surface: the declared small-text floor is ink-600 on white and ink-700 directly on ink-100. The eyebrow declaration conflicts with that floor; see the open questions.

## Shape and depth

| Role | Shape |
| --- | --- |
| Label, state, toggle, identity | Fully round. |
| Command or input | Soft rectangle, normally 6–10px radius. Buttons use 8/9/10 by size. |
| Container | Normally 12–14px. Compact cards and inset tiles have their declared 10px treatment. |
| Micro mark | 4px, including the approved chart bar tops. |

Command buttons are neither pills nor square. Chip-scale selections are a different role. Shadow communicates height. Outline and bare buttons stay flat; pending keeps its rest elevation, disabled is flat. A control must not rest at or above its container's elevation.

The intended depth system is `elev-0..6` with page ground ink-100, white raised surfaces, and a flush surface inheriting its container. The checked source tree has no elevation token file. Until the destination has the system, match its existing shadow utility and record the dependency. Do not approximate it with arbitrary shadows or invent missing utilities. Exact intended values are in [form](references/conventions/02-form.md).

## Typography and spacing

The display face is Overused Grotesk. Opening Hours Sans is the intended prose face, a single 400-weight cut. Both WOFF2 files are included, but the checked source configuration only maps the display family. Font assignment for buttons and data cells remains contradictory in the records.

Use the rem type tokens in [the source snapshot](source-snapshot/theme/fontsize.ts): display-xl, display-lg, title-lg, title-md, title-sm, body, body-sm, label, eyebrow, caption. Tracking and leading are part of each token. Do not introduce half-pixel type sizes from old templates. Card headers use Title Case by explicit override of the templates.

Use stock Tailwind spacing. The custom spacing keys follow key × 4px; `68` is the 272px rail and must survive. Literal dimensions are arbitrary values rather than new keys named after pixels. New typography and spacing tokens use rem. Existing declarations are not permission for an unrelated migration.

Digits changing in place or scanned in columns need tabular figures with a font that actually supports them. Right-align numeric columns and their headers; left-align text. Use a two-column grid for a shared label/value edge. Use `items-center` on icon-and-label rows.

## Cards and responsive layout

Density is selected by rendered card width, prominence by hierarchy. These axes stay separate.

| Density | Horizontal × vertical padding | Title at 16px root | Radius |
| --- | --- | --- | --- |
| Compact | 12 × 12px | 13px / title-sm | 10px |
| Standard | 18 × 16px | 15px / title-md | 12px |
| Feature | 18 × 20px | 18px / title-lg | 14px |
| Inset tile | 14 × 12px | Eyebrow only | 10px, flat |

No card min-height. Consistent anatomy gives consistent height, and the row uses grid stretch when equal height is needed. An empty placeholder may reserve exactly the populated element's height. Named surface exceptions are recorded separately.

Card titles are one line, truncated, display 600, sky-900. Labels may truncate with the full text reachable. Descriptive prose uses a fixed two-line clamp. **Never ellipsis a number**: adjust precision, units, or type size while retaining its meaning.

Media queries govern shell and page layout. Container queries govern card interiors. Tailwind 3 supports the existing arbitrary container-query idiom; do not assume Tailwind 4 utilities exist. More than one nested container can be appropriate when tile content and card composition depend on different widths.

The base layout convention uses 4/8/12 content columns and stock breakpoints at 640, 768, 1024, 1280, 1536px. Shell insets are 12px at base/sm, 16px at md, 24px at lg and above. The rail is 272px at lg and above; there is no declared icon-only rail. Individual accepted page layouts, including Home's unequal columns, may override the generic card band.

Every multi-field surface has a priority order. Severity, fault, alert, and status indicators never drop. Hidden detail remains reachable. Avoid a pixel-locked first column below lg. Keep horizontal table overflow local to the table. Actions remain pinned at the right; the later shared-table ruling also pins the identifying and status columns at the left. Only the status-chip column is centered. DL-130 specifies a p-5 table shell, a scoped later treatment that differs from the generic card-density table.

## Controls and interaction

Every button and link defines rest, hover, focus-visible, press, pending, and disabled. Pending is busy and preserves its active identity. Disabled uses ink-400 on ink-50 with `cursor-not-allowed`, never blue.

- Use plain Tailwind `hover:` with this project's `hoverOnlyWhenSupported` flag. Raw CSS hover still needs a fine-pointer/hover guard.
- Give hover-revealed affordances keyboard parity, including group focus-within where needed.
- Use the focus-visible outline in sky-500. Never remove a control's focus indicator without replacing it. The programmatically focused Headless UI panel exception does not exempt its controls.
- Controls press with `active:scale-[0.97]`, paired with `motion-reduce:active:scale-100`. Rows use their state tint rather than scaling.
- Name transitioned properties. No `transition-all`, layout-shifting hover, or hover weight/padding/border-width changes without a scoped ruling.

Composite hover meanings are lift for navigation, tint for inspection, reveal for more content, link for a related target, and inert for no action. Pointer tilt is retired. A tinted readout does not acquire a click action. The status donut is inspection; the map legend owns the fleet filter.

## Buttons and close controls

Five roles: primary, secondary, tertiary, icon-only, destructive. At most one primary per region. The primary is white on sky-800, with a constant fill and intended elevation hover. Until elevation is available, new buttons take the shipped secondary. The secondary is a gray outline with ink-700 text and a sky-50/sky-800 hover treatment. DS `secondary` means something else; our secondary maps to DS `outline`.

Small/medium/large buttons have padding 7×13, 9×16, 11×20px and radii 8/9/10px. The old 13.5px small label conflicts with the later no-half-pixel rule; do not blindly copy it. `xs` and `xl` have no declared visual values. Destructive defaults to outline; solid destructive requires the recorded hold-to-confirm pattern. Icon-only controls need accessible names.

A close control is a bare ink-600 X at rest. Hover recolors the X and outline to sky-500 and rotates 90 degrees. Reduced motion keeps color and outline, drops rotation. Use outline rather than a border that changes geometry. Never rotate 45 degrees, which lands on a plus sign.

## Motion

Ask whether it should animate before choosing a curve. Keyboard-initiated and very frequent actions are immediate. Prefer transforms and opacity; one-shot height reveals and specifically approved chart/side-panel behaviors have scoped exceptions.

| Motion | Treatment |
| --- | --- |
| Enter/exit | `cubic-bezier(0.23,1,0.32,1)`, exit faster. |
| Movement on screen | `cubic-bezier(0.77,0,0.175,1)`. |
| Hover/color | `ease`, normally 100–160ms. |
| Constant progress | `linear`. |

Default UI motion stays below 300ms. Longer generic skill examples are not a local authorization. No ease-in or scale-from-zero entrances. Popovers use their trigger origin; dialogs stay centered. Rapid transitions retarget instead of restarting. Reduced motion removes movement while retaining useful color/opacity feedback, except where a scoped chart rule makes the transition instant.

## Messages and recovery

| Surface | Meaning and lifetime |
| --- | --- |
| Chip | An inline fact. No independent entrance on every refresh. |
| Banner | A persistent condition in layout. Never times out. Remember dismissal per condition instance. |
| Toast | An event above layout with a durable copy in an inbox or alert list. Never the only carrier. |

Do not fire both a banner and a toast for one event. Fault conditions remain visible after dismissing their notice. The declared toast policy pauses on hover/focus, limits the visible stack, and never auto-dismisses error/fault. See [messaging](references/conventions/08-messaging-and-charts.md) for the exact behavior and use the corrections guide for template availability.

When a state asks the user to act, provide an explicit button below the explanation, such as “Change date range.” Do not hide the control in a word of prose. A passive loading or no-events state needs no invented action. Choose recovery based on what can change that surface's data.

## Charts and navigation

Use common domains and truthful units for comparison. Preserve reported zero, distinguish missing data, and do not extrapolate readings or silently manufacture buckets. A sparkline needs enough points to draw a meaningful line. Help copy can describe the chart; it may only explain a calculation that the code or API establishes.

The later chart treatment uses squircle bar tops, semantic gradients, quiet axes with units on ticks, a shared tooltip, and an inset legend. Legend hover isolates a series. First-view and fullscreen entrance rules and the Trends grid supersede older shared-axis layouts within their named scope. Read the [selected decisions](references/reasoning/design-decisions.md), especially DL-113 and DL-120–123, before composing these surfaces.

Keep route identity and visible state aligned. Preserve the intended range/search state through navigation and browser Back. Shared helpers and green unit tests do not prove route transitions. Device detail is an inline Equipment view with its identity in the URL under DL-126; DL-127 removes the duplicated plant power flow from Equipment.
