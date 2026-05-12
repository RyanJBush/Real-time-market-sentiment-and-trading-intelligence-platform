# Atlas — Market Sentiment & Paper-Trade Simulation Demo

Atlas is a portfolio demo that analyzes market-news sentiment and turns it into explainable trading signals for paper-trade style simulation.

## Recruiter-facing summary
I built Atlas to demonstrate practical product engineering across backend APIs, NLP-driven analytics, and frontend data visualization in a finance-themed domain. The project is intentionally demo-scale and transparent about scope: it uses synthetic/sample workflows and simulation rather than real brokerage execution. I am a **University of Maryland student studying Information Science and Electrical Engineering with a Business minor.**

> ⚠️ **Not financial advice.** This is a portfolio demo for educational purposes only. It does not execute real trades or manage real capital. Always do your own research before making investment decisions.

## What this project demonstrates
- Designing a sentiment pipeline from ingestion through signal generation.
- Building typed, versioned FastAPI services with clear domain endpoints.
- Implementing explainable analytics (source weighting + time decay + confidence metadata).
- Shipping a React/TypeScript dashboard for recruiter-friendly product presentation.
- Framing strategy output as paper-trade style simulation instead of live execution.

## Tech stack
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, pandas, NumPy
- **Frontend:** React, TypeScript, Vite
- **Data/Storage:** SQLite (default), PostgreSQL (Docker Compose option)
- **Tooling:** pytest, ruff, Docker Compose, GitHub Actions

## Architecture overview
- High-level architecture: `docs/architecture.md`
- API surface and contracts: `docs/api.md`
- Demo run sequence: `docs/demo-runbook.md`

Pipeline summary: **News → NLP → Signal → Simulation**

## How to run locally
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

## Demo workflow
1. Start the backend demo script and confirm API health/readiness endpoints.
2. Open the frontend and inspect ticker sentiment summaries, source-level context, and signal outputs.
3. Run historical/scenario endpoints to review paper-trade style simulation behavior.
4. Review trust/explainability fields (rationale + confidence) in API responses.

## Screenshots / demo section
Captured screenshots are available in `docs/screenshots/`:
- `01-dashboard.png`
- `02-news-feed.png`
- `03-signal-output.png`
- `04-backtest-result.png`
- `05-api-docs.png`

Portfolio preview page: `docs/preview/index.html`

## Limitations and future work
- Market inputs are demo-oriented and should be treated as delayed/simulated, not low-latency live-feed infrastructure.
- No brokerage connectivity or real order routing is implemented.
- Signal logic is designed for explainability in a portfolio context, not investment performance guarantees.
- Future work: broader data-source adapters, deeper model evaluation tooling, and richer scenario controls.

## Resume bullets
- `docs/resume-bullets.md`

## License
This repository is licensed under the terms in `LICENSE`.
