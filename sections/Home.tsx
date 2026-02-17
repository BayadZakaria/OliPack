
import React from 'react';
/* Import Droplets icon to fix the ReferenceError on line 59 */
import { ArrowRight, Leaf, Zap, Globe, Recycle, Award, ShieldCheck, Factory, Beaker, ShoppingBag, ArrowUpRight, Droplets } from 'lucide-react';
import Logo from '../components/Logo';

interface HomeProps {
  onGetStarted: () => void;
  onExploreProducts?: () => void; // Ajouté pour la navigation vers la boutique
}

const Home: React.FC<HomeProps> = ({ onGetStarted, onExploreProducts }) => {
  return (
    <div className="space-y-16 animate-in pb-20">
      {/* HERO SECTION DYNAMIQUE */}
      <section className="relative min-h-[500px] rounded-[3rem] overflow-hidden bg-emerald-950 flex items-center p-8 md:p-16 shadow-2xl">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[120px]"></div>
          <Recycle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-white/10 rotate-12" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 animate-bounce-slow">
            <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg">
              <Award className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Startup de l'Année 2025</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
              Du déchet noir à <br/>
              <span className="text-emerald-400 italic">l'Or Vert.</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100/70 font-medium leading-relaxed max-w-lg">
              OliPack révolutionne l'industrie marocaine en transformant les margines et grignons en ressources bioplastiques et énergétiques de haute valeur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onGetStarted} 
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 px-10 rounded-[1.5rem] flex items-center justify-center transition-all text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 group"
            >
              ESPACE PARTENAIRE <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'products' }))}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black py-5 px-10 rounded-[1.5rem] flex items-center justify-center transition-all text-xs uppercase tracking-widest border border-white/10 active:scale-95"
            >
              BOUTIQUE CIRCULAIRE
            </button>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS / IMPACT */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard icon={Droplets} label="Nappes Sauvées" value="15M L" color="text-blue-500" />
        <MetricCard icon={Recycle} label="Waste Zero" value="100%" color="text-emerald-500" />
        <MetricCard icon={Factory} label="Pellets Prod." value="450T" color="text-amber-500" />
        <MetricCard icon={Zap} label="Energie Grte" value="A+" color="text-cyan-500" />
      </section>

      {/* SECTION VISION & PORTEUR DE PROJET */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500 rounded-[3rem] rotate-3 opacity-20 group-hover:rotate-0 transition-transform duration-700"></div>
          <img 
            src="https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?q=80&w=1000&auto=format&fit=crop" 
            alt="Oliveraies Maroc" 
            className="relative z-10 w-full h-[500px] object-cover rounded-[3rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute -bottom-6 -left-6 z-20 bg-white p-8 rounded-[2rem] shadow-3xl border border-slate-100 max-w-xs">
            <p className="text-sm font-medium text-slate-600 italic">
              "L'innovation durable est le seul chemin pour protéger notre terroir et notre économie."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-xs font-black text-white">ZB</div>
              <div>
                <p className="text-xs font-black text-slate-900">Zakaria Bayad</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fondateur OliPack</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Une technologie <br/> <span className="text-emerald-600">Bio-Inspirée.</span>
            </h2>
            <p className="text-slate-500 leading-relaxed text-lg">
              OliPack utilise la force de la biologie pour transformer les polluants phénoliques des margines en biopolymères PHA. Notre processus en circuit fermé garantit une empreinte carbone négative.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FeatureRow 
              icon={ShieldCheck} 
              title="Traçabilité IoT Intégrée" 
              desc="Chaque litre de margine est suivi de la maâssra jusqu'au produit fini."
            />
            <FeatureRow 
              icon={Beaker} 
              title="R&D Maroco-Européenne" 
              desc="Optimisation constante de nos recettes de bio-digestion."
            />
            <FeatureRow 
              icon={Globe} 
              title="Objectif 2030 : Zéro Rejet" 
              desc="Déployer nos solutions dans 100% des huileries du royaume."
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION - STUDIO AI TEASER */}
      <section className="bg-emerald-100 rounded-[3rem] p-12 md:p-16 border-2 border-emerald-200 overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md space-y-6 text-center md:text-left">
             <div className="bg-emerald-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg mx-auto md:mx-0">
               <Zap className="w-8 h-8 text-white fill-white" />
             </div>
             <h2 className="text-4xl font-black text-emerald-950 leading-tight">Testez le Studio AI <br/> d'OliPack.</h2>
             <p className="text-emerald-800 font-medium">
               Générez vos propres prototypes de packagings biodégradables basés sur notre matière Or Vert. Gratuit pour les visiteurs.
             </p>
             <button 
              onClick={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'studio' }))}
              className="bg-emerald-950 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 mx-auto md:mx-0 active:scale-95 transition-all"
             >
               OUVRIR LE STUDIO <ArrowUpRight className="w-5 h-5" />
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 rotate-3 scale-110">
            <div className="bg-white p-2 rounded-2xl shadow-xl"><img src="https://images.unsplash.com/photo-1591154665855-51fe22e71cf6?q=80&w=200&auto=format&fit=crop" className="rounded-xl" alt="Preview" /></div>
            <div className="bg-white p-2 rounded-2xl shadow-xl translate-y-8"><img src="https://images.unsplash.com/photo-1556228515-91bc0d984196?q=80&w=200&auto=format&fit=crop" className="rounded-xl" alt="Preview" /></div>
          </div>
        </div>
      </section>

      {/* FOOTER ACCUEIL */}
      <footer className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <Logo />
        <div className="flex gap-8">
           <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Vision</a>
           <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Technologie</a>
           <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Impact</a>
           <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Support</a>
        </div>
        <p className="text-[10px] font-bold text-slate-400">© 2025 OliPack. Tous droits réservés.</p>
      </footer>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const MetricCard: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
    <div className={`w-12 h-12 bg-slate-50 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
  </div>
);

const FeatureRow: React.FC<{ icon: any, title: string, desc: string }> = ({ icon: Icon, title, desc }) => (
  <div className="flex gap-6 p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 transition-all border border-transparent hover:border-slate-100">
    <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
      <Icon className="w-6 h-6" />
    </div>
    <div className="space-y-1">
      <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Home;
