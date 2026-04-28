"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ShieldCheck, ArrowRight, Heart, CheckCircle, X, CreditCard, Smartphone, Loader2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Service } from "@/components/landing/ServiceExplorer";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import Timing from "./Timing";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

// ─── MODAL DE PAIEMENT MOBILE MONEY ─────────────────────────────────────────
function MobileMoneyModal({ service, onClose, onSuccess }: { service: Service; onClose: () => void; onSuccess: (phone: string, op: string) => void }) {
  const [method, setMethod] = useState<'AIRTEL' | 'ORANGE' | 'MPESA' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [phase, setPhase] = useState<'INITIAL' | 'INITIATING' | 'WAITING_USSD' | 'SUCCESS'>('INITIAL');
  const [countdown, setCountdown] = useState(60);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const depositAmount = (service.price || 0) * 0.5;

  const handleClose = () => {
    if (phase === 'WAITING_USSD') {
      toast.warning("Veuillez finaliser ou annuler la transaction sur votre téléphone.");
      return;
    }
    onClose();
  };

  const handlePay = async () => {
    const cleanPhone = phoneNumber.trim().replace(/\s/g, '');
    const isValid = /^[89][0-9]{8}$/.test(cleanPhone);

    if (!method) {
      toast.error("Veuillez choisir un opérateur.");
      return;
    }

    if (!isValid) {
      toast.error("Veuillez entrer les 9 chiffres après le +243.");
      return;
    }

    setPhase('INITIATING');
    try {
      const formattedPhone = '+243' + cleanPhone;

      const requestRes = await api.post('/requests', {
        serviceId: service.id,
        description: `Demande pour: ${service.name}`,
        address: "Adresse à préciser",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const requestId = requestRes.data.id;

      const paymentRes = await api.post('/payments/initiate/deposit', {
        requestId,
        phoneNumber: formattedPhone,
        operator: method,
        currency: 'USD'
      });

      setPaymentId(paymentRes.data.paymentId);
      setPhase('WAITING_USSD');
      setCountdown(60);

      toast.info('Consultez votre téléphone pour le code PIN', {
        duration: 60000,
        id: 'ussd-toast'
      });
    } catch (error: any) {
      setPhase('INITIAL');
      toast.error(error.response?.data?.message || "Erreur lors du paiement.");
    }
  };

  useEffect(() => {
    if (phase === 'WAITING_USSD' && paymentId) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/payments/status/${paymentId}`);
          if (res.data.status === 'SUCCESS') {
            clearInterval(pollingIntervalRef.current!);
            toast.dismiss('ussd-toast');
            setPhase('SUCCESS');
            setTimeout(() => onSuccess(phoneNumber, method!), 2000);
          } else if (res.data.status === 'FAILED') {
            clearInterval(pollingIntervalRef.current!);
            toast.dismiss('ussd-toast');
            setPhase('INITIAL');
            toast.error("Paiement échoué.");
          }
        } catch (e) { console.error(e); }
      }, 3000);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            setPhase('INITIAL');
            toast.dismiss('ussd-toast');
            toast.error("Délai dépassé.");
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
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-chocolat/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl my-auto max-h-[95vh] flex flex-col"
        >
          <div className="p-5 sm:p-8 border-b border-zinc-100 flex justify-between items-center bg-[#FCFBF7] shrink-0">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase">Paiement Acompte</h3>
              <p className="text-[9px] font-bold text-ocre uppercase tracking-widest mt-1">Sécurisé par Kaskade Pay</p>
            </div>
            <button onClick={handleClose} disabled={phase === 'WAITING_USSD'} className="p-2 hover:bg-zinc-200 rounded-full transition-colors disabled:opacity-50">
              <X className="w-5 h-5 text-chocolat" />
            </button>
          </div>

          <div className="p-4 sm:p-8 space-y-4 sm:space-y-8 overflow-y-auto">
            <div className="text-center py-3 sm:py-6 bg-chocolat text-white rounded-2xl relative overflow-hidden shrink-0">
              <div className="flex justify-between items-center px-4 sm:px-6 mb-1 sm:mb-3">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/50 font-bold">Prix total</span>
                <span className="text-[10px] sm:text-xs font-bold text-white/50">${(service.price || 0).toLocaleString()}</span>
              </div>

              <div className="border-t border-white/10 mx-4 sm:mx-6 mb-2 sm:mb-4"></div>

              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-ocre font-bold mb-0.5 sm:mb-1">Acompte (50%)</p>
              <p className="text-2xl sm:text-4xl font-black tracking-tighter text-white">${depositAmount.toLocaleString()}</p>

              <div className="absolute -bottom-2 -right-2 p-4 opacity-5">
                <CreditCard className="w-12 h-12 sm:w-20 sm:h-20" />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black text-chocolat/40 uppercase tracking-widest">Choisir votre opérateur</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'AIRTEL', img: '/airtel.png', bg: 'bg-white', label: 'Airtel', color: 'border-red-500 bg-red-50', text: 'text-red-600', placeholder: '992345678' },
                  { id: 'ORANGE', img: '/orange.png', bg: 'bg-black border-zinc-800', label: 'Orange', color: 'border-orange-500 bg-orange-50', text: 'text-orange-600', placeholder: '842345678' },
                  { id: 'MPESA', img: '/m-pesa.png', bg: 'bg-white', label: 'M-Pesa', color: 'border-green-500 bg-green-50', text: 'text-green-600', placeholder: '812345678' }
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setMethod(op.id as any)}
                    className={`relative flex flex-col items-center gap-2 p-2 border-2 transition-all rounded-xl ${method === op.id ? `${op.color} shadow-md scale-105 z-10` : 'border-zinc-100 hover:border-zinc-200'}`}
                  >
                    {method === op.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-white rounded-full">
                        <CheckCircle className={`w-4 h-4 ${op.text}`} />
                      </motion.div>
                    )}
                    <div className={`w-8 h-8 ${op.bg} rounded-full flex items-center justify-center overflow-hidden p-1 border border-zinc-100`}>
                      <img src={op.img} alt={op.label} className="w-full h-full object-contain" />
                    </div>
                    <span className={`text-[8px] font-black uppercase ${method === op.id ? op.text : 'text-chocolat/80'}`}>{op.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-chocolat/40 uppercase tracking-widest">Numéro Mobile Money</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-2 pointer-events-none">
                  <Smartphone className="w-4 h-4 text-chocolat/30" />
                  <span className="text-sm font-bold text-chocolat/60 border-r border-zinc-200 pr-2">+243</span>
                </div>
                <input
                  type="tel"
                  placeholder={method ? [
                    { id: 'AIRTEL', p: '992345678' },
                    { id: 'ORANGE', p: '842345678' },
                    { id: 'MPESA', p: '812345678' }
                  ].find(x => x.id === method)?.p : '812345678'}
                  value={phoneNumber}
                  maxLength={9}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#FCFBF7] border border-zinc-100 py-2.5 sm:py-3 pl-24 pr-4 rounded-xl text-sm font-bold focus:outline-none focus:border-ocre transition-colors tracking-widest"
                />
              </div>
            </div>

            {phase === 'SUCCESS' ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-2 sm:py-4 space-y-3 text-center">
                <div className="w-10 h-10 sm:w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 sm:w-8 text-green-600" />
                </div>
                <p className="text-sm sm:text-md font-black text-chocolat uppercase">Paiement Réussi !</p>
              </motion.div>
            ) : (
              <button
                onClick={handlePay}
                disabled={phase !== 'INITIAL'}
                className="w-full bg-chocolat text-white py-3 sm:py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg mb-2 sm:mb-4"
              >
                {phase === 'INITIATING' && <><Loader2 className="w-4 h-4 animate-spin" /> INITIATION...</>}
                {phase === 'WAITING_USSD' && <><Loader2 className="w-4 h-4 animate-spin" /> CONSULTEZ VOTRE TÉLÉPHONE ({countdown}s)</>}
                {phase === 'INITIAL' && <>CONFIRMER LE PAIEMENT</>}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── MODAL DE DÉTAILS DU SERVICE ────────────────────────────────────────────
function ServiceDetailsModal({ service, onClose, onReserve, onTiming }: { service: Service; onClose: () => void; onReserve: () => void; onTiming: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-chocolat/80 backdrop-blur-md overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header Image */}
        <div className="relative h-48 sm:h-72 w-full shrink-0">
          <Image src={service.imageUrl || FALLBACK_IMAGE} alt={service.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-chocolat/90 via-chocolat/30 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors z-10">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-4 sm:left-8 right-4 flex items-end justify-between z-10">
            <div className="pr-4">
              <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider mb-2">
                {service.category}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white uppercase leading-tight line-clamp-2">{service.name}</h2>
            </div>
            <div className="bg-white text-chocolat px-4 py-2 sm:py-3 rounded-2xl flex flex-col items-center shrink-0 shadow-xl">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-50">PRIX TOTAL</span>
              <span className="text-xl sm:text-2xl font-black leading-none mt-1">${(service.price || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto bg-[#FCFBF7] flex flex-col flex-1">
          <div className="mb-8 flex-1">
            <h4 className="text-[10px] sm:text-xs font-black text-chocolat/40 uppercase tracking-widest mb-3">À propos de ce service</h4>
            <p className="text-sm sm:text-base text-chocolat/80 leading-relaxed whitespace-pre-wrap mb-8">{service.description || "Aucune description fournie pour ce service."}</p>

            <div className="bg-white border border-ocre/10 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-4 h-4 text-ocre" />
                <h4 className="text-[10px] sm:text-xs font-black text-chocolat uppercase tracking-widest">Disponibilité du service</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-chocolat tracking-tighter">{service.workingHoursStart || "06:00"}</span>
                <span className="text-sm font-bold text-ocre uppercase">à</span>
                <span className="text-2xl sm:text-3xl font-black text-chocolat tracking-tighter">{service.workingHoursEnd || "18:00"}</span>
              </div>
              <p className="text-[9px] font-bold text-chocolat/40 uppercase tracking-widest mt-3">Heures d'intervention garanties</p>
            </div>
          </div>

          {/* Reserve Button Area */}
          <div className="mt-auto border-t border-zinc-200 pt-6 shrink-0">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 bg-chocolat/5 border border-chocolat/10 rounded-2xl p-4 w-full">
                <button
                  onClick={onTiming}
                  className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-chocolat/60 uppercase tracking-widest">Offre Premium</span>
                </button>
              </div>
              <button
                onClick={onReserve}
                className="w-full sm:w-auto flex-1 bg-chocolat text-white py-4 sm:py-5 px-6 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                RÉSERVER MAINTENANT <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ServiceCard ────────────────────────────────────────────────────────────
export default function ServiceCardBento({ service }: { service: Service }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTiming, setShowTiming] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleRequestClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour réserver.");
      return;
    }

    if (user?.role !== 'CLIENT') {
      toast.error("Seuls les clients peuvent réserver des services.");
      return;
    }

    setShowDetails(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (phone: string, operator: string) => {
    setShowPayment(false);
    toast.success("Votre demande a été payée et enregistrée avec succès !");
  };

  // Verrouiller le scroll quand une modal est ouverte
  useEffect(() => {
    if (showPayment || showDetails || showTiming) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPayment, showDetails, showTiming]);

  return (
    <>
      <AnimatePresence>
        {showPayment && (
          <MobileMoneyModal
            service={service}
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetails && (
          <ServiceDetailsModal
            service={service}
            onClose={() => setShowDetails(false)}
            onReserve={handleRequestClick as unknown as () => void}
            onTiming={() => {
              setShowDetails(false);
              setShowTiming(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTiming && (
          <Timing
            service={service}
            onClose={() => setShowTiming(false)}
            onConfirm={(plan) => {
              setShowTiming(false);
              const scheduleMsg = plan.frequency === "DAILY" 
                ? `Planning quotidien à ${plan.time}`
                : `Planning ${plan.frequency.toLowerCase()} (${plan.day}) à ${plan.time}`;
              toast.success(`${scheduleMsg} enregistré !`);
              setShowPayment(true);
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={() => setShowDetails(true)}
        className="group bg-[#F8F9FA] rounded-2xl sm:rounded-[32px] p-2 sm:p-4 border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full hover:bg-white cursor-pointer"
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
          </div>

          <p className="text-chocolat/70 text-[10px] sm:text-sm leading-relaxed line-clamp-2 mb-3 sm:mb-4">
            {service.description}
          </p>

          <div className="flex items-center gap-2 mb-4 bg-chocolat/[0.03] py-1.5 px-3 rounded-lg self-start">
            <Clock className="w-3 h-3 text-ocre" />
            <span className="text-[9px] font-bold text-chocolat/60 uppercase tracking-widest">
              {service.workingHoursStart || "06:00"} - {service.workingHoursEnd || "18:00"}
            </span>
          </div>

          <div className="mt-auto pt-3 sm:pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[7px] sm:text-[8px] font-black text-ocre uppercase tracking-widest mb-0.5 sm:mb-1">PRIX</span>
              <span className="text-sm sm:text-lg font-black text-chocolat">${(service.price || 0).toLocaleString()}</span>
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