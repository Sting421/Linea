"""Prepare synthetic test references and blank results; never call providers."""

import argparse
import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]


def inventory():
    guide = (ROOT / "testing/README.md").read_text(encoding="utf-8")
    manual, title = [], ""
    for line in guide.splitlines():
        if line.startswith("### "):
            title = line[4:]
        match = re.match(r"^\*\*(QA-\d{2}) ·", line)
        if match:
            manual.append((match[1], title))
    assert [i for i, _ in manual] == [f"QA-{n:02}" for n in range(1, 37)]
    coverage = re.findall(r"^\| MVP-(\d{2}) .+? \| (.+?) \|$", guide, re.MULTILINE)
    assert {i for i, _ in coverage} == {f"{n:02}" for n in range(1, 23)}
    assert all(
        i in {case_id for case_id, _ in manual}
        for _, mapping in coverage
        for i in re.findall(r"QA-\d{2}", mapping)
    )
    cases = yaml.safe_load((ROOT / "linea/policy-fixtures.yaml").read_text(encoding="utf-8"))[
        "cases"
    ]
    curated = json.loads(
        (ROOT / "services/api/data/curated-conversations.json").read_text(encoding="utf-8")
    )
    examples = {c["id"]: c for c in curated}
    assert len(cases) == len(examples) == 41
    assert {c["id"] for c in cases} == set(examples)
    for c in cases:
        assert c["dialogue"] == examples[c["id"]]["dialogue"]
        assert c.get("context", {}) == examples[c["id"]].get("context", {})
    held_out = json.loads((ROOT / "testing/held-out-utterances.json").read_text(encoding="utf-8"))
    ids = [c["id"] for c in cases + held_out]
    assert len(held_out) == 10 and len(set(ids)) == len(ids)
    for c in cases + held_out:
        assert re.fullmatch(r"[a-z][a-z0-9_]+", c["id"])
        assert c["dialogue"] and c["expected"]
        assert all(s in {"elder", "linea"} and text for s, text in c["dialogue"])
    return manual, cases, held_out


def readable(key, value):
    if value is None:
        return "No final tier" if key == "tier" else "Unknown / null"
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, list):
        return ", ".join(f"`{item}`" for item in value)
    if key in {"tier", "minimum_tier", "assessment", "medicine_result"}:
        return str(value).replace("_", " ").title()
    return str(value)


def reference(cases, held_out):
    text = """# Linea conversation test cases

Use these scripts for QA-11 and the voice subset in QA-12 of the
[verification guide](README.md). All results start NOT RUN. The first 41 cases
reproduce the current policy fixtures exactly; the last 10 are evaluation
phrases for the same product boundaries, with no new medical policy.

Keep the held-out phrases out of production prompts, retrieval, and tuning.
If a failed phrase is used for tuning, replace it with a fresh held-out case
before claiming an independent evaluation.

## How to run a conversation case

1. Start fresh synthetic state: enrolled elder, Granted consent, connected
   phone leg, SCRIPT mode, active question feeling with its actual prompt,
   Losartan, no prior incidents, today's dose due.
   Override only the setup context in the case.
2. Have the engineer map symbolic context into actual profile, history, active
   prompt, mode, incident, and dose-period state. Repeated Unknown/omissions
   need distinct due-period history; same-incident cases need an existing
   incident/notification. Never prefill the expected facts of the current
   utterance or force a tier.
3. Send elder lines in order through the actual interpreter. Linea lines
   describe the semantic question, not mandatory verbatim output. Verify the
   actual active question before a short answer; keep state between turns.
   Wrong prompts or unavailable setup are failures/blockers, not permission
   to force facts. When an example omits further replies, report uncertainty
   rather than inventing a negative answer to complete clarification.
4. Inspect extracted facts separately from deterministic policy. Check each
   applicable expectation at its relevant turn and then the final state/reply.
   An early missed emergency fails even if later corrected.
5. Record actual facts, outcome, reply, and evidence in your results file.
   Internal state absent from the public API needs redacted engineer evidence,
   not a guess from the screen.

`tier=null` is not Routine or recovery. `assessment` and `new_event` distinguish
pending facts from no new incident. `minimum_tier=significant` never allows
Routine; Emergency still requires actual emergency evidence. Quotes preserve
the elder's actual words. Corrections do not silently delete alerts or clear
a latched emergency. Runtime dose timing comes from the authoritative schedule,
not the model's guess. All symptoms are roleplayed by consenting teammates.

"""
    for title, group in [
        ("Existing policy conversations", cases),
        ("Additional held out conversations", held_out),
    ]:
        text += f"## {title}\n\n"
        for c in group:
            text += f"### {c['id'].replace('_', ' ').capitalize()}\n\n"
            text += f"**Case ID:** `{c['id']}`\n\n"
            if c.get("context"):
                setup = json.dumps(c["context"], indent=2, ensure_ascii=False)
                text += f"**Setup overrides for the engineer:**\n\n```json\n{setup}\n```\n\n"
            else:
                text += "**Setup:** Use the default state above.\n\n"
            text += "**Conversation:**\n\n"
            for n, (speaker, phrase) in enumerate(c["dialogue"], 1):
                text += f"{n}. **{speaker.title()}:** {phrase}\n"
            text += "\n**Every expected condition must hold:**\n\n"
            for key, value in c["expected"].items():
                text += f"- **{key.replace('_', ' ').capitalize()}** (`{key}`): {readable(key, value)}.\n"
            text += "\n**Record:** Actual facts, policy result, reply, and evidence path.\n\n"
    return (
        text
        + """## Source and refresh

Original expectations: [policy-fixtures.yaml](../linea/policy-fixtures.yaml).
Original matching dialogues: [curated-conversations.json](../services/api/data/curated-conversations.json).
Additional phrases: [held-out-utterances.json](held-out-utterances.json).

Refresh this reference and the blank template with
`python scripts/prepare-test-run.py --refresh-reference`.
It validates source inventories and writes documentation only. It does not
call a model, start a phone call, change policy, or mark a test passed.
"""
    )


