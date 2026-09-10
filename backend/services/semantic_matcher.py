import math
import re
from collections import Counter


_TOKEN_PATTERN = re.compile(r"[a-z0-9]+")
_STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
    "in", "is", "it", "of", "on", "or", "that", "the", "their", "this", "to", "with",
    "will", "you", "your", "we", "our", "they", "them", "can", "may", "should", "must",
}


def _tokens(text: str) -> list[str]:
    return [token for token in _TOKEN_PATTERN.findall(text.lower()) if token not in _STOP_WORDS and len(token) > 1]


def _ngrams(tokens: list[str]) -> list[str]:
    bigrams = [f"{left}_{right}" for left, right in zip(tokens, tokens[1:])]
    return tokens + bigrams


def _tfidf_vectors(documents: list[list[str]]) -> list[dict[str, float]]:
    document_count = len(documents)
    document_frequency: Counter[str] = Counter()
    term_counts: list[Counter[str]] = []

    for document in documents:
        counts = Counter(document)
        term_counts.append(counts)
        document_frequency.update(counts.keys())

    vectors: list[dict[str, float]] = []
    for counts in term_counts:
        total = max(1, sum(counts.values()))
        vector: dict[str, float] = {}
        for term, count in counts.items():
            idf = math.log((1 + document_count) / (1 + document_frequency[term])) + 1.0
            vector[term] = (count / total) * idf
        vectors.append(vector)
    return vectors


def _cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    common = set(left) & set(right)
    dot = sum(left[key] * right[key] for key in common)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)


def semantic_similarity(resume_text: str, job_text: str) -> dict[str, float | str]:
    """Compare resume and job-description relevance with a dependency-free TF-IDF proxy.

    The implementation deliberately uses only Python's standard library so the API
    can deploy reliably on small cloud instances without compiling scientific packages.
    """
    resume = resume_text.strip()
    job = job_text.strip()

    if not resume or not job:
        return {
            "score": 0.0,
            "similarity": 0.0,
            "method": "TF-IDF word + bi-gram cosine similarity (dependency-free)",
        }

    documents = [_ngrams(_tokens(resume)), _ngrams(_tokens(job))]
    vectors = _tfidf_vectors(documents)
    similarity = max(0.0, min(1.0, _cosine_similarity(vectors[0], vectors[1])))

    return {
        "score": round(similarity * 100, 1),
        "similarity": round(similarity, 4),
        "method": "TF-IDF word + bi-gram cosine similarity (dependency-free)",
    }
