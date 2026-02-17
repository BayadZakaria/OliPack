
import React, { useState } from 'react';
import { 
  Leaf, 
  Cloud, 
  Droplets, 
  Trees, 
  Coins, 
  ArrowUpRight, 
  Info, 
  BarChart3,
  Factory,
  Globe
} from 'lucide-react';

const ImpactCalculator: React.FC = () => {
  const [wasteVolume, setWasteVolume] = useState(50); // Tonnes par mois

  // Facteurs d'impact (estimations scientifiques)
  // 1 tonne de margine traitée = env. 120kg de CO2 évité
  // 1 tonne de margine traitée = env. 15,000 litres d'eau protégée
  const co2Avoided = (wasteVolume * 120) / 1000; // Tonnes CO2
  const treesEquivalent = Math.floor(co2Avoided * 45); // Arbres sauvés (estimé)
  const waterProtected = (wasteVolume * 15000) / 1000; // Milliers de m3
  const carbonCreditsValue = co2Avoided * 850; // DH (valeur marché carbone estimée)

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Leaf className="text-emerald-600" />
            Impact & Or Vert
          </h1>
          <p className="text-slate-500">Valorisation environnementale et financière d'OliPack.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
           <Globe className="w-4 h-4 text-emerald-600" />
           <span className="text-xs font-bold text-emerald-700 uppercase tracking-tighter">Engagement COP22 - Maroc</span>
        </div>
      </header>

      {/* Simulator Slider */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-slate-800">Volume de Déchets Traités</h2>
              <p className="text-sm text-slate-400">Ajustez pour simuler votre impact mensuel</p>
            </div>
            <div className="text-4xl font-black text-emerald-600 bg-emerald-50 px-6 py-2 rounded-2xl border border-emerald-100">
              {wasteVolume} <span className="text-lg font-bold">Tonnes / mois</span>
            </div>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="1000" 
            step="10"
            value={wasteVolume} 
            onChange={(e) => setWasteVolume(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-4"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            <span>0 T</span>
            <span>500 T</span>
            <span>1000 T (Objectif 2027)</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      </section>

      {/* Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ImpactMetric 
          icon={Cloud} 
          label="CO2 Évité" 
          value={`${co2Avoided.toFixed(1)} t`} 
          color="text-slate-600" 
          bgColor="bg-slate-100" 
          desc="Équivalent gaz d'échappement"
        />
        <ImpactMetric 
          icon={Trees} 
          label="Équivalent Arbres" 
          value={`${treesEquivalent}`} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
          desc="Arbres plantés par an"
        />
        <ImpactMetric 
          icon={Droplets} 
          label="Eau Protégée" 
          value={`${waterProtected.toFixed(1)} km³`} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
          desc="Nappes phréatiques sauvées"
        />
        <ImpactMetric 
          icon={Coins} 
          label="Crédits Carbone" 
          value={`${carbonCreditsValue.toLocaleString()} DH`} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
          desc="Potentiel Revenu Additionnel"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ecological Vision Card */}
        <div className="lg:col-span-2 bg-emerald-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl group">
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2 font-serif italic">
              <Factory className="text-emerald-400" /> 
              La Mission "Or Vert"
            </h3>
            <p className="text-emerald-100 leading-relaxed max-w-2xl">
              Au Maroc, le secteur de l'huile d'olive est une fierté nationale, mais ses déchets sont un poison silencieux. OliPack transforme cette fatalité en opportunité. En traitant {wasteVolume} tonnes par mois, vous n'éliminez pas seulement un déchet : 
              <strong> vous produisez une énergie qui remplace le fioul lourd.</strong>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/5 flex items-start gap-3">
                 <div className="bg-emerald-500/30 p-2 rounded-xl">
                   <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                 </div>
                 <div>
                   <h4 className="font-bold text-sm">Valorisation des Grignons</h4>
                   <p className="text-[10px] text-emerald-200 uppercase mt-1">Énergie biomasse immédiate</p>
                 </div>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/5 flex items-start gap-3">
                 <div className="bg-emerald-500/30 p-2 rounded-xl">
                   <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                 </div>
                 <div>
                   <h4 className="font-bold text-sm">Traitement des Margines</h4>
                   <p className="text-[10px] text-emerald-200 uppercase mt-1">Vers le Bioplastique PHA</p>
                 </div>
              </div>
            </div>
          </div>
          <Leaf className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
        </div>

        {/* Methodology & Credits Info */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Info className="text-blue-500 w-5 h-5" /> Méthodologie
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              Les calculs sont basés sur le protocole "GHG Protocol" pour le secteur agro-industriel. Les crédits carbone sont estimés à un cours moyen de 85 DH par tonne de CO2 équivalent.
            </p>
            <div className="pt-4 border-t border-slate-50">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score ESG</span>
                 <span className="text-xs font-bold text-emerald-600">Grade A+</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[92%]"></div>
               </div>
            </div>
          </div>
          
          <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
            <BarChart3 className="w-4 h-4" /> Générer Rapport Impact
          </button>
        </div>
      </div>
    </div>
  );
};

const ImpactMetric: React.FC<{ icon: any; label: string; value: string; color: string; bgColor: string; desc: string }> = ({ icon: Icon, label, value, color, bgColor, desc }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-emerald-200 transition-colors">
    <div className={`${bgColor} ${color} w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
      <p className="text-[10px] text-slate-400 mt-1 italic">{desc}</p>
    </div>
  </div>
);

export default ImpactCalculator;
