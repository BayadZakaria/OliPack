
import React from 'react';
import { TrendingUp, BarChart3, FlaskConical, CheckCircle2, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Strategy: React.FC = () => {
  const financialData = [
    { month: 'J', rev: 35200 }, { month: 'F', rev: 38000 }, { month: 'M', rev: 42000 },
    { month: 'A', rev: 41000 }, { month: 'M', rev: 45000 }, { month: 'J', rev: 48000 },
  ];

  return (
    <div className="space-y-3 animate-in pb-4">
      <div className="grid grid-cols-2 gap-2">
        <PhaseCard phase="1" title="Cash-Flow" color="bg-emerald-900" icon={Clock} list={["Low-cost", "Local", "Revenus"]} />
        <PhaseCard phase="2" title="Innovation" color="bg-slate-800" icon={FlaskConical} list={["Bioréacteur", "Export", "PHA"]} />
      </div>

      <section className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
        <h2 className="text-[10px] font-bold flex items-center gap-1.5 mb-2 uppercase">
          <BarChart3 className="text-emerald-600 w-3 h-3" /> Simulation (DH/kg)
        </h2>
        <div className="h-28 w-full mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="rev" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatMini label="Revient" val="0,90" />
          <StatMini label="Vente" val="1,60" />
          <StatMini label="Marge" val="+12k" highlight />
        </div>
      </section>
    </div>
  );
};

const PhaseCard: React.FC<{ phase: string, title: string, color: string, icon: any, list: string[] }> = ({ phase, title, color, icon: Icon, list }) => (
  <div className={`${color} text-white p-3 rounded-lg relative overflow-hidden`}>
    <div className="relative z-10 space-y-1">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[6px] font-bold px-1 py-0.5 bg-white/10 rounded uppercase">P{phase}</span>
        <Icon className="w-2.5 h-2.5 text-emerald-400" />
      </div>
      <h3 className="text-[10px] font-bold">{title}</h3>
      <ul className="text-[8px] opacity-70">
        {list.map((it, i) => <li key={i} className="flex items-center gap-1">✓ {it}</li>)}
      </ul>
    </div>
  </div>
);

const StatMini: React.FC<{ label: string, val: string, highlight?: boolean }> = ({ label, val, highlight }) => (
  <div className={`p-1.5 rounded border border-slate-50 ${highlight ? 'bg-emerald-50' : 'bg-slate-50'}`}>
    <p className="text-[6px] font-black text-slate-400 uppercase">{label}</p>
    <p className={`text-[9px] font-bold ${highlight ? 'text-emerald-600' : 'text-slate-700'}`}>{val}</p>
  </div>
);

export default Strategy;
