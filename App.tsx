
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Home from './sections/Home';
import Dashboard from './sections/Dashboard';
import Strategy from './sections/Strategy';
import AIAssistant from './sections/AIAssistant';
import MLPredict from './sections/MLPredict';
import ImpactCalculator from './sections/ImpactCalculator';
import Profile from './sections/Profile';
import Collection from './sections/Collection';
import OliPackStudio from './sections/OliPackStudio';
import Atelier from './sections/Atelier';
import Products from './sections/Products';
import AdminControl from './sections/AdminControl';
import SalesControl from './sections/SalesControl';
import QualityControl from './sections/QualityControl';
import Scan from './sections/Scan';
import Auth from './Auth';
import Logo from './components/Logo';
import { AppSection, UserProfile } from './types';
import { db } from './services/db';
import { Clock, ShieldAlert, LogOut, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail) setActiveSection(e.detail as AppSection);
    };
    window.addEventListener('nav', handleNav);
    return () => window.removeEventListener('nav', handleNav);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const stored = localStorage.getItem('olipack_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        if (u.status === 'APPROVED' || u.role === 'ACHETEUR') {
          if (u.role === 'ACHETEUR') setActiveSection(AppSection.PRODUCTS);
          else if (u.role === 'COLLECTEUR') setActiveSection(AppSection.COLLECTION);
          else if (u.role === 'HUILERIE') setActiveSection(AppSection.DASHBOARD);
          else if (u.role === 'TECHNICIEN') setActiveSection(AppSection.SCAN);
          else if (u.role === 'VENDEUR') setActiveSection(AppSection.SALES_CONTROL);
        }
      }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('olipack_user', JSON.stringify(u));
    setShowAuth(false);
    if (u.status === 'APPROVED' || u.role === 'ACHETEUR') {
      if (u.role === 'ACHETEUR') setActiveSection(AppSection.PRODUCTS);
      else if (u.role === 'COLLECTEUR') setActiveSection(AppSection.COLLECTION);
      else if (u.role === 'HUILERIE') setActiveSection(AppSection.DASHBOARD);
      else if (u.role === 'TECHNICIEN') setActiveSection(AppSection.SCAN);
      else if (u.role === 'VENDEUR') setActiveSection(AppSection.SALES_CONTROL);
      else setActiveSection(AppSection.HOME);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('olipack_user');
    setActiveSection(AppSection.HOME);
  };

  const refreshUserStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const all = await db.getAllUsers();
      const updated = all.find(u => u.id === user.id || u.email === user.email);
      if (updated) {
        setUser(updated);
        localStorage.setItem('olipack_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-emerald-950 flex flex-col items-center justify-center text-white space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
          <Logo iconOnly className="scale-[2] relative z-10" variant="light" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">OliPack Industrial Cloud</p>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <Auth onLogin={handleLogin} onCancel={() => setShowAuth(false)} />;
  }

  if (user && user.status === 'PENDING' && user.role !== 'ACHETEUR') {
    return (
      <div className="h-[100dvh] w-full bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8 animate-in zoom-in-95">
          <div className="flex justify-center">
             <Logo variant="dark" />
          </div>
          <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto text-amber-600">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Compte en attente de validation</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Bonjour {user.prenom}, votre inscription au portail <span className="text-emerald-600 font-bold">OliPack</span> est bien enregistrée. 
              Par mesure de sécurité industrielle, un administrateur doit valider votre accès manuellement.
            </p>
          </div>
          <div className="pt-4 space-y-3">
             <button onClick={refreshUserStatus} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95">
                <RefreshCcw className="w-4 h-4" /> ACTUALISER LE STATUT
             </button>
             <button onClick={handleLogout} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" /> SE DÉCONNECTER
             </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.HOME: return <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.DASHBOARD: return user ? <Dashboard user={user} /> : <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.SCAN: return user ? <Scan user={user} /> : <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.QUALITY_CONTROL: return user ? <QualityControl /> : <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.STRATEGY: return user ? <Strategy /> : <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.STUDIO: return <OliPackStudio user={user} onRequireAuth={() => setShowAuth(true)} />;
      case AppSection.ASSISTANT: return user ? <AIAssistant /> : <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.ML_PREDICT: return user ? <MLPredict /> : <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.IMPACT: return <ImpactCalculator />;
      case AppSection.PROFILE: return user ? <Profile user={user} onUpdate={setUser} onLogout={handleLogout} /> : null;
      case AppSection.COLLECTION: return user ? <Collection user={user} /> : <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.ATELIER: return <Atelier />;
      case AppSection.PRODUCTS: return <Products user={user} onRequireAuth={() => setShowAuth(true)} />;
      case AppSection.ADMIN_CONTROL: return (user?.role === 'ADMIN') ? <AdminControl /> : <Home onGetStarted={() => setShowAuth(true)} />;
      case AppSection.SALES_CONTROL: return (user?.role === 'VENDEUR' || user?.role === 'ADMIN') ? <SalesControl user={user!} /> : <Home onGetStarted={() => setShowAuth(true)} />;
      default: return <Home onGetStarted={() => setShowAuth(true)} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        user={user} 
        onLogout={handleLogout} 
        onShowAuth={() => setShowAuth(true)}
      />
      
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default App;
