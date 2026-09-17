import React, { useState } from 'react';
import {
  Settings,
  FileSpreadsheet,
  Download,
  Store,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { DeveloperBrandLogo } from './DeveloperBrandLogo';
import { StoreLocation, Order } from '../types';
import { STORE_LOCATIONS } from '../data/mockOrders';

interface SettingsWorkspaceProps {
  orders: Order[];
  onExportSheets: () => void;
  isSyncingSheets: boolean;
  sheetsSynced: boolean;
  onResetData: () => void;
  onBackToDashboard?: () => void;
}

export const SettingsWorkspace: React.FC<SettingsWorkspaceProps> = ({
  orders,
  onExportSheets,
  isSyncingSheets,
  sheetsSynced,
  onResetData,
  onBackToDashboard,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'integrasi' | 'toko' | 'developer'>('integrasi');

  // Export CSV locally
  const handleExportCSV = () => {
    const headers = [
      'No Invoice',
      'Pelanggan',
      'No HP',
      'Mode',
      'Tanggal',
      'Jatuh Tempo',
      'Grand Total',
      'Sudah Dibayar',
      'Sisa Piutang',
      'Status',
      'Destinasi',
    ];

    const rows = orders.map((o) => [
      `"${o.invoiceNumber}"`,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.mode}"`,
      `"${o.createdAt.split('T')[0]}"`,
      `"${o.dueDate.split('T')[0]}"`,
      o.grandTotal,
      o.paidAmount,
      o.remainingAmount,
      `"${o.status}"`,
      `"${o.destinationTag}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pesanan_master_pro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center gap-3.5">
        {onBackToDashboard && (
          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-rose-400/50 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 shadow-[0_0_14px_rgba(244,63,94,0.25)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </button>
        )}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
            Pengaturan & Integrasi Sistem
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Konfigurasi cabang toko, integrasi spreadsheet Google Workspace, dan manajemen data
          </p>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="flex gap-2 border-b border-[#EADFD1] dark:border-[#382C24] pb-3">
        {[
          { id: 'integrasi', label: 'Google Sheets & Ekspor' },
          { id: 'toko', label: 'Lokasi & Multi-Cabang' },
          { id: 'developer', label: 'Identitas Brand Developer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeSubTab === tab.id
                ? 'bg-[#1565C0] text-white shadow-sm'
                : 'text-[#7D6E63] dark:text-[#A89B8F] hover:bg-[#F5F0E8] dark:hover:bg-[#261C16]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SubTab 1: Integrasi Google Sheets & Ekspor */}
      {activeSubTab === 'integrasi' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#EADFD1] dark:border-[#382C24]">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                  Integrasi Google Sheets Otomatis
                </h3>
                <p className="text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                  Ekspor rekaman transaksi langsung ke spreadsheet akun Google yang terhubung
                </p>
              </div>
            </div>

            <p className="text-xs text-[#7D6E63] dark:text-[#A89B8F] leading-relaxed">
              Dengan sinkronisasi Google Sheets, seluruh order baru, rincian barang multi-toko, pembagian tagihan <i>Gabung Nota</i>, dan riwayat pembayaran cicilan akan otomatis tertata di kolom spreadsheet operasional.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onExportSheets}
                disabled={isSyncingSheets}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-60"
              >
                <FileSpreadsheet size={15} />
                <span>{isSyncingSheets ? 'Menyinkronkan...' : sheetsSynced ? 'Sync Ulang ke Sheets' : 'Sinkronkan ke Google Sheets'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F5F0E8] dark:bg-[#2A1F18] text-[#2D2119] dark:text-[#F7F2EC] border border-[#EADFD1] dark:border-[#382C24] hover:bg-[#EADFD1]/50 transition-colors"
              >
                <Download size={14} />
                <span>Unduh File CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-5 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                Reset Dataset Simulasi
              </h4>
              <p className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                Kembalikan data pesanan ke dataset awal untuk kebutuhan pengujian & simulasi.
              </p>
            </div>
            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}

      {/* SubTab 2: Toko & Multi-Cabang */}
      {activeSubTab === 'toko' && (
        <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFD1] dark:border-[#382C24]">
            <div>
              <h3 className="text-sm font-bold text-[#2D2119] dark:text-[#F7F2EC]">
                Daftar Cabang & Gudang Terdaftar
              </h3>
              <p className="text-xs text-[#7D6E63] dark:text-[#A89B8F]">
                Lokasi pengambilan stok barang yang dapat dipilih pada saat membuat pesanan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STORE_LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                className="p-3.5 rounded-xl bg-[#F5F0E8]/50 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#0D47A1]/10 text-[#1565C0] dark:text-[#90CAF9]">
                    <Store size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#2D2119] dark:text-[#F7F2EC]">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-[#7D6E63] dark:text-[#A89B8F]">
                      {loc.city}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#EADFD1] dark:bg-[#2C211A] text-[#7D6E63] dark:text-[#C9BDB3]">
                  {loc.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Identitas Brand Developer */}
      {activeSubTab === 'developer' && (
        <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#211813] border border-[#EADFD1] dark:border-[#382C24] p-6 shadow-sm space-y-5">
          <div className="p-5 rounded-2xl bg-[#16110E] border border-[#2C211A] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <DeveloperBrandLogo size="lg" showSubtitle={true} />
            <div className="text-center sm:text-right">
              <span className="text-xs text-[#A89B8F] block">Brand Identitas Resmi</span>
              <span className="text-sm font-bold text-[#FF6D00]">
                Electric Royal Blue (#0D47A1) & Flame Orange (#FF6D00)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] space-y-1.5">
              <span className="font-bold text-[#2D2119] dark:text-[#F7F2EC] block">
                Arsitektur Palet Warna (Modern Warm Luxury)
              </span>
              <p className="text-[#7D6E63] dark:text-[#A89B8F] leading-relaxed">
                Menghapus seluruh efek cyberpunk neon yang berlebihan, digantikan dengan latar belakang hangat <code>#F5F0E8</code>, permukaan mewah <code>#FFFDF9</code>, dan mode malam espresso <code>#16110E</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F0E8]/60 dark:bg-[#1A130F] border border-[#EADFD1] dark:border-[#2C211A] space-y-1.5">
              <span className="font-bold text-[#2D2119] dark:text-[#F7F2EC] block">
                Tipografi Berstandar Operasional
              </span>
              <p className="text-[#7D6E63] dark:text-[#A89B8F] leading-relaxed">
                Sans-serif (Plus Jakarta Sans) untuk formulir, tabel data presisi, dan nominal mata uang rata-kanan. Serif (Georgia) dikhususkan untuk judul hero kontrol.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
