"use client";

import { useState } from "react";
import { Star, ShieldCheck, ArrowRight, Heart, CheckCircle, X, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Service } from "@/components/landing/ServiceExplorer";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

// ─── Notification In-App ───────────────────────────────────────────────────
function RequestConfirmationModal({ service, onClose }: { service: Service; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative bg-white rounded-[28px] shadow-2xl max-w-sm w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bande décorative top */}
          <div className="h-1.5 w-full bg-gradient-to-r from-ocre via-[#d4af37] to-ocre" />

          <div className="p-7">
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              <X className="w-4 h-4 text-chocolat/60" />
            </button>

            {/* Icône succès */}
            <div className="flex items-center justify-center w-14 h-14 bg-[#25D366]/10 rounded-2xl mb-5">
              <CheckCircle className="w-8 h-8 text-[#25D366]" />
            </div>

            {/* Contenu */}
            <h3 className="text-xl font-black text-chocolat tracking-tight mb-2">
              Demande envoyée !
            </h3>
            <p className="text-chocolat/60 text-sm leading-relaxed mb-5">
              Votre demande pour{" "}
              <span className="font-bold text-chocolat">{service.title}</span>{" "}
              a bien été reçue. Nos administrateurs l&apos;examinent déjà.
            </p>

            {/* Timeline visuelle */}
            <div className="flex flex-col gap-3 mb-6">
              {[
                { icon: CheckCircle, label: "Demande reçue", status: "done", color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
                { icon: Clock, label: "Vérification admin en cours", status: "active", color: "text-ocre", bg: "bg-ocre/10" },
                { icon: Sparkles, label: "Mise en relation prestataire", status: "pending", color: "text-chocolat/30", bg: "bg-zinc-100" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${step.bg} flex items-center justify-center shrink-0`}>
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                  </div>
                  <span className={`text-xs font-semibold ${step.status === 'pending' ? 'text-chocolat/30' : 'text-chocolat/70'}`}>
                    {step.label}
                  </span>
                  {step.status === 'active' && (
                    <span className="ml-auto text-[10px] bg-ocre/10 text-ocre font-black uppercase tracking-wider px-2 py-0.5 rounded-full">En cours</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-chocolat text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-ocre transition-colors"
            >
              Parfait, merci !
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── ServiceCard ────────────────────────────────────────────────────────────
export default function ServiceCardBento({ service }: { service: Service }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Connexion requise.");
      return;
    }

    if (user?.role !== 'CLIENT') {
      toast.error("Réservé aux clients.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/requests', {
        serviceId: service.id,
        message: `Demande pour le service: ${service.title}`
      });

      // Toast court sur la bannière
      toast.success("Demande envoyée ✅");

      // Notification in-app détaillée
      setShowConfirmation(true);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Erreur lors de l'envoi.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showConfirmation && (
        <RequestConfirmationModal
          service={service}
          onClose={() => setShowConfirmation(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group bg-[#F8F9FA] rounded-[32px] p-4 border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full hover:bg-white"
      >
        {/* Zone Image arrondie */}
        <div className="relative h-48 w-full rounded-xl overflow-hidden mb-5">
          <Image
            src={service.image || FALLBACK_IMAGE}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Badge Catégorie flottant style verre */}
          <div className="absolute top-3 left-3 backdrop-blur-md bg-white/60 px-3 py-1 rounded-full border border-white/20">
            <span className="text-chocolat text-[10px] font-bold uppercase tracking-wider">
              {service.category}
            </span>
          </div>

          {/* BOUTON LIKER */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-3 right-3 backdrop-blur-md bg-white/60 p-2 rounded-full border border-white/20 hover:bg-white transition-all duration-300 active:scale-90 group/like"
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-300 ${isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-chocolat/70 group-hover/like:text-red-500"
                }`}
            />
          </button>
        </div>

        {/* Contenu */}
        <div className="px-2 flex flex-col flex-1">
          {/* Titre & Note */}
          <div className="flex justify-between items-start gap-3 mb-3">
            <h3 className="text-lg font-extrabold text-chocolat leading-snug flex-1 line-clamp-2">
              {service.title}
            </h3>
            <div className="flex items-center gap-1.5 bg-ocre/10 text-ocre px-2.5 py-1 rounded-full shrink-0">
              <Star className="w-3.5 h-3.5 text-ocre" />
              <span className="text-xs font-bold">{service._count?.reviews ?? 0} avis</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-chocolat/70 text-sm leading-relaxed line-clamp-2 mb-5">
            {service.description}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between relative min-h-[60px]">
            <div className="flex items-center gap-2 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-2">
              {service.provider.isVerified && (
                <div className="bg-[#25D366]/10 p-1 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                </div>
              )}
              <span className="text-[11px] text-chocolat/60 font-semibold uppercase tracking-wider">
                Expert Vérifié
              </span>
            </div>

            <div className="absolute right-0">
              <button
                onClick={handleRequest}
                disabled={isSubmitting}
                className={`flex items-center gap-0 group-hover:gap-3 bg-chocolat text-white p-3 px-3.5 rounded-full hover:bg-ocre hover:px-6 transition-all duration-500 overflow-hidden shadow-lg active:scale-95 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="max-w-0 group-hover:max-w-[160px] opacity-0 group-hover:opacity-100 transition-all duration-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  {isSubmitting ? 'ENVOI...' : 'RÉSERVER'}
                </span>
                <ArrowRight className={`w-5 h-5 transition-transform duration-500 ${isSubmitting ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}