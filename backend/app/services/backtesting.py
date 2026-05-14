from dataclasses import dataclass
from datetime import datetime, time
from statistics import pstdev

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.price import PricePoint
from app.models.sentiment import SentimentRecord


@dataclass
class TradingRule:
    buy_above: float
    sell_below: float


class BacktestEngine:
    def run(self, db: Session, ticker: str, start_date: datetime.date, end_date: datetime.date, sentiment_threshold: float, trading_rule: TradingRule) -> dict:
        start_dt = datetime.combine(start_date, time.min)
        end_dt = datetime.combine(end_date, time.max)

        sentiments = list(db.scalars(select(SentimentRecord).where(and_(SentimentRecord.ticker == ticker, SentimentRecord.created_at >= start_dt, SentimentRecord.created_at <= end_dt))))
        prices = list(db.scalars(select(PricePoint).where(and_(PricePoint.ticker == ticker, PricePoint.observed_at >= start_dt, PricePoint.observed_at <= end_dt))))

        sentiment_by_day: dict[datetime.date, list[float]] = {}
        for s in sentiments:
            sentiment_by_day.setdefault(s.created_at.date(), []).append(s.score)

        close_by_day = {p.observed_at.date(): p.close for p in prices}
        days = sorted(set(sentiment_by_day) & set(close_by_day))
        if len(days) < 2:
            return {"ticker": ticker, "total_return": 0.0, "sharpe_ratio": 0.0, "max_drawdown": 0.0, "win_rate": 0.0, "trade_log": [], "equity_curve": []}

        position = 0
        entry_price = 0.0
        cash = 1.0
        trade_log = []
        equity_curve = []
        daily_returns = []
        wins = 0

        for idx, day in enumerate(days):
            avg_sentiment = sum(sentiment_by_day[day]) / len(sentiment_by_day[day])
            price = close_by_day[day]
            action = "HOLD"

            if avg_sentiment >= max(trading_rule.buy_above, sentiment_threshold) and position == 0:
                position = 1
                entry_price = price
                action = "BUY"
                trade_log.append({"date": str(day), "action": action, "price": price, "sentiment": round(avg_sentiment, 4)})
            elif avg_sentiment <= trading_rule.sell_below and position == 1:
                ret = (price - entry_price) / entry_price
                cash *= (1 + ret)
                wins += 1 if ret > 0 else 0
                position = 0
                action = "SELL"
                trade_log.append({"date": str(day), "action": action, "price": price, "sentiment": round(avg_sentiment, 4), "trade_return": round(ret, 4)})

            if idx > 0:
                prev = close_by_day[days[idx - 1]]
                daily_returns.append((price - prev) / prev)

            marked = cash * ((price / entry_price) if position == 1 and entry_price > 0 else 1)
            equity_curve.append({"date": str(day), "equity": round(marked, 6), "sentiment": round(avg_sentiment, 4), "action": action})

        peak = 0.0
        max_drawdown = 0.0
        for point in equity_curve:
            peak = max(peak, point["equity"])
            if peak > 0:
                max_drawdown = min(max_drawdown, (point["equity"] - peak) / peak)

        returns_vol = pstdev(daily_returns) if len(daily_returns) > 1 else 0.0
        sharpe = (sum(daily_returns) / len(daily_returns)) / returns_vol if daily_returns and returns_vol > 0 else 0.0

        sells = len([t for t in trade_log if t["action"] == "SELL"])
        return {
            "ticker": ticker,
            "total_return": round(equity_curve[-1]["equity"] - 1, 4),
            "sharpe_ratio": round(sharpe, 4),
            "max_drawdown": round(max_drawdown, 4),
            "win_rate": round((wins / sells), 4) if sells else 0.0,
            "trade_log": trade_log,
            "equity_curve": equity_curve,
        }


backtest_engine = BacktestEngine()
