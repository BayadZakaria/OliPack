
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Palette, 
  Wand2, 
  ImageIcon, 
  Film, 
  Download, 
  Loader2, 
  Sparkles, 
  ShoppingCart, 
  ArrowRight, 
  Package, 
  Maximize2,
  Layers,
  ShoppingBag,
  TriangleAlert,
  ExternalLink,
  Settings,
  Play,
  CheckCircle2,
  HelpCircle,
  Key
} from 'lucide-react';
import Logo from '../components/Logo';
import { UserProfile, CartItem } from '../types';

interface OliPackStudioProps {
  user: UserProfile | null;
  onRequireAuth: () => void;
}

const OliPackStudio: React.FC<OliPackStudioProps> = ({ user, onRequireAuth }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'video'>('visual');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showApiGuide, setShowApiGuide] = useState(false);
  
  // Paramètres de prix
  const [quantity, setQuantity] = useState(100);
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [complexity, setComplexity] = useState<'Standard' | 'Premium' | 'Luxe'>('Standard');
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    let base = 15.0;
    const sizeMult = size === 'S' ? 0.8 : size === 'M' ? 1.2 : 2.5;
    const complexityAdd = complexity === 'Standard' ? 0 : complexity === 'Premium' ? 5 : 12;
    let unitPrice = (base * sizeMult) + complexityAdd;
    if (quantity >= 500) unitPrice *= 0.9;
    if (quantity >= 2000) unitPrice *= 0.8;
    setCalculatedPrice(unitPrice);
  }, [size, complexity, quantity]);

  const messages = [
    "Analyse de la structure moléculaire des margines...",
    "Filtration des polyphénols en cours...",
    "Synthèse du biopolymère PHA...",
    "Modélisation des textures 'Or Vert'...",
    "Rendu haute précision 8K...",
    "Finalisation de l'alchimie digitale..."
  ];

  const handleKeySelection = async () => {
    try {
      if (typeof (window as any).aistudio?.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
        setError(null);
      } else {
        window.open("https://aistudio.google.com/app/apikey", "_blank");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateVideo = async () => {
    if (loading || !prompt) return;
    setLoading(true);
    setVideoResult(null);
    setError(null);

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      setLoadingMessage(messages[msgIdx % messages.length]);
      msgIdx++;
    }, 3000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic macro 3D animation: ${prompt}. Liquid dark olive waste slowly transforming into brilliant glowing emerald green bioplastic pellets. High-tech laboratory environment, bioluminescent effects, 4k, smooth transition.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoResult(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("entity was not found") || err.message?.includes("API key")) {
        setError("Une clé API valide est requise pour la génération vidéo. Veuillez utiliser le bouton de sélection.");
      } else {
        setError("La génération vidéo a échoué. Assurez-vous d'utiliser un projet Google Cloud avec facturation activée pour Veo.");
      }
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (loading || !prompt) return;
    setLoading(true);
    setImageResult(null);
    setError(null);
    setLoadingMessage("L'IA sculpte votre prototype...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { 
          parts: [{ 
            text: `High-end industrial design of ${prompt}. Made of premium PHA bioplastic from olive waste. Texture is matte emerald green with golden olive reflections. Studio lighting, 8k, professional product photography.` 
          }] 
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            setImageResult(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (err: any) {
      setError("Erreur de génération. Vérifiez votre clé API dans les paramètres Vercel.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!user) { onRequireAuth(); return; }
    const newCartItem: CartItem = {
      id: Math.floor(Math.random() * 1000000),
      name: `Design Studio: ${prompt.substring(0, 15)}...`,
      price: calculatedPrice.toFixed(2),
      quantity: quantity,
      img: imageResult || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400",
      category: "Sur Mesure"
    };
    const currentCart = JSON.parse(localStorage.getItem('olipack_active_cart') || '[]');
    currentCart.push(newCartItem);
    localStorage.setItem('olipack_active_cart', JSON.stringify(currentCart));
    
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
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  if (orderSent) {
    return (
      <div className="h-[70vh] flex items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center space-y-8 border border-emerald-100">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Ajouté au Panier !</h2>
          <p className="text-sm text-slate-500 font-medium">Votre design sur mesure est prêt. Le gestionnaire de {user?.ville} vous contactera.</p>
          <button onClick={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'products' }))} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">VOIR MES COMMANDES</button>
          <button onClick={() => setOrderSent(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CRÉER UN AUTRE MODÈLE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <Logo variant="dark" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">OliPack Studio <span className="text-emerald-600 italic">Innovation</span></h1>
          <p className="text-slate-500 font-medium text-sm">Visualisez l'avenir circulaire de vos packagings.</p>
        </div>
        {!process.env.API_KEY && (
          <button 
            onClick={() => setShowApiGuide(!showApiGuide)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black uppercase border border-amber-200 animate-pulse"
          >
            <HelpCircle className="w-4 h-4" /> Pas encore configuré ?
          </button>
        )}
      </header>

      {showApiGuide && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
             <Key className="text-amber-600 w-6 h-6" />
             <h2 className="text-lg font-black text-amber-900 uppercase tracking-tight">Guide : Activer l'Intelligence OliPack</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
                <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-black">1</span>
                <p className="text-xs font-bold text-amber-800">Obtenez votre clé sur <a href="https://aistudio.google.com/" target="_blank" className="underline">Google AI Studio</a>.</p>
             </div>
             <div className="space-y-2">
                <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-black">2</span>
                <p className="text-xs font-bold text-amber-800">Allez dans les <Settings className="inline w-3 h-3" /> **Settings** de votre projet sur Vercel.</p>
             </div>
             <div className="space-y-2">
                <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-black">3</span>
                <p className="text-xs font-bold text-amber-800">Ajoutez **API_KEY** dans "Environment Variables" et faites un **Redeploy**.</p>
             </div>
          </div>
          <button onClick={() => setShowApiGuide(false)} className="text-[10px] font-black text-amber-600 uppercase underline">J'ai compris, masquer le guide</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 text-red-800 animate-in slide-in-from-top-4">
          <TriangleAlert className="w-8 h-8 text-red-500 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="font-black text-sm uppercase">Configuration Requise</p>
            <p className="text-xs font-medium">{error}</p>
          </div>
          <button onClick={handleKeySelection} className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
             Sélectionner une clé <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button onClick={() => setActiveTab('visual')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
                <ImageIcon className="w-4 h-4" /> Prototype Image
              </button>
              <button onClick={() => setActiveTab('video')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'video' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
                <Film className="w-4 h-4" /> Animation 3D (Veo)
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description de votre concept</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'visual' ? "Ex: Un pot cosmétique luxueux..." : "Ex: Transformation des margines en granulés PHA..."}
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none shadow-inner"
              />
            </div>

            <button
              onClick={activeTab === 'visual' ? generateImage : generateVideo}
              disabled={loading || !prompt}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (activeTab === 'visual' ? <Wand2 className="w-5 h-5" /> : <Play className="w-5 h-5" />)}
              {loading ? 'ALCHIMIE EN COURS...' : (activeTab === 'visual' ? 'GÉNÉRER LE PROTOTYPE' : 'GÉNÉRER L\'ANIMATION VEO')}
            </button>
          </div>

          {(imageResult || videoResult || loading) && (
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in slide-in-from-bottom-6 duration-500 border border-emerald-500/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <Layers className="text-emerald-400 w-5 h-5" /> Options & Devis
                </h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</label>
                    <select value={size} onChange={(e) => setSize(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none">
                      <option value="S">Standard</option>
                      <option value="M">Medium</option>
                      <option value="L">Grand Volume</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finition</label>
                    <select value={complexity} onChange={(e) => setComplexity(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none">
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium Gold</option>
                      <option value="Luxe">Luxe Organique</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Estimé ({quantity} unités)</label>
                  <input type="range" min="100" max="5000" step="100" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none accent-emerald-500" />
                </div>
              </div>

              <div className="bg-emerald-950 p-6 rounded-3xl border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Estimation Totale</p>
                  <div className="text-2xl font-black">{(calculatedPrice * quantity).toLocaleString()} DH</div>
                </div>
                <button onClick={addToCart} className="bg-emerald-500 text-slate-900 p-4 rounded-2xl hover:scale-105 transition-transform">
                  <ShoppingCart className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Logo iconOnly className="scale-75" />
               <span className="font-black text-slate-800 text-sm uppercase">Laboratoire <span className="text-emerald-500 italic">Visuel</span></span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 relative">
            {loading ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                   <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                   <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{loadingMessage}</p>
                   <p className="text-[10px] text-slate-400 font-medium">Puissance IA de Gemini & Veo en action...</p>
                </div>
              </div>
            ) : videoResult ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 animate-in zoom-in-95">
                <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black">
                   <video src={videoResult} controls autoPlay loop className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-4">
                  <a href={videoResult} download="olipack-transformation.mp4" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                    <Download className="w-4 h-4" /> Télécharger
                  </a>
                </div>
              </div>
            ) : imageResult ? (
              <div className="relative group animate-in zoom-in-95">
                <img src={imageResult} alt="Prototype" className="max-w-full max-h-[450px] rounded-3xl shadow-2xl border-8 border-white object-contain" />
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[8px] font-black px-4 py-2 rounded-full shadow-lg border border-white/20 uppercase">
                   Prototype Bio-Industriel
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <ImageIcon className="w-24 h-24 mx-auto text-slate-400" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Décrivez votre innovation pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OliPackStudio;
