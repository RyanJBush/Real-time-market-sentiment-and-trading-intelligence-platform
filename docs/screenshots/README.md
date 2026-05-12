# Screenshots — capture guide

> ⚠️ Educational portfolio project. All data shown in any screenshot is **synthetic / sample**. Captures are for portfolio presentation only — **not** financial advice, **not** evidence of real trading.

This folder is the home for recruiter-facing screenshots of Atlas. The five core captures listed below have been generated from a live local run and **are committed** to this folder so the README image links work out of the box. To regenerate them, follow the demo flow in `docs/demo-runbook.md` and overwrite the files in place.

---

## Recommended capture set

The five screenshots below are referenced from `README.md` and `docs/demo-runbook.md`. Capture them in this order — it matches the suggested demo story.

| # | Filename | Status | Source URL | What to show |
|---|---|---|---|---|
| 1 | `01-dashboard.png` | ✅ captured | `http://localhost:5173/` | Dashboard with KPI cards (sentiment index, active signals, top movers, watchlist alerts), trend chart, event tape. |
| 2 | `02-news-feed.png` | ✅ captured | `http://localhost:5173/news` | News feed — rows with ticker, source, headline, sentiment label / score / confidence, model used. |
| 3 | `03-signal-output.png` | ✅ captured | `http://localhost:5173/ticker` (AAPL selected in filter) | Ticker view: BUY/SELL/HOLD signal, weighted score, thresholds, rationale, sentiment composition, article feed. |
| 4 | `04-backtest-result.png` | ✅ captured | `POST /api/v1/backtesting` JSON rendered in a dark-themed viewer | Per-day rows, expectancy, confusion matrix, return correlation, and the `assumptions` block. |
| 5 | `05-api-docs.png` | ✅ captured | `http://localhost:8000/docs` (captured at `:8888` due to local port conflict) | Swagger UI showing all routers under `/api/v1` (news, sentiment, analytics, signals, backtesting, trust, briefings, jobs, replay, streaming, health). |

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

The captures committed alongside this guide can be embedded with relative paths, e.g.:

```markdown
![Atlas dashboard](docs/screenshots/01-dashboard.png)
```

## Notes on the committed set

- **Theme:** Dark theme throughout — matches the in-app default.
- **App title in Swagger UI capture:** The committed `05-api-docs.png` shows the live OpenAPI title `Helix AI API` (the project's `APP_NAME` in `backend/app/core/config.py`). The product is branded *Atlas* in `README.md`; the FastAPI display name was not retitled in the source. This is the real, unfabricated state of the running app.
- **`04-backtest-result.png`:** Captured by POSTing to `/api/v1/backtesting` and rendering the JSON response in a dark-themed local viewer so the `assumptions`, `confusion_matrix`, `expectancy`, and per-day `results` rows are all visible in one frame.
- **Resolution:** Captures were taken at 2880×1800 (2× retina, 1440×900 logical) via Playwright/Chromium, then downsized to 1440 wide and palette-quantised to keep file sizes under the ~500 KB guideline (Swagger UI capture is a tall full-page render and is slightly larger).
- **Backend used:** Local FastAPI on port `8888` (default `8000` was in use on the capture host); frontend dev server on default port `5173` with `VITE_API_BASE_URL=http://127.0.0.1:8888/api/v1`. Database seeded via `backend/scripts/seed_demo.py` plus a handful of `POST /api/v1/sentiment/analyze` calls to add labelled positive/negative headlines.

---

## Reminder

Every screenshot must visually reinforce that this is an **educational, synthetic-data** project — for example, by including the in-UI disclaimer banner, the `assumptions` JSON block on backtest captures, or the README disclaimer in the architecture render. Do not present any capture in a way that implies real trades, real market data, or live brokerage activity.
