# Atlas — Demo Runbook

> ⚠️ Educational portfolio project. **Not financial advice.** No real trades. No broker integration. All data is **synthetic / sample**.

A reproducible local walkthrough for recruiter demos and technical interviews. Targets ~5 minutes of speaking time.

---

## 0) Prerequisites (one-time)

- Python 3.11+
- Node.js 18+
- (Optional) Docker + Docker Compose

```bash
git clone https://github.com/RyanJBush/Real-time-market-sentiment-and-trading-intelligence-platform.git
cd Real-time-market-sentiment-and-trading-intelligence-platform
```

---

## 1) Fastest path — one-shot end-to-end demo

```bash
cd backend && pip install -r requirements.txt && cd ..
bash scripts/run_demo.sh
```

What this does, narrated:
1. Boots FastAPI on `http://localhost:8000` with deterministic heuristic NLP and a local SQLite DB.
2. Ingests synthetic news for AAPL / TSLA / NVDA across multiple sources.
3. Scores each article (sentiment label, score, confidence, topics, events, entity sentiment, cluster id).
4. Aggregates per-ticker with source weighting + time decay.
5. Generates BUY / SELL / HOLD signals with thresholds and rationale.
6. Runs a backtest-style historical comparison and prints expectancy + assumptions.

---

## 2) Full stack with the React dashboard

```bash
# Terminal A — backend
make up
# Backend API:  http://localhost:8000
# Swagger UI:   http://localhost:8000/docs
# Frontend UI:  http://localhost:5173
```

Or run them separately:

```bash
# Backend (heuristic NLP, on-disk SQLite, auto-create tables)
cd backend
NLP_PROVIDER=heuristic DATABASE_URL="sqlite:///./atlas.db" AUTO_CREATE_TABLES=true \
  PYTHONPATH=. uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm ci && npm run dev
```

---

## 3) Seed deterministic demo data

```bash
make demo-seed
```

Or with custom scope:

```bash
cd backend
NLP_PROVIDER=heuristic PYTHONPATH=. python scripts/seed_demo.py \
  --tickers AAPL MSFT NVDA \
  --lookback-days 45 \
  --limit-per-ticker 3
```

---

## 4) Health & readiness

```bash
curl -s http://localhost:8000/health      # {"status":"ok"}
curl -s http://localhost:8000/readiness   # {"status":"ready"}
```

---

## 5) Suggested 5-minute demo story

> Frame it: "This is an educational FinTech analytics pipeline on synthetic data — the goal is to show end-to-end engineering, not to predict markets."

### Beat 1 — News Feed (≈45s)
- Click `▶ Ingest → Sentiment → Signal`.
- Call out the run summary: articles ingested, sentiments scored, signals generated.
- Point at per-article rows: ticker, source, headline, label/score/confidence, model used.

### Beat 2 — Dashboard (≈60s)
- Click `▶ Start simulation` — data refreshes every ~10s; live event tape populates.
- Walk the KPI cards: sentiment index, active signals, top movers, watchlist alerts.
- Show the ticker sentiment grid (e.g., NVDA green, TSLA red) — note these are **synthetic** values.

### Beat 3 — Ticker View (≈90s)
- Pick a ticker. Show metrics chart (area-fill sparkline, trend colour).
- Expand the Sentiment Composition bar (positive / neutral / negative + source breakdown).
- Open Signal Explainability — point at top contributing articles with text previews and colour-coded labels.
- Highlight source-contradiction detection where present.

### Beat 4 — Signals & Backtest (≈90s)
- Show the watchlist signal table with signed weighted scores.
- Show live stream event badges (ticker + label + score).
- Run `GET /api/v1/backtesting/scenarios/{ticker}` — point at the conservative / balanced / aggressive results.
- Open the response's `assumptions` block and read out the explicit caveats (synthetic prices, no costs, no slippage).

### Beat 5 — Trust + API docs (≈45s)
- Show `GET /api/v1/trust/signals/{ticker}/explanation` and `/audit`.
- Open `http://localhost:8000/docs` — call out the 11 routers, Pydantic v2 schemas, OpenAPI spec.

---

## 6) API endpoints worth showing live

| Endpoint | What to point at |
|---|---|
| `POST /api/v1/news/ingest-and-score` | One call drives the whole pipeline |
| `GET /api/v1/analytics/ticker/{ticker}/drilldown` | Time-series + aggregate in one payload |
| `GET /api/v1/trust/signals/{ticker}/explanation` | Top contributing articles (explainability) |
| `GET /api/v1/backtesting/scenarios/{ticker}?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | Named scenario comparison |
| `POST /api/v1/backtesting/paper-trade` | NAV simulation — **not real trading** |
| `WS /api/v1/streaming/ws` | WebSocket event tape |

---

## 7) Pre-demo verification checklist

```bash
make ci-local
```

Runs:
- Backend tests (`pytest -q`) — should print **22 passed**.
- Frontend lint (`npm run lint`).
- Frontend production build (`npm run build`).

Also worth doing right before the demo:
- Hard-refresh the browser tab on the dashboard.
- Wipe `atlas.db` / `atlas-demo.db` if you want a clean run: `rm -f backend/atlas.db backend/atlas-demo.db`.
- Confirm `curl -s http://localhost:8000/health` returns `{"status":"ok"}`.

---

## 8) Talking points / questions to expect

- **"Is this real money / real trading?"** → No. Educational simulation on synthetic data. No broker integration.
- **"Where does the news come from?"** → A deterministic in-code generator plus `data/sample_news.json`. No live news API is wired in.
- **"How accurate is the sentiment model?"** → The default is a finance-tuned lexicon heuristic — chosen for determinism, not raw accuracy. FinBERT is available as an alternative provider.
- **"What would change if you added a real broker?"** → A new adapter behind a `BrokerProvider` Protocol mirroring how `SentimentProvider` works today. The signal layer would feed an order-management service rather than the paper-trade NAV simulator.
- **"What's missing for production?"** → Auth, real data feeds, walk-forward + transaction-cost-aware backtester, observability stack, deployment. Documented in the README's Limitations table.
