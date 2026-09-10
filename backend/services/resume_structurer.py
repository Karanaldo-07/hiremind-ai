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
    "Docker": r"\bdocker\b",
    "Git": r"\bgit\b",
    "GitHub": r"\bgithub\b",
}

SECTION_ALIASES = {
    "education": {"education", "academic background", "academics"},
    "skills": {"technical skills", "skills", "technical skill"},
    "experience": {"experience", "work experience", "professional experience"},
    "projects": {"projects", "academic projects", "personal projects"},
    "certifications": {"certifications", "certificates", "achievements & certifications", "achievements and certifications"},
}


def _normalize_lines(text: str) -> list[str]:
    return [re.sub(r"\s+", " ", line).strip() for line in text.splitlines() if line.strip()]


def _extract_email(text: str) -> str | None:
    match = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.I)
    return match.group(0) if match else None


def _extract_phone(text: str) -> str | None:
    match = re.search(r"(?:\+?\d[\d\s().-]{8,}\d)", text)
    return re.sub(r"\s+", " ", match.group(0)).strip() if match else None


def _extract_linkedin(text: str) -> str | None:
    match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[A-Za-z0-9_-]+", text, re.I)
    return match.group(0) if match else None


def _find_name(lines: list[str]) -> str | None:
    for line in lines[:5]:
        if not any(token in line.lower() for token in ["@", "linkedin", "resume", "curriculum vitae"]):
            words = line.split()
            if 2 <= len(words) <= 5 and all(re.fullmatch(r"[A-Za-z.'-]+", word) for word in words):
                return line
    return None


def _section_content(lines: list[str]) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {key: [] for key in SECTION_ALIASES}
    current: str | None = None
    aliases = {alias.lower(): key for key, values in SECTION_ALIASES.items() for alias in values}

    for line in lines:
        normalized = re.sub(r"[^a-z& ]", "", line.lower()).strip()
        key = aliases.get(normalized)
        if key:
            current = key
            continue
        if current:
            sections[current].append(line)
    return sections


def structure_resume(text: str) -> dict[str, Any]:
    lines = _normalize_lines(text)
    sections = _section_content(lines)

    skills = [name for name, pattern in SKILL_PATTERNS.items() if re.search(pattern, text, re.I)]

    return {
        "contact": {
            "name": _find_name(lines),
            "email": _extract_email(text),
            "phone": _extract_phone(text),
            "linkedin": _extract_linkedin(text),
        },
        "skills": skills,
        "sections": {
            key: values[:80] for key, values in sections.items()
        },
        "metadata": {
            "character_count": len(text),
            "line_count": len(lines),
            "skills_detected": len(skills),
        },
    }
