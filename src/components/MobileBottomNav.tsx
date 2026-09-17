import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Database,
  Wallet,
  Settings,
  Users,
} from 'lucide-react';
import { DashboardTab } from '../types';

interface MobileBottomNavProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  unpaidCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  unpaidCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as DashboardTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      glowActive: 'bg-blue-600 text-white shadow-[0_0_14px_rgba(59,130,246,0.5)] border-blue-400/40',
      glowText: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'input_pesanan' as DashboardTab,
      label: 'Pesanan',
      icon: ReceiptText,
      badge: null,
      glowActive: 'bg-cyan-600 text-white shadow-[0_0_14px_rgba(6,182,212,0.5)] border-cyan-400/40',
      glowText: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'database_pesanan' as DashboardTab,
      label: 'Database',
      icon: Database,
      badge: null,
      glowActive: 'bg-emerald-600 text-white shadow-[0_0_14px_rgba(16,185,129,0.5)] border-emerald-400/40',
      glowText: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'piutang' as DashboardTab,
      label: 'Piutang',
      icon: Wallet,
      badge: unpaidCount > 0 ? unpaidCount : null,
      glowActive: 'bg-orange-600 text-white shadow-[0_0_14px_rgba(249,115,22,0.5)] border-orange-400/40',
      glowText: 'text-orange-600 dark:text-orange-400',
    },
    {
      id: 'pelanggan' as DashboardTab,
      label: 'Pelanggan',
      icon: Users,
      badge: null,
      glowActive: 'bg-purple-600 text-white shadow-[0_0_14px_rgba(139,92,246,0.5)] border-purple-400/40',
      glowText: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'pengaturan' as DashboardTab,
      label: 'Pengaturan',
      icon: Settings,
      badge: null,
      glowActive: 'bg-rose-600 text-white shadow-[0_0_14px_rgba(244,63,94,0.5)] border-rose-400/40',
      glowText: 'text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-200 relative cursor-pointer border ${
                isActive
                  ? `${tab.glowActive} scale-105`
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white dark:border-[#070B14] shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-bold tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
