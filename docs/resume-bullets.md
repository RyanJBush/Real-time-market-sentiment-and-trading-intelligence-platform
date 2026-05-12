# Resume Bullets — Atlas (Educational Sentiment + Simulation Project)

Use 3–6 bullets per application and tailor by role.

## Data Engineering / Analytics
- Built Atlas, a portfolio-scale market sentiment system that ingests news-like records, normalizes them into structured schemas, and serves analysis-ready outputs through FastAPI.
- Designed a reproducible pipeline (**News → NLP → Signal → Simulation**) with deterministic fixtures and endpoint-level validation for consistent demo runs.
- Implemented time-aware aggregation and source weighting to produce explainable ticker-level sentiment summaries on sample/delayed-style data.

## NLP / Applied ML
- Implemented sentiment scoring workflows that emit standardized fields (label, score, confidence, entities/topics) for downstream analytics and dashboard rendering.
- Structured sentiment results for interpretability, including rationale-style metadata used in signal explanations.
- Balanced model experimentation with deterministic baseline behavior to keep outputs debuggable in a portfolio environment.

## Backend / API Engineering
- Built versioned FastAPI services with typed Pydantic contracts and SQLAlchemy-backed persistence for ingest, analytics, and scenario endpoints.
- Added health/readiness coverage plus CI-oriented tests to improve reliability and maintainability of the demo stack.

## Simulation Logic (No Real Trading)
- Developed paper-trade style simulation endpoints that evaluate strategy behavior without broker execution or real capital exposure.
- Framed outputs explicitly as educational analytics, not financial advice or production trading automation.
