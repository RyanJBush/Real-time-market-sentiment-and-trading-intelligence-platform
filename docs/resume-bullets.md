# Resume Bullets — Atlas (Market Sentiment and Trading Intelligence Platform)

Use 3–6 bullets per application. All bullets are truthful for an educational, synthetic-data portfolio project.

> Not financial advice. No real trading claims. No brokerage integration claims. Paper-trade style simulation only.

## FinTech Analytics / Data Products
- Built Atlas, a full-stack FinTech analytics platform that ingests synthetic market-news data, performs NLP sentiment scoring, and exposes ticker intelligence through a React dashboard and FastAPI APIs.
- Designed a modular data-product pipeline (ingestion → scoring → aggregation → signals → historical analytics) with reproducible synthetic fixtures and deterministic default behavior.
- Implemented source-weighted, time-decayed sentiment aggregation to generate explainable ticker-level BUY/SELL/HOLD signals with rationale and confidence metadata.

## ML / NLP Engineering
- Implemented a pluggable sentiment architecture with a deterministic heuristic provider and optional transformer-based backend under a shared provider interface.
- Produced structured NLP outputs (label, score, confidence, topics, events, and entity sentiment) for downstream analytics and product surfaces.

## Backend API Engineering
- Built versioned FastAPI services with typed Pydantic schemas, SQLAlchemy persistence, and endpoint groups spanning sentiment, analytics, signals, backtesting, trust, and streaming.
- Added health/readiness probes, test coverage, and CI automation for production-style engineering rigor in a portfolio codebase.

## Simulation / Evaluation
- Implemented historical analysis and threshold scenario testing over synthetic data to evaluate signal behavior.
- Delivered paper-trade style portfolio simulation for educational performance exploration without real-money execution.
