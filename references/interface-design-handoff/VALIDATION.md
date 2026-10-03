# Handoff validation

Validated on 3 October 2026, Asia/Taipei.

## Package checks

Command, run from this folder:

```text
node tools/verify.mjs
```

The final run checks all files listed in the manifest, compares verbatim copies to recorded source hashes, resolves local links in the authored guides and bundled skills, and resolves static HTML/CSS asset references in the copied gallery. The verifier prints its exact corpus and results.

Controls cover a known present README, a deliberately nonexistent local link, changed bytes, and a path outside the pack. They ensure that an empty findings list is not produced by an empty or incapable check.

The ZIP is checked separately with PowerShell and `System.IO.Compression.ZipFile.OpenRead`: every archive file is compared with the final folder by relative path and SHA-256, including the manifest. It is packaged with one top-level `interface-design-handoff` folder.

## What this does not establish

The application was not changed. Typecheck, lint, unit tests, build, live API behavior, font shaping, and browser interaction were not rerun for this documentation package. Historical application measurements in the archives remain historical.

The gallery was copied from the existing export. Its file references were checked, but its rendered appearance and interactions were not freshly reviewed. Placeholder component pages remain placeholders. External archive citations and original-machine pointers were not treated as required package links.

The authored summary was reviewed against the source declarations, later corrections, selected decisions, and recent Home catch-up. Remaining contradictions are explicit in [CORRECTIONS-AND-OPEN-QUESTIONS.md](CORRECTIONS-AND-OPEN-QUESTIONS.md).
