import { useEffect, useState } from 'react';

import PageHeader from '../components/PageHeader';
import SentimentBar from '../components/dashboard/SentimentBar';
import TickerFilter from '../components/dashboard/TickerFilter';
import { WATCHLIST } from '../data/mockMarket';
import { getTickerArticleTable, ingestAndScore } from '../services/api';
import type { IngestAndScoreSummary, TickerArticleTable } from '../types/market';

function NewsFeedPage() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [articleTable, setArticleTable] = useState<TickerArticleTable | null>(null);
  const [pipelineSummary, setPipelineSummary] = useState<IngestAndScoreSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const loadArticles = async (ticker: string) => {
    const data = await getTickerArticleTable(ticker);
    setArticleTable(data);
  };

  useEffect(() => {
    void loadArticles(selectedTicker);
  }, [selectedTicker]);

  const runPipeline = async () => {
    setIsRunning(true);
    try {
      const summary = await ingestAndScore([selectedTicker]);
      setPipelineSummary(summary);
      // Reload the sentiment-annotated article table after pipeline run
      await loadArticles(selectedTicker);
    } finally {
      setIsRunning(false);
    }
  };

  // Aggregate sentiment ratios from article rows for the SentimentBar
  const sentimentRatios = (() => {
    const rows = articleTable?.rows ?? [];
    if (!rows.length) return null;
    const pos = rows.filter((r) => r.label === 'positive').length / rows.length;
    const neg = rows.filter((r) => r.label === 'negative').length / rows.length;
    const neu = 1 - pos - neg;
    return { pos, neu, neg };
  })();

  return (
    <section>
      <PageHeader
        title="News Feed"
        subtitle="Sentiment-annotated market headlines by ticker"
        rightSlot={<TickerFilter options={WATCHLIST} selected={selectedTicker} onChange={setSelectedTicker} />}
      />

      <article className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem' }}>
          <div>
            <h3>Ingestion Pipeline</h3>
            {pipelineSummary ? (
              <p className="muted" style={{ marginTop: '0.3rem', fontSize: '0.85rem' }}>
                Run {pipelineSummary.run_id}: {pipelineSummary.news_items_inserted} news ingested •{' '}
                {pipelineSummary.sentiments_created} sentiments scored • {pipelineSummary.signals_created} signals generated
              </p>
            ) : null}
          </div>
          <button type="button" className="action-button" onClick={() => void runPipeline()} disabled={isRunning}>
            {isRunning ? 'Running…' : '▶ Ingest → Sentiment → Signal'}
          </button>
        </div>
      </article>

      {sentimentRatios ? (
        <article className="panel">
          <h3>
            {selectedTicker} Sentiment Distribution{' '}
            <span className="muted" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
              ({articleTable?.total ?? 0} articles)
            </span>
          </h3>
          <div style={{ marginTop: '0.65rem' }}>
            <SentimentBar positive={sentimentRatios.pos} neutral={sentimentRatios.neu} negative={sentimentRatios.neg} showLabels />
          </div>
        </article>
      ) : null}

      <article className="panel">
        <h3>Article Sentiment Feed</h3>
        <ul className="news-list">
          {(articleTable?.rows ?? []).map((row) => (
            <li key={row.sentiment_record_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div>
                  <strong>{row.ticker}</strong>
                  <span className="muted"> • {row.source}</span>
                  <span className="muted"> • {new Date(row.timestamp).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span
                    className={`badge ${row.label === 'positive' ? 'positive' : row.label === 'negative' ? 'negative' : 'neutral'}`}
                  >
                    {row.label}
                  </span>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>
                    score {row.score >= 0 ? '+' : ''}{row.score.toFixed(2)} • {(row.confidence * 100).toFixed(0)}% conf
                  </span>
                  <span className="muted badge-model">{row.model_used}</span>
                </div>
              </div>
              <p style={{ marginTop: '0.4rem' }}>{row.text_preview}</p>
            </li>
          ))}
          {(articleTable?.rows ?? []).length === 0 && (
            <li className="muted">
              No articles yet — run the pipeline above to ingest and score news for {selectedTicker}.
            </li>
          )}
        </ul>
      </article>
    </section>
  );
}

export default NewsFeedPage;
