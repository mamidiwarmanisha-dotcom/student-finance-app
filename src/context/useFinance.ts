import { useContext } from 'react';
import { FinanceContext } from './FinanceContext';
import type { FinanceContextType } from './FinanceContext';

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
