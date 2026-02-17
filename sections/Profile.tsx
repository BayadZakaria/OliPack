
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Shield, 
  Save, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Camera,
  ChevronDown,
  MapPin,
  Lock,
  Clock
} from 'lucide-react';
import { db } from '../services/db';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState({
    nom: user.nom || '',
    prenom: user.prenom || '',
    ville: user.ville || '',
    cin: user.cin || '',
    telephone: user.telephone || '',
    fonction: user.fonction || (user.role === 'HUILERIE' ? 'Gérant de Maâssra' : 'Partenaire OliPack')
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const userId = user.id || 'mock-id';
      const dataToSave = { ...formData, fonction: user.fonction };
      const updated = await db.updateProfile(userId, dataToSave);
      if (updated) {
        onUpdate({ ...user, ...dataToSave });
        setMessage({ type: 'success', text: "Profil OliPack mis à jour avec succès." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Erreur lors de la mise à jour." });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    setLoading(true);
    try {
      const userId = user.id || 'mock-id';
      await db.requestAccountDeletion(userId);
      onUpdate({ ...user, deletionRequested: true });
      setMessage({ type: 'success', text: "Demande de suppression envoyée à l'administrateur." });
      setShowDeleteConfirm(false);
    } catch (error) {
      setMessage({ type: 'error', text: "Erreur lors de l'envoi de la demande." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mon Profil OliPack</h1>
          <p className="text-slate-500">Gérez vos informations et la sécurité de votre accès.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${
          user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {user.role}
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {user.deletionRequested && (
        <div className="p-6 bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95">
           <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                 <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Suppression en cours de validation</h3>
                 <p className="text-xs text-amber-700 leading-none">Votre demande a été transmise à Zakaria Bayad (Admin).</p>
              </div>
           </div>
           <button 
             onClick={async () => {
               await db.cancelAccountDeletion(user.id!);
               onUpdate({ ...user, deletionRequested: false });
             }}
             className="px-6 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
           >
             ANNULER LA DEMANDE
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AVATAR & STATS */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-emerald-200">
                {user.prenom.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-white border border-slate-200 rounded-2xl shadow-lg text-emerald-600 hover:text-emerald-700 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.prenom} {user.nom}</h2>
            <p className="text-sm text-slate-400 font-medium">{user.email}</p>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase mt-1">
              <MapPin className="w-3 h-3" /> {user.ville || 'Ville non renseignée'}
            </div>
          </div>

          <div className="bg-emerald-950 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
             <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10" />
             <div className="relative z-10 space-y-4">
               <h3 className="font-bold flex items-center gap-2 text-sm">
                 <Shield className="w-4 h-4 text-emerald-400" /> Sécurité des données
               </h3>
               <p className="text-[10px] text-emerald-100/60 leading-relaxed font-medium">
                 Conformément aux normes RGPD et au protocole de sécurité OliPack, votre accès est surveillé.
               </p>
             </div>
          </div>
        </div>

        {/* PROFILE FORM */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
               <User className="text-emerald-600 w-6 h-6" />
               <h2 className="text-xl font-bold text-slate-800">Données Personnelles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                <input type="text" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                <input type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Fonction <Lock className="w-2.5 h-2.5" />
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input type="text" disabled value={formData.fonction} className="w-full pl-12 pr-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-500 font-black outline-none cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input type="tel" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none font-medium" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              METTRE À JOUR
            </button>
          </form>

          {/* DANGER ZONE : SUPPRESSION OBLIGATOIREMENT VALIDEE PAR ADMIN */}
          <div className="bg-red-50 rounded-[2.5rem] p-10 border border-red-100 space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
               <AlertCircle className="text-red-600 w-6 h-6" />
               <h2 className="text-xl font-bold text-red-800">Zone de Retrait</h2>
            </div>
            
            <p className="text-xs text-red-700 leading-relaxed font-bold uppercase tracking-tight relative z-10">
              La clôture de compte OliPack est soumise à une <span className="underline">validation administrative obligatoire</span> pour garantir l'intégrité de la chaîne de traçabilité IoT.
            </p>

            {!user.deletionRequested && (
              showDeleteConfirm ? (
                <div className="flex gap-4 animate-in slide-in-from-bottom-2 relative z-10">
                  <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-white border border-red-200 text-red-700 rounded-2xl font-bold text-[10px] uppercase">Annuler</button>
                  <button type="button" onClick={handleRequestDeletion} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg shadow-red-200">Envoyer la demande</button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="w-full py-4 border-2 border-dashed border-red-200 text-red-600 rounded-2xl font-black text-[10px] uppercase hover:bg-red-100 transition-all relative z-10">
                  DEMANDER LA CLÔTURE DU COMPTE
                </button>
              )
            )}
            <Trash2 className="absolute -bottom-6 -right-6 w-32 h-32 text-red-600/5 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
