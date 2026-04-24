"use client";

import { useState } from "react";
import { Star, ShieldCheck, ArrowRight, Heart, CheckCircle, X, CreditCard, Smartphone, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Service } from "@/components/landing/ServiceExplorer";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

// ─── MODAL DE PAIEMENT MOBILE MONEY ─────────────────────────────────────────
function MobileMoneyModal({ service, onClose, onSuccess }: { service: Service; onClose: () => void; onSuccess: (phone: string, op: string) => void }) {
  const [method, setMethod] = useState<'AIRTEL' | 'ORANGE' | 'MPESA' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const depositAmount = service.price * 0.5;

  const handlePay = async () => {
    if (!method || phoneNumber.length < 9) {
      toast.error("Veuillez choisir un mode de paiement et entrer un numéro valide.");
      return;
    }

    setIsProcessing(true);
    try {
      // On simule l'appel API de paiement Mobile Money
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess(phoneNumber, method);
    } catch (error) {
      toast.error("Le paiement a échoué. Veuillez vérifier votre solde.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-chocolat/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header Modal */}
          <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-[#FCFBF7]">
            <div>
              <h3 className="text-xl font-black text-chocolat uppercase tracking-tight">Paiement Acompte</h3>
              <p className="text-[10px] font-bold text-ocre uppercase tracking-[0.2em] mt-1">Sécurisé par Kaskade Pay</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-chocolat" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Montant */}
            <div className="text-center py-6 bg-chocolat text-white rounded-2xl relative overflow-hidden">
               <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-bold mb-2">Montant à payer (50%)</p>
               <p className="text-4xl font-black tracking-tighter">${depositAmount.toLocaleString()}</p>
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <CreditCard className="w-12 h-12" />
               </div>
            </div>

            {/* Méthodes */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-widest">Choisir votre opérateur</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'AIRTEL', color: 'bg-red-600', label: 'Airtel' },
                  { id: 'ORANGE', color: 'bg-orange-500', label: 'Orange' },
                  { id: 'MPESA', color: 'bg-green-600', label: 'M-Pesa' }
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setMethod(op.id as any)}
                    className={`flex flex-col items-center gap-2 p-4 border-2 transition-all rounded-2xl ${method === op.id ? 'border-chocolat bg-chocolat/5' : 'border-zinc-100'}`}
                  >
                    <div className={`w-8 h-8 ${op.color} rounded-full flex items-center justify-center text-white text-[10px] font-black`}>
                      {op.label[0]}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro */}
            <div className="space-y-3">
               <label className="text-[10px] font-black text-chocolat/40 uppercase tracking-widest">Numéro Mobile Money</label>
               <div className="relative">
                 <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolat/30" />
                 <input 
                   type="tel" 
                   placeholder="08XXXXXXXX"
                   value={phoneNumber}
                   onChange={(e) => setPhoneNumber(e.target.value)}
                   className="w-full bg-[#FCFBF7] border border-zinc-100 py-4 pl-12 pr-4 rounded-xl text-sm font-bold focus:outline-none focus:border-ocre transition-colors"
                 />
               </div>
            </div>

            {/* Bouton Payer */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full bg-chocolat text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-chocolat/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  TRAITEMENT...
                </>
              ) : (
                <>CONFIRMER LE PAIEMENT (${depositAmount})</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── ServiceCard ────────────────────────────────────────────────────────────
export default function ServiceCardBento({ service }: { service: Service }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleRequestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour réserver.");
      return;
    }

    if (user?.role !== 'CLIENT') {
      toast.error("Seuls les clients peuvent réserver des services.");
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (phone: string, operator: string) => {
    setShowPayment(false);
    setIsSubmitting(true);
    
    try {
      console.log(`[PAIEMENT] Tentative de création de demande pour le service ${service.id}...`);
      
      const response = await api.post('/requests', {
        serviceId: service.id,
        description: `Demande payée pour: ${service.name}`,
        address: user?.quartier || "Adresse à préciser",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        phoneNumber: phone, 
        operator: operator 
      });

      console.log(`[SUCCÈS] Demande ${response.data.id} créée avec succès après paiement.`);
      toast.success("Paiement reçu ! Votre demande est maintenant prioritaire.");
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Erreur lors de la validation du paiement.";
      console.error(`[ERREUR PAIEMENT] Échec de création de la demande:`, errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showPayment && (
        <MobileMoneyModal 
          service={service} 
          onClose={() => setShowPayment(false)} 
          onSuccess={handlePaymentSuccess}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group bg-[#F8F9FA] rounded-[32px] p-4 border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full hover:bg-white"
      >
        {/* Zone Image */}
        <div className="relative h-48 w-full rounded-xl overflow-hidden mb-5">
          <Image
            src={service.imageUrl || FALLBACK_IMAGE}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 backdrop-blur-md bg-white/60 px-3 py-1 rounded-full border border-white/20">
            <span className="text-chocolat text-[10px] font-bold uppercase tracking-wider">
              {service.category}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="px-2 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-3 mb-3">
            <h3 className="text-lg font-extrabold text-chocolat leading-snug flex-1 line-clamp-2 uppercase">
              {service.name}
            </h3>
            <div className="flex items-center gap-1.5 bg-ocre/10 text-ocre px-2.5 py-1 rounded-full shrink-0">
              <span className="text-[10px] font-black">${service.price}</span>
            </div>
          </div>

          <p className="text-chocolat/70 text-sm leading-relaxed line-clamp-2 mb-5">
            {service.description}
          </p>

          <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-ocre uppercase tracking-widest mb-1">Acompte requis</span>
               <span className="text-sm font-black text-chocolat">${(service.price * 0.5).toLocaleString()}</span>
            </div>

            <button
              onClick={handleRequestClick}
              disabled={isSubmitting}
              className="flex items-center gap-3 bg-chocolat text-white py-3 px-6 rounded-full hover:bg-ocre hover:text-chocolat transition-all duration-500 shadow-lg active:scale-95 disabled:opacity-50"
            >
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {isSubmitting ? 'ENVOI...' : 'RÉSERVER'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}