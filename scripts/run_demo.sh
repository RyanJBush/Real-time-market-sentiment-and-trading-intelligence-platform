#!/usr/bin/env bash
# Atlas — one-shot local demo driver
#
# Boots the API against an in-process SQLite DB with deterministic NLP,
# runs ingestion -> sentiment -> aggregation -> signal -> backtest end-to-end,
# and prints the JSON results. Educational only; uses synthetic data.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/backend"

export NLP_PROVIDER="${NLP_PROVIDER:-heuristic}"
export DATABASE_URL="${DATABASE_URL:-sqlite:///./atlas-demo.db}"
export AUTO_CREATE_TABLES="true"
export PYTHONPATH="."

PORT="${PORT:-8000}"
BASE="http://localhost:${PORT}"

echo "▶ Starting API on ${BASE} (NLP=${NLP_PROVIDER}, DB=${DATABASE_URL})"
uvicorn app.main:app --port "$PORT" --log-level warning &
API_PID=$!
trap 'kill $API_PID 2>/dev/null || true' EXIT

# Wait for /health
for _ in $(seq 1 30); do
  if curl -sf "${BASE}/health" >/dev/null; then
    break
  fi
  sleep 0.5
done

echo
echo "▶ 1. Ingest sample news (AAPL, TSLA, NVDA)"
curl -s -X POST "${BASE}/api/v1/news/ingest" \
  -H 'Content-Type: application/json' \
  -d '{
    "tickers": ["AAPL", "TSLA", "NVDA"],
    "limit_per_ticker": 2,
    "sources": ["financial_news", "social_curated", "earnings_wire"],
    "mode": "historical_backfill",
    "lookback_days": 7
  }' | head -c 600 ; echo

echo
echo "▶ 2. Score a custom headline"
curl -s -X POST "${BASE}/api/v1/sentiment/analyze" \
  -H 'Content-Type: application/json' \
  -d '{
    "ticker": "AAPL",
    "source": "earnings_wire",
    "headline": "Apple beats estimates and raises guidance",
    "body": "Margin expansion across products."
  }'
echo

echo
echo "▶ 3. Aggregated ticker view (AAPL)"
curl -s "${BASE}/api/v1/analytics/ticker/AAPL"
echo

echo
echo "▶ 4. Current signal (AAPL)"
curl -s "${BASE}/api/v1/signals/ticker/AAPL?buy_threshold=0.1&sell_threshold=-0.1&min_confidence=0.1"
echo

echo
echo "▶ 5. Backtest-style historical comparison (AAPL, last 5 days)"
START="$(date -u -d '5 days ago' +%Y-%m-%d 2>/dev/null || date -u -v-5d +%Y-%m-%d)"
END="$(date -u +%Y-%m-%d)"
curl -s -X POST "${BASE}/api/v1/backtesting" \
  -H 'Content-Type: application/json' \
  -d "{
    \"ticker\": \"AAPL\",
    \"start_date\": \"${START}\",
    \"end_date\": \"${END}\",
    \"buy_threshold\": 0.1,
    \"sell_threshold\": -0.1,
    \"min_confidence\": 0.1
  }" | head -c 800 ; echo

echo
echo "✅ Demo complete. Educational only — not financial advice, not real trading."
