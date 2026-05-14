# Changelog

## 2026-05-14
- Added `BacktestEngine` service and `/backtesting/backtest` endpoint with return metrics, equity curve, and trade log.
- Added watchlist persistence model + `/watchlists` and `/watchlists/{id}/sentiment` aggregation endpoints.
- Added fear & greed composite service and `/market/fear-greed` endpoint.
- Added frontend Fear & Greed gauge and backtest results panel.
- Added root `pyproject.toml` and GitHub Actions CI workflow.
