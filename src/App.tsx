import { useState } from 'react';
import type { TabType } from './types/models';
import { FinanceProvider } from './context/FinanceContext';
import { useFinance } from './context/FinanceContext';
import { TopHeader } from './components/navigation/TopHeader';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { ExpenseFormModal } from './components/expenses/ExpenseFormModal';
import { BudgetWizardModal } from './components/budget/BudgetWizardModal';
import { HomeScreen } from './screens/HomeScreen';
import { ExpensesScreen } from './screens/ExpensesScreen';
import { BudgetScreen } from './screens/BudgetScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export function AppContent() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const { alerts } = useFinance();

  const titles: Record<TabType, { title: string; subtitle?: string }> = {
    home: { title: 'Student Dashboard', subtitle: 'Overview & Spending' },
    expenses: { title: 'Expenses', subtitle: 'Transaction History' },
    budget: { title: 'Budgeting', subtitle: 'Limits & Progress' },
    insights: { title: 'Financial Insights', subtitle: 'Trends & Analysis' },
    profile: { title: 'Settings', subtitle: 'Profile & Preferences' },
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-blue-100">
      {/* Mobile-first viewport container (360px - 430px on mobile, centered card on desktop) */}
      <div className="w-full max-w-mobile min-w-[360px] bg-slate-50 min-h-screen relative shadow-2xl flex flex-col border-x border-slate-200/80">
        <TopHeader
          title={titles[currentTab].title}
          subtitle={titles[currentTab].subtitle}
        />

        <main className="flex-1 p-4 overflow-y-auto">
          {currentTab === 'home' && (
            <HomeScreen
              onNavigateToExpenses={() => setCurrentTab('expenses')}
              onNavigateToBudget={() => setCurrentTab('budget')}
            />
          )}
          {currentTab === 'expenses' && <ExpensesScreen />}
          {currentTab === 'budget' && <BudgetScreen />}
          {currentTab === 'insights' && <InsightsScreen />}
          {currentTab === 'profile' && <ProfileScreen />}
        </main>

        <BottomTabBar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          unseenAlertsCount={alerts.length}
        />

        {/* Global Expense Add & Edit Modal */}
        <ExpenseFormModal />

        {/* Global Budget Setup Wizard Modal */}
        <BudgetWizardModal onSuccessReturnToDashboard={() => setCurrentTab('home')} />
      </div>
    </div>
  );
}

export function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

export default App;
