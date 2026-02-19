'use client';

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Wand2, ShoppingCart, Loader2, Sparkles, Image as ImageIcon, Plus, Minus, Info } from 'lucide-react';

const OliPackStudio = () => {
  const [loading, setLoading] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  
  // --- ÉTATS POUR LA COMMANDE ---
  const [quantity, setQuantity] = useState(1); // Quantité par défaut
  const basePrice = 249.00; // Prix unitaire du Vase Flora

  // Utilisation de la clé API configurée pour Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

  const handleGenerateDesign = async () => {
    if (!prompt || !genAI) return;
    setLoading(true);
    setImageResult(null);

    try {
      const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
      const result = await model.generateContent(`Professional 3D render of: ${prompt}. Style: Eco-friendly olive bioplastic, studio lighting, 8k.`);
      const imageData = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (imageData) setImageResult(`data:image/png;base64,${imageData}`);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération visuelle.");
    } finally {
      setLoading(false);
    }
  };

  // --- FONCTION POUR CALCULER LE TOTAL ---
  const totalPrice = (quantity * basePrice).toFixed(2);

  return (
    <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* COLONNE GAUCHE : CONCEPTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-emerald-600">
            <Sparkles size={20} />
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">Studio de Personnalisation</h2>
          </div>
          
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-emerald-500 transition-all shadow-inner text-slate-700"
            placeholder="Décrivez le vase de vos rêves..." 
          />
          
          <button 
            onClick={handleGenerateDesign}
            disabled={loading || !prompt}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
            CRÉER MON DESIGN UNIQUE
          </button>
        </div>

        {/* COLONNE DROITE : APERÇU ET PANIER */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 min-h-[450px] relative overflow-hidden">
          {imageResult ? (
            <div className="space-y-6 animate-in zoom-in-95 w-full">
              {/* Badge Sur Commande */}
              <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-orange-200 z-10 shadow-sm">
                <Info size={12} /> Sur Commande
              </div>

              <img src={imageResult} className="w-full h-64 object-cover rounded-[2rem] shadow-2xl border-4 border-white" alt="Custom Design" />
              
              {/* SÉLECTEUR DE QUANTITÉ ET PRIX */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantité</span>
                  <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-1 border">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><Minus size={16} /></button>
                    <span className="font-bold text-slate-800 min-w-[20px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><Plus size={16} /></button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Prix Total</span>
                     <span className="text-2xl font-black text-emerald-600">{totalPrice} <small className="text-xs">DH</small></span>
                   </div>
                   <span className="text-[9px] font-bold text-slate-300 italic">TVA incluse</span>
                </div>
              </div>

              {/* BOUTON AJOUT PANIER */}
              <button 
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-200"
                onClick={() => alert(`Commande "Sur Commande" de ${quantity} pièces ajoutée au panier !`)}
              >
                <ShoppingCart size={20} /> 
                AJOUTER AU PANIER
              </button>
            </div>
          ) : (
            <div className="text-center opacity-20">
              <ImageIcon size={80} className="mx-auto mb-4 text-slate-400" />
              <p className="font-black uppercase tracking-widest text-[10px]">Le prototype visual apparaîtra ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OliPackStudio;
