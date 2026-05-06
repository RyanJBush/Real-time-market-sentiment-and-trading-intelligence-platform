import json
from datetime import datetime

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sentiment import SentimentRecord
from app.models.signal import SignalRecord
from app.schemas.news import IngestNewsRequest
from app.schemas.sentiment import SentimentRequest
from app.services.aggregation_service import aggregation_service
from app.services.news_service import news_ingestion_service
from app.services.nlp_service import nlp_service
from app.services.signal_service import signal_service
from app.services.stream_service import stream_manager
from app.services.weighting_service import get_source_weight

router = APIRouter()


class SimulateRequest(BaseModel):
    tickers: list[str] = Field(default=["AAPL", "MSFT", "TSLA", "NVDA"], min_length=1, max_length=10)
    limit_per_ticker: int = Field(default=2, ge=1, le=5)


@router.get("/status")
def status() -> dict[str, int | str]:
    return {"stream": "available", "subscribers": stream_manager.subscriber_count()}


@router.websocket("/ws")
async def websocket_stream(websocket: WebSocket):
    await stream_manager.connect(websocket)
    await websocket.send_json({"event": "connected", "timestamp": datetime.utcnow().isoformat()})

    try:
        while True:
            message = await websocket.receive_text()
            await stream_manager.broadcast(
                {
                    "event": "stream_echo",
                    "payload": message,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
    except WebSocketDisconnect:
        stream_manager.disconnect(websocket)
        await stream_manager.broadcast(
            {
                "event": "subscriber_left",
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    except json.JSONDecodeError:
        await websocket.send_json({"event": "error", "detail": "invalid JSON payload"})


@router.post("/simulate")
async def run_simulation_cycle(
    payload: SimulateRequest,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """Run one ingest → score → signal cycle and broadcast events via WebSocket.

    This endpoint powers the "Start simulation" feature: the frontend calls it
    periodically to inject new data and push real-time updates to all connected
    WebSocket subscribers.
    """
    ingest_result = news_ingestion_service.ingest_news(
        db,
        IngestNewsRequest(
            tickers=payload.tickers,
            sources=["financial_news", "social_curated", "earnings_wire"],
            mode="realtime",
            limit_per_ticker=payload.limit_per_ticker,
        ),
    )

    broadcast_events: list[dict] = []

    # Score each ingested article and stage sentiment records
    for item in ingest_result.items:
        sentiment = nlp_service.analyze_sentiment(
            SentimentRequest(
                ticker=item.ticker,
                source=item.source_type,
                headline=item.headline,
                body=item.content,
                news_item_id=item.id,
            )
        )
        db.add(
            SentimentRecord(
                ticker=sentiment.ticker,
                source=item.source_type,
                news_item_id=item.id,
                text=f"{item.headline} {item.content}".strip(),
                score=sentiment.score,
                confidence=sentiment.confidence,
                source_weight=get_source_weight(item.source_type),
                model_used=sentiment.model_used,
                label=sentiment.label,
            )
        )
        broadcast_events.append(
            {
                "event": "sentiment_update",
                "ticker": sentiment.ticker,
                "score": round(sentiment.score, 4),
                "label": sentiment.label,
                "confidence": round(sentiment.confidence, 4),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    db.commit()
    aggregation_service._ticker_cache.clear()

    # Generate and persist signals for impacted tickers
    for ticker in sorted({item.ticker for item in ingest_result.items}):
        aggregate = aggregation_service.summarize_ticker(db, ticker=ticker, lookback_hours=48)
        sig = signal_service.generate_from_aggregate(aggregate)
        db.add(
            SignalRecord(
                ticker=sig.ticker,
                signal=sig.signal,
                confidence=sig.confidence,
                weighted_score=sig.weighted_score,
                buy_threshold=sig.buy_threshold,
                sell_threshold=sig.sell_threshold,
                min_confidence=sig.min_confidence,
                rationale=sig.rationale,
            )
        )
        broadcast_events.append(
            {
                "event": "signal_update",
                "ticker": sig.ticker,
                "signal": sig.signal,
                "score": round(sig.weighted_score, 4),
                "confidence": round(sig.confidence, 4),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    db.commit()

    # Broadcast all events to connected WebSocket subscribers
    for event in broadcast_events:
        await stream_manager.broadcast(event)

    return {
        "tickers": payload.tickers,
        "news_inserted": len(ingest_result.items),
        "events_broadcast": len(broadcast_events),
        "run_id": ingest_result.run_id,
    }
