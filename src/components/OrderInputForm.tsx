import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Receipt,
  Users,
  User,
  Store,
  Calendar,
  Phone,
  FileText,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Percent,
} from 'lucide-react';
import { Order, OrderItem, OrderMode, StoreLocation, ShipmentStatus, Customer } from '../types';
import { STORE_LOCATIONS } from '../data/mockOrders';
import { formatRupiah } from '../lib/formatters';
import { CustomerInfoCard } from './CustomerInfoCard';
import { AIOrderParserCard } from './AIOrderParserCard';
import { ParsedOrderData } from '../lib/orderParser';

interface OrderInputFormProps {
  onSaveOrder: (newOrder: Order) => Promise<void>;
  onCancel: () => void;
  customers?: Customer[];
  orders?: Order[];
  preselectedCustomer?: Customer | null;
  onOpenCustomerDetail?: (customer: Customer) => void;
}

export const OrderInputForm: React.FC<OrderInputFormProps> = ({
  onSaveOrder,
  onCancel,
  customers = [],
  orders = [],
  preselectedCustomer = null,
  onOpenCustomerDetail,
}) => {
  const [mode, setMode] = useState<OrderMode>('mandiri');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(preselectedCustomer);
  const [customerName, setCustomerName] = useState(preselectedCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(
    preselectedCustomer?.phone ? preselectedCustomer.phone.replace(/^62/, '') : ''
  );
  const [customerCompany, setCustomerCompany] = useState(preselectedCustomer?.company || '');
  const [customerNpwp, setCustomerNpwp] = useState(preselectedCustomer?.npwp || '');
  const [destinationTag, setDestinationTag] = useState(
    preselectedCustomer?.address || 'Gudang Utama JKT'
  );
  const [notes, setNotes] = useState('');
  const [shippingCost, setShippingCost] = useState<number>(50000);
  const [discount, setDiscount] = useState<number>(0);

  // Government Tax (PPN) States per Regulation
  const [applyTax, setApplyTax] = useState<boolean>(false);
  const [taxRate, setTaxRate] = useState<number>(11); // 11% (UU HPP) or 12% (2025 Regulation)

  // Logistics & Expedition states
  const [courier, setCourier] = useState<string>('Dakota Cargo');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>('diproses');

  // Due Date defaults to 7 days from now
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [dueDate, setDueDate] = useState(defaultDueDate);

  // Initial payment selection
  const [paymentOption, setPaymentOption] = useState<'belum_lunas' | 'dp' | 'lunas'>('dp');
  const [customDPAmount, setCustomDPAmount] = useState<number>(0);

  // Items state
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'item-1',
      name: 'Kabel Tembaga Industri 50m Roll',
      qty: 2,
      unitPrice: 450000,
      store: STORE_LOCATIONS[0].name,
      ownerName: 'Divisi Operasional',
    },
  ]);

  // Double-submit prevention states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  // Add new item row
  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      name: '',
      qty: 1,
      unitPrice: 0,
      store: STORE_LOCATIONS[0].name,
      ownerName: mode === 'gabung_nota' ? 'Klien Baru' : undefined,
    };
    setItems([...items, newItem]);
  };

  // Remove item row
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('Minimal 1 barang harus dimasukkan.');
      return;
    }
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Update item field
  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Tax and Grand Total Calculations (PPN / DPP)
  const subtotal = items.reduce((sum, item) => sum + (item.qty * (item.unitPrice || 0)), 0);
  const dppAmount = Math.max(0, subtotal - (discount || 0));
  const taxAmount = applyTax ? Math.round(dppAmount * (taxRate / 100)) : 0;
  const grandTotal = Math.max(0, dppAmount + taxAmount + (shippingCost || 0));

  let paidAmount = 0;
  if (paymentOption === 'lunas') {
    paidAmount = grandTotal;
  } else if (paymentOption === 'dp') {
    paidAmount = customDPAmount > 0 ? Math.min(customDPAmount, grandTotal) : Math.round(grandTotal * 0.5);
  } else {
    paidAmount = 0;
  }

  const remainingAmount = Math.max(0, grandTotal - paidAmount);

  // Customer Selection Handlers
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone.replace(/^62/, ''));
    setCustomerCompany(cust.company || '');
    if (cust.npwp) {
      setCustomerNpwp(cust.npwp);
    }
    setDestinationTag(cust.address || cust.city || 'Gudang Utama JKT');
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
  };

  // AI Order Auto-Fill Handler
  const handleApplyAIParsedOrder = (parsed: ParsedOrderData) => {
    if (parsed.customerName) {
      setCustomerName(parsed.customerName);
    }
    if (parsed.customerPhone) {
      setCustomerPhone(parsed.customerPhone);
    }
    if (parsed.customerCompany) {
      setCustomerCompany(parsed.customerCompany);
    }
    if (parsed.destinationTag) {
      setDestinationTag(parsed.destinationTag);
    }
    if (parsed.customerNpwp) {
      setCustomerNpwp(parsed.customerNpwp);
      setApplyTax(true);
      setTaxRate(11);
    } else if (parsed.applyTax !== undefined) {
      setApplyTax(parsed.applyTax);
      if (parsed.taxRate) setTaxRate(parsed.taxRate);
    }
    if (parsed.courier) {
      setCourier(parsed.courier);
    }
    if (parsed.notes) {
      setNotes((prev) => (prev ? `${prev} | ${parsed.notes}` : parsed.notes || ''));
    }
    if (parsed.items && parsed.items.length > 0) {
      const newItems: OrderItem[] = parsed.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        name: it.name,
        qty: it.qty || 1,
        unitPrice: it.unitPrice || 0,
        store: STORE_LOCATIONS[0].name,
        ownerName: mode === 'gabung_nota' ? (parsed.customerName || 'Klien Baru') : undefined,
      }));
      setItems(newItems);
    }

    // Auto-match with existing customer if available
    if (customers.length > 0) {
      const cleanInputPhone = (parsed.customerPhone || '').replace(/\D/g, '');
      const matched = customers.find(
        (c) =>
          (cleanInputPhone && c.phone.replace(/\D/g, '').endsWith(cleanInputPhone.slice(-8))) ||
          (parsed.customerName && c.name.toLowerCase() === parsed.customerName.toLowerCase())
      );
      if (matched) {
        setSelectedCustomer(matched);
      }
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    if (!customerName.trim()) {
      setErrorMessage('Nama Pelanggan / PIC wajib diisi.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Nomor Telepon / WhatsApp wajib diisi.');
      return;
    }
    if (items.some((it) => !it.name.trim())) {
      setErrorMessage('Semua nama barang wajib diisi.');
      return;
    }
    if (items.some((it) => it.qty <= 0 || it.unitPrice < 0)) {
      setErrorMessage('Kuantitas barang harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Auto-generate invoice number
      const invoiceNumber = `INV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

      const initialStatus =
        remainingAmount === 0 ? 'lunas' : paidAmount > 0 ? 'dp' : 'belum_lunas';

      const rawPhone = customerPhone.trim().replace(/\D/g, '');
      const formattedPhone = rawPhone.startsWith('62')
        ? rawPhone
        : rawPhone.startsWith('0')
        ? '62' + rawPhone.substring(1)
        : '62' + rawPhone;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        invoiceNumber,
        customerName: customerName.trim(),
        customerPhone: formattedPhone,
        customerCompany: customerCompany.trim() || undefined,
        customerAddress: selectedCustomer?.address || destinationTag,
        customerNpwp: customerNpwp.trim() || undefined,
        mode,
        createdAt: new Date().toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        items,
        shippingCost: shippingCost || 0,
        discount: discount || 0,
        notes: notes.trim(),
        subtotal,
        applyTax,
        taxRate: applyTax ? taxRate : 0,
        dppAmount,
        taxAmount,
        grandTotal,
        paidAmount,
        remainingAmount,
        status: initialStatus,
        payments:
          paidAmount > 0
            ? [
                {
                  id: `pay-${Date.now()}`,
                  date: new Date().toISOString(),
                  amount: paidAmount,
                  method: 'Transfer BCA',
                  notes: paymentOption === 'lunas' ? 'Pelunasan awal saat order' : 'DP Order Masuk',
                },
              ]
            : [],
        isWithdrawable: initialStatus === 'lunas',
        destinationTag,
        courier: courier || 'Dakota Cargo',
        trackingNumber: trackingNumber.trim() || undefined,
        shipmentStatus: shipmentStatus || 'diproses',
      };

      await onSaveOrder(newOrder);
      setSuccessBanner(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pesanan. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  // Group items by owner for Gabung Nota breakdown
  const ownersBreakdown = items.reduce((acc, item) => {
    const owner = item.ownerName || 'Tanpa Nama';
    if (!acc[owner]) {
      acc[owner] = { total: 0, items: [] };
    }
    acc[owner].total += item.qty * item.unitPrice;
    acc[owner].items.push(item);
    return acc;
  }, {} as Record<string, { total: number; items: OrderItem[] }>);

  // Group items by store for Multi-store breakdown
  const storesBreakdown = items.reduce((acc, item) => {
    const store = item.store || 'Toko Utama';
    if (!acc[store]) {
      acc[store] = 0;
    }
    acc[store] += item.qty * item.unitPrice;
    return acc;
  }, {} as Record<string, number>);

  if (successBanner) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-emerald-500/30 text-center shadow-lg">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#2D2119] dark:text-[#F7F2EC]">
          Pesanan Berhasil Diterbitkan!
        </h2>
        <p className="text-sm text-[#7D6E63] dark:text-[#A89B8F] mt-2 mb-6">
          Invoice telah tersimpan di Database Pesanan dan siap ditagihkan atau dicetak.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              setSuccessBanner(false);
              setIsSubmitting(false);
              setCustomerName('');
              setCustomerPhone('');
              setNotes('');
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F5F0E8] dark:bg-[#2A1F18] text-[#2D2119] dark:text-[#F7F2EC] border border-[#EADFD1] dark:border-[#382C24]"
          >
            + Input Pesanan Lain
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#0D47A1] to-[#1565C0] shadow-md shadow-[#0D47A1]/20"
          >
            Buka Database Pesanan
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Top Title & Mode Selector with minimalist round back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFD1] dark:border-[#382C24]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-cyan-400/50 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 shadow-[0_0_14px_rgba(6,182,212,0.25)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Formulir Pesanan Baru
          </h2>
        </div>

        {/* Order Mode Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-[#EADFD1]/60 dark:bg-[#1A130F] border border-[#D8CBBC] dark:border-[#382C24] shrink-0">
          <button
            type="button"
            onClick={() => setMode('mandiri')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'mandiri'
                ? 'bg-white dark:bg-[#261C16] text-[#0D47A1] dark:text-[#90CAF9] shadow-sm border border-[#EADFD1] dark:border-[#3E3027]'
                : 'text-[#7D6E63] dark:text-[#A89B8F] hover:text-[#2D2119]'
            }`}
          >
            <User size={13} />
            <span>Bayar Mandiri</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('gabung_nota')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'gabung_nota'
                ? 'bg-white dark:bg-[#261C16] text-[#E65100] dark:text-[#FFB74D] shadow-sm border border-[#EADFD1] dark:border-[#3E3027]'
                : 'text-[#7D6E63] dark:text-[#A89B8F] hover:text-[#2D2119]'
            }`}
          >
            <Users size={13} />
            <span>Gabung Nota</span>
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* AI Order Parser: Compact 1-line horizontal strip */}
      <AIOrderParserCard onParsedDataApplied={handleApplyAIParsedOrder} />

      {/* 3-COLUMN SEJAJAR HORIZONTAL GRID (Bebas Scroll Panjang) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= KOLOM 1: DATA PEMESAN (4 COLS) ================= */}
        <div className="lg:col-span-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#EADFD1] dark:border-[#382C24]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2119] dark:text-[#F7F2EC] flex items-center gap-1.5">
              <User size={14} className="text-[#1565C0]" />
              <span>Data Pemesan</span>
            </h3>
            {selectedCustomer && (
              <button
                type="button"
                onClick={handleClearSelectedCustomer}
                className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Ganti Pelanggan
              </button>
            )}
          </div>

          {/* Quick Select from Registered Customers */}
          {customers.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#7D6E63] dark:text-[#A89B8F]">
                Pilih Pelanggan Terdaftar
              </label>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const found = customers.find((c) => c.id === e.target.value);
                  if (found) {
                    handleSelectCustomer(found);
                  } else {
                    handleClearSelectedCustomer();
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#F5F0E8]/70 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
              >
                <option value="">-- Pelanggan Baru / Ketik Manual --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''} - {c.city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nama Pelanggan */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Nama Pelanggan / PIC <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (selectedCustomer && e.target.value !== selectedCustomer.name) {
                  const matched = customers.find(
                    (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
                  );
                  setSelectedCustomer(matched || null);
                }
              }}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0] text-[#2D2119] dark:text-[#F7F2EC]"
            />
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Nomor WhatsApp / HP <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                +62
              </span>
              <input
                type="tel"
                required
                placeholder="81234567890"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-11 pr-3 py-2 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0] text-[#2D2119] dark:text-[#F7F2EC]"
              />
            </div>
          </div>

          {/* Kartu Ringkas Pelanggan Terpilih */}
          {selectedCustomer && (
            <CustomerInfoCard
              customer={selectedCustomer}
              orders={orders}
              onClearSelection={handleClearSelectedCustomer}
              onOpenCustomerDetail={onOpenCustomerDetail}
            />
          )}

          {/* Perusahaan */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Perusahaan / Instansi (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: PT Multi Niaga"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0] text-[#2D2119] dark:text-[#F7F2EC]"
            />
          </div>

          {/* Jatuh Tempo Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Jatuh Tempo Pembayaran
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0] text-[#2D2119] dark:text-[#F7F2EC]"
            />
          </div>

          {/* Alamat Pengiriman */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Alamat / Destinasi Pengiriman
            </label>
            <input
              type="text"
              placeholder="Contoh: Gudang Bintaro Sektor 7"
              value={destinationTag}
              onChange={(e) => setDestinationTag(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0] text-[#2D2119] dark:text-[#F7F2EC]"
            />
          </div>

          {/* Catatan Khusus */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2119] dark:text-[#F7F2EC] mb-1">
              Catatan Pesanan
            </label>
            <textarea
              rows={2}
              placeholder="Instruksi packing, no. PO..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
            />
          </div>
        </div>

        {/* ================= KOLOM 2: BARANG & LOGISTIK (5 COLS) ================= */}
        <div className="lg:col-span-5 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#EADFD1] dark:border-[#382C24]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2119] dark:text-[#F7F2EC] flex items-center gap-1.5">
              <Store size={14} className="text-[#E65100]" />
              <span>Daftar Barang ({items.length})</span>
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#1565C0] dark:text-[#90CAF9] bg-[#0D47A1]/10 hover:bg-[#0D47A1]/20 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Tambah</span>
            </button>
          </div>

          {/* List Barang */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-0.5">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7D6E63] dark:text-[#A89B8F]">
                    Item #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1565C0] dark:text-[#90CAF9]">
                      {formatRupiah(item.qty * item.unitPrice)}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                        title="Hapus barang"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Nama Barang */}
                <input
                  type="text"
                  required
                  placeholder="Nama barang / deskripsi produk..."
                  value={item.name}
                  onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
                />

                {/* Qty, Harga Satuan, Toko Asal & PIC */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <label className="block text-[10px] text-[#7D6E63] dark:text-[#A89B8F]">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleUpdateItem(idx, 'qty', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] text-center text-[#2D2119] dark:text-[#F7F2EC]"
                    />
                  </div>

                  <div className="col-span-5">
                    <label className="block text-[10px] text-[#7D6E63] dark:text-[#A89B8F]">Harga Satuan</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] text-right text-[#2D2119] dark:text-[#F7F2EC]"
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[10px] text-[#7D6E63] dark:text-[#A89B8F]">Toko Asal</label>
                    <select
                      value={item.store}
                      onChange={(e) => handleUpdateItem(idx, 'store', e.target.value)}
                      className="w-full px-1.5 py-1 rounded-lg text-xs bg-white dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC]"
                    >
                      {STORE_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {mode === 'gabung_nota' && (
                    <div className="col-span-12">
                      <input
                        type="text"
                        placeholder="Pemilik / PIC Item ini (Multi-Owner)..."
                        value={item.ownerName || ''}
                        onChange={(e) => handleUpdateItem(idx, 'ownerName', e.target.value)}
                        className="w-full px-2.5 py-1 rounded-lg text-xs bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-[#2D2119] dark:text-[#F7F2EC]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Logistik & Resi Section */}
          <div className="pt-2 border-t border-[#EADFD1] dark:border-[#382C24] space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7D6E63] dark:text-[#A89B8F] flex items-center gap-1.5">
              <Truck size={13} className="text-[#1565C0]" />
              <span>Logistik & Ekspedisi</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-0.5">
                  Kurir
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC]"
                >
                  <option value="Dakota Cargo">Dakota Cargo</option>
                  <option value="JNE Trucking">JNE Trucking</option>
                  <option value="SiCepat Cargo">SiCepat Cargo</option>
                  <option value="J&T Cargo">J&T Cargo</option>
                  <option value="Kurir Internal">Kurir Internal</option>
                  <option value="Ambil Sendiri">Ambil Sendiri</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-0.5">
                  Nomor Resi / AWB
                </label>
                <input
                  type="text"
                  placeholder="Contoh: DKT-8829"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg font-mono text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-0.5">
                  Status Kirim
                </label>
                <select
                  value={shipmentStatus}
                  onChange={(e: any) => setShipmentStatus(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC]"
                >
                  <option value="diproses">⚙️ Diproses</option>
                  <option value="siap_kirim">📦 Siap Kirim</option>
                  <option value="dikirim">🚚 Dikirim</option>
                  <option value="selesai">✓ Selesai</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ================= KOLOM 3: PAJAK & DRAFT FAKTUR (3 COLS) ================= */}
        <div className="lg:col-span-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-4 space-y-3 shadow-md sticky top-20">
          <div className="flex items-center justify-between pb-2 border-b border-[#EADFD1] dark:border-[#382C24]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2119] dark:text-[#F7F2EC] flex items-center gap-1.5">
              <Receipt size={14} className="text-emerald-600" />
              <span>Pajak & Faktur</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1565C0]/10 text-[#1565C0] dark:text-[#90CAF9]">
              {mode === 'mandiri' ? 'Mandiri' : 'Gabung'}
            </span>
          </div>

          {/* Toggle PPN */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Pajak PPN
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {applyTax && (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTaxRate(11)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                      taxRate === 11
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-[#1A130F] text-[#2D2119] dark:text-[#F7F2EC] border border-emerald-200 dark:border-emerald-900'
                    }`}
                  >
                    11%
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxRate(12)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                      taxRate === 12
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-[#1A130F] text-[#2D2119] dark:text-[#F7F2EC] border border-emerald-200 dark:border-emerald-900'
                    }`}
                  >
                    12%
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="NPWP/NIK (16 digit)..."
                  value={customerNpwp}
                  onChange={(e) => setCustomerNpwp(e.target.value)}
                  className="w-full px-2 py-1 text-[11px] font-mono rounded-lg bg-white dark:bg-[#1A130F] border border-emerald-300 dark:border-emerald-800 text-[#2D2119] dark:text-[#F7F2EC]"
                />
              </div>
            )}
          </div>

          {/* Ongkir & Diskon */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F]">
                Ongkir (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 rounded-lg text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-right text-[#2D2119] dark:text-[#F7F2EC]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F]">
                Diskon (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 rounded-lg text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-right text-[#2D2119] dark:text-[#F7F2EC]"
              />
            </div>
          </div>

          {/* Status Bayar Awal */}
          <div>
            <label className="block text-[10px] font-semibold text-[#7D6E63] dark:text-[#A89B8F] mb-0.5">
              Status Bayar Awal
            </label>
            <select
              value={paymentOption}
              onChange={(e: any) => setPaymentOption(e.target.value)}
              className="w-full px-2 py-1 rounded-lg text-xs bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC]"
            >
              <option value="belum_lunas">Belum Bayar (Tempo 100%)</option>
              <option value="dp">Uang Muka (DP)</option>
              <option value="lunas">Lunas Penuh (100%)</option>
            </select>
          </div>

          {/* Rincian Finansial Faktur */}
          <div className="py-2 space-y-1.5 text-xs border-t border-b border-[#EADFD1] dark:border-[#382C24]">
            <div className="flex justify-between text-[#7D6E63] dark:text-[#A89B8F]">
              <span>Subtotal:</span>
              <span className="font-mono">{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon:</span>
                <span className="font-mono">-{formatRupiah(discount)}</span>
              </div>
            )}
            {applyTax && (
              <>
                <div className="flex justify-between text-[#7D6E63] dark:text-[#A89B8F]">
                  <span>DPP:</span>
                  <span className="font-mono">{formatRupiah(dppAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>PPN ({taxRate}%):</span>
                  <span className="font-mono">+{formatRupiah(taxAmount)}</span>
                </div>
              </>
            )}
            {shippingCost > 0 && (
              <div className="flex justify-between text-[#7D6E63] dark:text-[#A89B8F]">
                <span>Ongkir:</span>
                <span className="font-mono">+{formatRupiah(shippingCost)}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-1 pb-1">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#7D6E63] dark:text-[#A89B8F]">Grand Total</span>
              <span className="text-lg font-black font-mono text-[#2D2119] dark:text-[#F7F2EC]">
                {formatRupiah(grandTotal)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#E65100] dark:text-[#FFB74D] font-semibold mt-1">
              <span>Sisa Piutang:</span>
              <span className="font-mono">{formatRupiah(remainingAmount)}</span>
            </div>
          </div>

          {/* Multi-Store / Gabung Nota Preview if needed */}
          {mode === 'gabung_nota' && Object.keys(ownersBreakdown).length > 0 && (
            <div className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1 text-[11px]">
              <div className="font-bold text-amber-800 dark:text-amber-300">Rincian PIC:</div>
              {Object.entries(ownersBreakdown).map(([owner, data]: [string, { total: number; items: OrderItem[] }]) => (
                <div key={owner} className="flex justify-between">
                  <span className="truncate max-w-[120px]">{owner}</span>
                  <span className="font-mono font-bold">{formatRupiah(data.total)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tombol Simpan Pesanan (Penerbitan Faktur) */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0D47A1] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] shadow-md shadow-[#0D47A1]/25 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Menerbitkan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Simpan & Terbitkan Faktur</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
