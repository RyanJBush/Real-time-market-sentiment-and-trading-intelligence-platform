# Atlas API Documentation

All endpoints are mounted under `/api/v1` (except `/health` and `/readiness`).

> **Scope disclaimer:** educational portfolio APIs on synthetic/sample data. Not financial advice. No real trades. No brokerage integration. `paper-trade` routes run paper-trade style simulation only.

## Core Endpoint Groups
- **Health:** `/health`, `/readiness`
- **News:** `/api/v1/news/*`
- **Sentiment:** `/api/v1/sentiment/*`
- **Analytics:** `/api/v1/analytics/*`
- **Signals:** `/api/v1/signals/*`
- **Backtesting + Simulation:** `/api/v1/backtesting/*`
- **Trust/Explainability:** `/api/v1/trust/*`
- **Briefings:** `/api/v1/briefings/*`
- **Jobs:** `/api/v1/jobs/*`
- **Replay:** `/api/v1/replay`
- **Streaming:** `/api/v1/streaming/*`

## Key Recruiter Demo Calls
```bash
# Health
curl -s http://localhost:8000/health

# Ingest + score synthetic records
curl -s -X POST http://localhost:8000/api/v1/news/ingest-and-score

# Retrieve ticker analytics
curl -s http://localhost:8000/api/v1/analytics/ticker/AAPL

# Retrieve signal explanation
curl -s http://localhost:8000/api/v1/trust/signals/AAPL/explanation

# Run historical scenario comparison
curl -s "http://localhost:8000/api/v1/backtesting/scenarios/AAPL?start_date=2025-04-01&end_date=2025-05-01"
```

## Backtesting + Paper-Trade Clarification
- `/api/v1/backtesting` compares signals to synthetic forward returns.
- `/api/v1/backtesting/tune` performs threshold sweeps.
- `/api/v1/backtesting/paper-trade` simulates portfolio NAV behavior.
- None of these endpoints place orders or connect to brokerage APIs.

## OpenAPI / Swagger
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json` (or app-mounted equivalent)
