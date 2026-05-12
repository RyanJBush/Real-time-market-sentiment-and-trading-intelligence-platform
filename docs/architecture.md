# Atlas Architecture — Market Sentiment and Trading Intelligence Platform

> Atlas is an educational analytics project. It is **not financial advice**, does **not** execute real trades, and has **no brokerage integration**. All examples use synthetic/sample data.

## System Overview
Atlas follows a modular pipeline:
1. Ingest synthetic/sample market-news records.
2. Score article sentiment via NLP provider.
3. Aggregate ticker-level sentiment with decay/weighting.
4. Generate explainable BUY/SELL/HOLD signals.
5. Run historical analysis and paper-trade style simulation.
6. Serve results through API + dashboard.

## High-Level Components
- **Frontend (React + TypeScript):** dashboard, ticker drilldown, news feed, signals views.
- **API Layer (FastAPI):** versioned `/api/v1` routers for ingestion, sentiment, analytics, signals, backtesting, trust, streaming.
- **Service Layer:** NLP, aggregation, signal generation, backtesting, trust/explainability.
- **Persistence Layer:** SQLite/PostgreSQL models for news, sentiment, signals, annotations, ingestion runs.

## Data + Trading Scope Boundaries
- No broker adapters or OMS integration.
- No live exchange feeds.
- No production execution path.
- `paper-trade` functionality is simulation-only against synthetic prices.

## Recruiter-Relevant Engineering Patterns
- **Router → Service → Model separation** for maintainability.
- **Pluggable NLP provider** via protocol abstraction.
- **Deterministic default path** for reproducible demos/tests.
- **Explainability endpoints** for trust and auditability.
- **Composable API surface** suitable for future real-data adapters.

## Extension Path (future)
If evolving beyond portfolio scope:
- Add authenticated multi-tenant API.
- Add real data adapters behind ingestion interfaces.
- Add broker interface abstraction (without changing signal core).
- Add cost/slippage-aware evaluation + observability stack.
