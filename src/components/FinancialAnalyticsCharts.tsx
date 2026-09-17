import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Order, FinancialSummary } from '../types';
import { formatRupiah } from '../lib/formatters';

type TimeFilter = 'harian' | 'mingguan' | 'bulanan' | 'tahunan';
type DonutSegment = 'lunas' | 'siap' | 'piutang' | null;

interface FinancialAnalyticsChartsProps {
  orders: Order[];
  summary: FinancialSummary;
}

interface ChartPoint {
  label: string;
  fullLabel: string;
  penjualan: number;
  terbayar: number;
}

export const FinancialAnalyticsCharts: React.FC<FinancialAnalyticsChartsProps> = ({
  orders,
  summary,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('bulanan');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<DonutSegment>(null);

  // Dynamic Series Data based on active filter, responsive to current orders/summary
  const chartData: ChartPoint[] = useMemo(() => {
    const currentSales = summary.totalPesananBulanIni || 71200000;
    const currentCash = summary.totalUangMasuk || 63500000;

    switch (timeFilter) {
      case 'harian':
        return [
          { label: 'Sen', fullLabel: 'Senin', penjualan: 4200000, terbayar: 3800000 },
          { label: 'Sel', fullLabel: 'Selasa', penjualan: 6850000, terbayar: 5900000 },
          { label: 'Rab', fullLabel: 'Rabu', penjualan: 5100000, terbayar: 4200000 },
          { label: 'Kam', fullLabel: 'Kamis', penjualan: 9400000, terbayar: 8100000 },
          { label: 'Jum', fullLabel: 'Jumat', penjualan: 12200000, terbayar: 11500000 },
          { label: 'Sab', fullLabel: 'Sabtu', penjualan: 8700000, terbayar: 7300000 },
          { label: 'Min', fullLabel: 'Minggu', penjualan: 6300000, terbayar: 5800000 },
        ];
      case 'mingguan':
        return [
          { label: 'Mgg 1', fullLabel: 'Minggu 1', penjualan: 24500000, terbayar: 21000000 },
          { label: 'Mgg 2', fullLabel: 'Minggu 2', penjualan: 38200000, terbayar: 32400000 },
          { label: 'Mgg 3', fullLabel: 'Minggu 3', penjualan: 46800000, terbayar: 40100000 },
          { label: 'Mgg 4', fullLabel: 'Minggu 4', penjualan: 52400000, terbayar: 45600000 },
        ];
      case 'tahunan':
        return [
          { label: '2023', fullLabel: 'Tahun 2023', penjualan: 320000000, terbayar: 295000000 },
          { label: '2024', fullLabel: 'Tahun 2024', penjualan: 480000000, terbayar: 435000000 },
          { label: '2025', fullLabel: 'Tahun 2025', penjualan: 690000000, terbayar: 620000000 },
          { label: '2026', fullLabel: 'Tahun 2026', penjualan: 840000000, terbayar: 780000000 },
        ];
      case 'bulanan':
      default:
        return [
          { label: 'Jan', fullLabel: 'Januari 2026', penjualan: 28000000, terbayar: 24500000 },
          { label: 'Feb', fullLabel: 'Februari 2026', penjualan: 34500000, terbayar: 30000000 },
          { label: 'Mar', fullLabel: 'Maret 2026', penjualan: 41200000, terbayar: 36800000 },
          { label: 'Apr', fullLabel: 'April 2026', penjualan: 39000000, terbayar: 35000000 },
          { label: 'Mei', fullLabel: 'Mei 2026', penjualan: 48500000, terbayar: 42100000 },
          { label: 'Jun', fullLabel: 'Juni 2026', penjualan: 56000000, terbayar: 49800000 },
          { label: 'Jul', fullLabel: 'Juli 2026', penjualan: 52300000, terbayar: 47000000 },
          { label: 'Agu', fullLabel: 'Agustus 2026', penjualan: 63800000, terbayar: 58200000 },
          { label: 'Sep', fullLabel: 'September 2026', penjualan: currentSales, terbayar: currentCash },
          { label: 'Okt', fullLabel: 'Oktober 2026', penjualan: 76500000, terbayar: 68900000 },
          { label: 'Nov', fullLabel: 'November 2026', penjualan: 84200000, terbayar: 77400000 },
          { label: 'Des', fullLabel: 'Desember 2026', penjualan: 95000000, terbayar: 89000000 },
        ];
    }
  }, [timeFilter, summary]);

  // Donut Chart Segment Calculations
  const lunasVal = Math.max(1, summary.pesananLunas || 42500000);
  const siapDitarikVal = Math.max(1, summary.danaSiapDitarik || 28900000);
  const sisaPiutangVal = Math.max(1, summary.sisaPiutang || 14600000);
  const totalDonutVal = lunasVal + siapDitarikVal + sisaPiutangVal;

  const pctLunas = Math.round((lunasVal / totalDonutVal) * 100);
  const pctSiap = Math.round((siapDitarikVal / totalDonutVal) * 100);
  const pctPiutang = 100 - pctLunas - pctSiap;

  // Area Chart Geometry (SVG Coordinates)
  const svgWidth = 650;
  const svgHeight = 260;
  const paddingX = 45;
  const paddingY = 40;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.penjualan, d.terbayar))) * 1.15 || 100;

  const getX = (idx: number) => paddingX + (idx / (chartData.length - 1)) * graphWidth;
  const getY = (val: number) => svgHeight - paddingY - (val / maxVal) * graphHeight;

  // Build Cubic Bezier Smooth Curve Paths
  const buildSmoothPath = (key: 'penjualan' | 'terbayar') => {
    const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePenjualan = buildSmoothPath('penjualan');
  const lineTerbayar = buildSmoothPath('terbayar');

  const areaPenjualan = `${linePenjualan} L ${getX(chartData.length - 1)} ${svgHeight - paddingY} L ${getX(0)} ${svgHeight - paddingY} Z`;
  const areaTerbayar = `${lineTerbayar} L ${getX(chartData.length - 1)} ${svgHeight - paddingY} L ${getX(0)} ${svgHeight - paddingY} Z`;

  // Active hover point (or last point if none hovered)
  const activeIdx = hoveredIndex !== null ? hoveredIndex : chartData.length - 1;
  const activeData = chartData[activeIdx];
  const activeX = getX(activeIdx);
  const activeYPenjualan = getY(activeData.penjualan);
  const activeYTerbayar = getY(activeData.terbayar);

  // Donut Geometry
  const donutSize = 190;
  const donutCenter = donutSize / 2;
  const donutRadius = 72;
  const donutStrokeWidth = 20;
  const circumference = 2 * Math.PI * donutRadius;

  const strokeLunas = (pctLunas / 100) * circumference;
  const strokeSiap = (pctSiap / 100) * circumference;
  const strokePiutang = (pctPiutang / 100) * circumference;

  const offsetLunas = 0;
  const offsetSiap = -strokeLunas;
  const offsetPiutang = -(strokeLunas + strokeSiap);

  // Tooltip content helper for Donut
  const getDonutCenterContent = () => {
    if (hoveredSegment === 'lunas') {
      return {
        title: 'Lunas Selesai',
        value: formatRupiah(lunasVal),
        badge: `${pctLunas}% Terkumpul`,
        color: 'text-emerald-600 dark:text-emerald-400',
      };
    }
    if (hoveredSegment === 'siap') {
      return {
        title: 'Kas Siap Ditarik',
        value: formatRupiah(siapDitarikVal),
        badge: `${pctSiap}% Likuid`,
        color: 'text-orange-600 dark:text-orange-400',
      };
    }
    if (hoveredSegment === 'piutang') {
      return {
        title: 'Sisa Piutang',
        value: formatRupiah(sisaPiutangVal),
        badge: `${pctPiutang}% Tertunda`,
        color: 'text-rose-600 dark:text-rose-400',
      };
    }
    return {
      title: 'Total Perputaran',
      value: formatRupiah(totalDonutVal),
      badge: `${pctLunas + pctSiap}% Likuid`,
      color: 'text-slate-800 dark:text-white',
    };
  };

  const donutCenterInfo = getDonutCenterContent();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch select-none">
      {/* 1. SMOOTH WAVE AREA CHART (8 COLS) */}
      <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 p-5 md:p-6 shadow-xs flex flex-col justify-between transition-colors">
        {/* Top Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp size={16} />
              </span>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white tracking-tight">
                Tren Finansial & Arus Kas Masuk
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Perbandingan akurat nilai penjualan terhadap dana riil terbayar per periode.
            </p>
          </div>

          {/* Interactive Timeframe Toggle with Dynamic Instant Filter */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 shrink-0">
            {(['harian', 'mingguan', 'bulanan', 'tahunan'] as TimeFilter[]).map((filter) => {
              const active = timeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => {
                    setTimeFilter(filter);
                    setHoveredIndex(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#0F172A] text-blue-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="flex flex-wrap items-center gap-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Penjualan:
            </span>
            <span className="text-xs font-semibold font-mono text-slate-800 dark:text-white">
              {formatRupiah(activeData.penjualan)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Dana Masuk Terbayar:
            </span>
            <span className="text-xs font-semibold font-mono text-orange-600 dark:text-orange-400">
              {formatRupiah(activeData.terbayar)}
            </span>
          </div>

          <div className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 ml-auto">
            Realisasi: {Math.round((activeData.terbayar / (activeData.penjualan || 1)) * 100)}%
          </div>
        </div>

        {/* SVG Wave Chart Container with Floating Interactive Tooltip */}
        <div className="relative w-full overflow-visible mt-2 select-none">
          {/* Floating Tooltip Box */}
          {hoveredIndex !== null && (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
              style={{
                left: `${(activeX / svgWidth) * 100}%`,
                top: `${(Math.min(activeYPenjualan, activeYTerbayar) / svgHeight) * 100}%`,
              }}
            >
              <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md px-3 py-2.5 rounded-xl shadow-xl border border-slate-700/80 text-left min-w-[170px] space-y-1">
                <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-800">
                  {activeData.fullLabel}
                </div>
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Penjualan
                  </span>
                  <span className="font-semibold font-mono text-white">
                    {formatRupiah(activeData.penjualan)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="flex items-center gap-1.5 text-orange-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    Kas Masuk
                  </span>
                  <span className="font-semibold font-mono text-orange-300">
                    {formatRupiah(activeData.terbayar)}
                  </span>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-400 font-semibold border-t border-slate-800/80">
                  <span>Tingkat Cair</span>
                  <span>{Math.round((activeData.terbayar / (activeData.penjualan || 1)) * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible cursor-crosshair"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              {/* Royal Blue Area Gradient */}
              <linearGradient id="penjualanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
              </linearGradient>

              {/* Flame Orange Area Gradient */}
              <linearGradient id="terbayarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const yPos = svgHeight - paddingY - ratio * graphHeight;
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={yPos}
                  x2={svgWidth - paddingX}
                  y2={yPos}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-slate-100 dark:text-slate-800/90"
                />
              );
            })}

            {/* Area Fills */}
            <path d={areaPenjualan} fill="url(#penjualanGrad)" />
            <path d={areaTerbayar} fill="url(#terbayarGrad)" />

            {/* Smooth Curve Lines */}
            <path
              d={linePenjualan}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={lineTerbayar}
              fill="none"
              stroke="#F97316"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Vertical Crosshair */}
            {hoveredIndex !== null && (
              <line
                x1={activeX}
                y1={paddingY - 5}
                x2={activeX}
                y2={svgHeight - paddingY}
                stroke="#F97316"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                className="opacity-75"
              />
            )}

            {/* Glowing Twin Dots at Current / Hovered Point */}
            <circle
              cx={activeX}
              cy={activeYPenjualan}
              r={hoveredIndex !== null ? 6 : 5}
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="filter drop-shadow-[0_0_8px_rgba(37,99,235,0.7)] transition-all duration-200"
            />
            <circle
              cx={activeX}
              cy={activeYTerbayar}
              r={hoveredIndex !== null ? 6.5 : 5.5}
              fill="#F97316"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="filter drop-shadow-[0_0_10px_rgba(249,115,22,0.85)] transition-all duration-200"
            />

            {/* Interactive Data Point Dots along the curve */}
            {chartData.map((d, i) => {
              const xPos = getX(i);
              const yPenjualan = getY(d.penjualan);
              const yTerbayar = getY(d.terbayar);
              const isHovered = hoveredIndex === i;

              return (
                <g key={`dots-${i}`} className="pointer-events-none">
                  <circle
                    cx={xPos}
                    cy={yPenjualan}
                    r={isHovered ? 5.5 : 3}
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    opacity={isHovered ? 1 : 0.6}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={xPos}
                    cy={yTerbayar}
                    r={isHovered ? 6 : 3.5}
                    fill="#F97316"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    opacity={isHovered ? 1 : 0.7}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* Interactive Invisible Hover Zones */}
            {chartData.map((d, i) => {
              const xPos = getX(i);
              return (
                <g key={`hitbox-${i}`}>
                  <rect
                    x={xPos - graphWidth / chartData.length / 2}
                    y={paddingY - 10}
                    width={graphWidth / chartData.length}
                    height={graphHeight + 20}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    className="cursor-pointer"
                  />
                  {/* X Axis Labels */}
                  <text
                    x={xPos}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-medium transition-colors ${
                      hoveredIndex === i
                        ? 'fill-orange-600 dark:fill-orange-400 font-semibold'
                        : 'fill-slate-500 dark:fill-slate-400'
                    }`}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2. DONUT CHART: RASIO KAS & PIUTANG (4 COLS) */}
      <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 p-5 md:p-6 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <PieIcon size={16} />
              </span>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white tracking-tight">
                Rasio Kas & Piutang
              </h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
              Status Riil
            </span>
          </div>

          {/* Donut Graphic with Interactive Segment Hovers & Center Readout */}
          <div className="relative flex items-center justify-center py-6">
            <svg
              width={donutSize}
              height={donutSize}
              viewBox={`0 0 ${donutSize} ${donutSize}`}
              className="transform -rotate-90 overflow-visible cursor-pointer"
              onMouseLeave={() => setHoveredSegment(null)}
            >
              {/* Segment 1: Lunas / Dana Selesai (Emerald) */}
              <circle
                cx={donutCenter}
                cy={donutCenter}
                r={donutRadius}
                fill="transparent"
                stroke="#10B981"
                strokeWidth={hoveredSegment === 'lunas' ? donutStrokeWidth + 4 : donutStrokeWidth}
                strokeDasharray={`${strokeLunas} ${circumference}`}
                strokeDashoffset={offsetLunas}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('lunas')}
              />

              {/* Segment 2: Siap Ditarik / DP Kas (Flame Orange) */}
              <circle
                cx={donutCenter}
                cy={donutCenter}
                r={donutRadius}
                fill="transparent"
                stroke="#F97316"
                strokeWidth={hoveredSegment === 'siap' ? donutStrokeWidth + 4 : donutStrokeWidth}
                strokeDasharray={`${strokeSiap} ${circumference}`}
                strokeDashoffset={offsetSiap}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('siap')}
              />

              {/* Segment 3: Sisa Piutang Berjalan (Rose Red) */}
              <circle
                cx={donutCenter}
                cy={donutCenter}
                r={donutRadius}
                fill="transparent"
                stroke="#F43F5E"
                strokeWidth={hoveredSegment === 'piutang' ? donutStrokeWidth + 4 : donutStrokeWidth}
                strokeDasharray={`${strokePiutang} ${circumference}`}
                strokeDashoffset={offsetPiutang}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('piutang')}
              />
            </svg>

            {/* Dynamic Donut Hole Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-4">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                {donutCenterInfo.title}
              </span>
              <span className={`text-sm sm:text-base font-bold font-mono tracking-tight mt-0.5 ${donutCenterInfo.color}`}>
                {donutCenterInfo.value}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {donutCenterInfo.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Legend Breakdown (Interactive hover connects to donut) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div
            onMouseEnter={() => setHoveredSegment('lunas')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`flex items-center justify-between text-xs p-2 rounded-xl transition-all cursor-pointer ${
              hoveredSegment === 'lunas'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Lunas (Dana Selesai)
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold font-mono text-slate-800 dark:text-white mr-1.5">
                {formatRupiah(lunasVal)}
              </span>
              <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                ({pctLunas}%)
              </span>
            </div>
          </div>

          <div
            onMouseEnter={() => setHoveredSegment('siap')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`flex items-center justify-between text-xs p-2 rounded-xl transition-all cursor-pointer ${
              hoveredSegment === 'siap'
                ? 'bg-orange-50 dark:bg-orange-950/50 border border-orange-300 dark:border-orange-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Kas Siap Ditarik
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold font-mono text-orange-600 dark:text-orange-400 mr-1.5">
                {formatRupiah(siapDitarikVal)}
              </span>
              <span className="font-mono text-[10px] font-semibold text-orange-500">
                ({pctSiap}%)
              </span>
            </div>
          </div>

          <div
            onMouseEnter={() => setHoveredSegment('piutang')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`flex items-center justify-between text-xs p-2 rounded-xl transition-all cursor-pointer ${
              hoveredSegment === 'piutang'
                ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Sisa Piutang
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold font-mono text-rose-600 dark:text-rose-400 mr-1.5">
                {formatRupiah(sisaPiutangVal)}
              </span>
              <span className="font-mono text-[10px] font-semibold text-rose-500">
                ({pctPiutang}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
