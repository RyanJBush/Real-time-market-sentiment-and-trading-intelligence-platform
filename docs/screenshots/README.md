# Screenshots — capture guide

> ⚠️ Educational portfolio project. All data shown in any screenshot is **synthetic / sample**. Captures are for portfolio presentation only — **not** financial advice, **not** evidence of real trading.

This folder is the home for recruiter-facing screenshots of Atlas. Captures themselves are intentionally **not committed** to the repo (to keep diffs small and avoid bloating clones). Add them locally when you run the demo, or check them into a separate release / GitHub Pages branch.

---

## Recommended capture set

The five screenshots below are referenced from `README.md` and `docs/demo-runbook.md`. Capture them in this order — it matches the suggested demo story.

| # | Filename | Source URL | What to show |
|---|---|---|---|
| 1 | `01-dashboard.png` | `http://localhost:5173/` | Dashboard with KPI cards (sentiment index, active signals, top movers, watchlist alerts), trend chart, event tape. |
| 2 | `02-news-feed.png` | `http://localhost:5173/news` (or equivalent) | News feed — rows with ticker, source, headline, sentiment label / score / confidence, model used. |
| 3 | `03-signal-output.png` | `http://localhost:5173/ticker/AAPL` (or any ticker page) | Ticker view: BUY/SELL/HOLD signal, weighted score, thresholds, rationale, top contributing articles. |
| 4 | `04-backtest-result.png` | Output of `POST /api/v1/backtesting` (JSON viewer or `/backtesting/scenarios/{ticker}` panel) | Per-day rows, expectancy, confusion matrix, return correlation, and the `assumptions` block. |
| 5 | `05-api-docs.png` | `http://localhost:8000/docs` | Swagger UI showing all 11 routers under `/api/v1`. |

Optional extras:

| Filename | What to show |
|---|---|
| `06-architecture.png` | Render of the README Mermaid diagram (or a hand-drawn version). |
| `07-ci-passing.png` | GitHub Actions CI run on `main` showing ruff + pytest + frontend build all green. |
| `08-paper-trade-sim.png` | Paper-trade NAV simulation output — clearly labelled "synthetic data, not real trading". |

---

## Capture conventions

- **Format:** PNG preferred; JPG acceptable.
- **Resolution:** 1440 × 900 logical pixels (or 2880 × 1800 retina) for dashboard captures; full-width browser screenshots for Swagger UI.
- **Theme:** Use the default light or dark theme consistently across the set — don't mix.
- **Browser chrome:** Crop out the URL bar / tabs unless the URL itself is the point (e.g. the Swagger UI capture).
- **Sensitive data:** None expected — all data is synthetic — but double-check nothing in your local env (e.g. API keys in browser tabs) leaks into the frame.
- **File size:** Compress to under ~500 KB per image (`pngquant`, `tinypng`, or `oxipng`).

---

## How to capture

1. Run the demo: `bash scripts/run_demo.sh` (backend) and `cd frontend && npm run dev` (frontend) — or `docker compose up --build`.
2. Open each URL from the table above.
3. Capture with your OS screenshot tool:
   - macOS: `Cmd + Shift + 4`, then `Space` for a window capture.
   - Linux: `gnome-screenshot -w` or `flameshot gui`.
   - Windows: `Win + Shift + S` (Snipping Tool).
4. Save into this folder with the filenames listed above.
5. Optional: also drop them into your GitHub Releases assets so the README image links work even without cloning.

---

## Embedding in the README

If/when captures are committed here, the README can reference them with relative paths, e.g.:

```markdown
![Atlas dashboard](docs/screenshots/01-dashboard.png)
```

Until then, the README references the capture **plan** (this file) rather than concrete image paths to avoid broken links.

---

## Reminder

Every screenshot must visually reinforce that this is an **educational, synthetic-data** project — for example, by including the in-UI disclaimer banner, the `assumptions` JSON block on backtest captures, or the README disclaimer in the architecture render. Do not present any capture in a way that implies real trades, real market data, or live brokerage activity.
