
import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Droplets, 
  Beaker, 
  Activity, 
  Zap, 
  Microscope, 
  Info, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const QualityControl: React.FC = () => {
  // Lab State
  const [water, setWater] = useState(1000);
  const [sugar, setSugar] = useState(75);
  const [yeast, setYeast] = useState(10);
  const [nutrients, setNutrients] = useState(20);
  const [neutralization, setNeutralization] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'MIXING' | 'FERMENTATION' | 'READY'>('IDLE');

  const startTreatment = () => {
    setIsProcessing(true);
    setPhase('MIXING');
    setNeutralization(0);
  };

  useEffect(() => {
    let interval: any;
    if (isProcessing && neutralization < 100) {
      interval = setInterval(() => {
        setNeutralization(prev => {
          const next = prev + 2;
          if (next >= 30 && next < 80) setPhase('FERMENTATION');
          if (next >= 100) {
            setPhase('READY');
            setIsProcessing(false);
            return 100;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isProcessing, neutralization]);

  const efficiency = parseFloat(Math.min(99.9, (yeast * 4 + (sugar/10) * 2 + (nutrients/5) * 1 + 30)).toFixed(1));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
             <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg">
                <Microscope className="text-white w-7 h-7" />
             </div>
             Bio-Laboratoire
          </h1>
          <p className="text-slate-500 font-medium ml-1 mt-1 uppercase text-[10px] tracking-widest font-black">Valorisation & Neutralisation</p>
        </div>
      </header>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <IngredientCard icon={Droplets} label="Eau Purifiée" value={`${water} L`} color="text-blue-500" bgColor="bg-blue-50" onUpdate={setWater} max={2000} />
          <IngredientCard icon={Zap} label="Agents de Carbonisation" value={`${sugar} g`} color="text-amber-500" bgColor="bg-amber-50" onUpdate={setSugar} max={200} />
          <IngredientCard icon={Microscope} label="Culture Bio (Khamira)" value={`${yeast} g`} color="text-emerald-500" bgColor="bg-emerald-50" onUpdate={setYeast} max={20} />
          <IngredientCard icon={Beaker} label="Nutriments de Stabilisation" value={`${nutrients} g`} color="text-orange-700" bgColor="bg-orange-50" onUpdate={setNutrients} max={100} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Beaker className="text-emerald-600" /> Processus de Fermentation</h2>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${phase === 'READY' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                Phase : {phase}
              </span>
            </div>
            <div className="relative h-72 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 mb-8 flex items-end shadow-inner">
              <div className="w-full bg-gradient-to-t from-emerald-950 to-emerald-600 transition-all duration-700 relative" style={{ height: `${40 + (neutralization * 0.5)}%` }}>
                 <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="absolute bottom-0 w-2 h-2 bg-white/30 rounded-full animate-bubble" style={{ left: `${Math.random()*100}%`, animationDelay: `${Math.random()*2}s` }}></div>
                    ))}
                 </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                 <p className="text-7xl font-black text-slate-900 drop-shadow-md">{neutralization}%</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Niveau de neutralisation</p>
              </div>
            </div>
            <button onClick={startTreatment} disabled={isProcessing || phase === 'READY'} className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs shadow-xl active:scale-95 disabled:opacity-50 transition-all hover:bg-emerald-700 flex items-center justify-center gap-3">
              {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
              {isProcessing ? 'TRANSFORMATION EN COURS...' : 'LANCER LA VALORISATION BIO'}
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
             <div className="space-y-6 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficacité du Batch</p>
                <div className="text-6xl font-black text-emerald-600 tracking-tighter">{efficiency}%</div>
                <div className="space-y-3 pt-4">
                   <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500" style={{ width: `${efficiency}%` }}></div></div>
                </div>
             </div>
             <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                <h3 className="text-xs font-black text-emerald-800 uppercase flex items-center gap-2 mb-3"><Info className="w-4 h-4" /> Spécifications Labo</h3>
                <p className="text-[10px] text-emerald-700 leading-relaxed font-medium uppercase">
                  Température cible : 28.5°C<br/>
                  Densité bio-polymère : 1.2g/cm³<br/>
                  Status : {phase === 'READY' ? 'PRÊT POUR MOULAGE' : 'CALIBRAGE...'}
                </p>
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bubble {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        .animate-bubble {
          animation: bubble 3s infinite ease-in;
        }
      `}</style>
    </div>
  );
};

const IngredientCard: React.FC<{ icon: any, label: string, value: string, color: string, bgColor: string, onUpdate: (val: number) => void, max: number }> = ({ icon: Icon, label, value, color, bgColor, onUpdate, max }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group">
    <div className="flex items-center gap-4 mb-4">
      <div className={`${bgColor} ${color} p-4 rounded-xl group-hover:scale-110 transition-transform`}><Icon className="w-5 h-5" /></div>
      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p><h4 className={`text-lg font-black ${color}`}>{value}</h4></div>
    </div>
    <input type="range" min="0" max={max} value={parseInt(value)} onChange={(e) => onUpdate(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 shadow-inner" />
  </div>
);

export default QualityControl;
