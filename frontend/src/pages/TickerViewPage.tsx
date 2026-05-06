import { useEffect, useMemo, useState } from 'react';

import PageHeader from '../components/PageHeader';
import SentimentBar from '../components/dashboard/SentimentBar';
import SentimentChart from '../components/dashboard/SentimentChart';
import SignalBadge from '../components/dashboard/SignalBadge';
import TickerFilter from '../components/dashboard/TickerFilter';
import { WATCHLIST } from '../data/mockMarket';
import {
  getSignalExplanation,
  getTickerAggregation,
  getTickerArticleTable,
  getTickerDrilldown,
  getTickerMetrics,
  getTickerSignal,
} from '../services/api';
import type {
  Signal,
  SignalExplanationResponse,
  TickerAggregation,
  TickerArticleTable,
  TickerDrilldownResponse,
  TickerMetricsResponse,
} from '../types/market';

function TickerViewPage() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [aggregate, setAggregate] = useState<TickerAggregation | null>(null);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [articleTable, setArticleTable] = useState<TickerArticleTable | null>(null);
  const [metrics, setMetrics] = useState<TickerMetricsResponse | null>(null);
  const [drilldown, setDrilldown] = useState<TickerDrilldownResponse | null>(null);
  const [explanation, setExplanation] = useState<SignalExplanationResponse | null>(null);

  useEffect(() => {
    void (async () => {
      const [aggregationData, signalData, articleData, metricsData, drilldownData, explanationData] = await Promise.all([
        getTickerAggregation(selectedTicker),
        getTickerSignal(selectedTicker),
        getTickerArticleTable(selectedTicker),
        getTickerMetrics(selectedTicker),
        getTickerDrilldown(selectedTicker),
        getSignalExplanation(selectedTicker),
      ]);
      setAggregate(aggregationData);
      setSignal(signalData);
      setArticleTable(articleData);
      setMetrics(metricsData);
      setDrilldown(drilldownData);
      setExplanation(explanationData);
    })();
  }, [selectedTicker]);

  const chartSeries = useMemo(() => {
    const points = metrics?.points ?? [];
    if (points.length >= 3) {
      return points.map((p) => Math.min(1, Math.max(0, (p.weighted_sentiment_score + 1) / 2)));
    }
    const base = aggregate?.weighted_sentiment_score ?? 0.0;
    return Array.from({ length: 12 }).map((_, index) =>
      Math.min(0.95, Math.max(0.1, 0.5 + base / 2 + (index % 2 ? 0.03 : -0.02))),
    );
  }, [aggregate, metrics]);

  return (
    <section>
      <PageHeader
        title="Ticker View"
        subtitle="Drill-down sentiment, ratios, and actionable signal by ticker"
        rightSlot={<TickerFilter options={WATCHLIST} selected={selectedTicker} onChange={setSelectedTicker} />}
      />

      <div className="panel-grid">
        <SentimentChart title={`${selectedTicker} sentiment curve`} values={chartSeries} />

        <article className="panel">
          <h3>Signal Snapshot</h3>
          {signal ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.55rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <SignalBadge signal={signal.signal} />
                <span className="muted" style={{ fontSize: '0.88rem' }}>
                  {(signal.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
              {signal.weighted_score != null && (
                <div>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>Weighted score: </span>
                  <span className={signal.weighted_score > 0 ? 'positive-text' : signal.weighted_score < 0 ? 'negative-text' : ''}>
                    {signal.weighted_score >= 0 ? '+' : ''}{signal.weighted_score.toFixed(3)}
                  </span>
                </div>
              )}
              <p className="muted" style={{ fontSize: '0.88rem' }}>{signal.rationale}</p>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: '0.55rem' }}>Loading signal…</p>
          )}
        </article>
      </div>

      {/* Sentiment composition with bar */}
      <article className="panel">
        <h3>
          Sentiment Composition{' '}
          {aggregate ? (
            <span className="muted" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
              {aggregate.article_count} items • weighted score{' '}
              <span className={aggregate.weighted_sentiment_score > 0 ? 'positive-text' : aggregate.weighted_sentiment_score < 0 ? 'negative-text' : ''}>
                {aggregate.weighted_sentiment_score >= 0 ? '+' : ''}{aggregate.weighted_sentiment_score.toFixed(3)}
              </span>
            </span>
          ) : null}
        </h3>
        {aggregate ? (
          <div style={{ marginTop: '0.65rem' }}>
            <SentimentBar
              positive={aggregate.positive_ratio}
              neutral={aggregate.neutral_ratio}
              negative={aggregate.negative_ratio}
              showLabels
            />
            {Object.keys(aggregate.source_breakdown ?? {}).length > 0 && (
              <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(aggregate.source_breakdown).map(([src, cnt]) => (
                  <span key={src} className="badge-model">
                    {src}: {cnt}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: '0.55rem' }}>Loading aggregation…</p>
        )}
      </article>

      {/* Article sentiment table */}
      <article className="panel">
        <h3>Article Sentiment Feed</h3>
        <table className="signals-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Source</th>
              <th>Label</th>
              <th>Score</th>
              <th>Conf</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {(articleTable?.rows ?? []).map((row) => (
              <tr key={row.sentiment_record_id}>
                <td className="muted" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                  {new Date(row.timestamp).toLocaleTimeString()}
                </td>
                <td className="muted" style={{ fontSize: '0.82rem' }}>{row.source}</td>
                <td>
                  <span className={`badge badge-sm ${row.label === 'positive' ? 'positive' : row.label === 'negative' ? 'negative' : 'neutral'}`}>
                    {row.label}
                  </span>
                </td>
                <td className={row.score > 0.5 ? 'positive-text' : row.score < -0.1 ? 'negative-text' : ''}>
                  {row.score >= 0 ? '+' : ''}{row.score.toFixed(2)}
                </td>
                <td className="muted" style={{ fontSize: '0.82rem' }}>{(row.confidence * 100).toFixed(0)}%</td>
                <td className="muted" style={{ fontSize: '0.82rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.text_preview}
                </td>
              </tr>
            ))}
            {(articleTable?.rows ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="muted">No articles yet — run the pipeline from the News Feed page.</td>
              </tr>
            )}
          </tbody>
        </table>
      </article>

      <div className="panel-grid">
        {/* Sentiment history */}
        <article className="panel">
          <h3>Recent Sentiment History</h3>
          <ul className="event-list">
            {(drilldown?.sentiment_history ?? []).slice(0, 8).map((row) => (
              <li key={`${row.timestamp}-${row.source}`}>
                <span className="muted" style={{ fontSize: '0.8rem' }}>{new Date(row.timestamp).toLocaleString()}</span>{' '}
                <span className={`badge badge-sm ${row.label === 'positive' ? 'positive' : row.label === 'negative' ? 'negative' : 'neutral'}`}>
                  {row.label}
                </span>{' '}
                <span className="badge-model">{row.source}</span>{' '}
                <span className={row.score > 0.5 ? 'positive-text' : row.score < -0.1 ? 'negative-text' : ''}>
                  {row.score >= 0 ? '+' : ''}{row.score.toFixed(2)}
                </span>
              </li>
            ))}
            {!(drilldown?.sentiment_history.length) && <li className="muted">No sentiment history yet.</li>}
          </ul>
        </article>

        {/* Signal explainability — article → sentiment → signal traceability */}
        <article className="panel">
          <h3>Signal Explainability</h3>
          {explanation ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.6rem' }}>
                <SignalBadge signal={explanation.generated_signal} size="sm" />
                <span className="muted" style={{ fontSize: '0.85rem' }}>
                  {(explanation.generated_confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
              {explanation.confidence_disclaimer ? (
                <p className="muted" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>{explanation.confidence_disclaimer}</p>
              ) : null}
              <p className="muted" style={{ fontSize: '0.78rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Top contributing articles
              </p>
              <ul className="event-list">
                {explanation.top_contributors.map((item) => (
                  <li key={item.sentiment_record_id} style={{ borderLeft: `3px solid ${item.label === 'positive' ? '#22c55e' : item.label === 'negative' ? '#ef4444' : '#475569'}`, paddingLeft: '0.6rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={`badge badge-sm ${item.label === 'positive' ? 'positive' : item.label === 'negative' ? 'negative' : 'neutral'}`}>
                        {item.label}
                      </span>
                      <span className="badge-model">{item.source}</span>
                      <span className="muted" style={{ fontSize: '0.78rem' }}>
                        score {item.score >= 0 ? '+' : ''}{item.score.toFixed(2)} • wt {item.contribution_weight.toFixed(3)}
                      </span>
                    </div>
                    {item.text_preview ? (
                      <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                        "{item.text_preview}"
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {explanation.contradictions.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <p className="muted" style={{ fontSize: '0.78rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Source contradictions
                  </p>
                  <ul className="event-list">
                    {explanation.contradictions.map((c) => (
                      <li key={c.source} className="muted" style={{ fontSize: '0.82rem' }}>
                        <span className="badge-model">{c.source}</span>{' '}
                        <span className="positive-text">{c.positive_count} positive</span> vs{' '}
                        <span className="negative-text">{c.negative_count} negative</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="muted" style={{ marginTop: '0.55rem' }}>Loading explainability…</p>
          )}
        </article>
      </div>

      {/* Signal audit trail */}
      {(drilldown?.signal_history ?? []).length > 0 && (
        <article className="panel">
          <h3>Signal History</h3>
          <table className="signals-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Signal</th>
                <th>Score</th>
                <th>Confidence</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {drilldown!.signal_history.map((row, index) => (
                <tr key={`${row.timestamp}-${index}`}>
                  <td className="muted" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <SignalBadge signal={row.signal} size="sm" />
                  </td>
                  <td className={row.weighted_score > 0 ? 'positive-text' : row.weighted_score < 0 ? 'negative-text' : ''}>
                    {row.weighted_score >= 0 ? '+' : ''}{row.weighted_score.toFixed(2)}
                  </td>
                  <td className="muted" style={{ fontSize: '0.82rem' }}>{(row.confidence * 100).toFixed(0)}%</td>
                  <td className="muted" style={{ fontSize: '0.82rem' }}>{row.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </section>
  );
}

export default TickerViewPage;
