import React, { useState } from 'react';
import type { Expense } from '../types/models';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { CategoryChip } from '../components/common/CategoryChip';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { Button } from '../components/common/Button';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Calendar,
  ArrowUpDown,
  FilterX,
} from 'lucide-react';

export const ExpensesScreen: React.FC = () => {
  const {
    expenses,
    categories,
    user,
    deleteExpense,
    openAddExpenseModal,
    openEditExpenseModal,
  } = useFinance();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc'>('date-desc');

  const currency = user.currency || 'INR';

  // Filter & Search logic
  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = selectedCategory ? e.category_id === selectedCategory : true;
    const cat = categories.find((c) => c.id === e.category_id);
    const searchTarget = `${e.note || ''} ${cat?.name || ''}`.toLowerCase();
    const matchesSearch = searchQuery.trim() === '' || searchTarget.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'amount-desc') {
      return b.amount - a.amount;
    }
    return 0;
  });

  const totalFilteredSpend = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDeleteExpense = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    openEditExpenseModal(expense);
  };

  // Helper date formatter
  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().substring(0, 10);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().substring(0, 10);

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Controls: Search & Log Expense CTA */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses & notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              &times;
            </button>
          )}
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={openAddExpenseModal}
          className="flex items-center gap-1 shadow-xs whitespace-nowrap min-h-[42px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </Button>
      </div>

      {/* Category Filter Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap min-h-[38px] transition-all border cursor-pointer ${
            selectedCategory === null
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({expenses.length})
        </button>
        {categories.map((cat) => {
          const count = expenses.filter((e) => e.category_id === cat.id).length;
          return (
            <CategoryChip
              key={cat.id}
              category={{
                ...cat,
                name: `${cat.name} (${count})`,
              }}
              size="sm"
              selected={selectedCategory === cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
            />
          );
        })}
      </div>

      {/* Summary Header for Active View */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500 font-medium">
            {selectedCategory
              ? `${categories.find((c) => c.id === selectedCategory)?.name || 'Filtered'} Spend:`
              : 'Total Displayed Spend:'}
          </span>
          <span className="ml-1.5 font-bold text-slate-900">
            {formatCurrency(totalFilteredSpend, currency)}
          </span>
          <span className="ml-1 text-slate-400">({sortedExpenses.length} transactions)</span>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {sortedExpenses.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <FilterX className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">No expenses found</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {searchQuery || selectedCategory
                ? 'Try changing or clearing your search or category filter.'
                : 'Tap "Add" or "Log Expense" to record your first transaction.'}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-xs"
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedExpenses.map((exp) => {
              const cat = categories.find((c) => c.id === exp.category_id);

              return (
                <div
                  key={exp.id}
                  onClick={() => handleEditExpense(exp)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100/80 transition-colors cursor-pointer group"
                >
                  {/* Left: Category Icon + Description & Date */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: cat ? `${cat.color}15` : '#f1f5f9',
                        color: cat?.color || '#3b82f6',
                      }}
                    >
                      <CategoryIcon name={cat?.icon || cat?.name || 'Other'} className="w-5 h-5" />
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {exp.note || cat?.name || 'Expense'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span
                          className="font-medium px-1.5 py-0.2 rounded text-[10px]"
                          style={{
                            backgroundColor: cat ? `${cat.color}15` : '#f1f5f9',
                            color: cat?.color || '#475569',
                          }}
                        >
                          {cat?.name || 'Uncategorized'}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-slate-400 inline" />
                          {formatDateLabel(exp.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action Icons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                      -{formatCurrency(exp.amount, currency)}
                    </span>

                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditExpense(exp);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteExpense(e, exp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
