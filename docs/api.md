# Atlas API Reference

All endpoints are mounted under `/api/v1`. The full OpenAPI / Swagger UI is available at `http://localhost:8000/docs` when the backend is running.

> Educational project — sample/synthetic data, deterministic by default.

---

## Health

### `GET /health`
```bash
curl -s http://localhost:8000/health
# {"status":"ok"}
```

### `GET /readiness`
```bash
curl -s http://localhost:8000/readiness
# {"status":"ready"}
```

---

## News Ingestion

### `POST /api/v1/news/ingest`
Ingest a deterministic batch of sample articles across tickers and sources.

```bash
curl -s -X POST http://localhost:8000/api/v1/news/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "tickers": ["AAPL", "TSLA"],
    "limit_per_ticker": 2,
    "sources": ["financial_news", "social_curated"],
    "mode": "historical_backfill",
    "lookback_days": 7
  }'
```

Returns the inserted rows; the `X-Ingestion-Run-Id` response header gives you the run id for status lookups.

### `GET /api/v1/news/ingest/status/{run_id}`
Returns counts of records inserted, duplicates skipped, and per-source stats.

### `POST /api/v1/news/ingest-and-score`
Run ingestion + scoring + signal generation in one shot.

---

## Sentiment

### `POST /api/v1/sentiment/analyze`
Score a single piece of text.

```bash
curl -s -X POST http://localhost:8000/api/v1/sentiment/analyze \
  -H 'Content-Type: application/json' \
  -d '{
    "ticker": "AAPL",
    "source": "earnings_wire",
    "headline": "Apple beats estimates and raises guidance",
    "body": "Margin expansion across products and strong demand trends.",
    "compare_models": true
  }'
```

Response includes `label`, `score`, `confidence`, `headline_score`, `body_score`, `topics`, `events`, `entity_sentiment`, `cluster_id`, `model_used`, and optional `model_comparison`.

---

## Analytics (Ticker Aggregation & Time-Series)

### `GET /api/v1/analytics/ticker/{ticker}`
Source-weighted, time-decayed rolling aggregate per ticker.

### `GET /api/v1/analytics/ticker/{ticker}/drilldown?lookback_hours=120`
Aggregate + recent sentiment history (time-series points).

### `GET /api/v1/analytics/ticker/{ticker}/metrics?lookback_hours=120&bucket_hours=6`
Bucketed time-series of sentiment for charts.

### `GET /api/v1/analytics/overview?lookback_hours=24&watchlist=AAPL&watchlist=MSFT`
KPI overview across a watchlist.

### `GET /api/v1/analytics/events/distribution?lookback_hours=120`
Counts of detected events (earnings, macro, product, legal, m&a, general).

### `GET /api/v1/analytics/topics/clusters?lookback_hours=120`
Topic-cluster groupings keyed by `cluster_id`.

---

## Signals

### `GET /api/v1/signals/ticker/{ticker}`
```bash
curl -s "http://localhost:8000/api/v1/signals/ticker/AAPL?buy_threshold=0.1&sell_threshold=-0.1&min_confidence=0.1"
```
Returns the current signal (`BUY` / `SELL` / `HOLD`), confidence, weighted score, threshold inputs, rationale, and contributing factors.

### `POST /api/v1/signals/watchlist`
Score a list of tickers in one call.

### `GET /api/v1/signals/watchlist/alerts?tickers=NVDA&tickers=AAPL&lookback_hours=72`
Flag breach-threshold alerts with severity.

---

## Backtesting (Historical Comparison)

> Educational walk-forward against synthetic price fixtures, not a production backtester.

### `POST /api/v1/backtesting`
```bash
curl -s -X POST http://localhost:8000/api/v1/backtesting \
  -H 'Content-Type: application/json' \
  -d '{
    "ticker": "MSFT",
    "start_date": "2025-04-01",
    "end_date": "2025-05-01",
    "buy_threshold": 0.1,
    "sell_threshold": -0.1,
    "min_confidence": 0.1
  }'
```
Returns per-day rows (`next_day_return` included), expectancy, average return per trade, cumulative proxy return vs benchmark, confusion matrix, return correlation, and an `assumptions` block listing simplifications.

### `POST /api/v1/backtesting/tune`
Threshold grid sweep — returns the best candidate by expectancy.

### `GET /api/v1/backtesting/scenarios/{ticker}?start_date=...&end_date=...`
Named scenarios (conservative / balanced / aggressive).

### `POST /api/v1/backtesting/paper-trade`
Educational portfolio NAV simulation against synthetic prices. **Not real trading.**

---

## Trust & Explainability

### `GET /api/v1/trust/signals/{ticker}/explanation?lookback_hours=48&top_n=3`
Top contributing articles to the current signal.

### `POST /api/v1/trust/annotations`
Persist an analyst note tied to a ticker.

### `GET /api/v1/trust/annotations/{ticker}?limit=10&offset=0`
List annotations.

### `GET /api/v1/trust/signals/{ticker}/audit`
Signal audit entries.

---

## Briefings

### `GET /api/v1/briefings/ticker/{ticker}?lookback_hours=48`
Auto-generated briefing for one ticker.

### `POST /api/v1/briefings/watchlist`
Watchlist recap across multiple tickers.

---

## Jobs & Replay

### `POST /api/v1/jobs/ingestion`
Run ingestion as a tracked job.

### `POST /api/v1/jobs/sentiment-batch`
Batch-score a list of items.

### `GET /api/v1/jobs/{job_id}`
Status lookup.

### `POST /api/v1/replay`
Deterministic replay of synthetic events seeded by `seed`.

---

## Streaming

### `GET /api/v1/streaming/status`
Snapshot of the streaming layer.

### `WS /api/v1/streaming/ws`
WebSocket — echoes back JSON events with timestamps. Used by the dashboard live feed.
