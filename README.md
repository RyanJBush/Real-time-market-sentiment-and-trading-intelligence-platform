![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FinBERT-FFD21E?style=flat&logo=huggingface&logoColor=black)
![CI](https://github.com/RyanJBush/Real-time-market-sentiment-and-trading-intelligence-platform/actions/workflows/ci.yml/badge.svg)

# 📈 Real-Time Market Sentiment & Trading Intelligence Platform

> A full-stack platform that ingests financial news and social data, scores it with FinBERT NLP, generates explainable BUY/SELL/HOLD signals, and streams real-time analytics to a React dashboard via WebSockets.

---

## 🎯 What I Built & Why

I built this project to explore the intersection of NLP and quantitative finance. The core challenge was building a pipeline that could go from raw news text → sentiment score → actionable trading signal → live dashboard update in near real-time. Key engineering decisions:

- **FinBERT** over generic sentiment models — a finance-domain fine-tuned BERT model produces meaningfully higher accuracy on financial language than general-purpose NLP
- **WebSocket broadcast layer** — the dashboard reacts instantly to ingest/score events without polling, reflecting how real-time trading tools must behave
- **Backtesting engine** — signal quality is evaluated with trade-quality metrics (expectancy, hit rates) against historical data, not just accuracy scores
- **Signal explainability** — every BUY/SELL/HOLD traces back to the specific articles that drove it; any black-box signal is unusable in practice

---

## 📷 Features

- **Multi-source ingestion** — news, social, and simulated price bar data with deduplication and batch tracking
- **Finance-aware NLP** — FinBERT sentiment with headline/body decomposition, topic extraction, and entity attribution
- **Signal generation** — weighted threshold signals with multifactor context (volume z-score, momentum, event impact)
- **Watchlist management** — cross-ticker watchlist signals and sharp-shift alert center
- **Backtesting & paper trading** — threshold tuning grid search, scenario leaderboards, simulated ledger
- **Signal trust & auditability** — article-to-signal traceability, contradiction detection, analyst annotations
- **Real-time WebSocket streaming** — ingest → NLP → signal cycle broadcast live to dashboard
- **AI briefings** — per-ticker and watchlist narrative summaries

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + SQLAlchemy + PostgreSQL |
| NLP | Hugging Face Transformers (FinBERT + heuristic fallback) |
| Frontend | React + Vite + TypeScript + Recharts |
| Real-time | WebSockets |
| Infra | Docker Compose + GitHub Actions CI |

---

## 🚀 Quick Start

### Prerequisites
- Docker + Docker Compose
- Python 3.11+
- Node.js 20+

### Docker (Recommended)
```bash
make up
# Frontend:         http://localhost:5173
# Backend API docs: http://localhost:8000/docs
```

### Local Development
```bash
# Backend
cd backend && cp .env.example .env
pip install -r requirements.txt
NLP_PROVIDER=heuristic PYTHONPATH=. uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev
```

### Seed Demo Data
```bash
make demo-seed
```

### Run Tests
```bash
cd backend
NLP_PROVIDER=heuristic PYTHONPATH=. pytest -q
```

---

## 🗂️ Repository Structure

```
backend/     FastAPI API, NLP pipeline, signal engine, backtesting, tests
frontend/    React dashboard (sentiment charts, signal feed, watchlist, AI briefings)
docs/        Demo runbook and architecture notes
```

---

## 📊 Example Tickers

`AAPL` `MSFT` `TSLA` `NVDA` `AMZN`

---

## 📝 Key Learnings

- Domain-specific NLP models (FinBERT) meaningfully outperform generic models on financial text — the difference in accuracy on earnings call language is significant
- WebSocket-based architectures require careful state management on both client and server sides, especially around reconnection and backpressure
- Signal explainability is as important as signal accuracy in finance contexts — any black-box output is unusable in practice for regulated or institutional use

---

## 📄 License

MIT
