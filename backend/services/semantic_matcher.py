from functools import lru_cache


@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer("all-MiniLM-L6-v2")


def semantic_similarity(resume_text: str, job_text: str) -> dict[str, float | str]:
    """Compare resume and job-description meaning using a local sentence embedding model."""
    resume = resume_text.strip()
    job = job_text.strip()

    if not resume or not job:
        return {"score": 0.0, "similarity": 0.0, "method": "sentence-transformers"}

    model = _get_model()
    embeddings = model.encode([resume, job], normalize_embeddings=True)
    similarity = float(embeddings[0] @ embeddings[1])
    similarity = max(0.0, min(1.0, similarity))

    return {
        "score": round(similarity * 100, 1),
        "similarity": round(similarity, 4),
        "method": "all-MiniLM-L6-v2 sentence embeddings + cosine similarity",
    }
