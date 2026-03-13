import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Wand2, 
  ImageIcon, 
  Film, 
  Download, 
  Loader2, 
  Sparkles, 
  ShoppingCart, 
  Package, 
  Layers,
  ShoppingBag,
  TriangleAlert,
  ExternalLink,
  Settings,
  Play,
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
  
  const [quantity, setQuantity] = useState(100);
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [complexity, setComplexity] = useState<'Standard' | 'Premium' | 'Luxe'>('Standard');
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Calcul du prix dynamique (DH)
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
    "Analyse de la structure moléculaire...",
    "Synthèse du biopolymère PHA...",
    "Modélisation des textures 'Or Vert'...",
    "Rendu haute précision en cours...",
    "Finalisation de l'alchimie digitale..."
  ];

  const handleKeySelection = async () => {
    window.open("https://aistudio.google.com/app/apikey", "_blank");
  };

  // --- GÉNÉRATION D'IMAGE ---
  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setImageResult(null);
    setError(null);
    setLoadingMessage("L'IA sculpte votre prototype avec le logo OliPack...");

    try {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `High-end industrial design of ${prompt}. The product MUST prominently feature the "OliPack" logo. Made of premium PHA bioplastic from olive waste. Texture is matte emerald green with golden olive reflections. Studio lighting, 8k, professional product photography, clean background.`,
          aspectRatio: "1:1"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image.");
      }

      const data = await response.json();
      setImageResult(data.image);
      
    } catch (err: any) {
      setError("Erreur de génération. Vérifiez la configuration serveur.");
      console.error(err);
      // Fallback for demo
      setImageResult("https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop");
    } finally {
      setLoading(false);
    }
  };

  // --- GÉNÉRATION VIDÉO (CONCEPT VEO) ---
  const generateVideo = async () => {
    if (!prompt) return;
    setLoading(true);
    setVideoResult(null);
    setError(null);

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      setLoadingMessage(messages[msgIdx % messages.length]);
      msgIdx++;
    }, 3000);

    try {
      // Simulation d'appel Veo (en attente de déploiement public complet du SDK Vidéo)
      await new Promise(resolve => setTimeout(resolve, 5000));
      setVideoResult("https://player.vimeo.com/external/494252666.sd.mp4?s=721c606e78801d9f0a20509a27e7d667614d9b62&profile_id=164&oauth2_token_id=57447761");
    } catch (err: any) {
      setError("Le service Veo est actuellement en accès limité.");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!user) { onRequireAuth(); return; }
    const newCartItem: CartItem = {
      id: Math.floor(Math.random() * 1000000),
      name: `Studio: ${prompt.substring(0, 15)}`,
      price: (calculatedPrice * quantity).toFixed(2),
      quantity: quantity,
      img: imageResult || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400",
      category: "Sur Mesure"
    };
    
    const currentCart = JSON.parse(localStorage.getItem('olipack_active_cart') || '[]');
    currentCart.push(newCartItem);
    localStorage.setItem('olipack_active_cart', JSON.stringify(currentCart));
    
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
          <h2 className="text-3xl font-black text-slate-900">Ajouté !</h2>
          <p className="text-sm text-slate-500 font-medium">Votre design est prêt. L'équipe OliPack à {user?.ville} vous contactera.</p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">CRÉER UN AUTRE MODÈLE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in duration-700 pb-20 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <Logo variant="dark" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">OliPack Studio <span className="text-emerald-600 italic">Innovation</span></h1>
          <p className="text-slate-500 font-medium text-sm">Visualisez vos futurs packagings circulaires.</p>
        </div>
        <button 
            onClick={() => setShowApiGuide(!showApiGuide)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black uppercase border border-amber-200"
          >
            <HelpCircle className="w-4 h-4" /> Configurer l'IA
        </button>
      </header>

      {showApiGuide && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
             <Key className="text-amber-600 w-6 h-6" />
             <h2 className="text-lg font-black text-amber-900 uppercase">Installation de la Clé API</h2>
          </div>
          <p className="text-xs text-amber-800">
            1. Créez une clé sur <strong>Google AI Studio</strong>.<br/>
            2. Ajoutez-la dans vos variables d'environnement Vercel sous le nom <strong>NEXT_PUBLIC_GEMINI_API_KEY</strong>.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] flex items-center gap-4 text-red-800 animate-in slide-in-from-top-4">
          <TriangleAlert className="w-6 h-6 text-red-500" />
          <p className="text-xs font-bold uppercase">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panneau de Contrôle */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button onClick={() => setActiveTab('visual')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'visual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
                <ImageIcon className="w-4 h-4" /> Image
              </button>
              <button onClick={() => setActiveTab('video')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'video' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
                <Film className="w-4 h-4" /> Animation
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Concept du design</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Pot de crème minimaliste en bioplastique d'olive..."
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm outline-none resize-none"
              />
            </div>

            <button
              onClick={activeTab === 'visual' ? generateImage : generateVideo}
              disabled={loading || !prompt}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
              {loading ? 'ALCHIMIE EN COURS...' : 'GÉNÉRER LE PROTOTYPE'}
            </button>
          </div>

          {/* Options de Commande */}
          {(imageResult || videoResult || loading) && (
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in slide-in-from-bottom-6 border border-emerald-500/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Format</label>
                  <select value={size} onChange={(e) => setSize(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none">
                    <option value="S">Standard (Small)</option>
                    <option value="M">Medium</option>
                    <option value="L">Grand Volume</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Finition</label>
                  <select value={complexity} onChange={(e) => setComplexity(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none">
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium Gold</option>
                    <option value="Luxe">Luxe Organique</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase">Quantité ({quantity} unités)</label>
                <input type="range" min="100" max="5000" step="100" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none accent-emerald-500" />
              </div>

              <div className="bg-emerald-950 p-6 rounded-3xl border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase">Total Estimé</p>
                  <div className="text-2xl font-black">{(calculatedPrice * quantity).toLocaleString()} DH</div>
                </div>
                <button onClick={addToCart} className="bg-emerald-500 text-slate-900 p-4 rounded-2xl hover:scale-105 transition-transform">
                  <ShoppingCart className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Visualisation Lab */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-slate-100 bg-white flex items-center gap-2">
               <Logo iconOnly className="scale-75" />
               <span className="font-black text-slate-800 text-sm uppercase">Laboratoire <span className="text-emerald-500 italic">Visuel</span></span>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 relative">
            {loading ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                   <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                   <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <p className="text-sm font-black text-slate-800 uppercase">{loadingMessage}</p>
              </div>
            ) : videoResult ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 animate-in zoom-in-95">
                <video src={videoResult} controls autoPlay loop className="w-full aspect-video rounded-3xl shadow-2xl border-4 border-white object-cover bg-black" />
              </div>
            ) : imageResult ? (
              <div className="relative animate-in zoom-in-95 group">
                <img src={imageResult} alt="Prototype" className="max-w-full max-h-[450px] rounded-3xl shadow-2xl border-8 border-white object-contain" />
                {/* Logo Overlay for Branding */}
                <div className="absolute top-12 right-12 opacity-80 group-hover:opacity-100 transition-opacity">
                   <Logo iconOnly className="scale-150 drop-shadow-lg" />
                </div>
                <div className="absolute bottom-12 left-12 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">OliPack Certified Design</p>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-20">
                <ImageIcon className="w-24 h-24 mx-auto text-slate-400" />
                <p className="text-xs font-black uppercase mt-4">Décrivez votre innovation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OliPackStudio;
