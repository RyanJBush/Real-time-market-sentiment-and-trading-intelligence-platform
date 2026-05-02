from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from hashlib import sha1
import json
import random
import re

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.ingestion import IngestionRun
from app.models.news import NewsItem
from app.models.price import PricePoint
from app.schemas.news import IngestNewsRequest, IngestionRunResponse, NewsItemResponse
from app.services.weighting_service import get_source_weight

SOURCE_DESCRIPTORS: dict[str, dict[str, str]] = {
    "financial_news": {"source": "marketwire", "event_type": "macro_news"},
    "press_release": {"source": "company_pr", "event_type": "corporate_update"},
    "earnings_wire": {"source": "earnings_desk", "event_type": "earnings"},
    "social_curated": {"source": "social_digest", "event_type": "social_sentiment"},
}

SOURCE_HEADLINES: dict[str, list[str]] = {
    "financial_news": [
        "{ticker} attracts fresh analyst attention after sector rotation",
        "{ticker} trading volume rises as institutions adjust positioning",
        "{ticker} sentiment improves following broad market rebound",
    ],
    "press_release": [
        "{ticker} announces strategic product and operations update",
        "{ticker} issues corporate guidance commentary for investors",
        "{ticker} shares quarterly business momentum highlights",
    ],
    "earnings_wire": [
        "{ticker} earnings commentary points to margin trajectory changes",
        "{ticker} revenue outlook revised in latest management remarks",
        "{ticker} posts quarterly print with mixed segment performance",
    ],
    "social_curated": [
        "Curated social feed shows retail sentiment shift around {ticker}",
        "{ticker} discussion volume spikes across curated investor channels",
        "Investor sentiment for {ticker} reflects mixed conviction signals",
    ],
}

UPPERCASE_TICKER_RE = re.compile(r"\b[A-Z]{1,5}\b")


@dataclass
class IngestionResult:
    run_id: int
    items: list[NewsItemResponse]


