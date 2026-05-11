# Resume Bullets — Atlas (Market Sentiment & Trading Intelligence Platform)

ATS-friendly, one-line, third-person-neutral bullets you can drop directly into a resume. Pick 3–6 that best match the role you're applying to. Every bullet is intentionally honest — no claims of production use, real trading, real users, or investment performance.

---

## Headline / lead bullets

- Built **Atlas**, a full-stack FinTech analytics platform that ingests sample financial news, scores ticker-level sentiment with an NLP pipeline, and visualizes signals on a React dashboard.
- Designed and shipped an end-to-end market-sentiment pipeline (ingestion → NLP scoring → ticker aggregation → signal generation → backtest-style historical comparison) in **Python**, **FastAPI**, and **React**.
- Delivered a portfolio-grade FinTech intelligence project covering NLP, time-series analytics, dashboards, and CI in a single monorepo with 22 passing automated tests.

---

## NLP / sentiment analysis

- Implemented a dual sentiment-scoring layer combining a **finance-tuned lexicon heuristic** (deterministic, reproducible) with an optional **FinBERT Transformers** backend behind a `SentimentProvider` Protocol.
- Engineered finance-aware confidence calibration that re-weights raw scores using domain term hits (positive, negative, uncertainty) to reduce false-positive bullish/bearish signals.
- Added topic and event extraction (earnings, macro, product, legal, M&A) plus entity-level sentiment projection per article using regex + keyword routing.
- Produced article-cluster IDs by hashing detected topic sets to enable downstream deduping and theme-level aggregation.

---

## Financial data & analytics

- Designed a multi-source ingestion service unifying financial news, social-curated, press release, earnings wire, and synthetic price feeds under one SQLAlchemy schema with deterministic fixtures for reproducibility.
- Built a **source-weighted, time-decayed aggregation service** with caching that turns per-article sentiment into rolling ticker-level metrics (weighted score, confidence, breadth, volatility).
- Implemented configurable BUY/SELL/HOLD signal generation with explicit thresholds, min-confidence gate, rationale strings, and persisted audit trails.

---

## Backtesting / time-series / historical comparison

- Implemented an educational **backtest-style historical comparison module** that walks scored sentiment against synthetic forward returns and reports expectancy, average return per trade, cumulative proxy vs benchmark, return correlation, and a signal-vs-realized confusion matrix.
- Added threshold-sweep tuning and named scenario presets (conservative / balanced / aggressive) so users can compare signal regimes on the same window.
- Built a portfolio NAV simulation ("paper-trade") against synthetic prices with configurable initial cash and position sizing — explicitly framed as analytics-only, not real trading.

---

## API engineering

- Designed and implemented a **versioned FastAPI surface (11+ routers)** covering ingestion, sentiment, analytics, signals, backtesting, trust, briefings, jobs, replay, and WebSocket streaming.
- Layered the backend cleanly as **Router → Service → Model** with Pydantic v2 schemas, request-ID middleware, structured logging, and `/health` + `/readiness` probes.
- Generated an OpenAPI spec at `/api/v1/openapi.json` and Swagger UI at `/docs` for self-service exploration.

---

## Dashboard / frontend

- Built a **React + Vite + TypeScript** analyst dashboard with Tailwind styling, KPI cards, sentiment-composition bars, ticker drilldown, signal explainability, and a resilient mock-data fallback layer.
- Integrated a WebSocket-driven live event tape and an in-app simulation toggle for offline recruiter demos.

---

## Engineering practices

- Set up **GitHub Actions CI** to run `ruff` lint, `pytest`, and the frontend production build on every PR; configured Python 3.11, pip caching, and matrix-friendly working directories.
- Authored **22 pytest end-to-end tests** covering ingestion, sentiment, aggregation, signals, watchlist alerts, trust, annotations, jobs, replay, briefings, streaming, and backtesting against an in-memory SQLite.
- Containerized the stack with Docker Compose (Postgres + backend + frontend) and added a Makefile for one-command local dev (`up`, `test`, `lint`, `demo-seed`, `ci-local`).

---

## Short / micro bullets (use when space is tight)

- Built a full-stack FinTech sentiment-to-signal analytics platform in Python (FastAPI), pandas, and React (TypeScript).
- Implemented a dual heuristic + FinBERT NLP scorer with finance-tuned confidence calibration and topic/event/entity extraction.
- Built a source-weighted, time-decayed ticker aggregation service generating explainable BUY/SELL/HOLD signals.
- Implemented an educational backtest module reporting expectancy, confusion matrix, and return correlation against synthetic prices.
- Shipped a React + Vite analyst dashboard with KPI cards, drilldowns, and a live WebSocket event tape.
- Set up GitHub Actions CI (ruff + pytest + Vite build) on a monorepo with 22 passing automated tests.
