import React from 'react';
import {
  Search,
  FileSpreadsheet,
  Sun,
  Moon,
  Terminal,
  Shield,
} from 'lucide-react';
import { DashboardTab } from '../types';

interface TopbarProps {
  activeTab: DashboardTab;
  onNavigateToNewOrder: () => void;
  onSearchClick: () => void;
  onExportSheet: () => void;
  isSyncingSheet: boolean;
  sheetSynced: boolean;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenDeveloperModal?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  onNavigateToNewOrder,
  onSearchClick,
  onExportSheet,
  isSyncingSheet,
  sheetSynced,
  isDarkMode = false,
  onToggleTheme,
  onOpenDeveloperModal,
}) => {
  return (
    <header className="sticky top-0 z-20 w-full bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 text-[#0F172A] dark:text-white px-4 md:px-8 py-3 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Application Title without duplicate 'J' logo */}
        <div className="flex items-center select-none">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-semibold tracking-tight text-slate-800 dark:text-white">
              MasterPro <span className="text-[#0284C7] dark:text-[#38BDF8]">APP</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/25 uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              OPS v25+
            </span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={onSearchClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 hover:border-sky-500 hover:text-[#0F172A] dark:hover:text-white transition-all cursor-pointer"
          >
            <Search size={14} className="text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Cari invoice / mitra...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] rounded bg-white dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Google Sheets Sync Button */}
          <button
            onClick={onExportSheet}
            disabled={isSyncingSheet}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
            title="Sinkronisasi ke Google Spreadsheet"
          >
            <FileSpreadsheet size={14} />
            <span className="hidden sm:inline">
              {isSyncingSheet ? 'Sinkronisasi...' : sheetSynced ? 'Sheets Tersinkron' : 'Sync Sheets'}
            </span>
          </button>

          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer shadow-xs"
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun size={15} className="text-[#FBBF24]" />
              ) : (
                <Moon size={15} className="text-[#0284C7]" />
              )}
            </button>
          )}

          {/* Admin Developer Button with modern cyan glow */}
          <button
            onClick={onOpenDeveloperModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-slate-900 via-[#0B1528] to-slate-900 dark:from-[#0F172A] dark:via-[#13233D] dark:to-[#0F172A] shadow-[0_0_16px_rgba(6,182,212,0.35)] border border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Buka System Maintenance & Developer Control"
          >
            <Terminal size={14} className="text-cyan-400 animate-pulse" strokeWidth={2.4} />
            <span className="hidden sm:inline text-cyan-300">Admin Developer</span>
            <span className="sm:hidden text-cyan-300">Dev</span>
          </button>
        </div>
      </div>
    </header>
  );
};
