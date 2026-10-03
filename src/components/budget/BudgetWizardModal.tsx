import React, { useState, useEffect } from 'react';
import type { Budget, BudgetLine } from '../../types/models';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toStorageAmount, fromStorageAmount } from '../../utils/currency';
import { CategoryIcon } from '../common/CategoryIcon';
import { Button } from '../common/Button';
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  PieChart,
  ShieldAlert,
} from 'lucide-react';

interface BudgetWizardModalProps {
  onSuccessReturnToDashboard?: () => void;
}

export const BudgetWizardModal: React.FC<BudgetWizardModalProps> = ({
  onSuccessReturnToDashboard,
}) => {
  const {
    isBudgetWizardOpen,
    closeBudgetWizard,
    saveBudget,
    budget,
    budgetLines,
    categories,
    user,
    totalSpentCurrentMonth,
  } = useFinance();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // 'YYYY-MM'
  );
  const [totalLimitStr, setTotalLimitStr] = useState<string>('');
  const [categoryLimits, setCategoryLimits] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize form state when opening wizard
  useEffect(() => {
    if (isBudgetWizardOpen) {
      setStep(1);
      setErrorMessage(null);

      if (budget) {
        setSelectedMonth(budget.month);
        setTotalLimitStr(fromStorageAmount(budget.total_limit).toString());

        const lineMap: Record<string, string> = {};
        budgetLines.forEach((l) => {
          lineMap[l.category_id] = fromStorageAmount(l.limit_amount).toString();
        });
        setCategoryLimits(lineMap);
      } else {
        setSelectedMonth(new Date().toISOString().substring(0, 7));
        setTotalLimitStr('');
        setCategoryLimits({});
      }
    }
  }, [isBudgetWizardOpen, budget, budgetLines]);

  if (!isBudgetWizardOpen) return null;

  const currency = user.currency || 'INR';
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$';

  // Helper for Month navigation
  const adjustMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(d.toISOString().substring(0, 7));
  };

  const getMonthLabel = (isoMonth: string) => {
    const [year, month] = isoMonth.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleCategoryLimitChange = (catId: string, val: string) => {
    setCategoryLimits((prev) => ({
      ...prev,
      [catId]: val,
    }));
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = () => {
    if (!selectedMonth) {
      setErrorMessage('Please select a valid month.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleProceedToStep3 = () => {
    setErrorMessage(null);
    const parsedTotal = parseFloat(totalLimitStr);

    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setErrorMessage('Please enter a total monthly budget limit greater than 0.');
      return;
    }

    setStep(3);
  };

  // Step 3 Confirmation & Save
  const handleConfirmAndSave = async () => {
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const parsedTotal = parseFloat(totalLimitStr);
      const budgetId = budget?.id || `bgt_${selectedMonth}_${Date.now()}`;

      const newBudget: Budget = {
        id: budgetId,
        user_id: user.id || 'usr_default_student',
        month: selectedMonth,
        total_limit: toStorageAmount(parsedTotal),
        created_at: new Date().toISOString(),
      };

      // Prepare category budget lines
      const lines: BudgetLine[] = [];
      for (const [catId, limitStr] of Object.entries(categoryLimits)) {
        const parsedLimit = parseFloat(limitStr);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          lines.push({
            id: `line_${budgetId}_${catId}`,
            budget_id: budgetId,
            category_id: catId,
            limit_amount: toStorageAmount(parsedLimit),
          });
        }
      }

      await saveBudget(newBudget, lines);
      closeBudgetWizard();

      if (onSuccessReturnToDashboard) {
        onSuccessReturnToDashboard();
      }
    } catch (err) {
      console.error('Error saving budget in wizard', err);
      setErrorMessage('Failed to save budget. Please check inputs and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute sum of category limits for helpful guidance
  const totalCategoryAllocations = Object.values(categoryLimits).reduce((sum, val) => {
    const parsed = parseFloat(val);
    return sum + (isNaN(parsed) ? 0 : parsed);
  }, 0);

  const parsedTotalLimit = parseFloat(totalLimitStr) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-mobile bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Wizard Header with Step Indicator */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-0.5">
              <PieChart className="w-4 h-4" />
              <span>Budget Setup Wizard</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {step === 1 && 'Step 1: Choose Month'}
              {step === 2 && 'Step 2: Set Monthly Limits'}
              {step === 3 && 'Step 3: Review & Confirm'}
            </h2>
          </div>
          <button
            onClick={closeBudgetWizard}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="px-5 py-2 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? '✓' : s}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Step {step} of 3
          </span>
        </div>

        {/* Wizard Step Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: SELECT MONTH ================= */}
          {step === 1 && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-600 leading-relaxed">
                Budgets are planned on a monthly cycle. Select the month you want to set or adjust your spending limit for.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-3">
                <span className="text-xs font-semibold text-slate-500">Target Month</span>

                <div className="flex items-center justify-between px-2">
                  <button
                    type="button"
                    onClick={() => adjustMonth(-1)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-base font-extrabold text-slate-900">
                      {getMonthLabel(selectedMonth)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => adjustMonth(1)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="pt-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Or pick directly (YYYY-MM):
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleProceedToStep2}
                className="flex items-center justify-center gap-2 mt-4 font-bold"
              >
                <span>Continue to Limits</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ================= STEP 2: SET LIMITS ================= */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Total Monthly Limit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Monthly Limit for {getMonthLabel(selectedMonth)}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-bold text-slate-400 select-none">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    autoFocus
                    placeholder="e.g. 5000"
                    value={totalLimitStr}
                    onChange={(e) => setTotalLimitStr(e.target.value)}
                    required
                    className="w-full text-2xl font-extrabold pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Optional Category-Wise Limits */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Category Limits <span className="font-normal text-slate-400">(Optional)</span>
                  </span>
                  {totalCategoryAllocations > 0 && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        totalCategoryAllocations > parsedTotalLimit && parsedTotalLimit > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Allocated: {currencySymbol}{totalCategoryAllocations}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Set specific spending ceilings for your main expense categories:
                </p>

                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {cat.name}
                        </span>
                      </div>

                      <div className="relative flex items-center w-28 flex-shrink-0">
                        <span className="absolute left-2.5 text-xs font-bold text-slate-400">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          step="any"
                          placeholder="No limit"
                          value={categoryLimits[cat.id] || ''}
                          onChange={(e) => handleCategoryLimitChange(cat.id, e.target.value)}
                          className="w-full text-xs font-bold pl-6 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 font-semibold text-xs"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleProceedToStep3}
                  className="flex-1 font-bold text-xs"
                >
                  Review Budget &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: REVIEW & CONFIRM ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                  <span className="text-xs text-blue-800 font-semibold">Planned Month</span>
                  <span className="text-xs font-extrabold text-blue-950">
                    {getMonthLabel(selectedMonth)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                  <span className="text-xs text-blue-800 font-semibold">Total Monthly Budget</span>
                  <span className="text-base font-extrabold text-blue-950">
                    {formatCurrency(toStorageAmount(parsedTotalLimit), currency)}
                  </span>
                </div>

                {/* Spending Preview if current month */}
                {selectedMonth === new Date().toISOString().substring(0, 7) && (
                  <div className="pt-1 text-xs text-blue-900 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Spent So Far This Month:</span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(totalSpentCurrentMonth, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Remaining After Budget:</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(
                          Math.max(0, toStorageAmount(parsedTotalLimit) - totalSpentCurrentMonth),
                          currency
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Limits Review */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category Limits Configured
                </h4>

                {Object.entries(categoryLimits).filter(([, val]) => parseFloat(val) > 0).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No specific category ceilings configured (overall budget limit applies to all spending).
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {Object.entries(categoryLimits)
                      .filter(([, val]) => parseFloat(val) > 0)
                      .map(([catId, val]) => {
                        const cat = categories.find((c) => c.id === catId);
                        return (
                          <div key={catId} className="py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                                style={{ backgroundColor: `${cat?.color}20`, color: cat?.color }}
                              >
                                <CategoryIcon name={cat?.icon || ''} className="w-3 h-3" />
                              </span>
                              <span className="font-medium text-slate-700">{cat?.name}</span>
                            </div>
                            <span className="font-bold text-slate-900">
                              {currencySymbol}{val}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Step 3 Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 font-semibold text-xs"
                  disabled={isSaving}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirmAndSave}
                  className="flex-1 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  disabled={isSaving}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Confirm & Save Budget'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
