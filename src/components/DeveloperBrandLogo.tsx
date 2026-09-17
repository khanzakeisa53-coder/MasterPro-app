import React from 'react';

interface DeveloperBrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light' | 'auto';
  showSubtitle?: boolean;
}

/**
 * Official 3D Monogram "J" Logo in Flame Orange gloss & Electric Royal Blue
 * Transparent background (no black/squircle container box), seamlessly blending into topbar.
 */
export const OfficialLogoJ: React.FC<{ sizeClass?: string; className?: string }> = ({
  sizeClass = 'w-9 h-9',
  className = '',
}) => (
  <div className={`relative shrink-0 ${sizeClass} select-none group flex items-center justify-center ${className}`}>
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full filter drop-shadow-[0_4px_14px_rgba(230,81,0,0.35)] transition-transform duration-200 group-hover:scale-105"
    >
      <defs>
        {/* Flame Orange Gloss Top & Spine Gradient */}
        <linearGradient id="jacsOrangeGrad" x1="20%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA726" />
          <stop offset="25%" stopColor="#FF7043" />
          <stop offset="60%" stopColor="#FF5722" />
          <stop offset="85%" stopColor="#E65100" />
          <stop offset="100%" stopColor="#BF360C" />
        </linearGradient>

        {/* Top Edge Specular Gloss */}
        <linearGradient id="jacsOrangeGloss" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFE0B2" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF8A65" stopOpacity="0" />
        </linearGradient>

        {/* Electric Royal Blue Ribbon Gradient */}
        <linearGradient id="jacsBlueGrad" x1="0%" y1="20%" x2="100%" y2="90%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="20%" stopColor="#2979FF" />
          <stop offset="50%" stopColor="#1565C0" />
          <stop offset="80%" stopColor="#0D47A1" />
          <stop offset="100%" stopColor="#061A40" />
        </linearGradient>

        {/* Blue Inner 3D Shading */}
        <linearGradient id="jacsBlueShade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E88E5" />
          <stop offset="100%" stopColor="#020B1E" />
        </linearGradient>

        {/* Blue Specular Highlight on Curved Loop */}
        <linearGradient id="jacsBlueHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="40%" stopColor="#80D8FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0091EA" stopOpacity="0" />
        </linearGradient>

        {/* 3D Drop Shadow Under Ribbon */}
        <filter id="jacsInnerGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* 1. BACK SHADOW / AMBIENT DEPTH */}
      <path
        d="M34 10 L88 12 C91 12 93 14 92 18 L68 82 C60 96 42 98 28 94 C16 90 12 76 12 65 C12 60 16 56 21 56 L29 56 C34 56 36 59 36 63 C36 71 42 78 50 78 C59 78 64 71 67 62 L74 34 L36 34 C30 34 26 29 27 23 L30 14 C31 11 32 10 34 10 Z"
        fill="#040914"
        opacity="0.25"
        transform="translate(1.5, 3)"
      />

      {/* 2. ORANGE 3D BODY & RIGHT SPINE (Outer shell) */}
      <path
        d="M34 8 L90 10 C92.5 10.1 93.8 12.8 92.4 14.8 L70.5 78 C62.5 95 44 98 28 93.5 C15.5 89.5 10.5 76.5 10.5 64.5 C10.5 59.5 14.5 55.5 19.5 55.5 L28 55.5 C33 55.5 35.5 58.5 35.5 63 C35.5 71 42 78 51 78 C59.5 78 64.5 71 67.5 61 L75.5 32 L36 32 C30.5 32 26 27 27.5 21.5 L30.5 12.5 C31.2 9.8 32.5 8 34 8 Z"
        fill="url(#jacsOrangeGrad)"
      />

      {/* Orange Upper Gloss Facet */}
      <path
        d="M34 8 L90 10 C92 10.1 93 11.5 92 13.5 L84 32 L36 32 C30.5 32 26.5 27.5 28 22 L30.5 12.5 C31.2 9.8 32.5 8 34 8 Z"
        fill="url(#jacsOrangeGloss)"
      />

      {/* 3. BLUE 3D INNER HOOK & RIBBON (Sweeping from top-right interior to bottom loop) */}
      <path
        d="M74 24 L56 50 C51 57 45 64 36 67 C25 70 14 65 14 55 C14 47 22 41 31 41 C36 41 40 43 44 47 L62 26 C66 21 71 20 74 24 Z"
        fill="url(#jacsBlueShade)"
        opacity="0.6"
      />

      {/* Main Electric Royal Blue Ribbon */}
      <path
        d="M72 24 L48 54 C44 59 39 63 32 64 C23 65 15 60 15 52 C15 45 22 39 31 39 C36.5 39 42 41.5 46 45.5 L63 26 C66.5 22 70 21.5 72 24 Z"
        fill="url(#jacsBlueGrad)"
        filter="url(#jacsInnerGlow)"
      />

      {/* Blue Ribbon Curving Hook (Lower front turn) */}
      <path
        d="M15 54 C15 67 25 78 39 80 C50 81.5 60 75 66 65 L73 40 L62 40 L56 58 C52 66 45 70 38 69 C28 68 22 60 22 51 C22 47 24 43 27 41 L18 43 C16 46 15 50 15 54 Z"
        fill="url(#jacsBlueGrad)"
      />

      {/* Specular Highlight Rim on Blue J Hook */}
      <path
        d="M18 53 C18 64 26 73 38 75 C48 76.5 57 71 63 62 L64 59 C58 67 50 72 40 71 C29 70 23 62 23 52 C23 48 25 44 28 42 L25 43 C20 46 18 49 18 53 Z"
        fill="url(#jacsBlueHighlight)"
      />

      {/* Specular Glint Highlight on the Orange Top Corner */}
      <circle cx="88" cy="14" r="2.5" fill="#FFFFFF" opacity="0.95" />
      <line x1="42" y1="11" x2="78" y2="13" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  </div>
);

