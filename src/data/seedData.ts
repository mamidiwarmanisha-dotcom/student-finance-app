import type { Category, User } from '../types/models';

export const DEFAULT_USER: User = {
  id: 'usr_default_student',
  name: 'Student',
  currency: 'INR',
  created_at: new Date().toISOString(),
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_food',
    name: 'Food',
    icon: 'Utensils',
    color: '#F97316', // Orange
    is_default: true,
  },
  {
    id: 'cat_transport',
    name: 'Transport',
    icon: 'Bus',
    color: '#06B6D4', // Cyan
    is_default: true,
  },
  {
    id: 'cat_rent',
    name: 'Rent',
    icon: 'Home',
    color: '#8B5CF6', // Purple
    is_default: true,
  },
  {
    id: 'cat_fees',
    name: 'Fees',
    icon: 'GraduationCap',
    color: '#3B82F6', // Blue
    is_default: true,
  },
  {
    id: 'cat_books',
    name: 'Books',
    icon: 'BookOpen',
    color: '#10B981', // Emerald
    is_default: true,
  },
  {
    id: 'cat_fun',
    name: 'Fun',
    icon: 'Smile',
    color: '#EC4899', // Pink
    is_default: true,
  },
  {
    id: 'cat_other',
    name: 'Other',
    icon: 'MoreHorizontal',
    color: '#64748B', // Slate
    is_default: true,
  },
];
