import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Building2,
  MapPin,
  Phone,
  Calendar,
  ShoppingBag,
  Receipt,
  Wallet,
  ExternalLink,
  Edit3,
  Check,
  Plus,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Customer, Order } from '../types';
import { formatRupiah, formatDate } from '../lib/formatters';

interface CustomerModalProps {
  customer: Customer;
  orders: Order[];
  onClose: () => void;
  onOpenOrderDetail?: (order: Order) => void;
  onNavigateToNewOrderWithCustomer?: (customer: Customer) => void;
  onUpdateCustomer?: (updatedCustomer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  orders,
  onClose,
  onOpenOrderDetail,
  onNavigateToNewOrderWithCustomer,
  onUpdateCustomer,
}) => {
  // Filter orders belonging to this customer
  const customerOrders = orders.filter(
    (ord) =>
      ord.customerName.toLowerCase().includes(customer.name.toLowerCase()) ||
      customer.name.toLowerCase().includes(ord.customerName.toLowerCase()) ||
      (customer.company &&
        ord.customerCompany &&
        ord.customerCompany.toLowerCase().includes(customer.company.toLowerCase())) ||
      (ord.customerPhone &&
        customer.phone &&
        ord.customerPhone.replace(/\D/g, '') === customer.phone.replace(/\D/g, ''))
  );

  // Accumulated Customer Metrics
  const totalSpend = customerOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrdersCount = customerOrders.length;
  const totalUnpaidAmount = customerOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
  const paidOrdersCount = customerOrders.filter((o) => o.status === 'lunas').length;
  const overdueOrdersCount = customerOrders.filter((o) => o.status === 'overdue').length;

  // Clean WhatsApp phone number (format: 628xxx)
  const rawPhone = customer.phone.replace(/\D/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '62' + rawPhone.substring(1) : rawPhone;

  // Editing state for notes and address
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(customer.notes || '');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(customer.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(customer.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSaveNotes = () => {
    if (onUpdateCustomer) {
      onUpdateCustomer({
        ...customer,
        notes: notesDraft.trim(),
      });
    }
    setIsEditingNotes(false);
  };

  const waMessageGreeting = encodeURIComponent(
    `Halo Bapak/Ibu ${customer.name}, perkenalkan kami dari tim operasional Pesanan Master PRO. Kami ingin berkoordinasi terkait pesanan dan kerja sama bisnis Anda.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FFFDF9] dark:bg-[#16110E] border border-[#EADFD1] dark:border-[#382C24] shadow-2xl text-[#2D2119] dark:text-[#F7F2EC] flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#EADFD1] dark:border-[#382C24] bg-[#FFFDF9]/95 dark:bg-[#16110E]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0D47A1] to-[#FF6D00] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                  {customer.name}
                </h3>
                {totalUnpaidAmount > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Ada Piutang Aktif
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Akun Bersih (Lunas)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                {customer.company || 'Pelanggan Perorangan / Bisnis'} • Terdaftar sejak{' '}
                {customer.createdAt.substring(0, 10)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7D6E63] dark:text-[#A89B8F] hover:bg-[#F5F0E8] dark:hover:bg-[#211813] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Action Banner: WhatsApp Direct Button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <MessageCircle size={22} />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Nomor WhatsApp Terverifikasi
                </div>
                <div className="text-sm font-mono font-semibold text-[#2D2119] dark:text-[#F7F2EC]">
                  +{cleanPhone}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPhone}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] hover:bg-[#F5F0E8] dark:hover:bg-[#2C211A] transition-colors flex items-center gap-1.5"
              >
                {copiedPhone ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedPhone ? 'Tersalin' : 'Salin Nomor'}</span>
              </button>

              <a
                href={`https://wa.me/${cleanPhone}?text=${waMessageGreeting}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 transition-all"
              >
                <MessageCircle size={15} />
                <span>Chat WhatsApp</span>
              </a>
            </div>
          </div>

          {/* 3 METRIK AKUMULASI PELANGGAN */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7D6E63] dark:text-[#A89B8F]">
              Akumulasi Kinerja Transaksi Pelanggan
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Metric 1: Total Belanja */}
              <div className="p-4 rounded-2xl bg-[#F5F0E8]/70 dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24]">
                <div className="flex items-center gap-1.5 text-xs text-[#7D6E63] dark:text-[#A89B8F] mb-1">
                  <ShoppingBag size={14} className="text-[#1565C0]" />
                  <span>Total Belanja</span>
                </div>
                <div className="text-lg font-black text-[#2D2119] dark:text-[#F7F2EC]">
                  {formatRupiah(totalSpend)}
                </div>
                <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] mt-1">
                  Nilai transaksi seumur hidup
                </div>
              </div>

              {/* Metric 2: Jumlah Transaksi */}
              <div className="p-4 rounded-2xl bg-[#F5F0E8]/70 dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24]">
                <div className="flex items-center gap-1.5 text-xs text-[#7D6E63] dark:text-[#A89B8F] mb-1">
                  <Receipt size={14} className="text-[#E65100]" />
                  <span>Jumlah Invoice</span>
                </div>
                <div className="text-lg font-black text-[#2D2119] dark:text-[#F7F2EC]">
                  {totalOrdersCount} <span className="text-xs font-normal">Faktur</span>
                </div>
                <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] mt-1">
                  {paidOrdersCount} Lunas Penuh • {overdueOrdersCount} Jatuh Tempo
                </div>
              </div>

              {/* Metric 3: Total Sisa Piutang Aktif */}
              <div
                className={`p-4 rounded-2xl border ${
                  totalUnpaidAmount > 0
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                  <Wallet
                    size={14}
                    className={totalUnpaidAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}
                  />
                  <span className={totalUnpaidAmount > 0 ? 'text-rose-800 dark:text-rose-300' : 'text-emerald-800 dark:text-emerald-300'}>
                    Sisa Piutang Aktif
                  </span>
                </div>
                <div
                  className={`text-lg font-black ${
                    totalUnpaidAmount > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {formatRupiah(totalUnpaidAmount)}
                </div>
                <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] mt-1">
                  {totalUnpaidAmount > 0 ? 'Wajib ditagihkan tepat waktu' : 'Tidak ada tagihan tertunggak'}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Address & Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alamat Pengiriman / Domisili Lengkap */}
            <div className="p-4 rounded-2xl bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7D6E63] dark:text-[#A89B8F] flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#1565C0]" />
                  <span>Alamat Pengiriman / Domisili</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="text-[11px] text-[#1565C0] dark:text-[#90CAF9] hover:underline flex items-center gap-1"
                >
                  <Copy size={11} />
                  <span>{copiedAddress ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-xs leading-relaxed text-[#2D2119] dark:text-[#F7F2EC] font-medium">
                {customer.address}
              </p>
              <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                Wilayah / Kota: <span className="font-semibold text-[#2D2119] dark:text-[#F7F2EC]">{customer.city}</span>
              </div>
            </div>

            {/* Catatan Khusus Pelanggan */}
            <div className="p-4 rounded-2xl bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7D6E63] dark:text-[#A89B8F] flex items-center gap-1.5">
                  <Edit3 size={13} className="text-[#E65100]" />
                  <span>Catatan Khusus Pelanggan</span>
                </span>
                {!isEditingNotes ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="text-[11px] text-[#1565C0] dark:text-[#90CAF9] hover:underline"
                  >
                    Ubah
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Simpan
                  </button>
                )}
              </div>

              {!isEditingNotes ? (
                <p className="text-xs leading-relaxed text-[#7D6E63] dark:text-[#A89B8F] italic">
                  {customer.notes ? `"${customer.notes}"` : 'Belum ada catatan khusus untuk pelanggan ini.'}
                </p>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Tulis catatan khusus, kesepakatan tempo, atau instruksi pengiriman..."
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNotesDraft(customer.notes || '');
                        setIsEditingNotes(false);
                      }}
                      className="px-2 py-1 rounded text-[11px] text-[#7D6E63]"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-2.5 py-1 rounded bg-[#1565C0] text-white text-[11px] font-semibold"
                    >
                      Simpan Catatan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Riwayat Faktur Pesanan Pelanggan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D6E63] dark:text-[#A89B8F]">
                Daftar Faktur Pesanan ({customerOrders.length})
              </h4>
              {onNavigateToNewOrderWithCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToNewOrderWithCustomer(customer);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#1565C0] dark:text-[#90CAF9] hover:underline"
                >
                  <Plus size={13} />
                  <span>Buat Pesanan Baru</span>
                </button>
              )}
            </div>

            {customerOrders.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-[#F5F0E8]/40 dark:bg-[#1A130F] text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                Belum ada data pesanan tercatat atas nama pelanggan ini.
              </div>
            ) : (
              <div className="border border-[#EADFD1] dark:border-[#382C24] rounded-2xl overflow-hidden divide-y divide-[#EADFD1] dark:divide-[#382C24]">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 flex items-center justify-between hover:bg-[#F5F0E8]/50 dark:hover:bg-[#211813]/60 transition-colors text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                          {ord.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F]">
                          • {formatDate(ord.createdAt)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-[#EADFD1]/60 dark:bg-[#2C211A] text-[#7D6E63] dark:text-[#A89B8F]">
                          {ord.mode === 'gabung_nota' ? 'Gabung Nota' : 'Mandiri'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] mt-0.5">
                        {ord.items.length} Barang • Tujuan: {ord.destinationTag}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                          {formatRupiah(ord.grandTotal)}
                        </div>
                        {ord.remainingAmount > 0 ? (
                          <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                            Sisa: {formatRupiah(ord.remainingAmount)}
                          </div>
                        ) : (
                          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ Lunas
                          </div>
                        )}
                      </div>

                      {onOpenOrderDetail && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenOrderDetail(ord);
                          }}
                          className="p-1.5 rounded-lg bg-[#F5F0E8] dark:bg-[#211813] hover:bg-[#EADFD1] dark:hover:bg-[#2C211A] text-[#1565C0] dark:text-[#90CAF9] transition-colors"
                          title="Lihat Detail Faktur"
                        >
                          <ExternalLink size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#EADFD1] dark:border-[#382C24] bg-[#FFFDF9]/95 dark:bg-[#16110E]/95 flex items-center justify-between">
          <div className="text-xs text-[#7D6E63] dark:text-[#A89B8F]">
            ID: <span className="font-mono">{customer.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToNewOrderWithCustomer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToNewOrderWithCustomer(customer);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#0D47A1] to-[#1565C0] hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} />
                <span>Buat Pesanan Baru</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F0E8] dark:bg-[#211813] text-[#2D2119] dark:text-[#F7F2EC] hover:bg-[#EADFD1] dark:hover:bg-[#2C211A] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
