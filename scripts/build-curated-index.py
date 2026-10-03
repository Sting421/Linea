"""Embed only the checked-in synthetic corpus; no elder records are read."""

import json
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services/api"))


def main():
    from app.retrieval import DATA, DIMENSIONS, MODEL, corpus_digest, unit_vector

    load_dotenv(ROOT / "services/api/.env")
    examples = json.loads((DATA / "curated-conversations.json").read_text(encoding="utf-8"))
    response = httpx.post(
        "https://api.openai.com/v1/embeddings",
        headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"},
        json={
            "model": MODEL,
            "dimensions": DIMENSIONS,
            "encoding_format": "float",
            "input": [json.dumps(e, sort_keys=True) for e in examples],
        },
        timeout=30,
    )
    if response.status_code != 200:
        raise RuntimeError(f"Embedding request failed: HTTP {response.status_code}")
    rows = sorted(response.json()["data"], key=lambda r: r["index"])
    if [r["index"] for r in rows] != list(range(len(examples))):
        raise ValueError("Incomplete corpus embedding response")
    index = {
        "model": MODEL,
        "dimensions": DIMENSIONS,
        "corpus_sha256": corpus_digest(examples),
        "ids": [e["id"] for e in examples],
        "vectors": [unit_vector(r["embedding"], DIMENSIONS) for r in rows],
    }
    (DATA / "curated-embeddings.json").write_text(json.dumps(index) + "\n", encoding="utf-8")
    print(f"Indexed {len(examples)} synthetic examples; no elder records accessed.")


if __name__ == "__main__":
    main()
