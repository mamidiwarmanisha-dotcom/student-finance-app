import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryService } from '../../services/categoryService';
import { CategoryIcon } from '../common/CategoryIcon';
import { Button } from '../common/Button';
import { toStorageAmount, fromStorageAmount } from '../../utils/currency';
import { X, Sparkles, Check, Trash2 } from 'lucide-react';

export const ExpenseFormModal: React.FC = () => {
  const {
    isExpenseModalOpen,
    editingExpense,
    closeExpenseModal,
    addExpense,
    updateExpense,
    deleteExpense,
    categories,
    user,
  } = useFinance();

  const [amountStr, setAmountStr] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('cat_food');
  const [dateStr, setDateStr] = useState(new Date().toISOString().substring(0, 10));
  const [noteStr, setNoteStr] = useState('');
  const [suggestedCatId, setSuggestedCatId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state when opening in Add vs Edit mode
  useEffect(() => {
    if (editingExpense) {
      setAmountStr(fromStorageAmount(editingExpense.amount).toString());
      setSelectedCategoryId(editingExpense.category_id);
      setDateStr(editingExpense.date);
      setNoteStr(editingExpense.note || '');
    } else {
      setAmountStr('');
      setSelectedCategoryId('cat_food');
      setDateStr(new Date().toISOString().substring(0, 10));
      setNoteStr('');
    }
    setSuggestedCatId(null);
    setValidationError(null);
  }, [editingExpense, isExpenseModalOpen]);

  // Handle Note input changes and auto-suggest category
  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNoteStr(val);

    const suggested = CategoryService.suggestCategoryByNote(val);
    if (suggested && suggested !== selectedCategoryId) {
      setSuggestedCatId(suggested);
    } else {
      setSuggestedCatId(null);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestedCatId) {
      setSelectedCategoryId(suggestedCatId);
      setSuggestedCatId(null);
    }
  };

  // Quick date helper: Today / Yesterday
  const setQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDateStr(d.toISOString().substring(0, 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) {
      setValidationError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!selectedCategoryId) {
      setValidationError('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          amount: toStorageAmount(parsed),
          category_id: selectedCategoryId,
          date: dateStr,
          note: noteStr.trim() || undefined,
        });
      } else {
        await addExpense({
          amount: toStorageAmount(parsed),
          category_id: selectedCategoryId,
          date: dateStr,
          note: noteStr.trim() || undefined,
        });
      }
      closeExpenseModal();
    } catch (err) {
      console.error('Failed to save expense', err);
      setValidationError('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCurrent = async () => {
    if (!editingExpense) return;
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(editingExpense.id);
      closeExpenseModal();
    }
  };

  if (!isExpenseModalOpen) return null;

  const currencySymbol = user.currency === 'INR' ? '₹' : user.currency === 'EUR' ? '€' : '$';
  const suggestedCategoryObj = categories.find((c) => c.id === suggestedCatId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-mobile bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Modal Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingExpense ? 'Edit Expense' : 'Log an Expense'}
            </h2>
            <p className="text-xs text-slate-500">
              {editingExpense ? 'Update transaction details' : 'Fast 3-tap expense logging'}
            </p>
          </div>
          <button
            onClick={closeExpenseModal}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {validationError}
            </div>
          )}

          {/* 1. Amount Input (Tap 1) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Expense Amount
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
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                className="w-full text-2xl font-extrabold pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* 2. Category Selection (Tap 2) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600">
                Select Category
              </label>
              {suggestedCategoryObj && (
                <button
                  type="button"
                  onClick={handleApplySuggestion}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full hover:bg-amber-200 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Auto-suggest: {suggestedCategoryObj.name}
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer min-h-[58px] ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-600 ring-offset-1'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-xs"
                      style={{
                        backgroundColor: isSelected ? cat.color : `${cat.color}20`,
                        color: isSelected ? '#ffffff' : cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </span>
                    <span
                      className={`text-[11px] leading-tight ${
                        isSelected ? 'font-bold text-blue-900' : 'font-medium text-slate-700'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Optional Note Input with Smart Auto-Suggest */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Note / Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Canteen lunch, metro recharge, college books..."
              value={noteStr}
              onChange={handleNoteChange}
              className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          {/* 4. Date Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">
                Date
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                required
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Actions: Save & Delete (if editing) */}
          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 shadow-sm font-bold"
            >
              <Check className="w-4 h-4" />
              <span>{editingExpense ? 'Update Expense' : 'Save Expense (Tap 3)'}</span>
            </Button>

            {editingExpense && (
              <Button
                type="button"
                variant="danger"
                fullWidth
                size="md"
                onClick={handleDeleteCurrent}
                className="flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Expense</span>
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
