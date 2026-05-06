"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Clock, 
  Loader2, 
  MapPin, 
  Briefcase,
  TrendingUp,
  ChevronRight,
  MessageCircle,
  X,
  Phone,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "@/lib/utils";

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
    phone: string;
    avatarUrl: string;
    bio: string | null;
    isVerified: boolean;
    createdAt: string;
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
  const [selectedMission, setSelectedMission] = useState<AvailableMission | null>(null);

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
      setSelectedMission(null);
      fetchAvailableMissions();
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
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      
      {/* HEADER SECTION - More Compact */}
      <section className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-[2px] bg-[#BC9C6C]"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#321B13]/40">Opportunités</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-[0.9] mb-4">
          Missions <span className="text-[#BC9C6C]">Disponibles.</span>
        </h1>
        <p className="text-[#321B13]/60 max-w-lg text-base font-medium leading-relaxed">
          Propulsez votre activité en choisissant les meilleures missions.
        </p>
      </section>

      {/* SEARCH BAR - More Compact */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/20 group-focus-within:text-[#BC9C6C] transition-colors" />
        <input 
          type="text"
          placeholder="Rechercher par service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#321B13]/10 rounded-xl py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#BC9C6C] shadow-sm transition-all"
        />
      </div>

      {/* CATEGORIES GRID - Smaller Cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-[2px] bg-[#BC9C6C]"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#321B13]/40">Catégories</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <motion.button
            onClick={() => setSelectedCategory(null)}
            className={`relative overflow-hidden rounded-xl transition-all ${
              selectedCategory === null 
                ? "ring-2 ring-[#BC9C6C] bg-[#BC9C6C]/5" 
                : "bg-white border border-[#321B13]/5 hover:border-[#BC9C6C]/50"
            }`}
          >
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center">
                <Briefcase className="w-5 h-5 mx-auto mb-1 text-[#BC9C6C]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-[#321B13]">
                  Tous
                </p>
              </div>
            </div>
          </motion.button>

          {categories.slice(0, 5).map((category, i) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`relative overflow-hidden rounded-xl group transition-all ${
                selectedCategory === category.id 
                  ? "ring-2 ring-[#BC9C6C]" 
                  : "bg-white border border-[#321B13]/5 hover:border-[#BC9C6C]/50"
              }`}
            >
              <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                <img
                  src={getMediaUrl(category.imageUrl)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute inset-0 flex items-end p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white truncate w-full">
                    {category.name}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* MISSIONS GRID - Smaller Padding */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-6 h-[2px] bg-[#BC9C6C]"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#321B13]/40">Résultats</span>
            </div>
            <p className="text-[10px] font-bold text-[#321B13]/40 uppercase tracking-widest italic">
              {filteredMissions.length} mission(s) disponible(s)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMissions.length > 0 ? (
              filteredMissions.map((mission, i) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white border border-[#321B13]/5 p-6 rounded-2xl flex flex-col justify-between hover:border-[#BC9C6C] hover:shadow-xl hover:shadow-[#321B13]/5 transition-all duration-300 relative"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-[#BC9C6C]/10 text-[#BC9C6C] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                        {mission.service.category}
                      </span>
                      <p className="text-[14px] font-black text-[#321B13]">{mission.price} $</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-[#321B13] uppercase tracking-tighter line-clamp-1">
                        {mission.service.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[9px] text-[#321B13]/40 font-bold uppercase tracking-wider">
                        <MapPin className="w-3 h-3" />
                        {mission.client.quartier}
                      </div>
                    </div>

                    <p className="text-[#321B13]/60 text-[11px] font-medium line-clamp-2 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#321B13]/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden border border-[#321B13]/10">
                        {mission.client.avatarUrl ? (
                          <img src={getMediaUrl(mission.client.avatarUrl)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <UserIcon className="w-full h-full p-1.5 text-[#321B13]/20" />
                        )}
                      </div>
                      <p className="text-[9px] font-black text-[#321B13] uppercase tracking-widest">{mission.client.fullName}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedMission(mission)}
                      className="text-[9px] font-black text-[#BC9C6C] uppercase tracking-[0.2em] hover:text-[#321B13] transition-colors flex items-center gap-1"
                    >
                      Détails <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[#FCFBF7]/50 rounded-3xl border-2 border-dashed border-[#321B13]/5">
                <Briefcase className="w-12 h-12 text-[#321B13]/5 mx-auto mb-4" />
                <h4 className="text-[10px] font-black text-[#321B13]/40 uppercase tracking-widest">
                  Aucune mission
                </h4>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MISSION DETAILS MODAL */}
      <AnimatePresence>
        {selectedMission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMission(null)}
              className="absolute inset-0 bg-[#321B13]/90 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="relative h-32 md:h-40 bg-[#321B13] overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 opacity-20">
                   <img src={getMediaUrl(categories.find(c => c.id === selectedMission.service.id)?.imageUrl)} className="w-full h-full object-cover blur-sm" alt="" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#321B13] to-transparent"></div>
                <button 
                  onClick={() => setSelectedMission(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute -bottom-6 md:-bottom-8 left-6 md:left-10 w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-white p-1.5 md:p-2 shadow-xl">
                  <div className="w-full h-full rounded-xl md:rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                    {selectedMission.client.avatarUrl ? (
                      <img src={getMediaUrl(selectedMission.client.avatarUrl)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <UserIcon className="w-full h-full p-4 md:p-6 text-[#321B13]/20" />
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto pt-10 md:pt-12 px-6 md:px-10 pb-8 md:pb-10 space-y-6 md:space-y-8 custom-scrollbar">
                {/* Client & Service Info */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-black text-[#321B13] uppercase tracking-tighter">
                        {selectedMission.client.fullName}
                      </h2>
                      {selectedMission.client.isVerified && (
                        <div className="bg-[#BC9C6C] text-white p-0.5 rounded-full shrink-0" title="Client Vérifié">
                          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-[#BC9C6C] uppercase tracking-widest leading-tight">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="break-words">{selectedMission.client.quartier} • {selectedMission.address}</span>
                    </div>
                  </div>
                  <div className="bg-[#FCFBF7] md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border border-[#321B13]/5 md:border-0 w-full md:w-auto flex md:block justify-between items-center">
                    <p className="text-[9px] font-black text-[#321B13]/30 uppercase tracking-widest mb-0.5">Prix Fixé</p>
                    <p className="text-xl md:text-2xl font-black text-[#321B13]">{selectedMission.price} $</p>
                  </div>
                </div>

                {/* Client Bio Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#BC9C6C]" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#321B13]">Profil Client</span>
                    </div>
                    <span className="text-[8px] font-bold text-[#321B13]/30 uppercase tracking-widest">
                      Membre depuis {selectedMission.client.createdAt ? new Date(selectedMission.client.createdAt).getFullYear() : '—'}
                    </span>
                  </div>
                  <div className="bg-[#FCFBF7] p-4 md:p-5 rounded-2xl border border-[#321B13]/5">
                    <p className="text-[11px] md:text-xs text-[#321B13]/70 leading-relaxed font-medium italic">
                      {selectedMission.client.bio || "Ce client n'a pas encore ajouté de biographie."}
                    </p>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#BC9C6C]" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#321B13]">Détails du Service</span>
                  </div>
                  <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#321B13]/10 border-dashed">
                    <h4 className="text-xs md:text-sm font-black text-[#321B13] uppercase mb-2">{selectedMission.service.name}</h4>
                    <p className="text-[11px] md:text-xs text-[#321B13]/70 leading-relaxed font-medium">
                      {selectedMission.description}
                    </p>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a 
                    href={`https://wa.me/${selectedMission.client.phone?.replace(/\+/g, '')}?text=Bonjour ${selectedMission.client.fullName}, je suis intéressé par votre demande de ${selectedMission.service.name} sur Kaskade.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-3.5 md:py-4 px-6 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#25D366]/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <a 
                    href={`tel:${selectedMission.client.phone}`}
                    className="flex items-center justify-center gap-3 bg-white border-2 border-[#321B13]/5 text-[#321B13] py-3.5 md:py-4 px-6 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:border-[#BC9C6C] transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler
                  </a>
                </div>

                {/* Final Accept Action */}
                <button 
                  onClick={() => handleAccept(selectedMission.id)}
                  disabled={acceptingId === selectedMission.id}
                  className="w-full bg-[#321B13] text-[#FCFBF7] py-5 md:py-6 px-10 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.3em] hover:bg-[#BC9C6C] hover:text-[#321B13] transition-all flex items-center justify-center gap-3 group/btn shadow-xl shadow-[#321B13]/10"
                >
                  {acceptingId === selectedMission.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Confirmer l'acceptation
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
