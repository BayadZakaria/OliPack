
import React, { useState, useEffect } from 'react';
import { AppSection, UserProfile } from './types';
import Sidebar from './components/Sidebar';
import Home from './sections/Home';
import Dashboard from './sections/Dashboard';
import Strategy from './sections/Strategy';
import OliPackStudio from './sections/OliPackStudio';
import AIAssistant from './sections/AIAssistant';
import Auth from './sections/Auth';
import AdminControl from './sections/AdminControl';
import MLPredict from './sections/MLPredict';
import QualityControl from './sections/QualityControl';
import ImpactCalculator from './sections/ImpactCalculator';
import Atelier from './sections/Atelier';
import Profile from './sections/Profile';
import { db, supabase } from './services/db';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (supabase) {
          const user = await db.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setIsAuthChecking(false);
            return;
          }
        }
        const savedUser = localStorage.getItem('olipack_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
          }
        }
      } catch (e) {
        console.error("Erreur session:", e);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkSession();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await db.formatUser(session.user);
          setCurrentUser(user);
          localStorage.setItem('olipack_user', JSON.stringify(user));
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem('olipack_user');
          setActiveSection(AppSection.HOME);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('olipack_user');
    setCurrentUser(null);
    setActiveSection(AppSection.HOME);
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-emerald-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-emerald-400 font-bold animate-pulse text-sm">Chargement OliPack...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={(user) => {
      localStorage.setItem('olipack_user', JSON.stringify(user));
      setCurrentUser(user);
    }} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.HOME: return <Home onGetStarted={() => setActiveSection(AppSection.DASHBOARD)} />;
      case AppSection.DASHBOARD: return <Dashboard />;
      case AppSection.STRATEGY: return <Strategy />;
      case AppSection.STUDIO: return <OliPackStudio />;
      case AppSection.ASSISTANT: return <AIAssistant />;
      case AppSection.ML_PREDICT: return <MLPredict />;
      case AppSection.QUALITY_CONTROL: return <QualityControl />;
      case AppSection.IMPACT: return <ImpactCalculator />;
      case AppSection.ADMIN_CONTROL: return <AdminControl />;
      case AppSection.ATELIER: return <Atelier />;
      case AppSection.PROFILE: return (
        <Profile 
          user={currentUser} 
          onUpdate={(updated) => setCurrentUser(updated)} 
          onLogout={handleLogout}
        />
      );
      default: return <Home onGetStarted={() => setActiveSection(AppSection.DASHBOARD)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto h-full">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default App;
