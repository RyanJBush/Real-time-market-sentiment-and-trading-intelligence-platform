import type { BacktestResult } from '../../types/market';

type Props = { result: BacktestResult | null };

function BacktestResultsPanel({ result }: Props) {
  if (!result) return null;
  const points = result.equity_curve;
  const max = Math.max(...points.map((p) => p.equity), 1);
  const min = Math.min(...points.map((p) => p.equity), 1);
  const span = max - min || 1;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / Math.max(points.length - 1, 1)) * 100} ${100 - ((p.equity - min) / span) * 100}`).join(' ');

  return (
    <article className="panel">
      <h3>Backtest Results</h3>
      <p className="muted">Return: {(result.total_return * 100).toFixed(2)}% • Sharpe: {result.sharpe_ratio.toFixed(2)} • Win rate: {(result.win_rate * 100).toFixed(1)}%</p>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: 180, background: '#0b1220', borderRadius: 8 }}>
        <path d={path} fill="none" stroke="#34d399" strokeWidth="1.8" />
      </svg>
      <table className="signals-table" style={{ marginTop: 12 }}>
        <thead><tr><th>Date</th><th>Action</th><th>Price</th><th>Sentiment</th><th>Trade Return</th></tr></thead>
        <tbody>
          {result.trade_log.map((t, i) => (
            <tr key={`${t.date}-${i}`}>
              <td>{t.date}</td><td>{t.action}</td><td>{t.price.toFixed(2)}</td><td>{t.sentiment.toFixed(2)}</td><td>{t.trade_return != null ? `${(t.trade_return * 100).toFixed(2)}%` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

export default BacktestResultsPanel;
