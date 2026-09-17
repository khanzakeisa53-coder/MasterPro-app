import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Shield,
  Activity,
  Server,
  RefreshCw,
  Database,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Wifi,
  HardDrive,
  Clock,
  Code,
} from 'lucide-react';
import { ActivityLog } from '../types';

interface DeveloperControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
  activities: ActivityLog[];
  ordersCount: number;
  customersCount: number;
}

export const DeveloperControlModal: React.FC<DeveloperControlModalProps> = ({
  isOpen,
  onClose,
  onResetData,
  activities,
  ordersCount,
  customersCount,
}) => {
  const [latency, setLatency] = useState<number>(24);
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'status' | 'logs' | 'database'>('status');
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(14280);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      // Simulate real-time latency ping fluctuation (18ms - 38ms)
      setLatency(Math.floor(Math.random() * 18) + 18);
      setUptimeSeconds((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const formatUptime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hours}j ${mins}m ${s}d`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090D16] border border-cyan-500/40 text-white shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header with Glow */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#070A12]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(6,182,212,0.5)]">
              <Terminal size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  System Maintenance & Developer Control
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  DEV OPS v25+
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                JacS Enterprise Core Diagnostics & Maintenance Hub
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 pb-1 border-b border-slate-800/80 bg-[#090D16]">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Activity size={13} />
            <span>Diagnostik Server</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Clock size={13} />
            <span>Aktivitas Sistem ({activities.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Database size={13} />
            <span>Manajemen Database</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'status' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Telemetry 4-Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0E1526] border border-cyan-500/25">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Latensi API</span>
                    <Wifi size={13} className="text-cyan-400" />
                  </div>
                  <div className="text-xl font-mono font-bold text-cyan-300">
                    {latency} <span className="text-xs font-normal">ms</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ultra Rendah
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0E1526] border border-cyan-500/25">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Uptime VM</span>
                    <Server size={13} className="text-emerald-400" />
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    99.98<span className="text-xs font-normal">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block truncate">
                    {formatUptime(uptimeSeconds)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0E1526] border border-cyan-500/25">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Status Node</span>
                    <Cpu size={13} className="text-purple-400" />
                  </div>
                  <div className="text-xl font-mono font-bold text-emerald-400">
                    NORMAL
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Port 3000 Ingress OK
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0E1526] border border-cyan-500/25">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Dataset</span>
                    <HardDrive size={13} className="text-amber-400" />
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {ordersCount} <span className="text-xs font-normal">Order</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {customersCount} Pelanggan
                  </span>
                </div>
              </div>

              {/* Maintenance Tools Action Panel */}
              <div className="p-4 rounded-2xl bg-[#0E1526] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={14} className="text-cyan-400" />
                    Tindakan Pemeliharaan Cepat
                  </span>
                  <span className="text-[10px] text-slate-400">Environment: Staging Production</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141E34] border border-cyan-500/30 hover:border-cyan-400 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <RefreshCw size={15} className={`text-cyan-400 ${cacheCleared ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                      <div>
                        <span className="block text-xs font-semibold text-white">
                          Bersihkan Cache & Prefetch
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {cacheCleared ? 'Cache Berhasil Dikosongkan!' : 'Optimasi memory heap aplikasi'}
                        </span>
                      </div>
                    </div>
                    {cacheCleared && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Konfirmasi: Kembalikan seluruh database ke dataset awal bawaan?')) {
                        onResetData();
                        onClose();
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-950/40 border border-rose-600/40 hover:border-rose-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Trash2 size={15} className="text-rose-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="block text-xs font-semibold text-rose-300">
                          Reset Database Pabrik
                        </span>
                        <span className="block text-[10px] text-rose-400/80">
                          Pulihkan pesanan & log awal
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Developer Environment Specs */}
              <div className="p-3.5 rounded-2xl bg-[#070B14] border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-sans font-bold pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Code size={12} />
                    Stack & Runtime Profile
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">ALL SERVICES OPERATIONAL</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Engine:</span>
                  <span className="text-slate-200">React 18 + Vite SPA Mode</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Reverse Proxy:</span>
                  <span className="text-slate-200">Nginx Container Ingress (Port 3000)</span>
                </div>
                <div className="flex justify-between">
                  <span>Persistence Layer:</span>
                  <span className="text-slate-200">Local Reactive State + Sheets Sync</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400 mb-2">
                Menampilkan {activities.length} catatan aktivitas sistem real-time terbaru:
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-[#0E1526] border border-slate-800 flex items-start gap-3 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white truncate">{act.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#0E1526] border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Database size={15} className="text-cyan-400" />
                  Ringkasan Penyimpanan Data
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#141E34] border border-slate-800">
                    <span className="text-slate-400 block">Total Faktur Pesanan</span>
                    <span className="text-base font-bold text-white font-mono">{ordersCount} Dokumen</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141E34] border border-slate-800">
                    <span className="text-slate-400 block">Total Kontak Pelanggan</span>
                    <span className="text-base font-bold text-white font-mono">{customersCount} Entitas</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Data tersimpan secara reaktif pada state memori dan dapat disinkronkan secara aman ke format Google Sheets kapan saja melalui tombol Topbar.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Konfirmasi: Kembalikan seluruh database ke dataset awal bawaan?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Bersihkan & Reset Ulang ke Dataset Awal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#070A12]/95 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Shield size={13} className="text-cyan-400" />
            <span>Developer Authenticated (Role: Super Admin)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-colors cursor-pointer"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
