from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sentiment import SentimentRecord


class FearGreedService:
    def compute(self, db: Session) -> dict:
        since = datetime.utcnow() - timedelta(days=7)
        rows = list(db.scalars(select(SentimentRecord).where(SentimentRecord.created_at >= since)))
        if not rows:
            return {"score": 50, "label": "Neutral", "components": {"market_sentiment": 50, "volatility": 50, "momentum": 50, "breadth": 50}}

        scores = [r.score for r in rows]
        market_sentiment = max(0, min(100, int(((sum(scores) / len(scores)) + 1) * 50)))
        mean = sum(scores) / len(scores)
        std = (sum((s - mean) ** 2 for s in scores) / len(scores)) ** 0.5
        volatility = max(0, min(100, int((1 - min(std, 1.0)) * 100)))

        mid = datetime.utcnow() - timedelta(days=3)
        early = [r.score for r in rows if r.created_at < mid]
        late = [r.score for r in rows if r.created_at >= mid]
        momentum_raw = (sum(late) / len(late) if late else 0.0) - (sum(early) / len(early) if early else 0.0)
        momentum = max(0, min(100, int((momentum_raw + 1) * 50)))

        by_ticker = {}
        for r in rows:
            by_ticker.setdefault(r.ticker, []).append(r.score)
        pos = len([t for t, vals in by_ticker.items() if (sum(vals) / len(vals)) > 0])
        breadth = max(0, min(100, int((pos / max(len(by_ticker), 1)) * 100)))

        composite = int(market_sentiment * 0.30 + volatility * 0.25 + momentum * 0.25 + breadth * 0.20)
        label = "Extreme Fear" if composite < 20 else "Fear" if composite < 40 else "Neutral" if composite < 60 else "Greed" if composite < 80 else "Extreme Greed"
        return {"score": composite, "label": label, "components": {"market_sentiment": market_sentiment, "volatility": volatility, "momentum": momentum, "breadth": breadth}}


fear_greed_service = FearGreedService()
