
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Truck, 
  FlaskConical,
  BarChart3,
  History
} from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string, timestamp: string}[]>([
    { 
      role: 'assistant', 
      content: "Bonjour Zakaria. Je suis votre copilote OliPack. Je supervise actuellement les flux de données de Beni Mellal et Meknès. Comment puis-je vous assister dans vos opérations aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    { label: "Optimiser les tournées", icon: Truck, prompt: "Peux-tu optimiser les tournées de collecte pour la zone de Beni Mellal aujourd'hui ?" },
    { label: "Analyse Qualité", icon: FlaskConical, prompt: "Fais une analyse de la stabilité du pH sur les 7 derniers jours." },
    { label: "Rapport d'Impact", icon: BarChart3, prompt: "Génère un résumé de notre impact écologique pour le mois dernier." }
  ];

  const sendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;
    
    const userMsg = textToSend;
    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Vous êtes l'assistant IA d'OliPack, une startup GreenTech marocaine de pointe. 
          Fondateur : Zakaria Bayad. 
          Expertise : Logistique des margines, IoT, Valorisation chimique (PHA) et énergétique (Pellets). 
          CONSIGNES DE RÉPONSE :
          1. Soyez extrêmement organisé. Utilisez des listes à puces ou des étapes numérotées.
          2. Adoptez un ton professionnel, encourageant et tourné vers l'efficacité industrielle.
          3. Pour les calculs, montrez brièvement la logique.
          4. Terminez toujours par une suggestion d'action ("Souhaitez-vous que je planifie cette collecte ?").`
        }
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text || "Désolé, j'ai rencontré une erreur d'analyse.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Erreur de connexion aux serveurs OliPack Cloud. Veuillez vérifier votre clé API.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] animate-in fade-in duration-700 max-w-5xl mx-auto">
      {/* CHAT HEADER */}
      <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
             <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">OliPack AI Assistant</h1>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connecté au Cloud OliPack</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-3">
           <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase">Latence: 24ms</span>
           </div>
           <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <History className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-3xl border border-slate-200 p-6 space-y-8 mb-6 shadow-inner custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-white border border-slate-200' : 'bg-emerald-600 text-white'}`}>
                {m.role === 'user' ? <User className="w-5 h-5 text-slate-500" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white font-medium' 
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
                <p className={`text-[9px] font-bold text-slate-400 px-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
               <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
               <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
               </span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analyse des flux en cours...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA & QUICK ACTIONS */}
      <div className="space-y-4">
        {/* QUICK ACTIONS */}
        {!loading && messages.length < 5 && (
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => sendMessage(qp.prompt)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
              >
                <qp.icon className="w-3.5 h-3.5" />
                {qp.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 bg-white p-2 rounded-3xl border border-slate-200 shadow-xl focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
          <div className="flex-1 flex items-center px-4">
            <MessageSquare className="w-5 h-5 text-slate-300 mr-3" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Posez une question technique ou logistique..."
              className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-slate-300 font-medium"
            />
          </div>
          <button 
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center min-w-[56px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 py-2">
           <ShieldCheck className="w-3 h-3 text-slate-300" />
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Les réponses sont basées sur vos capteurs IoT OliPack Connect</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
