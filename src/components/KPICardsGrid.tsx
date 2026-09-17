import React from 'react';
import {
  Receipt,
  Clock,
  CheckCircle2,
  Wallet,
  Users,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { FinancialSummary, KPICardType } from '../types';
import { formatRupiah } from '../lib/formatters';

interface KPICardsGridProps {
  summary: FinancialSummary;
  onSelectKPI: (type: KPICardType) => void;
}

export const KPICardsGrid: React.FC<KPICardsGridProps> = ({
  summary,
  onSelectKPI,
}) => {
  const cards = [
    {
      id: 'pesanan_bulan_ini' as KPICardType,
      title: 'Pesanan Bulan Ini',
      countLabel: `${summary.countPesananBulanIni} Invoice`,
      amount: summary.totalPesananBulanIni,
      icon: Receipt,
      iconColor: 'text-[#1565C0]',
      iconBg: 'bg-[#0D47A1]/10 border border-[#1565C0]/20',
      accentColor: 'border-l-4 border-l-[#1565C0]',
      hoverBorder: 'hover:border-[#1565C0]',
      drilldownLabel: 'Lihat Semua',
    },
    {
      id: 'belum_lunas' as KPICardType,
      title: 'Belum Lunas',
      countLabel: `${summary.countBelumLunas} Menunggu`,
      amount: summary.totalBelumLunas,
      icon: Clock,
      iconColor: 'text-[#E65100]',
      iconBg: 'bg-[#E65100]/10 border border-[#E65100]/20',
      accentColor: 'border-l-4 border-l-[#E65100]',
      hoverBorder: 'hover:border-[#E65100]',
      drilldownLabel: 'Filter Belum Lunas',
    },
    {
      id: 'pesanan_lunas' as KPICardType,
      title: 'Pesanan Lunas',
      countLabel: `${summary.countLunas} Terselesaikan`,
      amount: summary.totalLunas,
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
      accentColor: 'border-l-4 border-l-emerald-600',
      hoverBorder: 'hover:border-emerald-600',
      drilldownLabel: 'Filter Lunas',
    },
    {
      id: 'dana_siap_ditarik' as KPICardType,
      title: 'Dana Siap Ditarik',
      countLabel: `${summary.countDanaSiapDitarik} Siap Cair`,
      amount: summary.totalDanaSiapDitarik,
      icon: Wallet,
      iconColor: 'text-sky-700',
      iconBg: 'bg-sky-500/10 border border-sky-500/20',
      accentColor: 'border-l-4 border-l-sky-600',
      hoverBorder: 'hover:border-sky-600',
      drilldownLabel: 'Rincian Penarikan',
    },
    {
      id: 'gabung_nota' as KPICardType,
      title: 'Gabung Nota',
      countLabel: `${summary.countGabungNota} Konsolidasi`,
      amount: summary.totalGabungNota,
      icon: Users,
      iconColor: 'text-amber-700',
      iconBg: 'bg-amber-500/10 border border-amber-500/20',
      accentColor: 'border-l-4 border-l-amber-600',
      hoverBorder: 'hover:border-amber-600',
      drilldownLabel: 'Filter Gabung Nota',
    },
    {
      id: 'piutang_jatuh_tempo' as KPICardType,
      title: 'Piutang Jatuh Tempo',
      countLabel: `${summary.countPiutangJatuhTempo} Overdue`,
      amount: summary.totalPiutangJatuhTempo,
      icon: AlertTriangle,
      iconColor: 'text-rose-700',
      iconBg: 'bg-rose-500/10 border border-rose-500/20',
      accentColor: 'border-l-4 border-l-rose-600',
      hoverBorder: 'hover:border-rose-600',
      drilldownLabel: 'Kirim Tagihan WA',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onSelectKPI(card.id)}
            className={`group text-left relative overflow-hidden rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-white shadow-xs p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${card.hoverBorder}`}
          >
            {/* Header: Title and Icon */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                  {card.countLabel}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <Icon size={18} className={card.iconColor} />
              </div>
            </div>

            {/* Currency Nominal (Right-aligned numeric precision) */}
            <div className="mt-2 text-right">
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight font-sans">
                {formatRupiah(card.amount)}
              </div>
            </div>

            {/* Bottom Drill-down Trigger */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <span>{card.drilldownLabel}</span>
              <ArrowRight
                size={13}
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};
