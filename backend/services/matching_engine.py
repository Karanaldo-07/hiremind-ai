import re
from typing import Any

from backend.services.semantic_matcher import semantic_similarity


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def _unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        key = _normalize(value)
        if key not in seen:
            seen.add(key)
            result.append(value)
    return result


def _extract_years(text: str) -> int | None:
    patterns = [
        r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)",
        r"(?:experience|exp)[^\d]{0,20}(\d+)\+?\s*(?:years?|yrs?)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return int(match.group(1))
    return None


def _extract_education(text: str) -> list[str]:
    degrees = [
        "Bachelor", "B.E.", "B.Tech", "B.Sc", "Master", "M.E.", "M.Tech", "M.Sc", "MBA", "PhD", "Ph.D.",
    ]
    return [degree for degree in degrees if re.search(re.escape(degree), text, re.I)]


def _skill_match(resume_skills: list[str], job_skills: list[str]) -> tuple[list[str], list[str], list[str]]:
    resume_map = {_normalize(skill): skill for skill in resume_skills}
    matched: list[str] = []
    missing: list[str] = []
    for skill in job_skills:
        key = _normalize(skill)
        if key in resume_map:
            matched.append(skill)
        else:
            missing.append(skill)
    return matched, missing, _unique(resume_skills)


def calculate_match(resume_text: str, resume_skills: list[str], job: dict[str, Any]) -> dict[str, Any]:
    job_skills = job.get("required_skills") or job.get("skills") or []
    matched, missing, _ = _skill_match(resume_skills, job_skills)

    skill_score = round((len(matched) / len(job_skills)) * 100) if job_skills else 0

    resume_years = _extract_years(resume_text)
    required_years = job.get("experience_years")
    if required_years is None:
        experience_score = 100
        experience_reason = "No explicit experience requirement was detected."
    elif resume_years is None:
        experience_score = 50
        experience_reason = f"The job asks for about {required_years}+ years; resume experience could not be confidently quantified."
    else:
        experience_score = min(100, round((resume_years / required_years) * 100)) if required_years else 100
        experience_reason = f"Resume indicates about {resume_years} years versus {required_years}+ required."

    resume_education = _extract_education(resume_text)
    job_education = job.get("education") or []
    if not job_education:
        education_score = 100
        education_reason = "No explicit degree requirement was detected."
    else:
        education_score = 100 if any(
            _normalize(req) in {_normalize(item) for item in resume_education}
            or any(_normalize(req) in _normalize(item) or _normalize(item) in _normalize(req) for item in resume_education)
            for req in job_education
        ) else 0
        education_reason = "A matching degree type was detected." if education_score else "No clear matching degree type was detected."

    semantic = semantic_similarity(resume_text, job.get("raw_text", ""))
    semantic_score = float(semantic["score"])

    # Exact skills remain the strongest signal while text similarity captures
    # related terminology and context that exact skill matching can miss.
    overall = round(
        skill_score * 0.60
        + semantic_score * 0.20
        + experience_score * 0.10
        + education_score * 0.10
    )

    return {
        "match_score": overall,
        "score_breakdown": {
            "skills": skill_score,
            "semantic": semantic_score,
            "experience": experience_score,
            "education": education_score,
        },
        "matched_skills": matched,
        "missing_skills": missing,
        "job_title": job.get("title"),
        "experience": {
            "resume_years": resume_years,
            "required_years": required_years,
            "reason": experience_reason,
        },
        "education": {
            "resume_degrees": resume_education,
            "required_degrees": job_education,
            "reason": education_reason,
        },
        "semantic_analysis": semantic,
        "methodology": "60% exact required skills + 20% text relevance similarity + 10% experience fit + 10% education fit. Text relevance uses TF-IDF word and bi-gram cosine similarity for a lightweight local ML signal.",
    }
