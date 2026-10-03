# Interface workflow and skills

The copied skills are complete local references. Read them directly from this folder; no installation or original-machine path is required. If the destination supports skill installation, copy only the selected skill directories into its supported skill location without overwriting newer versions. This pack does not automatically install anything.

## Choose skills at plan time

| Skill | When to use it | How it shaped this project's practice |
| --- | --- | --- |
| [emil-design-eng](skills/emil-design-eng/SKILL.md) | Component polish, motion, overlays, toasts. | Purpose and frequency before animation; scoped properties; fast feedback; retargetable transitions; spatially consistent dismissal. |
| [apple-design](skills/apple-design/SKILL.md) | Typography, surface depth, gesture/sheet interaction, reduced motion. | Type as size/weight/tracking/leading together; meaningful depth; continuous feedback and interruption; reduced movement with useful feedback retained. |
| [review-animations](skills/review-animations/SKILL.md) | Review of a diff touching motion. Explicit invocation is required. | The motion craft gate, including hover gating, origin, timing, interruption, performance, and accessibility. Read its bundled [STANDARDS.md](skills/review-animations/STANDARDS.md) for exact values. |
| [pick-ui-library](skills/pick-ui-library/SKILL.md) | An explicitly requested lookup for a genuinely new library need. | Start with installed dependencies. It does not reopen the settled MapLibre, Headless UI, Recharts, or Tailwind choices. |
| [verification-battery](skills/verification-battery/SKILL.md) | Implementation hand-back, baseline, test/build figures, emission or clean-scan claims. | Same-environment comparisons, a command and corpus behind every figure, controlled zero checks, and explicit browser limitations. |

The repository guide records these skills as consulted in prior interface work. This handoff does not claim that every past task used every skill. The lookup skill is included as part of that workflow, not invoked to recommend a new dependency during packaging.

Generic skill guidance loses to an explicit Ovanova decision. Examples include the project's plain-ease color transitions, approved height/chart exceptions, and immediate keyboard behavior. Skills may contain broader timing tables and other platform examples that are not local requirements.

The removed skills were `smooth-shadow-ring`, `improve-animations`, `find-animation-opportunities`, and `animation-vocabulary`. Their useful rulings were absorbed into the conventions. Do not reinstall them simply because an old source cites them. The absent shadow plugin, duplicate workflow, unsolicited scope, and duplicate definitions were the recorded reasons for removal.

## Work in this order

1. Read the task's accepted scope and the relevant correction/exception entries. Identify user roles, data truth, state transitions, input methods, and widths.
2. Find the current shipped component and all consumers. Inspect tokens, config, and the canonical standalone template only where appropriate.
3. Consult the relevant skills and say what each changes, or that it adds no change. Define intended appearance and behavior together.
4. Present a concise implementation plan tied to the actual user outcome. Separate existing defects from this task's changes. Do not silently expand a retrofit.
5. Build with existing primitives and semantic tokens. Keep shared defaults stable when adding a surface-specific opt-in. Record material deviations and accepted exceptions.
6. Verify the implemented states in the browser and perform the checks appropriate to the change. Use [REVIEW-CHECKLIST.md](REVIEW-CHECKLIST.md).
7. Hand back what changed, why, what was tested, what remains unverified, and any canonical decision that needs reconciliation.

## Verification discipline

For implementation work, the copied verification skill specifies the project battery: typecheck, uncached lint, Vitest, and client/SSR build. Use the destination's current scripts and run baseline and change with the same dependencies and corpus. The untracked design bundle historically changed lint scope, so a working-folder number and a clean-clone number are not comparable.

No historic test count is a current baseline. A test that passes on rerun after failing still has a finding to explain. Utility checks inspect emitted declarations and account for minification. Keep a positive control beside a negative result.

The included `vitest.config.ts` uses Node. Passing tests do not establish navigation, portalled focus behavior, visual hierarchy, responsive layout, hover, or lifecycle cleanup. Check those directly. State when a live endpoint, role, browser, or data shape was unavailable.

This handoff itself changes documentation and copies reference files. Its validation covers package integrity and the authored guide links, not application behavior. No application test/build result is asserted by the pack.

## Maintain continuity without creating another authority

This folder is an export. In ongoing Ovanova work, the source wiki carries reasoning, the conventions collection carries the decision, and the repository carries implementation. Update the owning record and regenerate the handoff rather than maintaining two competing live systems.

For a decision made in a destination with no original wiki, add a dated local continuation record that identifies the source rule, scope, replacement, reason, and evidence. When returning to the original project, reconcile that record explicitly rather than silently replacing its rules.
