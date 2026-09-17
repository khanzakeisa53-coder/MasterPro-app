import React, { useState } from 'react';
import {
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Copy,
  ExternalLink,
  Plus,
  Calendar,
  Phone,
  Building2,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { Order, PaymentRecord } from '../types';
import {
  formatRupiah,
  formatDate,
  calculateDaysRemaining,
  getAgingCategory,
} from '../lib/formatters';

interface PiutangWorkspaceProps {
  orders: Order[];
  onOpenPaymentModal: (order: Order) => void;
  onViewDetail: (order: Order) => void;
  onBackToDashboard?: () => void;
}

type ReminderTemplateType = 'ramah' | 'hari_h' | 'terlambat' | 'kirim_resi';

export const PiutangWorkspace: React.FC<PiutangWorkspaceProps> = ({
  orders,
  onOpenPaymentModal,
  onViewDetail,
  onBackToDashboard,
}) => {
  // Only orders with pending balance
  const unpaidOrders = orders.filter((o) => o.remainingAmount > 0);

  // Selected order for WhatsApp reminder generator
  const [selectedOrder, setSelectedOrder] = useState<Order>(unpaidOrders[0] || orders[0]);
  const [templateType, setTemplateType] = useState<ReminderTemplateType>('ramah');
  const [selectedAgingFilter, setSelectedAgingFilter] = useState<'all' | 'overdue' | 'mendekati' | 'belum_jatuh_tempo'>('all');
  const [bankAccountInfo, setBankAccountInfo] = useState(
    'BCA 8892-019-221 a/n PT Multi Niaga Nusantara / Admin Keuangan'
  );
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Group by aging category
  const categorized = unpaidOrders.reduce(
    (acc, ord) => {
      const cat = getAgingCategory(ord.dueDate, ord.status);
      acc[cat].push(ord);
      return acc;
    },
    {
      overdue: [] as Order[],
      mendekati: [] as Order[],
      belum_jatuh_tempo: [] as Order[],
    }
  );

  // Filtered invoices according to selected aging bar
  const displayedOrders = unpaidOrders.filter((ord) => {
    if (selectedAgingFilter === 'all') return true;
    return getAgingCategory(ord.dueDate, ord.status) === selectedAgingFilter;
  });

  // Calculate totals
  const totalOverdue = categorized.overdue.reduce((s, o) => s + o.remainingAmount, 0);
  const totalMendekati = categorized.mendekati.reduce((s, o) => s + o.remainingAmount, 0);
  const totalAman = categorized.belum_jatuh_tempo.reduce((s, o) => s + o.remainingAmount, 0);

  // Generate WhatsApp Message Text
  const generateMessage = (ord: Order, type: ReminderTemplateType) => {
    if (!ord) return '';

    const itemsSummary = ord.items.map((it) => `- ${it.name} (${it.qty}x)`).join('\n');
    const dueDateFormatted = formatDate(ord.dueDate);
    const sisa = formatRupiah(ord.remainingAmount);
    const grand = formatRupiah(ord.grandTotal);

    // Logistics info snippet if courier or tracking number exists
    const shippingSnippet =
      ord.trackingNumber || ord.courier
        ? `\n\n*Informasi Pengiriman & Ekspedisi:*\n- Kurir: ${ord.courier || 'Ekspedisi'}\n- Status: ${
            ord.shipmentStatus === 'dikirim'
              ? 'Sedang Dikirim (Dalam Perjalanan)'
              : ord.shipmentStatus === 'siap_kirim'
              ? 'Siap Dikirim'
              : ord.shipmentStatus === 'selesai'
              ? 'Telah Diterima'
              : 'Diproses Toko'
          }${ord.trackingNumber ? `\n- No. Resi: *${ord.trackingNumber}*` : ''}`
        : '';

    if (type === 'kirim_resi') {
      return `Halo Bapak/Ibu ${ord.customerName},\n\nKabar baik! Pesanan Anda dengan No. Faktur *${ord.invoiceNumber}* telah diperbarui status pengirimannya:\n\n*Ekspedisi / Kurir:* ${ord.courier || 'Dakota Cargo'}\n*Nomor Resi / AWB:* ${ord.trackingNumber || '(Dalam proses penerbitan)'}\n*Destinasi:* ${ord.destinationTag}\n*Status:* ${ord.shipmentStatus === 'dikirim' ? 'Sedang Dikirim' : 'Siap Dikirim'}\n\n*Rincian Barang:*\n${itemsSummary}\n\n*Status Tagihan:*\n- Total: ${grand}\n- Sisa Tagihan: ${sisa}\n\nTerima kasih atas kepercayaannya berbelanja di Pesanan Master PRO! 📦✨`;
    }

    if (type === 'ramah') {
      return `Halo Bapak/Ibu ${ord.customerName},\n\nSemoga hari Anda menyenangkan. Kami dari bagian keuangan ingin menginformasikan rincian faktur pesanan:\n\n*No. Invoice:* ${ord.invoiceNumber}\n*Total Tagihan:* ${grand}\n*Sisa Belum Lunas:* ${sisa}\n*Jatuh Tempo:* ${dueDateFormatted}${shippingSnippet}\n\n*Rincian Barang:*\n${itemsSummary}\n\nPembayaran dapat disalurkan melalui:\n${bankAccountInfo}\n\nMohon konfirmasi bukti transfer jika sudah melakukan pembayaran. Terima kasih atas kerja samanya! 🙏`;
    }

    if (type === 'hari_h') {
      return `Halo Bapak/Ibu ${ord.customerName},\n\nKami menginformasikan bahwa tagihan faktur *${ord.invoiceNumber}* jatuh tempo *HARI INI* (${dueDateFormatted}).\n\n*Nominal Sisa Pembayaran:* ${sisa}${shippingSnippet}\n\n*Rekening Pembayaran:*\n${bankAccountInfo}\n\nMohon agar pelunasan dapat diselesaikan hari ini guna kelancaran rekonsiliasi kas dan pengiriman order berikutnya. Terima kasih!`;
    }

    // Terlambat (Overdue)
    const daysLate = Math.abs(calculateDaysRemaining(ord.dueDate));
    return `PENTING: TEGURAN KETERLAMBATAN PEMBAYARAN\n\nKepada Yth. Bapak/Ibu ${ord.customerName} (${ord.customerCompany || 'Pelanggan'}),\n\nSistem kami mencatat bahwa faktur *${ord.invoiceNumber}* sebesar *${sisa}* telah melewati batas jatuh tempo selama *${daysLate} hari* (Jatuh tempo: ${dueDateFormatted}).${shippingSnippet}\n\nMohon segera melakukan pelunasan ke rekening resmi:\n${bankAccountInfo}\n\nDan segera kirimkan bukti transfer ke WhatsApp ini. Jika ada kendala, mohon hubungi kami segera. Terima kasih.`;
  };

  const messageText = selectedOrder ? generateMessage(selectedOrder, templateType) : '';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!selectedOrder) return;
    const phone = selectedOrder.customerPhone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    const encoded = encodeURIComponent(messageText);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Title & Back Button */}
      <div className="flex items-center gap-3.5">
        {onBackToDashboard && (
          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-orange-400/50 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 shadow-[0_0_14px_rgba(249,115,22,0.25)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </button>
        )}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
            Pusat Piutang & Penagihan Terstruktur
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analisis umur piutang (Aging), pencatatan angsuran, dan generator pesan penagihan WhatsApp resmi
          </p>
        </div>
      </div>

      {/* Aging Category KPI Breakdown - Clickable Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold flex items-center gap-1.5">
            <span>Kategori Umur Piutang (Klik Bar untuk Filter Cepat):</span>
          </span>
          {selectedAgingFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedAgingFilter('all')}
              className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              Reset Filter (Tampilkan Semua)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Overdue */}
          <button
            type="button"
            onClick={() => setSelectedAgingFilter(selectedAgingFilter === 'overdue' ? 'all' : 'overdue')}
            className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
              selectedAgingFilter === 'overdue'
                ? 'bg-rose-100/90 dark:bg-rose-950/70 border-2 border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.35)] scale-[1.02]'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />
                Lewat Jatuh Tempo (Overdue)
              </span>
              <span className="text-[10px] bg-rose-200 dark:bg-rose-900/80 px-2 py-0.5 rounded-full font-bold">
                {categorized.overdue.length} Invoice
              </span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-rose-700 dark:text-rose-300 text-right mt-2 font-sans">
              {formatRupiah(totalOverdue)}
            </div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center justify-between">
              <span>Perlu teguran penagihan segera</span>
              <span className="text-[10px] font-bold underline">
                {selectedAgingFilter === 'overdue' ? '✓ Sedang Difilter' : 'Klik Filter'}
              </span>
            </div>
          </button>

          {/* Mendekati (<= 7 hari) */}
          <button
            type="button"
            onClick={() => setSelectedAgingFilter(selectedAgingFilter === 'mendekati' ? 'all' : 'mendekati')}
            className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
              selectedAgingFilter === 'mendekati'
                ? 'bg-amber-100/90 dark:bg-amber-950/70 border-2 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.35)] scale-[1.02]'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 hover:border-amber-400 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                Mendekati Tempo (≤ 7 Hari)
              </span>
              <span className="text-[10px] bg-amber-200 dark:bg-amber-900/80 px-2 py-0.5 rounded-full font-bold">
                {categorized.mendekati.length} Invoice
              </span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-700 dark:text-amber-300 text-right mt-2 font-sans">
              {formatRupiah(totalMendekati)}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center justify-between">
              <span>Siapkan pengingat ramah H-3</span>
              <span className="text-[10px] font-bold underline">
                {selectedAgingFilter === 'mendekati' ? '✓ Sedang Difilter' : 'Klik Filter'}
              </span>
            </div>
          </button>

          {/* Belum Jatuh Tempo (> 7 hari) */}
          <button
            type="button"
            onClick={() => setSelectedAgingFilter(selectedAgingFilter === 'belum_jatuh_tempo' ? 'all' : 'belum_jatuh_tempo')}
            className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
              selectedAgingFilter === 'belum_jatuh_tempo'
                ? 'bg-emerald-100/90 dark:bg-emerald-950/70 border-2 border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.35)] scale-[1.02]'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                Belum Jatuh Tempo Aman (&gt; 7 Hari)
              </span>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full font-bold">
                {categorized.belum_jatuh_tempo.length} Invoice
              </span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-300 text-right mt-2 font-sans">
              {formatRupiah(totalAman)}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-between">
              <span>Jadwal pembayaran masih aman</span>
              <span className="text-[10px] font-bold underline">
                {selectedAgingFilter === 'belum_jatuh_tempo' ? '✓ Sedang Difilter' : 'Klik Filter'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Piutang List on Left, WhatsApp Billing Generator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Outstanding Invoices (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>
                Daftar Tagihan {selectedAgingFilter !== 'all' ? `(${selectedAgingFilter.replace(/_/g, ' ').toUpperCase()})` : 'Belum Lunas'} ({displayedOrders.length})
              </span>
              <span className="text-[11px] font-normal text-blue-600 dark:text-cyan-400">
                Klik faktur untuk muat generator pesan
              </span>
            </h3>

            {displayedOrders.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                Tidak ada faktur piutang untuk kategori filter ini.
              </div>
            ) : (
              <div className="space-y-3">
                {displayedOrders.map((ord) => {
                  const days = calculateDaysRemaining(ord.dueDate);
                  const isSelected = selectedOrder?.id === ord.id;
                  const isOverdue = days < 0;
                  const cleanPhone = ord.customerPhone.replace(/\D/g, '');
                  const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
                  const waReminderMsg = generateMessage(ord, 'ramah');
                  const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waReminderMsg)}`;
                  const telUrl = `tel:${ord.customerPhone.startsWith('+') ? ord.customerPhone : '+' + formattedPhone}`;

                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-md ring-1 ring-blue-500/40'
                          : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131B2E] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-blue-600 dark:text-cyan-400">
                              {ord.invoiceNumber}
                            </span>
                            {isOverdue ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                                Terlambat {Math.abs(days)} Hari
                              </span>
                            ) : days <= 7 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                                Sisa {days} Hari
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                Sisa {days} Hari
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-sm text-slate-800 dark:text-white mt-1">
                            {ord.customerName}
                          </div>
                          {ord.customerCompany && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {ord.customerCompany}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            Sisa Piutang:
                          </span>
                          <span className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400 font-sans">
                            {formatRupiah(ord.remainingAmount)}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Total: {formatRupiah(ord.grandTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Direct Action Buttons: Chat WA & Telepon Quick Action Strip */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          {/* Chat WA Quick Button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-xs transition-colors"
                            title={`Kirim WhatsApp Pengingat ke ${ord.customerName}`}
                          >
                            <MessageCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Chat WA</span>
                          </a>

                          {/* Telepon Quick Button */}
                          <a
                            href={telUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300/80 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/50 shadow-xs transition-colors"
                            title={`Hubungi telepon PIC ${ord.customerName}`}
                          >
                            <Phone size={12} className="text-blue-600 dark:text-blue-400" />
                            <span>Telepon</span>
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetail(ord);
                            }}
                            className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                          >
                            Lihat Faktur
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPaymentModal(ord);
                            }}
                            className="px-3 py-1 rounded-xl text-[11px] font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-colors cursor-pointer"
                          >
                            Catat Bayar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: WhatsApp Billing Reminder Generator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EADFD1] dark:border-[#382C24]">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                  Generator Tagihan WhatsApp
                </h3>
                <p className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                  Pesan otomatis siap kirim ke nomor pelanggan
                </p>
              </div>
            </div>

            {selectedOrder ? (
              <>
                {/* Target Invoice Indicator */}
                <div className="p-2.5 rounded-xl bg-[#F5F0E8]/70 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] text-xs">
                  <div className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F] uppercase tracking-wider font-semibold">
                    Target Faktur:
                  </div>
                  <div className="flex items-center justify-between font-bold text-[#2D2119] dark:text-[#F7F2EC] mt-0.5">
                    <span>
                      {selectedOrder.invoiceNumber} - {selectedOrder.customerName}
                    </span>
                    <span className="text-[#E65100] dark:text-[#FFB74D]">
                      {formatRupiah(selectedOrder.remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* Template Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1.5">
                    Pilih Template Penagihan:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'ramah', label: '1. Ramah' },
                      { id: 'hari_h', label: '2. Hari-H' },
                      { id: 'terlambat', label: '3. Teguran' },
                      { id: 'kirim_resi', label: '4. Resi Kirim' },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setTemplateType(tpl.id as ReminderTemplateType)}
                        className={`py-2 px-1.5 rounded-lg text-[11px] font-semibold text-center transition-all ${
                          templateType === tpl.id
                            ? 'bg-[#1565C0] text-white shadow-sm'
                            : 'bg-[#F5F0E8] dark:bg-[#1A130F] text-[#7D6E63] dark:text-[#A89B8F] hover:text-[#2D2119] border border-[#EADFD1] dark:border-[#382C24]'
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank Account Config */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-1">
                    Rekening Tujuan Pembayaran:
                  </label>
                  <input
                    type="text"
                    value={bankAccountInfo}
                    onChange={(e) => setBankAccountInfo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC]"
                  />
                </div>

                {/* Message Preview Box */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-1">
                    Pratinjau Pesan:
                  </label>
                  <textarea
                    rows={8}
                    readOnly
                    value={messageText}
                    className="w-full p-3 rounded-xl text-xs font-mono bg-[#F5F0E8]/70 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] leading-relaxed resize-none"
                  />
                </div>

                {/* Copied notification alert */}
                {copiedNotification && (
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs text-center font-medium">
                    ✓ Pesan berhasil disalin ke clipboard!
                  </div>
                )}

                {/* WhatsApp Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-[#F5F0E8] dark:bg-[#261C16] text-[#2D2119] dark:text-[#F7F2EC] border border-[#EADFD1] dark:border-[#382C24] hover:bg-[#EADFD1]/50 transition-colors"
                  >
                    <Copy size={13} />
                    <span>Salin Pesan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle size={15} />
                    <span>Kirim ke WA</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                Pilih faktur dari daftar sebelah kiri untuk memuat template penagihan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
