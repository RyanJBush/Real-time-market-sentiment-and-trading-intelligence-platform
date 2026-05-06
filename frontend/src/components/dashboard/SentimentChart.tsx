import { useId } from 'react';

interface SentimentChartProps {
  title: string;
  values: number[];
  showNeutralLine?: boolean;
}

function SentimentChart({ title, values, showNeutralLine = true }: SentimentChartProps) {
  // useId ensures unique gradient IDs even when multiple charts are rendered
  const uid = useId();
  if (!values.length) {
    return (
      <article className="panel">
        <h3>{title}</h3>
        <p className="muted" style={{ marginTop: '0.65rem' }}>No data available</p>
      </article>
    );
  }

  const W = 100;
  const H = 100;
  const padTop = 6;
  const padBottom = 8;
  const innerH = H - padTop - padBottom;

  // Map a 0–1 value to SVG Y (top = 0, bottom = H)
  const toY = (v: number) => padTop + (1 - Math.max(0, Math.min(1, v))) * innerH;

  const pts = values.map((v, i) => ({
    x: (i / Math.max(values.length - 1, 1)) * W,
    y: toY(v),
  }));

  const linePoints = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Closed polygon for area fill: bottom-left → line points → bottom-right
  const areaPoints = [
    `0,${(H - padBottom).toFixed(1)}`,
    ...pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `${W},${(H - padBottom).toFixed(1)}`,
  ].join(' ');

  const neutralY = toY(0.5).toFixed(1);
  const last = values[values.length - 1];
  const first = values[0];
  const trending = last >= first ? 'up' : 'down';
  const accentColor = trending === 'up' ? '#22c55e' : '#f87171';
  const gradId = `grad-${uid}`;
  const areaGradId = `area-${uid}`;

  return (
    <article className="panel">
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="sentiment-chart">
        <defs>
          {/* Line gradient: sky → accent */}
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>
          {/* Area fill gradient: top accent → transparent */}
          <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.30" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Subtle horizontal grid lines at 25 / 50 / 75 % */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1="0"
            x2={W}
            y1={toY(g)}
            y2={toY(g)}
            stroke="#1e293b"
            strokeWidth="0.75"
          />
        ))}

        {/* Neutral 50 % reference line (dashed sky) */}
        {showNeutralLine && (
          <line
            x1="0"
            x2={W}
            y1={neutralY}
            y2={neutralY}
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeDasharray="3,3"
            opacity="0.45"
          />
        )}

        {/* Area fill */}
        <polygon points={areaPoints} fill={`url(#${areaGradId})`} />

        {/* Line */}
        <polyline
          points={linePoints}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Terminal dot on last data point */}
        {pts.length > 0 && (
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill={accentColor} />
        )}
      </svg>
    </article>
  );
}

export default SentimentChart;
