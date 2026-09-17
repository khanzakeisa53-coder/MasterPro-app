import React, { useState } from 'react';
import {
  X,
  Printer,
  Receipt,
  Users,
  Store,
  Calendar,
  Phone,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  Truck,
  PackageCheck,
  QrCode,
  Copy,
  ChevronLeft,
  MessageCircle,
  User,
} from 'lucide-react';
import { Order, PaymentStatus, ShipmentStatus } from '../types';
import { formatRupiah, formatDate } from '../lib/formatters';
import { DeveloperBrandLogo } from './DeveloperBrandLogo';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenPaymentModal: (order: Order) => void;
  onOpenWhatsAppReminder?: (order: Order) => void;
  onUpdateOrderLogistics?: (
    orderId: string,
    courier: string,
    trackingNumber: string,
    shipmentStatus: ShipmentStatus
  ) => void;
  onViewCustomer?: (customerName: string, customerPhone: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenPaymentModal,
  onOpenWhatsAppReminder,
  onUpdateOrderLogistics,
  onViewCustomer,
}) => {
  if (!order) return null;

  // View mode: 'invoice' (Standard detailed invoice) or 'thermal' (58/80mm POS receipt)
  const [viewMode, setViewMode] = useState<'invoice' | 'thermal'>('invoice');
  const [thermalWidth, setThermalWidth] = useState<'58mm' | '80mm'>('80mm');

  // Logistics state
  const [courier, setCourier] = useState(order.courier || 'Dakota Cargo');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>(
    order.shipmentStatus || 'diproses'
  );
  const [isSavingLogistics, setIsSavingLogistics] = useState(false);
  const [logisticsSavedSuccess, setLogisticsSavedSuccess] = useState(false);
  const [copiedResi, setCopiedResi] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveLogistics = () => {
    if (onUpdateOrderLogistics) {
      setIsSavingLogistics(true);
      setTimeout(() => {
        onUpdateOrderLogistics(order.id, courier, trackingNumber, shipmentStatus);
        setIsSavingLogistics(false);
        setLogisticsSavedSuccess(true);
        setTimeout(() => setLogisticsSavedSuccess(false), 2500);
      }, 300);
    }
  };

  const handleCopyResi = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 size={12} />
            Lunas Penuh
          </span>
        );
      case 'dp':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock size={12} />
            Uang Muka (DP)
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle size={12} />
            Jatuh Tempo (Overdue)
          </span>
        );
      case 'belum_lunas':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-300 border border-stone-300 dark:border-stone-800">
            <Clock size={12} />
            Belum Lunas
          </span>
        );
    }
  };

  const getShipmentBadge = (status?: ShipmentStatus) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
            ✓ Terkirim (Selesai)
          </span>
        );
      case 'dikirim':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-300">
            🚚 Sedang Dikirim
          </span>
        );
      case 'siap_kirim':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300">
            📦 Siap Kirim
          </span>
        );
      case 'diproses':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
            ⚙️ Diproses
          </span>
        );
    }
  };

  // Group by owner if Gabung Nota
  const ownersBreakdown =
    order.mode === 'gabung_nota'
      ? order.items.reduce((acc, it) => {
          const owner = it.ownerName || 'Tanpa Nama';
          if (!acc[owner]) acc[owner] = 0;
          acc[owner] += it.qty * it.unitPrice;
          return acc;
        }, {} as Record<string, number>)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      {/* THERMAL RECEIPT VIEW (58mm / 80mm POS format) */}
      {viewMode === 'thermal' ? (
        <div className="w-full max-w-md rounded-2xl bg-white text-black p-4 sm:p-6 shadow-2xl space-y-4 my-auto print:shadow-none print:w-full print:m-0">
          {/* Header controls inside thermal view */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-stone-300 print:hidden">
            <button
              onClick={() => setViewMode('invoice')}
              className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-black"
            >
              <ChevronLeft size={16} />
              <span>Kembali ke Nota Utama</span>
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setThermalWidth(thermalWidth === '80mm' ? '58mm' : '80mm')}
                className="px-2 py-1 rounded bg-stone-100 text-[11px] font-mono font-bold border border-stone-300"
              >
                Lebar: {thermalWidth}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#0D47A1] text-white hover:bg-[#1565C0]"
              >
                <Printer size={13} />
                <span>Cetak Struk</span>
              </button>
            </div>
          </div>

          {/* Actual Thermal Paper Preview */}
          <div
            className={`mx-auto bg-white p-3 font-mono text-[11px] leading-tight text-black border border-dashed border-stone-400 rounded-sm ${
              thermalWidth === '58mm' ? 'max-w-[240px]' : 'max-w-[320px]'
            }`}
          >
            {/* Store Branding Monogram */}
            <div className="text-center pb-2 border-b border-dashed border-stone-400">
              <div className="text-base font-black tracking-tight">PESANAN MASTER PRO</div>
              <div className="text-[10px] text-stone-700">Official Operational Workspace</div>
              <div className="text-[9px] text-stone-600 mt-0.5">
                Komp. Mangga Dua Central Blok B2-19
              </div>
              <div className="text-[9px] text-stone-600">Telp: +62 812-3456-7890</div>
            </div>

            {/* Receipt Meta */}
            <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>No:</span>
                <span className="font-bold">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tgl:</span>
                <span>{order.createdAt.replace('T', ' ').substring(0, 16)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-semibold truncate max-w-[140px]">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span>{order.mode === 'gabung_nota' ? 'GABUNG NOTA' : 'MANDIRI'}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between font-bold text-[9px] pt-0.5">
                  <span>Resi ({order.courier || 'Kurir'}):</span>
                  <span>{order.trackingNumber}</span>
                </div>
              )}
            </div>

            {/* Itemized lines */}
            <div className="py-2 border-b border-dashed border-stone-400 space-y-1.5">
              {order.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-[10px]">{it.name}</div>
                  {order.mode === 'gabung_nota' && it.ownerName && (
                    <div className="text-[9px] text-stone-600 italic">PIC: {it.ownerName}</div>
                  )}
                  <div className="flex justify-between text-[10px]">
                    <span>
                      {it.qty} x {formatRupiah(it.unitPrice)}
                    </span>
                    <span className="font-semibold">{formatRupiah(it.qty * it.unitPrice)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financials Breakdown */}
            <div className="py-2 border-b border-dashed border-stone-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(order.discount)}</span>
                </div>
              )}
              {order.applyTax && (
                <>
                  <div className="flex justify-between text-stone-600">
                    <span>DPP:</span>
                    <span>{formatRupiah(order.dppAmount || (order.subtotal - order.discount))}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>PPN {order.taxRate || 11}%:</span>
                    <span>+{formatRupiah(order.taxAmount || 0)}</span>
                  </div>
                </>
              )}
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span>Ongkir:</span>
                  <span>+{formatRupiah(order.shippingCost)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-[12px] pt-1 border-t border-dotted border-stone-300">
                <span>TOTAL:</span>
                <span>{formatRupiah(order.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>DIBAYAR:</span>
                <span>{formatRupiah(order.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>SISA PIUTANG:</span>
                <span>{formatRupiah(order.remainingAmount)}</span>
              </div>
              <div className="flex justify-between text-[9px] text-stone-700">
                <span>STATUS:</span>
                <span className="font-black uppercase">{order.status.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Footer barcode stamp */}
            <div className="pt-3 text-center space-y-1">
              <div className="font-mono tracking-widest text-[9px] text-stone-600">
                ||||| | |||| |||| ||| |||||||
              </div>
              <div className="text-[9px] text-stone-600">{order.invoiceNumber}</div>
              <div className="text-[8px] text-stone-500">
                Terima kasih atas kerja samanya.
                <br />
                Simpan struk ini sebagai bukti transaksi sah.
              </div>
            </div>
          </div>

          {/* Thermal Bottom Exit Button */}
          <div className="pt-2 flex gap-2 print:hidden">
            <button
              type="button"
              onClick={() => setViewMode('invoice')}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              Kembali ke Nota
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-900 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD OFFICIAL INVOICE VIEW */
        <div className="w-full max-w-3xl rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
          {/* Modal Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EADFD1] dark:border-[#382C24]">
            <div className="flex items-center gap-2">
              <DeveloperBrandLogo size="sm" showSubtitle={false} />
              <span className="text-xs text-[#7D6E63] dark:text-[#A89B8F] border-l border-[#EADFD1] pl-2 font-mono">
                Faktur Resmi Operasional
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Thermal Receipt Button */}
              <button
                onClick={() => setViewMode('thermal')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F0E8] dark:bg-[#2C211A] text-[#2D2119] dark:text-[#F7F2EC] border border-[#EADFD1] dark:border-[#382C24] hover:bg-[#EADFD1]/60 transition-colors"
                title="Format printer thermal kasir 58/80mm"
              >
                <Receipt size={13} className="text-[#E65100]" />
                <span className="hidden sm:inline">Cetak Struk (58/80mm)</span>
                <span className="sm:hidden">Struk POS</span>
              </button>

              {/* Download PDF / Print Invoice */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0D47A1] text-white hover:bg-[#1565C0] shadow-sm transition-colors"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Download PDF Nota</span>
                <span className="sm:hidden">PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#7D6E63] dark:text-[#A89B8F] hover:bg-[#F5F0E8] dark:hover:bg-[#2C211A] hover:text-[#2D2119] dark:hover:text-[#F7F2EC] transition-colors cursor-pointer"
                title="Tutup Faktur (X)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Invoice Metadata Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="text-xs text-[#7D6E63] dark:text-[#A89B8F] uppercase tracking-wider block">
                Nomor Faktur Pesanan
              </span>
              <h2 className="text-xl font-mono font-extrabold text-[#1565C0] dark:text-[#90CAF9] mt-0.5">
                {order.invoiceNumber}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#7D6E63] dark:text-[#A89B8F] mt-1">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Diterbitkan: {formatDate(order.createdAt)}
                </span>
                <span>•</span>
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  Jatuh Tempo: {formatDate(order.dueDate)}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1.5">
              <div className="flex sm:justify-end gap-1.5">
                {getStatusBadge(order.status)}
                {getShipmentBadge(order.shipmentStatus)}
              </div>
              <div className="text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                Mode:{' '}
                <b className="text-[#2D2119] dark:text-[#F7F2EC]">
                  {order.mode === 'gabung_nota' ? 'Gabung Nota (Multi-Owner)' : 'Bayar Mandiri'}
                </b>
              </div>
            </div>
          </div>

          {/* Customer & Destination Grid */}
          <div className="p-4 rounded-2xl bg-[#F5F0E8]/70 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] text-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[#7D6E63] dark:text-[#A89B8F] block font-medium">
                  Pelanggan / Pemesan:
                </span>
                <div className="font-bold text-sm text-[#2D2119] dark:text-[#F7F2EC] mt-0.5">
                  {order.customerName}
                </div>
                {order.customerCompany && (
                  <div className="text-[#7D6E63] dark:text-[#A89B8F]">{order.customerCompany}</div>
                )}
                {order.customerNpwp && (
                  <div className="text-[11px] font-mono text-[#1565C0] dark:text-[#90CAF9] mt-0.5">
                    NPWP/NIK: {order.customerNpwp}
                  </div>
                )}
                {order.customerAddress && (
                  <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] mt-1 line-clamp-2">
                    🏠 {order.customerAddress}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[#7D6E63] dark:text-[#A89B8F] block font-medium">
                  Destinasi Pengiriman:
                </span>
                <div className="font-semibold text-xs text-[#2D2119] dark:text-[#F7F2EC] mt-0.5">
                  📍 {order.destinationTag}
                </div>
                {order.notes && (
                  <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] mt-1 italic">
                    "{order.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Clickable WhatsApp Contact Row */}
            {order.customerPhone && (
              <div className="pt-2.5 border-t border-[#EADFD1] dark:border-[#2C211A] flex items-center justify-between gap-2 flex-wrap">
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Halo Bapak/Ibu ${order.customerName}, kami dari Pesanan Master PRO ingin mengonfirmasi detail Faktur ${order.invoiceNumber} (${
                      order.status === 'lunas' ? 'Status: Lunas' : 'Sisa Tagihan: ' + formatRupiah(order.remainingAmount)
                    }).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm transition-all"
                >
                  <MessageCircle size={13} />
                  <span>Chat WhatsApp (+{order.customerPhone})</span>
                </a>

                {onViewCustomer && (
                  <button
                    type="button"
                    onClick={() => onViewCustomer(order.customerName, order.customerPhone)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1565C0] dark:text-[#90CAF9] hover:underline"
                  >
                    <User size={12} />
                    <span>Lihat Profil Pelanggan</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* LOGISTICS & NOMOR RESI SECTION */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                <Truck size={14} className="text-[#1565C0] dark:text-[#90CAF9]" />
                <span>Logistik & Status Pengiriman</span>
              </div>
              {order.trackingNumber && (
                <button
                  type="button"
                  onClick={handleCopyResi}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#1565C0] dark:text-[#90CAF9] hover:underline"
                >
                  <Copy size={11} />
                  <span>{copiedResi ? 'Resi Tersalin!' : 'Salin No. Resi'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Status Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-1">
                  Status Pengiriman:
                </label>
                <select
                  value={shipmentStatus}
                  onChange={(e: any) => setShipmentStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#16110E] border border-blue-200 dark:border-blue-900 text-[#2D2119] dark:text-[#F7F2EC]"
                >
                  <option value="diproses">⚙️ Diproses di Toko</option>
                  <option value="siap_kirim">📦 Siap Kirim</option>
                  <option value="dikirim">🚚 Sedang Dikirim (Jalan)</option>
                  <option value="selesai">✓ Terkirim / Selesai</option>
                </select>
              </div>

              {/* Courier Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-1">
                  Ekspedisi / Kurir:
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#16110E] border border-blue-200 dark:border-blue-900 text-[#2D2119] dark:text-[#F7F2EC]"
                >
                  <option value="Dakota Cargo">Dakota Cargo</option>
                  <option value="JNE Trucking">JNE Trucking / Reguler</option>
                  <option value="SiCepat Cargo">SiCepat Express / Cargo</option>
                  <option value="J&T Cargo">J&T Cargo</option>
                  <option value="Kurir Internal">Kurir Internal Armada Toko</option>
                  <option value="Ambil Sendiri">Ambil Sendiri (Self Pickup)</option>
                </select>
              </div>

              {/* Tracking Number Input & Save */}
              <div>
                <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-1">
                  Nomor Resi / AWB:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Contoh: DKT-99201948"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg font-mono text-xs bg-white dark:bg-[#16110E] border border-blue-200 dark:border-blue-900 text-[#2D2119] dark:text-[#F7F2EC]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveLogistics}
                    disabled={isSavingLogistics}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1565C0] hover:bg-[#0D47A1] transition-colors"
                  >
                    {isSavingLogistics ? '...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>

            {logisticsSavedSuccess && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                ✓ Data kurir dan nomor resi berhasil diperbarui!
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7D6E63] dark:text-[#A89B8F]">
              Rincian Barang & Alokasi Cabang
            </div>
            <div className="rounded-xl border border-[#EADFD1] dark:border-[#382C24] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F0E8] dark:bg-[#1C1410] text-[#7D6E63] dark:text-[#A89B8F] font-semibold border-b border-[#EADFD1] dark:border-[#382C24]">
                  <tr>
                    <th className="py-2.5 px-3">Item / Produk</th>
                    <th className="py-2.5 px-3">Toko / Cabang</th>
                    {order.mode === 'gabung_nota' && <th className="py-2.5 px-3">PIC Pemilik</th>}
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Harga</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD1]/60 dark:divide-[#382C24]">
                  {order.items.map((it, idx) => (
                    <tr key={it.id || idx}>
                      <td className="py-2.5 px-3 font-medium text-[#2D2119] dark:text-[#F7F2EC]">
                        {it.name}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                        {it.store}
                      </td>
                      {order.mode === 'gabung_nota' && (
                        <td className="py-2.5 px-3 font-semibold text-amber-700 dark:text-amber-400 text-[11px]">
                          {it.ownerName || '-'}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-center">{it.qty}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(it.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#2D2119] dark:text-[#F7F2EC]">
                        {formatRupiah(it.qty * it.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gabung Nota Breakdown per PIC if applicable */}
          {ownersBreakdown && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1.5 text-xs">
              <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Users size={13} />
                <span>Pembagian Tagihan Nota Gabungan per Anggota:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {Object.entries(ownersBreakdown).map(([owner, total]) => (
                  <div
                    key={owner}
                    className="flex justify-between p-2 rounded-lg bg-white/70 dark:bg-[#211813] border border-amber-200/60 dark:border-amber-900/60"
                  >
                    <span className="font-medium text-amber-950 dark:text-amber-200">{owner}</span>
                    <span className="font-bold text-amber-950 dark:text-amber-100">
                      {formatRupiah(total as number)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Recap & Balance Stack */}
          <div className="p-4 rounded-xl bg-[#F5F0E8]/70 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] space-y-2 text-xs">
            <div className="flex justify-between text-[#7D6E63] dark:text-[#A89B8F]">
              <span>Subtotal Barang:</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Diskon:</span>
                <span>- {formatRupiah(order.discount)}</span>
              </div>
            )}
            {order.applyTax && (
              <>
                <div className="flex justify-between text-[#7D6E63] dark:text-[#A89B8F]">
                  <span>Dasar Pengenaan Pajak (DPP):</span>
                  <span>{formatRupiah(order.dppAmount || (order.subtotal - order.discount))}</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>PPN Terutang ({order.taxRate || 11}%):</span>
                  <span>+{formatRupiah(order.taxAmount || 0)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-[#7D6E63] dark:text-[#A89B8F]">
              <span>Ongkos Kirim ({order.courier || 'Kurir'}):</span>
              <span>+ {formatRupiah(order.shippingCost)}</span>
            </div>
            <div className="pt-2 border-t border-[#EADFD1] dark:border-[#382C24] flex justify-between text-sm font-bold text-[#2D2119] dark:text-[#F7F2EC]">
              <span>Grand Total:</span>
              <span>{formatRupiah(order.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
              <span>Sudah Dibayar:</span>
              <span>{formatRupiah(order.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold text-sm">
              <span>Sisa Tagihan (Piutang):</span>
              <span>{formatRupiah(order.remainingAmount)}</span>
            </div>
          </div>

          {/* Payment History Timeline */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7D6E63] dark:text-[#A89B8F] flex items-center justify-between">
              <span>Riwayat Pembayaran & Cicilan ({order.payments.length})</span>
              {order.remainingAmount > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPaymentModal(order);
                  }}
                  className="text-xs font-bold text-[#E65100] dark:text-[#FFB74D] hover:underline"
                >
                  + Catat Pembayaran Baru
                </button>
              )}
            </div>

            {order.payments.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#7D6E63] dark:text-[#A89B8F] bg-[#F5F0E8]/40 dark:bg-[#1A130F] rounded-xl border border-[#EADFD1] dark:border-[#2C211A]">
                Belum ada riwayat pembayaran yang tercatat.
              </div>
            ) : (
              <div className="space-y-2">
                {order.payments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>{pay.method}</span>
                        {pay.receiptNumber && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                            ({pay.receiptNumber})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F] mt-0.5">
                        {formatDate(pay.date)} • {pay.notes || 'Pembayaran'}
                      </div>
                    </div>
                    <div className="text-right font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                      {formatRupiah(pay.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Bottom Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {order.remainingAmount > 0 ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenPaymentModal(order);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0D47A1] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] shadow-md shadow-[#0D47A1]/20 cursor-pointer"
              >
                <CreditCard size={15} />
                <span>Catat Pembayaran Sekarang</span>
              </button>
            ) : (
              <div className="flex-1 py-2.5 rounded-xl text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300">
                ✓ Tagihan Pesanan Telah Lunas Penuh
              </div>
            )}

            {onOpenWhatsAppReminder && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWhatsAppReminder(order);
                }}
                className="py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Kirim WA Pelanggan</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-xs font-semibold text-[#7D6E63] dark:text-[#C9BDB3] hover:text-[#2D2119] dark:hover:text-[#F7F2EC] bg-[#F5F0E8] dark:bg-[#1A130F] hover:bg-[#EADFD1] dark:hover:bg-[#2A1F18] border border-[#EADFD1] dark:border-[#382C24] transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
