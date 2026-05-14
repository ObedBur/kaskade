"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Play, 
  Loader2, 
  MapPin, 
  User, 
  Calendar,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type RequestStatus = 'ACCEPTED' | 'IN_PROGRESS' | 'AWAITING_FINAL' | 'COMPLETED';

interface Mission {
  id: string;
  status: RequestStatus;
  price: number | null;
  scheduledAt: string;
  createdAt: string;
  address: string;
  description: string;
  service: {
    name: string;
    category: string;
  };
  client: {
    fullName: string;
    phone: string;
    quartier: string;
  };
}

const statusConfig: Record<string, { label: string, color: string, bg: string, icon: any }> = {
  ACCEPTED: { label: 'Acceptée', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
  IN_PROGRESS: { label: 'En cours', color: 'text-amber-600', bg: 'bg-amber-50', icon: Play },
  AWAITING_FINAL: { label: 'À clôturer', color: 'text-purple-600', bg: 'bg-purple-50', icon: CheckCircle2 },
  COMPLETED: { label: 'Terminée', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
};

export default function MesMissionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const fetchMissions = async () => {
    try {
      const res = await api.get("/provider/my-missions");
      setMissions(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement de vos missions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchMissions();
    }
  }, [user, authLoading]);

  const filteredMissions = missions.filter(m => {
    const matchesSearch = m.service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.client.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "ALL" || m.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (authLoading || loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      
      {/* HEADER */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h2 className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-4">Gestion des Engagements</h2>
          <h1 className="text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
            Mes <span className="text-[#BC9C6C]">Missions.</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/30" />
            <input 
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#321B13]/10 rounded-none py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#BC9C6C] transition-colors"
            />
          </div>
          <button className="bg-[#321B13] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#BC9C6C] transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filtrer
          </button>
        </div>
      </section>

      {/* FILTRES TABS */}
      <div className="flex border-b border-[#321B13]/10 overflow-x-auto no-scrollbar">
        {["ALL", "ACCEPTED", "IN_PROGRESS", "AWAITING_FINAL", "COMPLETED"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative ${
              activeFilter === filter ? 'text-[#321B13]' : 'text-[#321B13]/40 hover:text-[#321B13]/60'
            }`}
          >
            {filter === "ALL" ? "Toutes" : statusConfig[filter]?.label || filter}
            {activeFilter === filter && (
              <motion.div layoutId="activeTabMissions" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BC9C6C]" />
            )}
          </button>
        ))}
      </div>

      {/* LISTE DES MISSIONS */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMissions.length > 0 ? (
            filteredMissions.map((mission, i) => {
              const config = statusConfig[mission.status] || { label: mission.status, color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock };
              const StatusIcon = config.icon;
              
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-[#321B13]/5 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-[#BC9C6C]/30 hover:shadow-xl hover:shadow-[#321B13]/5 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#BC9C6C] scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>

                  {/* Info Service */}
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`${config.bg} ${config.color} px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-2`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </div>
                      <span className="text-[#321B13]/30 text-[9px] font-bold uppercase tracking-widest">REF: {mission.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-[#321B13] tracking-tighter uppercase mb-4 group-hover:text-[#BC9C6C] transition-colors">
                      {mission.service.name}
                    </h3>

                    <div className="flex flex-wrap gap-6">
                       <div className="flex items-center gap-2 text-[#321B13]/60 text-[10px] font-bold uppercase tracking-wider">
                         <MapPin className="w-3.5 h-3.5 text-[#BC9C6C]" />
                         {mission.client.quartier} • {mission.address}
                       </div>
                       <div className="flex items-center gap-2 text-[#321B13]/60 text-[10px] font-bold uppercase tracking-wider">
                         <Calendar className="w-3.5 h-3.5 text-[#BC9C6C]" />
                         {new Date(mission.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                       </div>
                    </div>
                  </div>

                  {/* Info Client & Budget */}
                  <div className="flex flex-col md:flex-row items-center gap-12 w-full lg:w-auto">
                    <div className="flex items-center gap-4 border-l border-[#321B13]/5 pl-8 hidden md:flex">
                      <div className="w-12 h-12 bg-[#321B13]/5 flex items-center justify-center rounded-full">
                        <User className="w-5 h-5 text-[#321B13]/40" />
                      </div>
                      <div>
                        <p className="text-[9px] text-[#321B13]/40 font-black uppercase tracking-widest mb-0.5">Client</p>
                        <p className="text-xs font-bold text-[#321B13]">{mission.client.fullName}</p>
                      </div>
                    </div>

                    <div className="text-center md:text-right min-w-[120px]">
                      <p className="text-[9px] text-[#321B13]/40 font-black uppercase tracking-widest mb-1">Montant</p>
                      <p className="text-2xl font-black text-[#321B13]">{mission.price?.toLocaleString() || '—'} $</p>
                    </div>

                    <button 
                      onClick={() => router.push(`/dashboard/mes-missions/${mission.id}`)}
                      className="bg-[#FCFBF7] border border-[#321B13]/10 text-[#321B13] p-4 group-hover:bg-[#321B13] group-hover:text-white group-hover:border-[#321B13] transition-all"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-32 text-center bg-[#FCFBF7] border border-dashed border-[#321B13]/10">
              <Clock className="w-12 h-12 text-[#321B13]/5 mx-auto mb-6" />
              <h4 className="text-sm font-black text-[#321B13]/40 uppercase tracking-[0.2em] mb-2">
                Aucune mission dans cette catégorie
              </h4>
              <p className="text-xs text-[#321B13]/30 max-w-xs mx-auto">
                Consultez les missions disponibles pour commencer à travailler.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
