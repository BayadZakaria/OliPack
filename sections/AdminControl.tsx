
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Cpu, RefreshCcw, CheckCircle2, XCircle, Users, Search, Mail, 
  Activity, UserCheck, UserX, BadgeCheck, AlertCircle, Clock, Briefcase, 
  Phone, Truck, ArrowRight, Eye, Check, MapPin, Trash2, MessageSquare, 
  Sparkles, Star, TrendingUp, BarChart3, BrainCircuit, Loader2
} from 'lucide-react';
import { db } from '../services/db';
import { UserProfile, UserStatus, ProductReview } from '../types';
import { GoogleGenAI } from "@google/genai";

const AdminControl: React.FC = () => {
  const [tab, setTab] = useState<'hardware' | 'users' | 'activity' | 'sentiment'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiReactions, setAiReactions] = useState<Record<number, string>>({});
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  const products = [
    { id: 1, name: "Bio-Charbon Premium" },
    { id: 2, name: "Pellets OliPack Eco" },
    { id: 3, name: "Biopolymère PHA" },
    { id: 4, name: "Engrais Bio-Organique" }
  ];

  const loadData = async () => {
    setLoading(true);
    const [u, c, r] = await Promise.all([db.getAllUsers(), db.getCollections(), db.getReviews()]);
    setUsers(u);
    setCollections(c);
    setReviews(r);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const analyzeSentiment = async (productId: number) => {
    const productReviews = reviews.filter(r => r.productId === productId);
    if (productReviews.length === 0) {
      setAiReactions(prev => ({ ...prev, [productId]: "Aucun avis client pour ce produit." }));
      return;
    }

    setAnalyzingId(productId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `En tant qu'expert en analyse de marché GreenTech pour OliPack, analyse ces avis clients pour le produit "${products.find(p => p.id === productId)?.name}" :
      ${productReviews.map(r => `- Note: ${r.rating}/5, Commentaire: "${r.comment}"`).join('\n')}
      
      Donne une "Réaction du Marché" concise comprenant :
      1. Sentiment global (Positif/Neutre/Négatif).
      2. Le principal point fort cité.
      3. Une recommandation stratégique pour Zakaria Bayad (Admin).
      Réponds en 3-4 lignes maximum, style professionnel et direct.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiReactions(prev => ({ ...prev, [productId]: response.text || "Erreur d'analyse." }));
    } catch (e) {
      setAiReactions(prev => ({ ...prev, [productId]: "Erreur lors de la connexion à Gemini AI." }));
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleVerify = async (userId: string, status: UserStatus) => {
    await db.verifyUser(userId, status);
    loadData();
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const deletionRequests = users.filter(u => u.deletionRequested);
  const filteredUsers = users.filter(u => 
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-amber-500 w-10 h-10" /> Supervision Centrale
          </h1>
          <p className="text-slate-500 font-medium">Validation et Analyse Stratégique OliPack.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
           <button onClick={() => setTab('users')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 ${tab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
              <Users className="w-4 h-4" /> Partenaires
              {(pendingUsers.length + deletionRequests.length) > 0 && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">{pendingUsers.length + deletionRequests.length}</span>}
           </button>
           <button onClick={() => setTab('sentiment')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 ${tab === 'sentiment' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
              <BrainCircuit className="w-4 h-4 text-emerald-400" /> Analyse Marché IA
           </button>
           <button onClick={() => setTab('activity')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 ${tab === 'activity' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
              <Truck className="w-4 h-4" /> Flux
           </button>
           <button onClick={() => setTab('hardware')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 ${tab === 'hardware' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
              <Cpu className="w-4 h-4" /> Hardware
           </button>
        </div>
      </header>

      {tab === 'sentiment' && (
         <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="bg-emerald-950 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                     <h2 className="text-2xl font-black italic">Analyseur de Réaction ML</h2>
                     <p className="text-emerald-100/60 text-sm font-medium">L'IA Gemini analyse les retours clients pour guider votre production.</p>
                  </div>
                  <BarChart3 className="w-16 h-16 text-emerald-500/30" />
               </div>
               <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {products.map(p => {
                  const pReviews = reviews.filter(r => r.productId === p.id);
                  const avg = pReviews.length > 0 ? (pReviews.reduce((a,b)=>a+b.rating,0)/pReviews.length).toFixed(1) : "0";
                  
                  return (
                     <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 group hover:border-emerald-200 transition-all">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <h3 className="text-xl font-black text-slate-800">{p.name}</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pReviews.length} retours clients</p>
                           </div>
                           <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="text-lg font-black text-slate-900">{avg}</span>
                           </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 min-h-[120px] relative">
                           {analyzingId === p.id ? (
                              <div className="flex flex-col items-center justify-center gap-3 h-full">
                                 <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                 <p className="text-[10px] font-black text-emerald-600 uppercase">Gemini analyse les reviews...</p>
                              </div>
                           ) : aiReactions[p.id] ? (
                              <div className="animate-in fade-in">
                                 <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Réaction Machine Learning</span>
                                 </div>
                                 <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                                    "{aiReactions[p.id]}"
                                 </p>
                              </div>
                           ) : (
                              <div className="flex flex-col items-center justify-center gap-3 h-full opacity-40">
                                 <BrainCircuit className="w-8 h-8 text-slate-300" />
                                 <button 
                                   onClick={() => analyzeSentiment(p.id)}
                                   className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-600"
                                 >
                                   Lancer l'analyse IA
                                 </button>
                              </div>
                           )}
                        </div>
                        
                        {pReviews.length > 0 && !aiReactions[p.id] && (
                           <button 
                             onClick={() => analyzeSentiment(p.id)}
                             className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                           >
                              SYNCHRONISER LA RÉACTION IA
                           </button>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      {tab === 'users' && (
        <div className="space-y-12 animate-in slide-in-from-left-4">
          {deletionRequests.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xs font-black text-red-600 uppercase tracking-widest ml-2 flex items-center gap-2">
                 <Trash2 className="w-4 h-4" /> Demandes de clôture
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {deletionRequests.map(u => (
                   <div key={u.id} className="bg-red-50 p-6 rounded-[2.5rem] border-2 border-red-200 flex flex-col justify-between gap-6 shadow-xl shadow-red-500/10">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center text-xl font-black">{u.prenom.charAt(0)}</div>
                         <div><h3 className="font-black text-slate-900">{u.prenom} {u.nom}</h3><p className="text-[10px] font-bold text-red-600 uppercase">{u.role} - {u.ville}</p></div>
                      </div>
                      <div className="flex gap-3">
                         <button onClick={async () => { if(confirm("Supprimer?")) { await db.deleteAccount(u.id!); loadData(); } }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">CONFIRMER</button>
                         <button onClick={async () => { await db.cancelAccountDeletion(u.id!); loadData(); }} className="flex-1 py-4 bg-white border border-red-200 text-red-600 rounded-2xl text-[10px] font-black uppercase">REJETER</button>
                      </div>
                   </div>
                 ))}
              </div>
            </section>
          )}

          {pendingUsers.length > 0 && (
            <section className="space-y-6">
               <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest ml-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Inscriptions en attente</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingUsers.map(u => (
                    <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-amber-200 shadow-2xl shadow-amber-500/10 space-y-6 relative overflow-hidden">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black">{u.prenom.charAt(0)}</div>
                          <div><h3 className="font-black text-slate-800 text-xl tracking-tight">{u.prenom} {u.nom}</h3><p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block uppercase mt-1">{u.role}</p></div>
                       </div>
                       <div className="flex gap-3">
                          <button onClick={() => handleVerify(u.id!, 'APPROVED')} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">APPROUVER</button>
                          <button onClick={() => handleVerify(u.id!, 'REJECTED')} className="px-5 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 border border-red-100"><UserX className="w-4 h-4" /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          <div className="space-y-6">
            <div className="relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
               <input type="text" placeholder="Chercher un partenaire..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm outline-none shadow-sm" />
            </div>

            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center"><h2 className="text-lg font-black text-slate-800 uppercase">Annuaire</h2><div className="text-[10px] font-bold text-slate-400 uppercase">{filteredUsers.length} au total</div></div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead><tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-8 py-4">Utilisateur</th><th className="px-8 py-4">Ville</th><th className="px-8 py-4">Statut</th><th className="px-8 py-4">Action</th></tr></thead>
                     <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="group hover:bg-slate-50/30">
                             <td className="px-8 py-5"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs ${u.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`}>{u.prenom.charAt(0)}</div><div><div className="text-sm font-black text-slate-800">{u.prenom} {u.nom}</div><div className="text-[10px] text-slate-400">{u.email}</div></div></div></td>
                             <td className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase">{u.ville || '-'}</td>
                             <td className="px-8 py-5"><div className={`flex items-center gap-2 text-[10px] font-black uppercase ${u.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>{u.status}</div></td>
                             <td className="px-8 py-5"><button onClick={() => handleVerify(u.id!, u.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')} className="text-[9px] font-black uppercase text-slate-400 hover:text-emerald-600">Toggle Statut</button></td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
           <div className="grid grid-cols-1 gap-4">
              {collections.map((col, i) => (
                <div key={col.id || i} className={`bg-white p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between gap-4 ${!col.is_read ? 'border-emerald-200' : 'border-slate-50 opacity-60'}`}>
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${!col.is_read ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Truck className="w-6 h-6" /></div>
                      <div><h3 className="font-black text-slate-800">{col.site}</h3><p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(col.created_at).toLocaleString()}</p></div>
                   </div>
                   {!col.is_read && <button onClick={async () => { await db.markCollectionAsRead(col.id); loadData(); }} className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Check className="w-5 h-5" /></button>}
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminControl;
