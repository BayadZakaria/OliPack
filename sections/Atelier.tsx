
import React from 'react';
import { 
  Lightbulb, 
  Target, 
  Cpu, 
  BrainCircuit, 
  Globe, 
  Award,
  CheckCircle2,
  Database,
  Info
} from 'lucide-react';

const Atelier: React.FC = () => {
  return (
    <div className="space-y-10 animate-in pb-20 max-w-5xl">
      
      {/* HEADER ÉPURÉ */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
          <Info className="w-3 h-3" /> Information & Vision du Projet
        </div>
        <h1 className="text-4xl font-bold text-slate-900">
          OliPack : Innovation Durable au Maroc
        </h1>
        <p className="text-slate-600 max-w-2xl text-lg">
          Transformation numérique et industrielle des sous-produits oléicoles.
        </p>
      </section>

      {/* CONCEPT BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="bg-red-50 text-red-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Le Défi Écologique</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Les margines polluent les sols et l'eau. OliPack agit comme une barrière technologique pour stopper cette pollution et valoriser le déchet.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Notre Réponse</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Une interface SaaS liée à des capteurs IoT permettant une gestion optimale et une transformation industrielle de haute qualité.
          </p>
        </div>
      </div>

      {/* TECH PILLARS */}
      <section className="bg-slate-900 text-white rounded-[2rem] p-10 space-y-8 shadow-xl">
        <h2 className="text-2xl font-bold text-center">Architecture Technique du Projet</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/10">
               <Cpu className="w-7 h-7 text-emerald-400" />
             </div>
             <h4 className="font-bold text-sm uppercase tracking-wider">Couche IoT</h4>
             <p className="text-xs text-slate-400">Capteurs pH et Niveau sur ESP32.</p>
          </div>
          <div className="text-center space-y-3">
             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/10">
               <BrainCircuit className="w-7 h-7 text-emerald-400" />
             </div>
             <h4 className="font-bold text-sm uppercase tracking-wider">Moteur IA</h4>
             <p className="text-xs text-slate-400">Analyse de qualité via Gemini API.</p>
          </div>
          <div className="text-center space-y-3">
             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/10">
               <Database className="w-7 h-7 text-emerald-400" />
             </div>
             <h4 className="font-bold text-sm uppercase tracking-wider">Cloud Data</h4>
             <p className="text-xs text-slate-400">Supabase & PostgreSQL sécurisé.</p>
          </div>
        </div>
      </section>

      {/* FINAL STATEMENT */}
      <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
         <p className="text-slate-600 italic">
           "La technologie n'est utile que si elle sert la nature. OliPack est la preuve que le digital peut réparer notre terroir."
         </p>
         <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">ZB</div>
            <span className="text-xs font-bold text-slate-900">Zakaria Bayad — Porteur de Projet</span>
         </div>
      </div>
    </div>
  );
};

export default Atelier;