class NewsIngestionService:
    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(timezone.utc).replace(tzinfo=None)

    @staticmethod
    def _clean_text(value: str) -> str:
        return re.sub(r"\s+", " ", value).strip()

    @staticmethod
    def _dedupe_key(ticker: str, source_type: str, headline: str) -> str:
        return sha1(f"{ticker}|{source_type}|{headline.strip().lower()}".encode("utf-8")).hexdigest()

    @staticmethod
    def _price_dedupe_key(ticker: str, observed_at: datetime) -> str:
        return sha1(f"{ticker}|price|{observed_at.isoformat()}".encode("utf-8")).hexdigest()

    @staticmethod
    def _extract_related_tickers(text: str, ticker: str) -> list[str]:
        symbols = set(UPPERCASE_TICKER_RE.findall(text.upper()))
        symbols.add(ticker.upper())
        return sorted(symbols)

    @staticmethod
    def _market_session(published_at: datetime) -> str:
        if published_at.weekday() >= 5:
            return "weekend"
        minutes = published_at.hour * 60 + published_at.minute
        if 13 * 60 + 30 <= minutes <= 20 * 60:
            return "regular"
        if 11 * 60 <= minutes < 13 * 60 + 30:
            return "pre_market"
        if 20 * 60 < minutes <= 22 * 60:
            return "after_hours"
        return "closed"

    @staticmethod
    def _published_at_for(mode: str, ticker_idx: int, source_idx: int, article_idx: int, lookback_days: int) -> datetime:
        now = NewsIngestionService._utc_now()
        if mode == "historical_backfill":
            offset_hours = (ticker_idx * 12) + (source_idx * 4) + (article_idx + 1) * 6
            return now - timedelta(hours=min(offset_hours, lookback_days * 24))
        return now - timedelta(minutes=(source_idx * 7) + (article_idx * 3))

    def _ingest_price_batch(self, db: Session, ticker: str, lookback_days: int, limit_per_ticker: int) -> int:
        now = self._utc_now()
        randomizer = random.Random(f"{ticker}-{lookback_days}-{limit_per_ticker}")
        inserted = 0
        base = randomizer.uniform(95, 275)
        for idx in range(limit_per_ticker):
            observed_at = (now - timedelta(minutes=idx * 5)).replace(second=0, microsecond=0)
            open_px = base + randomizer.uniform(-2, 2)
            close_px = open_px + randomizer.uniform(-3, 3)
            high_px = max(open_px, close_px) + randomizer.uniform(0.1, 1.5)
            low_px = min(open_px, close_px) - randomizer.uniform(0.1, 1.5)
            dedupe_key = self._price_dedupe_key(ticker, observed_at)
            if db.scalar(select(PricePoint.id).where(PricePoint.dedupe_key == dedupe_key)):
                continue
            db.add(
                PricePoint(
                    ticker=ticker,
                    dedupe_key=dedupe_key,
                    open=round(open_px, 2),
                    high=round(high_px, 2),
                    low=round(low_px, 2),
                    close=round(close_px, 2),
                    volume=round(randomizer.uniform(8e5, 8e6), 0),
                    observed_at=observed_at,
                    ingested_at=now,
                )
            )
            inserted += 1
        return inserted

    def ingest_news(self, db: Session, payload: IngestNewsRequest) -> IngestionResult:
        run = IngestionRun(
            status="running",
            mode=payload.mode,
            requested_tickers=",".join(sorted(t.upper() for t in payload.tickers)),
            requested_sources=",".join(payload.sources),
        )
        db.add(run)
        db.flush()

        inserted: list[NewsItemResponse] = []
        failures = 0
        duplicates_skipped = 0
        source_stats: dict[str, int] = {}

        try:
            for ticker_idx, raw_ticker in enumerate(payload.tickers):
                ticker = raw_ticker.upper()
                for source_idx, source_type in enumerate(payload.sources):
                    if source_type == "financial_price":
                        points_inserted = self._ingest_price_batch(db, ticker, payload.lookback_days, payload.limit_per_ticker)
                        source_stats[source_type] = source_stats.get(source_type, 0) + points_inserted
                        continue

                    descriptor = SOURCE_DESCRIPTORS.get(source_type)
                    if descriptor is None:
                        failures += 1
                        continue

                    templates = SOURCE_HEADLINES.get(source_type, ["{ticker} trades flat as investors await catalyst"])
                    for article_idx, template in enumerate(templates[: payload.limit_per_ticker]):
                        published_at = self._published_at_for(payload.mode, ticker_idx, source_idx, article_idx, payload.lookback_days)
                        headline = self._clean_text(template.format(ticker=ticker))
                        content = self._clean_text(
                            f"{headline}. Event classification: {descriptor['event_type']}. Ingestion mode: {payload.mode}."
                        )
                        dedupe_key = self._dedupe_key(ticker=ticker, source_type=source_type, headline=headline)

                        existing = db.scalar(select(NewsItem.id).where(NewsItem.dedupe_key == dedupe_key))
                        if existing:
                            duplicates_skipped += 1
                            continue

                        related_tickers = self._extract_related_tickers(f"{headline} {content}", ticker=ticker)
                        item = NewsItem(
                            ticker=ticker,
                            source=descriptor["source"],
                            source_type=source_type,
                            source_weight=get_source_weight(source_type),
                            event_type=descriptor["event_type"],
                            market_session=self._market_session(published_at),
                            related_tickers=",".join(related_tickers),
                            dedupe_key=dedupe_key,
                            headline=headline,
                            content=content,
                            published_at=published_at,
                            ingested_at=self._utc_now(),
                        )
                        db.add(item)
                        db.flush()

                        inserted.append(
                            NewsItemResponse(
                                id=item.id,
                                ticker=item.ticker,
                                source=item.source,
                                source_type=item.source_type,
                                source_weight=item.source_weight,
                                event_type=item.event_type,
                                market_session=item.market_session,
                                related_tickers=related_tickers,
                                headline=item.headline,
                                content=item.content,
                                published_at=item.published_at,
                                ingested_at=item.ingested_at,
                            )
                        )
                        source_stats[source_type] = source_stats.get(source_type, 0) + 1

            run.records_inserted = len(inserted) + source_stats.get("financial_price", 0)
            run.duplicates_skipped = duplicates_skipped
            run.failures_count = failures
            run.source_stats = json.dumps(source_stats, sort_keys=True)
            run.status = "completed" if failures == 0 else "partial_failed"
            run.completed_at = self._utc_now()
            db.add(run)
            db.commit()
            return IngestionResult(run_id=run.id, items=inserted)
        except Exception as exc:  # noqa: BLE001
            db.rollback()
            run.status = "failed"
            run.error_message = str(exc)
            run.completed_at = self._utc_now()
            db.add(run)
            db.commit()
            return IngestionResult(run_id=run.id, items=[])

    def get_run_status(self, db: Session, run_id: int) -> IngestionRunResponse | None:
        run = db.get(IngestionRun, run_id)
        if run is None:
            return None
        return IngestionRunResponse(
            id=run.id,
            status=run.status,
            mode=run.mode,
            requested_tickers=run.requested_tickers.split(",") if run.requested_tickers else [],
            requested_sources=run.requested_sources.split(",") if run.requested_sources else [],
            records_inserted=run.records_inserted,
            duplicates_skipped=run.duplicates_skipped,
            failures_count=run.failures_count,
            source_stats=json.loads(run.source_stats) if run.source_stats else {},
            error_message=run.error_message,
            started_at=run.started_at,
            completed_at=run.completed_at,
        )

    def latest_run_status(self, db: Session) -> IngestionRunResponse | None:
        latest = db.scalar(select(IngestionRun).order_by(desc(IngestionRun.started_at)).limit(1))
        if latest is None:
            return None
        return self.get_run_status(db, latest.id)


news_ingestion_service = NewsIngestionService()
