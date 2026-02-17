'use client';

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Wand2, ImageIcon, Type, Loader2, Sparkles, Leaf } from 'lucide-react';

const OliPackStudio = () => {
  // --- ÉTATS (STATES) ---
  const [activeTab, setActiveTab] = useState<'design' | 'marketing'>('design'); // État pour changer entre Design et Marketing
  const [loading, setLoading] = useState(false); // État de chargement pour l'interface
  const [result, setResult] = useState<string | null>(null); // Stockage de la réponse de l'IA
  const [prompt, setPrompt] = useState(''); // Texte saisi par l'utilisateur

  // --- CONFIGURATION DE L'API GEMINI ---
  // On récupère la clé API depuis les variables d'environnement de Vercel
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

  // --- FONCTION DE GÉNÉRATION ---
  const handleGenerate = async () => {
    // Vérification de sécurité pour éviter le crash (écran blanc)
    if (!prompt) return;
    if (!genAI) {
      alert("Erreur : La clé API n'est pas configurée dans Vercel.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Utilisation du modèle Flash 1.5 pour une réponse rapide
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Construction du prompt système selon l'onglet actif
      const systemPrompt = activeTab === 'design' 
        ? `Agis comme un designer industriel. Décris un packaging écologique innovant pour : ${prompt}. Style: Minimaliste, Premium, matériaux en bioplastique d'olive.`
        : `Agis comme un expert en marketing. Rédige un slogan et une description courte pour : ${prompt}. Ton: Écologique, Innovant, Luxe.`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      setResult(response.text()); // Mise à jour de l'affichage avec le texte généré
    } catch (error) {
      console.error("Erreur Studio AI:", error);
      alert("Une erreur technique est survenue lors de la génération.");
    } finally {
      setLoading(false); // Arrêt du loader
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
      
      {/* HEADER : Titre et sélecteur de mode */}
      <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Sparkles className="text-emerald-400 w-6 h-6" />
          <h2 className="font-black uppercase tracking-tighter text-2xl">
            OliPack <span className="text-emerald-400">Studio AI</span>
          </h2>
        </div>
        
        <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => { setActiveTab('design'); setResult(null); }}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'design' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            DESIGN 3D
          </button>
          <button 
            onClick={() => { setActiveTab('marketing'); setResult(null); }}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'marketing' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            MARKETING
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* COLONNE GAUCHE : Saisie utilisateur */}
        <div className="p-10 border-r border-slate-100 bg-slate-50/50">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">
            Décrivez votre besoin
          </label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-44 bg-white border border-slate-200 rounded-3xl p-6 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm resize-none"
            placeholder={activeTab === 'design' ? "Ex: Une bouteille d'huile d'olive en forme de goutte..." : "Ex: Une campagne pub pour le marché européen..."}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full mt-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
            Lancer la Création
          </button>
        </div>

        {/* COLONNE DROITE : Résultat de l'IA */}
        <div className="p-10 flex flex-col items-center justify-center text-center bg-white min-h-[400px]">
          {result ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
               <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-emerald-900 text-sm leading-relaxed text-left italic font-medium relative">
                 <Sparkles className="absolute -top-3 -left-3 text-emerald-500 bg-white rounded-full p-1 border border-emerald-100" size={24} />
                 {result}
               </div>
            </div>
          ) : (
            <div className="opacity-20 flex flex-col items-center gap-6 select-none">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                {activeTab === 'design' ? <ImageIcon size={40} className="text-slate-400" /> : <Type size={40} className="text-slate-400" />}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                L'IA OliPack attend votre idée
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OliPackStudio;
