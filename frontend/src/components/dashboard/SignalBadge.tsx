type SignalType = 'BUY' | 'SELL' | 'HOLD' | string;

interface SignalBadgeProps {
  signal: SignalType;
  size?: 'sm' | 'md';
}

/** Colored badge for BUY / SELL / HOLD signals. */
function SignalBadge({ signal, size = 'md' }: SignalBadgeProps) {
  const tone = signal === 'BUY' ? 'positive' : signal === 'SELL' ? 'negative' : 'neutral';
  const className = `badge ${tone}${size === 'sm' ? ' badge-sm' : ''}`;
  return <span className={className}>{signal}</span>;
}

export default SignalBadge;
