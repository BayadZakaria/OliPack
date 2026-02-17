
import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import Logo from '../components/Logo';
import { UserProfile } from '../types';

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
  
  const [quantity, setQuantity] = useState(50);
  const [targetPrice, setTargetPrice] = useState('');

  const generatePrototype = async () => {
    if (loading || !prompt) return;
    setLoading(true);
    setOrderSent(false);
    setImageResult(null);
    setTextResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [{ 
            text: `High-end industrial 3D product visualization of: ${prompt}. 
            Material: Luxury biodegradable PHA bioplastic, smooth matte finish. 
            Color palette: Deep emerald green, marble white, olive oil gold accents. 
            Branding: Embossed "OliPack" logo. 
            Professional studio soft-box lighting, 8k resolution.` 
          }] 
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setImageResult(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      alert("La génération visuelle a échoué. Vérifiez votre clé API.");
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (loading || !prompt) return;
    setLoading(true);
    setOrderSent(false);
    setTextResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rédige un argumentaire marketing de luxe pour ce produit OliPack : ${prompt}. Ton : Innovant et premium.`,
      });
      setTextResult(response.text || "Erreur de génération.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderRequest = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setIsOrdering(true);
    
    // Simulation d'envoi à la base de données
    setTimeout(() => {
      const orderData = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: user.email,
        product: prompt,
        quantity,
        price: targetPrice || "Sur devis",
        date: new Date().toISOString(),
        status: "EN_ATTENTE",
        ville: user.ville, // IMPORTANT: Tracement pour le vendeur local
        type: 'STUDIO'
      };

      // Sauvegarde locale
      const existingOrders = JSON.parse(localStorage.getItem('olipack_orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('olipack_orders', JSON.stringify(existingOrders));

      setIsOrdering(false);
      setOrderSent(true);
    }, 1500);
  };

  if (orderSent) {
    return (
      <div className="h-[70vh] flex items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center space-y-8 border border-emerald-100">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Demande Envoyée !</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Votre demande de production pour <span className="text-emerald-600 font-bold">"{prompt}"</span> a été transmise à notre équipe technique de {user?.ville}.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-100">
             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
               <span>Quantité</span>
               <span>Budget</span>
             </div>
             <div className="flex justify-between font-bold text-slate-700">
               <span>{quantity} pcs</span>
               <span>{targetPrice || 'À définir'} DH</span>
             </div>
          </div>
          <button 
            onClick={() => setOrderSent(false)}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl"
          >
            CRÉER UN AUTRE DESIGN
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
          <h1 className="text-3xl font-black text-slate-900 ml-1 tracking-tight">OliPack Studio AI</h1>
          <p className="text-slate-500 ml-1 font-medium italic">Créez votre futur packaging en Or Vert.</p>
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
              <h2 className="text-lg font-black uppercase tracking-tight">Concept Design</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description de votre objet</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Un flacon de cosmétique luxueux avec des motifs d'olivier en relief..."
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none shadow-inner"
                />
              </div>

              <button
                onClick={activeTab === 'visual' ? generatePrototype : generateContent}
                disabled={loading || !prompt}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 shadow-xl"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                {loading ? 'MODÉLISATION...' : 'GÉNÉRER LE PROTOTYPE'}
              </button>
            </div>
          </div>

          {(imageResult || textResult) && (
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in slide-in-from-bottom-6 duration-500 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <Package className="text-emerald-400 w-5 h-5" /> Spécifications Commande
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-3 py-1.5 rounded-full animate-pulse uppercase tracking-widest">
                  Sur Commande
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantité</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:border-emerald-500 outline-none" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget / Unité (DH)</label>
                  <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input 
                      type="text" 
                      placeholder="Ex: 50.00"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:border-emerald-500 outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4">
                 <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                 <p className="text-[10px] text-slate-300 font-medium leading-relaxed italic">
                   Note : Le gestionnaire de {user?.ville || 'votre zone'} validera la faisabilité technique.
                 </p>
              </div>

              <button 
                onClick={handleOrderRequest}
                disabled={isOrdering}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isOrdering ? <Loader2 className="animate-spin w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {isOrdering ? 'ENVOI EN COURS...' : 'ENVOYER MA DEMANDE DE COMMANDE'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Logo iconOnly className="scale-75" />
               <span className="font-black text-slate-800 tracking-tighter text-sm uppercase">Aperçu <span className="text-emerald-500 italic">OliPack</span></span>
            </div>
            {(imageResult || textResult) && (
              <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-emerald-600 border border-slate-100">
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/30 relative">
            {loading ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center">
                   <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">IA en cours de création...</p>
              </div>
            ) : activeTab === 'visual' ? (
              imageResult ? (
                <div className="relative group animate-in zoom-in-95 duration-500">
                  <img src={imageResult} alt="Prototype" className="max-w-full max-h-[400px] rounded-3xl shadow-2xl border-8 border-white" />
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[9px] font-black px-4 py-2 rounded-full shadow-lg border border-white/20">
                     CONCEPTION SUR MESURE
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-20">
                  <ImageIcon className="w-20 h-20 mx-auto text-slate-400" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Le visuel 3D apparaîtra ici</p>
                </div>
              )
            ) : (
              textResult ? (
                <div className="w-full max-h-[400px] overflow-y-auto bg-white p-10 rounded-3xl border border-slate-200 shadow-inner">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-50">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     <span className="text-[9px] font-black text-slate-400 uppercase">Argumentaire certifié OliPack</span>
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-sm">
                    {textResult}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-20">
                  <Type className="w-20 h-20 mx-auto text-slate-400" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Le contenu marketing apparaîtra ici</p>
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
