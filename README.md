# Atlas — Market Sentiment and Trading Intelligence Platform

Atlas is a recruiter-friendly **FinTech analytics portfolio project** that demonstrates end-to-end product engineering across data ingestion, NLP sentiment analysis, backend APIs, time-series analytics, and frontend visualization.

> **Important disclaimer:** Atlas is an educational project using synthetic/sample data. It is **not financial advice** and **not investment advice**. It does **not** execute real trades, connect to brokerage accounts, or run production trading workflows.

## What Atlas demonstrates
- **Data product architecture:** ingestion → NLP scoring → aggregation → signaling → historical analysis.
- **ML/NLP integration:** pluggable sentiment providers (deterministic heuristic default; optional transformer backend).
- **Backend APIs:** versioned FastAPI routes, Pydantic schemas, SQLAlchemy models, health/readiness endpoints.
- **Analytics workflows:** source-weighted + time-decayed ticker scoring, scenario analysis, and paper-trade style simulation.
- **Frontend delivery:** React + TypeScript dashboard with sentiment KPIs, drilldowns, and API-backed views.
- **Engineering discipline:** tests, CI, containerization, and recruiter-ready documentation.

## Accuracy guardrails
- ✅ Not financial advice.
- ✅ No real trading claims.
- ✅ No brokerage integration claims.
- ✅ `paper-trade` endpoints are explicitly **paper-trade style simulation** only.
- ✅ No implication of real money, real brokerage accounts, or production trading.
- ✅ Uses synthetic/sample data language throughout.

## Quickstart
```bash
git clone https://github.com/RyanJBush/Real-time-market-sentiment-and-trading-intelligence-platform.git
cd Real-time-market-sentiment-and-trading-intelligence-platform
cd backend && pip install -r requirements.txt && cd ..
bash scripts/run_demo.sh
```

Frontend (optional):
```bash
cd frontend && npm ci && npm run dev
```

## Documentation map
- Architecture: `docs/architecture.md`
- API reference: `docs/api.md`
- Demo runbook: `docs/demo-runbook.md`
- Resume bullets: `docs/resume-bullets.md`
- Screenshot guide: `docs/screenshots/README.md`

## Tech stack
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, pandas, NumPy
- **Frontend:** React, TypeScript, Vite
- **Storage:** SQLite (default), PostgreSQL (compose)
- **Tooling:** pytest, ruff, Docker Compose, GitHub Actions

## Portfolio positioning (for recruiters)
Atlas is intentionally built to showcase capabilities relevant to:
- FinTech analytics engineering
- ML-enabled product development
- Backend API platform design
- Data-intensive application delivery

It is not intended for live investing or brokerage automation.
