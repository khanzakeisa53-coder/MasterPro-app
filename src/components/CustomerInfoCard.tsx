import React from 'react';
import {
  MessageCircle,
  MapPin,
  Building2,
  Wallet,
  Receipt,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Customer, Order } from '../types';
import { formatRupiah } from '../lib/formatters';

interface CustomerInfoCardProps {
  customer: Customer;
  orders?: Order[];
  onClearSelection?: () => void;
  onOpenCustomerDetail?: (customer: Customer) => void;
  compact?: boolean;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  customer,
  orders = [],
  onClearSelection,
  onOpenCustomerDetail,
  compact = false,
}) => {
  // Accumulated statistics
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

  const totalSpend = customerOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrdersCount = customerOrders.length;
  const totalUnpaidAmount = customerOrders.reduce((sum, o) => sum + o.remainingAmount, 0);

  const rawPhone = customer.phone.replace(/\D/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '62' + rawPhone.substring(1) : rawPhone;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#FFFDF9] to-[#F5F0E8] dark:from-amber-950/20 dark:via-[#211813] dark:to-[#16110E] border border-amber-300/70 dark:border-amber-900/60 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header of the Card */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0D47A1] to-[#FF6D00] flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-[#2D2119] dark:text-[#F7F2EC]">
                {customer.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase">
                ✓ Pelanggan Terdaftar
              </span>
            </div>
            {customer.company && (
              <div className="flex items-center gap-1 text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                <Building2 size={11} className="text-[#1565C0]" />
                <span>{customer.company}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenCustomerDetail && (
            <button
              type="button"
              onClick={() => onOpenCustomerDetail(customer)}
              className="p-1 rounded-lg text-[#7D6E63] dark:text-[#A89B8F] hover:text-[#1565C0] dark:hover:text-[#90CAF9] hover:bg-black/5 transition-colors"
              title="Lihat Profil Lengkap"
            >
              <ExternalLink size={13} />
            </button>
          )}
          {onClearSelection && (
            <button
              type="button"
              onClick={onClearSelection}
              className="p-1 rounded-lg text-[#7D6E63] dark:text-[#A89B8F] hover:text-rose-500 hover:bg-black/5 transition-colors"
              title="Ganti Pilihan Pelanggan"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp & Address Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mb-3">
        {/* WhatsApp direct chat */}
        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F] block font-medium">
              WhatsApp Aktif:
            </span>
            <span className="font-mono font-bold text-[#2D2119] dark:text-[#F7F2EC] text-[11px] truncate block">
              +{cleanPhone}
            </span>
          </div>
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Halo Bapak/Ibu ${customer.name}, kami dari Pesanan Master PRO ingin mengonfirmasi detail pesanan Anda.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shrink-0 shadow-sm"
          >
            <MessageCircle size={11} />
            <span>Chat WA</span>
          </a>
        </div>

        {/* Address snapshot */}
        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] space-y-0.5">
          <div className="flex items-center gap-1 text-[10px] text-[#7D6E63] dark:text-[#A89B8F] font-medium">
            <MapPin size={10} className="text-[#1565C0]" />
            <span>Alamat Domisili / Kirim:</span>
          </div>
          <p className="text-[11px] text-[#2D2119] dark:text-[#F7F2EC] line-clamp-1 font-medium" title={customer.address}>
            {customer.address}
          </p>
        </div>
      </div>

      {/* Customer Note if present */}
      {customer.notes && (
        <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] italic px-1 mb-3">
          Catatan: "{customer.notes}"
        </div>
      )}

      {/* Accumulated Metrics Bar */}
      {!compact && (
        <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div>
            <span className="text-[#7D6E63] dark:text-[#A89B8F] block">Total Belanja</span>
            <span className="font-bold text-[#2D2119] dark:text-[#F7F2EC]">
              {formatRupiah(totalSpend)}
            </span>
          </div>
          <div>
            <span className="text-[#7D6E63] dark:text-[#A89B8F] block">Invoice Selesai</span>
            <span className="font-bold text-[#2D2119] dark:text-[#F7F2EC]">
              {totalOrdersCount} Faktur
            </span>
          </div>
          <div>
            <span className="text-[#7D6E63] dark:text-[#A89B8F] block">Sisa Piutang</span>
            <span
              className={`font-bold ${
                totalUnpaidAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatRupiah(totalUnpaidAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
