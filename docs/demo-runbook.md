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
   - Trigger `▶ Ingest → Sentiment → Signal`.
   - Highlight run summary counts (articles ingested, sentiments scored, signals generated).
   - Note per-article sentiment label, score, confidence, and model used.
2. **Dashboard**
   - Press `▶ Start simulation` — data refreshes every 10 seconds, live event tape populates.
   - Walk through KPI cards (sentiment index, active signals, top movers, watchlist alerts).
   - Show ticker sentiment grid: NVDA green (+0.62), TSLA red (−0.14).
3. **Ticker View**
   - Select a ticker and show metrics chart (area-fill sparkline, trend colour).
   - Expand Sentiment Composition bar (positive/neutral/negative ratios + source breakdown).
   - Show Signal Explainability: top contributing articles with text previews and colour-coded labels.
   - Highlight source-contradiction detection where applicable.
4. **Signals**
   - Show watchlist signal table with signed weighted scores.
   - Show live stream event badges (ticker + label + score).
   - Highlight backtest scenario leaderboard (conservative/balanced/aggressive).

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
