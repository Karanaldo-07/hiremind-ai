from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def semantic_similarity(resume_text: str, job_text: str) -> dict[str, float | str]:
    """Compare resume and job-description relevance with a lightweight local text model.

    This intentionally avoids PyTorch/model downloads so the API remains reliable on
    small cloud instances. TF-IDF word/bi-gram similarity is used as a semantic proxy;
    a true embedding provider can be plugged into this interface later.
    """
    resume = resume_text.strip()
    job = job_text.strip()

    if not resume or not job:
        return {
            "score": 0.0,
            "similarity": 0.0,
            "method": "TF-IDF n-gram similarity",
        }

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True,
        max_features=8000,
    )

    try:
        matrix = vectorizer.fit_transform([resume, job])
        similarity = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])
    except ValueError:
        similarity = 0.0

    similarity = max(0.0, min(1.0, similarity))

    return {
        "score": round(similarity * 100, 1),
        "similarity": round(similarity, 4),
        "method": "TF-IDF word + bi-gram similarity (lightweight semantic proxy)",
    }
