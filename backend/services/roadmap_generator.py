from typing import Any


ROADMAP: dict[str, dict[str, Any]] = {
    "Deep Learning": {"priority": "high", "why": "The target role explicitly requires deep learning capabilities.", "actions": ["Review neural-network fundamentals", "Build one end-to-end deep learning project", "Practice model evaluation and error analysis"]},
    "NLP": {"priority": "high", "why": "Natural-language processing is a stated requirement for the target role.", "actions": ["Learn text preprocessing and representations", "Build a small NLP classification or retrieval project", "Practice explaining precision, recall, and F1"]},
    "PyTorch": {"priority": "high", "why": "The role mentions PyTorch and your resume does not show it as a detected skill.", "actions": ["Learn tensors, datasets, and training loops", "Implement a small neural network in PyTorch", "Practice saving, loading, and evaluating models"]},
    "AWS": {"priority": "medium", "why": "Cloud experience is relevant to the target role but is currently a detected gap.", "actions": ["Learn core AWS compute and storage concepts", "Deploy a small ML inference service", "Understand IAM and basic cloud cost controls"]},
    "Docker": {"priority": "medium", "why": "Containerization is requested and is useful for production ML deployment.", "actions": ["Learn images, containers, and Dockerfiles", "Containerize a FastAPI ML service", "Practice environment variables and health checks"]},
    "GitHub": {"priority": "medium", "why": "The role values collaborative software workflows and your resume does not show GitHub as a detected skill.", "actions": ["Use branches and pull requests", "Write useful README documentation", "Practice issues, code review, and versioned releases"]},
    "FastAPI": {"priority": "medium", "why": "FastAPI is directly relevant to serving ML models and is a detected job requirement.", "actions": ["Build typed REST endpoints", "Add validation and error handling", "Add automated API tests and OpenAPI documentation"]},
    "REST API": {"priority": "medium", "why": "Production ML systems commonly expose models through APIs.", "actions": ["Learn HTTP methods and status codes", "Design clean request/response schemas", "Practice authentication, validation, and versioning"]},
}


def generate_roadmap(missing_skills: list[str], matched_skills: list[str], job_title: str | None = None) -> dict[str, Any]:
    items: list[dict[str, Any]] = []
    for skill in missing_skills:
        item = ROADMAP.get(skill)
        if item:
            items.append({"skill": skill, **item})
        else:
            items.append({
                "skill": skill,
                "priority": "medium",
                "why": f"{skill} appears in the target job requirements but was not detected in the resume.",
                "actions": [f"Learn the core concepts of {skill}", f"Build a small practical project using {skill}", f"Prepare interview questions and examples for {skill}"],
            })

    priority_order = {"high": 0, "medium": 1, "low": 2}
    items.sort(key=lambda item: (priority_order.get(item["priority"], 1), item["skill"]))

    return {
        "job_title": job_title,
        "matched_skill_count": len(matched_skills),
        "gap_count": len(missing_skills),
        "roadmap": items,
        "strategy": "Close high-priority requirement gaps first, then strengthen deployment and production skills. Use a small project for each major gap so the skill becomes demonstrable evidence rather than only a course completion.",
    }
