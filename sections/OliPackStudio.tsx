
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
  ShoppingBag,
  TriangleAlert,
  ExternalLink,
  Settings
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
  const [error, setError] = useState<string | null>(null);
  
  // Paramètres de prix
  const [quantity, setQuantity] = useState(100);
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [complexity, setComplexity] = useState<'Standard' | 'Premium' | 'Luxe'>('Standard');
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Logique de calcul du prix
  useEffect(() => {
    let base = 15.0; // Prix de base PHA au kg/unité
    const sizeMult = size === 'S' ? 0.8 : size === 'M' ? 1.2 : 2.5;
    const complexityAdd = complexity === 'Standard' ? 0 : complexity === 'Premium' ? 5 : 12;
    let unitPrice = (base * sizeMult) + complexityAdd;
    if (quantity >= 500) unitPrice *= 0.9;
    if (quantity >= 2000) unitPrice *= 0.8;
    setCalculatedPrice(unitPrice);
  }, [size, complexity, quantity]);

  const generatePrototype = async () => {
    if (loading || !prompt) return;
    
    // Vérification de la clé API
    const apiKey = process.env.API_KEY;
    
    // Si la clé est vide ou n'est pas configurée correctement
    if (!apiKey || apiKey === '' || apiKey.length < 10) {
      setError("ERREUR VERCEL : La variable d'environnement doit être nommée 'API_KEY' (sans espaces ni accents). Actuellement, le système ne trouve pas votre clé.");
      return;
    }

    setLoading(true);
    setOrderSent(false);
    setImageResult(null);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [{ 
            text: `Professional 3D high-end industrial design visualization of: ${prompt}. 
            Product size: ${size}. High complexity details.
            Material: Luxury bio-plastic PHA from olive waste, olive-green elegant texture. 
            8k octane render, studio lighting, hyper-realistic.` 
          }] 
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        let found = false;
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setImageResult(`data:image/png;base64,${part.inlineData.data}`);
            found = true;
            break;
          }
        }
        if (!found) throw new Error("Réponse vide de l'IA.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Échec de la connexion API. Vérifiez que la valeur de votre clé API est correcte et qu'elle n'est pas expirée.");
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
      id: Math.floor(Math.random() * 1000000),
      name: `Studio AI: ${prompt.substring(0, 15)}...`,
      price: calculatedPrice.toFixed(2),
      quantity: quantity,
      img: imageResult || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400",
      category: "Sur Mesure"
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
              Votre design sur mesure a été calculé et ajouté à votre panier. Le gestionnaire de <span className="text-emerald-600 font-bold">{user?.ville}</span> l'analysera.
            </p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'products' }))}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl"
          >
            VOIR MON PANIER
          </button>
          <button onClick={() => setOrderSent(false)} className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest">
            CRÉER UN AUTRE MODÈLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <Logo variant="dark" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">OliPack Studio <span className="text-emerald-600 italic">Premium</span></h1>
          <p className="text-slate-500 font-medium text-sm">Design industriel assisté par IA avec tarification en temps réel.</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 text-red-800 animate-in slide-in-from-top-4">
          <div className="bg-red-100 p-4 rounded-2xl text-red-600 shrink-0">
            <TriangleAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2 flex-1 text-center md:text-left">
            <p className="font-black text-sm uppercase tracking-widest">Action Requise sur Vercel</p>
            <p className="text-xs leading-relaxed font-medium">Le nom de votre variable d'environnement sur Vercel est incorrect. Vous devez la nommer exactement <strong>API_KEY</strong> (tout en majuscules, sans espaces).</p>
          </div>
          <div className="flex gap-2 shrink-0">
             <a 
               href="https://vercel.com/dashboard" 
               target="_blank" 
               className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
             >
               Vercel Dashboard <Settings className="w-3 h-3" />
             </a>
          </div>
        </div>
      )}

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
              placeholder="Décrivez votre packaging (ex: Un pot de crème luxueux texturé olive...)"
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none shadow-inner"
            />

            <button
              onClick={generatePrototype}
              disabled={loading || !prompt}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
              {loading ? 'MODÉLISATION...' : 'GÉNÉRER LE VISUEL IA'}
            </button>
          </div>

          {(imageResult || loading) && (
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
                        {s === 'S' ? 'Petit' : s === 'M' ? 'Moyen' : 'Grand'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3" /> Complexité</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Standard', 'Premium', 'Luxe'] as const).map(c => (
                      <button key={c} onClick={() => setComplexity(c)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${complexity === c ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                        {c.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package className="w-3 h-3" /> Quantité</label>
                  <input 
                    type="range" min="100" max="5000" step="100" value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] font-black text-emerald-400/60 mt-2">
                    <span>100 unités</span>
                    <span className="text-white text-xs bg-emerald-600 px-3 py-1 rounded-lg">{quantity} unités</span>
                    <span>5000 unités</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950 p-6 rounded-3xl border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Unitaire Estimé</p>
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
                disabled={loading || !imageResult}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30"
              >
                <ShoppingCart className="w-5 h-5" /> AJOUTER AU PANIER
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Logo iconOnly className="scale-75" />
               <span className="font-black text-slate-800 tracking-tighter text-sm uppercase">Aperçu <span className="text-emerald-500 italic">Modèle 3D</span></span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50 relative">
            {loading ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Génération du prototype...</p>
              </div>
            ) : imageResult ? (
              <div className="relative group animate-in zoom-in-95 duration-500">
                <img src={imageResult} alt="Prototype" className="max-w-full max-h-[450px] rounded-3xl shadow-2xl border-8 border-white object-contain" />
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[8px] font-black px-4 py-2 rounded-full shadow-lg border border-white/20 uppercase tracking-widest">
                   OliPack Studio IA
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <ImageIcon className="w-24 h-24 mx-auto text-slate-400" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Votre design apparaîtra ici</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OliPackStudio;
