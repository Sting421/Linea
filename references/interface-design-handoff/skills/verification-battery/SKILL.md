---
name: verification-battery
description: Run and report the project's verification battery for a build hand-back, a plan's baseline, or any claim about typecheck, lint, test or build figures in this repo. Use whenever a figure is about to be reported to Keith, whenever a hand-back is being written, and before claiming a suite is green, a build passes, a utility emits, or a scan came back clean. Carries the corpus rule that makes lint figures comparable, the control rule that makes a zero mean something, and the per-file attribution method for a moved figure.
---

# Verification battery

Every figure this repo reports travels with the command that produced it, or it is not a figure. This skill is that discipline written down, because it was being reconstructed from the last brief every time.

**Why it exists.** A number without a method is a finding rather than something to quietly re-derive. Keith's audit rejects an unsourced figure on sight, so an unsourced figure costs a round trip. And three separate times a correct measurement was reported under the wrong heading, or against a baseline from a different corpus, which reads as a regression that never happened.

## The one rule that outranks the rest

**Measure both sides in the same environment, in the same session, with the same `node_modules`.** Baseline first, then the tree under test. A delta across two environments is not a delta.

⛔ **The lint figure especially. `ds-bundle/` is UNTRACKED**, not merely gitignored. `git ls-files ds-bundle | wc -l` returns 0, positive control `git ls-files app | wc -l` returns 388. So the bundle exists in Keith's working directory and **cannot exist in any clone or `git worktree`**, and it contributes about 591 problems on its own because the script is `eslint --ignore-path .gitignore`.

Measured the same day on `dev` `ee76dc3`, **870 in the real repo and 279 in a worktree**, and 279 + 591 = 870. Both correct. ⛔ **Always say which corpus a lint figure came from, and never diff across two.**

## The battery

Report as two rows, baseline and tip, with the commands stated once.

    typecheck    npx tsc
    lint         npx eslint --ignore-path .gitignore --no-cache .
    tests        npx vitest run
    build        yarn build          (client and SSR, both stated)
    stylesheet   byte size of the built CSS, when any utility changed

Give tests as **count in file count**, both numbers. The test count is the figure that decays fastest, because a growing suite never announces itself the way a new error does.

**State the base commit for both rows**, and re-measure it rather than inheriting it. `git fetch --prune origin` then `git rev-parse origin/dev`.

## Controls, and why every zero needs one

**A zero is a claim about a corpus.** A grep whose scope could not have returned anything else is not evidence. So for every zero reported, run the same command in a way that must return non-zero and say so in the same breath.

- **Emitted declarations.** A Tailwind class in source is not a rule in the stylesheet. Grep the **built** stylesheet for the emitted declaration as a fixed string, not for the class name. ⚠️ The minifier rewrites values, it strips leading zeros from a `cubic-bezier`, so an exact grep can read 0 on a rule that is present. Grep a normalised form and say which.
- **The negative control that has earned its place, corrected 2026-09-08.** ⛔ `hue-ink-175` DOES exist in the token source, `theme/ink.ts:4` is `175: "#E4E9ED"`. It is a valid negative control against the BUILT STYLESHEET, because nothing consumes it so nothing emits, and an INVALID one against `theme/`. State which surface is being grepped before using it. A control that has to be true by construction is safer, `zzq-not-a-class` returns 0 against any surface (measured 2026-09-25, while `bg-[#zzzzzz]` DOES emit, because Tailwind passes an invalid arbitrary value through). If a negative control returns anything, the pipeline is wrong and every other zero in the run is worthless.
- **Trace and convention scans.** Traces, em dashes, colons and semicolons in prose, comments outside a test file. Each is a zero, so each needs its control. Report the scan corpus, every added line and every commit message.
- **Before grepping a built artifact, know what the build does to the thing being grepped.** Tailwind compiles a hex into an rgb triple in the declaration and keeps the hex only in the escaped selector.

## When a figure moves

**Attribute it to a file, not to the diff.** Extract per-file counts from both runs and diff those. A lint delta of minus three is one file going 7 to 4, and saying which file is the difference between a result and a rumour.

If the moved figure is a test count, reconcile the arithmetic end to end. New tests added, minus any that left the tree, equals the delta. An unreconciled test count hides a deleted test.

## What this battery cannot see, and must say so

- **Runtime lifecycle.** Sockets, timers, effect cleanup, reconnect behaviour. A green suite is not evidence about teardown. These need a dev smoke over time, and the smoke belongs to Keith with the exact steps and the exact thing to count.
- ⛔⛔ **ANY CLIENT SIDE NAVIGATION, and this is stronger than it sounds. MEASURED 2026-09-11, `vitest.config.ts:11` sets `environment: 'node'`, and there is no Playwright, no Puppeteer and no jsdom.** So nothing here can click a link, run a route transition, open or close a portalled dialog, press browser Back, or watch a loader revalidate. **A green battery says nothing whatever about whether the app navigates.**
  ⭐ **The worked example, because it is the strongest argument this file has.** A2 6.2 shipped a full green battery, typecheck down 5, lint flat, tests 812 to 849 in 3 new files, build passing on client and SSR. **The build was unusable.** Every navigation changed the URL and left the rendered view on the previous state until a manual refresh. **Three separate hypotheses were then reasoned out and all three were wrong**, one of them refuted only because a human sat and waited a minute. ⛔ **So when a hand-back touches routing, a Suspense boundary, an `<Outlet />` or a loader, the battery is not evidence and the note must say so in those words rather than listing "browser things" generically.**
- **Anything else needing a browser.** Visual passes, hover, focus rings, keyboard paths, and any tooltip or panel whose ids are wired in effects after hydration rather than in a static render.
- **A live endpoint.** If there is no token or no test plant, say the write was never run rather than implying it was.
- **A role with no account.** No USER account has ever existed, so a USER claim rests on helper and action tests only.

State these as a short list every time, and single out the one or two that matter most. An audit that reads as full coverage when it is partial is worse than one that misses a note.

## Flakes

A test that fails once and passes on a re-run is a finding, not noise, and it gets characterised rather than re-run away.

- **Run the file enough times to mean something.** A flake at roughly 1 in 15 is not settled by one green run. Report the count and the command.
- **Find the cause in the code under test**, not in the test. The measured instance was two adjacent `Date.now()` calls the test pinned as equal.
- **Prove whether it is caused by the change in hand.** If no other branch or commit touches either file, a merge or a neighbouring change cannot have caused it, and the structural argument is stronger than the empirical one.
- **Report the failure even when the re-run is green**, because a red run someone else sees will otherwise look like a defect in the work.

## Reporting shape

Baseline row, tip row, the delta, then per-figure attribution for anything that moved, then the controls, then what could not be verified. ⛔ **Never report a figure without its command, and never state as fact in one section what another section says was never run.**
