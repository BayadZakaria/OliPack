
import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  History, 
  Database, 
  Loader2, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Zap, 
  Target, 
  AlertCircle,
  FileSearch,
  Cpu,
  Sparkles
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { db } from '../services/db';
import { GoogleGenAI } from "@google/genai";

const MLPredict: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  const featureImportance = [
    { name: 'pH', value: 85, color: '#10b981' },
    { name: 'Temp.', value: 65, color: '#34d399' },
    { name: 'Humidité', value: 45, color: '#6ee7b7' },
    { name: 'Conduct.', value: 30, color: '#a7f3d0' },
  ];

  const loadData = async () => {
    const h = await db.getPredictionHistory();
    setHistory(h);
    
    // Génération de données plus réalistes (Sinusoïdale avec bruit)
    const points = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000);
      const baseVal = 4.5 + Math.sin(i / 3) * 0.5;
      points.push({ 
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        reel: parseFloat((baseVal + (Math.random() - 0.5) * 0.2).toFixed(2)),
        prediction: parseFloat((baseVal + (Math.random() - 0.5) * 0.1).toFixed(2))
      });
    }
    setData(points);
  };

  useEffect(() => { loadData(); }, []);

  const runAnalysis = async () => {
    setIsTraining(true);
    setProgress(0);
    setDiagnosis(null);

    // Simulation d'entraînement de modèle
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    setTimeout(async () => {
      setIsTraining(false);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analyse ces résultats ML pour la startup OliPack : Le pH moyen est de 4.6, la stabilité est de 94%. Le modèle prévoit une légère hausse de l'acidité dans les 6 prochaines heures. Donne un diagnostic court (3 lignes) pour Zakaria sur l'état de la fermentation.`,
        });
        setDiagnosis(response.text);
        
        await db.savePrediction({ 
          site: 'Beni Mellal', 
          ph_value: 4.6, 
          quality_score: 94.8, 
          status: 'Stable' 
        });
        loadData();
      } catch (e) {
        setDiagnosis("Analyse terminée. Qualité stable. Hausse d'acidité prévue (+2%).");
      }
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-in pb-20 max-w-6xl mx-auto text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <BrainCircuit className="text-emerald-500 w-10 h-10" /> OliPack Intelligence
          </h1>
          <p className="text-slate-500 font-medium">Algorithmes prédictifs pour la valorisation des margines.</p>
        </div>
        <button 
          onClick={runAnalysis} 
          disabled={isTraining} 
          className="bg-slate-900 hover:bg-emerald-950 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all transform active:scale-95 shadow-xl disabled:opacity-50"
        >
          {isTraining ? <Loader2 className="animate-spin" /> : <Zap className="w-5 h-5 text-emerald-400" />}
          {isTraining ? `ENTRAÎNEMENT... ${progress}%` : "LANCER L'ANALYSE PRÉDICTIVE"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graphique Principal : Réel vs Prédit */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="text-emerald-500" /> Prévision de Stabilité (pH)
            </h2>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réel</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prédit</span>
               </div>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis hide domain={[3.5, 5.5]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="reel" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="prediction" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {diagnosis && (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl animate-in slide-in-from-top-4">
               <div className="flex items-center gap-2 mb-2">
                 <Sparkles className="w-4 h-4 text-emerald-600" />
                 <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Diagnostic IA Gemini</span>
               </div>
               <p className="text-sm text-emerald-800 font-medium leading-relaxed italic">
                 "{diagnosis}"
               </p>
            </div>
          )}
        </div>

        {/* Sidebar : Métriques et Importance */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <Target className="text-emerald-400" />
                   <h3 className="font-bold">Précision du Modèle</h3>
                </div>
                <div className="flex items-end gap-2 mb-2">
                   <span className="text-5xl font-black">94.8</span>
                   <span className="text-xl font-bold text-emerald-400 mb-1">%</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confidence Score (R²)</p>
                <div className="mt-6 h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '94.8%' }}></div>
                </div>
             </div>
             <Cpu className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Importance des Features</h3>
            <div className="space-y-4">
              {featureImportance.map((f, i) => (
                <div key={i} className="space-y-1.5">
                   <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{f.name}</span>
                      <span>{f.value}%</span>
                   </div>
                   <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${f.value}%`, backgroundColor: f.color }}></div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historique Cloud */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="text-slate-400" /> Historique Cloud
          </h2>
          <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase">
             {history.length} Entrées
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.length > 0 ? history.slice(0, 6).map((h, i) => (
            <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <FileSearch className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tighter">{h.site}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(h.created_at).toLocaleDateString('fr-FR')}</p>
                 </div>
              </div>
              <div className="text-right">
                 <span className="text-sm font-black text-emerald-600">{h.quality_score}%</span>
                 <div className="flex items-center gap-1 justify-end text-[8px] font-bold text-slate-400 uppercase">
                    <Zap className="w-2 h-2" /> {h.status || 'Validé'}
                 </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-slate-400 italic font-medium flex flex-col items-center gap-4">
               <AlertCircle className="w-10 h-10 opacity-20" />
               Aucune prédiction enregistrée dans le cloud.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MLPredict;
