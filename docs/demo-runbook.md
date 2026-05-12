# Atlas Demo Runbook (Recruiter-Focused)

> Educational demo only. Not financial advice. No real trades, no brokerage integration, no production trading claims.

## Goal
Show end-to-end FinTech analytics + ML-enabled backend product skills in ~5 minutes.

## 1) Start the demo locally
```bash
cd backend && pip install -r requirements.txt && cd ..
bash scripts/run_demo.sh
```
Optional frontend:
```bash
cd frontend && npm ci && npm run dev
```

## 2) Narrative flow
1. **Ingestion:** trigger ingest-and-score on synthetic/sample news.
2. **NLP:** highlight sentiment label/score/confidence outputs.
3. **Aggregation:** show ticker-level weighted/decayed metrics.
4. **Signals:** explain BUY/SELL/HOLD decision + rationale field.
5. **Historical analytics:** run backtesting/scenarios and call out assumptions.
6. **Simulation:** show paper-trade style simulation as educational modeling only.

## 3) Must-say compliance line
"This project is a synthetic-data analytics simulation for engineering demonstration. It is not financial advice and does not perform real-money trading or brokerage execution."

## 4) Demo endpoints
```bash
curl -s http://localhost:8000/health
curl -s -X POST http://localhost:8000/api/v1/news/ingest-and-score
curl -s http://localhost:8000/api/v1/analytics/overview
curl -s http://localhost:8000/api/v1/signals/ticker/AAPL
curl -s "http://localhost:8000/api/v1/backtesting/scenarios/AAPL?start_date=2025-04-01&end_date=2025-05-01"
curl -s -X POST http://localhost:8000/api/v1/backtesting/paper-trade
```

## 5) Pre-demo check
```bash
make ci-local
```
If short on time:
```bash
cd backend && pytest -q
```
