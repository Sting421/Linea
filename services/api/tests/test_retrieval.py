import json

import httpx
import pytest
from app.retrieval import DATA, DIMENSIONS, CuratedRetriever, corpus_digest


def test_bundled_index_matches_corpus_and_semantic_lookup_returns_no_policy_scores():
    examples = json.loads((DATA / "curated-conversations.json").read_text())
    index = json.loads((DATA / "curated-embeddings.json").read_text())
    assert len(examples) == 41 and index["corpus_sha256"] == corpus_digest(examples)
    chosen = 7
    requests = []

    def respond(request):
        requests.append(json.loads(request.content))
        return httpx.Response(200, json={"data": [{"embedding": index["vectors"][chosen]}]})

    retriever = CuratedRetriever(
        "private",
        httpx.Client(base_url="https://api.openai.com", transport=httpx.MockTransport(respond)),
    )
    result = retriever.retrieve("Synthetic query")
    assert len(result) == 5 and result[0] == examples[chosen]
    assert all(set(e) == {"id", "dialogue", "context"} for e in result)
    assert requests[0]["dimensions"] == DIMENSIONS
    assert retriever.retrieve("", 5) == []


def test_changed_corpus_requires_rebuilding_index(tmp_path):
    index = (DATA / "curated-embeddings.json").read_text()
    (tmp_path / "curated-embeddings.json").write_text(index)
    (tmp_path / "curated-conversations.json").write_text("[]")
    with pytest.raises(ValueError, match="rebuilt"):
        CuratedRetriever("private", data_path=tmp_path)
