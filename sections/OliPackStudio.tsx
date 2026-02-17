'use client';

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Wand2, ImageIcon, Type, Loader2, Sparkles, Leaf } from 'lucide-react';

const OliPackStudio = () => {
  // --- ÉTATS (STATES) ---
  const [activeTab, setActiveTab] = useState<'design' | 'marketing'>('design'); // Gérer l'onglet actif
  const [loading, setLoading] = useState(false); // État de chargement de l'IA
  const [result, setResult] = useState<string | null>(null); // Stocker le résultat généré
  const [prompt, setPrompt] = useState(''); // Stocker le texte saisi par l'utilisateur

  // --- CONFIGURATION DE L'API GEMINI ---
  // On utilise la variable d'environnement définie dans Vercel
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

  // --- FONCTION DE GÉNÉRATION ---
  const handleGenerate = async () => {
    // Vérifier si le prompt est vide ou si l'API n'est pas configurée
    if (!prompt || !genAI) {
      if (!genAI) alert("Erreur : Clé API manquante dans les paramètres Vercel.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Utilisation du modèle Gemini 1.5 Flash pour la rapidité
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Définir les instructions selon l'onglet sélectionné
      const systemPrompt = activeTab === 'design' 
        ? `Agis comme un designer industriel expert. Décris un packaging écologique innovant pour : ${prompt}. Style: Minimaliste, Premium, matériaux en bioplastique d'olive.`
        : `Agis comme un expert en marketing digital. Rédige un slogan accrocheur et une description de produit pour : ${prompt}. Ton: Écologique, Innovant, Luxe.`;

      // Appel à l'API
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      setResult(response.text()); // Mise à jour du résultat avec le texte généré
    } catch (error) {
      console.error("Erreur de génération:", error);
      alert("Une erreur technique est survenue. Vérifiez la console.");
    } finally {
      setLoading(false); // Arrêt de l'indicateur de chargement
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
      
      {/* SECTION : EN-TÊTE DU STUDIO */}
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-emerald-400" />
          <h2 className="font-black uppercase tracking-tighter text-xl">
            OliPack <span className="text-emerald-400">Studio AI</span>
          </h2>
        </div>
        
        {/* SÉLECTEUR D'ONGLETS (DESIGN VS MARKETING) */}
        <div className="flex bg-white/10 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('design')}
            className={`px-4 py-2 rounded-md text-[10px] font-bold transition-all ${activeTab === 'design' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
          >
            DESIGN 3D
          </button>
          <button 
            onClick={() => setActiveTab('marketing')}
            className={`px-4 py-2 rounded-md text-[10px] font-bold transition-all ${activeTab === 'marketing' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
          >
            MARKETING
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* COLONNE GAUCHE : SAISIE DE L'UTILISATEUR */}
        <div className="p-8 border-r border-slate-100 bg-slate-50/50">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">
            Votre Idée / Concept
          </label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-40 bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
            placeholder={activeTab === 'design' ? "Ex: Une bouteille ergonomique pour huile d'olive..." : "Ex: Description pour un savon bio..."}
          />
          
          {/* BOUTON DE GÉNÉRATION */}
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full mt-6 py-4 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
            Générer avec l'IA
          </button>
        </div>

        {/* COLONNE DROITE : AFFICHAGE DU RÉSULTAT */}
        <div className="p-8 flex flex-col items-center justify-center text-center bg-white min-h-[300px]">
          {result ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               {/* Affichage du texte généré par Gemini */}
               <p className="text-slate-600 text-sm leading-relaxed text-left italic p-4 bg-slate-50 rounded-xl border border-slate-100">
                 "{result}"
               </p>
            </div>
          ) : (
            /* ÉTAT INITIAL : QUAND RIEN N'EST ENCORE GÉNÉRÉ */
            <div className="opacity-20 flex flex-col items-center gap-4">
              {activeTab === 'design' ? <ImageIcon size={48} /> : <Type size={48} />}
              <p className="text-[10px] font-black uppercase tracking-widest">
                Le résultat s'affichera ici
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OliPackStudio;
