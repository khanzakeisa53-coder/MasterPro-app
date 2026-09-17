import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink, ShieldCheck, FileText } from 'lucide-react';
import { Order } from '../types';
import { formatRupiah, formatDate } from '../lib/formatters';

interface WhatsAppPreviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

type TemplateType = 'ramah' | 'hari_h' | 'terlambat' | 'kirim_resi';

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const [templateType, setTemplateType] = useState<TemplateType>('ramah');
  const [bankAccount, setBankAccount] = useState(
    'BCA 8892-019-221 a/n PT Multi Niaga Nusantara / Admin Keuangan'
  );
  const [copied, setCopied] = useState(false);

  // Tax and DPP calculation
  const dpp = order.dppAmount ?? Math.max(0, order.subtotal - order.discount);
  const isTaxActive = order.applyTax ?? false;
  const taxRateVal = order.taxRate || 11;
  const taxAmt = order.taxAmount ?? (isTaxActive ? Math.round(dpp * (taxRateVal / 100)) : 0);

  const itemsList = order.items.map((it) => `- ${it.name} (${it.qty}x) @ ${formatRupiah(it.unitPrice)}`).join('\n');
  const dueDateStr = formatDate(order.dueDate);
  const grandStr = formatRupiah(order.grandTotal);
  const sisaStr = formatRupiah(order.remainingAmount);

  // Tax snippet for message
  const taxSnippet = isTaxActive
    ? `\n- DPP: ${formatRupiah(dpp)}\n- PPN (${taxRateVal}%): ${formatRupiah(taxAmt)}${order.customerNpwp ? `\n- NPWP/NIK: ${order.customerNpwp}` : ''}`
    : '';

  const shippingSnippet =
    order.trackingNumber || order.courier
      ? `\n\n*Informasi Logistik:*\n- Kurir: ${order.courier || 'Dakota Cargo'}\n- Resi/AWB: *${order.trackingNumber || 'Dalam proses pickup'}*\n- Destinasi: ${order.destinationTag}`
      : '';

  const getMessageText = () => {
    switch (templateType) {
      case 'kirim_resi':
        return `Halo Bapak/Ibu ${order.customerName},\n\nKabar baik! Pesanan Anda dengan No. Faktur *${order.invoiceNumber}* telah diperbarui status ekspedisinya:\n\n*Kurir:* ${order.courier || 'Dakota Cargo'}\n*Nomor Resi / AWB:* ${order.trackingNumber || '(Dalam proses penerbitan)'}\n*Destinasi:* ${order.destinationTag}\n*Status:* ${order.shipmentStatus === 'dikirim' ? 'Sedang Dikirim' : 'Siap Dikirim'}\n\n*Rincian Barang:*\n${itemsList}\n\n*Status Tagihan:*\n- Grand Total: ${grandStr}${taxSnippet}\n- Sisa Tagihan: ${sisaStr}\n\nTerima kasih atas kepercayaannya berbelanja di Pesanan Master PRO! 📦✨`;

      case 'hari_h':
        return `Halo Bapak/Ibu ${order.customerName},\n\nKami menginformasikan bahwa faktur pesanan *${order.invoiceNumber}* jatuh tempo pada *HARI INI (${dueDateStr})*:\n\n*Total Tagihan:* ${grandStr}${taxSnippet}\n*Sisa Piutang:* ${sisaStr}\n\n*Rincian Barang:*\n${itemsList}${shippingSnippet}\n\nPembayaran dapat disalurkan melalui:\n${bankAccount}\n\nMohon mengirimkan bukti transfer jika sudah melakukan transaksi. Terima kasih!`;

      case 'terlambat':
        return `Yth. Bapak/Ibu ${order.customerName},\n\nKami mengingatkan kembali bahwa tagihan faktur *${order.invoiceNumber}* telah melewati batas jatuh tempo per tanggal *${dueDateStr}*:\n\n*Sisa Tunggakan:* *${sisaStr}* (dari total ${grandStr})${taxSnippet}\n\nMohon bantuannya untuk segera melakukan penyelesaian pembayaran melalui:\n${bankAccount}\n\nApabila pembayaran telah diselesaikan, mohon abaikan pesan ini atau kirimkan bukti setorannya. Terima kasih atas kerja samanya.`;

      case 'ramah':
      default:
        return `Halo Bapak/Ibu ${order.customerName},\n\nSemoga hari Anda menyenangkan. Kami dari bagian keuangan menginformasikan rincian faktur pesanan Anda:\n\n*No. Invoice:* ${order.invoiceNumber}\n*Total Tagihan:* ${grandStr}${taxSnippet}\n*Sisa Belum Lunas:* ${sisaStr}\n*Jatuh Tempo:* ${dueDateStr}${shippingSnippet}\n\n*Rincian Barang:*\n${itemsList}\n\nPembayaran dapat ditransfer ke:\n${bankAccount}\n\nMohon konfirmasi bukti transfer jika sudah menyelesaikan pembayaran. Terima kasih atas kerjasamanya! 🙏`;
    }
  };

  const message = getMessageText();

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Top Header with explicit Close X */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFD1] dark:border-[#382C24]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageCircle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                Pratinjau Pesan WhatsApp
              </h3>
              <p className="text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                {order.invoiceNumber} • {order.customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7D6E63] dark:text-[#A89B8F] hover:bg-[#F5F0E8] dark:hover:bg-[#2C211A] hover:text-[#2D2119] dark:hover:text-[#F7F2EC] transition-colors cursor-pointer"
            title="Tutup Pratinjau WhatsApp"
          >
            <X size={18} />
          </button>
        </div>

        {/* Financial & Tax Ribbon */}
        <div className="p-3 rounded-xl bg-[#F5F0E8]/70 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] flex flex-wrap justify-between items-center text-xs gap-2">
          <div>
            <span className="text-[#7D6E63] dark:text-[#A89B8F] block">Sisa Tagihan Pelanggan:</span>
            <span className="text-sm font-bold text-[#E65100] dark:text-[#FFB74D]">
              {formatRupiah(order.remainingAmount)}
            </span>
          </div>
          {isTaxActive && (
            <div className="text-right">
              <span className="text-[#7D6E63] dark:text-[#A89B8F] block">PPN Terutang ({taxRateVal}%):</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {formatRupiah(taxAmt)}
              </span>
            </div>
          )}
          <div>
            <span className="text-[#7D6E63] dark:text-[#A89B8F] block">No. Tujuan WA:</span>
            <span className="font-mono font-semibold text-[#1565C0] dark:text-[#90CAF9]">
              +{order.customerPhone}
            </span>
          </div>
        </div>

        {/* Template Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1.5">
            Pilih Format Pesan WhatsApp:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'ramah', label: '1. Ramah & Rinci' },
              { id: 'hari_h', label: '2. Jatuh Tempo' },
              { id: 'terlambat', label: '3. Teguran' },
              { id: 'kirim_resi', label: '4. Resi Logistik' },
            ].map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplateType(tpl.id as TemplateType)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
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
          <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
            Rekening Pembayaran:
          </label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
          />
        </div>

        {/* Message Textarea */}
        <div>
          <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
            Isi Pesan WhatsApp Otomatis:
          </label>
          <textarea
            rows={7}
            readOnly
            value={message}
            className="w-full p-3 rounded-xl text-xs font-mono bg-[#F5F0E8]/70 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] leading-relaxed resize-none"
          />
        </div>

        {/* Action Buttons with explicit Tutup button */}
        <div className="pt-2 border-t border-[#EADFD1] dark:border-[#382C24] flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="order-3 sm:order-1 px-5 py-2.5 rounded-xl text-xs font-semibold text-[#7D6E63] dark:text-[#C9BDB3] hover:text-[#2D2119] dark:hover:text-[#F7F2EC] bg-[#F5F0E8] dark:bg-[#1A130F] hover:bg-[#EADFD1] dark:hover:bg-[#261C16] border border-[#EADFD1] dark:border-[#382C24] transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="order-2 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-[#F5F0E8] dark:bg-[#2A1F18] text-[#2D2119] dark:text-[#F7F2EC] border border-[#EADFD1] dark:border-[#382C24] hover:bg-[#EADFD1]/60 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin ke Clipboard' : 'Salin Pesan'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="order-1 sm:order-3 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <MessageCircle size={15} />
            <span>Kirim WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
