'use client';

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Palette, 
  Wand2, 
  ImageIcon, 
  Type, 
  Download, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  ShoppingCart, 
  ArrowRight, 
  Package, 
  Banknote, 
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Layers,
  ShoppingBag
} from 'lucide-react';
import Logo from '../components/Logo';
import { UserProfile, CartItem } from '../types';

interface OliPackStudioProps {
  user: UserProfile | null;
  onRequireAuth: () => void;
}

const OliPackStudio: React.FC<OliPackStudioProps> = ({ user, onRequireAuth }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'content'>('visual');
  const [loading, setLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  
  // Paramètres de prix
  const [quantity, setQuantity] = useState(100);
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [complexity, setComplexity] = useState<'Standard' | 'Premium' | 'Luxe'>('Standard');
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Initialisation IA (Sérieux : NEXT_PUBLIC pour Vercel)
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

  // Logique de calcul du prix
  useEffect(() => {
    let base = 15.0; // Prix de base PHA au kg/unité
    
    // Multiplicateur taille
    const sizeMult = size === 'S' ? 0.8 : size === 'M' ? 1.2 : 2.5;
    // Premium complexité
    const complexityAdd = complexity === 'Standard' ? 0 : complexity === 'Premium' ? 5 : 12;
    
    let unitPrice = (base * sizeMult) + complexityAdd;
    
    // Dégressivité quantité
    if (quantity >= 500) unitPrice *= 0.9;
    if (quantity >= 2000) unitPrice *= 0.8;

    setCalculatedPrice(unitPrice);
  }, [size, complexity, quantity]);

  // 1. Génération d'Image (Correction du modèle et méthode)
  const generatePrototype = async () => {
    if (loading || !prompt) return;
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert("Erreur: Clé API manquante dans le fichier .env.local");
      return;
    }

    setLoading(true);
    setOrderSent(false);
    setImageResult(null);
    try {
      const response = await ai.models.generateImage({
        model: 'imagen-3.0-generate-001',
        prompt: `Industrial 3D visualization of: ${prompt}. 
        Size context: ${size}. Complexity level: ${complexity}.
        Material: Luxury biodegradable PHA bioplastic from olive waste. 
        Professional studio lighting, high precision molding details.`,
        config: { numberOfImages: 1, aspectRatio: "1:1" }
      });

      if (response?.image?.base64) {
        setImageResult(`data:image/png;base64,${response.image.base64}`);
      } else {
        alert("Erreur: Impossible de générer l'image.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de génération visuelle. Vérifiez votre clé API.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Génération de Texte (Correction du modèle)
  const generateContent = async () => {
    if (loading || !prompt) return;
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert("Erreur: Clé API manquante dans le fichier .env.local");
      return;
    }

    setLoading(true);
    setOrderSent(false);
    setTextResult(null);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: `Rédige un argumentaire marketing de luxe pour ce produit OliPack : ${prompt}. Taille: ${size}, Complexité: ${complexity}. Ton : Innovant et premium. Structure avec des paragraphes clairs.` }]
        }],
      });
      setTextResult(response.response.text() || "Erreur de génération.");
    } catch (error) {
      console.error(error);
      alert("Erreur de génération du contenu marketing.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    const newCartItem: CartItem = {
      id: Math.floor(Math.random() * 1000000).toString(), // Converti en string si nécessaire selon votre type
      name: `Design IA: ${prompt.substring(0, 20)}...`,
      price: calculatedPrice, // ou calculatedPrice.toFixed(2) selon votre interface CartItem
      quantity: quantity,
      img: imageResult || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400",
      category: "Sur Mesure (Studio)"
    };

    const currentCart = JSON.parse(localStorage.getItem('olipack_active_cart') || '[]');
    currentCart.push(newCartItem);
    localStorage.setItem('olipack_active_cart', JSON.stringify(currentCart));

    handleOrderRequest();
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const handleOrderRequest = async () => {
    const orderData = {
      id: 'STUDIO-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      user: user?.email,
      product: prompt,
      quantity,
      price: calculatedPrice.toFixed(2),
      total: (calculatedPrice * quantity).toFixed(2),
      date: new Date().toISOString(),
      status: "EN_ATTENTE",
      ville: user?.ville,
      type: 'STUDIO',
      specs: { size, complexity }
    };

    const existingOrders = JSON.parse(localStorage.getItem('olipack_orders') || '[]');
    existingOrders.push(orderData);
    localStorage.setItem('olipack_orders', JSON.stringify(existingOrders));

    setOrderSent(true);
  };

  // VUE DE CONFIRMATION DE COMMANDE
  if (orderSent) {
    return (
      <div className="h-[70vh] flex items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center space-y-8 border border-emerald-100">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ajouté au Panier !</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Votre design sur mesure a été calculé et ajouté à votre panier de commande. Le gestionnaire de <span className="text-emerald-600 font-bold">{user?.ville || 'votre zone'}</span> l'analysera sous peu.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-100 space-y-2">
             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
               <span>Récapitulatif</span>
               <span>Total Estimé</span>
             </div>
             <div className="flex justify-between font-bold text-slate-700">
               <span className="text-xs">{quantity} x {size} ({complexity})</span>
               <span className="text-emerald-600">{(calculatedPrice * quantity).toFixed(2)} DH</span>
             </div>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'products' }))}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl"
          >
            VOIR MON PANIER / COMMANDES
          </button>
          <button onClick={() => { setOrderSent(false); setImageResult(null); setTextResult(null); }} className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest w-full">
            CRÉER UN AUTRE PROTOTYPE
          </button>
        </div>
      </div>
    );
  }

  // VUE PRINCIPALE DU STUDIO
  return (
    <div className="space-y-8 animate-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <Logo variant="dark" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Studio de Conception <span className="text-emerald-600 italic">Sur-Mesure</span></h1>
          <p className="text-slate-500 font-medium">Transformez vos idées en Or Vert avec tarification immédiate.</p>
        </div>
        <div className="flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
          <button 
            onClick={() => { setActiveTab('visual'); }} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Design Produit
          </button>
          <button 
            onClick={() => { setActiveTab('content'); }} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Marketing AI
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <Palette className="w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-tight">1. Concept Design</h2>
            </div>
            
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez l'objet (ex: Un pot cosmétique luxueux avec textures organiques...)"
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none shadow-inner"
            />

            <button
              onClick={activeTab === 'visual' ? generatePrototype : generateContent}
              disabled={loading || !prompt}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
              {loading ? 'GÉNÉRATION EN COURS...' : (activeTab === 'visual' ? 'GÉNÉRER LE VISUEL IA' : 'GÉNÉRER LE TEXTE IA')}
            </button>
          </div>

          {(imageResult || textResult || loading) && (
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in slide-in-from-bottom-6 duration-500 border border-emerald-500/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <Layers className="text-emerald-400 w-5 h-5" /> 2. Configuration & Prix
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Maximize2 className="w-3 h-3" /> Taille du produit</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['S', 'M', 'L'] as const).map(s => (
                      <button key={s} onClick={() => setSize(s)} className={`py-3 rounded-xl text-xs font-black transition-all border ${size === s ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                        {s === 'S' ? 'Standard' : s === 'M' ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3" /> Finition / Complexité</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Standard', 'Premium', 'Luxe'] as const).map(c => (
                      <button key={c} onClick={() => setComplexity(c)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${complexity === c ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                        {c.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package className="w-3 h-3" /> Volume de commande</label>
                  <input 
                    type="range" min="100" max="5000" step="100" value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] font-black text-emerald-400/60">
                    <span>100 unités</span>
                    <span className="text-white text-sm bg-white/10 px-3 py-1 rounded-lg">{quantity} unités</span>
                    <span>5000 unités</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950 p-6 rounded-3xl border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Prix Unitaire Estimé</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{calculatedPrice.toFixed(2)}</span>
                    <span className="text-xs font-bold text-emerald-500">DH</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Total Projet</p>
                  <div className="text-xl font-black text-white">{(calculatedPrice * quantity).toLocaleString()} DH</div>
                </div>
              </div>

              <button 
                onClick={addToCart}
                disabled={loading || (!imageResult && !textResult)}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" /> AJOUTER AU PANIER & COMMANDER
              </button>
            </div>
          )}
        </div>

        {/* Zone Aperçu */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Logo iconOnly className="scale-75" />
               <span className="font-black text-slate-800 tracking-tighter text-sm uppercase">Aperçu <span className="text-emerald-500 italic">OliPack Studio</span></span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50 relative">
            {loading ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">L'IA modélise votre Or Vert...</p>
              </div>
            ) : activeTab === 'visual' ? (
              imageResult ? (
                <div className="relative group animate-in zoom-in-95 duration-500">
                  <img src={imageResult} alt="Prototype" className="max-w-full max-h-[450px] rounded-3xl shadow-2xl border-8 border-white object-contain" />
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[9px] font-black px-4 py-2 rounded-full shadow-lg border border-white/20 uppercase tracking-widest">
                     Propriété Industrielle OliPack
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-20">
                  <ImageIcon className="w-24 h-24 mx-auto text-slate-400" />
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Décrivez votre produit pour voir le prototype</p>
                </div>
              )
            ) : (
              textResult ? (
                <div className="w-full h-full max-h-[450px] overflow-y-auto bg-white p-10 rounded-3xl border border-slate-200 shadow-inner custom-scrollbar">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-50">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Argumentaire certifié OliPack</span>
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-sm">
                    {textResult}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-20">
                  <Type className="w-24 h-24 mx-auto text-slate-400" />
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Le contenu marketing apparaîtra ici</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {!user && (
        <div className="bg-emerald-900 text-white p-10 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-800">
           <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-black italic tracking-tight">Ceci est une prévisualisation de commande</h3>
              <p className="text-emerald-200 text-sm font-medium opacity-80 uppercase tracking-wide">Connectez-vous pour que le gestionnaire de votre ville puisse valider votre demande.</p>
           </div>
           <button onClick={onRequireAuth} className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all active:scale-95">
             S'INSCRIRE POUR COMMANDER <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
};

export default OliPackStudio;
