# Ovanova interface design handoff

This folder carries the UI and UX reasoning, conventions, skills, corrections, and visual references needed to continue interface work in another session. It is a portable snapshot taken on **3 October 2026, Asia/Taipei**. Copy the whole folder, or extract its ZIP, and start here.

The central idea is that appearance communicates behavior and data meaning. Shape identifies a role, color has a semantic job, depth describes surfaces, and motion explains a change. A polished screen must also tell the truth about its data and remain usable through loading, failure, narrow layouts, keyboard input, and reduced motion.

## Start a session

Paste [SESSION-PROMPT.md](SESSION-PROMPT.md) into the next session and give it access to this folder. Read these in order:

1. [Design principles](DESIGN-PRINCIPLES.md), the reasoning to carry to another project.
2. [Working rules](WORKING-RULES.md), the Ovanova-specific conventions.
3. [Corrections and open questions](CORRECTIONS-AND-OPEN-QUESTIONS.md), essential before treating an old note as current.
4. [Learnings](LEARNINGS.md), the mistakes and corrections worth retaining.
5. [Workflow and skills](WORKFLOW-AND-SKILLS.md), when to consult each skill and how to verify work.

For a specific task, use the [review checklist](REVIEW-CHECKLIST.md), then load only the detailed references it needs.

## What is included

| Folder | Purpose |
| --- | --- |
| `references/conventions/` | The existing conventions collection, copied intact. Precise rules, tables, and declared values. |
| `references/reasoning/` | Design-system reasoning, selected design decisions, status semantics, shared-component notes, and recent Home learnings. |
| `references/repo/` | Design and skill sections extracted from the local repository guide, the area build guide, component UX matrix, and event mapping. |
| `skills/` | Portable copies of the four design skills plus the verification skill. Animation review includes its standards file. |
| `source-snapshot/` | Token sources, configuration, font files, and selected implementation examples from this checkout. Reference code, not a standalone app. |
| `templates/` | The local design templates, including their supporting CSS and notes. Check for shipped components before using them. |
| `visual-reference/` | The existing static design-system gallery, including its bundle and assets. Open [index.html](visual-reference/index.html). |
| `tools/` | A local integrity and guide-link verifier. Run `node tools/verify.mjs` from this folder. |

[SOURCES.md](SOURCES.md) records provenance, omissions, and how to refresh the pack. [VALIDATION.md](VALIDATION.md) states what was checked and what remains unverified. `manifest.json` records file hashes and origins. The gallery has its own build provenance, which differs from the source checkout.

## How to resolve disagreements

Distinguish **design intent**, **implemented behavior**, and **verification evidence**. They answer different questions.

- A current explicit user ruling and the task's accepted scope govern the work. A later scoped exception changes only that scope.
- For design intent, read the latest applicable decision and reasoning. The conventions collection is a convenient projection and can be stale. Skills advise; they do not overrule a declared product decision.
- For existing component APIs and behavior, inspect the destination repository. Reuse its implementation. For a genuinely new component, consult the canonical standalone template or design in code where the area calls for it.
- For availability, inspect the destination branch and resolved configuration. A recorded token or a component in the gallery does not prove it exists in that branch.
- For appearance and interaction, test in the browser. Source, snapshots, and passing unit tests cannot establish visual quality or navigation behavior.

This pack preserves local records, not every past conversation. Historical measurements and statements such as “not merged” remain dated evidence. Read the corrections guide before the archive. The archive is for internal session continuity and contains original names and process context; it is not a client-facing delivery pack.
