
import React from 'react';
import { AppSection, UserProfile } from '../types';
import { 
  Home, 
  LayoutDashboard, 
  TrendingUp, 
  Sparkles,
  Leaf,
  LogOut,
  ShieldAlert,
  BrainCircuit,
  FlaskConical,
  Palette,
  Globe,
  Info,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, user, onLogout }) => {
  if (!user) return null;

  const safePrenom = String(user.prenom || 'Utilisateur');
  const safeNom = String(user.nom || '');
  const role = user.role || 'HUILERIE';
  const initial = safePrenom.length > 0 ? safePrenom.charAt(0).toUpperCase() : '?';

  const canSee = (section: AppSection) => {
    if (section === AppSection.ATELIER || section === AppSection.PROFILE) return true;
    switch (role) {
      case 'ADMIN': return true;
      case 'TECHNICIEN': 
        return ([AppSection.HOME, AppSection.DASHBOARD, AppSection.ML_PREDICT, AppSection.QUALITY_CONTROL, AppSection.ADMIN_CONTROL, AppSection.IMPACT] as AppSection[]).includes(section);
      case 'COLLECTEUR': 
        return ([AppSection.HOME, AppSection.DASHBOARD, AppSection.STRATEGY, AppSection.IMPACT] as AppSection[]).includes(section);
      case 'HUILERIE': 
        return ([AppSection.HOME, AppSection.DASHBOARD, AppSection.ASSISTANT, AppSection.IMPACT] as AppSection[]).includes(section);
      default: return section === AppSection.HOME;
    }
  };

  const navItems = [
    { id: AppSection.HOME, icon: Home, label: 'Accueil' },
    { id: AppSection.DASHBOARD, icon: LayoutDashboard, label: 'Monitoring IoT' },
    { id: AppSection.ML_PREDICT, icon: BrainCircuit, label: 'Prédictions ML' },
    { id: AppSection.IMPACT, icon: Globe, label: 'Impact Vert' },
    { id: AppSection.STRATEGY, icon: TrendingUp, label: 'Business & Impact' },
    { id: AppSection.STUDIO, icon: Palette, label: 'Studio Créatif' },
    { id: AppSection.ASSISTANT, icon: Sparkles, label: 'OliPack AI' },
  ].filter(item => canSee(item.id as AppSection));

  return (
    <aside className="w-20 md:w-64 bg-emerald-950 text-white flex flex-col transition-all duration-300 border-r border-emerald-800 shrink-0">
      <div className="p-8 flex items-center space-x-3">
        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tighter font-serif italic">OliPack</span>
      </div>

      <div className="px-5 py-4 mb-4 hidden md:block">
        <button 
          onClick={() => setActiveSection(AppSection.PROFILE)}
          className={`w-full text-left p-4 rounded-2xl border transition-all hover:ring-2 hover:ring-emerald-500/20 ${
            activeSection === AppSection.PROFILE 
              ? 'bg-emerald-500/20 border-emerald-500' 
              : role === 'ADMIN' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-900/40 border-emerald-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${role === 'ADMIN' ? 'bg-amber-500' : 'bg-emerald-500'} text-white shrink-0 shadow-inner`}>
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black truncate text-white uppercase tracking-tight">{safePrenom} {safeNom}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[8px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-full inline-block mt-1 ${role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {role}
                </span>
                <Settings className="w-3 h-3 text-white/30" />
              </div>
            </div>
          </div>
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as AppSection)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-emerald-100/50 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
              <span className={`ml-4 hidden md:block text-xs font-bold ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </button>
          );
        })}

        {(role === 'ADMIN' || role === 'TECHNICIEN') && (
          <div className="pt-4 mt-4 border-t border-emerald-900/50 space-y-1">
            <button
              onClick={() => setActiveSection(AppSection.QUALITY_CONTROL)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeSection === AppSection.QUALITY_CONTROL ? 'bg-cyan-600/20 text-cyan-400' : 'text-cyan-400/50 hover:bg-cyan-600/10'}`}
            >
              <FlaskConical className="w-5 h-5 shrink-0" />
              <span className="ml-4 hidden md:block text-xs font-bold">Bio-Qualité</span>
            </button>
            <button
              onClick={() => setActiveSection(AppSection.ADMIN_CONTROL)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeSection === AppSection.ADMIN_CONTROL ? 'bg-amber-500/20 text-amber-400' : 'text-amber-400/50 hover:bg-amber-500/10'}`}
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="ml-4 hidden md:block text-xs font-bold">Parc IoT</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-emerald-900 space-y-2">
        <button 
          onClick={() => setActiveSection(AppSection.ATELIER)}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeSection === AppSection.ATELIER ? 'bg-blue-500/20 text-blue-400' : 'text-blue-400/60 hover:text-white hover:bg-blue-500/10'}`}
        >
          <Info className="w-5 h-5 shrink-0" />
          <span className="ml-4 hidden md:block text-xs font-bold">Info sur projet</span>
        </button>
        <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-emerald-400/60 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group">
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="ml-4 hidden md:block text-xs font-bold">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
