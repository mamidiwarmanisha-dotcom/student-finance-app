import React from 'react';

interface ProgressBarProps {
  spent: number;
  limit: number;
  label?: string;
  showPercent?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  spent,
  limit,
  label,
  showPercent = true,
}) => {
  const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  const isOver = spent > limit && limit > 0;

  // Color logic based on thresholds (<= 50% green, 50-80% amber, > 80% red)
  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let statusText = 'On Track';

  if (isOver) {
    barColor = 'bg-red-600';
    badgeColor = 'text-red-700 bg-red-50 border-red-200';
    statusText = 'Exceeded';
  } else if (percentage > 80) {
    barColor = 'bg-red-500';
    badgeColor = 'text-red-700 bg-red-50 border-red-200';
    statusText = 'Critical';
  } else if (percentage >= 50) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    statusText = 'Moderate';
  }

  return (
    <div className="w-full space-y-1.5" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label && <span className="text-slate-700 font-semibold">{label}</span>}
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[11px] border font-medium ${badgeColor}`}>
              {statusText} ({percentage}%)
            </span>
          </div>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
