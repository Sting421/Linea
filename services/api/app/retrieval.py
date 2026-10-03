"""Semantic lookup of public synthetic examples. Elder queries are never cached."""

import hashlib
import json
import math
from pathlib import Path

import httpx

DATA = Path(__file__).resolve().parents[1] / "data"
MODEL = "text-embedding-3-small"
DIMENSIONS = 256


def corpus_digest(examples):
    return hashlib.sha256(json.dumps(examples, sort_keys=True).encode()).hexdigest()


def unit_vector(values, dimensions):
    if not isinstance(values, list) or len(values) != dimensions:
        raise ValueError("Unexpected embedding dimensions")
    if any(not isinstance(v, (int, float)) or not math.isfinite(v) for v in values):
        raise ValueError("Invalid embedding")
    norm = math.sqrt(sum(v * v for v in values))
    if not norm:
        raise ValueError("Empty embedding")
    return [v / norm for v in values]


class CuratedRetriever:
    def __init__(self, key, client=None, data_path=DATA):
        self.key = key
        self.client = client or httpx.Client(base_url="https://api.openai.com", timeout=2)
        self.examples = json.loads(
            (data_path / "curated-conversations.json").read_text(encoding="utf-8")
        )
        index = json.loads((data_path / "curated-embeddings.json").read_text(encoding="utf-8"))
        if (
            index["corpus_sha256"] != corpus_digest(self.examples)
            or index["model"] != MODEL
            or index["dimensions"] != DIMENSIONS
            or index["ids"] != [e["id"] for e in self.examples]
            or len(index["vectors"]) != len(self.examples)
        ):
            raise ValueError("Curated index must be rebuilt for this corpus")
        self.vectors = [unit_vector(v, DIMENSIONS) for v in index["vectors"]]

    def retrieve(self, text, limit=5):
        if not text.strip() or limit <= 0:
            return []
        response = self.client.post(
            "/v1/embeddings",
            headers={"Authorization": f"Bearer {self.key}"},
            json={
                "model": MODEL,
                "input": text,
                "dimensions": DIMENSIONS,
                "encoding_format": "float",
            },
        )
        response.raise_for_status()
        query = unit_vector(response.json()["data"][0]["embedding"], DIMENSIONS)
        ranked = sorted(
            range(len(self.examples)),
            key=lambda i: sum(a * b for a, b in zip(query, self.vectors[i], strict=True)),
            reverse=True,
        )
        # No similarity score, tier or treatment decision crosses into policy.
        return [self.examples[i] for i in ranked[: min(limit, 5)]]
