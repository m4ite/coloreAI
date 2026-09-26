export default function MetricIndicator({
  label,
  value,
  unit,
  quality = 'good',
}) {
  const colors = {
    good: 'text-success',
    medium: 'text-warning',
    poor: 'text-error',
  };

  const bars = {
    good: 3,
    medium: 2,
    poor: 1,
  };

  const barCount = bars[quality];

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-subtle uppercase tracking-wider font-medium font-mono">
        {label}
      </span>

      <div className="flex items-end gap-2">
        <span className={`text-2xl font-semibold font-mono ${colors[quality]}`}>
          {value}
        </span>

        {unit && (
          <span className="text-sm text-fg-muted mb-0.5">
            {unit}
          </span>
        )}
      </div>

      <div className="flex gap-0.5 mt-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= barCount
                ? quality === 'good'
                  ? 'bg-success'
                  : quality === 'medium'
                  ? 'bg-warning'
                  : 'bg-error'
                : 'bg-muted-bg'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function qualityFromPsnr(psnr) {
  if (psnr >= 31) return 'good';
  if (psnr >= 27) return 'medium';
  return 'poor';
}

export function qualityFromSsim(ssim) {
  if (ssim >= 0.85) return 'good';
  if (ssim >= 0.75) return 'medium';
  return 'poor';
}