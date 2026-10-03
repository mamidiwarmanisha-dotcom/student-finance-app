import React from 'react';
import { Home, Receipt, PieChart, Lightbulb, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TabType } from '../../types/models';

interface BottomTabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  unseenAlertsCount?: number;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabChange,
  unseenAlertsCount = 0,
}) => {
  const tabs: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'budget', label: 'Budget', icon: PieChart, badge: unseenAlertsCount },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-mobile mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-tab select-none"
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] rounded-xl transition-all cursor-pointer relative ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {(tab.badge ?? 0) > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
