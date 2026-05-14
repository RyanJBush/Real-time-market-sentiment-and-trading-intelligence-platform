from datetime import datetime

from pydantic import BaseModel, Field


class WatchlistCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    tickers: list[str] = Field(..., min_length=1)
    owner: str = Field(default="demo_user", min_length=1, max_length=64)


class WatchlistResponse(BaseModel):
    id: int
    name: str
    owner: str
    tickers: list[str]
    created_at: datetime


class TickerSentimentBreakdown(BaseModel):
    ticker: str
    avg_sentiment: float
    market_cap: float | None = None
    weighted_sentiment: float | None = None


class WatchlistSentimentResponse(BaseModel):
    watchlist_id: int
    name: str
    simple_average_sentiment: float
    market_cap_weighted_sentiment: float | None
    breakdown: list[TickerSentimentBreakdown]


class FearGreedResponse(BaseModel):
    score: int
    label: str
    components: dict[str, int]
