
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Star, Info, Zap, Recycle, Globe, ArrowRight, Layers, Leaf, 
  ShoppingCart, CheckCircle2, Search, Plus, Minus, X, Trash2, CreditCard, 
  Truck, PackageCheck, MessageSquare, Send, User, MessageCircle, Wifi, QrCode, Smartphone,
  Loader2,
  Clock,
  AlertCircle,
  ClipboardList,
  ChevronRight,
  Package,
  Palette
} from 'lucide-react';
import { UserProfile, CartItem, ProductReview } from '../types';
import { db } from '../services/db';

interface Order {
  id: string;
  items?: CartItem[];
  product?: string;
  total?: string;
  price?: string;
  quantity: number;
  date: string;
  status: 'EN_ATTENTE' | 'VALIDÉE' | 'PRODUCTION' | 'EXPÉDIÉE';
  type: 'BOUTIQUE' | 'STUDIO';
  user: string;
  ville: string;
}

interface ProductsProps {
  user: UserProfile | null;
  onRequireAuth: () => void;
}

const Products: React.FC<ProductsProps> = ({ user, onRequireAuth }) => {
  const [activeView, setActiveView] = useState<'shop' | 'orders'>('shop');
  const [filter, setFilter] = useState('Tous');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  
  const [quantities, setQuantities] = useState<Record<number, number>>({
    1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1
  });

  const products = [
    { id: 1, name: "Bio-Charbon Premium", category: "Énergie", price: "1.60", unit: "DH/kg", desc: "Combustible haute performance issu de la pyrolyse contrôlée des grignons d'olives.", img: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=400&auto=format&fit=crop", eco: 98, stock: "Beni Mellal" },
    { id: 2, name: "Pellets OliPack Eco", category: "Chauffage", price: "1.20", unit: "DH/kg", desc: "Granulés écologiques haute densité pour chaudières industrielles.", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop", eco: 95, stock: "Meknès" },
    { id: 5, name: "Vase Intelligent 'Flora'", category: "Objets Connectés", price: "249.00", unit: "DH/unité", desc: "Vase en PHA bioplastique avec puce NFC intégrée et QR Code.", img: "https://images.unsplash.com/photo-1572297821074-3fd50b09bfc6?q=80&w=400&auto=format&fit=crop", eco: 100, isSmart: true, tech: ["NFC Inside", "QR Tracking"] },
    { id: 6, name: "Pochette Bio-NFC", category: "Objets Connectés", price: "120.00", unit: "DH/unité", desc: "Pochette protectrice en matière souple OliPack. Échangez vos réseaux sociaux par contact.", img: "https://images.unsplash.com/photo-1603539947678-cd3954ed515d?q=80&w=400&auto=format&fit=crop", eco: 100, isSmart: true, tech: ["Social NFC"] },
    { id: 3, name: "Biopolymère PHA", category: "Innovation", price: "0.00", unit: "Sur Devis", desc: "Plastique 100% biodégradable produit par biosynthèse.", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop", eco: 100, stock: "Laboratoire R&D" },
    { id: 4, name: "Engrais Bio-Organique", category: "Agriculture", price: "0.80", unit: "DH/kg", desc: "Fertilisant riche en potassium et matières organiques.", img: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=400&auto=format&fit=crop", eco: 100, stock: "Marrakech" }
  ];

  useEffect(() => {
    const loadData = async () => {
      const data = await db.getReviews();
      setReviews(data);
      
      const shopOrders = JSON.parse(localStorage.getItem('olipack_shop_orders') || '[]');
      const studioOrders = JSON.parse(localStorage.getItem('olipack_orders') || '[]');
      
      // Filtrer pour l'acheteur : seulement SES commandes
      const allOrders = [...shopOrders, ...studioOrders].filter(o => o.user === user?.email).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setMyOrders(allOrders);
    };
    loadData();
  }, [activeView, orderSuccess, user]);

  const addToCart = (product: any) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    const qty = quantities[product.id] || 1;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: qty, img: product.img, category: product.category }];
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0), [cart]);

  const handleFinalOrder = () => {
    if (!user) return;
    setIsProcessing(true);
    setTimeout(() => {
      const newOrder: Order = {
        id: 'SHOP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        items: [...cart],
        total: cartTotal.toFixed(2),
        quantity: cart.reduce((a, b) => a + b.quantity, 0),
        date: new Date().toISOString(),
        status: 'EN_ATTENTE',
        type: 'BOUTIQUE',
        user: user.email,
        ville: user.ville
      };

      const existingShopOrders = JSON.parse(localStorage.getItem('olipack_shop_orders') || '[]');
      existingShopOrders.push(newOrder);
      localStorage.setItem('olipack_shop_orders', JSON.stringify(existingShopOrders));

      setOrderSuccess(true);
      setIsProcessing(false);
      setTimeout(() => {
        setCart([]);
        setShowCart(false);
        setOrderSuccess(false);
        setActiveView('orders');
      }, 2000);
    }, 1500);
  };

  const filteredProducts = filter === 'Tous' ? products : products.filter(p => p.category === filter);

  return (
    <div className="space-y-8 animate-in pb-24 max-w-6xl mx-auto relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <ShoppingBag className="text-emerald-600 w-10 h-10" /> 
            {activeView === 'shop' ? 'Boutique' : 'Mes Commandes'} <span className="text-emerald-600 italic">OliPack</span>
          </h1>
          <p className="text-slate-500 font-medium">Gestion durable de vos achats en Or Vert.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveView(activeView === 'shop' ? 'orders' : 'shop')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${activeView === 'orders' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            {activeView === 'shop' ? <ClipboardList className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            {activeView === 'shop' ? 'SUIVRE MES COMMANDES' : 'RETOURNER À LA BOUTIQUE'}
          </button>

          <button onClick={() => setShowCart(true)} className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-lg relative hover:bg-emerald-700 transition-all active:scale-95">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </div>
      </header>

      {activeView === 'shop' ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['Tous', 'Objets Connectés', 'Innovation', 'Énergie', 'Agriculture'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)} 
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${filter === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(p => {
              const productReviews = reviews.filter(r => r.productId === p.id);
              const avgRating = productReviews.length > 0 ? (productReviews.reduce((a, b) => a + b.rating, 0) / productReviews.length).toFixed(1) : "0";

              return (
                <div key={p.id} className={`bg-white rounded-[2.5rem] border overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full ${p.category === 'Objets Connectés' ? 'border-emerald-200' : 'border-slate-100'}`}>
                  <div className="h-56 bg-slate-200 relative overflow-hidden">
                     <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                     {p.isSmart && (
                        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 uppercase tracking-widest animate-pulse">
                          <Wifi className="w-3 h-3" /> NFC Active
                        </div>
                     )}
                     <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl flex items-center gap-2">
                       <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {avgRating}
                     </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1 space-y-4">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{p.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{p.desc}</p>
                     </div>

                     <div className="pt-4 mt-auto border-t border-slate-50 flex items-center justify-between">
                       <span className="text-xl font-black text-slate-900">{p.price} <span className="text-[10px] text-slate-400 font-bold">{p.unit}</span></span>
                       <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-3">
                          <button onClick={() => setQuantities(q => ({...q, [p.id]: Math.max(1, (q[p.id]||1)-1)}))} className="p-1 text-slate-400"><Minus className="w-4 h-4" /></button>
                          <span className="text-sm font-black text-slate-700 min-w-[20px] text-center">{quantities[p.id] || 1}</span>
                          <button onClick={() => setQuantities(q => ({...q, [p.id]: (q[p.id]||1)+1}))} className="p-1 text-slate-400"><Plus className="w-4 h-4" /></button>
                       </div>
                     </div>

                     <button onClick={() => addToCart(p)} className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3">
                       <ShoppingCart className="w-4 h-4" /> AJOUTER AU PANIER
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-6">
          {myOrders.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100 space-y-4">
               <Package className="w-20 h-20 text-slate-100 mx-auto" />
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aucune commande en cours</p>
               <button onClick={() => setActiveView('shop')} className="text-emerald-600 font-black text-[10px] uppercase underline">Parcourir la boutique</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-emerald-200 transition-all">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-emerald-600 shrink-0">
                    {order.type === 'STUDIO' ? <Palette className="w-8 h-8" /> : <Package className="w-8 h-8" />}
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                           <h3 className="text-xl font-black text-slate-900 tracking-tight">#{order.id}</h3>
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.type === 'STUDIO' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {order.type}
                           </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                           Commandé le {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-slate-900">{order.total || (parseFloat(order.price || '0') * order.quantity).toFixed(2)} DH</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.quantity} articles</span>
                      </div>
                    </div>

                    <div className="relative pt-6 pb-2">
                       <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">
                         <span className={order.status === 'EN_ATTENTE' ? 'text-emerald-600' : ''}>En attente</span>
                         <span className={order.status === 'VALIDÉE' ? 'text-emerald-600' : ''}>Validée</span>
                         <span className={order.status === 'PRODUCTION' ? 'text-emerald-600' : ''}>Production</span>
                         <span className={order.status === 'EXPÉDIÉE' ? 'text-emerald-600' : ''}>Expédiée</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                          className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                          style={{ width: order.status === 'EN_ATTENTE' ? '25%' : order.status === 'VALIDÉE' ? '50%' : order.status === 'PRODUCTION' ? '75%' : '100%' }}
                         ></div>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-[9px] font-medium text-slate-500 italic">
                       <Clock className="w-3 h-3 text-emerald-500" />
                       Gestionnaire Zone : {order.ville}
                    </div>
                  </div>
                  
                  <button className="p-4 bg-slate-50 text-slate-300 rounded-2xl hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
           <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-500">
              <header className="p-8 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><ShoppingCart className="w-6 h-6" /></div>
                    <div><h2 className="text-xl font-black text-slate-900 tracking-tight">Ma Demande</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cart.length} produit(s)</p></div>
                 </div>
                 <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                 {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40"><ShoppingBag className="w-20 h-20 text-slate-300" /><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Votre panier est vide</p></div>
                 ) : (
                    <>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                         <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                         <p className="text-[10px] text-emerald-800 font-medium leading-relaxed italic">
                           Note : Votre commande sera traitée par le gestionnaire de {user?.ville}.
                         </p>
                      </div>
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 group">
                              <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start"><h4 className="text-sm font-black text-slate-800 truncate">{item.name}</h4><button onClick={() => setCart(c => c.filter(it => it.id !== item.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
                                <div className="mt-3 flex justify-between items-center"><div className="text-xs font-black text-slate-900">{item.quantity} x {item.price} DH</div><div className="text-sm font-black text-emerald-600">{(parseFloat(item.price) * item.quantity).toFixed(2)} DH</div></div>
                              </div>
                          </div>
                        ))}
                      </div>
                    </>
                 )}
              </div>
              {cart.length > 0 && (
                <footer className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                   <div className="flex justify-between items-end"><span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Budget Estimé</span><span className="text-3xl font-black text-emerald-600 tracking-tighter">{cartTotal.toFixed(2)} DH</span></div>
                   <button 
                    onClick={handleFinalOrder} 
                    disabled={isProcessing || orderSuccess}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70"
                   >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : (orderSuccess ? <PackageCheck className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />)} 
                      {orderSuccess ? 'DEMANDE ENVOYÉE !' : 'ENVOYER MA DEMANDE DE COMMANDE'}
                   </button>
                </footer>
              )}
           </aside>
        </div>
      )}
    </div>
  );
};

export default Products;
