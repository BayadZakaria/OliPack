
import React from 'react';
import { Leaf, Droplets } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "", iconOnly = false, variant = 'dark' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Fond du logo : une forme de goutte stylisée pour l'olive */}
        <div className="w-10 h-10 bg-emerald-600 rounded-tr-[1.2rem] rounded-bl-[1.2rem] rounded-tl-lg rounded-br-lg shadow-lg rotate-12 flex items-center justify-center relative overflow-hidden group-hover:rotate-0 transition-transform duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent"></div>
          <Leaf className="w-5 h-5 text-white relative z-10" />
        </div>
        {/* Petit détail : goutte d'huile/margine */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-950 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={`text-xl font-black tracking-tighter ${variant === 'light' ? 'text-white' : 'text-slate-900'}`}>
            Oli<span className="text-emerald-600 italic">Pack</span>
          </span>
          <span className={`text-[7px] font-bold uppercase tracking-[0.2em] ${variant === 'light' ? 'text-emerald-200/60' : 'text-slate-400'}`}>
            L'Or Vert du Maroc
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
