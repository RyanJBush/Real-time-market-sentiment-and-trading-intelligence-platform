![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![CI](https://github.com/RyanJBush/Real-time-market-sentiment-and-trading-intelligence-platform/actions/workflows/ci.yml/badge.svg)

# Atlas

**Real-Time Market Sentiment & Trading Intelligence Platform**

[**🔗 View Live Preview →**](https://www.perplexity.ai/computer/a/atlas-preview-project-2-of-9-lCA5DWRgQoa4AN6VYPXAUQ)

> A production-style market sentiment and trading intelligence platform that aggregates financial news and social signals, scores sentiment with an NLP pipeline, generates trade signals, and surfaces insights on a live analyst dashboard.

---

## 🎯 What I Built & Why

Sentiment is one of the most persistent alpha sources in quantitative finance, but translating raw text signals into tradeable intelligence is non-trivial. I built Atlas to work through the complete pipeline:

- **Multi-source ingestion** — financial news, Reddit/WSB, SEC filings, and earnings call transcripts — because single-source sentiment is easy to game and slow to react
- **NLP sentiment scoring** — FinBERT-style financial domain scoring, not generic VADER, since financial language has domain-specific sentiment polarity
- **Signal generation & backtesting** — sentiment signals are turned into directional trade signals and validated against historical price data to measure whether they actually produced alpha
- **Paper trading mode** — signals feed into a simulated broker API (Alpaca-compatible) for end-to-end validation without real capital

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Ingestion["Data Ingestion"]
        NEWS["Financial News\nAPI"]
        REDDIT["Reddit / WSB\nScraper"]
        SEC["SEC Filings\nParser"]
        EARNINGS["Earnings Call\nTranscripts"]
    end

    subgraph API["FastAPI Backend"]
        R_FEED["feed router\n/api/feed"]
        R_SENTIMENT["sentiment router\n/api/sentiment"]
        R_SIGNALS["signals router\n/api/signals"]
        R_BACKTEST["backtest router\n/api/backtest"]
        R_PAPER["paper trading router\n/api/paper"]
        R_WATCHLIST["watchlist router\n/api/watchlist"]
        R_AUTH["auth router"]
    end

    subgraph NLP["NLP Pipeline"]
        FINBERT["FinBERT\nSentiment Scorer"]
        AGGREGATOR["Signal\nAggregator"]
        BACKTEST_ENGINE["Backtest\nEngine"]
        PAPER_BROKER["Paper Trading\nBroker (Alpaca API)"]  
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL\nArticles · Scores · Signals · Trades")]
    end

    subgraph UI["Analyst Dashboard"]
        DASH["React + TypeScript\nSentiment Feed · Signal View · Backtest Results"]
    end

    NEWS & REDDIT & SEC & EARNINGS --> R_FEED
    R_FEED --> FINBERT
    FINBERT --> AGGREGATOR
    AGGREGATOR --> R_SIGNALS
    R_SIGNALS --> BACKTEST_ENGINE & PAPER_BROKER
    R_FEED & R_SENTIMENT & R_SIGNALS & R_BACKTEST & R_PAPER --> PG
    DASH -->|"JWT"| R_AUTH
    DASH --> R_FEED & R_SENTIMENT & R_SIGNALS & R_BACKTEST
```

---

## 📷 Features

- **Multi-source ingestion** — financial news, Reddit/WSB, SEC filings, earnings call transcripts
- **FinBERT sentiment scoring** — financial domain NLP model, not generic sentiment tools
- **Trade signal generation** — directional signals with confidence thresholds
- **Backtesting engine** — historical signal validation against price data
- **Paper trading mode** — Alpaca-compatible simulated broker execution
- **Live analyst dashboard** — sentiment feed, signal view, and backtest results
- **Watchlist management** — per-user ticker tracking with alert thresholds

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + SQLAlchemy + PostgreSQL |
| NLP | Transformers (FinBERT) + spaCy |
| Backtesting | Pandas + NumPy |
| Paper Trading | Alpaca API (paper mode) |
| Frontend | React + Vite + TypeScript |
| Infra | Docker Compose + GitHub Actions CI |

---

## 🚀 Quick Start

```bash
docker compose up --build
# Backend API docs: http://localhost:8000/docs
# Frontend:         http://localhost:5173
```

### Local Development
```bash
cd backend && pip install -e .[dev]
cp .env.example .env
uvicorn app.main:app --reload

cd frontend && npm ci && npm run dev
```

### Quality Checks
```bash
make lint && make test
```

---

## 🗂️ Repository Structure

```
backend/    FastAPI API, NLP sentiment pipeline, signal engine, backtest, paper trading, tests
frontend/   React analyst dashboard
docs/       Architecture, signal methodology, backtest results
```

---

## 📝 Key Learnings

- Financial domain NLP models (FinBERT) meaningfully outperform general sentiment tools — words like "risk", "gain", and "return" carry opposite polarity in financial vs. general contexts
- Backtesting sentiment signals against historical price data is essential before trusting them — many sentiment features produce spurious correlations that don't survive out-of-sample testing
- Multi-source aggregation is more robust than single-source; source-specific biases cancel out when you aggregate across news, social, and filings

---

## 📄 License

MIT
