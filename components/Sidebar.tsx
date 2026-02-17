
import React, { useState, useEffect } from 'react';
import { AppSection, UserProfile } from '../types';
import { db } from '../services/db';
import Logo from './Logo';
import { 
  Home, 
  LayoutDashboard, 
  TrendingUp, 
  Sparkles,
  LogOut,
  BrainCircuit,
  Palette,
  Globe,
  Truck,
  ShoppingBag,
  Info,
  ShieldAlert,
  LogIn,
  User,
  Microscope,
  QrCode,
  Activity,
  ScanText
} from 'lucide-react';

interface SidebarProps {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onShowAuth?: () => void;
  forceMobile?: boolean; 
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, user, onLogout, onShowAuth, forceMobile = false }) => {
  const [totalNotifications, setTotalNotifications] = useState(0);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const checkNotifications = async () => {
        const pendingUsers = await db.getPendingUsersCount();
        const unreadCollections = await db.getUnreadCollectionsCount();
        setTotalNotifications(pendingUsers + unreadCollections);
      };
      checkNotifications();
      const interval = setInterval(checkNotifications, 20000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  if (user && user.status !== 'APPROVED') return null;

  const role = user?.role;
  const safePrenom = String(user?.prenom || 'Visiteur');
  const initial = user?.prenom ? user.prenom.charAt(0).toUpperCase() : 'V';

  const canSee = (section: AppSection) => {
    if (section === AppSection.PROFILE) return !!user;
    
    if (role === 'COLLECTEUR') {
      return section === AppSection.COLLECTION || section === AppSection.HOME;
    }

    if (role === 'HUILERIE') {
      return section === AppSection.DASHBOARD || section === AppSection.HOME;
    }

    if (([AppSection.HOME, AppSection.PRODUCTS, AppSection.ATELIER, AppSection.STUDIO] as any[]).includes(section)) {
        if (role === 'TECHNICIEN') return section === AppSection.HOME; 
        return true;
    }
    
    if (!user) return false;
    
    if (role === 'ACHETEUR') {
      return ([AppSection.HOME, AppSection.PRODUCTS, AppSection.STUDIO, AppSection.IMPACT, AppSection.ML_PREDICT] as any[]).includes(section);
    }
    
    switch (role) {
      case 'ADMIN': return true;
      case 'TECHNICIEN': 
        return ([
          AppSection.HOME, 
          AppSection.QUALITY_CONTROL, 
          AppSection.SCAN,
          AppSection.ML_PREDICT,     
          AppSection.IMPACT          
        ] as any[]).includes(section);
      default: return ([AppSection.HOME, AppSection.PRODUCTS, AppSection.ATELIER, AppSection.STUDIO] as any[]).includes(section);
    }
  };

  const allNavItems = [
    { id: AppSection.HOME, icon: Home, label: 'Accueil' },
    { id: AppSection.SCAN, icon: QrCode, label: 'Scan' },
    { id: AppSection.QUALITY_CONTROL, icon: Microscope, label: 'Qualité' },
    { id: AppSection.ML_PREDICT, icon: BrainCircuit, label: 'IA / ML' },
    { id: AppSection.IMPACT, icon: Activity, label: 'Diagnostique' },
    { id: AppSection.DASHBOARD, icon: LayoutDashboard, label: 'Maâssra (IoT)' },
    { id: AppSection.PRODUCTS, icon: ShoppingBag, label: 'Boutique' },
    { id: AppSection.STUDIO, icon: Palette, label: 'Studio AI' },
    { id: AppSection.ATELIER, icon: Info, label: 'Infos' },
    { id: AppSection.COLLECTION, icon: Truck, label: 'Collecte' },
    { id: AppSection.ADMIN_CONTROL, icon: ShieldAlert, label: 'Supervision', badge: totalNotifications > 0 ? totalNotifications : null },
    { id: AppSection.ASSISTANT, icon: Sparkles, label: 'Bot Assistant' },
  ].filter(item => canSee(item.id as AppSection));

  return (
    <>
      <aside className={`${forceMobile ? 'hidden' : 'hidden md:flex'} w-56 bg-emerald-950 text-white flex flex-col border-r border-emerald-900 shrink-0 h-full overflow-hidden shadow-2xl relative z-50`}>
        <div className="p-6 border-b border-white/5">
          <button 
            onClick={() => setActiveSection(AppSection.HOME)} 
            className="group transition-transform active:scale-95"
          >
            <Logo variant="light" />
          </button>
        </div>

        <div className="px-3 py-6 shrink-0">
          <button 
            onClick={() => user ? setActiveSection(AppSection.PROFILE) : onShowAuth?.()}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              activeSection === AppSection.PROFILE ? 'bg-emerald-500/20 border-emerald-500 shadow-inner' : 'bg-emerald-900/40 border-emerald-800 hover:border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md ${user ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black truncate text-white uppercase tracking-wider">{safePrenom}</p>
                <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">{user ? role : 'Invité'}</p>
              </div>
            </div>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto py-2 custom-scrollbar">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AppSection)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                  isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-emerald-100/30 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                <span className={`ml-4 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                {item.badge && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-900 shrink-0 bg-black/10">
          {user ? (
            <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all">
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="ml-4 text-[10px] font-black uppercase tracking-widest">Quitter</span>
            </button>
          ) : (
            <button onClick={onShowAuth} className="w-full flex items-center px-4 py-3 text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-2xl transition-all">
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="ml-4 text-[10px] font-black uppercase tracking-widest">Connexion</span>
            </button>
          )}
        </div>
      </aside>

      <nav className={`${forceMobile ? 'flex' : 'md:hidden flex'} fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-2xl border-t border-slate-200 z-[60] items-center justify-around px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe`}>
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as AppSection)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-90 relative ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-100' : ''}`}>
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute top-1 right-2 bg-red-500 w-2 h-2 rounded-full border border-white"></span>
                )}
              </div>
              <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
