import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { Expense, Category, User, Budget, BudgetLine, Alert } from '../types/models';
import { repository } from '../data/localStorageRepository';
import { DEFAULT_USER } from '../data/seedData';
import { AlertEngine } from '../services/alertEngine';
export { useFinance } from './useFinance';

export interface FinanceContextType {
  user: User;
  categories: Category[];
  expenses: Expense[];
  recentExpenses: Expense[];
  currentMonth: string;
  totalSpentCurrentMonth: number;
  spentByCategory: Record<string, number>;
  budget: Budget | undefined;
  budgetLines: BudgetLine[];
  alerts: Alert[];
  isLoading: boolean;

  // Actions
  refreshData: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => Promise<Expense>;
  updateExpense: (id: string, update: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at'>>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  updateUser: (update: Partial<User>) => Promise<User>;
  saveBudget: (budget: Budget, lines: BudgetLine[]) => Promise<Budget>;
  dismissAlert: (id: string) => Promise<void>;

  // Global Modals
  isExpenseModalOpen: boolean;
  editingExpense: Expense | null;
  openAddExpenseModal: () => void;
  openEditExpenseModal: (expense: Expense) => void;
  closeExpenseModal: () => void;

  isBudgetWizardOpen: boolean;
  openBudgetWizard: () => void;
  closeBudgetWizard: () => void;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget | undefined>(undefined);
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalSpentCurrentMonth, setTotalSpentCurrentMonth] = useState<number>(0);
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBudgetWizardOpen, setIsBudgetWizardOpen] = useState(false);

  const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'

  const refreshData = useCallback(async () => {
    try {
      const [u, cats, allExpenses, b] = await Promise.all([
        repository.getUser(),
        repository.getCategories(),
        repository.getExpenses(),
        repository.getBudget(currentMonth),
      ]);

      setUser(u);
      setCategories(cats);
      setExpenses(allExpenses);
      setRecentExpenses(allExpenses.slice(0, 5));
      setBudget(b);

      let lines: BudgetLine[] = [];
      if (b) {
        lines = await repository.getBudgetLines(b.id);
      }
      setBudgetLines(lines);

      // Compute current month statistics dynamically on demand
      const monthExpenses = allExpenses.filter((e) => e.date.startsWith(currentMonth));
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      setTotalSpentCurrentMonth(total);

      const catMap: Record<string, number> = {};
      monthExpenses.forEach((e) => {
        catMap[e.category_id] = (catMap[e.category_id] || 0) + e.amount;
      });
      setSpentByCategory(catMap);

      // Evaluate Alert Engine (runs after each expense / budget change)
      if (b) {
        await AlertEngine.evaluate(b, lines, total, catMap);
      }

      // Fetch active unseen alerts
      const unseenAlerts = await repository.getUnseenAlerts();
      setAlerts(unseenAlerts);
    } catch (err) {
      console.error('Error refreshing finance data', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addExpense = async (data: Omit<Expense, 'id' | 'created_at' | 'user_id'>): Promise<Expense> => {
    const newExpense: Expense = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: user.id,
      amount: data.amount,
      category_id: data.category_id,
      note: data.note,
      date: data.date,
      created_at: new Date().toISOString(),
    };

    const saved = await repository.saveExpense(newExpense);
    await refreshData();
    return saved;
  };

  const updateExpense = async (
    id: string,
    update: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Expense> => {
    const target = expenses.find((e) => e.id === id);
    if (!target) {
      throw new Error(`Expense with id ${id} not found`);
    }

    const updated: Expense = {
      ...target,
      ...update,
    };

    const saved = await repository.saveExpense(updated);
    await refreshData();
    return saved;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    await repository.deleteExpense(id);
    await refreshData();
  };

  const updateUser = async (update: Partial<User>): Promise<User> => {
    const updated = await repository.updateUser(update);
    setUser(updated);
    return updated;
  };

  const saveBudget = async (b: Budget, lines: BudgetLine[]): Promise<Budget> => {
    const saved = await repository.saveBudget(b, lines);
    await refreshData();
    return saved;
  };

  const dismissAlert = async (id: string): Promise<void> => {
    await repository.markAlertSeen(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const openEditExpenseModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const openBudgetWizard = () => {
    setIsBudgetWizardOpen(true);
  };

  const closeBudgetWizard = () => {
    setIsBudgetWizardOpen(false);
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        categories,
        expenses,
        recentExpenses,
        currentMonth,
        totalSpentCurrentMonth,
        spentByCategory,
        budget,
        budgetLines,
        alerts,
        isLoading,
        refreshData,
        addExpense,
        updateExpense,
        deleteExpense,
        updateUser,
        saveBudget,
        dismissAlert,
        isExpenseModalOpen,
        editingExpense,
        openAddExpenseModal,
        openEditExpenseModal,
        closeExpenseModal,
        isBudgetWizardOpen,
        openBudgetWizard,
        closeBudgetWizard,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
