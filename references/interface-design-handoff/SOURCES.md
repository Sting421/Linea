# Source provenance and maintenance

This handoff was assembled on 3 October 2026, Asia/Taipei, from local files available to the session. It preserves the recorded interface practice without claiming access to every previous conversation.

## Source families

| Manifest origin | Original location | What was carried |
| --- | --- | --- |
| `repo/` | `C:/Projects/ovanova-iot-frontend/` | Design and skill guide sections, local design docs, templates, source configuration, tokens, fonts, and selected component examples. |
| `design-wiki/` | `C:/cowork/dashboard-requirements/` | The conventions collection, design-system reasoning, status/shared-component notes, and selected design decisions. Read only during packaging. |
| `static-gallery/` | `C:/Projects/handoff/design-system/` | The existing gallery and its complete supporting files. Copied intact. |
| `handoff-authored` | This folder | The concise guides, session prompt, checklist, provenance, and verification tool. |

`source-origins.json` maps every copied file or excerpt to its source and source SHA-256. `manifest.json` adds a SHA-256 and byte size for every packaged file except itself. For an excerpt, the source hash identifies the full original file, while the manifest hash identifies the extracted text. Verbatim copies must match both hashes.

The code snapshot is from branch `feature/1048-home-design-pass`, commit `288089e09fd67e7b741886d4cccc816f3f1f23ef`. The gallery's own README identifies replayed merge tree `b44c0be3`, dated 2 October. The two are intentionally labeled separately. Neither is asserted to be the current remote `dev` tree.

## Coverage and limits

The authored guides synthesize the available declarations and later corrections. Exact archived files are kept intact so their original context and disagreements remain inspectable. Some archive text still references original-machine paths, work-item mail, area specs, remote resources, or retired skills. Those are historical pointers, not bundled dependencies or instructions to operate another system. The authored guide links and bundled skill support links resolve within this folder.

The component UX matrix is explicitly abandoned in its source. It is included for the surviving historical decisions and as a record of a rejected workflow. Do not resume or reproduce its scaffold.

The visual gallery is a copied static reference. Some component pages explicitly display placeholders instead of full interactive previews. The templates may depend on their original design runtime. The source snapshot is selected code for reading, not a runnable application. Use the destination repository to build and test.

The handoff omits environment files, local account settings, credentials, dependency directories, application build directories, wholesale message archives, unrelated commercial records, and non-interface skills. Selected decision entries retain their original surrounding wording and may mention process or work-item context. No original wiki, application source, or published design system was edited.

The package lives outside the application because the repository typecheck includes TypeScript recursively. Placing copied reference code inside it would change its compiler and lint corpus. The folder and ZIP are local artifacts and will not travel with a repository push.

## How the current source findings were checked

Commands ran in the source repository. These were inspections, not the application verification battery.

```powershell
git rev-parse HEAD
git branch --show-current
Get-Content tailwind.config.ts
Get-Content theme/fontFamily.ts
Get-Content theme/fontsize.ts
Get-Content theme/boxShadow.ts
Get-Content app/tailwind.css -TotalCount 100
Get-Content app/components/Graphs/GraphWrapper.tsx
Get-Content vitest.config.ts
Get-Content node_modules/tailwindcss/package.json -TotalCount 8
rg -n 'Opening Hours|font-family|font-sans' app/root.tsx app/tailwind.css theme
rg --files design/templates/toast
Get-ChildItem theme -File
```

The source inventory contains real token files such as `theme/status.ts` and `theme/boxShadow.ts`; the absence of `theme/elevation.ts` was checked against that same directory. Font-face presence is not evidence of rendered use. No font shaping, remote status check, CSS emission run, browser pass, or application suite was performed for this documentation package.

## Verify after moving the folder

With Node available, run from the unpacked folder:

```text
node tools/verify.mjs
```

The verifier checks packaged bytes against the manifest, copied bytes against their recorded source hashes, local links in the authored guides and skill files, and static HTML/CSS asset references in the gallery. It includes controls that detect a missing local target and changed content. It does not execute the gallery, follow archive links to external files, validate font rendering, or exercise application behavior.

## Refresh the handoff

1. Read the current accepted decisions and destination code. Record the branch, commit, and local date.
2. Update the canonical reasoning and conventions in their owning workflow, then take a new snapshot. Do not modify this archive as though it were the original source.
3. Replace reference copies with complete files and preserve supporting skill files, template assets, and gallery assets. Keep source and gallery revisions distinct if they differ.
4. Reconcile the corrections guide, open questions, and scoped exceptions. Explicitly retire superseded entries.
5. Update source origins and regenerate manifest hashes after all content edits. Run the verifier, then make a fresh ZIP and check its contents against the folder.

The manifest is an integrity record, not a signature. It should be regenerated intentionally after a reviewed change, not rewritten to hide an unexplained mismatch.
