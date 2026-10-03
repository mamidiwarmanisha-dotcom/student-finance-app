import React from 'react';
import { Calendar } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  rightAction,
}) => {
  const currentMonthYear = new Date().toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-slate-100/90 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-slate-200/60">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-0.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{subtitle || currentMonthYear}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
};
