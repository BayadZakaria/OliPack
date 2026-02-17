
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ArrowRight, 
  Search, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  Loader2,
  Filter,
  Palette
} from 'lucide-react';
import { UserProfile } from '../types';

interface Order {
  id: string;
  items?: any[];
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

interface SalesControlProps {
  user: UserProfile;
}

const SalesControl: React.FC<SalesControlProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = () => {
    setLoading(true);
    const studioOrders = JSON.parse(localStorage.getItem('olipack_orders') || '[]');
    const shopOrders = JSON.parse(localStorage.getItem('olipack_shop_orders') || '[]');
    
    // On filtre par la ville du vendeur (Sauf si Admin)
    const all = [...studioOrders, ...shopOrders].filter(o => 
      user.role === 'ADMIN' ? true : o.ville === user.ville
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setOrders(all);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const updateOrderStatus = (orderId: string, currentStatus: string) => {
    const statusCycle: Record<string, Order['status']> = {
      'EN_ATTENTE': 'VALIDÉE',
      'VALIDÉE': 'PRODUCTION',
      'PRODUCTION': 'EXPÉDIÉE'
    };

    const nextStatus = statusCycle[currentStatus];
    if (!nextStatus) return;

    // Mise à jour dans le localStorage approprié
    const shopOrders = JSON.parse(localStorage.getItem('olipack_shop_orders') || '[]');
    const studioOrders = JSON.parse(localStorage.getItem('olipack_orders') || '[]');

    const updateInList = (list: Order[]) => list.map(o => o.id === orderId ? { ...o, status: nextStatus } : o);

    localStorage.setItem('olipack_shop_orders', JSON.stringify(updateInList(shopOrders)));
    localStorage.setItem('olipack_orders', JSON.stringify(updateInList(studioOrders)));

    loadOrders();
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: filteredOrders.length,
    revenue: filteredOrders.reduce((acc, o) => acc + parseFloat(o.total || (parseFloat(o.price || '0') * o.quantity).toString()), 0),
    pending: filteredOrders.filter(o => o.status === 'EN_ATTENTE').length
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShoppingBag className="text-emerald-600 w-10 h-10" /> Gestion des Commandes
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">
               Zone : {user.ville}
            </span>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Interface Vendeur OliPack
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
           <div className="text-center px-4 border-r border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Demandes</p>
              <p className="text-lg font-black text-slate-900">{stats.total}</p>
           </div>
           <div className="text-center px-4 border-r border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">A Valider</p>
              <p className="text-lg font-black text-amber-500">{stats.pending}</p>
           </div>
           <div className="text-center px-4">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CA Zone</p>
              <p className="text-lg font-black text-emerald-600">{stats.revenue.toFixed(0)} DH</p>
           </div>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Rechercher une commande ou un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-emerald-600 animate-spin" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
             <Package className="w-20 h-20 text-slate-100 mx-auto mb-4" />
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aucune commande pour {user.ville}</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-emerald-600 shrink-0">
                    {order.type === 'STUDIO' ? <Palette className="w-8 h-8" /> : <ShoppingBag className="w-8 h-8" />}
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">#{order.id}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{order.type}</span>
                             <span className="text-[10px] font-bold text-slate-400">{order.user}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-black text-slate-900">{order.total || (parseFloat(order.price || '0') * order.quantity).toFixed(2)} DH</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                       <StatusBadge label="En attente" active={order.status === 'EN_ATTENTE'} done={['VALIDÉE', 'PRODUCTION', 'EXPÉDIÉE'].includes(order.status)} />
                       <StatusBadge label="Validée" active={order.status === 'VALIDÉE'} done={['PRODUCTION', 'EXPÉDIÉE'].includes(order.status)} />
                       <StatusBadge label="Production" active={order.status === 'PRODUCTION'} done={['EXPÉDIÉE'].includes(order.status)} />
                       <StatusBadge label="Expédiée" active={order.status === 'EXPÉDIÉE'} done={false} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50">
                       {order.status !== 'EXPÉDIÉE' ? (
                         <button 
                           onClick={() => updateOrderStatus(order.id, order.status)}
                           className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95"
                         >
                           {order.status === 'EN_ATTENTE' && <>VALIDER LA COMMANDE <CheckCircle2 className="w-4 h-4" /></>}
                           {order.status === 'VALIDÉE' && <>LANCER LA PRODUCTION <Package className="w-4 h-4" /></>}
                           {order.status === 'PRODUCTION' && <>MARQUER COMME EXPÉDIÉE <Truck className="w-4 h-4" /></>}
                         </button>
                       ) : (
                         <div className="flex-1 bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            LIVRAISON EN COURS <Truck className="w-4 h-4" />
                         </div>
                       )}
                       <button className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl hover:text-emerald-600 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
               </div>
               {/* Background decor */}
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <MapPin className="w-32 h-32 -rotate-12" />
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ label: string, active: boolean, done: boolean }> = ({ label, active, done }) => (
  <div className={`flex flex-col gap-1.5`}>
    <div className={`h-1.5 rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : active ? 'bg-amber-400 animate-pulse' : 'bg-slate-100'}`}></div>
    <span className={`text-[8px] font-black uppercase text-center truncate ${active ? 'text-amber-500' : done ? 'text-emerald-600' : 'text-slate-300'}`}>
      {label}
    </span>
  </div>
);

export default SalesControl;
