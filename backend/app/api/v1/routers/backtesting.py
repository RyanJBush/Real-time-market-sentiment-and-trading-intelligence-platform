from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.backtest import (
    BacktestRequest,
    BacktestResponse,
    PaperTradeRequest,
    PaperTradeResponse,
    ScenarioBacktestResponse,
    ThresholdTuningRequest,
    ThresholdTuningResponse,
)
from app.services.backtest_service import backtest_service
from app.services.backtesting import TradingRule, backtest_engine

router = APIRouter()


@router.post("", response_model=BacktestResponse)
def run_backtest(payload: BacktestRequest, db: Session = Depends(get_db)) -> BacktestResponse:
    return backtest_service.run_backtest(db, payload)


@router.post("/tune", response_model=ThresholdTuningResponse)
def tune_thresholds(payload: ThresholdTuningRequest, db: Session = Depends(get_db)) -> ThresholdTuningResponse:
    return backtest_service.tune_thresholds(db, payload)


@router.post("/paper-trade", response_model=PaperTradeResponse)
def paper_trade(payload: PaperTradeRequest, db: Session = Depends(get_db)) -> PaperTradeResponse:
    return backtest_service.run_paper_trade(db, payload)


@router.get("/scenarios/{ticker}", response_model=ScenarioBacktestResponse)
def run_scenarios(
    ticker: str,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
) -> ScenarioBacktestResponse:
    return backtest_service.run_scenarios(db, ticker=ticker, start_date=start_date, end_date=end_date)


@router.post("/backtest")
def run_strategy_backtest(payload: BacktestRequest, db: Session = Depends(get_db)) -> dict:
    return backtest_engine.run(
        db=db,
        ticker=payload.ticker.upper(),
        start_date=payload.start_date,
        end_date=payload.end_date,
        sentiment_threshold=payload.buy_threshold,
        trading_rule=TradingRule(buy_above=payload.buy_threshold, sell_below=payload.sell_threshold),
    )
