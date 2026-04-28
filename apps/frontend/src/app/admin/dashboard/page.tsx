"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, Plus, Loader2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAdminGuard } from "@/lib/use-admin-guard";
import api from "@/lib/api";

type StatItem = { label: string; value: string; trend: string; color: string; isNegative?: boolean; };
type ActivityItem = { id: string; name: string; email: string; type: string; status: string; amount: string; };
type CategoryItem = { label: string; value: string; color: string; };

export default function AdminDashboardPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [dataLoading, setDataLoading] = useState(true);
  
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.stats || []);
        setActivities(res.data.activities || []);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données du tableau de bord. Vérifiez que le backend est en ligne.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated]);

  const handleStatusChange = async (requestId: string, nextStatus: string) => {
    try {
      await api.patch(`/requests/${requestId}/status`, { status: nextStatus });
      
      // Mettre à jour l'état local
      setActivities(prev => prev.map(act => 
        act.id === requestId 
          ? { ...act, status: nextStatus === 'APPROVED' ? 'VÉRIFIÉ' : 'REJETÉ' } 
          : act
      ));
      
      toast.success(nextStatus === 'APPROVED' ? "Demande approuvée ! ✅" : "Demande rejetée.");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'action.");
    }
  };

  if (authLoading || (isAuthenticated && dataLoading)) {
    return <div className="p-12 flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" /></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="p-12">
      {/* Barre de Navigation Supérieure */}
      <header className="flex justify-between items-center mb-16 gap-8">
        <div className="flex-1 max-w-xl group relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#FF6B00] transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher des analyses, des héros ou des transactions..." 
            className="w-full bg-white border border-slate-100 rounded-full py-5 px-14 text-sm focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/5 hover:border-slate-200 transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-[#FF6B00] rounded-full border-2 border-white"></span>
          </button>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="flex items-center gap-4 bg-white border border-slate-100 pl-4 pr-2 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <span className="text-sm font-bold tracking-tight text-slate-600">Profil Administrateur</span>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#BC9C6C]">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-8 rounded-3xl text-center font-bold">
          {error}
        </div>
      ) : (
      <section className="space-y-12">
        {/* Cartes KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">{kpi.label}</span>
                <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${kpi.isNegative ? 'text-slate-400' : 'text-[#FF6B00]'}`}>
                 {kpi.isNegative ? '↘' : '↗'} {kpi.trend}
                </span>
              </div>
              <h3 className="text-3xl lg:text-5xl font-extrabold tracking-tighter mb-4">{kpi.value}</h3>
              
              {/* Simulation de Micro-Graphique */}
              <div className="flex gap-1 items-end h-12">
                {[40, 70, 30, 80, 50, 90, 60, 45].map((height, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-50 flex-1 rounded-sm group-hover:bg-[#FF6B00]/10 transition-colors"
                    style={{ height: `${height}%` }}
                  />
                ))}
                <div className="w-8 h-10 bg-[#FF6B00] rounded-sm shadow-lg shadow-[#FF6B00]/20"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone du Graphique */}
          <div className="lg:col-span-2 bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40">
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
              <div>
                <h4 className="text-2xl font-black tracking-tight mb-1">Volume des Services</h4>
                <p className="text-slate-400 text-sm font-medium">Métriques d'interaction réelles par catégorie</p>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
                <button className="px-5 py-2 text-xs font-bold text-[#FF6B00] bg-white rounded-xl shadow-sm transition-all">Hebdomadaire</button>
                <button className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">Mensuel</button>
              </div>
            </div>
            <div className="w-full h-80 relative overflow-hidden">
              <svg className="w-full h-full stroke-[#FF6B00] fill-[#FF6B00]/5 transition-all" viewBox="0 0 800 200">
                 <path d="M0,150 Q200,50 400,100 T800,50 L800,200 L0,200 Z" strokeWidth="4" fill="url(#gradient)" />
                 <defs>
                   <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.2" />
                     <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                   </linearGradient>
                 </defs>
                 <circle cx="480" cy="75" r="5" className="fill-white stroke-[#FF6B00] stroke-[3]" />
              </svg>
            </div>
            <div className="flex justify-between px-4 mt-6">
               {['LUN','MAR','MER','JEU','VEN','SAM','DIM'].map((day) => (
                 <span key={day} className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{day}</span>
               ))}
            </div>
          </div>

          {/* Carte de Répartition */}
          <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col items-center text-center relative overflow-hidden">
            <h4 className="text-2xl font-black tracking-tight mb-1 w-full text-left">Répartition par Catégorie</h4>
            <p className="text-slate-400 text-sm font-medium w-full text-left mb-12">Distribution en temps réel</p>
            
            {categories.length > 0 ? (
              <>
                <div className="relative w-56 h-56 mb-12">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="40" className="fill-transparent stroke-slate-50 stroke-[12]" />
                     <circle cx="50" cy="50" r="40" className="fill-transparent stroke-[#FF6B00] stroke-[12]" strokeDasharray="180 300" strokeLinecap="round" />
                     <circle cx="50" cy="50" r="40" className="fill-transparent stroke-[#BC9C6C] stroke-[12]" strokeDasharray="60 300" strokeDashoffset="-180" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black tracking-tighter leading-none">100%</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Parts de Marché</span>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  {categories.map((item, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full group-hover:scale-125 transition-all" style={{ backgroundColor: item.color || "#BC9C6C" }}></div>
                        <span className="text-xs font-bold text-slate-500">{item.label}</span>
                      </div>
                      <span className="text-xs font-black">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-10 text-slate-400 font-bold tracking-widest text-xs uppercase text-center">
                 Aucun service créé
              </div>
            )}
            
            <button className="absolute bottom-8 right-8 w-14 h-14 bg-[#FF6B00] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-[#FF6B00]/20 hover:scale-110 active:scale-95 transition-all">
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tableau d'Activité */}
        <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden overflow-x-auto">
           <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
             <div>
                <h4 className="text-3xl font-black tracking-tight mb-2">Activité Récente</h4>
                <p className="text-slate-400 text-sm font-medium">Flux réel des transactions globales</p>
             </div>
           </div>

           {activities.length > 0 ? (
           <table className="w-full min-w-[700px]">
             <thead className="border-b border-slate-100">
               <tr className="text-left">
                 <th className="pb-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Prestataire</th>
                 <th className="pb-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Type de Service</th>
                 <th className="pb-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Statut</th>
                 <th className="pb-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest text-right px-4">Montant</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {activities.map((row, i) => (
                 <tr key={i} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                   <td className="py-8 px-4 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-[10px] bg-slate-100 text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition-all">
                       {row.name !== "En attente" ? row.name.split(' ').map((n: string)=>n[0]).join('') : "?"}
                     </div>
                     <div>
                       <p className="font-bold text-sm">{row.name}</p>
                       <p className="text-[10px] text-slate-400 font-medium">{row.email}</p>
                     </div>
                   </td>
                   <td className="py-8">
                     <p className="text-xs font-bold text-slate-600">{row.type}</p>
                   </td>
                   <td className="py-8 text-center">
                    {row.status === 'EN ATTENTE' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'APPROVED'); }}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Approuver"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'REJECTED'); }}
                          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Rejeter"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border ${
                        row.status === 'VÉRIFIÉ' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        row.status === 'EN ATTENTE' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                        'bg-rose-50 text-rose-500 border-rose-100'
                      }`}>
                        {row.status}
                      </span>
                    )}
                  </td>
                   <td className="py-8 text-right px-4 text-sm font-black text-slate-700">
                     {row.amount}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
           ) : (
             <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">
                Aucune activité trouvée
             </div>
           )}
        </div>
      </section>
      )}
    </div>
  );
}
