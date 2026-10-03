# Packet Manifest

Regenerated 3 October 2026.

-   `00-prerequisites-and-discovery.md`
-   `01-test-day-checklist.md`
-   `HANDOFF-linea-build-over-nights.md`
-   `IMPLEMENTATION-NOTES.md`
-   `README.md`
-   `evidence/sources.md`
-   `linea/00-vision.md`
-   `linea/01-prd.md`
-   `linea/02-business-rules.md`
-   `linea/03-architecture.md`
-   `linea/04-design-guidelines.md`
-   `linea/05-mvp-lock.md`
-   `linea/agent-behavior.md`
-   `linea/policy-fixtures.yaml`
-   `shared/agora-platform-reference.md`

## Scaffold extension — 3 October 2026

The original document packet now has application directories `apps/web`,
`services/api`, `supabase`, `contracts`, and `scripts`, plus workspace dependency
locks and a CI workflow. `IMPLEMENTATION-NOTES.md` records the build map,
verification evidence, and remaining integration work. Historical packet
inventory above describes the documentation stage and is retained as context.

## Verification guide extension 4 October 2026

- `testing/README.md`: ordered manual and integration checks, pass conditions,
  timings, evidence requirements, and coverage of all 22 MVP acceptance cases.
- `testing/conversation-cases.md`: 41 source fixtures and 10 additional phrases.
- `testing/held-out-utterances.json`: evaluation phrases excluded from retrieval.
- `testing/results-template.md`: blank tracker and detailed evidence record.
- `scripts/prepare-test-run.py`: validates inventory and creates private run
  folders under ignored `artifacts/test-runs`; never calls providers.

All live test results remain NOT RUN until executed on a recorded deployed build.

