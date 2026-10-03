# Interface learnings to retain

These lessons come from the preserved project records. Historical counts and browser measurements in those records were not rerun for this pack.

| What went wrong | What to do next time | Evidence |
| --- | --- | --- |
| Design skills were opened only after implementation and changed the motion afterward. | Consult relevant skills while planning and state what each changes. | [Repository guide](references/repo/design-guide-excerpt.md), skill routing section. |
| A declared class passed review but emitted nothing. | Inspect the resolved configuration, then check the emitted declaration with positive and negative controls when a utility changes. Source spelling alone proves little. | [Verification skill](skills/verification-battery/SKILL.md). |
| A reduced-motion utility lost to the active-state selector. | Match the variant specificity and test while the state is active, not just at rest. | [Interaction](references/conventions/04-interaction.md). |
| Extra hover guards sorted after press styles and hid press feedback. | Understand Tailwind output order; use the configured ordinary hover variant. Raw CSS remains separately guarded. | [Repository guide](references/repo/design-guide-excerpt.md). |
| A template existed locally but git did not list it. | Check the filesystem. Local reference assets do not necessarily travel in a clone. | [Traps](references/conventions/09-traps.md). |
| A domain template's sibling was mistaken for the canonical component. | Search all matches and use the standalone component's home. Once shipped, use the repository implementation. | [Area build guide](references/repo/AREA-BUILD-GUIDE.md). |
| Cards were made consistent with each other while both missed the declared padding. | Compare each implementation against the density rule, not another imperfect sibling. | [Cards](references/conventions/06-cards.md). |
| More min-height made sparse cards feel emptier. | Fix anatomy, density, and row composition. Reserve space only for a named replacement element. | [Cards](references/conventions/06-cards.md). |
| An icon silently refused color or size changes. | Inspect fill/stroke, viewBox, aspect ratio, and fixed dimensions before using it. A missing canonical glyph becomes an explicit library queue item. | [Traps](references/conventions/09-traps.md). |
| A neutral migration risked changing offline status because both shared the same hex. | Classify by meaning before replacing values. Tokenization must preserve semantic identity. | [Foundations](references/conventions/01-foundations.md). |
| A font file and CSS property were treated as proof of typography behavior. | Check family wiring, shaping features, actual rendered text, and fallback. Retain tabular features through subsetting. | [Typography](references/conventions/03-typography.md). |
| A bottom border on a rounded link curved into a button-like outline. | Draw a straight pseudo-element underline without layout movement. Shadow remains reserved for elevation. | [Repository guide](references/repo/design-guide-excerpt.md). |
| A plausible chart label implied an unproven calculation or interval. | Say what is returned, distinguish the returned window, and do not invent derivations or units. | Selected decisions DL-85, DL-90, DL-122 and Home catch-up. |
| A filtered-looking donut did not filter anything outside itself. | Give one control clear ownership of the filter and keep inspection readouts visually honest. | Selected decisions DL-53 and Home catch-up entry 13. |
| Shared component changes broke another consumer without a textual merge conflict. | Inspect all consumers and known dependent branches. Use intentional opt-ins where behavior is surface-specific. | Home catch-up entry 17. |
| A green test suite accompanied broken client navigation. | Browser-test links, tabs, device selection, Back, loaders, and overlays. The recorded suite uses a Node environment. | [Verification skill](skills/verification-battery/SKILL.md). |
| A source-scan test passed locally but failed on CRLF. | Normalize line endings in source-text checks and verify without an untracked environment file when the test should not need one. | Home catch-up entry 21. |
| Sample-data tooling ran but received no requests. | Verify the page actually exercises the intended fixture/proxy path. A running helper is not evidence of its use. | Home catch-up entry 32. |

## Recent visual decisions that carry useful reasoning

The Home pass makes the width rule concrete. Fleet Capacity uses the card width to choose the arrangement and a nested tile container to size the figure. Production places the reporting context beside the total, wrapping it when needed. A sparkline takes the remaining width after its text rather than an arbitrary equal split. A one-bucket response produces a figure without a made-up line.

Inset plant rows became flat because stacked shadows in a scroller read as a gray background. The Active Alerts end fade disappears when the user reaches the final row, so it does not wash out the last item. Help hints were added consistently to Home cards, while their wording remained a separate review concern.

These are evidence of the method, not permission to carry every Home treatment onto every screen. Read the [Home excerpt](references/reasoning/home-design-catch-up.md) and the [exception register](CORRECTIONS-AND-OPEN-QUESTIONS.md) for scope and later changes.

## Record a learning so it remains useful

Write the trigger, expected behavior, actual observation, cause if established, adopted response, rejected alternative and reason, affected scope, evidence location, and verification limit. Give a superseded ruling an explicit replacement. Keep a proposal distinct from an accepted decision and a read distinct from a measurement.
