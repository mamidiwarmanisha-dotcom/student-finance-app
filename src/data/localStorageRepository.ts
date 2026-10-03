import type { IRepository } from './repository';
import type { User, Category, Expense, Budget, BudgetLine, Alert } from '../types/models';
import { DEFAULT_CATEGORIES, DEFAULT_USER } from './seedData';

const KEYS = {
  USER: 'sf_user',
  CATEGORIES: 'sf_categories',
  EXPENSES: 'sf_expenses',
  BUDGETS: 'sf_budgets',
  BUDGET_LINES: 'sf_budget_lines',
  ALERTS: 'sf_alerts',
};

// In-memory fallback if localStorage is unavailable
const memoryStorage: Record<string, string> = {};

function storageGet(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return memoryStorage[key] || null;
}

function storageSet(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    memoryStorage[key] = value;
  }
}

function storageRemove(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  } else {
    delete memoryStorage[key];
  }
}

export class LocalStorageRepository implements IRepository {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (!storageGet(KEYS.CATEGORIES)) {
      storageSet(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!storageGet(KEYS.USER)) {
      storageSet(KEYS.USER, JSON.stringify(DEFAULT_USER));
    }
    if (!storageGet(KEYS.EXPENSES)) {
      storageSet(KEYS.EXPENSES, JSON.stringify([]));
    }
    if (!storageGet(KEYS.BUDGETS)) {
      storageSet(KEYS.BUDGETS, JSON.stringify([]));
    }
    if (!storageGet(KEYS.BUDGET_LINES)) {
      storageSet(KEYS.BUDGET_LINES, JSON.stringify([]));
    }
    if (!storageGet(KEYS.ALERTS)) {
      storageSet(KEYS.ALERTS, JSON.stringify([]));
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = storageGet(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (err) {
      console.error(`Error reading ${key} from storage`, err);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      storageSet(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error saving ${key} to storage`, err);
    }
  }

  // --- User ---
  async getUser(): Promise<User> {
    return this.getItem<User>(KEYS.USER, DEFAULT_USER);
  }

  async updateUser(userUpdate: Partial<User>): Promise<User> {
    const current = await this.getUser();
    const updated = { ...current, ...userUpdate };
    this.setItem(KEYS.USER, updated);
    return updated;
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return this.getItem<Category[]>(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find((c) => c.id === id);
  }

  async saveCategory(category: Category): Promise<Category> {
    const categories = await this.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    this.setItem(KEYS.CATEGORIES, categories);
    return category;
  }

  // --- Expenses ---
  async getExpenses(): Promise<Expense[]> {
    const list = this.getItem<Expense[]>(KEYS.EXPENSES, []);
    // Sort descending by date
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpensesByMonth(month: string): Promise<Expense[]> {
    const expenses = await this.getExpenses();
    return expenses.filter((e) => e.date.startsWith(month));
  }

  async getExpensesByCategory(categoryId: string, month?: string): Promise<Expense[]> {
    const expenses = await this.getExpenses();
    return expenses.filter(
      (e) => e.category_id === categoryId && (!month || e.date.startsWith(month))
    );
  }

  async getRecentExpenses(limit: number = 5): Promise<Expense[]> {
    const expenses = await this.getExpenses();
    return expenses.slice(0, limit);
  }

  async saveExpense(expense: Expense): Promise<Expense> {
    const expenses = this.getItem<Expense[]>(KEYS.EXPENSES, []);
    const index = expenses.findIndex((e) => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = expense;
    } else {
      expenses.unshift(expense);
    }
    this.setItem(KEYS.EXPENSES, expenses);
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    const expenses = this.getItem<Expense[]>(KEYS.EXPENSES, []);
    const filtered = expenses.filter((e) => e.id !== id);
    this.setItem(KEYS.EXPENSES, filtered);
  }

  // --- Budgets & Budget Lines ---
  async getBudget(month: string): Promise<Budget | undefined> {
    const budgets = this.getItem<Budget[]>(KEYS.BUDGETS, []);
    return budgets.find((b) => b.month === month);
  }

  async saveBudget(budget: Budget, lines: BudgetLine[] = []): Promise<Budget> {
    const budgets = this.getItem<Budget[]>(KEYS.BUDGETS, []);
    const bIndex = budgets.findIndex((b) => b.id === budget.id || b.month === budget.month);
    if (bIndex >= 0) {
      budgets[bIndex] = budget;
    } else {
      budgets.push(budget);
    }
    this.setItem(KEYS.BUDGETS, budgets);

    // Save or replace budget lines for this budget
    const allLines = this.getItem<BudgetLine[]>(KEYS.BUDGET_LINES, []);
    const remainingLines = allLines.filter((l) => l.budget_id !== budget.id);
    this.setItem(KEYS.BUDGET_LINES, [...remainingLines, ...lines]);

    return budget;
  }

  async getBudgetLines(budgetId: string): Promise<BudgetLine[]> {
    const lines = this.getItem<BudgetLine[]>(KEYS.BUDGET_LINES, []);
    return lines.filter((l) => l.budget_id === budgetId);
  }

  // --- Alerts ---
  async getAlerts(budgetId?: string): Promise<Alert[]> {
    const alerts = this.getItem<Alert[]>(KEYS.ALERTS, []);
    if (budgetId) {
      return alerts.filter((a) => a.budget_id === budgetId);
    }
    return alerts;
  }

  async getUnseenAlerts(): Promise<Alert[]> {
    const alerts = this.getItem<Alert[]>(KEYS.ALERTS, []);
    return alerts.filter((a) => !a.seen);
  }

  async saveAlert(alert: Alert): Promise<Alert> {
    const alerts = this.getItem<Alert[]>(KEYS.ALERTS, []);
    alerts.push(alert);
    this.setItem(KEYS.ALERTS, alerts);
    return alert;
  }

  async markAlertSeen(id: string): Promise<void> {
    const alerts = this.getItem<Alert[]>(KEYS.ALERTS, []);
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      alert.seen = true;
      this.setItem(KEYS.ALERTS, alerts);
    }
  }

  // --- Maintenance & Sync ---
  async clearAllData(): Promise<void> {
    storageRemove(KEYS.USER);
    storageRemove(KEYS.CATEGORIES);
    storageRemove(KEYS.EXPENSES);
    storageRemove(KEYS.BUDGETS);
    storageRemove(KEYS.BUDGET_LINES);
    storageRemove(KEYS.ALERTS);
    this.initializeDefaults();
  }

  async exportData(): Promise<string> {
    const data = {
      user: await this.getUser(),
      categories: await this.getCategories(),
      expenses: await this.getExpenses(),
      budgets: this.getItem(KEYS.BUDGETS, []),
      budgetLines: this.getItem(KEYS.BUDGET_LINES, []),
      alerts: this.getItem(KEYS.ALERTS, []),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const parsed = JSON.parse(jsonData);
    if (parsed.user) this.setItem(KEYS.USER, parsed.user);
    if (parsed.categories) this.setItem(KEYS.CATEGORIES, parsed.categories);
    if (parsed.expenses) this.setItem(KEYS.EXPENSES, parsed.expenses);
    if (parsed.budgets) this.setItem(KEYS.BUDGETS, parsed.budgets);
    if (parsed.budgetLines) this.setItem(KEYS.BUDGET_LINES, parsed.budgetLines);
    if (parsed.alerts) this.setItem(KEYS.ALERTS, parsed.alerts);
  }
}

export const repository: IRepository = new LocalStorageRepository();
