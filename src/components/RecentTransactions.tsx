import React from 'react';
import {
  Receipt,
  ExternalLink,
  Store,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Order, PaymentStatus } from '../types';
import { formatRupiah, formatDate } from '../lib/formatters';

interface RecentTransactionsProps {
  orders: Order[];
  onViewDetail: (order: Order) => void;
  onViewAllOrders: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  orders,
  onViewDetail,
  onViewAllOrders,
}) => {
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={11} />
            Lunas
          </span>
        );
      case 'dp':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock size={11} />
            DP / Sebagian
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle size={11} />
            Jatuh Tempo
          </span>
        );
      case 'belum_lunas':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
            <Clock size={11} />
            Belum Lunas
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFD1] text-[#2D2119] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-[#EADFD1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#0D47A1]/10 text-[#1565C0]">
            <Receipt size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2119]">
              Transaksi & Pesanan Terbaru
            </h2>
            <p className="text-xs text-[#78695F]">
              Monitoring status pesanan masuk dan verifikasi pelunasan
            </p>
          </div>
        </div>

        <button
          onClick={onViewAllOrders}
          className="text-xs font-semibold text-[#1565C0] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Buka Database</span>
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F0E8]/70 text-[11px] uppercase tracking-wider font-semibold text-[#78695F] border-b border-[#EADFD1]">
            <tr>
              <th className="py-3 px-4">No. Invoice</th>
              <th className="py-3 px-4">Pelanggan</th>
              <th className="py-3 px-4">Mode / Toko</th>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4 text-right">Total Tagihan</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADFD1]/80">
            {orders.slice(0, 5).map((order) => (
              <tr
                key={order.id}
                className="hover:bg-[#F5F0E8]/50 transition-colors"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#1565C0]">
                  {order.invoiceNumber}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-[#2D2119]">
                    {order.customerName}
                  </div>
                  {order.customerCompany && (
                    <div className="text-[11px] text-[#78695F]">
                      {order.customerCompany}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#2D2119]">
                    {order.mode === 'gabung_nota' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                        <Users size={10} />
                        Gabung Nota
                      </span>
                    ) : (
                      <span className="text-xs text-[#78695F]">
                        Bayar Mandiri
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#78695F] flex items-center gap-1 mt-0.5 truncate max-w-[160px]">
                    <Store size={10} />
                    <span>{order.items[0]?.store || 'Toko Utama'}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs text-[#78695F]">
                  {formatDate(order.createdAt)}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-[#2D2119]">
                  {formatRupiah(order.grandTotal)}
                  {order.remainingAmount > 0 && (
                    <div className="text-[10px] text-rose-600 font-normal">
                      Sisa: {formatRupiah(order.remainingAmount)}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {getStatusBadge(order.status)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onViewDetail(order)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1565C0] bg-[#0D47A1]/5 hover:bg-[#0D47A1]/15 transition-colors cursor-pointer"
                  >
                    <Eye size={12} />
                    <span>Rincian</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (Responsive design mandate) */}
      <div className="md:hidden divide-y divide-[#EADFD1]/80">
        {orders.slice(0, 5).map((order) => (
          <div
            key={order.id}
            onClick={() => onViewDetail(order)}
            className="p-4 space-y-2.5 active:bg-[#F5F0E8]/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-[#1565C0]">
                {order.invoiceNumber}
              </span>
              {getStatusBadge(order.status)}
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-sm text-[#2D2119]">
                  {order.customerName}
                </div>
                {order.customerCompany && (
                  <div className="text-xs text-[#78695F]">
                    {order.customerCompany}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-sm text-[#2D2119]">
                  {formatRupiah(order.grandTotal)}
                </div>
                {order.remainingAmount > 0 && (
                  <div className="text-[11px] text-rose-600">
                    Sisa: {formatRupiah(order.remainingAmount)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#78695F] pt-1">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatDate(order.createdAt)}
              </span>
              <span className="text-[11px] font-medium text-[#1565C0]">
                Lihat Faktur →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
