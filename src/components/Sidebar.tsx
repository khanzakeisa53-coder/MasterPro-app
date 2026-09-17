import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Database,
  Wallet,
  Users,
  Settings,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';
import { DashboardTab } from '../types';
import { formatRupiah } from '../lib/formatters';
import { OfficialLogoJ } from './DeveloperBrandLogo';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  unpaidCount: number;
  totalOrdersCount: number;
  sisaPiutang: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unpaidCount,
  totalOrdersCount,
  sisaPiutang,
  isDarkMode,
  onToggleTheme,
}) => {
  const navItems = [
    {
      id: 'dashboard' as DashboardTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      color: '#3B82F6',
      activeClasses: 'bg-blue-600 text-white shadow-[0_0_18px_rgba(59,130,246,0.45)] border-blue-400/50',
      iconBg: 'bg-blue-500/10 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.25)]',
    },
    {
      id: 'input_pesanan' as DashboardTab,
      label: 'Pesanan Baru',
      icon: ReceiptText,
      badge: '+ Buat',
      badgeColor: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40',
      color: '#06B6D4',
      activeClasses: 'bg-cyan-600 text-white shadow-[0_0_18px_rgba(6,182,212,0.45)] border-cyan-400/50',
      iconBg: 'bg-cyan-500/10 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.25)]',
    },
    {
      id: 'database_pesanan' as DashboardTab,
      label: 'Database Pesanan',
      icon: Database,
      badge: `${totalOrdersCount}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40',
      color: '#10B981',
      activeClasses: 'bg-emerald-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.45)] border-emerald-400/50',
      iconBg: 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
    },
    {
      id: 'piutang' as DashboardTab,
      label: 'Piutang & Penagihan',
      icon: Wallet,
      badge: unpaidCount > 0 ? `${unpaidCount} Pending` : null,
      badgeColor: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-400/40',
      color: '#F97316',
      activeClasses: 'bg-orange-600 text-white shadow-[0_0_18px_rgba(249,115,22,0.45)] border-orange-400/50',
      iconBg: 'bg-orange-500/10 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.25)]',
    },
    {
      id: 'pelanggan' as DashboardTab,
      label: 'Data Pelanggan',
      icon: Users,
      badge: 'WhatsApp',
      badgeColor: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/40',
      color: '#8B5CF6',
      activeClasses: 'bg-purple-600 text-white shadow-[0_0_18px_rgba(139,92,246,0.45)] border-purple-400/50',
      iconBg: 'bg-purple-500/10 text-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.25)]',
    },
    {
      id: 'pengaturan' as DashboardTab,
      label: 'Pengaturan & Sync',
      icon: Settings,
      badge: null,
      color: '#F43F5E',
      activeClasses: 'bg-rose-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.45)] border-rose-400/50',
      iconBg: 'bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.25)]',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[#070B14] border-r border-slate-200/90 dark:border-slate-800/80 text-[#0F172A] dark:text-white select-none z-30 shrink-0 transition-colors duration-200">
      {/* Sidebar Top Brand Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <OfficialLogoJ sizeClass="w-7 h-7" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#FF5722]">
              JacS Enterprise
            </span>
            <span className="text-xs font-semibold tracking-tight text-slate-800 dark:text-white">
              MasterPro APP
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          v2.5
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Menu Navigasi</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 text-left cursor-pointer border ${
                isActive
                  ? `${item.activeClasses} scale-[1.02]`
                  : 'border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-inner'
                      : `${item.iconBg} group-hover:scale-110`
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2.2}
                    className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : ''}
                  />
                </div>
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                    isActive ? 'bg-white/25 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Financial Quick Glance Card with JacS Card Glow */}
      <div className="p-3.5 mx-3 mb-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-orange-400/30 dark:border-orange-500/25 shadow-[0_0_14px_rgba(249,115,22,0.12)]">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-semibold">
            <TrendingUp size={14} className="text-[#FF5722]" />
            Sisa Piutang Berjalan
          </span>
        </div>
        <div className="text-base font-bold text-orange-600 dark:text-orange-400 tracking-tight">
          {formatRupiah(sisaPiutang)}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Status Sistem</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online Aktif
          </span>
        </div>
      </div>

      {/* Bottom Profile & Theme Toggle */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#111827] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          title="Ubah Mode Tema (Terang / Gelap)"
        >
          {isDarkMode ? (
            <>
              <Sun size={15} className="text-[#FBBF24]" />
              <span>Mode Terang</span>
            </>
          ) : (
            <>
              <Moon size={15} className="text-[#0284C7]" />
              <span>Mode Gelap</span>
            </>
          )}
        </button>

        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">
          OPS v25+
        </span>
      </div>
    </aside>
  );
};
