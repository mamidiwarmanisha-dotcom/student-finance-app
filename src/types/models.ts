/**
 * Architecture Document Data Models
 * Note: Amounts are stored as integers in the smallest currency unit (e.g., paise or cents)
 * to avoid floating-point rounding errors.
 */

export interface User {
  id: string;
  name: string;
  currency: string; // e.g. 'INR', 'USD', 'EUR'
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or icon key
  color: string; // Hex color string or Tailwind color code
  is_default: boolean;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number; // Integer in smallest currency unit (e.g. 50000 = ₹500.00)
  category_id: string;
  note?: string;
  date: string; // YYYY-MM-DD
  created_at: string; // ISO string
}

export interface Budget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  total_limit: number; // Integer in smallest currency unit
  created_at: string; // ISO string
}

export interface BudgetLine {
  id: string;
  budget_id: string;
  category_id: string;
  limit_amount: number; // Integer in smallest currency unit
}

export interface Alert {
  id: string;
  budget_id: string;
  category_id?: string | null;
  threshold: 50 | 80 | 100;
  triggered_at: string; // ISO string
  seen: boolean;
}

export type TabType = 'home' | 'expenses' | 'budget' | 'insights' | 'profile';
