# Interface review checklist

Use this during implementation and before hand-back. Apply the checks relevant to the changed surface and state what was not exercised.

## Before building

- [ ] Read the current task scope and this pack's corrections.
- [ ] Separate current implementation, declared intent, proposal, and accepted exception.
- [ ] Locate the shipped component, related consumers, actual tokens, and relevant templates.
- [ ] Consult the relevant skills at plan time and record their effect.
- [ ] Define the data meanings, available actions, roles, date window, and failure behavior.

## Meaning and visual structure

- [ ] Color represents the intended status, category, brand, or neutral role.
- [ ] Shape and hover treatment promise the behavior that actually exists.
- [ ] Density follows container width, prominence follows content hierarchy.
- [ ] Titles, eyebrow, figures, units, and control labels use the agreed type roles and scale.
- [ ] Important figures remain complete; units and returned ranges are truthful.
- [ ] Numbers, labels, icons, and column headers align deliberately.
- [ ] Shadows express elevation, inset rows remain flat unless explicitly excepted.
- [ ] Long labels, large readings, and sparse content do not collide or manufacture empty space.

## States and inputs

- [ ] Rest, hover, focus-visible, press, pending, and disabled are implemented where applicable.
- [ ] Keyboard users can reach revealed content and return focus after dismissal.
- [ ] Icon-only controls have names; icons scale and recolor correctly.
- [ ] Pointer hover is gated and raw CSS does not assume the Tailwind flag covers it.
- [ ] Reduced motion is checked while the active/hover state is engaged.
- [ ] Rapid open/close or repeated input does not restart from a stale visual state.
- [ ] Loading, empty, failed, partial, stale, and unavailable states are distinguished.
- [ ] Recovery actions affect the failing data and explain what the user can do.
- [ ] Fault information survives a missed or dismissed transient notification.

## Layout and data behavior

- [ ] Check narrow and wide containers, including the same component in two different slots.
- [ ] Keep severity visible and hidden detail reachable at every supported width.
- [ ] Table overflow stays local; identifier/action columns follow the accepted pinning rule.
- [ ] Real zero, null, missing, single-bucket, long-series, and large-magnitude data are handled honestly.
- [ ] Chart domains, units, legend behavior, and tooltip meaning agree across surfaces.
- [ ] Check increased text size and the actual foreground/background combinations.
- [ ] Test role-dependent controls with the roles available and disclose missing role coverage.

## Integration and hand-back

- [ ] Browser-test links, tab transitions, device navigation, range changes, Back, and retry where touched.
- [ ] Check shared-component consumers and loaders; a green merge is not semantic compatibility.
- [ ] Run relevant tests and the required project battery for an implementation hand-back.
- [ ] Record commands, environment, corpus, baseline, controls, and remaining coverage gaps.
- [ ] Motion reviews use the skill's Before / After / Why findings table and explicit verdict.
- [ ] State any exception or conflict, its scope, safeguards, and accepted limitations.
- [ ] Reconcile the canonical design record and preserve a dated continuation for the next session.
