# Helix AI Demo Runbook (Phase 5)

This runbook provides a reproducible local flow for recruiter demos and technical walkthroughs.

## 1) Environment setup

```bash
# from repo root
make up
```

Backend API: `http://localhost:8000`  
Frontend UI: `http://localhost:5173`

## 2) Seed deterministic demo data

Use the deterministic heuristic NLP mode for stable, repeatable output:

```bash
make demo-seed
```

Optional custom seed scope:

```bash
cd backend
NLP_PROVIDER=heuristic PYTHONPATH=. python scripts/seed_demo.py \
  --tickers AAPL MSFT NVDA \
  --lookback-days 45 \
  --limit-per-ticker 3
```

## 3) Health and readiness checks

```bash
curl -s http://localhost:8000/health
curl -s http://localhost:8000/readiness
```

## 4) Suggested demo story

1. **News Feed**
   - Trigger `Run ingest → sentiment → signal`.
   - Highlight run summary counts.
2. **Dashboard**
   - Click `Refresh data`.
   - Walk through KPI cards, watchlist signals, and alert severities.
3. **Ticker View**
   - Select ticker and show metrics chart + article table.
   - Show sentiment history and signal explainability contributors.
4. **Signals**
   - Show live watchlist signal table.
   - Highlight scenario leaderboard (conservative/balanced/aggressive).

## 5) API endpoints for live proof points

- `POST /api/v1/news/ingest-and-score`
- `GET /api/v1/analytics/ticker/{ticker}/drilldown`
- `GET /api/v1/trust/signals/{ticker}/explanation`
- `GET /api/v1/backtesting/scenarios/{ticker}?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

## 6) Pre-demo verification checklist

```bash
make ci-local
```

`make ci-local` runs:
- backend tests
- frontend lint
- frontend production build
