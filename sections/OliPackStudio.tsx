'use client';

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Wand2, ImageIcon, Type, Loader2, Sparkles, Leaf, ShoppingCart, Share2 } from 'lucide-react';

// --- COMPOSANT LOGO INTERNE ---
// Je l'ai mis ici pour éviter les erreurs d'importation si le fichier manque.
const SimpleLogo = () => (
  <div className="flex items-center gap-2 font-black tracking-tighter select-none">
    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-emerald-200 shadow-lg">
      <Leaf size={18} fill="currentColor" />
    </div>
    <span className="text-xl text-slate-900">OliPack<span className="text-emerald-500">.AI</span></span>
  </div>
);

const OliPackStudio = () => {
  // --- ÉTATS (STATES) ---
  const [activeTab, setActiveTab] = useState<'visual' | 'content'>('visual'); // Onglet actif (Image ou Texte)
  const [loading, setLoading] = useState(false); // État de chargement
  const [result, setResult] = useState<string | null>(null); // Résultat (URL image ou Texte)
  const [prompt, setPrompt] = useState(''); // Ce que l'utilisateur écrit

  // --- CONFIGURATION GEMINI ---
  // Initialisation du client avec la clé publique (NEXT_PUBLIC_)
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

  // --- FONCTION DE GÉNÉRATION ---
  const handleGenerate = async () => {
    // 1. Validation : On vérifie si l'input est vide ou si la clé manque
    if (!prompt) return;
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert("Erreur : Clé API manquante dans le fichier .env.local");
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      if (activeTab === 'visual') {
        // --- CAS 1 : GÉNÉRATION D'IMAGE (Mode Design) ---
        // On utilise le modèle spécialisé "Imagen 3"
        const response = await ai.models.generateImage({
          model: 'imagen-3.0-generate-001',
          prompt: `Professional 3D product render of: ${prompt}. 
          Style: High-end industrial design, eco-friendly material (bioplastic from olive waste), olive green accents, studio lighting, 8k resolution, minimalist packaging.`,
          config: { 
            numberOfImages: 1, 
            aspectRatio: "1:1" // Format carré
          }
        });
        
        // On vérifie si l'image a bien été générée en Base64
        if (response?.image?.base64) {
          setResult(`data:image/png;base64,${response.image.base64}`);
        } else {
          alert("L'image n'a pas pu être générée. Vérifiez que l'API Imagen est activée sur votre compte Google Cloud.");
        }

      } else {
        // --- CAS 2 : GÉNÉRATION DE TEXTE (Mode Marketing) ---
        // On utilise le modèle rapide "Gemini 1.5 Flash"
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{
            role: 'user',
            parts: [{ 
              text: `Agis en tant qu'expert marketing pour OliPack (startup marocaine de bioplastique).
              Rédige une description produit attractive pour : "${prompt}".
              
              Structure de la réponse :
              1. Accroche ("Hook") percutante.
              2. 3 Points forts (Écologique, Durable, Innovation Marocaine).
              3. Appel à l'action.
              
              Ton : Premium, Innovant, Éco-responsable. Maximum 150 mots.` 
            }]
          }]
        });
        
        // On récupère le texte de la réponse
        setResult(response.response.text());
      }

    } catch (error) {
      console.error("Erreur Studio:", error);
      alert("Une erreur est survenue lors de la connexion à l'IA. Vérifiez la console (F12) pour plus de détails.");
    } finally {
      // Quoi qu'il arrive (succès ou erreur), on arrête le chargement
      setLoading(false);
    }
  };

  // --- INTERFACE UTILISATEUR (JSX) ---
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        
        {/* EN-TÊTE (Header) : Logo et Boutons de navigation */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <SimpleLogo />
          
          {/* Sélecteur d'onglets */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button 
              onClick={() => { setActiveTab('visual'); setResult(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'visual' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ImageIcon className="w-4 h-4" /> Design 3D
            </button>
            <button 
              onClick={() => { setActiveTab('content'); setResult(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'content' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Type className="w-4 h-4" /> Marketing
            </button>
          </div>
        </div>

        {/* ZONE PRINCIPALE : Grille 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          
          {/* COLONNE GAUCHE : Zone de saisie (Prompt) */}
          <div className="p-8 md:p-12 space-y-8 border-r border-slate-50 bg-slate-50/30">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-800 leading-tight">
                {activeTab === 'visual' ? 'Imaginez votre Packaging.' : 'Rédigez votre Campagne.'}
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                L'IA OliPack transforme vos idées en prototypes industriels durables.
              </p>
            </div>

            <div className="relative group">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'visual' 
                  ? "Ex: Une bouteille d'huile d'olive premium, forme ergonomique, texture mate..." 
                  : "Ex: Lancement d'une gamme de pots cosmétiques biodégradables pour l'été..."}
                className="w-full h-48 bg-white border border-slate-200 rounded-3xl p-6 text-slate-700 font-medium text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none shadow-sm group-hover:shadow-md"
              />
              <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300 uppercase">
                Powered by Gemini
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Générer le Concept
                </>
              )}
            </button>
          </div>

          {/* COLONNE DROITE : Zone de résultat */}
          <div className="relative bg-white flex flex-col">
            
            {/* Indicateur de chargement (Overlay) */}
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in">
                <div className="relative">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full animate-ping absolute opacity-20"></div>
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10">
                    <Sparkles className="w-8 h-8 animate-spin-slow" />
                  </div>
                </div>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest animate-pulse">L'IA travaille...</p>
              </div>
            )}

            {/* Contenu du résultat */}
            <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
              
              {/* État vide (Placeholder) */}
              {!result && !loading && (
                <div className="text-center space-y-4 opacity-20 select-none">
                  <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
                    {activeTab === 'visual' ? <ImageIcon className="w-10 h-10 text-slate-400" /> : <Type className="w-10 h-10 text-slate-400" />}
                  </div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Le résultat apparaîtra ici</p>
                </div>
              )}

              {/* Affichage Image */}
              {result && activeTab === 'visual' && (
                <div className="relative w-full group animate-in zoom-in-95 duration-500">
                  <img src={result} alt="Prototype OliPack" className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white transform transition-transform group-hover:scale-[1.02]" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-emerald-600 shadow-sm flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Imagen 3
                  </div>
                </div>
              )}

              {/* Affichage Texte Marketing */}
              {result && activeTab === 'content' && (
                <div className="w-full h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4">
                  <div className="prose prose-sm prose-emerald max-w-none text-slate-600 font-medium leading-relaxed bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                       <Sparkles className="w-4 h-4" /> Analyse Marketing
                    </div>
                    {/* On affiche le texte en respectant les sauts de ligne */}
                    <div className="whitespace-pre-line">{result}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pied de page du résultat (Actions) */}
            {result && (
              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/50 animate-in fade-in">
                <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors flex items-center gap-2 shadow-sm">
                  <Share2 className="w-4 h-4" /> Partager
                </button>
                <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-200">
                  <ShoppingCart className="w-4 h-4" /> Enregistrer le projet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OliPackStudio;
