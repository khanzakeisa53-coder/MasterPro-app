import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { HeroSection } from './components/HeroSection';
import { KPICardsGrid } from './components/KPICardsGrid';
import { FinancialAnalyticsCharts } from './components/FinancialAnalyticsCharts';
import { RecentTransactions } from './components/RecentTransactions';
import { MicroStatsAndActivity } from './components/MicroStatsAndActivity';
import { OrderInputForm } from './components/OrderInputForm';
import { DatabasePesanan } from './components/DatabasePesanan';
import { PiutangWorkspace } from './components/PiutangWorkspace';
import { SettingsWorkspace } from './components/SettingsWorkspace';
import { CustomersWorkspace } from './components/CustomersWorkspace';
import { CustomerModal } from './components/CustomerModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { DeveloperControlModal } from './components/DeveloperControlModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import {
  Order,
  DashboardTab,
  KPICardType,
  FinancialSummary,
  ActivityLog,
  PaymentRecord,
  OrderFilterState,
  ShipmentStatus,
  Customer,
} from './types';
import { INITIAL_ORDERS, INITIAL_ACTIVITY_LOGS, INITIAL_CUSTOMERS } from './data/mockOrders';
import { formatRupiah } from './lib/formatters';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

  // Theme State: defaults to light, with interactive toggle between Warm Luxury (#F5F0E8) and Warm Espresso (#16110E)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pesanan_master_theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
        return true;
      }
    } catch (e) {}
    document.documentElement.classList.remove('dark');
    return false;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        try {
          localStorage.setItem('pesanan_master_theme', 'dark');
        } catch (e) {}
      } else {
        document.documentElement.classList.remove('dark');
        try {
          localStorage.setItem('pesanan_master_theme', 'light');
        } catch (e) {}
      }
      return next;
    });
  };

  // Orders State (Persisted in localStorage with initial fallback)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pesanan_master_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('pesanan_master_orders', JSON.stringify(orders));
  }, [orders]);

  // Activity Logs State
  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('pesanan_master_activities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ACTIVITY_LOGS;
      }
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('pesanan_master_activities', JSON.stringify(activities));
  }, [activities]);

  // Customers State (Persisted in localStorage with initial fallback)
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pesanan_master_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CUSTOMERS;
      }
    }
    return INITIAL_CUSTOMERS;
  });

  useEffect(() => {
    localStorage.setItem('pesanan_master_customers', JSON.stringify(customers));
  }, [customers]);

  // Modals & Drilldown State
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedOrderForWhatsApp, setSelectedOrderForWhatsApp] = useState<Order | null>(null);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<Customer | null>(null);
  const [preselectedCustomerForOrder, setPreselectedCustomerForOrder] = useState<Customer | null>(null);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState<boolean>(false);
  const [initialDatabaseFilter, setInitialDatabaseFilter] =
    useState<OrderFilterState['statusTab']>('all');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Customer Management Handlers
  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...customerData } : c))
      );
      showToast(`Data pelanggan "${customerData.name}" berhasil diperbarui!`);
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        ...customerData,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [newCust, ...prev]);
      showToast(`Pelanggan baru "${newCust.name}" berhasil ditambahkan!`);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('Pelanggan berhasil dihapus.');
  };

  const handleCreateOrderForCustomer = (cust: Customer) => {
    setPreselectedCustomerForOrder(cust);
    setSelectedCustomerForModal(null);
    setActiveTab('input_pesanan');
  };

  const handleViewCustomerByNameOrPhone = (name: string, phone: string) => {
    const cleanP = phone.replace(/\D/g, '');
    const found =
      customers.find((c) => c.phone.replace(/\D/g, '') === cleanP) ||
      customers.find((c) => c.name.toLowerCase() === name.toLowerCase());

    if (found) {
      setSelectedCustomerForModal(found);
    } else {
      setSelectedCustomerForModal({
        id: '',
        name,
        phone: cleanP,
        address: 'Alamat dari riwayat transaksi',
        city: 'Domisili Terdaftar',
        totalOrdersCount: 0,
        createdAt: new Date().toISOString(),
      });
    }
  };

  // Google Sheets Sync State
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSynced, setSheetsSynced] = useState(false);

  // Financial Calculations & Summary
  const financialSummary: FinancialSummary = useMemo(() => {
    const thisMonthOrders = orders.filter((o) => o.createdAt.startsWith('2026-09'));

    const totalPesananBulanIni = thisMonthOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const countPesananBulanIni = thisMonthOrders.length;

    const unpaidOrders = orders.filter((o) => o.remainingAmount > 0);
    const totalBelumLunas = unpaidOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
    const countBelumLunas = unpaidOrders.length;

    const paidOrders = orders.filter((o) => o.status === 'lunas');
    const totalLunas = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const countLunas = paidOrders.length;

    const withdrawableOrders = orders.filter((o) => o.isWithdrawable);
    const totalDanaSiapDitarik = withdrawableOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const countDanaSiapDitarik = withdrawableOrders.length;

    const gabungOrders = orders.filter((o) => o.mode === 'gabung_nota');
    const totalGabungNota = gabungOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const countGabungNota = gabungOrders.length;

    const overdueOrders = orders.filter((o) => o.status === 'overdue');
    const totalPiutangJatuhTempo = overdueOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
    const countPiutangJatuhTempo = overdueOrders.length;

    const totalDanaMasuk = orders.reduce((sum, o) => sum + o.paidAmount, 0);
    const totalDanaDitarik = Math.round(totalDanaSiapDitarik * 0.4);
    const sisaPiutang = totalBelumLunas;

    return {
      totalPesananBulanIni,
      countPesananBulanIni,
      totalBelumLunas,
      countBelumLunas,
      totalLunas,
      countLunas,
      totalDanaSiapDitarik,
      countDanaSiapDitarik,
      totalGabungNota,
      countGabungNota,
      totalPiutangJatuhTempo,
      countPiutangJatuhTempo,
      totalDanaMasuk,
      totalDanaDitarik,
      sisaPiutang,
    };
  }, [orders]);

  // Handle Save New Order
  const handleSaveNewOrder = async (newOrder: Order) => {
    // Artificial slight delay for realistic UX and double-submit prevention feedback
    await new Promise((res) => setTimeout(res, 600));

    setOrders((prev) => [newOrder, ...prev]);

    // Add activity log
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: 'Baru saja',
      type: 'order_created',
      title: 'Pesanan Baru Diterbitkan',
      description: `${newOrder.invoiceNumber} oleh ${newOrder.customerName} (${newOrder.destinationTag})`,
      amount: newOrder.grandTotal,
      invoiceNumber: newOrder.invoiceNumber,
    };
    setActivities((prev) => [newLog, ...prev]);
    showToast(`Pesanan ${newOrder.invoiceNumber} berhasil disimpan!`);
  };

  // Handle Save Payment Installment
  const handleSavePayment = (orderId: string, payment: PaymentRecord) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const newPaidAmount = ord.paidAmount + payment.amount;
        const newRemainingAmount = Math.max(0, ord.grandTotal - newPaidAmount);
        const newStatus = newRemainingAmount === 0 ? 'lunas' : 'dp';

        return {
          ...ord,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          isWithdrawable: newStatus === 'lunas',
          payments: [payment, ...ord.payments],
        };
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: 'Baru saja',
      type: 'payment_received',
      title: 'Pembayaran Diterima',
      description: `Pembayaran ${formatRupiah(payment.amount)} untuk ${targetOrder?.invoiceNumber || 'Pesanan'} via ${payment.method}`,
      amount: payment.amount,
      invoiceNumber: targetOrder?.invoiceNumber,
    };
    setActivities((prev) => [newLog, ...prev]);
    showToast(`Pembayaran ${formatRupiah(payment.amount)} berhasil dicatat!`);
  };

  // Handle Updating Logistics & Tracking Number
  const handleUpdateOrderLogistics = (
    orderId: string,
    courier: string,
    trackingNumber: string,
    shipmentStatus: ShipmentStatus
  ) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              courier,
              trackingNumber: trackingNumber.trim() || undefined,
              shipmentStatus,
            }
          : ord
      )
    );

    setSelectedOrderForDetail((prev) =>
      prev && prev.id === orderId
        ? {
            ...prev,
            courier,
            trackingNumber: trackingNumber.trim() || undefined,
            shipmentStatus,
          }
        : prev
    );

    const target = orders.find((o) => o.id === orderId);
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: 'Baru saja',
      type: 'status_changed',
      title: 'Status Logistik Diperbarui',
      description: `${target?.invoiceNumber || orderId}: ${shipmentStatus.toUpperCase()} (${courier}${
        trackingNumber ? ` - Resi: ${trackingNumber}` : ''
      })`,
      invoiceNumber: target?.invoiceNumber,
    };
    setActivities((prev) => [newLog, ...prev]);
    showToast(`Data logistik & resi berhasil disimpan!`);
  };

  // Handle KPI Drill-Down Clicks
  const handleSelectKPI = (type: KPICardType) => {
    switch (type) {
      case 'pesanan_bulan_ini':
        setInitialDatabaseFilter('all');
        setActiveTab('database_pesanan');
        break;
      case 'belum_lunas':
        setInitialDatabaseFilter('belum_lunas');
        setActiveTab('database_pesanan');
        break;
      case 'pesanan_lunas':
        setInitialDatabaseFilter('lunas');
        setActiveTab('database_pesanan');
        break;
      case 'dana_siap_ditarik':
        setInitialDatabaseFilter('lunas');
        setActiveTab('database_pesanan');
        break;
      case 'gabung_nota':
        setInitialDatabaseFilter('gabung_nota');
        setActiveTab('database_pesanan');
        break;
      case 'piutang_jatuh_tempo':
        setActiveTab('piutang');
        break;
      default:
        setActiveTab('database_pesanan');
    }
  };

  // Handle Google Sheets Sync
  const handleExportSheets = () => {
    setIsSyncingSheets(true);
    setTimeout(() => {
      setIsSyncingSheets(false);
      setSheetsSynced(true);
      const newLog: ActivityLog = {
        id: `act-${Date.now()}`,
        timestamp: 'Baru saja',
        type: 'sheet_sync',
        title: 'Sinkronisasi Spreadsheet Berhasil',
        description: `${orders.length} pesanan dan data piutang diperbarui di Google Sheets`,
      };
      setActivities((prev) => [newLog, ...prev]);
      showToast('Sinkronisasi Google Sheets berhasil diperbarui!');
    }, 1200);
  };

  // Handle Withdraw funds simulation
  const handleWithdrawFunds = () => {
    showToast(`Penarikan dana ${formatRupiah(financialSummary.totalDanaSiapDitarik)} sedang diproses ke rekening utama.`);
  };

  // Reset to initial mock dataset
  const handleResetData = () => {
    if (confirm('Kembalikan data pesanan ke dataset awal?')) {
      setOrders(INITIAL_ORDERS);
      setActivities(INITIAL_ACTIVITY_LOGS);
      showToast('Dataset pesanan berhasil direset ke data awal.');
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#070B14] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'} min-h-screen flex transition-colors duration-200`}>
      {/* Fixed Espresso Sidebar for Desktop */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unpaidCount={financialSummary.countBelumLunas}
        totalOrdersCount={orders.length}
        sisaPiutang={financialSummary.sisaPiutang}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Sticky Topbar */}
        <Topbar
          activeTab={activeTab}
          onNavigateToNewOrder={() => setActiveTab('input_pesanan')}
          onSearchClick={() => setActiveTab('database_pesanan')}
          onExportSheet={handleExportSheets}
          isSyncingSheet={isSyncingSheets}
          sheetSynced={sheetsSynced}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onOpenDeveloperModal={() => setIsDeveloperModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* VIEW 1: Operational Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Section strictly using Georgia Serif title */}
              <HeroSection
                onNavigateToNewOrder={() => setActiveTab('input_pesanan')}
                onNavigateToDatabase={() => {
                  setInitialDatabaseFilter('all');
                  setActiveTab('database_pesanan');
                }}
                onNavigateToPiutang={() => setActiveTab('piutang')}
                onNavigateToCustomers={() => setActiveTab('pelanggan')}
                ordersThisMonthCount={financialSummary.countPesananBulanIni}
                unpaidCount={financialSummary.countBelumLunas}
                totalCustomersCount={customers.length}
              />

              {/* 6 Connected KPI Cards with click drill-down */}
              <KPICardsGrid
                summary={financialSummary}
                onSelectKPI={handleSelectKPI}
              />

              {/* Dynamic Financial Wave & Donut Analytics Charts */}
              <FinancialAnalyticsCharts
                orders={orders}
                summary={financialSummary}
              />

              {/* Recent Transactions Table & Mobile Cards */}
              <RecentTransactions
                orders={orders}
                onViewDetail={(order) => setSelectedOrderForDetail(order)}
                onViewAllOrders={() => {
                  setInitialDatabaseFilter('all');
                  setActiveTab('database_pesanan');
                }}
              />

              {/* Micro Stats & Financial Activity Feed */}
              <MicroStatsAndActivity
                summary={financialSummary}
                activities={activities}
                onWithdrawFunds={handleWithdrawFunds}
              />
            </div>
          )}

          {/* VIEW 2: Order Input & Workflows */}
          {activeTab === 'input_pesanan' && (
            <OrderInputForm
              onSaveOrder={async (newOrder) => {
                await handleSaveNewOrder(newOrder);
                setPreselectedCustomerForOrder(null);
              }}
              onCancel={() => {
                setPreselectedCustomerForOrder(null);
                setActiveTab('dashboard');
              }}
              customers={customers}
              orders={orders}
              preselectedCustomer={preselectedCustomerForOrder}
              onOpenCustomerDetail={(cust) => setSelectedCustomerForModal(cust)}
            />
          )}

          {/* VIEW 3: Database Pesanan */}
          {activeTab === 'database_pesanan' && (
            <DatabasePesanan
              orders={orders}
              onViewDetail={(order) => setSelectedOrderForDetail(order)}
              onOpenPaymentModal={(order) => setSelectedOrderForPayment(order)}
              onNavigateToNewOrder={() => setActiveTab('input_pesanan')}
              onBackToDashboard={() => setActiveTab('dashboard')}
              initialFilterTab={initialDatabaseFilter}
            />
          )}

          {/* VIEW 4: Piutang & Penagihan Workspace */}
          {activeTab === 'piutang' && (
            <PiutangWorkspace
              orders={orders}
              onOpenPaymentModal={(order) => setSelectedOrderForPayment(order)}
              onViewDetail={(order) => setSelectedOrderForDetail(order)}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {/* VIEW 5: Data & Profil Pelanggan Workspace */}
          {activeTab === 'pelanggan' && (
            <CustomersWorkspace
              customers={customers}
              orders={orders}
              onSelectCustomer={(cust) => setSelectedCustomerForModal(cust)}
              onAddNewCustomer={handleSaveCustomer}
              onNavigateToNewOrderWithCustomer={handleCreateOrderForCustomer}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {/* VIEW 6: Pengaturan & Integrasi */}
          {activeTab === 'pengaturan' && (
            <SettingsWorkspace
              orders={orders}
              onExportSheets={handleExportSheets}
              isSyncingSheets={isSyncingSheets}
              sheetsSynced={sheetsSynced}
              onResetData={handleResetData}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <OrderDetailModal
          order={selectedOrderForDetail}
          onClose={() => setSelectedOrderForDetail(null)}
          onOpenPaymentModal={(ord) => {
            setSelectedOrderForDetail(null);
            setSelectedOrderForPayment(ord);
          }}
          onOpenWhatsAppReminder={(ord) => {
            setSelectedOrderForDetail(null);
            setSelectedOrderForWhatsApp(ord);
          }}
          onUpdateOrderLogistics={handleUpdateOrderLogistics}
          onViewCustomer={handleViewCustomerByNameOrPhone}
        />
      )}

      {/* Payment Recording Modal */}
      {selectedOrderForPayment && (
        <PaymentModal
          order={selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
          onSavePayment={handleSavePayment}
        />
      )}

      {/* WhatsApp Message Preview Modal */}
      {selectedOrderForWhatsApp && (
        <WhatsAppPreviewModal
          order={selectedOrderForWhatsApp}
          isOpen={!!selectedOrderForWhatsApp}
          onClose={() => setSelectedOrderForWhatsApp(null)}
        />
      )}

      {/* Customer Detail, Metrics & Edit Modal */}
      {selectedCustomerForModal && (
        <CustomerModal
          customer={selectedCustomerForModal.id ? selectedCustomerForModal : null}
          orders={orders}
          isOpen={true}
          onClose={() => setSelectedCustomerForModal(null)}
          onSaveCustomer={handleSaveCustomer}
          onDeleteCustomer={selectedCustomerForModal.id ? handleDeleteCustomer : undefined}
          onCreateOrder={handleCreateOrderForCustomer}
        />
      )}

      {/* System Maintenance & Developer Control Modal */}
      <DeveloperControlModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
        onResetData={handleResetData}
        activities={activities}
        ordersCount={orders.length}
        customersCount={customers.length}
      />

      {/* Mobile Adaptive Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unpaidCount={financialSummary.countBelumLunas}
      />

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-4 md:right-8 z-50 px-4 py-3 rounded-xl bg-[#16110E] text-white border border-[#382C24] shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6D00]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
