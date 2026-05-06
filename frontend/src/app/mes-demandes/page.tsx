"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import { Clock, Play, CheckCircle2, Search, Loader2, CreditCard, AlertCircle, Calendar, Trash2, Edit3, MapPin, FileText, X, ChevronRight, Star } from "lucide-react";
import Footer from "@/components/landing/Footer";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Timing from "@/components/landing/Timing";
import { useRequireAuth } from "@/lib/use-require-auth";
import api from "@/lib/api";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/utils";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=800";

export default function MesDemandesPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("TOUTES");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);


  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests");
      console.log("Mes Demandes Data:", res.data);
      setRequests(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement de vos demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchRequests();
    }
  }, [user, authLoading]);

  const handleCancel = async (requestId: string) => {
    if (!confirm("Voulez-vous vraiment annuler cette demande ?")) return;
    try {
      await api.delete(`/requests/${requestId}`);
      toast.success("Demande annulée avec succès.");
      fetchRequests();
    } catch (err) {
      toast.error("Impossible d'annuler la demande.");
    }
  };

  const handleReschedule = (request: any) => {
    setSelectedRequest(request);
    setShowReschedule(true);
  };

  const confirmReschedule = async (plan: any) => {
    setShowReschedule(false);
    const loadingToast = toast.loading("Mise à jour de votre planning...");
    try {
      await api.patch(`/requests/${selectedRequest.id}`, {
        scheduleDay: plan.day,
        scheduleTime: plan.time,
        notes: `Report demandé : ${plan.dateLabel}. ${selectedRequest.notes || ''}`
      });
      toast.success("Votre demande de report a été transmise ! Un expert va confirmer le changement.", { id: loadingToast });
      fetchRequests();
    } catch (err) {
      toast.error("Erreur lors du report.", { id: loadingToast });
    }
  };

  // Simulation de paiement (Appel au Backend)
  const handlePayment = async (requestId: string, type: 'deposit' | 'final') => {
    setPayingId(requestId);
    try {
      if (type === 'deposit') {
        await api.post(`/payments/mock-deposit`, { requestId });
        toast.success("Acompte de 50% payé ! Votre artisan peut commencer.");
      } else {
        await api.post(`/payments/mock-final`, { requestId });
        toast.success("Solde final payé ! Merci pour votre confiance.");
      }
      fetchRequests(); // Recharger pour voir le changement de statut
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setPayingId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeFilter === "TOUTES") return true;
    if (activeFilter === "EN ATTENTE") return ["PENDING", "APPROVED", "ACCEPTED"].includes(req.status);
    if (activeFilter === "EN COURS") return ["IN_PROGRESS", "AWAITING_FINAL"].includes(req.status);
    if (activeFilter === "TERMINÉES") return req.status === "COMPLETED";
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FCFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  return (
    <main className="bg-[#FCFBF7] min-h-screen font-sans selection:bg-[#BC9C6C] selection:text-white overflow-x-hidden">
      <Navbar />

      <div className="pt-32 md:pt-40 pb-24 max-w-[1400px] mx-auto px-4 sm:px-10">

        {/* HEADER EDITORIAL */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-4">SUIVI DES SERVICES</h2>
          <h1 className="text-4xl md:text-6xl font-black text-[#321B13] tracking-tighter leading-none mb-6">
            MES <br />
            <span className="text-[#BC9C6C]">DEMANDES.</span>
          </h1>
          <p className="text-[#321B13]/70 max-w-lg text-sm md:text-base leading-relaxed border-l-2 border-[#BC9C6C] pl-6">
            Gérez vos demandes et sécurisez vos paiements. Nous protégeons vos fonds jusqu'à la validation finale.
          </p>
        </motion.section>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-[#321B13]/10 pb-6">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {["TOUTES", "EN ATTENTE", "EN COURS", "TERMINÉES"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 transition-all duration-300 ${activeFilter === filter
                  ? "bg-[#321B13] text-[#FCFBF7]"
                  : "bg-white border border-[#321B13]/10 text-[#321B13] hover:border-[#BC9C6C]"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE DES DEMANDES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, index) => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                  className="group bg-white rounded-[32px] border border-zinc-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full"
                >
                  {/* Image & Status */}
                  <div className="relative h-48 w-full overflow-hidden shrink-0">
                    <Image
                      src={getMediaUrl(req.service?.imageUrl) || FALLBACK_IMAGE}
                      alt={req.service?.name || "Service"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-chocolat/60 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {req.status === "PENDING" && <span className="bg-white/90 backdrop-blur-md text-chocolat text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">En attente</span>}
                      {req.status === "IN_PROGRESS" && <span className="bg-ocre text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-ocre/20"><Play className="w-2.5 h-2.5" /> En cours</span>}
                      {req.status === "COMPLETED" && <span className="bg-green-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5" /> Terminée</span>}
                      {req.status === "ACCEPTED" && <span className="bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">Acceptée</span>}
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <p className="text-white text-xl font-black tracking-tighter">${req.price}</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[8px] font-black text-ocre uppercase tracking-[0.2em]">{req.service?.category}</span>
                    </div>
                    <h3 className="text-lg font-black text-chocolat tracking-tighter uppercase mb-2 line-clamp-1 group-hover:text-ocre transition-colors">
                      {req.service?.name}
                    </h3>
                    <p className="text-chocolat/50 text-[10px] font-bold uppercase tracking-widest mb-4">
                      Artisan : <span className="text-chocolat">{req.provider?.fullName || "Recherche..."}</span>
                    </p>

                    {req.scheduleFrequency && (
                      <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-off-white flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-ocre" />
                        </div>
                        <div>
                          <p className="text-[7px] font-black text-chocolat/30 uppercase tracking-widest">Abonnement</p>
                          <p className="text-[10px] font-black text-chocolat uppercase">{req.scheduleFrequency} • {req.scheduleDay}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[9px] font-black text-chocolat/20 uppercase tracking-[0.2em]">ID: {req.id.split('-')[0]}</span>
                      <div className="flex items-center gap-1 text-ocre group-hover:translate-x-1 transition-transform">
                        <span className="text-[9px] font-black uppercase tracking-widest">Détails</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-white border border-[#321B13]/5 rounded-[40px]">
                <AlertCircle className="w-12 h-12 text-[#321B13]/10 mx-auto mb-6" />
                <h3 className="text-sm font-black text-[#321B13]/30 uppercase tracking-widest">Aucune demande trouvée</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />

      <AnimatePresence>
        {showReschedule && selectedRequest && (
          <Timing
            service={selectedRequest.service}
            onClose={() => setShowReschedule(false)}
            onConfirm={confirmReschedule}
          />
        )}
      </AnimatePresence>

      {/* MODALE DE DÉTAILS COMPLÈTE */}
      <AnimatePresence>
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="absolute inset-0 bg-chocolat/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Image Detail */}
              <div className="relative h-64 shrink-0">
                <Image
                  src={getMediaUrl(selectedRequest.service?.imageUrl) || FALLBACK_IMAGE}
                  alt={selectedRequest.service?.name || "Service"}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 text-chocolat hover:scale-110 active:scale-95 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Detail */}
              <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 custom-scrollbar">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-ocre/10 text-ocre text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                      {selectedRequest.service?.category}
                    </span>
                    <span className="text-chocolat/30 text-[10px] font-bold uppercase tracking-widest">ID: {selectedRequest.id}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-chocolat tracking-tighter uppercase leading-none">
                    {selectedRequest.service?.name}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-off-white rounded-3xl border border-zinc-100">
                    <p className="text-[9px] font-black text-chocolat/30 uppercase tracking-widest mb-2">Artisan Assigné</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ocre/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-ocre" />
                      </div>
                      <p className="text-xs font-black text-chocolat">{selectedRequest.provider?.fullName || "Recherche en cours..."}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-off-white rounded-3xl border border-zinc-100 text-right">
                    <p className="text-[9px] font-black text-chocolat/30 uppercase tracking-widest mb-1">Montant Total</p>
                    <p className="text-2xl font-black text-chocolat tracking-tighter">${selectedRequest.price}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-50 rounded-2xl"><MapPin className="w-5 h-5 text-chocolat/40" /></div>
                    <div>
                      <p className="text-[9px] font-black text-chocolat/30 uppercase tracking-widest">Adresse d'intervention</p>
                      <p className="text-sm font-bold text-chocolat">{selectedRequest.address || "À préciser avec l'artisan"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-50 rounded-2xl"><Calendar className="w-5 h-5 text-chocolat/40" /></div>
                    <div>
                      <p className="text-[9px] font-black text-chocolat/30 uppercase tracking-widest">Planning & Fréquence</p>
                      <p className="text-sm font-bold text-chocolat">
                        {selectedRequest.scheduleFrequency === "ONCE" ? "Intervention ponctuelle" : `Abonnement ${selectedRequest.scheduleFrequency}`}
                        {selectedRequest.scheduleDay && ` • Chaque ${selectedRequest.scheduleDay} à ${selectedRequest.scheduleTime}`}
                      </p>
                    </div>
                  </div>

                  {selectedRequest.notes && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-zinc-50 rounded-2xl"><FileText className="w-5 h-5 text-chocolat/40" /></div>
                      <div>
                        <p className="text-[9px] font-black text-chocolat/30 uppercase tracking-widest">Notes & Instructions</p>
                        <p className="text-sm text-chocolat/70 leading-relaxed italic">"{selectedRequest.notes}"</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions Modal */}
                <div className="pt-8 border-t border-zinc-100 flex flex-wrap gap-4">
                  {selectedRequest.status === "ACCEPTED" && (
                    <button
                      onClick={() => { handlePayment(selectedRequest.id, 'deposit'); setShowDetailModal(false); }}
                      className="flex-1 bg-ocre text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-ocre/20 hover:scale-[1.02] transition-all"
                    >
                      Payer l'acompte (50%)
                    </button>
                  )}
                  {selectedRequest.status === "AWAITING_FINAL" && (
                    <button
                      onClick={() => { handlePayment(selectedRequest.id, 'final'); setShowDetailModal(false); }}
                      className="flex-1 bg-chocolat text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-chocolat/20 hover:scale-[1.02] transition-all"
                    >
                      Payer le solde final
                    </button>
                  )}
                  <button
                    onClick={() => { handleReschedule(selectedRequest); setShowDetailModal(false); }}
                    className="px-8 py-5 bg-zinc-100 text-chocolat rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all"
                  >
                    Reporter
                  </button>
                  <button
                    onClick={() => { handleCancel(selectedRequest.id); setShowDetailModal(false); }}
                    className="px-8 py-5 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
