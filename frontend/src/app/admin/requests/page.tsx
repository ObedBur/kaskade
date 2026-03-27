"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminGuard } from "@/lib/use-admin-guard";
import api from "@/lib/api";

type RequestItem = {
  id: string;
  client: string;
  service: string;
  amount: string;
  status: string;
  date: string;
};

export default function AdminRequestsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [dataLoading, setDataLoading] = useState(true);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchRequests = async () => {
      try {
        const res = await api.get('/admin/requests');
        setRequests(res.data.requests || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les demandes. L'API Backend est-elle prête ?");
      } finally {
        setDataLoading(false);
      }
    };

    fetchRequests();
  }, [isAuthenticated]);

  const filteredRequests = requests.filter(req => 
    req.client.toLowerCase().includes(search.toLowerCase()) || 
    req.service.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || (isAuthenticated && dataLoading)) {
    return <div className="p-12 flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" /></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-16 gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Demandes de Service</h1>
          <p className="text-slate-400 text-sm font-medium">Flux réel récupéré via l'API NestJS.</p>
        </div>
        
        <div className="flex-1 max-w-lg group relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Chercher une demande ou un client..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-full py-5 px-14 text-sm focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/5 transition-all"
          />
        </div>
      </header>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-8 rounded-3xl text-center font-bold">
          {error}
        </div>
      ) : (
      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
         <div className="flex justify-between items-center mb-12">
            <h3 className="text-2xl font-black">Historique des Flux</h3>
            <button className="flex items-center gap-2 text-xs font-bold text-[#FF6B00] hover:bg-[#FF6B00]/5 px-6 py-3 rounded-2xl transition-all">
              <Filter className="w-4 h-4" /> Filtres Avancés
            </button>
         </div>

         {filteredRequests.length > 0 ? (
           <div className="space-y-4">
              {filteredRequests.map((req, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-6 rounded-3xl border border-slate-50 hover:border-[#BC9C6C]/30 hover:bg-slate-50/50 transition-all cursor-pointer group"
                >
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#321B13]/5 flex items-center justify-center text-[#321B13] font-bold text-xs truncate">
                        {req.id.slice(-4)}
                      </div>
                      <div>
                         <h5 className="font-bold text-sm tracking-tight">{req.service} <span className="text-slate-200 mx-2">•</span> {req.client}</h5>
                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{req.id.slice(0, 8)}... — {req.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <p className="font-black text-sm">{req.amount}</p>
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border ${
                        req.status === 'TERMINÉ' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        req.status === 'VÉRIFIÉ' ? 'bg-[#FF6B00]/5 text-[#FF6B00] border-[#FF6B00]/10' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                         {req.status}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-200 group-hover:text-[#FF6B00] transition-colors" />
                   </div>
                </motion.div>
              ))}
           </div>
         ) : (
           <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">
              Aucune demande trouvée
           </div>
         )}
      </div>
      )}
    </div>
  );
}
