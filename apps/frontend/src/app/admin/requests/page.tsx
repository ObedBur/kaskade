"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, ExternalLink, Loader2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
  
  const handleStatusChange = async (requestId: string, nextStatus: string) => {
    try {
      await api.patch(`/requests/${requestId}/status`, { status: nextStatus });
      
      // Mettre à jour l'état local pour un retour immédiat
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: nextStatus === 'APPROVED' ? 'VÉRIFIÉ' : 'REJETÉ' } 
          : req
      ));
      
      const isApproved = nextStatus === 'APPROVED';
      toast.success(isApproved ? "Demande approuvée avec succès ! ✅" : "Demande rejetée.");
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors du changement de statut.");
    }
  };

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
                   <div className="flex items-center gap-4">
                      <p className="font-black text-sm mr-2">{req.amount}</p>
                      
                      {req.status === 'EN ATTENTE' ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(req.id, 'APPROVED'); }}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn"
                            title="Approuver la demande"
                          >



                            
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(req.id, 'REJECTED'); }}
                            className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm group/btn"
                            title="Rejeter la demande"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border ${
                          req.status === 'TERMINÉ' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                          req.status === 'REJETÉ' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {req.status}
                        </span>
                      )}
                      
                      <ExternalLink className="w-4 h-4 text-slate-200 group-hover:text-emerald-500 transition-colors ml-2" />
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
