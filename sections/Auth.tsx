
import React, { useState, useEffect } from 'react';
import { Leaf, ArrowRight, Mail, Lock, Loader2, Info, Briefcase, Phone, HelpCircle, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { db, supabase } from '../services/db';
import { UserRole } from '../types';

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
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
    role: 'HUILERIE' as UserRole
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      if (isSignup) {
        await db.signUp(formData);
        setSuccessMsg("Votre compte partenaire a été créé ! Vous pouvez maintenant vous connecter.");
        setIsSignup(false);
        setFormData({ ...formData, password: '' });
      } else {
        const user = await db.signIn(formData.email, formData.password);
        if (user) {
          onLogin(user);
        } else {
          throw new Error("Impossible de récupérer votre profil.");
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('Identifiants incorrects')) {
        setErrorMsg("Email ou mot de passe incorrect.");
      } else {
        setErrorMsg(err.message || "Une erreur est survenue lors de l'authentification.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative z-10">
        <div className="bg-emerald-600 p-10 text-white text-center relative">
          <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner border border-white/10">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black font-serif italic tracking-tight">OliPack Portal</h1>
          <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-[0.2em] mt-1 opacity-80">Transition Écologique Digitale</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] font-bold text-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
            </div>
          )}

          {isSignup && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Prénom</label>
                <input required name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="Ex: Ahmed" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nom</label>
                <input required name="nom" value={formData.nom} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="Ex: Alaoui" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Email professionnel</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="contact@entreprise.ma" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="••••••••" />
            </div>
          </div>

          {isSignup && (
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Type de compte</label>
              <div className="relative">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <select name="role" value={formData.role} onChange={handleChange} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm appearance-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer">
                  <option value="HUILERIE">Huilerie (Maâssra)</option>
                  <option value="ADMIN">Administrateur Projet</option>
                  <option value="COLLECTEUR">Opérateur Logistique</option>
                  <option value="TECHNICIEN">Technicien de Zone</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 mt-4">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isSignup ? "Créer mon accès" : "Se Connecter")}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="px-10 pb-10 text-center">
           <button onClick={() => { setIsSignup(!isSignup); setErrorMsg(''); setSuccessMsg(''); }} className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:text-emerald-800 transition-colors">
            {isSignup ? "Déjà partenaire ? Se connecter" : "Nouveau ? Créer un compte partenaire"}
           </button>
           
           <div className="mt-8 flex items-center justify-center gap-4 text-slate-100">
             <div className="h-px w-12 bg-slate-100"></div>
             <ShieldCheck className="w-4 h-4 text-slate-300" />
             <div className="h-px w-12 bg-slate-100"></div>
           </div>
           
           <p className="mt-4 text-[9px] text-slate-400 max-w-[250px] mx-auto leading-relaxed font-medium">
             Plateforme sécurisée OliPack. <br/> 
             Besoin d'aide ? <span className="text-emerald-600 font-bold">support@olipack.ma</span>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
