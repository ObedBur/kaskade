"use client";

import React, { useEffect, useState } from "react";
import { Search, MapPin, TrendingUp, Users, Target, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminGuard } from "@/lib/use-admin-guard";
import api from "@/lib/api";

type CityData = { city: string; percentage: number; color: string; };

export default function AdminAnalyticsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [dataLoading, setDataLoading] = useState(true);
  const [cities, setCities] = useState<CityData[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setCities(res.data.cities || []);
        setMetrics(res.data.metrics || { growth: "0%", conversion: "0%", topCity: "Aucune" });
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les analyses du marché via l'API.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated]);

  if (authLoading || (isAuthenticated && dataLoading)) {
    return <div className="p-12 flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" /></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-16 gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Analyse du Marché</h1>
          <p className="text-slate-400 text-sm font-medium">Vue d'ensemble de l'activité depuis l'API.</p>
        </div>
        
        <div className="flex-1 max-w-lg group relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher une métrique ou une ville..." 
            className="w-full bg-white border border-slate-100 rounded-full py-5 px-14 text-sm focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/5 transition-all"
          />
        </div>
      </header>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-8 rounded-3xl text-center font-bold">
          {error}
        </div>
      ) : (
      <section className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "CROISSANCE MENSUELLE", value: metrics.growth, color: "#FF6B00", icon: TrendingUp },
             { title: "TAUX DE CONVERSION", value: metrics.conversion, color: "#321B13", icon: Target },
             { title: "ZONE ACTIVE", value: metrics.topCity, color: "#BC9C6C", icon: MapPin },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-start mb-12">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <stat.icon className="w-4 h-4" />
                   </div>
                </div>
                <h4 className="text-3xl font-black tracking-tighter mb-4">{stat.value}</h4>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF6B00]">{stat.title}</span>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl relative overflow-hidden">
              <h3 className="text-2xl font-black mb-1">Volume par Ville</h3>
              <p className="text-slate-400 text-sm font-medium mb-12">Répartition géographique de l'activité</p>
              
              {cities.length > 0 ? (
                <div className="space-y-6">
                 {cities.map((city, i) => (
                   <div key={i}>
                     <div className="flex justify-between text-xs font-bold mb-3">
                       <span className="text-[#321B13]">{city.city}</span>
                       <span>{city.percentage}%</span>
                     </div>
                     <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${city.percentage}%` }}
                         transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                         className="h-full rounded-full"
                         style={{ backgroundColor: city.color }}
                       />
                     </div>
                   </div>
                 ))}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest textxs">
                   Aucune donnée disponible
                </div>
              )}
           </div>

           <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-1">Démographie Prestataires</h3>
                <p className="text-slate-400 text-sm font-medium">Expertise et spécialisations locales</p>
              </div>

              <div className="relative w-full h-64 mt-12 flex items-center justify-center">
                 <div className="absolute inset-0 border-[40px] border-slate-50 rounded-full" />
                 <div className="absolute inset-4 border-[20px] border-slate-50/50 rounded-full border-t-[#FF6B00]/20 border-r-[#FF6B00]/20 rotate-45" />
                 <div className="w-24 h-24 bg-[#321B13] rounded-full flex items-center justify-center shadow-2xl z-10">
                   <span className="text-white font-bold text-xs">Vidé</span>
                 </div>
              </div>
           </div>
        </div>
      </section>
      )}
    </div>
  );
}