def results(manual, cases, held_out, guide_link, reference_link):
    text = f"""# Linea MVP test run results

Follow the [guide]({guide_link}) and [conversation cases]({reference_link}).
No checks have been executed by generating this file. Every row is NOT RUN.

## Run details

- Run name and date:
- UTC start and end:
- Tester names and roles:
- Web URL and deployed commit:
- API URL and deployed commit:
- Environment and actual mode:
- Model snapshot and interpreter or prompt version:
- Provider project and ASR or TTS configuration:
- Browser and device versions and network:
- Synthetic profile and account aliases and local timezone:
- Setup and failure injection methods:
- Evidence folder without keys tokens raw audio or real elder data:

## Result rules

Use NOT RUN, PASS, FAIL, or BLOCKED. Fill actual results and evidence before
choosing PASS. Every subcheck must pass. Keep a detailed record below for each
case or subcheck. Preserve failures when retesting a fix on a new build.

## Application and integration results

| Case | Test | Status | Actual result and evidence | Bug or retest |
| --- | --- | --- | --- | --- |
"""
    for case_id, title in manual:
        text += f"| {case_id} | {title} | NOT RUN | | |\n"
    for title, group in [
        ("Original conversation results", cases),
        ("Held out conversation results", held_out),
    ]:
        text += f"\n## {title}\n\n"
        text += "Text/model results are separate from real ASR/voice evidence under QA-12.\n\n"
        text += "| Case | Status | Actual facts policy and reply | Evidence | Bug or retest |\n"
        text += "| --- | --- | --- | --- | --- |\n"
        for c in group:
            text += f"| {c['id']} | NOT RUN | | | |\n"
    return (
        text
        + """
## Detailed case record template

Copy this section for each case or subcheck.

- Case ID and subcheck:
- Tester and UTC start and end:
- Actual deployed commits:
- Synthetic setup and actual steps:
- Check in and phone leg and provider session and event IDs:
- Expected behavior from guide or fixture:
- Actual extracted facts and deterministic decision:
- Actual spoken or UI or notification behavior:
- Timings and clock origins:
- Model request count and tokens:
- Evidence paths:
- Status and reason:
- Bug or blocker and fix commit and retest run:

## Cost record template

Record actual billable units, applicable unit price/date/currency, credits,
and paid-rate subtotal for each component. Include model, recognition,
synthesis, runtime, RTC, telephony, retrieval, all legs, and any allocated
hosting cost. Do not double count items included in another provider bundle.

| Type | Check in ID | All legs | Model tokens and requests | Voice and phone cost | Other cost | Paid rate total | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Normal | | | | | | | |
| Clarification heavy | | | | | | | |
| Unanswered then retry | | | | | | | |
| Dropped then reconnected | | | | | | | |

## Final run review

- Counts of PASS and FAIL and BLOCKED and NOT RUN:
- Three QA-36 run IDs and separate evidence:
- Unresolved bugs and limitations:
- Engineer review and date:
- Tester review and date:
- Decision and scope such as demo only or more integration work or pilot readiness:

Required cases that are failed, blocked, or not run prevent a readiness claim.
Complete cost measurement alone does not establish a profit margin.
"""
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-name", help="New private results folder name; never overwritten")
    parser.add_argument("--refresh-reference", action="store_true")
    args = parser.parse_args()
    if not args.run_name and not args.refresh_reference:
        parser.error("Supply --run-name or --refresh-reference")
    if args.run_name:
        reserved = {"CON", "PRN", "AUX", "NUL"} | {
            f"{prefix}{n}" for prefix in ("COM", "LPT") for n in range(1, 10)
        }
        if (
            not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}", args.run_name)
            or args.run_name.upper() in reserved
        ):
            parser.error("Run name must be a safe directory name of 1 to 64 characters")
    manual, cases, held_out = inventory()
    if args.refresh_reference:
        (ROOT / "testing/conversation-cases.md").write_text(
            reference(cases, held_out), encoding="utf-8"
        )
        (ROOT / "testing/results-template.md").write_text(
            results(manual, cases, held_out, "README.md", "conversation-cases.md"), encoding="utf-8"
        )
        print("Refreshed conversation reference and blank results template.")
    if args.run_name:
        folder = ROOT / "artifacts/test-runs" / args.run_name
        if folder.exists():
            parser.error("Run folder already exists; use a new name to preserve evidence")
        folder.mkdir(parents=True)
        (folder / "results.md").write_text(
            results(
                manual,
                cases,
                held_out,
                "../../../testing/README.md",
                "../../../testing/conversation-cases.md",
            ),
            encoding="utf-8",
        )
        print(f"Created {folder / 'results.md'}")
    print("Inventory verified: 36 guide checks, 41 original cases, 10 held-out cases.")
    print("No providers called. All test results remain NOT RUN.")


if __name__ == "__main__":
    main()
