import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { Lightbulb, BarChart3, Award } from 'lucide-react';

export const InsightsScreen: React.FC = () => {
  const {
    user,
    categories,
    spentByCategory,
    totalSpentCurrentMonth,
    currentMonth,
  } = useFinance();

  const currency = user.currency || 'INR';

  const sortedCats = Object.entries(spentByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([catId, amount]) => ({
      category: categories.find((c) => c.id === catId),
      amount,
      percentage: totalSpentCurrentMonth > 0 ? Math.round((amount / totalSpentCurrentMonth) * 100) : 0,
    }));

  const topCategory = sortedCats[0];

  return (
    <div className="space-y-4 pb-24">
      {/* Monthly Summary Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-slate-800">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold">Monthly Spending Summary</h2>
        </div>
        <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
          <span className="text-xs text-slate-500">Total Spent ({currentMonth})</span>
          <span className="text-lg font-extrabold text-slate-900">
            {formatCurrency(totalSpentCurrentMonth, currency)}
          </span>
        </div>
      </div>

      {/* Rule-Based Insights Card Preview */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-amber-900">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Financial Insights
          </h3>
        </div>

        {topCategory && topCategory.category ? (
          <div className="space-y-2 text-xs text-amber-950">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-amber-200/60">
              <span className="font-semibold text-amber-900 block">
                Top Spending Category
              </span>
              <p className="mt-0.5">
                {topCategory.category.name} accounts for{' '}
                <strong className="text-amber-900">{topCategory.percentage}%</strong> of
                your monthly spending ({formatCurrency(topCategory.amount, currency)}).
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 p-3 rounded-xl text-center text-xs text-amber-800">
            Log expenses to generate personalized spending insights and trends.
          </div>
        )}
      </div>

      {/* Top Categories Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Spending by Category
          </h3>
        </div>

        {sortedCats.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No spending data yet</p>
        ) : (
          <div className="space-y-2.5">
            {sortedCats.map((item) => (
              <div
                key={item.category?.id || Math.random()}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.category?.color || '#cbd5e1' }}
                  />
                  <span className="font-medium text-slate-700">
                    {item.category?.name || 'Other'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1.5">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
