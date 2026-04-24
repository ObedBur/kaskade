"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import { Clock, Play, CheckCircle2, Search, Loader2, CreditCard, AlertCircle } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth } from "@/lib/use-require-auth";
import api from "@/lib/api";
import { toast } from "sonner";

export default function MesDemandesPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("TOUTES");
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests");
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
    <main className="bg-[#FCFBF7] min-h-screen font-sans selection:bg-[#BC9C6C] selection:text-white">
      <Navbar />

      <div className="pt-24 md:pt-32 pb-24 max-w-[1200px] mx-auto px-4 min-[480px]:px-8 min-[1440px]:p-12">

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

        {/* LISTE DES DEMANDES */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white border border-[#321B13]/5 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-[#BC9C6C]/30 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#BC9C6C] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-500"></div>

                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[#321B13]/30 text-[9px] font-black uppercase tracking-[0.2em]">{req.id.split('-')[0]}</span>
                      <span className="text-[#321B13]/40 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-[#321B13] tracking-tighter uppercase mb-2">
                      {req.service?.name}
                    </h3>
                    <div className="flex items-center gap-2">
                       <p className="text-[#321B13]/60 text-[10px] font-bold uppercase tracking-widest">
                        Artisan : <span className="text-[#321B13]">{req.provider?.fullName || "En attente d'acceptation"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Paiement */}
                  <div className="flex flex-col sm:flex-row items-center gap-8 lg:min-w-[300px] justify-end">
                    
                    <div className="text-center sm:text-right">
                       <p className="text-[9px] uppercase tracking-widest text-[#321B13]/40 font-black mb-1">Montant Total</p>
                       <p className="text-2xl font-black text-[#321B13] tracking-tighter">${req.price}</p>
                    </div>

                    {/* LOGIQUE DES BOUTONS DE PAIEMENT */}
                    {req.status === "ACCEPTED" && (
                      <button 
                        onClick={() => handlePayment(req.id, 'deposit')}
                        disabled={payingId === req.id}
                        className="bg-[#BC9C6C] text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#321B13] transition-all flex items-center gap-3 animate-pulse hover:animate-none"
                      >
                        {payingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Payer l'Acompte (50%)
                      </button>
                    )}

                    {req.status === "AWAITING_FINAL" && (
                      <button 
                        onClick={() => handlePayment(req.id, 'final')}
                        disabled={payingId === req.id}
                        className="bg-[#321B13] text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#BC9C6C] transition-all flex items-center gap-3"
                      >
                        {payingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Régler le Solde Final (50%)
                      </button>
                    )}

                    {/* BADGES DE STATUT */}
                    {["PENDING", "APPROVED"].includes(req.status) && (
                      <div className="flex items-center gap-2 bg-[#FCFBF7] border border-[#321B13]/10 text-[#321B13]/40 px-6 py-3 text-[9px] font-black uppercase tracking-widest">
                        Recherche Artisan...
                      </div>
                    )}
                    {req.status === "IN_PROGRESS" && (
                      <div className="flex items-center gap-2 bg-[#321B13] text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest">
                        <Play className="w-3 h-3 text-[#BC9C6C]" /> Mission en cours
                      </div>
                    )}
                    {req.status === "COMPLETED" && (
                      <div className="flex items-center gap-2 bg-green-50 text-green-600 px-6 py-3 text-[9px] font-black uppercase tracking-widest border border-green-100">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terminée
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 text-center bg-white border border-[#321B13]/5">
                <AlertCircle className="w-12 h-12 text-[#321B13]/10 mx-auto mb-6" />
                <h3 className="text-sm font-black text-[#321B13]/30 uppercase tracking-widest">Aucune demande trouvée</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </main>
  );
}
