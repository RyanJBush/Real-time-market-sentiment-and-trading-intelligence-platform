# Resume Bullets — Atlas (Market Sentiment & Paper-Trade Simulation Demo)

Use 3–6 bullets per application and tailor to the role.

## FinTech Analytics / Data Products
- Built Atlas, a full-stack portfolio demo that ingests market-news inputs, applies NLP sentiment scoring, and serves ticker intelligence through FastAPI endpoints and a React dashboard.
- Designed a modular analytics pipeline (News → NLP → Signal → Simulation) with reproducible fixtures and explainable output fields for sentiment rationale and confidence.
- Implemented source-weighted and time-decayed aggregation logic to generate BUY/SELL/HOLD-style signals for paper-trade style simulation.

## ML / NLP Engineering
- Implemented a pluggable sentiment-provider interface with a deterministic baseline and an optional transformer-backed path for comparative NLP behavior.
- Structured NLP outputs into consistent schemas (label, score, confidence, topics, entities, events) to support downstream analytics and UI views.

## Backend API Engineering
- Built versioned FastAPI services with typed Pydantic schemas, SQLAlchemy models, and domain endpoints for sentiment, analytics, signal review, and historical scenario analysis.
- Added health/readiness checks and CI-oriented quality tooling to support maintainable demo-scale backend development.

## Simulation / Evaluation
- Developed historical scenario workflows that evaluate signal behavior on sample datasets without implying brokerage execution.
- Delivered paper-trade style simulation features that let users explore strategy behavior without real-capital risk.
