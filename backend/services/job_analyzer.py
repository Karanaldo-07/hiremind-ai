import re
from typing import Any


SKILL_PATTERNS = {
    "Python": r"\bpython\b",
    "SQL": r"\bsql\b",
    "Machine Learning": r"\bmachine learning\b",
    "Deep Learning": r"\bdeep learning\b",
    "NLP": r"\bnatural language processing\b|\bnlp\b",
    "TensorFlow": r"\btensorflow\b",
    "Keras": r"\bkeras\b",
    "PyTorch": r"\bpytorch\b",
    "scikit-learn": r"\bscikit[- ]learn\b|\bsklearn\b",
    "Pandas": r"\bpandas\b",
    "NumPy": r"\bnumpy\b",
    "Matplotlib": r"\bmatplotlib\b",
    "Power BI": r"\bpower\s*bi\b",
    "Azure": r"\bazure\b",
    "AWS": r"\baws\b|amazon web services",
    "GCP": r"\bgcp\b|google cloud platform",
    "Docker": r"\bdocker\b",
    "Kubernetes": r"\bkubernetes\b|\bk8s\b",
    "Git": r"\bgit\b",
    "GitHub": r"\bgithub\b",
    "Java": r"\bjava\b",
    "C++": r"\bc\+\+\b",
    "JavaScript": r"\bjavascript\b",
    "TypeScript": r"\btypescript\b",
    "React": r"\breact(?:\.js)?\b",
    "FastAPI": r"\bfastapi\b",
    "REST API": r"\brest(?:ful)?\s+api(?:s)?\b",
    "PostgreSQL": r"\bpostgres(?:ql)?\b",
    "MongoDB": r"\bmongodb\b",
}

REQUIRED_MARKERS = (
    "required",
    "must have",
    "must-have",
    "essential",
    "mandatory",
    "you will need",
)

PREFERRED_MARKERS = (
    "preferred",
    "nice to have",
    "good to have",
    "plus",
    "bonus",
    "desired",
)


def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _extract_title(text: str) -> str | None:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for line in lines[:8]:
        if len(line) <= 100 and any(token in line.lower() for token in ("engineer", "developer", "scientist", "analyst", "architect", "manager", "intern")):
            return line
    return lines[0] if lines and len(lines[0]) <= 100 else None


def _skills(text: str) -> list[str]:
    return [name for name, pattern in SKILL_PATTERNS.items() if re.search(pattern, text, re.I)]


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
        "Bachelor's", "Bachelor", "B.E.", "B.Tech", "B.Sc", "Master's", "Master", "M.E.", "M.Tech", "M.Sc", "MBA", "PhD", "Ph.D.",
    ]
    return [degree for degree in degrees if re.search(re.escape(degree), text, re.I)]


def analyze_job_description(text: str) -> dict[str, Any]:
    cleaned = _clean_text(text)
    skills = _skills(cleaned)
    lower = cleaned.lower()
    required_skills = [skill for skill in skills if any(marker in lower for marker in REQUIRED_MARKERS)]
    preferred_skills = [skill for skill in skills if any(marker in lower for marker in PREFERRED_MARKERS)]

    # If the description does not clearly separate required/preferred language,
    # keep all detected skills as the working requirements for later matching.
    if not required_skills:
        required_skills = skills.copy()

    return {
        "title": _extract_title(text),
        "skills": skills,
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "experience_years": _extract_years(cleaned),
        "education": _extract_education(cleaned),
        "text_length": len(cleaned),
    }
