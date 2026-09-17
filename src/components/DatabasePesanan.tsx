import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Receipt,
  Users,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  ArrowUpDown,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { Order, OrderFilterState, PaymentStatus } from '../types';
import { formatRupiah, formatDate } from '../lib/formatters';

interface DatabasePesananProps {
  orders: Order[];
  onViewDetail: (order: Order) => void;
  onOpenPaymentModal: (order: Order) => void;
  onNavigateToNewOrder: () => void;
  onBackToDashboard?: () => void;
  initialFilterTab?: OrderFilterState['statusTab'];
}

export const DatabasePesanan: React.FC<DatabasePesananProps> = ({
  orders,
  onViewDetail,
  onOpenPaymentModal,
  onNavigateToNewOrder,
  onBackToDashboard,
  initialFilterTab = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<OrderFilterState['statusTab']>(initialFilterTab);
  const [periodFilter, setPeriodFilter] = useState<'semua' | 'hari_ini' | 'kemarin' | 'bulan_ini'>('bulan_ini');
  const [storeFilter, setStoreFilter] = useState<string>('semua');

  // Available store list
  const storeOptions = useMemo(() => {
    const stores = new Set<string>();
    orders.forEach((o) => o.items.forEach((i) => stores.add(i.store)));
    return Array.from(stores);
  }, [orders]);

  // Date constants for daily cash reconciliation
  const todayStr = '2026-09-16';
  const yesterdayStr = '2026-09-15';
  const thisMonthStr = '2026-09';

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search matching: invoice, customer, company, item name, courier, resi
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        order.invoiceNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        (order.customerCompany && order.customerCompany.toLowerCase().includes(q)) ||
        order.items.some((it) => it.name.toLowerCase().includes(q)) ||
        order.destinationTag.toLowerCase().includes(q) ||
        (order.courier && order.courier.toLowerCase().includes(q)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Period filter (Hari Ini, Kemarin, Bulan Ini, Semua)
      if (periodFilter === 'hari_ini') {
        if (!order.createdAt.startsWith(todayStr)) return false;
      } else if (periodFilter === 'kemarin') {
        if (!order.createdAt.startsWith(yesterdayStr)) return false;
      } else if (periodFilter === 'bulan_ini') {
        if (!order.createdAt.startsWith(thisMonthStr)) return false;
      }

      // Status tab filter
      if (statusTab === 'belum_lunas') {
        if (order.status !== 'belum_lunas' && order.status !== 'dp' && order.status !== 'overdue') {
          return false;
        }
      } else if (statusTab === 'lunas') {
        if (order.status !== 'lunas') return false;
      } else if (statusTab === 'gabung_nota') {
        if (order.mode !== 'gabung_nota') return false;
      } else if (statusTab === 'overdue') {
        if (order.status !== 'overdue') return false;
      }

      // Store filter
      if (storeFilter !== 'semua') {
        const hasStore = order.items.some((it) => it.store === storeFilter);
        if (!hasStore) return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusTab, periodFilter, storeFilter]);

  // Money stack totals calculation for current filtered view
  const stackTotals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, o) => {
        acc.total += o.grandTotal;
        acc.paid += o.paidAmount;
        acc.remaining += o.remainingAmount;
        return acc;
      },
      { total: 0, paid: 0, remaining: 0 }
    );
  }, [filteredOrders]);

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
            Lewat Tempo
          </span>
        );
      case 'belum_lunas':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <Clock size={11} />
            Belum Lunas
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-emerald-400/50 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-[0_0_14px_rgba(16,185,129,0.25)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft size={18} strokeWidth={2.4} />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
              Database Master Pesanan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pencarian, pemfilteran multi-dimensi, dan pelacakan status seluruh invoice operasional
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToNewOrder}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-600 shadow-[0_0_14px_rgba(16,185,129,0.3)] border border-emerald-400/40 hover:scale-[1.02] transition-transform cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>+ Pesanan Baru</span>
        </button>
      </div>

      {/* Money Stack Display Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-emerald-400/30 dark:border-emerald-500/25 shadow-[0_0_16px_rgba(16,185,129,0.12)]">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Total Nilai Pesanan (Filter)
          </span>
          <div className="text-lg font-black text-[#0F172A] dark:text-white text-right font-sans">
            {formatRupiah(stackTotals.total)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            Sudah Terbayar (Kas Masuk)
          </span>
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 text-right font-sans">
            {formatRupiah(stackTotals.paid)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50">
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1">
            Sisa Piutang Berjalan
          </span>
          <div className="text-lg font-black text-orange-600 dark:text-orange-400 text-right font-sans">
            {formatRupiah(stackTotals.remaining)}
          </div>
        </div>
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-4 space-y-4 shadow-sm">
        {/* Row 1: Search and Secondary Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar (6 cols) */}
          <div className="sm:col-span-6 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-3 text-[#7D6E63] dark:text-[#A89B8F]"
            />
            <input
              type="text"
              placeholder="Cari no. invoice, nama pelanggan, barang, tujuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
            />
          </div>

          {/* Store Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
            >
              <option value="semua">Semua Lokasi Toko</option>
              {storeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter (3 cols) - Quick Selector */}
          <div className="sm:col-span-3">
            <select
              value={periodFilter}
              onChange={(e: any) => setPeriodFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
            >
              <option value="hari_ini">⚡ Hari Ini (16 Sep 2026)</option>
              <option value="kemarin">⏳ Kemarin (15 Sep 2026)</option>
              <option value="bulan_ini">📆 Bulan Ini (Sep 2026)</option>
              <option value="semua">🌐 Semua Periode</option>
            </select>
          </div>
        </div>

        {/* Row 2: 1-Click Quick Date Filter Chips for Daily Cash Reconciliation */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#EADFD1]/60 dark:border-[#382C24]">
          <span className="text-[11px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mr-1">
            Rekonsiliasi Kas:
          </span>
          {[
            { id: 'hari_ini', label: '⚡ Hari Ini (16 Sep)' },
            { id: 'kemarin', label: '⏳ Kemarin (15 Sep)' },
            { id: 'bulan_ini', label: '📆 Bulan Ini' },
            { id: 'semua', label: '🌐 Semua Waktu' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriodFilter(item.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                periodFilter === item.id
                  ? 'bg-[#E65100] text-white shadow-xs font-bold'
                  : 'bg-[#F5F0E8] dark:bg-[#1A130F] text-[#7D6E63] dark:text-[#A89B8F] hover:text-[#2D2119] border border-[#EADFD1] dark:border-[#382C24]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Row 3: Status Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EADFD1]/60 dark:border-[#382C24]">
          <span className="text-[11px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mr-1">
            Status:
          </span>

          {[
            { id: 'all', label: 'Semua Pesanan', count: orders.length },
            {
              id: 'belum_lunas',
              label: 'Belum Lunas',
              count: orders.filter((o) => o.status !== 'lunas').length,
            },
            {
              id: 'lunas',
              label: 'Lunas',
              count: orders.filter((o) => o.status === 'lunas').length,
            },
            {
              id: 'gabung_nota',
              label: 'Gabung Nota',
              count: orders.filter((o) => o.mode === 'gabung_nota').length,
            },
            {
              id: 'overdue',
              label: 'Jatuh Tempo',
              count: orders.filter((o) => o.status === 'overdue').length,
            },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0D47A1] text-white shadow-sm'
                    : 'bg-[#F5F0E8] dark:bg-[#1A130F] text-[#7D6E63] dark:text-[#A89B8F] hover:text-[#2D2119] dark:hover:text-[#F7F2EC] border border-[#EADFD1] dark:border-[#382C24]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EADFD1] dark:bg-[#2C211A] text-[#7D6E63] dark:text-[#C9BDB3]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-[#7D6E63] dark:text-[#A89B8F] px-1">
        Menampilkan <b>{filteredOrders.length}</b> pesanan yang cocok
      </div>

      {/* Database Table (Desktop) */}
      <div className="hidden md:block rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F0E8]/70 dark:bg-[#1C1410] text-[11px] uppercase tracking-wider font-semibold text-[#7D6E63] dark:text-[#A89B8F] border-b border-[#EADFD1] dark:border-[#382C24]">
            <tr>
              <th className="py-3 px-4">Invoice & Tanggal</th>
              <th className="py-3 px-4">Pelanggan & Tujuan</th>
              <th className="py-3 px-4">Mode & Toko</th>
              <th className="py-3 px-4">Rincian Barang</th>
              <th className="py-3 px-4 text-right">Grand Total</th>
              <th className="py-3 px-4 text-right">Sisa Piutang</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADFD1]/60 dark:divide-[#382C24]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                  Tidak ada pesanan yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#F5F0E8]/40 dark:hover:bg-[#2A1F18] transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-xs text-[#1565C0] dark:text-[#90CAF9] block">
                      {order.invoiceNumber}
                    </span>
                    <span className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-xs text-[#2D2119] dark:text-[#F7F2EC]">
                      {order.customerName}
                    </div>
                    {order.customerCompany && (
                      <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                        {order.customerCompany}
                      </div>
                    )}
                    <div className="text-[10px] text-[#1565C0] dark:text-[#90CAF9] mt-0.5">
                      📍 {order.destinationTag}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="mb-1">
                      {order.mode === 'gabung_nota' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                          <Users size={10} />
                          Gabung Nota
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                          Bayar Mandiri
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] flex items-center gap-1 truncate max-w-[150px]">
                      <Store size={10} />
                      <span>{order.items[0]?.store || 'Toko Utama'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-medium text-[#2D2119] dark:text-[#F7F2EC] truncate max-w-[180px]">
                      {order.items[0]?.name}
                    </div>
                    {order.items.length > 1 && (
                      <div className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F]">
                        + {order.items.length - 1} barang lainnya
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-bold text-xs text-[#2D2119] dark:text-[#F7F2EC]">
                      {formatRupiah(order.grandTotal)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {order.remainingAmount > 0 ? (
                      <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                        {formatRupiah(order.remainingAmount)}
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Lunas
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {getStatusBadge(order.status)}
                      {order.shipmentStatus && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#7D6E63] dark:text-[#A89B8F] bg-[#F5F0E8] dark:bg-[#1A130F] px-2 py-0.5 rounded-md border border-[#EADFD1] dark:border-[#382C24]">
                          {order.shipmentStatus === 'dikirim' && '🚚 Dikirim'}
                          {order.shipmentStatus === 'siap_kirim' && '📦 Siap Kirim'}
                          {order.shipmentStatus === 'diproses' && '⚙️ Diproses'}
                          {order.shipmentStatus === 'selesai' && '✓ Selesai'}
                          {order.trackingNumber && (
                            <span className="font-mono text-[9px] text-[#1565C0] dark:text-[#90CAF9]">
                              {order.trackingNumber}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetail(order)}
                        className="p-1.5 rounded-lg text-xs font-medium text-[#1565C0] dark:text-[#90CAF9] bg-[#0D47A1]/5 hover:bg-[#0D47A1]/15 transition-colors"
                        title="Lihat Faktur"
                      >
                        <Eye size={13} />
                      </button>

                      {order.remainingAmount > 0 && (
                        <button
                          onClick={() => onOpenPaymentModal(order)}
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#E65100] dark:text-[#FFB74D] bg-[#E65100]/10 hover:bg-[#E65100]/20 transition-colors"
                        >
                          Catat Bayar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#7D6E63] dark:text-[#A89B8F] bg-[#FFFDF9] dark:bg-[#211813] rounded-2xl border border-[#EADFD1] dark:border-[#382C24]">
            Tidak ada pesanan ditemukan.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[#1565C0] dark:text-[#90CAF9]">
                  {order.invoiceNumber}
                </span>
                {getStatusBadge(order.status)}
              </div>

              <div>
                <div className="font-bold text-sm text-[#2D2119] dark:text-[#F7F2EC]">
                  {order.customerName}
                </div>
                {order.customerCompany && (
                  <div className="text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                    {order.customerCompany}
                  </div>
                )}
                <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] mt-1">
                  📦 {order.items.length} item ({order.items[0]?.name}
                  {order.items.length > 1 ? ` & +${order.items.length - 1} lainnya` : ''})
                </div>
                {order.shipmentStatus && (
                  <div className="text-[10px] text-[#1565C0] dark:text-[#90CAF9] mt-1 flex items-center gap-1 font-medium">
                    <span>🚚 Status: {order.shipmentStatus}</span>
                    {order.trackingNumber && <span>• Resi: {order.trackingNumber}</span>}
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#1A130F] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#7D6E63] dark:text-[#A89B8F] block text-[10px]">
                    Total Tagihan:
                  </span>
                  <span className="font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                    {formatRupiah(order.grandTotal)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#7D6E63] dark:text-[#A89B8F] block text-[10px]">
                    Sisa Tagihan:
                  </span>
                  <span
                    className={`font-bold ${
                      order.remainingAmount > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {order.remainingAmount > 0 ? formatRupiah(order.remainingAmount) : 'Lunas'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  onClick={() => onViewDetail(order)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#1565C0] dark:text-[#90CAF9] bg-[#0D47A1]/10 hover:bg-[#0D47A1]/20 transition-colors text-center"
                >
                  Lihat Faktur
                </button>
                {order.remainingAmount > 0 && (
                  <button
                    onClick={() => onOpenPaymentModal(order)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#E65100] hover:bg-[#FF6D00] transition-colors text-center"
                  >
                    Catat Bayar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
