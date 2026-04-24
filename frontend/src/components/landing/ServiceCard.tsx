"use client";

import { useState, useEffect, useRef } from "react";
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
  
  const [phase, setPhase] = useState<'INITIAL' | 'INITIATING' | 'WAITING_USSD'>('INITIAL');
  const [countdown, setCountdown] = useState(60);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const depositAmount = service.price * 0.5;

  const handleClose = () => {
    if (phase === 'WAITING_USSD') {
      toast.warning("Veuillez finaliser ou annuler la transaction sur votre téléphone.");
      return;
    }
    onClose();
  };

  const handlePay = async () => {
    if (!method || phoneNumber.length < 10) {
      toast.error("Veuillez choisir un mode de paiement et entrer un numéro valide.");
      return;
    }

    setPhase('INITIATING');
    try {
      // Formater le numéro de téléphone (ajouter +243 si nécessaire)
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+243' + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith('8') || formattedPhone.startsWith('9')) {
        formattedPhone = '+243' + formattedPhone;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      // 1. Créer la demande (Request) en base de données d'abord
      const requestRes = await api.post('/requests', {
        serviceId: service.id,
        description: `Demande pour: ${service.name}`,
        address: "Adresse à préciser (via profil)",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });
      
      const requestId = requestRes.data.id;

      // 2. Lancer l'initiation du paiement USSD avec le requestId
      const paymentRes = await api.post('/payments/initiate/deposit', {
        requestId: requestId,
        phoneNumber: formattedPhone,
        operator: method,
        currency: 'USD'
      });
      
      const newPaymentId = paymentRes.data.paymentId;
      setPaymentId(newPaymentId);
      setPhase('WAITING_USSD');
      setCountdown(60);
      
      toast.info('Veuillez saisir votre code PIN secret sur votre téléphone', {
        duration: 60000,
        id: 'ussd-toast'
      });
    } catch (error: any) {
      setPhase('INITIAL');
      const errorMsg = error.response?.data?.message || "Erreur lors de l'initiation du paiement.";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (phase === 'WAITING_USSD' && paymentId) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/payments/status/${paymentId}`);
          const status = res.data.status;
          
          if (status === 'SUCCESS') {
            clearInterval(pollingIntervalRef.current!);
            toast.dismiss('ussd-toast');
            toast.success("Paiement réussi !");
            onSuccess(phoneNumber, method!);
          } else if (status === 'FAILED') {
            clearInterval(pollingIntervalRef.current!);
            toast.dismiss('ussd-toast');
            setPhase('INITIAL');
            toast.error("Le paiement a échoué. Solde insuffisant ou transaction annulée.");
          }
        } catch (error) {
          console.error("Erreur de vérification du statut", error);
        }
      }, 3000);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            setPhase('INITIAL');
            toast.dismiss('ussd-toast');
            toast.error("Délai d'attente dépassé. Veuillez réessayer.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      };
    }
  }, [phase, paymentId, phoneNumber, method, onSuccess]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-chocolat/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl my-auto max-h-[95vh] flex flex-col"
        >
          {/* Header Modal */}
          <div className="p-5 sm:p-8 border-b border-zinc-100 flex justify-between items-center bg-[#FCFBF7] shrink-0">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tight">Paiement Acompte</h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-ocre uppercase tracking-[0.2em] mt-1">Sécurisé par Kaskade Pay</p>
            </div>
            <button onClick={handleClose} disabled={phase === 'WAITING_USSD'} className="p-2 hover:bg-zinc-200 rounded-full transition-colors disabled:opacity-50">
              <X className="w-5 h-5 text-chocolat" />
            </button>
          </div>

          <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
            {/* Montant */}
            <div className="text-center py-4 sm:py-6 bg-chocolat text-white rounded-2xl relative overflow-hidden shrink-0">
               <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] opacity-50 font-bold mb-1 sm:mb-2">Montant à payer (50%)</p>
               <p className="text-3xl sm:text-4xl font-black tracking-tighter">${depositAmount.toLocaleString()}</p>
               <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10">
                 <CreditCard className="w-10 h-10 sm:w-12 sm:h-12" />
               </div>
            </div>

            {/* Méthodes */}
            <div className="space-y-2 sm:space-y-3 shrink-0">
              <p className="text-[9px] sm:text-[10px] font-black text-chocolat/40 uppercase tracking-widest">Choisir votre opérateur</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { id: 'AIRTEL', img: '/airtel.png', bg: 'bg-white', label: 'Airtel' },
                  { id: 'ORANGE', img: '/orange.png', bg: 'bg-black border-zinc-800', label: 'Orange' },
                  { id: 'MPESA', img: '/m-pesa.png', bg: 'bg-white', label: 'M-Pesa' }
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setMethod(op.id as any)}
                    className={`flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-4 border-2 transition-all rounded-xl sm:rounded-2xl ${method === op.id ? 'border-chocolat bg-chocolat/5 shadow-md' : 'border-zinc-100 hover:border-zinc-200'}`}
                  >
                    <div className={`w-10 h-10 ${op.bg} rounded-full flex items-center justify-center overflow-hidden p-1.5 border border-zinc-100`}>
                      <img src={op.img} alt={op.label} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-chocolat/80">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro */}
            <div className="space-y-2 sm:space-y-3">
               <label className="text-[9px] sm:text-[10px] font-black text-chocolat/40 uppercase tracking-widest">Numéro Mobile Money</label>
               <div className="relative">
                 <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolat/30" />
                 <input 
                   type="tel" 
                   placeholder="08XXXXXXXX"
                   value={phoneNumber}
                   onChange={(e) => {
                     let val = e.target.value;
                     if (val.startsWith('0')) {
                       val = '+243' + val.substring(1);
                     }
                     setPhoneNumber(val);
                   }}
                   className="w-full bg-[#FCFBF7] border border-zinc-100 py-3 sm:py-4 pl-12 pr-4 rounded-xl text-sm font-bold focus:outline-none focus:border-ocre transition-colors"
                 />
               </div>
            </div>

            {/* Bouton Payer */}
            <button
              onClick={handlePay}
              disabled={phase !== 'INITIAL'}
              className="w-full bg-chocolat text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-chocolat/20 mb-4 sm:mb-0"
            >
              {phase === 'INITIATING' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  INITIATION DU PAIEMENT...
                </>
              )}
              {phase === 'WAITING_USSD' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  CONSULTEZ VOTRE TÉLÉPHONE ({countdown}s)
                </>
              )}
              {phase === 'INITIAL' && (
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

  const handlePaymentSuccess = (phone: string, operator: string) => {
    setShowPayment(false);
    toast.success("Votre demande a été payée et enregistrée avec succès !");
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
        className="group bg-[#F8F9FA] rounded-2xl sm:rounded-[32px] p-2 sm:p-4 border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full hover:bg-white"
      >
        {/* Zone Image */}
        <div className="relative h-28 sm:h-48 w-full rounded-xl overflow-hidden mb-3 sm:mb-5">
          <Image
            src={service.imageUrl || FALLBACK_IMAGE}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 backdrop-blur-md bg-white/60 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/20">
            <span className="text-chocolat text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
              {service.category}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="px-1 sm:px-2 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-lg font-extrabold text-chocolat leading-tight flex-1 line-clamp-2 uppercase">
              {service.name}
            </h3>
            <div className="flex items-center gap-1 bg-ocre/10 text-ocre px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0">
              <span className="text-[8px] sm:text-[10px] font-black">${service.price}</span>
            </div>
          </div>

          <p className="text-chocolat/70 text-[10px] sm:text-sm leading-relaxed line-clamp-2 mb-3 sm:mb-5">
            {service.description}
          </p>

          <div className="mt-auto pt-3 sm:pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
            <div className="flex flex-col">
               <span className="text-[7px] sm:text-[8px] font-black text-ocre uppercase tracking-widest mb-0.5 sm:mb-1">Acompte</span>
               <span className="text-[10px] sm:text-sm font-black text-chocolat">${(service.price * 0.5).toLocaleString()}</span>
            </div>

            <button
              onClick={handleRequestClick}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 sm:gap-3 bg-chocolat text-white py-2 sm:py-3 px-3 sm:px-6 rounded-full hover:bg-ocre hover:text-chocolat transition-all duration-500 shadow-lg active:scale-95 disabled:opacity-50"
            >
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {isSubmitting ? '...' : 'RÉSERVER'}
              </span>
              <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}