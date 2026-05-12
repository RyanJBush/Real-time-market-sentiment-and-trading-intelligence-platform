# Atlas Architecture

> ⚠️ **Educational analytics project.** No real trading. No live broker integration (no Alpaca, no IBKR, no Robinhood). No live news API. No production deployment. All market data, news, and trades shown here are **synthetic / sample** fixtures generated for reproducibility.

## Services

- **FastAPI backend** — REST + WebSocket endpoints for ingestion, sentiment scoring, aggregation, signal generation, backtest-style historical comparison, trust/explainability, and briefings.
- **React + Vite + TypeScript dashboard** — multi-page UI (Dashboard, Ticker View, News Feed, Signals) with a fallback mock data layer for resilient offline demos.
- **SQLite (dev / CI) or PostgreSQL (Docker Compose)** — durable store for news items, sentiment records, signals, annotations, and ingestion runs.
- **NLP layer** — finance-tuned lexicon heuristic by default (deterministic, no model download); optional Transformers / FinBERT backend selectable via `NLP_PROVIDER`.

## Component Diagram

```
┌──────────────┐    ┌───────────────────────────────┐    ┌──────────────┐
│ React UI     │ ←→ │ FastAPI API (v1, JSON + WS)   │ ←→ │ SQLite /     │
│ (Vite/TS)    │    │  routers + services + models  │    │ PostgreSQL   │
└──────────────┘    └───────────┬───────────────────┘    └──────────────┘
                                │
                       ┌────────┴─────────┐
                       │  NLP Service     │
                       │  (heuristic |    │
                       │   FinBERT)       │
                       └──────────────────┘
```

## API Surface (v1)

| Group | Selected endpoints |
|---|---|
| News ingestion | `POST /news/ingest`, `POST /news/ingest-and-score`, `GET /news/ingest/status/{run_id}` |
| Sentiment | `POST /sentiment/analyze` |
| Analytics | `GET /analytics/ticker/{ticker}`, `/drilldown`, `/metrics`, `/articles`; `GET /analytics/overview`, `/events/distribution`, `/topics/clusters` |
| Signals | `GET /signals/ticker/{ticker}`, `POST /signals/watchlist`, `GET /signals/watchlist/alerts` |
| Backtesting | `POST /backtesting`, `POST /backtesting/tune`, `POST /backtesting/paper-trade`, `GET /backtesting/scenarios/{ticker}` |
| Trust | `GET /trust/signals/{ticker}/explanation`, `POST /trust/annotations`, `GET /trust/annotations/{ticker}`, `GET /trust/signals/{ticker}/audit` |
| Briefings | `GET /briefings/ticker/{ticker}`, `POST /briefings/watchlist` |
| Jobs | `POST /jobs/ingestion`, `POST /jobs/sentiment-batch`, `GET /jobs/{job_id}` |
| Replay | `POST /replay` |
| Streaming | `GET /streaming/status`, `WS /streaming/ws` |
| Health | `GET /health`, `GET /readiness` |

See [`api.md`](api.md) for full request/response examples.

## UI Surface

- **Dashboard** — KPI cards (sentiment index, active signals, top movers, watchlist alerts), trend chart, event tape.
- **Ticker View** — ticker-filtered sentiment composition, metrics chart, signal explainability with top contributing articles.
- **News Feed** — ticker-filtered ingestion rows with run summaries.
- **Signals** — signal table, watchlist scoring, live stream score panel.

## Pipeline Workflow

1. **Ingest** sample news articles for selected tickers across sources.
2. **Score** each article through the NLP service → label, score, confidence, topics, events, entity sentiment, cluster id.
3. **Persist** sentiment + ingestion metadata; **aggregate** rolling per-ticker stats (source-weighted, time-decayed).
4. **Generate signal** — BUY / SELL / HOLD with rationale + confidence based on weighted score vs thresholds.
5. **Historical comparison** — backtest signals against sample forward returns; report expectancy, confusion matrix, correlation.
6. **Stream** real-time sentiment updates to WebSocket subscribers.

## Design Notes

- **Router → Service → Model** layering keeps HTTP shape, business logic, and persistence cleanly separated.
- **Source weighting** (`services/weighting_service.py`) makes per-source trust tunable without touching scorer logic.
- **NLP provider is pluggable** via `SentimentProvider` Protocol so the FinBERT path can be swapped with a fine-tuned head later.
- **Aggregation cache** (`services/cache_service.py`) reduces repeated rolling-window work in hot dashboard reads.
- **Determinism by default** — the heuristic NLP path and synthetic price fixtures produce reproducible outputs so the demo is stable and tests stay hermetic.

## Component Responsibilities

| Component | Path | Responsibility |
|---|---|---|
| Routers | `backend/app/api/v1/routers/` | HTTP / WebSocket surface; request validation; thin orchestration over services |
| NLP service | `backend/app/services/nlp_service.py` | Sentiment scoring with `SentimentProvider` Protocol; lexicon heuristic + optional FinBERT |
| Aggregation service | `backend/app/services/aggregation_service.py` | Source-weighted, time-decayed rolling stats per ticker |
| Signal service | `backend/app/services/signal_service.py` | BUY / SELL / HOLD generation with thresholds, min-confidence gate, rationale |
| Backtest service | `backend/app/services/backtest_service.py` | Historical comparison vs synthetic forward returns; expectancy, confusion matrix, paper-trade NAV |
| Trust service | `backend/app/services/trust_service.py` | Top-contributing articles, annotations, audit log |
| News / ingestion service | `backend/app/services/news_service.py` | Generates deterministic synthetic news batches across 4 source types |
| Cache service | `backend/app/services/cache_service.py` | In-memory cache for hot dashboard reads |
| Models | `backend/app/models/` | SQLAlchemy models: news, sentiment, signal, annotation, ingestion, price |
| Schemas | `backend/app/schemas/` | Pydantic v2 request/response DTOs |
| Core | `backend/app/core/` | Settings, logging, request-id middleware |

## Data Model (high level)

```
News (article)
  ├── id, ticker, source, headline, body, published_at, ingested_at
  └── 1:1 ──► Sentiment
                ├── label, score, confidence
                ├── headline_score, body_score
                ├── topics[], events[], entity_sentiment, cluster_id
                └── model_used

Signal (per ticker, per evaluation)
  ├── ticker, label, weighted_score, confidence
  ├── buy_threshold, sell_threshold, min_confidence
  └── rationale, top_contributors_ref

Annotation                Ingestion run
  ├── ticker, note         ├── id, mode, sources, counts
  └── created_at           └── duplicates_skipped
```

## What is *not* in this architecture

- ❌ Broker / order-management adapter (no Alpaca, no IBKR, no execution venues).
- ❌ Live market-data feeds (no IEX, no Polygon, no Tiingo, no exchange WebSocket).
- ❌ Live news connectors (no NewsAPI, no RavenPack, no Benzinga, no Twitter/X firehose).
- ❌ Authentication / authorization / multi-tenancy / rate limiting.
- ❌ Production deployment, observability stack, alerting, on-call.

These are intentional out-of-scope items for a portfolio project. The codebase is structured (Protocol-based NLP provider, service-layer separation, `news_service` interface) so any of these can be added later without rewriting the rest of the stack.
