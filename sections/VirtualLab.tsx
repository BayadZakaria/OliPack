
import React, { useState } from 'react';
import { 
  FlaskConical, 
  ExternalLink, 
  Monitor, 
  Wifi, 
  Play, 
  Box, 
  FileCode, 
  Info, 
  CheckCircle,
  Cpu,
  Zap,
  Network
} from 'lucide-react';

const VirtualLab: React.FC = () => {
  const [step, setStep] = useState(1);

  const wokwiSteps = [
    {
      title: "Environnement Virtuel",
      desc: "Allez sur Wokwi.com et créez un projet 'ESP32'. C'est votre laboratoire gratuit.",
      icon: Monitor
    },
    {
      title: "Schéma Digital",
      desc: "Ajoutez un capteur Ultrasons (HC-SR04) et une LED pour simuler l'alerte.",
      icon: Network
    },
    {
      title: "Injection de Code",
      desc: "Copiez le code OliPack_Connect.ino (Section Hardware) dans l'éditeur.",
      icon: FileCode
    },
    {
      title: "Liaison Cloud",
      desc: "Simulez le Wi-Fi intégré de Wokwi pour envoyer les données à OliPack Portal.",
      icon: Wifi
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FlaskConical className="text-cyan-500" />
            Laboratoire Virtuel
          </h1>
          <p className="text-slate-500">Le "Jumeau Numérique" (Digital Twin) pour tester OliPack sans matériel.</p>
        </div>
        <a 
          href="https://wokwi.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200"
        >
          Ouvrir Wokwi.com <ExternalLink className="w-4 h-4" />
        </a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Concept Digital Twin */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="bg-cyan-50 text-cyan-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Box className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Pourquoi simuler ?</h2>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Un **Jumeau Numérique** est une réplique virtuelle de votre système physique. Pour OliPack, cela permet de :
              </p>
              <ul className="space-y-3">
                {[
                  "Valider l'algorithme de calcul de niveau",
                  "Tester les alertes sans remplir de cuves réelles",
                  "Vérifier la connexion MongoDB avant l'achat",
                  "Faire une démo impressionnante devant un jury"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-cyan-100 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
        </div>

        {/* Interactive Simulation Map */}
        <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <Zap className="text-yellow-400 w-5 h-5" />
                Workflow de Simulation Gratuite
              </h3>
              <div className="flex gap-2">
                {wokwiSteps.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-8 bg-cyan-400' : 'w-3 bg-slate-700'}`}></div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 relative group cursor-pointer" onClick={() => setStep(step % 4 + 1)}>
                  <span className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-500 text-slate-900 rounded-full flex items-center justify-center font-black text-sm shadow-lg">
                    {step}
                  </span>
                  <div className="flex items-center gap-4 mb-2">
                    {React.createElement(wokwiSteps[step - 1].icon, { className: "w-6 h-6 text-cyan-400" })}
                    <h4 className="font-bold text-lg">{wokwiSteps[step - 1].title}</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {wokwiSteps[step - 1].desc}
                  </p>
                  <button className="mt-4 text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                    Étape suivante <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center min-h-[200px] group transition-all hover:border-cyan-500/50">
                   <Cpu className={`w-20 h-20 text-slate-600 transition-all duration-700 ${step === 3 ? 'text-cyan-400 scale-110' : ''}`} />
                   <div className={`absolute inset-0 bg-cyan-500/5 blur-2xl rounded-full transition-opacity duration-700 ${step === 4 ? 'opacity-100' : 'opacity-0'}`}></div>
                   <div className="mt-4 text-center">
                      <p className="text-[10px] font-mono text-slate-500 uppercase">Simulateur ESP32 v3.1</p>
                      {step === 4 && <p className="text-[10px] font-mono text-cyan-400 animate-pulse">LIAISON WIFI ACTIVE...</p>}
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center gap-4">
             <Info className="w-5 h-5 text-cyan-400" />
             <p className="text-xs text-slate-400 italic">
               "Le simulateur Wokwi vous permet d'écrire et de tester 100% de la logique d'OliPack avant même de toucher un fer à souder."
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
            <Cpu className="text-emerald-600" />
            Liste des Courses Virtuelles
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-sm font-medium">ESP32 (Wokwi Built-in)</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">GRATUIT</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-sm font-medium">Capteur HC-SR04 (Ultrasons)</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">GRATUIT</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-sm font-medium">Liaison HTTP/JSON (WiFi virtuel)</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">GRATUIT</span>
            </div>
          </div>
        </section>

        <section className="bg-cyan-900 text-white p-8 rounded-3xl relative overflow-hidden group">
           <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="text-cyan-400" />
                Démo au Jury
              </h3>
              <p className="text-sm text-cyan-100 leading-relaxed mb-6">
                Si vous n'avez pas le matériel le jour J :
                <br /><br />
                1. Ouvrez Wokwi à gauche et OliPack Dashboard à droite.
                <br />
                2. Modifiez la distance sur le capteur virtuel.
                <br />
                3. **BOOM !** Le niveau monte en temps réel sur l'App. 
                <br /><br />
                C'est la preuve ultime que votre logiciel est prêt pour l'échelle industrielle.
              </p>
           </div>
           <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-700 rounded-full blur-3xl opacity-30"></div>
        </section>
      </div>
    </div>
  );
};

export default VirtualLab;
