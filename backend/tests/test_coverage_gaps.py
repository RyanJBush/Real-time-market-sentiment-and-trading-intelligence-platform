import asyncio
import json
from datetime import datetime, timedelta

import pytest
from pydantic import ValidationError
from fastapi import HTTPException

from app.api.v1.routers import streaming
from app.core.middleware import RequestRateLimiter
from app.schemas.sentiment import SentimentRequest
from app.services.cache_service import TtlCache
from app.services.stream_service import StreamManager, make_broadcast_event_factory
from app.services.weighting_service import get_source_weight, market_hours_multiplier, time_decay_multiplier


class _DummyWebSocket:
    def __init__(self, fail_send: bool = False) -> None:
        self.accepted = False
        self.fail_send = fail_send
        self.messages: list[str] = []

    async def accept(self) -> None:
        self.accepted = True

    async def send_text(self, message: str) -> None:
        if self.fail_send:
            raise RuntimeError("send failed")
        self.messages.append(message)


def test_stream_status_endpoint(client) -> None:
    response = client.get("/api/v1/streaming/status")
    assert response.status_code == 200
    assert response.json()["stream"] == "available"
    assert "subscribers" in response.json()


def test_streaming_simulate_endpoint(client) -> None:
    response = client.post(
        "/api/v1/streaming/simulate",
        json={"tickers": ["AAPL", "TSLA"], "limit_per_ticker": 2},
    )
    assert response.status_code == 200
    body = response.json()
    assert "news_inserted" in body
    assert "events_broadcast" in body
    assert body["events_broadcast"] >= body["news_inserted"]


def test_stream_websocket_echo(client) -> None:
    with client.websocket_connect("/api/v1/streaming/ws") as websocket:
        connected = websocket.receive_json()
        assert connected["event"] == "connected"

        websocket.send_text("ping")
        echoed = websocket.receive_json()
        assert echoed["event"] == "stream_echo"
        assert echoed["payload"] == "ping"


def test_stream_websocket_json_error_branch(client, monkeypatch) -> None:
    async def _raise_json_error(_: dict) -> None:
        raise json.JSONDecodeError("bad json", "{}", 0)

    monkeypatch.setattr(streaming.stream_manager, "broadcast", _raise_json_error)
    try:
        with client.websocket_connect("/api/v1/streaming/ws") as websocket:
            websocket.receive_json()
            websocket.send_text("trigger")
            error_payload = websocket.receive_json()
            assert error_payload["event"] == "error"
            assert error_payload["detail"] == "invalid JSON payload"
    finally:
        streaming.stream_manager._connections.clear()


def test_stream_manager_broadcast_cleanup_and_factory() -> None:
    manager = StreamManager()
    good = _DummyWebSocket()
    bad = _DummyWebSocket(fail_send=True)

    asyncio.run(manager.connect(good))
    asyncio.run(manager.connect(bad))
    assert manager.subscriber_count() == 2

    asyncio.run(manager.broadcast({"event": "hello"}))
    assert manager.subscriber_count() == 1
    assert json.loads(good.messages[0])["event"] == "hello"

    publish = make_broadcast_event_factory(manager)
    asyncio.run(publish({"event": "factory"}))
    assert json.loads(good.messages[-1])["event"] == "factory"

    manager.disconnect(good)
    assert manager.subscriber_count() == 0


def test_news_status_endpoints_not_found(client) -> None:
    latest = client.get("/api/v1/news/ingest/status/latest")
    assert latest.status_code == 404
    assert latest.json()["detail"] == "No ingestion runs found"

    run = client.get("/api/v1/news/ingest/status/99999")
    assert run.status_code == 404
    assert run.json()["detail"] == "Ingestion run not found"


def test_jobs_missing_and_internal_error_branches(client, monkeypatch) -> None:
    missing = client.get("/api/v1/jobs/not-a-job")
    assert missing.status_code == 404
    assert missing.json()["detail"] == "Job not found"

    monkeypatch.setattr("app.api.v1.routers.jobs.job_service.get_job", lambda _: None)

    ingestion = client.post(
        "/api/v1/jobs/ingestion",
        json={
            "payload": {
                "tickers": ["AAPL"],
                "limit_per_ticker": 1,
                "sources": ["financial_news"],
                "mode": "realtime",
                "lookback_days": 3,
            }
        },
    )
    assert ingestion.status_code == 500
    assert ingestion.json()["detail"] == "Failed to create ingestion job"

    sentiment = client.post(
        "/api/v1/jobs/sentiment-batch",
        json={"items": [{"ticker": "AAPL", "text": "Strong demand trends", "source": "financial_news"}]},
    )
    assert sentiment.status_code == 500
    assert sentiment.json()["detail"] == "Failed to create sentiment job"


def test_rate_limiter_overflow_branch() -> None:
    limiter = RequestRateLimiter(limit_per_minute=10)
    for _ in range(10):
        limiter.check("127.0.0.1")
    with pytest.raises(HTTPException) as exc:
        limiter.check("127.0.0.1")
    assert "Rate limit exceeded" in str(exc.value)


def test_sentiment_request_requires_content() -> None:
    with pytest.raises(ValidationError):
        SentimentRequest(ticker="AAPL", source="financial_news")

def test_weighting_service_source_weights_and_fallback() -> None:
    assert get_source_weight("financial_news") == 1.0
    assert get_source_weight("earnings_wire") == 1.15
    assert get_source_weight("unknown_source") == 0.7


def test_weighting_service_market_hours_and_time_decay() -> None:
    weekday_market_open = datetime(2026, 4, 29, 14, 0)  # Wednesday during market hours UTC
    weekday_after_hours = datetime(2026, 4, 29, 22, 0)
    weekend = datetime(2026, 5, 2, 14, 0)  # Saturday

    assert market_hours_multiplier(weekday_market_open) == 1.1
    assert market_hours_multiplier(weekday_after_hours) == 0.95
    assert market_hours_multiplier(weekend) == 0.9

    now = datetime(2026, 5, 2, 12, 0)
    fresh = now
    old = now - timedelta(hours=24)
    future = now + timedelta(hours=2)

    assert time_decay_multiplier(fresh, now=now) == 1.0
    assert 0 < time_decay_multiplier(old, now=now) < 1.0
    assert time_decay_multiplier(future, now=now) == 1.0


def test_ttl_cache_set_get_expire_and_clear(monkeypatch) -> None:
    cache: TtlCache[int] = TtlCache(ttl_seconds=2)
    base = datetime(2026, 5, 2, 12, 0)

    monkeypatch.setattr(TtlCache, "_now", staticmethod(lambda: base))
    cache.set("k", 5)
    assert cache.get("k") == 5

    monkeypatch.setattr(TtlCache, "_now", staticmethod(lambda: base + timedelta(seconds=3)))
    assert cache.get("k") is None

    monkeypatch.setattr(TtlCache, "_now", staticmethod(lambda: base))
    cache.set("k2", 8)
    cache.clear()
    assert cache.get("k2") is None


def test_query_validation_boundaries(client) -> None:
    bad_lookback = client.get("/api/v1/trust/signals/AAPL/explanation?lookback_hours=0")
    assert bad_lookback.status_code == 422

    bad_top_n = client.get("/api/v1/trust/signals/AAPL/explanation?top_n=99")
    assert bad_top_n.status_code == 422

    bad_limit = client.get("/api/v1/trust/annotations/AAPL?limit=0")
    assert bad_limit.status_code == 422

    bad_signal_limit = client.get("/api/v1/trust/signals/AAPL/audit?limit=500")
    assert bad_signal_limit.status_code == 422
