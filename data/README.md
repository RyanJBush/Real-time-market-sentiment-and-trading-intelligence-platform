# Sample Data

> **All data in this folder is synthetic.** It is hand-written or programmatically generated for reproducible local demos and tests. It does **not** come from any real news provider, exchange, or market data vendor and should not be used for any real-world analysis or trading decision.

## Files

### `sample_news.json`
A small set of synthetic financial news items keyed by ticker. Each item carries:

| Field | Type | Notes |
|---|---|---|
| `id` | str | Stable synthetic id |
| `ticker` | str | One of AAPL, MSFT, TSLA, NVDA, AMZN |
| `source` | str | One of `financial_news`, `social_curated`, `press_release`, `earnings_wire` |
| `headline` | str | Synthetic headline |
| `body` | str | Synthetic article body (1–2 sentences) |
| `published_at` | str (ISO 8601) | Synthetic timestamp |

These fixtures are meant for human-readable demos and notebook experimentation. The backend's `news_service` generates its own larger in-memory batches at runtime so the API tests remain hermetic.

### `sample_prices.csv`
Synthetic daily OHLC bars used by the backtest module's historical comparison logic.

Columns: `date,ticker,open,high,low,close,volume`. Prices are deliberately smooth, monotonic-ish synthetic series — **not real market data**.

## How the backend uses these

The default `news_ingestion_service` generates deterministic fixtures in code (so tests don't depend on disk reads). These on-disk files exist to:

1. Show the **expected schema** of a real news feed.
2. Make it trivial for a recruiter or reviewer to inspect realistic-looking input without standing the API up.
3. Provide a starting point if you swap in a real ingestion connector later.
