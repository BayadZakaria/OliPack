
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Palette, Wand2, ImageIcon, Type, Download, Loader2, Sparkles, ShieldCheck, ShoppingCart, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import { UserProfile } from '../types';

interface OliPackStudioProps {
  user: UserProfile | null;
  onRequireAuth: () => void;
}

const OliPackStudio: React.FC<OliPackStudioProps> = ({ user, onRequireAuth }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'content'>('visual');
  const [loading, setLoading] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const generatePrototype = async () => {
    if (loading || !prompt) return;
    setLoading(true);
    setImageResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [{ 
            text: `High-end industrial 3D product visualization of: ${prompt}. 
            Material: Luxury biodegradable PHA bioplastic, smooth matte finish. 
            Color palette: Deep emerald green, marble white, olive oil gold accents. 
            Branding: Embossed "OliPack" logo in a minimalist serif font. 
            Lighting: Professional studio soft-box lighting, neutral background, 8k resolution, cinematic composition.` 
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
      alert("La génération visuelle a échoué. Vérifiez vos crédits API.");
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (loading || !prompt) return;
    setLoading(true);
    setTextResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rédige un argumentaire marketing de luxe pour un produit OliPack : ${prompt}. 
        Ton : Innovant, écologique, premium, ancré dans le terroir marocain. 
        Inclus impérativement :
        - Une accroche forte évoquant "L'Or Vert".
        - 3 bénéfices clés du bioplastique PHA (biodégradable, circulaire, durable).
        - Un appel à l'action invitant à rejoindre la révolution OliPack.
        Langue : Français soutenu. Structure avec des titres courts.`,
      });
      setTextResult(response.text || "Désolé, l'IA n'a pas pu générer le contenu.");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération marketing.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    alert(`Votre ${activeTab === 'visual' ? 'concept design' : 'campagne'} a été enregistrée dans vos projets favoris.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <Logo variant="dark" />
          <h1 className="text-3xl font-black text-slate-900 ml-1 tracking-tight">OliPack Studio AI</h1>
          <p className="text-slate-500 ml-1 font-medium">Concevez le futur du packaging avec l'IA Gemini.</p>
        </div>
        
        <div className="flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
          <button 
            onClick={() => { setActiveTab('visual'); setImageResult(null); setTextResult(null); }} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Design Produit
          </button>
          <button 
            onClick={() => { setActiveTab('content'); setImageResult(null); setTextResult(null); }} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Marketing AI
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-black uppercase tracking-tight">Atelier de Créativité</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Décrivez votre vision</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'visual' ? "Ex: Un pot cosmétique organique, texture mate émeraude, bouchon en bois d'olivier..." : "Ex: Présentation de notre collection de vases biodégradables pour les hôtels de luxe..."}
                className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none shadow-inner transition-all"
              />
            </div>

            <button
              onClick={activeTab === 'visual' ? generatePrototype : generateContent}
              disabled={loading || !prompt}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 shadow-xl shadow-emerald-100"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
              {loading ? 'CRÉATION EN COURS...' : 'GÉNÉRER AVEC GEMINI AI'}
            </button>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
             <div className="p-2 bg-emerald-100 rounded-xl"><ShieldCheck className="w-5 h-5 text-emerald-700" /></div>
             <p className="text-[10px] text-emerald-800 font-black leading-relaxed uppercase">
                OliPack Studio utilise les derniers modèles Gemini pour transformer vos idées en concepts industriels viables.
             </p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Logo iconOnly className="scale-75" />
               <span className="font-black text-slate-800 tracking-tighter text-sm uppercase">Studio <span className="text-emerald-500 italic font-serif">Pro</span></span>
            </div>
            { (imageResult || textResult) && (
              <div className="flex gap-2">
                <button 
                  onClick={handleAddToCart}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Enregistrer
                </button>
                <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-emerald-600 transition-colors border border-slate-100 shadow-sm">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/30 relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in">
                 <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-xl">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
                 </div>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">L'IA de Zakaria imagine votre produit...</p>
              </div>
            )}

            {activeTab === 'visual' ? (
              imageResult ? (
                <div className="relative group animate-in zoom-in-95 duration-500">
                  <img src={imageResult} alt="Prototype OliPack" className="max-w-full max-h-[400px] rounded-3xl shadow-2xl border-8 border-white" />
                  <div className="absolute bottom-4 right-4 bg-emerald-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 pointer-events-none flex items-center gap-2">
                     <Sparkles className="w-3 h-3 text-emerald-400" />
                     <p className="text-[8px] font-black text-white uppercase tracking-widest">IA : Design Validé OliPack</p>
                  </div>
                </div>
              ) : !loading && (
                <div className="text-center space-y-4 opacity-20 group">
                  <ImageIcon className="w-20 h-20 mx-auto text-slate-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Le prototype 3D apparaîtra ici</p>
                </div>
              )
            ) : (
              textResult ? (
                <div className="w-full max-h-[400px] overflow-y-auto bg-white p-10 rounded-3xl border border-slate-200 shadow-inner animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-50">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contenu validé par OliPack AI</span>
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-sm prose prose-emerald prose-sm">
                    {textResult}
                  </div>
                </div>
              ) : !loading && (
                <div className="text-center space-y-4 opacity-20 group">
                  <Type className="w-20 h-20 mx-auto text-slate-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">La rédaction marketing apparaîtra ici</p>
                </div>
              )
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-6">
             <div className="flex items-center gap-2 opacity-40">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] font-black uppercase tracking-tighter">Eco-Conception</span>
             </div>
             <div className="flex items-center gap-2 opacity-40">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] font-black uppercase tracking-tighter">Matière PHA</span>
             </div>
             <div className="flex items-center gap-2 opacity-40">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] font-black uppercase tracking-tighter">Powered by Gemini</span>
             </div>
          </div>
        </div>
      </div>
      
      {!user && (
        <div className="bg-emerald-900 text-white p-10 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-800">
           <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-black italic tracking-tight">Ce concept vous inspire ?</h3>
              <p className="text-emerald-200 text-sm font-medium opacity-80 uppercase tracking-wide">Créez votre accès partenaire pour transformer ce virtuel en réel.</p>
           </div>
           <button onClick={onRequireAuth} className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-emerald-400 transition-all active:scale-95">
             S'INSCRIRE MAINTENANT <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
};

export default OliPackStudio;
