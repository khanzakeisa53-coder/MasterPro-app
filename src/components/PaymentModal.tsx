import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, Receipt, CreditCard, ShieldCheck } from 'lucide-react';
import { Order, PaymentRecord } from '../types';
import { formatRupiah } from '../lib/formatters';

interface PaymentModalProps {
  order: Order | null;
  onClose: () => void;
  onSavePayment: (orderId: string, payment: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  onClose,
  onSavePayment,
}) => {
  if (!order) return null;

  const [amount, setAmount] = useState<number>(order.remainingAmount);
  const [method, setMethod] = useState<PaymentRecord['method']>('Transfer BCA');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const remainingAfterPayment = Math.max(0, order.remainingAmount - amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Nominal pembayaran harus lebih dari 0.');
      return;
    }

    setIsProcessing(true);

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      amount,
      method,
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim() || 'Pembayaran angsuran/pelunasan',
    };

    setTimeout(() => {
      onSavePayment(order.id, newPayment);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFD1] dark:border-[#382C24]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                Catat Pembayaran / Cicilan
              </h3>
              <p className="text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                {order.invoiceNumber} - {order.customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7D6E63] dark:text-[#A89B8F] hover:bg-[#F5F0E8] dark:hover:bg-[#2C211A] hover:text-[#2D2119] dark:hover:text-[#F7F2EC] transition-colors cursor-pointer"
            title="Tutup (X)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Balance Summary */}
        <div className="p-3 rounded-xl bg-[#F5F0E8]/70 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] flex justify-between text-xs">
          <div>
            <span className="text-[#7D6E63] dark:text-[#A89B8F] block">Sisa Piutang Saat Ini:</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-sans">
              {formatRupiah(order.remainingAmount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[#7D6E63] dark:text-[#A89B8F] block">Total Faktur:</span>
            <span className="font-semibold text-[#2D2119] dark:text-[#F7F2EC]">
              {formatRupiah(order.grandTotal)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Nominal Pembayaran (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1000"
              max={order.remainingAmount}
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] text-right focus:outline-none focus:border-[#1565C0]"
            />
            {/* Quick buttons & shortcut chips */}
            <div className="space-y-1.5 mt-2">
              <span className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F] font-semibold uppercase tracking-wider block">
                Shortcut Nominal Cepat Kasir:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {/* 100% Lunas */}
                <button
                  type="button"
                  onClick={() => setAmount(order.remainingAmount)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    amount === order.remainingAmount
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  ⚡ Bayar Lunas (100%)
                </button>

                {/* 50% DP */}
                {order.remainingAmount > 100000 && (
                  <button
                    type="button"
                    onClick={() => setAmount(Math.round(order.remainingAmount * 0.5))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      amount === Math.round(order.remainingAmount * 0.5)
                        ? 'bg-[#1565C0] text-white shadow-xs'
                        : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    50% DP ({formatRupiah(Math.round(order.remainingAmount * 0.5))})
                  </button>
                )}

                {/* Pembulatan 100rb terdekat if not already an even 100k */}
                {order.remainingAmount % 100000 !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const rounded = Math.floor(order.remainingAmount / 100000) * 100000;
                      if (rounded > 0) setAmount(rounded);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F5F0E8] dark:bg-[#2C211A] text-[#2D2119] dark:text-[#F7F2EC] border border-[#EADFD1] dark:border-[#382C24] hover:bg-[#EADFD1]"
                  >
                    Bulatkan ({formatRupiah(Math.floor(order.remainingAmount / 100000) * 100000)})
                  </button>
                )}

                {/* Preset increments for convenience */}
                {[500000, 1000000, 2000000, 5000000].map((preset) => {
                  if (preset >= order.remainingAmount || preset === Math.round(order.remainingAmount * 0.5)) return null;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                        amount === preset
                          ? 'bg-[#E65100] text-white'
                          : 'bg-[#F5F0E8]/70 dark:bg-[#1A130F] text-[#7D6E63] dark:text-[#A89B8F] border border-[#EADFD1] dark:border-[#382C24] hover:bg-[#EADFD1]/60'
                      }`}
                    >
                      {formatRupiah(preset)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Metode Pembayaran
            </label>
            <select
              value={method}
              onChange={(e: any) => setMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
            >
              <option value="Transfer BCA">Transfer BCA</option>
              <option value="Transfer Mandiri">Transfer Mandiri</option>
              <option value="Transfer BRI">Transfer BRI</option>
              <option value="QRIS">QRIS Dinamis / Statis</option>
              <option value="Cash">Tunai / Cash Langsung</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Nomor Resi / Referensi Bank (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: BCA-99210291"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pelunasan sisa tahap 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
            />
          </div>

          {/* After Payment Preview */}
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex justify-between text-xs">
            <span className="text-emerald-800 dark:text-emerald-300">
              Sisa Setelah Pembayaran Ini:
            </span>
            <span className="font-bold text-emerald-900 dark:text-emerald-200">
              {formatRupiah(remainingAfterPayment)}
              {remainingAfterPayment === 0 && ' (LUNAS)'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-[#7D6E63] dark:text-[#A89B8F] hover:text-[#2D2119] dark:hover:text-[#F7F2EC] bg-[#F5F0E8] dark:bg-[#1A130F] hover:bg-[#EADFD1] dark:hover:bg-[#2C211A] border border-[#EADFD1] dark:border-[#382C24] transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Simpan Pembayaran</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
