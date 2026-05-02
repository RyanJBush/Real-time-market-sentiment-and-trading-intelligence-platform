# Codebase Overview

This repository is a full-stack monorepo for a stock-sentiment platform prototype.

## Top-level layout
- `backend/`: FastAPI app, SQLAlchemy models, services, and tests.
- `frontend/`: React + TypeScript (Vite) dashboard UI.
- `docs/`: architecture and demo runbook documentation.
- `docker-compose.yml`, `Makefile`: local orchestration and developer workflows.

## Backend organization
- `app/main.py`: FastAPI app entrypoint, middleware, health/readiness routes, and API mounting.
- `app/api/v1/routers/`: endpoint modules grouped by domain (`news`, `sentiment`, `analytics`, `signals`, `backtesting`, `trust`, etc.).
- `app/services/`: business logic layer for ingestion, NLP, aggregation, signal generation, trust explainability, caching, replay, and jobs.
- `app/models/`: SQLAlchemy tables (`news`, `sentiment`, `signal`, `annotation`, `ingestion`).
- `app/schemas/`: Pydantic request/response DTOs.
- `app/core/`: config, logging, and request-ID middleware.
- `app/db/`: SQLAlchemy engine/session setup.

## Frontend organization
- `src/main.tsx`: React bootstrap.
- `src/App.tsx`: route definitions.
- `src/pages/`: top-level screens (`DashboardPage`, `TickerViewPage`, `NewsFeedPage`, `SignalsPage`).
- `src/components/`: reusable visual components (KPIs, charts, filters, headers).
- `src/services/api.ts`: API client wrappers with fallback mock data for resilient local UX.
- `src/services/stream.ts` and `src/hooks/useMarketStream.ts`: realtime stream integration.
- `src/types/`: shared frontend domain types.
- `src/data/mockMarket.ts`: mock data used as fallback/demo data.

## Architectural pattern
The backend follows a Router -> Service -> Model flow:
1. Routers validate/shape HTTP requests.
2. Services run business logic and cross-domain workflows.
3. Models persist state in PostgreSQL.
4. Schemas define external contracts.

The frontend follows a Page -> Component -> Service flow:
1. Pages compose view-specific UX.
2. Components encapsulate reusable rendering logic.
3. Service functions call backend APIs and provide fallback data if unavailable.

## Testing
- `backend/tests/` includes API and pipeline coverage (ingestion, sentiment, analytics, signals, backtesting, trust, jobs).
- Tests are designed to run in deterministic local mode (heuristic NLP provider).
