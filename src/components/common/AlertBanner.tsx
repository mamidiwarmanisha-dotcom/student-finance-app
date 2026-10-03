import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface AlertBannerProps {
  threshold: 50 | 80 | 100;
  message: string;
  categoryName?: string;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  threshold,
  message,
  categoryName,
  onDismiss,
}) => {
  const styles = {
    50: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
      badge: '50% Used',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    80: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
      badge: '80% Used',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    100: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
      badge: '100% Limit',
      badgeColor: 'bg-red-100 text-red-800',
    },
  }[threshold];

  return (
    <div
      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border ${styles.bg} transition-all`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        {styles.icon}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badgeColor}`}>
              {styles.badge}
            </span>
            {categoryName && (
              <span className="text-xs font-semibold text-slate-700">{categoryName}</span>
            )}
          </div>
          <p className="text-xs leading-relaxed font-medium">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
