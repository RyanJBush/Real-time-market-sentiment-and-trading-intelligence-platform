# Screenshot Documentation — Atlas

All screenshots in this folder are recruiter-facing visuals for the Atlas portfolio project.

> Compliance note: Screenshots represent synthetic/sample data only. They do not indicate real money trading, live brokerage connectivity, or production execution.

## Required screenshot set
1. `01-dashboard.png` — KPI + sentiment overview dashboard.
2. `02-news-feed.png` — synthetic news ingestion/sentiment rows.
3. `03-signal-output.png` — ticker signal with rationale and confidence.
4. `04-backtest-result.png` — historical analysis + assumptions block.
5. `05-api-docs.png` — Swagger/OpenAPI docs view.

## Capture standards
- Keep URL/path context visible where helpful.
- Prefer consistent theme and resolution across captures.
- Ensure at least one visible cue that data is simulated/synthetic.
- Avoid any language in captions implying real trading or brokerage execution.

## Recommended caption language
- "Synthetic-data sentiment dashboard"
- "Paper-trade style simulation output"
- "Educational historical analytics"
- "FastAPI API documentation for portfolio project"

## Regeneration workflow
1. Start backend (`bash scripts/run_demo.sh`).
2. Start frontend (`cd frontend && npm run dev`).
3. Capture screenshots in filename order.
4. Replace files in place so README links remain stable.
