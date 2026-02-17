
import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Waves, 
  CheckCircle, 
  Truck, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Gauge,
  XCircle,
  MapPin,
  Factory,
  User,
  Phone,
  Mail,
  Shield,
  BrainCircuit,
  RefreshCcw,
  Lock
} from 'lucide-react';
import { db, MAASSRAS_DATA } from '../services/db';
import { GoogleGenAI } from "@google/genai";
import { UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isHuilerie = user?.role === 'HUILERIE';
  const isTechnicien = user?.role === 'TECHNICIEN';
  const isAdmin = user?.role === 'ADMIN';
  
  // Ville de l'utilisateur (Technicien ou autre)
  const userCity = user?.ville || "Beni Mellal";
  
  // Pour un technicien, on restreint strictement à sa ville
  const defaultRegion = isTechnicien ? userCity : userCity;
  const availableRegions = isTechnicien ? [userCity] : Object.keys(MAASSRAS_DATA);
  
  const [selectedRegion, setSelectedRegion] = useState(defaultRegion);
  const [selectedMaassra, setSelectedMaassra] = useState("");
  
  const [niveau, setNiveau] = useState(75);
  const [isCollecting, setIsCollecting] = useState(false);
  const [temp, setTemp] = useState(24.2);
  const [ph, setPh] = useState(4.5);
  const [aiVerdict, setAiVerdict] = useState<string>("");

  useEffect(() => {
    // Initialisation de la Maâssra par défaut pour la région sélectionnée
    const maassrasInRegion = MAASSRAS_DATA[selectedRegion] || [];
    if (isHuilerie) {
      setSelectedMaassra(`Maâssra ${user?.prenom}`);
    } else if (maassrasInRegion.length > 0 && !maassrasInRegion.includes(selectedMaassra)) {
      setSelectedMaassra(maassrasInRegion[0]);
    }
  }, [selectedRegion, isHuilerie, user]);

  useEffect(() => {
    // Simulation de données en temps réel
    const interval = setInterval(() => {
      setTemp(prev => parseFloat((prev + (Math.random() - 0.5) * 0.2).toFixed(1)));
      setPh(prev => parseFloat(Math.max(3.0, Math.min(7.0, prev + (Math.random() - 0.5) * 0.05)).toFixed(2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isTempHigh = temp > 32;
  const isPhBad = ph < 3.8 || ph > 5.8;
  const isLotBad = isTempHigh || isPhBad;

  useEffect(() => {
    const fetchAiVerdict = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analyse IoT OliPack pour ${selectedMaassra} à ${selectedRegion}: Temp=${temp}°C, pH=${ph}. Si Temp > 32 ou pH hors [3.8-5.8], le lot est NON-CONFORME. Explique brièvement pourquoi en tant qu'expert en bioplastique PHA.`,
        });
        setAiVerdict(response.text || "Analyse en attente...");
      } catch (e) {
        setAiVerdict(isLotBad ? "ALERTE : Anomalie détectée. Qualité critique pour la transformation PHA." : "Lot conforme et prêt pour valorisation.");
      }
    };
    if (selectedMaassra) fetchAiVerdict();
  }, [temp, ph, selectedMaassra, selectedRegion, isLotBad]);

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 text-center md:text-left">
          <div className="bg-emerald-600 p-5 rounded-[2rem] shadow-xl shadow-emerald-100 rotate-3">
            <Factory className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isTechnicien ? `Secteur : ${userCity}` : (isHuilerie ? 'Ma Maâssra Connectée' : 'Supervision Industrielle')}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                <MapPin className="w-3 h-3" /> {selectedRegion}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> IoT Actif : {selectedMaassra}
              </span>
            </div>
          </div>
        </div>

        {/* Sélecteur de région : Verrouillé pour le technicien */}
        <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          {availableRegions.map(r => (
            <button 
              key={r} 
              onClick={() => !isTechnicien && setSelectedRegion(r)} 
              disabled={isTechnicien}
              className={`px-4 py-2 text-[9px] font-black rounded-xl uppercase tracking-widest transition-all flex items-center gap-2 ${
                selectedRegion === r ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
              } ${isTechnicien ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              {isTechnicien && <Lock className="w-2.5 h-2.5" />}
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DashboardMetric icon={Thermometer} label="Température" value={`${temp}°C`} alert={isTempHigh} />
              <DashboardMetric icon={Waves} label="pH Margines" value={ph.toString()} alert={isPhBad} />
              <DashboardMetric icon={Droplets} label="Niveau Cuve" value={`${niveau}%`} progress={niveau} />
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><BrainCircuit className="text-emerald-600" /> Analyse IA Predictive</h2>
                 <div className="bg-slate-50 px-4 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 uppercase">Gemini 3 Flash</div>
              </div>
              <div className={`p-6 rounded-3xl border ${isLotBad ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-800'} transition-all duration-500`}>
                 <p className="text-sm font-medium leading-relaxed italic">"{aiVerdict}"</p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Liste des Sites ({selectedRegion})</h2>
              <div className="space-y-3">
                 {(MAASSRAS_DATA[selectedRegion] || []).map(m => (
                    <button 
                      key={m}
                      onClick={() => setSelectedMaassra(m)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        selectedMaassra === m ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-200'
                      }`}
                    >
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-widest">{m}</span>
                          {selectedMaassra === m && <CheckCircle className="w-4 h-4" />}
                       </div>
                    </button>
                 ))}
              </div>
           </div>

           <div className="bg-emerald-950 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <Shield className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-4">
                 <h3 className="text-xl font-black italic">Protection de la Zone</h3>
                 <p className="text-[10px] text-emerald-100/60 leading-relaxed font-medium uppercase tracking-widest">
                    En tant que technicien affecté à {userCity}, vous supervisez la qualité des rejets pour prévenir toute pollution des nappes phréatiques locales.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const DashboardMetric: React.FC<{ icon: any, label: string, value: string, alert?: boolean, progress?: number }> = ({ icon: Icon, label, value, alert, progress }) => (
  <div className={`bg-white p-6 rounded-3xl border transition-all ${alert ? 'border-red-200 shadow-red-500/5' : 'border-slate-100 shadow-sm'}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-3 rounded-xl ${alert ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <h3 className={`text-2xl font-black ${alert ? 'text-red-600' : 'text-slate-900'}`}>{value}</h3>
    {progress !== undefined && (
      <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }}></div>
      </div>
    )}
    {alert && <p className="mt-2 text-[8px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 animate-pulse"><XCircle className="w-2.5 h-2.5" /> Hors-normes</p>}
  </div>
);

export default Dashboard;
