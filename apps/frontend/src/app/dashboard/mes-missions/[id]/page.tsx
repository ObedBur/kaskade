"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  CheckCircle, 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  User,
  ExternalLink,
  ShieldCheck,
  Clock
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function MissionDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchMissionDetails();
  }, [id]);

  const fetchMissionDetails = async () => {
    try {
      const res = await api.get(`/provider/my-missions`);
      // On cherche la mission spécifique dans la liste
      const found = res.data.find((m: any) => m.id === id);
      if (found) {
        setMission(found);
      } else {
        toast.error("Mission introuvable");
        router.push("/dashboard/mes-missions");
      }
    } catch (err) {
      toast.error("Erreur lors du chargement des détails");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm("Voulez-vous vraiment marquer cette mission comme terminée ?")) return;
    
    setCompleting(true);
    try {
      await api.patch(`/provider/requests/${id}/complete`);
      toast.success("Mission terminée avec succès !");
      fetchMissionDetails(); // Rafraîchir l'état
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la clôture");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  if (!mission) return null;

  const clientPhone = mission.client?.phone || "";
  const whatsappUrl = `https://wa.me/${clientPhone.replace(/\s+/g, '')}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.address + " " + mission.client?.quartier)}`;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      {/* NAVIGATION */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#321B13]/40 hover:text-[#321B13] transition-colors mb-12 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Retour aux missions</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* COLONNE INFO (G) */}
        <div className="lg:col-span-7 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#BC9C6C]/10 text-[#BC9C6C] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                {mission.status}
              </span>
              <span className="text-[#321B13]/30 text-[9px] font-bold uppercase tracking-widest">ID: {mission.id.split('-')[0]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none mb-6">
              {mission.service?.name}
            </h1>
            <p className="text-[#321B13]/60 text-base leading-relaxed">
              {mission.description}
            </p>
          </section>

          <section className="bg-[#FCFBF7] border border-[#321B13]/5 p-8 space-y-8">
            <h3 className="text-xs font-black text-[#321B13] uppercase tracking-widest border-b border-[#321B13]/10 pb-4">Détails de l'intervention</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <MapPin className="w-4 h-4 text-[#BC9C6C]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#321B13]/40 uppercase tracking-widest mb-1">Localisation</p>
                  <p className="text-sm font-bold text-[#321B13] leading-tight">{mission.address}</p>
                  <p className="text-xs text-[#321B13]/60 mt-1">{mission.client?.quartier}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Calendar className="w-4 h-4 text-[#BC9C6C]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#321B13]/40 uppercase tracking-widest mb-1">Date prévue</p>
                  <p className="text-sm font-bold text-[#321B13]">{new Date(mission.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* COLONNE ACTIONS (D) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* CARTE CLIENT & ACTIONS RAPIDES */}
          <div className="bg-[#321B13] text-white p-8 md:p-10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-[#BC9C6C]" />
                </div>
                <div>
                  <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-0.5">Contact Client</p>
                  <h4 className="text-xl font-bold tracking-tight">{mission.client?.fullName}</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <a 
                  href={`tel:${clientPhone}`}
                  className="flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 p-5 transition-all group"
                >
                  <Phone className="w-5 h-5 text-[#BC9C6C] group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Appeler</span>
                </a>
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  className="flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 p-5 transition-all group"
                >
                  <MessageCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                </a>
              </div>

              <a 
                href={mapsUrl}
                target="_blank"
                className="w-full flex items-center justify-center gap-3 bg-[#BC9C6C] text-[#321B13] py-5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all"
              >
                <MapPin className="w-4 h-4" />
                Itinéraire Maps
                <ExternalLink className="w-3 h-3 ml-2 opacity-30" />
              </a>
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#BC9C6C] rounded-full blur-[100px] opacity-10"></div>
          </div>

          {/* CLÔTURE DE MISSION */}
          <div className="p-8 border border-[#321B13]/10 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <h4 className="text-xs font-black text-[#321B13] uppercase tracking-widest">Fin d'intervention</h4>
            </div>
            <p className="text-[11px] text-[#321B13]/50 leading-relaxed mb-8">
              Une fois le travail terminé et vérifié avec le client, marquez la mission comme terminée pour déclencher le paiement final.
            </p>
            
            {mission.status === 'IN_PROGRESS' || mission.status === 'ACCEPTED' ? (
              <button 
                onClick={handleComplete}
                disabled={completing}
                className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {completing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Clôturer la mission
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-3 bg-slate-100 text-slate-400 py-5 font-black text-[10px] uppercase tracking-[0.2em]">
                <Clock className="w-4 h-4" />
                Mission {mission.status}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
