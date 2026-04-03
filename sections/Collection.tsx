
import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  Loader2,
  AlertTriangle,
  XCircle,
  Activity,
  Search,
  Thermometer,
  Zap,
  Sparkles,
  ArrowRight,
  Timer,
  Droplets,
  QrCode,
  X,
  History,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react';
import { db } from '../services/db';
import { UserProfile } from '../types';

interface Site {
  id: string;
  name: string;
  location: string;
  ville: string;
  volume: number;
  capacity: number;
  fillLevel: number;
  temp: number;
  ph: number;
  status: 'A collecter' | 'En cours' | 'Terminé' | 'Bloqué';
  quality: 'Conforme' | 'Non-Conforme';
  lastUpdate: string;
}

const TankVisual: React.FC<{ fill: number, quality: string }> = ({ fill, quality }) => {
  const isUrgent = fill >= 80;
  const isBadQuality = quality === 'Non-Conforme';
  return (
    <div className="relative w-28 h-40 shrink-0">
      <div className="absolute inset-0 border-[3px] border-slate-200 rounded-b-[1.5rem] rounded-t-lg bg-slate-50/50 overflow-hidden shadow-inner">
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out ${isBadQuality ? 'bg-red-900/80' : 'bg-emerald-950'
            }`}
          style={{ height: `${fill}%` }}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 animate-pulse"></div>
          {fill > 10 && (
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute bottom-4 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-bubble-1"></div>
              <div className="absolute bottom-10 left-1/2 w-1 h-1 bg-white rounded-full animate-bubble-2"></div>
            </div>
          )}
        </div>
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
        <span className="text-[9px] font-black tracking-tighter text-slate-800">{fill}%</span>
      </div>
    </div>
  );
};

interface CollectionProps {
  user: UserProfile | null;
}

const Collection: React.FC<CollectionProps> = ({ user }) => {
  const [tab, setTab] = useState<'monitor' | 'history'>('monitor');
  const [sites, setSites] = useState<Site[]>([
    { id: '1', name: 'Maâssra El Baraka', location: 'Zone Industrielle A', ville: 'Beni Mellal', volume: 4100, capacity: 5000, fillLevel: 82, temp: 24.5, ph: 4.6, status: 'A collecter', quality: 'Conforme', lastUpdate: '10 min' },
    { id: '2', name: 'Huilerie du Nord', location: 'Route de Fès', ville: 'Meknès', volume: 4850, capacity: 5000, fillLevel: 97, temp: 35.2, ph: 3.2, status: 'Bloqué', quality: 'Non-Conforme', lastUpdate: 'À l\'instant' },
    { id: '3', name: 'Al Haouz Bio', location: 'Quartier Targa', ville: 'Marrakech', volume: 0, capacity: 5000, fillLevel: 0, temp: 22.1, ph: 4.8, status: 'Terminé', quality: 'Conforme', lastUpdate: 'Hier' },
    { id: '4', name: 'Coopérative Atlas', location: 'Bni Amir', ville: 'Beni Mellal', volume: 1500, capacity: 5000, fillLevel: 30, temp: 23.8, ph: 4.5, status: 'A collecter', quality: 'Conforme', lastUpdate: '1h' },
    { id: '5', name: 'OliMeknès Press', location: 'Sidi Baba', ville: 'Meknès', volume: 3900, capacity: 5000, fillLevel: 78, temp: 25.1, ph: 4.7, status: 'A collecter', quality: 'Conforme', lastUpdate: '2h' },
    { id: '6', name: 'Souss Olive', location: 'Inezgane Centre', ville: 'Agadir', volume: 4400, capacity: 5000, fillLevel: 88, temp: 26.5, ph: 4.6, status: 'A collecter', quality: 'Conforme', lastUpdate: '30 min' },
    { id: '7', name: 'Pressoir Ain Asserdoun', location: 'Source Ain Asserdoun', ville: 'Beni Mellal', volume: 4600, capacity: 5000, fillLevel: 92, temp: 24.1, ph: 4.4, status: 'A collecter', quality: 'Conforme', lastUpdate: '5 min' },
  ]);

  const [history, setHistory] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQr, setActiveQr] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await db.getCollections();
      setHistory(data);
    };
    loadHistory();
  }, []);

  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      const isMyCity = user?.role === 'ADMIN' || site.ville === user?.ville;
      const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           site.location.toLowerCase().includes(searchTerm.toLowerCase());
      return isMyCity && matchesSearch;
    });
  }, [sites, user, searchTerm]);

  const validateCollection = async (id: string) => {
    const site = sites.find(s => s.id === id);
    if (!site || site.quality === 'Non-Conforme') return;

    setIsProcessing(id);
    setTimeout(async () => {
      const newEvent = {
        site: site.name,
        volume: site.volume,
        type: 'COLLECTE_TRUCK',
        ph: site.ph,
        temp: site.temp,
        operator: user?.prenom || 'Opérateur'
      };
      await db.saveCollectionEvent(newEvent);
      setSites(prev => prev.map(s => s.id === id ? { ...s, status: 'Terminé', fillLevel: 100 } : s));
      const updatedHistory = await db.getCollections();
      setHistory(updatedHistory);
      setIsProcessing(null);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in pb-24 max-w-6xl mx-auto">
      {/* HEADER TYPE SUPERVISION TOTALE */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-emerald-950 p-3 rounded-2xl shadow-xl shadow-emerald-950/20">
              <Truck className="text-white w-8 h-8" />
            </div>
            Supervision des Flux
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> {user?.role === 'ADMIN' || user?.role === 'COLLECTEUR' ? 'Vision Nationale' : user?.ville}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> IoT Cloud Sync
            </span>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
          <button onClick={() => setTab('monitor')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tab === 'monitor' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutDashboard className="w-4 h-4" /> Temps Réel
          </button>
          <button onClick={() => setTab('history')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
            <History className="w-4 h-4" /> Historique
            {history.length > 0 && <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">{history.length}</span>}
          </button>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatItem icon={Droplets} label="Volume Dispo" value="12,4k L" color="text-blue-600" />
         <StatItem icon={AlertTriangle} label="En Alerte" value={sites.filter(s => s.fillLevel >= 80).length.toString()} color="text-amber-500" />
         <StatItem icon={CheckCircle2} label="Collectes/Jour" value="08" color="text-emerald-600" />
         <StatItem icon={TrendingUp} label="Efficacité" value="98%" color="text-slate-900" />
      </div>

      {tab === 'monitor' ? (
        <div className="space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une Maâssra ou une zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredSites.map(site => (
              <div key={site.id} className={`bg-white rounded-[2.5rem] p-6 md:p-8 border-2 transition-all flex flex-col md:flex-row gap-8 items-center ${site.quality === 'Non-Conforme' ? 'border-red-100 bg-red-50/20' :
                site.status === 'Terminé' ? 'border-emerald-100 bg-emerald-50/5' :
                  site.fillLevel >= 80 ? 'border-amber-200 shadow-xl' : 'border-slate-100/50 shadow-sm'
                }`}>
                  <TankVisual fill={site.fillLevel} quality={site.quality} />
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       <div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{site.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5" /> {site.location}
                          </p>
                       </div>
                       <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         site.quality === 'Conforme' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                       }`}>
                         Statut Qualité : {site.quality}
                       </div>
                    </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard icon={Droplets} label="Niveau" value={`${site.volume} L`} />
                    <MetricCard icon={Thermometer} label="Temp." value={`${site.temp}°C`} />
                    <MetricCard icon={Zap} label="pH" value={site.ph.toString()} />
                    <MetricCard icon={Calendar} label="MàJ" value={site.lastUpdate} />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {site.quality === 'Non-Conforme' ? (
                      <div className="w-full bg-red-600 text-white p-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase border border-red-500">
                        <XCircle className="w-5 h-5" /> ACCÈS BLOQUÉ : CONTAMINATION DÉTECTÉE
                      </div>
                    ) : site.fillLevel >= 1 ? (
                      <>
                        <button
                          onClick={() => validateCollection(site.id)}
                          disabled={isProcessing === site.id}
                          className={`flex-[2] py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${site.fillLevel >= 80 ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-emerald-600 text-white shadow-emerald-200'
                            }`}
                        >
                          {isProcessing === site.id ? <Loader2 className="animate-spin w-5 h-5" /> : <Truck className="w-5 h-5" />}
                          {site.fillLevel >= 80 ? 'URGENCE : VIDER MAINTENANT' : 'VALIDER LA COLLECTE'}
                        </button>
                        <button
                          onClick={() => setActiveQr({ id: site.id, name: site.name })}
                          className="flex-1 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl"
                        >
                          <QrCode className="w-5 h-5" /> PASS QR
                        </button>
                      </>
                    ) : (
                      <div className="w-full bg-slate-100 text-slate-400 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase border border-slate-200">
                        <CheckCircle2 className="w-5 h-5" /> Cuve Vide - Collecte Terminée
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" /> Flux Logistiques Récents
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{history.length} Opérations</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Opération</th>
                    <th className="px-8 py-5">Source</th>
                    <th className="px-8 py-5">Volume</th>
                    <th className="px-8 py-5">Paramètres</th>
                    <th className="px-8 py-5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.map((h, i) => (
                    <tr key={h.id || i} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div className="text-[11px] font-black text-slate-800 uppercase">Collecte Camion</div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-[11px] font-bold text-slate-600">{h.site}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-black">{h.operator || 'OliPack Team'}</div>
                      </td>
                      <td className="px-8 py-5 text-[11px] font-black text-emerald-600">{h.volume} L</td>
                      <td className="px-8 py-5">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold rounded-full text-slate-500">pH {h.ph || '4.5'}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold rounded-full text-slate-500">{h.temp || '24'}°C</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold text-slate-400">
                        {new Date(h.created_at).toLocaleDateString()} <span className="text-[8px] opacity-60 ml-1">{new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR PASS (Identique) */}
      {activeQr && (
        <div className="fixed inset-0 z-[100] bg-emerald-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center space-y-8 relative shadow-2xl overflow-hidden animate-in zoom-in-95">
            <button onClick={() => setActiveQr(null)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-xl"><X className="w-5 h-5" /></button>
            <div className="space-y-2 pt-4">
              <h2 className="text-xl font-black text-slate-900">Pass de Transfert</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Site : {activeQr.name}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-emerald-200 flex justify-center shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify({ id: activeQr.id, site: activeQr.name, type: 'OLIPACK_TRANSFER' }))}`}
                alt="QR Transfert"
                className="w-56 h-56 rounded-xl shadow-lg"
              />
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 text-left">
              <Activity className="w-5 h-5 shrink-0" />
              <p className="text-[10px] font-bold leading-relaxed uppercase">
                Présentez ce code au centre de valorisation pour confirmer la réception du lot.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bubble-1 { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
        @keyframes bubble-2 { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-60px); opacity: 0; } }
        .animate-bubble-1 { animation: bubble-1 3s infinite ease-in; }
        .animate-bubble-2 { animation: bubble-2 4s infinite ease-in; }
      `}</style>
    </div>
  );
};

const StatItem: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-emerald-200">
    <div className={`p-3 bg-slate-50 rounded-2xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">{label}</p>
      <p className={`text-lg font-black tracking-tight ${color}`}>{value}</p>
    </div>
  </div>
);

const MetricCard: React.FC<{ icon: any, label: string, value: string }> = ({ icon: Icon, label, value }) => (
  <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1">
    <Icon className="w-3.5 h-3.5 text-slate-300" />
    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-xs font-black text-slate-700 tracking-tight">{value}</p>
  </div>
);

export default Collection;
