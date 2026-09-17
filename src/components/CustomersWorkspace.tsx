import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  Building2,
  MapPin,
  Phone,
  Wallet,
  ShoppingBag,
  ExternalLink,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
  UserPlus,
  ArrowLeft,
} from 'lucide-react';
import { Customer, Order } from '../types';
import { formatRupiah, formatDate } from '../lib/formatters';

interface CustomersWorkspaceProps {
  customers: Customer[];
  orders: Order[];
  onSelectCustomer: (customer: Customer) => void;
  onNavigateToNewOrderWithCustomer: (customer: Customer) => void;
  onAddNewCustomer: (customer: Customer) => void;
  onBackToDashboard?: () => void;
}

export const CustomersWorkspace: React.FC<CustomersWorkspaceProps> = ({
  customers,
  orders,
  onSelectCustomer,
  onNavigateToNewOrderWithCustomer,
  onAddNewCustomer,
  onBackToDashboard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid' | 'vip' | 'grosir' | 'retail'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // Calculate accumulated stats for each customer
  const enrichedCustomers = useMemo(() => {
    return customers.map((cust) => {
      const custOrders = orders.filter(
        (o) =>
          o.customerName.toLowerCase().includes(cust.name.toLowerCase()) ||
          cust.name.toLowerCase().includes(o.customerName.toLowerCase()) ||
          (cust.company &&
            o.customerCompany &&
            o.customerCompany.toLowerCase().includes(cust.company.toLowerCase())) ||
          (o.customerPhone &&
            cust.phone &&
            o.customerPhone.replace(/\D/g, '') === cust.phone.replace(/\D/g, ''))
      );

      const totalSpend = custOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      const totalUnpaid = custOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
      const ordersCount = custOrders.length;
      const hasOverdue = custOrders.some((o) => o.status === 'overdue');

      return {
        ...cust,
        totalSpend,
        totalUnpaid,
        ordersCount,
        hasOverdue,
      };
    });
  }, [customers, orders]);

  // Overall workspace stats
  const totalCustomers = customers.length;
  const customersWithUnpaid = enrichedCustomers.filter((c) => c.totalUnpaid > 0).length;
  const totalAllUnpaid = enrichedCustomers.reduce((sum, c) => sum + c.totalUnpaid, 0);
  const totalAllSpend = enrichedCustomers.reduce((sum, c) => sum + c.totalSpend, 0);

  // Filtered list
  const filteredCustomers = enrichedCustomers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.company && cust.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cust.phone.includes(searchTerm) ||
      cust.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'unpaid') return cust.totalUnpaid > 0;
    if (statusFilter === 'paid') return cust.totalUnpaid === 0;
    if (statusFilter === 'vip') {
      return (
        cust.totalSpend >= 20000000 ||
        (cust.company && /cv|pt|distributor|utama|group/i.test(cust.company)) ||
        (cust.notes && /vip|prioritas/i.test(cust.notes))
      );
    }
    if (statusFilter === 'grosir') {
      return (
        (cust.company && /grosir|toko|distributor|mart/i.test(cust.company)) ||
        cust.ordersCount >= 2 ||
        (cust.notes && /grosir/i.test(cust.notes))
      );
    }
    if (statusFilter === 'retail') {
      return !cust.company || cust.ordersCount <= 1;
    }

    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      alert('Nama dan Nomor WhatsApp wajib diisi.');
      return;
    }

    const cleanPhone = newCustPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      company: newCustCompany.trim() || undefined,
      phone: formattedPhone,
      address: newCustAddress.trim() || 'Alamat belum dilengkapi',
      city: newCustCity.trim() || 'Jakarta',
      notes: newCustNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddNewCustomer(newCustomer);
    setShowAddModal(false);
    // Reset form
    setNewCustName('');
    setNewCustCompany('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustCity('');
    setNewCustNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-purple-400/50 dark:border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 shadow-[0_0_14px_rgba(139,92,246,0.25)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft size={18} strokeWidth={2.4} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
                Direktori & Manajemen Pelanggan
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300/70 dark:border-purple-800 uppercase">
                WhatsApp Integrated
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pusat data mitra, kontak WhatsApp aktif, domisili pengiriman, dan riwayat piutang terpusat.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-[0_0_16px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
        >
          <UserPlus size={15} />
          <span>+ Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24]">
          <div className="flex items-center gap-2 text-xs text-[#7D6E63] dark:text-[#A89B8F] mb-1">
            <Users size={14} className="text-[#1565C0]" />
            <span>Total Pelanggan Terdaftar</span>
          </div>
          <div className="text-xl font-black text-[#2D2119] dark:text-[#F7F2EC]">
            {totalCustomers} <span className="text-xs font-normal">Kontak</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24]">
          <div className="flex items-center gap-2 text-xs text-[#7D6E63] dark:text-[#A89B8F] mb-1">
            <AlertTriangle size={14} className="text-rose-500" />
            <span>Pelanggan Memiliki Piutang</span>
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">
            {customersWithUnpaid} <span className="text-xs font-normal">Klien</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24]">
          <div className="flex items-center gap-2 text-xs text-[#7D6E63] dark:text-[#A89B8F] mb-1">
            <Wallet size={14} className="text-[#E65100]" />
            <span>Total Piutang Berjalan</span>
          </div>
          <div className="text-xl font-black text-[#E65100] dark:text-[#FF9E80]">
            {formatRupiah(totalAllUnpaid)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24]">
          <div className="flex items-center gap-2 text-xs text-[#7D6E63] dark:text-[#A89B8F] mb-1">
            <ShoppingBag size={14} className="text-emerald-600" />
            <span>Akumulasi Belanja Klien</span>
          </div>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
            {formatRupiah(totalAllSpend)}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-[#7D6E63] dark:text-[#A89B8F]" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, perusahaan, nomor WhatsApp, atau kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] focus:outline-none focus:border-[#1565C0]"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] ring-1 ring-blue-400'
                : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Semua ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'unpaid'
                ? 'bg-rose-600 text-white shadow-[0_0_14px_rgba(225,29,72,0.45)] ring-1 ring-rose-400'
                : 'bg-slate-100 dark:bg-[#1E293B] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            Ada Piutang ({customersWithUnpaid})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-[0_0_14px_rgba(5,150,105,0.45)] ring-1 ring-emerald-400'
                : 'bg-slate-100 dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            Lunas Bersih
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('vip')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'vip'
                ? 'bg-amber-500 text-white shadow-[0_0_14px_rgba(245,158,11,0.45)] ring-1 ring-amber-300'
                : 'bg-slate-100 dark:bg-[#1E293B] text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            VIP Prioritas
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('grosir')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'grosir'
                ? 'bg-purple-600 text-white shadow-[0_0_14px_rgba(147,51,234,0.45)] ring-1 ring-purple-400'
                : 'bg-slate-100 dark:bg-[#1E293B] text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            Grosir / Distributor
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('retail')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'retail'
                ? 'bg-cyan-600 text-white shadow-[0_0_14px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400'
                : 'bg-slate-100 dark:bg-[#1E293B] text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
            }`}
          >
            Retail / Umum
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const rawPhone = cust.phone.replace(/\D/g, '');
          const cleanPhone = rawPhone.startsWith('0') ? '62' + rawPhone.substring(1) : rawPhone;
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Halo Bapak/Ibu ${cust.name}, kami dari tim operasional Pesanan Master PRO ingin berkoordinasi terkait pesanan Anda.`
          )}`;

          return (
            <div
              key={cust.id}
              className="rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-5 shadow-sm flex flex-col justify-between hover:border-[#1565C0]/50 transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0D47A1] to-[#FF6D00] flex items-center justify-center text-white font-black text-sm shadow-sm">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#2D2119] dark:text-[#F7F2EC] group-hover:text-[#1565C0] dark:group-hover:text-[#90CAF9] transition-colors">
                        {cust.name}
                      </h3>
                      {cust.company && (
                        <div className="flex items-center gap-1 text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                          <Building2 size={11} className="text-[#1565C0]" />
                          <span className="truncate">{cust.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {cust.totalUnpaid > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 shrink-0">
                      Piutang Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 shrink-0">
                      Lunas
                    </span>
                  )}
                </div>

                {/* WhatsApp & Domisili */}
                <div className="space-y-2 text-xs py-2 border-y border-[#EADFD1]/80 dark:border-[#382C24]/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7D6E63] dark:text-[#A89B8F] flex items-center gap-1.5">
                      <Phone size={12} className="text-emerald-600" />
                      <span>WhatsApp:</span>
                    </span>
                    <span className="font-mono font-semibold text-[#2D2119] dark:text-[#F7F2EC]">
                      +{cleanPhone}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[#7D6E63] dark:text-[#A89B8F] flex items-center gap-1.5 text-[11px]">
                      <MapPin size={11} className="text-[#1565C0]" />
                      <span>Alamat ({cust.city}):</span>
                    </span>
                    <p className="text-[11px] text-[#2D2119] dark:text-[#F7F2EC] line-clamp-2 leading-relaxed font-medium">
                      {cust.address}
                    </p>
                  </div>

                  {cust.notes && (
                    <div className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F] italic pt-1 line-clamp-1">
                      "{cust.notes}"
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F] block">
                      Total Belanja
                    </span>
                    <span className="font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                      {formatRupiah(cust.totalSpend)}
                    </span>
                    <span className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F] block">
                      ({cust.ordersCount} faktur)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F] block">
                      Sisa Piutang
                    </span>
                    <span
                      className={`font-black ${
                        cust.totalUnpaid > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatRupiah(cust.totalUnpaid)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#EADFD1] dark:border-[#382C24] flex items-center gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                >
                  <MessageCircle size={14} />
                  <span>Chat WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => onSelectCustomer(cust)}
                  className="p-2 rounded-xl bg-[#F5F0E8] dark:bg-[#1A130F] text-[#1565C0] dark:text-[#90CAF9] hover:bg-[#EADFD1] dark:hover:bg-[#2C211A] transition-colors"
                  title="Lihat Detail Profil & Riwayat Faktur"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24]">
          <Users size={36} className="mx-auto text-[#7D6E63] dark:text-[#A89B8F] mb-3 opacity-50" />
          <h3 className="font-bold text-sm text-[#2D2119] dark:text-[#F7F2EC]">
            Pelanggan Tidak Ditemukan
          </h3>
          <p className="text-xs text-[#7D6E63] dark:text-[#A89B8F] mt-1">
            Tidak ada data pelanggan yang cocok dengan kata kunci pencarian "{searchTerm}".
          </p>
        </div>
      )}

      {/* Modal Tambah Pelanggan Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#FFFDF9] dark:bg-[#16110E] border border-[#EADFD1] dark:border-[#382C24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADFD1] dark:border-[#382C24] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#1565C0]" />
                <h3 className="font-bold text-base text-[#2D2119] dark:text-[#F7F2EC]">
                  Daftarkan Pelanggan Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-[#F5F0E8] dark:hover:bg-[#211813]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#2D2119] dark:text-[#F7F2EC]">
                  Nama Lengkap Pelanggan / PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rahmat Hidayat"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#2D2119] dark:text-[#F7F2EC]">
                    Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[#7D6E63] font-medium">+62</span>
                    <input
                      type="tel"
                      required
                      placeholder="81234567890"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="w-full pl-11 pr-3 py-2 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#2D2119] dark:text-[#F7F2EC]">
                    Perusahaan / Instansi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Surya Niaga"
                    value={newCustCompany}
                    onChange={(e) => setNewCustCompany(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#2D2119] dark:text-[#F7F2EC]">
                  Alamat Pengiriman / Domisili Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Alamat jalan, nomor gudang, blok, RT/RW, dsb..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#2D2119] dark:text-[#F7F2EC]">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta Barat"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#2D2119] dark:text-[#F7F2EC]">
                    Catatan Khusus Pelanggan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pembayaran tempo 14 hari"
                    value={newCustNotes}
                    onChange={(e) => setNewCustNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EADFD1] dark:border-[#382C24] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F5F0E8] dark:bg-[#211813] text-[#7D6E63] hover:bg-[#EADFD1]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#0D47A1] to-[#1565C0] hover:scale-[1.02] active:scale-98 transition-all"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
