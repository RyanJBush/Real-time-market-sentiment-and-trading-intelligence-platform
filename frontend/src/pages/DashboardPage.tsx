import { useEffect, useMemo, useRef, useState } from 'react';

import { MOCK_SENTIMENT_SERIES, WATCHLIST } from '../data/mockMarket';
import { useMarketStream } from '../hooks/useMarketStream';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/dashboard/KpiCard';
import SentimentBar from '../components/dashboard/SentimentBar';
import SentimentChart from '../components/dashboard/SentimentChart';
import SignalBadge from '../components/dashboard/SignalBadge';
import {
  getDashboardOverview,
  getEventDistribution,
  getTickerAggregation,
  getTickerMetrics,
  getTopicClusters,
  getWatchlistAlerts,
  getWatchlistSignals,
  ingestAndScore,
} from '../services/api';
import type { DashboardOverview, EventDistributionItem, Signal, TickerAggregation, TickerMetricsResponse, TopicClusterSummary, WatchlistAlert } from '../types/market';

function DashboardPage() {
  const { events, isLive } = useMarketStream(12);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [eventDistribution, setEventDistribution] = useState<EventDistributionItem[]>([]);
  const [clusters, setClusters] = useState<TopicClusterSummary[]>([]);
  const [alerts, setAlerts] = useState<WatchlistAlert[]>([]);
  const [watchlistSignals, setWatchlistSignals] = useState<Signal[]>([]);
  const [tickerAggregates, setTickerAggregates] = useState<Record<string, TickerAggregation>>({});
  const [primaryMetrics, setPrimaryMetrics] = useState<TickerMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simCount, setSimCount] = useState(0);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [overviewData, distributionData, clusterData, alertData, signalData, metricsData, ...aggResults] =
        await Promise.all([
          getDashboardOverview(WATCHLIST),
          getEventDistribution(),
          getTopicClusters(),
          getWatchlistAlerts(WATCHLIST),
          getWatchlistSignals(WATCHLIST),
          getTickerMetrics(WATCHLIST[0]),
          ...WATCHLIST.map((t) => getTickerAggregation(t)),
        ]);
      setOverview(overviewData);
      setEventDistribution(distributionData);
      setClusters(clusterData);
      setAlerts(alertData);
      setWatchlistSignals(signalData);
      setPrimaryMetrics(metricsData);
      const map: Record<string, TickerAggregation> = {};
      WATCHLIST.forEach((t, i) => {
        map[t] = aggResults[i] as TickerAggregation;
      });
      setTickerAggregates(map);
    } catch {
      setLoadError('Failed to refresh dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  // Cleanup simulation interval on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, []);

  const [simError, setSimError] = useState<string | null>(null);

  const startSimulation = () => {
    setIsSimulating(true);
    setSimError(null);
    // Trigger one cycle immediately, then repeat every 10 s
    const runCycle = () => {
      void ingestAndScore(WATCHLIST)
        .then(() => {
          setSimCount((c) => c + 1);
          void loadDashboard();
        })
        .catch(() => {
          setSimError('Simulation cycle failed — check backend connection.');
        });
    };
    runCycle();
    simulationRef.current = setInterval(runCycle, 10_000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
  };

  // Build sentiment chart series from real metrics; fall back to mock
  const chartSeries = useMemo(() => {
    const pts = primaryMetrics?.points ?? [];
    if (pts.length >= 3) {
      return pts.map((p) => Math.min(1, Math.max(0, (p.weighted_sentiment_score + 1) / 2)));
    }
    return MOCK_SENTIMENT_SERIES;
  }, [primaryMetrics]);

  // Top mover = ticker with highest absolute weighted sentiment score
  const topMover = useMemo(() => {
    const entries = Object.entries(tickerAggregates);
    if (!entries.length) return overview?.most_mentioned_tickers[0] ?? WATCHLIST[0];
    return entries.sort((a, b) => Math.abs(b[1].weighted_sentiment_score) - Math.abs(a[1].weighted_sentiment_score))[0][0];
  }, [tickerAggregates, overview]);

  const kpis = useMemo(() => {
    const averageSentiment = (overview?.avg_sentiment_score ?? 0).toFixed(2);
    const watchlistAlerts = overview?.watchlist_alerts ?? alerts.length;

    return [
      { label: 'Sentiment Index', value: averageSentiment, delta: '+0.03 today', tone: 'positive' as const },
      { label: 'Articles Processed', value: String(overview?.articles_processed ?? 0), delta: '24h coverage', tone: 'neutral' as const },
      { label: 'Active Signals', value: String(watchlistSignals.filter((s) => s.signal !== 'HOLD').length), delta: 'BUY + SELL signals', tone: 'neutral' as const },
      { label: 'Watchlist Alerts', value: String(watchlistAlerts), delta: 'Sharp shift + low confidence', tone: watchlistAlerts > 0 ? 'negative' as const : 'positive' as const },
      { label: 'Top Mover', value: topMover, delta: 'Highest absolute score', tone: 'neutral' as const },
      { label: 'Stream Health', value: isLive ? 'Live' : 'Offline', delta: `${events.length} recent events`, tone: isLive ? 'positive' as const : 'negative' as const },
    ];
  }, [alerts.length, events.length, isLive, overview, topMover, watchlistSignals]);

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time sentiment and trading pulse"
        rightSlot={
          <div style={{ display: 'flex', gap: '0.55rem' }}>
            <button type="button" className="action-button" onClick={() => void loadDashboard()} disabled={isLoading}>
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            {isSimulating ? (
              <button type="button" className="action-button sim-active" onClick={stopSimulation}>
                ⏸ Stop sim ({simCount})
              </button>
            ) : (
              <button type="button" className="action-button sim-start" onClick={startSimulation}>
                ▶ Start simulation
              </button>
            )}
          </div>
        }
      />
      {loadError ? <p className="muted">{loadError}</p> : null}
      {simError ? <p className="muted" style={{ color: '#f87171' }}>{simError}</p> : null}

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} delta={kpi.delta} tone={kpi.tone} />
        ))}
      </div>

      {/* Ticker sentiment grid */}
      <article className="panel">
        <h3>Watchlist Sentiment Snapshot</h3>
        <div className="ticker-sentiment-grid">
          {WATCHLIST.map((ticker) => {
            const agg = tickerAggregates[ticker];
            const score = agg?.weighted_sentiment_score ?? 0;
            const scoreTone = score > 0.15 ? 'positive' : score < -0.15 ? 'negative' : 'neutral';
            const signal = watchlistSignals.find((s) => s.ticker === ticker);
            return (
              <div key={ticker} className="ticker-sentiment-card">
                <div className="ticker-sentiment-card-header">
                  <strong>{ticker}</strong>
                  {signal ? <SignalBadge signal={signal.signal} size="sm" /> : null}
                </div>
                <div className={`ticker-score ${scoreTone}`}>{score >= 0 ? '+' : ''}{score.toFixed(2)}</div>
                {agg ? (
                  <SentimentBar positive={agg.positive_ratio} neutral={agg.neutral_ratio} negative={agg.negative_ratio} />
                ) : null}
                <p className="ticker-coverage muted">{agg?.article_count ?? 0} articles</p>
              </div>
            );
          })}
        </div>
      </article>

      <div className="panel-grid">
        <SentimentChart title={`${WATCHLIST[0]} sentiment trend (24h)`} values={chartSeries} />
        <article className="panel">
          <h3>Live Event Tape</h3>
          <ul className="event-list">
            {events.slice(0, 8).map((event, index) => (
              <li key={`${event.timestamp ?? index}-${index}`}>
                <strong>{event.ticker ?? 'MKT'}</strong>{' '}
                {event.event === 'sentiment_update' && event.label ? (
                  <span className={`badge ${event.label === 'positive' ? 'positive' : event.label === 'negative' ? 'negative' : 'neutral'} badge-sm`}>
                    {event.label}
                  </span>
                ) : null}{' '}
                {event.event}
                {event.score != null ? ` • ${event.score > 0 ? '+' : ''}${Number(event.score).toFixed(2)}` : ''}
              </li>
            ))}
            {events.length === 0 && <li className="muted">Awaiting stream events…</li>}
          </ul>
        </article>
      </div>

      <div className="panel-grid">
        <article className="panel">
          <h3>Event Distribution</h3>
          <ul className="event-list">
            {eventDistribution.slice(0, 5).map((item) => (
              <li key={item.event_type}>
                <strong>{item.event_type}</strong> • {item.count} mentions
              </li>
            ))}
            {eventDistribution.length === 0 && <li className="muted">No event data yet.</li>}
          </ul>
        </article>
        <article className="panel">
          <h3>Recurring Topic Clusters</h3>
          <ul className="event-list">
            {clusters.slice(0, 5).map((item) => (
              <li key={item.topic}>
                <strong>{item.topic}</strong> • {item.mentions} mentions • {item.sample_tickers.join(', ')}
              </li>
            ))}
            {clusters.length === 0 && <li className="muted">No topic clusters yet.</li>}
          </ul>
        </article>
      </div>

      <article className="panel">
        <h3>Alert Center</h3>
        <ul className="event-list">
          {alerts.length ? (
            alerts.map((alert) => (
              <li key={`${alert.ticker}-${alert.alert_type}`}>
                <strong>{alert.ticker}</strong>{' '}
                <span className={`badge ${alert.severity === 'high' ? 'negative' : alert.severity === 'medium' ? 'neutral' : 'positive'} badge-sm`}>
                  {alert.severity}
                </span>{' '}
                {alert.alert_type} • {(alert.confidence * 100).toFixed(0)}% conf • {alert.detail}
              </li>
            ))
          ) : (
            <li className="muted">No active watchlist alerts.</li>
          )}
        </ul>
      </article>

      <article className="panel">
        <h3>Watchlist Signals</h3>
        <table className="signals-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Signal</th>
              <th>Score</th>
              <th>Confidence</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {watchlistSignals.map((signal) => (
              <tr key={signal.ticker}>
                <td>{signal.ticker}</td>
                <td>
                  <SignalBadge signal={signal.signal} size="sm" />
                </td>
                <td className={signal.weighted_score != null && signal.weighted_score > 0 ? 'positive-text' : signal.weighted_score != null && signal.weighted_score < 0 ? 'negative-text' : ''}>
                  {signal.weighted_score != null ? (signal.weighted_score >= 0 ? '+' : '') + signal.weighted_score.toFixed(2) : '-'}
                </td>
                <td>{(signal.confidence * 100).toFixed(0)}%</td>
                <td className="muted">{signal.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}

export default DashboardPage;
