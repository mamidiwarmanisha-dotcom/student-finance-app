import type { User, Category, Expense, Budget, BudgetLine, Alert } from '../types/models';

export interface IRepository {
  // User
  getUser(): Promise<User>;
  updateUser(user: Partial<User>): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  saveCategory(category: Category): Promise<Category>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpensesByMonth(month: string): Promise<Expense[]>; // month: 'YYYY-MM'
  getExpensesByCategory(categoryId: string, month?: string): Promise<Expense[]>;
  getRecentExpenses(limit?: number): Promise<Expense[]>;
  saveExpense(expense: Expense): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  // Budgets & Budget Lines
  getBudget(month: string): Promise<Budget | undefined>;
  saveBudget(budget: Budget, lines?: BudgetLine[]): Promise<Budget>;
  getBudgetLines(budgetId: string): Promise<BudgetLine[]>;

  // Alerts
  getAlerts(budgetId?: string): Promise<Alert[]>;
  getUnseenAlerts(): Promise<Alert[]>;
  saveAlert(alert: Alert): Promise<Alert>;
  markAlertSeen(id: string): Promise<void>;

  // System & Backup
  clearAllData(): Promise<void>;
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
}
