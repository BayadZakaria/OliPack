
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Quote } from 'lucide-react';

const Pitch: React.FC = () => {
  const slides = [
    { time: "0-15s", title: "Constat", content: "Les margines polluent Beni Mellal. C'est un déchet coûteux pour le producteur.", bg: "bg-slate-900" },
    { time: "15-35s", title: "Solution", content: "OliPack : IoT + Valorisation. On transforme ce poison en bioplastique.", bg: "bg-emerald-900" },
    { time: "35-60s", title: "Vision", content: "Réalisme économique. Bio-charbon Phase 1 pour financer le PHA Phase 2.", bg: "bg-emerald-700" }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4 animate-in">
      <div className="flex justify-between items-center">
        <h1 className="text-xs font-black uppercase tracking-widest text-slate-400">Pitch Mode (60s)</h1>
        <div className="flex gap-1">
          <button onClick={() => setCurrent(Math.max(0, current - 1))} className="p-1 border rounded hover:bg-slate-50 disabled:opacity-30" disabled={current === 0}><ChevronLeft size={14} /></button>
          <button onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))} className="p-1 border rounded hover:bg-slate-50 disabled:opacity-30" disabled={current === slides.length - 1}><ChevronRight size={14} /></button>
        </div>
      </div>

      <div className={`${slides[current].bg} rounded-xl p-6 text-white min-h-[160px] flex flex-col justify-center relative overflow-hidden`}>
        <Quote className="absolute top-2 right-2 w-8 h-8 opacity-10" />
        <div className="relative z-10 space-y-2">
          <span className="text-[7px] font-mono border border-white/20 px-1.5 py-0.5 rounded uppercase">{slides[current].time}</span>
          <h2 className="text-lg font-bold leading-tight italic">"{slides[current].content}"</h2>
          <p className="text-[8px] font-bold text-emerald-400">— Zakaria Bayad</p>
        </div>
      </div>
    </div>
  );
};

export default Pitch;
