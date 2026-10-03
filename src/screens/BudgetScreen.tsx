import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { ProgressBar } from '../components/common/ProgressBar';
import { AlertBanner } from '../components/common/AlertBanner';
import { Button } from '../components/common/Button';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { PieChart, SlidersHorizontal, Plus } from 'lucide-react';

export const BudgetScreen: React.FC = () => {
  const {
    user,
    categories,
    budget,
    budgetLines,
    totalSpentCurrentMonth,
    spentByCategory,
    currentMonth,
    alerts,
    dismissAlert,
    openBudgetWizard,
  } = useFinance();

  const currency = user.currency || 'INR';
  const totalLimit = budget?.total_limit || 0;

  // Derive a human-readable month label
  const monthLabel = (() => {
    const [year, month] = currentMonth.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  })();

  return (
    <div className="space-y-4 pb-24">
      {/* Budget-related Alert Banners */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alt) => {
            const cat = alt.category_id
              ? categories.find((c) => c.id === alt.category_id)
              : undefined;
            const message =
              alt.threshold === 100
                ? `You have reached 100% of your ${cat ? cat.name : 'monthly'} budget limit!`
                : alt.threshold === 80
                ? `Warning: You have used 80% of your ${cat ? cat.name : 'monthly'} budget!`
                : `Heads up: You have reached 50% of your ${cat ? cat.name : 'monthly'} budget.`;
            return (
              <AlertBanner
                key={alt.id}
                threshold={alt.threshold}
                message={message}
                categoryName={cat?.name}
                onDismiss={() => dismissAlert(alt.id)}
              />
            );
          })}
        </div>
      )}

      {/* Current Month Budget Overview Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Budget for {monthLabel}
            </h2>
          </div>
          {budget ? (
            <Button
              size="sm"
              variant="outline"
              onClick={openBudgetWizard}
              className="flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Edit Budget
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={openBudgetWizard}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Set Budget
            </Button>
          )}
        </div>

        {budget ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-xs text-slate-500">
              <span>Total Spent / Monthly Limit</span>
              <span className="text-sm font-bold text-slate-800">
                {formatCurrency(totalSpentCurrentMonth, currency)}{' '}
                <span className="text-slate-400 font-normal">
                  / {formatCurrency(totalLimit, currency)}
                </span>
              </span>
            </div>
            <ProgressBar
              spent={totalSpentCurrentMonth}
              limit={totalLimit}
              label="Overall Spending"
            />
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              No budget configured for {monthLabel} yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Set a monthly limit and per-category ceilings with the wizard.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={openBudgetWizard}
              className="mt-1 text-xs"
            >
              Open Budget Wizard →
            </Button>
          </div>
        )}
      </div>

      {/* Category-Level Budget Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Category Progress
        </h3>
        <div className="space-y-4">
          {categories.map((cat) => {
            const spent = spentByCategory[cat.id] || 0;
            const line = budgetLines.find((l) => l.category_id === cat.id);
            const lineLimit = line ? line.limit_amount : 0;
            const hasActivity = spent > 0 || lineLimit > 0;

            if (!hasActivity) return null;

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </span>
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-slate-600 font-semibold">
                    {formatCurrency(spent, currency)}
                    {lineLimit > 0 && (
                      <span className="text-slate-400 font-normal">
                        {' '}/ {formatCurrency(lineLimit, currency)}
                      </span>
                    )}
                  </span>
                </div>
                {lineLimit > 0 && (
                  <ProgressBar spent={spent} limit={lineLimit} showPercent={false} />
                )}
              </div>
            );
          })}

          {/* Empty state when no category has spending or limits */}
          {categories.every((cat) => {
            const spent = spentByCategory[cat.id] || 0;
            const line = budgetLines.find((l) => l.category_id === cat.id);
            return spent === 0 && (!line || line.limit_amount === 0);
          }) && (
            <p className="text-xs text-slate-400 text-center py-3">
              No category spending or limits set yet. Log expenses or configure the budget wizard.
            </p>
          )}
        </div>
      </div>

      {/* Budget Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">
          💡 Budgeting Tips
        </h3>
        <ul className="text-[11px] text-blue-900 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>Set a total monthly limit, then allocate per-category ceilings.</li>
          <li>Alerts trigger automatically at 50%, 80%, and 100% of each limit.</li>
          <li>Review category progress weekly to stay on track.</li>
        </ul>
      </div>
    </div>
  );
};