export const DeveloperBrandLogo: React.FC<DeveloperBrandLogoProps> = ({
  size = 'md',
  theme = 'auto',
  showSubtitle = false,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const logoSize = isSm ? 'w-8 h-8' : isLg ? 'w-11 h-11' : 'w-9 h-9';

  const isStrictDark = theme === 'dark';
  const primaryTextColor = isStrictDark ? 'text-white' : 'text-[#0F172A] dark:text-white';
  const subtitleColor = isStrictDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400';
  const dividerColor = isStrictDark ? 'bg-slate-800' : 'bg-slate-200 dark:bg-slate-800';

  return (
    <div className="inline-flex items-center gap-2.5 sm:gap-3 select-none">
      {/* 1. SEKSI IDENTITAS PENGEMBANG: Logo "J" + developer "JacS Enterprise" */}
      <div className="flex items-center gap-2 shrink-0">
        <OfficialLogoJ sizeClass={logoSize} />

        <div className="flex flex-col justify-center leading-tight">
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#FF5722]">
            Developer
          </span>
          <span className={`text-[11px] sm:text-xs font-bold tracking-tight ${subtitleColor} whitespace-nowrap`}>
            JacS Enterprise
          </span>
        </div>
      </div>

      {/* Pembatas Tegas (Vertical Divider) */}
      <div className={`w-px h-5 sm:h-6 ${dividerColor} shrink-0`} />

      {/* 2. SEKSI JUDUL RESMI APLIKASI: "MasterPro APP" */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`font-black tracking-tight ${primaryTextColor} ${
            isSm ? 'text-xs sm:text-sm' : isLg ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          } whitespace-nowrap`}
        >
          MasterPro <span className="text-[#0284C7] dark:text-[#38BDF8]">APP</span>
        </span>

        {/* Badge Status */}
        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          OPS v25+
        </span>
      </div>
    </div>
  );
};
