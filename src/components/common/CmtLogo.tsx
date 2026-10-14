import React from 'react';

interface CmtLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showText?: boolean;
  subtext?: string;
}

export const CmtLogo: React.FC<CmtLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  subtext = 'UNIDADE BALSAS — PMMA',
}) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    hero: 'w-36 h-36',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.svg"
        alt="Brasão Oficial do Colégio Militar Tiradentes XVII - Balsas/MA"
        className={`${sizeMap[size]} object-contain drop-shadow-sm select-none transition-transform duration-200 hover:scale-105`}
        onError={(e) => {
          // Fallback caso logo.svg demore a carregar
          const target = e.currentTarget;
          if (target.src.endsWith('/logo.svg')) {
            target.src = '/logo.png';
          }
        }}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold tracking-tight text-slate-900 leading-none text-base md:text-lg">
            COLÉGIO MILITAR <span className="text-blue-900">TIRADENTES XVII</span>
          </span>
          <span className="text-[11px] font-semibold text-red-700 tracking-wider uppercase mt-0.5">
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
};
