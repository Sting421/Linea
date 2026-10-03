# How we think about interface design

This is a synthesis of the recorded project decisions and design skills. It explains the reasoning behind the conventions. Exact Ovanova values live in the working rules and reference collection.

## Make the meaning stable

The same treatment should make the same promise. A navigational card, a readout, a filter, and a command should not accidentally look interchangeable. Shape identifies the role before color is interpreted. A hover treatment promises an available behavior; do not add it to a passive readout just to make the page feel lively.

Color also has a job. Health and severity use status colors, energy categories use category colors, and the brand ramp serves interface affordances and throughput. Two tokens can share a hex while carrying different meanings. Refactoring by visual similarity alone can corrupt the meaning.

## Make the data honest

An operator must be able to distinguish a reported zero from a missing reading, a current value from a stale one, and the selected date range from the interval actually returned. Never clip a number into a plausible smaller number. Never supply a currency, calculation, timestamp, or unit merely because a mockup looks better with one.

A warning must survive the user looking away. That is why a toast cannot be the only record, severity cannot disappear at a breakpoint, and a dismissed notice cannot erase its underlying fault. Loading, empty, failed, unavailable, partial, and stale are different states with different explanations and recovery actions.

## Let the layout follow its content and available space

Card density follows the card's rendered width. Importance controls emphasis and content, not padding or geometry. A compact card may contain the most important figure on the screen. The page owns relationships between cards, including equal-height rows; the card owns its internal adaptation.

Viewport queries govern the shell. Container queries govern components. This allows the same component to work in a narrow rail and a wide content region at the same viewport width. Declare what information stays first as space narrows, and keep removed detail reachable.

## Use depth and motion to explain relationships

Shadow means elevation. It is not an ornament or a substitute for a divider. Surface tone and shadow work together; repeatedly choosing slightly different grays is not a depth system.

Before adding motion, name its purpose and frequency. It can explain a state change, acknowledge input, or preserve spatial continuity. Repeated decoration slows work. Start feedback promptly, preserve control during an interaction, and let rapid changes retarget from the current visual state. Reduced motion preserves meaning while removing unnecessary movement.

## Design behavior with the visual treatment

A component is unfinished if only its resting appearance is specified. Design hover, keyboard focus, press, pending, disabled, loading, and failure alongside the visual layout. A mouse-only reveal is not a complete interaction. An icon that cannot recolor or a focus ring that loses the CSS cascade is a functional defect even when the mockup looks correct.

## Reuse the living system and compare it to the rule

Start with the shipped component rather than a stale sibling in a template. Then compare it to the declared rule, not merely to its nearest sibling. Two cards can agree with each other and both be wrong.

Keep primitives neutral when the right treatment depends on the consumer. Add a deliberate opt-in to a shared component when one surface needs a different behavior. Verify the other consumers, especially those on pending branches. Extract shared mechanisms at an appropriate boundary rather than creating more local copies.

## Judge the result in use

Prototype real interaction and inspect it at realistic widths, with real data shapes and multiple states. Theoretical neatness does not settle whether a card feels too empty, a chart misleads, a list collides, or a shadow reads as depth. Record the observed result and its limits.

A deliberate exception is legitimate when its purpose and costs are understood. Preserve its safeguards and narrow scope. Do not turn an accepted compromise into a general recommendation or describe a known accessibility shortfall as a pass.

Sources: [design reasoning](references/reasoning/design-system.md), [selected decisions](references/reasoning/design-decisions.md), [Emil design engineering](skills/emil-design-eng/SKILL.md), and [Apple design](skills/apple-design/SKILL.md).
