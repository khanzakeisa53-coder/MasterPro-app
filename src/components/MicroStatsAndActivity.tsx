import React from 'react';
import {
  TrendingUp,
  Download,
  AlertCircle,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Receipt,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { FinancialSummary, ActivityLog } from '../types';
import { formatRupiah } from '../lib/formatters';

interface MicroStatsAndActivityProps {
  summary: FinancialSummary;
  activities: ActivityLog[];
  onWithdrawFunds?: () => void;
}

export const MicroStatsAndActivity: React.FC<MicroStatsAndActivityProps> = ({
  summary,
  activities,
  onWithdrawFunds,
}) => {
  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'order_created':
        return <Receipt size={13} className="text-[#1565C0]" />;
      case 'payment_received':
        return <CheckCircle2 size={13} className="text-emerald-600" />;
      case 'wa_reminder':
        return <MessageSquare size={13} className="text-[#E65100]" />;
      case 'sheet_sync':
        return <FileSpreadsheet size={13} className="text-emerald-700" />;
      default:
        return <Activity size={13} className="text-[#78695F]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Financial Micro Stats Panel */}
      <div className="lg:col-span-1 space-y-3.5">
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFD1] p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78695F] mb-4 flex items-center justify-between">
            <span>Rekapitulasi Kas & Piutang</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </h3>

          <div className="space-y-4">
            {/* Stat 1: Total Dana Masuk */}
            <div className="p-3.5 rounded-xl bg-[#F5F0E8]/70 border border-[#EADFD1]/80">
              <div className="flex items-center justify-between text-xs text-[#78695F] mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <TrendingUp size={14} className="text-emerald-600" />
                  Total Dana Masuk
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                  Terbayar
                </span>
              </div>
              <div className="text-xl font-black text-[#2D2119] tracking-tight text-right font-sans">
                {formatRupiah(summary.totalDanaMasuk)}
              </div>
            </div>

            {/* Stat 2: Dana Siap Ditarik */}
            <div className="p-3.5 rounded-xl bg-[#F5F0E8]/70 border border-[#EADFD1]/80">
              <div className="flex items-center justify-between text-xs text-[#78695F] mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Download size={14} className="text-[#1565C0]" />
                  Dana Siap Ditarik
                </span>
                <button
                  onClick={onWithdrawFunds}
                  className="text-[10px] font-bold text-[#1565C0] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Tarik</span>
                  <ArrowUpRight size={10} />
                </button>
              </div>
              <div className="text-xl font-black text-[#1565C0] tracking-tight text-right font-sans">
                {formatRupiah(summary.totalDanaSiapDitarik)}
              </div>
            </div>

            {/* Stat 3: Sisa Piutang Berjalan */}
            <div className="p-3.5 rounded-xl bg-[#F5F0E8]/70 border border-[#EADFD1]/80">
              <div className="flex items-center justify-between text-xs text-[#78695F] mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertCircle size={14} className="text-[#E65100]" />
                  Sisa Piutang Belum Tertagih
                </span>
                <span className="text-[10px] font-bold text-[#E65100] bg-[#E65100]/10 px-1.5 py-0.2 rounded border border-[#E65100]/20">
                  Pending
                </span>
              </div>
              <div className="text-xl font-black text-[#E65100] tracking-tight text-right font-sans">
                {formatRupiah(summary.sisaPiutang)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed (2 columns) */}
      <div className="lg:col-span-2 rounded-2xl bg-[#FFFDF9] border border-[#EADFD1] p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#E65100]/10 text-[#E65100]">
                <Activity size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D2119]">
                  Log Aktivitas & Riwayat Operasional
                </h3>
                <p className="text-[11px] text-[#78695F]">
                  Pencatatan otomatis setiap pesanan, pembayaran, dan tindakan penagihan
                </p>
              </div>
            </div>
          </div>

          {/* Activity items list */}
          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F0E8]/60 border border-[#EADFD1]/70 text-xs hover:border-[#D8CBBC] transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-white border border-[#EADFD1] shrink-0 mt-0.5">
                  {getActivityIcon(act.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#2D2119] truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-[#78695F] shrink-0 flex items-center gap-1">
                      <Clock size={10} />
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78695F] mt-0.5 line-clamp-2">
                    {act.description}
                  </p>
                </div>
                {act.amount && (
                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#1565C0] text-xs">
                      {formatRupiah(act.amount)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EADFD1]/80 flex items-center justify-between text-xs text-[#78695F]">
          <span>Semua aktivitas terverifikasi dan tercatat ke audit log</span>
          <span className="font-medium text-[#1565C0]">Aman & Tersimpan</span>
        </div>
      </div>
    </div>
  );
};
