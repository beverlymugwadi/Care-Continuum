/**
 * Thin rounded progress bar (lavender track, pink-gradient fill) used
 * anywhere we show "N of M complete" — ANC visit progress today.
 */
export default function ProgressBar({ value, max, height = 6 }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="progress-track"
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className="progress-fill" style={{ width: `${pct}%`, height }} />
    </div>
  );
}
