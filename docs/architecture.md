# HireMind AI — Initial Architecture

## Product flow

```text
Resume + Job Description
          ↓
Document/Text Extraction
          ↓
Structured Information Extraction
          ↓
Skill & Requirement Analysis
          ↓
Semantic + Rule-Based Matching
          ↓
Explainable Match Score
          ↓
Skill Gap Analysis
          ↓
Interview Preparation
          ↓
Adaptive Mock Interview
          ↓
Interview Evaluation
          ↓
Progress Dashboard
```

## Initial system boundaries

- `frontend/`: Next.js application and user interface.
- `backend/`: FastAPI application, authentication, API routes and orchestration.
- `ml/`: reusable NLP/ML components and evaluation code.
- `tests/`: automated tests across backend and ML components.
- `docs/`: architecture, decisions and technical documentation.

## Design principles

1. Keep V1 small enough for one developer to understand and maintain.
2. Prefer deterministic/rule-based logic where it is more reliable than an LLM.
3. Use embeddings for semantic similarity rather than keyword matching alone.
4. Use an LLM for explanation, generation and conversational tasks—not as the only scoring mechanism.
5. Every important AI/ML component should have an evaluation strategy.
6. Keep provider-specific LLM code behind a small interface so providers can be changed later.
7. Never commit secrets, API keys, uploaded resumes or personal data.

## V1 components

- Resume upload and parsing
- Job description input and parsing
- Structured skill extraction
- Explainable resume/job matching
- Skill-gap analysis
- Interview question generation
- Mock interview session
- Interview evaluation
- User history/dashboard

Detailed schemas and API contracts will be added before implementation of each subsystem.
