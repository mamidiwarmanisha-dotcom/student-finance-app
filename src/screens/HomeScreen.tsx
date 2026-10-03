import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { ProgressBar } from '../components/common/ProgressBar';
import { AlertBanner } from '../components/common/AlertBanner';
import { Button } from '../components/common/Button';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  Plus,
  Wallet,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface HomeScreenProps {
  onNavigateToExpenses: () => void;
  onNavigateToBudget: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToExpenses,
  onNavigateToBudget: _onNavigateToBudget,
}) => {
  const {
    user,
    recentExpenses,
    totalSpentCurrentMonth,
    spentByCategory,
    budget,
    budgetLines,
    alerts,
    categories,
    openAddExpenseModal,
    openEditExpenseModal,
    openBudgetWizard,
    dismissAlert,
  } = useFinance();

  const currency = user.currency || 'INR';
  const budgetLimit = budget?.total_limit || 0;
  const remaining = budgetLimit > totalSpentCurrentMonth ? budgetLimit - totalSpentCurrentMonth : 0;
  const percentageSpent = budgetLimit > 0 ? Math.round((totalSpentCurrentMonth / budgetLimit) * 100) : 0;

  // Active categories with spending or specific budget lines
  const activeCategoryProgress = categories
    .map((cat) => {
      const spent = spentByCategory[cat.id] || 0;
      const line = budgetLines.find((l) => l.category_id === cat.id);
      const limit = line ? line.limit_amount : 0;
      return {
        category: cat,
        spent,
        limit,
        hasActivity: spent > 0 || limit > 0,
      };
    })
    .filter((item) => item.hasActivity)
    .sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Threshold Alert Banners (50%, 80%, 100% and Category Alerts) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alt) => {
            const cat = alt.category_id ? categories.find((c) => c.id === alt.category_id) : undefined;
            const message = alt.threshold === 100
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

      {/* 2. Student Balance & Monthly Spending Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-card relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between text-blue-100 text-xs font-medium mb-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Student Dashboard</span>
          </span>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide">
            {user.name || 'Student'}
          </span>
        </div>

        <div className="mt-2">
          <p className="text-xs font-medium text-blue-200">Total Spent this Month</p>
          <p className="text-3xl font-extrabold tracking-tight mt-0.5">
            {formatCurrency(totalSpentCurrentMonth, currency)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/15 text-xs">
          <div>
            <span className="text-blue-200 block text-[11px]">Monthly Budget</span>
            <span className="font-semibold text-sm">
              {budgetLimit > 0 ? formatCurrency(budgetLimit, currency) : 'No limit set'}
            </span>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px]">Remaining</span>
            <span className="font-semibold text-sm">
              {budgetLimit > 0 ? formatCurrency(remaining, currency) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Monthly Budget Progress Bar Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Monthly Budget Progress</h2>
          </div>
          <button
            onClick={openBudgetWizard}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
          >
            {budgetLimit === 0 ? (
              <span>Set Budget &rarr;</span>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Adjust</span>
              </>
            )}
          </button>
        </div>

        {budgetLimit > 0 ? (
          <div className="space-y-2">
            <ProgressBar
              spent={totalSpentCurrentMonth}
              limit={budgetLimit}
              label="Overall Spending"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
              <span>Spent: {formatCurrency(totalSpentCurrentMonth, currency)} ({percentageSpent}%)</span>
              <span>Remaining: {formatCurrency(remaining, currency)}</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 font-medium">No budget set for this month yet.</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs"
              onClick={openBudgetWizard}
            >
              Start Budget Wizard
            </Button>
          </div>
        )}
      </div>

      {/* 4. Category Spending & Budget Limits Progress Bars */}
      {activeCategoryProgress.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Category Budget Progress</h2>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {activeCategoryProgress.length} categories
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {activeCategoryProgress.map((item) => {
              const effectiveLimit = item.limit > 0 ? item.limit : (budgetLimit > 0 ? budgetLimit : 0);

              return (
                <div key={item.category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                        style={{
                          backgroundColor: `${item.category.color}20`,
                          color: item.category.color,
                        }}
                      >
                        <CategoryIcon name={item.category.icon} className="w-3 h-3" />
                      </span>
                      <span className="font-semibold text-slate-700">
                        {item.category.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-slate-900">
                        {formatCurrency(item.spent, currency)}
                      </span>
                      {item.limit > 0 && (
                        <span className="text-slate-400 font-normal">
                          / {formatCurrency(item.limit, currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {effectiveLimit > 0 && (
                    <ProgressBar
                      spent={item.spent}
                      limit={effectiveLimit}
                      showPercent={false}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Quick Action Button (Opens 3-Tap Modal Directly) */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={openAddExpenseModal}
        className="flex items-center justify-center gap-2 shadow-md cursor-pointer font-bold"
      >
        <Plus className="w-5 h-5" />
        <span>Log Expense</span>
      </Button>

      {/* 6. Recent Transactions Section (ExpenseStore Live Feed) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Recent Transactions</h2>
          </div>
          <button
            onClick={onNavigateToExpenses}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-0.5"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <ArrowDownRight className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold text-slate-600">No expenses logged yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tap "Log Expense" to add your first transaction.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentExpenses.map((expense) => {
              const cat = categories.find((c) => c.id === expense.category_id);
              return (
                <div
                  key={expense.id}
                  onClick={() => openEditExpenseModal(expense)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-1.5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: cat ? `${cat.color}15` : '#f1f5f9',
                        color: cat?.color || '#3b82f6',
                      }}
                    >
                      <CategoryIcon name={cat?.icon || cat?.name || 'Other'} className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {expense.note || cat?.name || 'Expense'}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="font-medium text-slate-500">{cat?.name}</span>
                        <span>&bull;</span>
                        <span>{expense.date}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-slate-900 flex-shrink-0">
                    -{formatCurrency(expense.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
