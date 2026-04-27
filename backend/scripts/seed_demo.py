from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass

from app.db.session import Base, SessionLocal, engine
from app.models import annotation, ingestion, news, sentiment, signal  # noqa: F401
from app.models.sentiment import SentimentRecord
from app.models.signal import SignalRecord
from app.schemas.news import IngestNewsRequest
from app.schemas.sentiment import SentimentRequest
from app.services.aggregation_service import aggregation_service
from app.services.news_service import news_ingestion_service
from app.services.nlp_service import nlp_service
from app.services.signal_service import signal_service
from app.services.weighting_service import get_source_weight


DEFAULT_TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN"]


@dataclass
class SeedSummary:
    tickers: list[str]
    ingestion_run_id: int
    news_items_inserted: int
    sentiments_inserted: int
    signals_inserted: int


def seed_demo_data(tickers: list[str], lookback_days: int, limit_per_ticker: int) -> SeedSummary:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ingestion_result = news_ingestion_service.ingest_news(
            db,
            IngestNewsRequest(
                tickers=tickers,
                sources=["financial_news", "press_release", "earnings_wire", "social_curated"],
                mode="historical_backfill",
                lookback_days=lookback_days,
                limit_per_ticker=limit_per_ticker,
            ),
        )

        sentiments_inserted = 0
        for item in ingestion_result.items:
            payload = SentimentRequest(
                ticker=item.ticker,
                source=item.source_type,
                headline=item.headline,
                body=item.content,
                news_item_id=item.id,
                compare_models=True,
            )
            sentiment_output = nlp_service.analyze_sentiment(payload)
            db.add(
                SentimentRecord(
                    ticker=sentiment_output.ticker,
                    source=item.source_type,
                    news_item_id=item.id,
                    text=f"{item.headline} {item.content}".strip(),
                    score=sentiment_output.score,
                    confidence=sentiment_output.confidence,
                    source_weight=get_source_weight(item.source_type),
                    model_used=sentiment_output.model_used,
                    label=sentiment_output.label,
                )
            )
            sentiments_inserted += 1
        db.commit()
        aggregation_service._ticker_cache.clear()

        signals_inserted = 0
        for ticker in sorted({item.ticker for item in ingestion_result.items}):
            aggregate = aggregation_service.summarize_ticker(db, ticker=ticker, lookback_hours=lookback_days * 24)
            signal_output = signal_service.generate_from_aggregate(aggregate)
            db.add(
                SignalRecord(
                    ticker=signal_output.ticker,
                    signal=signal_output.signal,
                    confidence=signal_output.confidence,
                    weighted_score=signal_output.weighted_score,
                    buy_threshold=signal_output.buy_threshold,
                    sell_threshold=signal_output.sell_threshold,
                    min_confidence=signal_output.min_confidence,
                    rationale=signal_output.rationale,
                )
            )
            signals_inserted += 1
        db.commit()

        return SeedSummary(
            tickers=[ticker.upper() for ticker in tickers],
            ingestion_run_id=ingestion_result.run_id,
            news_items_inserted=len(ingestion_result.items),
            sentiments_inserted=sentiments_inserted,
            signals_inserted=signals_inserted,
        )
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed deterministic Helix demo data")
    parser.add_argument("--tickers", nargs="+", default=DEFAULT_TICKERS)
    parser.add_argument("--lookback-days", type=int, default=30)
    parser.add_argument("--limit-per-ticker", type=int, default=3)
    args = parser.parse_args()

    summary = seed_demo_data(
        tickers=[ticker.upper() for ticker in args.tickers],
        lookback_days=max(args.lookback_days, 1),
        limit_per_ticker=max(args.limit_per_ticker, 1),
    )
    print(json.dumps(asdict(summary), indent=2))


if __name__ == "__main__":
    main()
