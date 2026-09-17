import React from 'react';
import {
  Plus,
  Database,
  Wallet,
  Users,
  ArrowRight,
} from 'lucide-react';

interface HeroSectionProps {
  onNavigateToNewOrder: () => void;
  onNavigateToDatabase: () => void;
  onNavigateToPiutang: () => void;
  onNavigateToCustomers: () => void;
  ordersThisMonthCount: number;
  unpaidCount?: number;
  totalCustomersCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateToNewOrder,
  onNavigateToDatabase,
  onNavigateToPiutang,
  onNavigateToCustomers,
  ordersThisMonthCount,
  unpaidCount = 0,
  totalCustomersCount = 0,
}) => {
  return (
    <section className="space-y-4 select-none">
      {/* 1. BAR HORIZONTAL BESAR (Hero Section Banner) */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0B101E] border border-sky-400/35 dark:border-sky-500/30 p-6 sm:p-7 md:p-8 shadow-[0_0_20px_rgba(14,165,233,0.14)] dark:shadow-[0_0_28px_rgba(14,165,233,0.12)] transition-all duration-300">
        {/* Glowing ambient decorative background gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Title & Subtitle without duplicate Logo */}
          <div className="space-y-1.5">
            {/* Category Breadcrumb Tag */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-300/60 dark:border-blue-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Dashboard Operasional
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                JacS Enterprise System
              </span>
            </div>

            {/* Judul Utama: "MasterPro APP" */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white leading-tight">
              MasterPro <span className="bg-gradient-to-r from-[#0284C7] via-[#0284C7] to-[#2563EB] dark:from-[#38BDF8] dark:to-[#60A5FA] bg-clip-text text-transparent">APP</span>
            </h1>

            {/* Sub-judul Utama: "Integrated Controlling Centre" (ringkas, elegan, tidak padat) */}
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-sky-600 dark:text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
              Integrated Controlling Centre
            </p>
          </div>

          {/* Quick Metrics Badge Strip in Hero */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-left">
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Bulan Ini
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {ordersThisMonthCount} Pesanan
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-left">
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status Sistem
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync OK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARIS TOMBOL MENU CEPAT SEJAJAR HORIZONTAL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tombol 1: + Pesanan Baru (Cyan / Teal Glow) */}
        <button
          type="button"
          onClick={onNavigateToNewOrder}
          className="group relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-cyan-400/40 dark:border-cyan-500/30 shadow-[0_0_14px_rgba(6,182,212,0.14)] dark:shadow-[0_0_18px_rgba(6,182,212,0.12)] hover:shadow-[0_0_22px_rgba(6,182,212,0.32)] dark:hover:shadow-[0_0_26px_rgba(6,182,212,0.25)] hover:border-cyan-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-left overflow-hidden"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300/70 dark:border-cyan-800/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0 group-hover:scale-105 transition-transform">
              <Plus size={20} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Formulir Cepat
              </span>
              <span className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-white tracking-tight truncate">
                + Pesanan Baru
              </span>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-cyan-500/60 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all shrink-0 ml-2"
          />
        </button>

        {/* Tombol 2: Database Pesanan (Emerald Glow) */}
        <button
          type="button"
          onClick={onNavigateToDatabase}
          className="group relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-emerald-400/40 dark:border-emerald-500/30 shadow-[0_0_14px_rgba(16,185,129,0.14)] dark:shadow-[0_0_18px_rgba(16,185,129,0.12)] hover:shadow-[0_0_22px_rgba(16,185,129,0.32)] dark:hover:shadow-[0_0_26px_rgba(16,185,129,0.25)] hover:border-emerald-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-left overflow-hidden"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/70 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] shrink-0 group-hover:scale-105 transition-transform">
              <Database size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Arsip & Resi
              </span>
              <span className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-white tracking-tight truncate">
                Database Pesanan
              </span>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-emerald-500/60 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0 ml-2"
          />
        </button>

        {/* Tombol 3: Piutang & Penagihan (Flame Orange Glow) */}
        <button
          type="button"
          onClick={onNavigateToPiutang}
          className="group relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-orange-400/40 dark:border-orange-500/30 shadow-[0_0_14px_rgba(249,115,22,0.14)] dark:shadow-[0_0_18px_rgba(249,115,22,0.12)] hover:shadow-[0_0_22px_rgba(249,115,22,0.32)] dark:hover:shadow-[0_0_26px_rgba(249,115,22,0.25)] hover:border-orange-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-left overflow-hidden"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-300/70 dark:border-orange-800/80 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)] shrink-0 group-hover:scale-105 transition-transform">
              <Wallet size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Aging & WA Tagihan
              </span>
              <span className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-white tracking-tight truncate">
                Piutang & Penagihan
              </span>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-orange-500/60 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0 ml-2"
          />
        </button>

        {/* Tombol 4: Data Pelanggan (Purple / Violet Glow) */}
        <button
          type="button"
          onClick={onNavigateToCustomers}
          className="group relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-purple-400/40 dark:border-purple-500/30 shadow-[0_0_14px_rgba(139,92,246,0.14)] dark:shadow-[0_0_18px_rgba(139,92,246,0.12)] hover:shadow-[0_0_22px_rgba(139,92,246,0.32)] dark:hover:shadow-[0_0_26px_rgba(139,92,246,0.25)] hover:border-purple-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-left overflow-hidden"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300/70 dark:border-purple-800/80 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.3)] shrink-0 group-hover:scale-105 transition-transform">
              <Users size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Kontak & Riwayat
              </span>
              <span className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-white tracking-tight truncate">
                Data Pelanggan
              </span>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-purple-500/60 group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0 ml-2"
          />
        </button>
      </div>
    </section>
  );
};
