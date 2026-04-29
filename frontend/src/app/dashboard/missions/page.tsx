"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Clock, 
  Loader2, 
  MapPin, 
  Briefcase,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceCategory {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
}

interface AvailableMission {
  id: string;
  service: {
    id: string;
    name: string;
    category: string;
  };
  client: {
    fullName: string;
    quartier: string;
  };
  price: number | null;
  address: string;
  description: string;
  createdAt: string;
}

export default function AvailableMissionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [missions, setMissions] = useState<AvailableMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchAvailableMissions = async () => {
    try {
      const [categoriesRes, missionsRes] = await Promise.all([
        api.get("/services"),
        api.get("/provider/requests"),
      ]);
      setCategories(categoriesRes.data);
      setMissions(missionsRes.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAvailableMissions();
    }
  }, [user, authLoading]);

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      await api.patch(`/provider/requests/${id}/accept`);
      toast.success("Félicitations ! Mission acceptée.");
      fetchAvailableMissions(); // Refresh list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'acceptation.");
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredMissions = missions.filter(m => {
    const matchesSearch = m.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.client.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || m.service.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading || loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      
      {/* HEADER SECTION */}
      <section className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-[2px] bg-[#BC9C6C]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#321B13]/40">Opportunités de croissance</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-[#321B13] tracking-tighter uppercase leading-[0.9] mb-8">
          Missions <br /> <span className="text-[#BC9C6C]">Disponibles.</span>
        </h1>
        <p className="text-[#321B13]/60 max-w-xl text-lg font-medium leading-relaxed">
          Découvrez les demandes de services qui correspondent à votre expertise et développez votre activité dès maintenant.
        </p>
      </section>

      {/* SEARCH BAR */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#321B13]/20 group-focus-within:text-[#BC9C6C] transition-colors" />
        <input 
          type="text"
          placeholder="Rechercher par service ou client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#321B13]/10 rounded-none py-6 pl-16 pr-8 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#BC9C6C] shadow-sm transition-all"
        />
      </div>

      {/* CATEGORIES GRID */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-[#BC9C6C]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#321B13]/40">Filtrer par catégorie</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* "Tous les services" card */}
          <motion.button
            onClick={() => setSelectedCategory(null)}
            className={`relative overflow-hidden group transition-all ${
              selectedCategory === null 
                ? "ring-2 ring-[#BC9C6C]" 
                : "hover:ring-2 hover:ring-[#BC9C6C]/50"
            }`}
          >
            <div className="aspect-square bg-gradient-to-br from-[#BC9C6C]/20 to-[#321B13]/10 flex items-center justify-center p-6">
              <div className="text-center">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-[#BC9C6C]" />
                <p className="text-xs font-black uppercase tracking-widest text-[#321B13]">
                  Tous les services
                </p>
              </div>
            </div>
          </motion.button>

          {/* Category cards */}
          {categories.map((category, i) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative overflow-hidden group transition-all ${
                selectedCategory === category.id 
                  ? "ring-2 ring-[#BC9C6C]" 
                  : "hover:ring-2 hover:ring-[#BC9C6C]/50"
              }`}
            >
              {/* Image Background */}
              <div className="aspect-square bg-gray-200 overflow-hidden">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#321B13]/80 via-[#321B13]/20 to-transparent"></div>
              </div>

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-white">
                  {category.name}
                </p>
                <p className="text-[8px] text-white/60 uppercase tracking-wider mt-1">
                  {category.category}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* MISSIONS GRID */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-[#BC9C6C]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#321B13]/40">Missions correspondantes</span>
          </div>
          <p className="text-sm text-[#321B13]/50">
            {selectedCategory 
              ? `Missions pour : ${categories.find(c => c.id === selectedCategory)?.name}` 
              : "Toutes les missions disponibles"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredMissions.length > 0 ? (
            filteredMissions.map((mission, i) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white border border-[#321B13]/5 p-10 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-12 hover:border-[#BC9C6C] hover:shadow-2xl hover:shadow-[#321B13]/5 transition-all duration-500 overflow-hidden relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#BC9C6C] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>

                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="bg-[#BC9C6C]/10 text-[#BC9C6C] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                      {mission.service.category}
                    </span>
                    <span className="flex items-center gap-2 text-[9px] font-bold text-[#321B13]/30 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> Soumis le {new Date(mission.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-[#321B13] tracking-tighter uppercase leading-none group-hover:text-[#BC9C6C] transition-colors">
                    {mission.service.name}
                  </h3>

                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#FCFBF7] rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#BC9C6C]" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-[#321B13]/40 uppercase tracking-widest">Localisation</p>
                        <p className="text-[11px] font-bold text-[#321B13]">{mission.client.quartier} • {mission.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#FCFBF7] rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-[#BC9C6C]" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-[#321B13]/40 uppercase tracking-widest">Client</p>
                        <p className="text-[11px] font-bold text-[#321B13]">{mission.client.fullName}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[#321B13]/50 text-sm leading-relaxed max-w-2xl line-clamp-2">
                    {mission.description}
                  </p>
                </div>

                <div className="flex flex-col items-stretch lg:items-end justify-between lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-[#321B13]/5 pt-8 lg:pt-0 lg:pl-12">
                   <div className="text-left lg:text-right mb-8">
                     <p className="text-[9px] font-black text-[#321B13]/30 uppercase tracking-widest mb-1">Budget Estimé</p>
                     <p className="text-4xl font-black text-[#321B13] tracking-tighter">{mission.price?.toLocaleString() || '—'} $</p>
                   </div>

                   <button 
                    onClick={() => handleAccept(mission.id)}
                    disabled={acceptingId === mission.id}
                    className="w-full bg-[#321B13] text-[#FCFBF7] py-5 px-8 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#BC9C6C] hover:text-[#321B13] transition-all flex items-center justify-center gap-3 group/btn"
                   >
                     {acceptingId === mission.id ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                       <>
                         Accepter la mission
                         <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                       </>
                     )}
                   </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center bg-[#FCFBF7] border border-dashed border-[#321B13]/10">
              <Briefcase className="w-16 h-16 text-[#321B13]/5 mx-auto mb-8" />
              <h4 className="text-lg font-black text-[#321B13]/40 uppercase tracking-widest mb-3">
                Aucune mission disponible
              </h4>
              <p className="text-xs text-[#321B13]/30 max-w-xs mx-auto leading-relaxed">
                Vérifiez vos services assignés ou revenez plus tard pour découvrir de nouvelles opportunités.
              </p>
            </div>
          )}
        </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
