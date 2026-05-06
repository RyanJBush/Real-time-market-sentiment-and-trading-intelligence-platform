interface SentimentBarProps {
  positive: number;
  neutral: number;
  negative: number;
  showLabels?: boolean;
}

/** Horizontal stacked bar visualizing positive / neutral / negative ratios. */
function SentimentBar({ positive, neutral, negative, showLabels = false }: SentimentBarProps) {
  const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
  return (
    <div>
      <div className="sentiment-bar">
        <div className="sentiment-bar-fill positive" style={{ width: pct(positive) }} title={`Positive ${pct(positive)}`} />
        <div className="sentiment-bar-fill neutral" style={{ width: pct(neutral) }} title={`Neutral ${pct(neutral)}`} />
        <div className="sentiment-bar-fill negative" style={{ width: pct(negative) }} title={`Negative ${pct(negative)}`} />
      </div>
      {showLabels && (
        <div className="sentiment-bar-labels">
          <span className="positive-text">{pct(positive)}</span>
          <span className="muted">{pct(neutral)}</span>
          <span className="negative-text">{pct(negative)}</span>
        </div>
      )}
    </div>
  );
}

export default SentimentBar;
