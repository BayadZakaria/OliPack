
import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, Loader2, Briefcase, CheckCircle2, AlertCircle, ShieldCheck, Sparkles, MapPin, X, ChevronDown } from 'lucide-react';
import { db } from './services/db';
import { UserRole } from './types';
import Logo from './components/Logo';

interface AuthProps {
  onLogin: (user: any) => void;
  onCancel?: () => void;
}

const MAROC_CITIES = [
  "Beni Mellal", "Meknès", "Marrakech", "Casablanca", "Rabat", 
  "Agadir", "Tanger", "Fès", "Kenitra", "Oujda", 
  "Tétouan", "Safi", "Mohammedia", "El Jadida", "Khouribga", 
  "Nador", "Settat", "Larache", "Ksar El Kebir", "Khemisset",
  "Guelmim", "Berrechid", "Taourirt", "Bouskoura"
].sort();

const Auth: React.FC<AuthProps> = ({ onLogin, onCancel }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState<any>({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    ville: '',
    role: 'HUILERIE' as UserRole
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      if (isSignup) {
        if (!formData.ville) throw new Error("Veuillez sélectionner une ville.");
        await db.signUp(formData);
        setSuccessMsg("Compte créé avec succès ! Connectez-vous maintenant.");
        setIsSignup(false);
        setFormData({ ...formData, password: '' });
      } else {
        const user = await db.signIn(formData.email, formData.password);
        if (user) {
          onLogin(user);
        } else {
          throw new Error("Erreur de récupération de profil.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-emerald-950/40 backdrop-blur-xl flex items-center justify-center p-4 font-sans fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-300 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative z-10 border border-white/20">
        {onCancel && (
          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md z-20 transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="bg-emerald-600 p-10 text-white text-center relative">
          <div className="flex justify-center mb-4">
             <div className="bg-white/20 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/10 shadow-inner">
                <Logo iconOnly variant="light" className="scale-125" />
             </div>
          </div>
          <h1 className="text-3xl font-black font-serif italic tracking-tight">OliPack Portal</h1>
          <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-[0.2em] mt-1 opacity-80 uppercase">Transition GreenTech Digitale</p>
          
          {isSignup && formData.role === 'ACHETEUR' && (
             <div className="mt-4 bg-emerald-700/50 p-3 rounded-2xl border border-emerald-500/30 animate-in slide-in-from-top-2">
                <p className="text-[10px] font-black flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3 text-amber-400" /> ACCÈS BOUTIQUE & STUDIO AI INCLUS
                </p>
             </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] font-bold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
            </div>
          )}

          {isSignup && (
            <div className="grid grid-cols-2 gap-3">
              <input required name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" placeholder="Prénom" />
              <input required name="nom" value={formData.nom} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" placeholder="Nom" />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" placeholder="Email professionnel" />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" placeholder="Mot de passe" />
          </div>

          {isSignup && (
            <>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ville de résidence / Opération</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select 
                    required 
                    name="ville" 
                    value={formData.ville} 
                    onChange={handleChange} 
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Choisir une ville...</option>
                    {MAROC_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de Partenariat</label>
                <div className="relative">
                  <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm appearance-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer font-bold text-slate-700">
                    <option value="ACHETEUR">Acheteur (Boutique & Produits)</option>
                    <option value="VENDEUR">Vendeur (Gestionnaire de Zone)</option>
                    <option value="HUILERIE">Huilerie (Producteur de margines)</option>
                    <option value="COLLECTEUR">Logistique (Opérateur terrain)</option>
                    <option value="TECHNICIEN">Technique (IoT & Qualité)</option>
                    <option value="ADMIN">Administrateur Système</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isSignup ? "CRÉER MON ACCÈS" : "SE CONNECTER")}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="px-10 pb-10 text-center">
           <button onClick={() => { setIsSignup(!isSignup); setErrorMsg(''); setSuccessMsg(''); }} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors">
            {isSignup ? "Déjà membre ? Se connecter" : "Nouveau ? S'inscrire comme partenaire"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
