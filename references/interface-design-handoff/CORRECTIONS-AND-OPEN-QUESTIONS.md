# Corrections and open questions

The source records include superseded findings and unresolved design tensions. This file prevents those from becoming fresh instructions. It does not assert the current state of remote branches.

## Snapshot boundaries

The code snapshot was read from `feature/1048-home-design-pass` at `288089e09fd67e7b741886d4cccc816f3f1f23ef` on 3 October 2026. The visual gallery describes itself as a 2 October export from the replayed merge tree `b44c0be3`. A replayed merge is not proof that the changes are on `dev`. No remote merge status was refreshed for this handoff.

The existing design archive spans July through October. Its historical measurements and “not merged” statements must be rechecked before implementation. File existence below is a source inspection, not a CSS emission check or a browser test.

## Corrections to apply when reading the archive

| Older statement | Carry forward this reading |
| --- | --- |
| The two new fonts are absent. | Both WOFF2 files and font-face declarations exist in the source snapshot. `font-display` maps to Overused Grotesk. Body-family wiring is still unresolved below. |
| No surface-tone values have been decided. | DL-69 declares ink-100 page ground, white raised surfaces, and inherited tone for flush surfaces. Availability is a separate question. |
| Elevation is available because it was built on another branch. | `theme/elevation.ts` is absent from the checked checkout. Check the destination file and config before authoring any `shadow-elev-*` utility. |
| GraphWrapper is the old card idiom; copy Control's p-5. | The later convention says GraphWrapper matches feature density. The snapshot has 18px horizontal and 20px vertical padding. Compare to the density table, not the newest sibling. |
| Tailwind is exactly 3.4.3. | That is the dependency range floor. The inspected installed package is 3.4.16. Use the destination lockfile and installation. |
| Tailwind hover utilities need another arbitrary pointer guard. | The config enables `hoverOnlyWhenSupported`. Use ordinary `hover:`; retain manual guards for raw CSS. Extra variants can override the active state through output order. |
| `active:scale-97` and `motion-reduce:transform-none` implement the press contract. | Use `active:scale-[0.97]` and `motion-reduce:active:scale-100`. The first old class is undefined; the second loses against the state variant. |
| Tilt is a supported composite hover behavior. | DL-87 retires pointer tilt. Do not restore it from an older table. |
| There is no toast template. | `templates/toast/Toast.dc.html` and `ToastMobileGallery.dc.html` are present. That does not prove a production toast component is wired. |
| Anomaly at zero is hidden, or the status donut is the fleet filter. | DL-34 keeps the disabled anomaly row. DL-53 makes the donut an inspection readout and gives the map legend filtering. The Home catch-up records removal of the stale donut filter behavior. |
| The categorical tokens or shared chart treatment are absent everywhere. | The source snapshot contains categorical tokens and shared chart helpers. Do not infer destination merge status from this. |
| The icon queue has a fixed historical count, and the DS has no right chevron. | Counts in old notes are stale. The repository guide corrects the chevron claim. Inspect the included icon gallery and current queue before inventing a glyph. |
| The shell has an icon-only rail at lg. | The declared rail is 272px from lg upward. Later sidebar work also removes its icons and carries its own hover exception. |
| Every Trends chart uses the original shared date axis and two-column layout. | DL-113 introduces per-card axes. DL-120–122 later change grouping, Grid Quality, and the six-column composition. Read these as scoped, chronological supersessions. |
| Home's top band is a two-card row with full-width Production. | Home catch-up entry 23 supersedes entry 16: from xl the columns are 1fr / 1.15fr / 2fr; the two-card row remains below xl. |

Evidence: [configuration](source-snapshot/tailwind.config.ts), [font families](source-snapshot/theme/fontFamily.ts), [font declarations](source-snapshot/app/tailwind.css), [GraphWrapper](source-snapshot/app/components/Graphs/GraphWrapper.tsx), [repository guide excerpt](references/repo/design-guide-excerpt.md), [selected decisions](references/reasoning/design-decisions.md), and [Home catch-up](references/reasoning/home-design-catch-up.md).

## Questions the record does not settle

| Topic | Tension and next action |
| --- | --- |
| Button font | The record assigns display by font capability, then contains a body-face instruction and a later explicit note that the conflict is unresolved. Read the destination button and obtain a scoped ruling if changing its face. |
| Numeric table cells | “Every numeral uses display” conflicts with “every data cell uses body.” Opening Hours Sans is recorded without tabular numerals. Do not claim that a `tabular-nums` class resolves this. Preserve the current scoped treatment until the assignment is settled. |
| Body font wiring | The source config declares only `display`; the inspected root/CSS/theme surfaces reference Opening Hours Sans only in its font-face declaration. Recheck computed styles in the destination before claiming it is the rendered body face. A font-face declaration alone does not prove either rendering or downloading. |
| Font feature evidence | The later typography reference reports Overused Grotesk tabular shaping verified, while older notes call it unverified. This handoff copies the font and records that later evidence; it does not rerun shaping. Verify again if replacing or subsetting the font. |
| Eyebrow contrast | The declared eyebrow is ink-500 at 11px, while the recorded small-text floor is ink-600 on white. These conflict. Do not present the declaration as an accessibility pass or silently expand the exception. |
| Button small size | The template has 13.5px, but the later typography ruling explicitly rejects half-pixel type. Use the agreed token scale for new work and verify the resulting control size. Undefined xs/xl values need a decision, not invention. |
| New universal patterns | The Overview record calls short-axis end treatment, retry-only cards, and sliding option highlights candidate conventions. Their presence on one surface does not make all three general rules. |

## Scoped exceptions worth preserving

| Surface | Exception and safeguards |
| --- | --- |
| Control work-mode popover | Highlighted row expands over 150ms in a portalled panel. The page beneath does not reflow. Keyboard and reduced motion are instant. Only this popover. |
| Power flow | Measured container width/height is allowed for its arithmetic layout. Digit morph reuses the approved component, only changes subsequent live readings, aligns the decimal, caps stagger, and uses a fade under reduced motion. It is not permission to animate all numbers. |
| Empty placeholder | It may hold the exact height of the populated element it replaces. It does not give the whole card a floor. |
| Chart entrance and cursor | DL-122 allows chart geometry animation despite the transform/opacity default. First view and fullscreen have explicit lifecycles, and reduced motion skips it. |
| App header | DL-119 records four header-only exceptions. Read the actual entry before copying header typography, colors, or motion elsewhere. |
| Sidebar | DL-132 permits hover-open groups with a movement-reset delay, mouse-only handling, protection against a row moving under the pointer, and instant keyboard/reduced-motion behavior. The current row has a heavier label; the Sign Out divider remains. |
| Home empty states | Solid on Home through opt-in props, with other surfaces retaining their defaults. This is not a system-wide removal of dashed states. |
| Table anatomy | DL-130 specifies p-5 on the table card, even though the generic feature card uses 18×20px. It also centers only the status-chip column and pins identifying/status columns left. Apply the named table contract rather than silently changing every card. |
| Home Fleet Capacity tiles | The latest catch-up records the blue gradient with white text as an accepted colored-inset exception. It also records below-AA contrast for small labels/units. Preserve the disclosed limitation and do not generalize it as an accessible default. |

When a new request touches a conflict, make the specific decision visible, record what it supersedes, and update the canonical record. Do not resolve a disagreement by following whichever paragraph appeared last in a search result.
