export type OrderMode = 'mandiri' | 'gabung_nota';
export type PaymentStatus = 'lunas' | 'belum_lunas' | 'dp' | 'overdue';
export type ShipmentStatus = 'diproses' | 'siap_kirim' | 'dikirim' | 'selesai';
export type AgingCategory = 'belum_jatuh_tempo' | 'mendekati' | 'overdue';
export type DashboardTab = 'dashboard' | 'input_pesanan' | 'database_pesanan' | 'piutang' | 'pelanggan' | 'pengaturan';

export type KPICardType = 
  | 'pesanan_bulan_ini'
  | 'belum_lunas'
  | 'pesanan_lunas'
  | 'dana_siap_ditarik'
  | 'gabung_nota'
  | 'piutang_jatuh_tempo';

export interface Customer {
  id: string;
  name: string;
  company?: string;
  phone: string; // WhatsApp active number (e.g., '6281234567890')
  address: string; // Complete shipping address / domisili
  city: string;
  npwp?: string; // NPWP (15-16 digit) or NIK
  notes?: string; // Special notes
  createdAt: string;
}

export interface CustomerMetrics {
  totalSpend: number;
  totalOrdersCount: number;
  totalUnpaidAmount: number;
  unpaidOrdersCount: number;
  lastOrderDate?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  store: string;
  ownerName?: string; // For Gabung Nota breakdown
  ownerPhone?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Transfer BCA' | 'Transfer Mandiri' | 'Transfer BRI' | 'Cash' | 'QRIS';
  notes?: string;
  receiptNumber?: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerCompany?: string;
  customerAddress?: string;
  customerNpwp?: string; // NPWP / NIK 16 digit sesuai regulasi perpajakan
  mode: OrderMode;
  createdAt: string;
  dueDate: string;
  items: OrderItem[];
  shippingCost: number;
  discount: number;
  notes: string;
  subtotal: number;
  applyTax?: boolean; // Toggle PPN aktif/non-aktif
  taxRate?: number; // Persentase PPN regulasi: 11% (UU HPP) atau 12%
  dppAmount?: number; // Dasar Pengenaan Pajak (Subtotal - Diskon)
  taxAmount?: number; // Nominal PPN terutang resmi
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
  payments: PaymentRecord[];
  isWithdrawable: boolean; // Dana siap ditarik (e.g., pesanan lunas/selesai)
  destinationTag: string; // e.g., "Gudang Pusat", "Ekspedisi Express", "Cabang Bandung"
  courier?: string; // e.g., "JNE Express", "SiCepat", "Dakota Cargo", "Kurir Internal"
  trackingNumber?: string; // e.g., "DKT-9920194821"
  shipmentStatus?: ShipmentStatus; // 'diproses' | 'siap_kirim' | 'dikirim' | 'selesai'
  sheetSynced?: boolean;
  sheetUrl?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'order_created' | 'payment_received' | 'status_changed' | 'wa_reminder' | 'sheet_sync';
  title: string;
  description: string;
  amount?: number;
  invoiceNumber?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  code: string;
}

export interface OrderFilterState {
  searchQuery: string;
  period: 'semua' | 'hari_ini' | 'kemarin' | 'bulan_ini' | 'bulan_lalu';
  statusTab: 'all' | 'belum_lunas' | 'lunas' | 'gabung_nota' | 'overdue';
  storeFilter: string;
}

export interface FinancialSummary {
  totalPesananBulanIni: number;
  countPesananBulanIni: number;
  totalBelumLunas: number;
  countBelumLunas: number;
  totalLunas: number;
  countLunas: number;
  totalDanaSiapDitarik: number;
  countDanaSiapDitarik: number;
  totalGabungNota: number;
  countGabungNota: number;
  totalPiutangJatuhTempo: number;
  countPiutangJatuhTempo: number;
  // Micro stats
  totalDanaMasuk: number;
  totalDanaDitarik: number;
  sisaPiutang: number;
}
