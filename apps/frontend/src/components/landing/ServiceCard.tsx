"use client";

import { useState, useEffect } from "react";
import { Star, ArrowRight, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Service } from "@/components/landing/ServiceExplorer";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/utils";
import Timing from "./Timing";
import AddressForm from "./AddressForm";
import PooledCalendar from "./PooledCalendar";
import MobileMoneyPaymentModal, {
  PaymentCurrency,
} from "@/components/payments/MobileMoneyPaymentModal";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

const getServiceImageUrl = (service: Service) => {
  const imageUrl = service.imageUrl || (service.imageKey?.startsWith("http") ? service.imageKey : `/uploads/services/${service.imageKey}`) || FALLBACK_IMAGE;
  return imageUrl;
};

// Types partagés
interface SchedulePlan {
  frequency: string;
  day: string;
  time: string;
  duration: number;
  address?: string;
  description?: string;
  dateLabel?: string;
  startDate?: string;
  instructions?: string;
}

interface PaymentRequestSummary {
  id: string;
  price?: number | null;
  currency?: string | null;
}

const getPaymentCurrency = (currency?: string | null): PaymentCurrency =>
  currency === "CDF" ? "CDF" : "USD";

// MODAL DE DÉTAILS DU SERVICE
function ServiceDetailsModal({
  service,
  onClose,
  onReserve,
  onTiming,
}: {
  service: Service;
  onClose: () => void;
  onReserve: () => void;
  onTiming: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-2 sm:p-4 bg-chocolat/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header Image */}
        <div className="relative h-48 sm:h-72 w-full shrink-0">
          <Image
            src={getServiceImageUrl(service)}
            alt={service.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-chocolat/90 via-chocolat/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-4 sm:left-8 right-4 flex items-end justify-between z-10">
            <div className="pr-4">
              <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider mb-2">
                {service.category}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white uppercase leading-tight line-clamp-2">
                {service.name}
              </h2>
            </div>
            <div className="bg-white text-chocolat px-4 py-2 sm:py-3 rounded-2xl flex flex-col items-center shrink-0 shadow-xl">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-50">
                PRIX TOTAL
              </span>
              <span className="text-xl sm:text-2xl font-black leading-none mt-1">
                ${(service.price || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto bg-[#FCFBF7] flex flex-col flex-1">
          <div className="mb-8 flex-1">
            <h4 className="text-[10px] sm:text-xs font-black text-chocolat/40 uppercase tracking-widest mb-3">
              À propos de ce service
            </h4>
            <p className="text-sm sm:text-base text-chocolat/80 leading-relaxed whitespace-pre-wrap mb-8">
              {service.description ||
                "Aucune description fournie pour ce service."}
            </p>

            <div className="bg-white border border-ocre/10 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-4 h-4 text-ocre" />
                <h4 className="text-[10px] sm:text-xs font-black text-chocolat uppercase tracking-widest">
                  Disponibilité du service
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-chocolat tracking-tighter">
                  {service.workingHoursStart || "06:00"}
                </span>
                <span className="text-sm font-bold text-ocre uppercase">à</span>
                <span className="text-2xl sm:text-3xl font-black text-chocolat tracking-tighter">
                  {service.workingHoursEnd || "18:00"}
                </span>
              </div>
              <p className="text-[9px] font-bold text-chocolat/40 uppercase tracking-widest mt-3">
                Heures d'intervention garanties
              </p>
            </div>
          </div>

          {/* Reserve Button Area */}
          <div className="mt-auto border-t border-zinc-200 pt-5 shrink-0 space-y-3">
            {/* Premium CTA */}
            <button
              onClick={onTiming}
              className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-chocolat/5 to-ocre/5 border border-ocre/20 rounded-2xl px-5 py-4 hover:border-ocre/40 hover:bg-ocre/10 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ocre/10 rounded-xl">
                  <Star className="w-4 h-4 text-ocre fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-chocolat uppercase tracking-widest">
                    Offre Premium
                  </p>
                  <p className="text-[9px] font-bold text-chocolat/40 mt-0.5">
                    Planifier un abonnement récurrent
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ocre transition-transform group-hover:translate-x-1 shrink-0" />
            </button>

            {/* Standard reserve */}
            <button
              onClick={onReserve}
              className="w-full bg-chocolat text-white py-4 sm:py-5 px-6 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.99]"
            >
              VERIFIER DISPONIBILITES{" "}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ServiceCard
export default function ServiceCardBento({ service }: { service: Service }) {
  const [paymentRequest, setPaymentRequest] =
    useState<PaymentRequestSummary | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTiming, setShowTiming] = useState(false);
  const [showPooledCalendar, setShowPooledCalendar] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [schedulePlan, setSchedulePlan] = useState<SchedulePlan | null>(null);
  const { user, isAuthenticated } = useAuth();

  const createBookingRequest = async (plan: SchedulePlan) => {
    const res = await api.post("/requests", {
      serviceId: service.id,
      description: plan.description || `Demande pour: ${service.name}`,
      address: plan.address || "Adresse à préciser",
      scheduledAt: plan.startDate
        ? new Date(plan.startDate).toISOString()
        : new Date(Date.now() + 86400000).toISOString(),
      ...(plan.frequency !== "ONCE" && {
        scheduleFrequency: plan.frequency,
        scheduleDay: plan.day,
        scheduleTime: plan.time,
        notes: plan.instructions,
      }),
    });
    return res.data as PaymentRequestSummary;
  };

  const handleFreeRequest = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour réserver.");
      return;
    }

    if (user?.role !== "CLIENT") {
      toast.error("Seuls les clients peuvent réserver des services.");
      return;
    }

    setShowDetails(false);
    setShowPooledCalendar(true);
  };

  const handlePremiumRequest = () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour accéder à l'offre premium.");
      return;
    }

    if (user?.role !== "CLIENT") {
      toast.error("Seuls les clients peuvent accéder aux abonnements.");
      return;
    }

    setShowDetails(false);
    setShowTiming(true);
  };

  useEffect(() => {
    if (
      paymentRequest ||
      showDetails ||
      showTiming ||
      showAddressForm ||
      showPooledCalendar
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    paymentRequest,
    showDetails,
    showTiming,
    showAddressForm,
    showPooledCalendar,
  ]);

  return (
    <>
      {paymentRequest && (
        <MobileMoneyPaymentModal
          requestId={paymentRequest.id}
          amount={(paymentRequest.price || service.price || 0) * 0.5}
          currency={getPaymentCurrency(paymentRequest.currency)}
          paymentType="deposit"
          title="Paiement acompte 50%"
          onClose={() => {
            setPaymentRequest(null);
            setSchedulePlan(null);
          }}
          onPaid={() => {
            setPaymentRequest(null);
            setSchedulePlan(null);
            toast.success(
              "Votre demande a été payée et enregistrée avec succès !",
            );
          }}
        />
      )}

      {/* Calendrier Poolé (FREE) */}
      <AnimatePresence>
        {showPooledCalendar && (
          <PooledCalendar
            serviceId={service.id}
            onClose={() => setShowPooledCalendar(false)}
            onConfirm={(slot) => {
              setShowPooledCalendar(false);
              // Plan minimal avec la date et l'heure choisies
              const plan: SchedulePlan = {
                frequency: "ONCE",
                day: slot.dayName,
                time: slot.time,
                duration: 2,
                startDate: slot.date,
                dateLabel: `${slot.dayName} à ${slot.time}`,
              };
              setSchedulePlan(plan);
              setShowAddressForm(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetails && (
          <ServiceDetailsModal
            service={service}
            onClose={() => setShowDetails(false)}
            onReserve={() => handleFreeRequest()}
            onTiming={handlePremiumRequest}
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

              if (!isAuthenticated) {
                toast.error("Veuillez vous connecter pour continuer.");
                return;
              }

              setSchedulePlan(plan);
              setShowAddressForm(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddressForm && (
          <AddressForm
            onClose={() => setShowAddressForm(false)}
            onConfirm={async (data) => {
              setShowAddressForm(false);
              const updatedPlan = { ...schedulePlan!, ...data };
              setSchedulePlan(updatedPlan);

              if (updatedPlan.frequency === "ONCE") {
                const loadingToast = toast.loading(
                  "Création de votre demande...",
                );
                try {
                  const request = await createBookingRequest(updatedPlan);
                  toast.success("Planning enregistré — procédez au paiement.", {
                    id: loadingToast,
                  });
                  setPaymentRequest(request);
                } catch {
                  toast.error("Erreur lors de la création de la demande.", {
                    id: loadingToast,
                  });
                }
              } else {
                const loadingToast = toast.loading(
                  "Envoi de votre demande d'abonnement...",
                );
                try {
                  await api.post("/requests", {
                    serviceId: service.id,
                    description: updatedPlan.description,
                    address: updatedPlan.address,
                    scheduledAt: new Date().toISOString(),
                    scheduleFrequency: updatedPlan.frequency,
                    scheduleDay: updatedPlan.day,
                    scheduleTime: updatedPlan.time,
                    notes: `Durée souhaitée: ${updatedPlan.duration}h. Demande d'abonnement récurrent.`,
                  });

                  toast.success(
                    "Demande envoyée ! Votre dossier est en cours d'étude.",
                    {
                      id: loadingToast,
                      duration: 6000,
                    },
                  );
                  setSchedulePlan(null);
                } catch (error) {
                  toast.error("Erreur lors de l'envoi de la demande.", {
                    id: loadingToast,
                  });
                }
              }
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={() => setShowDetails(true)}
        className="group bg-white rounded-2xl sm:rounded-[28px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full cursor-pointer overflow-hidden"
      >
        {/* Zone Image */}
        <div className="relative h-32 sm:h-48 w-full overflow-hidden shrink-0">
          <Image
            src={getServiceImageUrl(service)}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-chocolat/40 to-transparent" />
          {/* Category badge */}
          <div className="absolute top-2.5 left-2.5 backdrop-blur-md bg-white/70 px-2 py-0.5 rounded-full border border-white/30">
            <span className="text-chocolat text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">
              {service.category}
            </span>
          </div>
          {/* Premium badge */}
          <div className="absolute top-2.5 right-2.5 bg-ocre/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-2.5 h-2.5 text-white fill-current" />
            <span className="text-white text-[7px] font-black uppercase tracking-widest">
              Premium
            </span>
          </div>
          {/* Price on image bottom-right */}
          <div className="absolute bottom-2.5 right-2.5 bg-white rounded-xl px-2.5 py-1 shadow-lg">
            <span className="text-[11px] sm:text-sm font-black text-chocolat">
              ${(service.price || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-3.5 sm:p-5 flex flex-col flex-1">
          <h3 className="text-xs sm:text-base font-black text-chocolat leading-tight line-clamp-2 uppercase mb-1.5">
            {service.name}
          </h3>

          <p className="text-chocolat/60 text-[10px] sm:text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
            {service.description}
          </p>

          {/* Hours pill */}
          <div className="flex items-center gap-1.5 mb-4 bg-zinc-50 border border-zinc-100 py-1.5 px-2.5 rounded-lg self-start">
            <Clock className="w-3 h-3 text-ocre" />
            <span className="text-[8px] font-bold text-chocolat/50 uppercase tracking-widest">
              {service.workingHoursStart || "06:00"} –{" "}
              {service.workingHoursEnd || "18:00"}
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
            className="mt-auto w-full flex items-center justify-between gap-2 bg-chocolat text-white py-3 px-4 rounded-xl hover:bg-ocre hover:text-chocolat transition-all duration-300 shadow-md group/btn active:scale-[0.98]"
          >
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              Voir &amp; Réserver
            </span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1 shrink-0" />
          </button>
        </div>
      </motion.div>
    </>
  );
}
