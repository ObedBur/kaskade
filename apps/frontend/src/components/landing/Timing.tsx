"use client";

import { useState, ReactNode, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Calendar, Clock, Check, ArrowRight, ArrowLeft,
    Zap, Star, MapPin, Loader2, AlertCircle, RefreshCw
} from "lucide-react";
import { Service } from "./ServiceExplorer";
import api from "@/lib/api";
import { toast } from "sonner";

interface TimingProps {
    service: Service;
    onClose: () => void;
    onConfirm: (plan: SchedulePlan) => void;
}

type Frequency = "ONCE" | "WEEKLY" | "MONTHLY";

interface SchedulePlan {
    frequency: Frequency;
    day: string;
    time: string;
    duration: number;
    dateLabel?: string;
    startDate?: string;
}

interface PlanOption {
    id: Frequency;
    label: string;
    desc: string;
    icon: ReactNode;
    badge?: string;
}

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 50 : -50,
        opacity: 0,
    }),
};

export default function Timing({ service, onClose, onConfirm }: TimingProps) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [frequency, setFrequency] = useState<Frequency>("ONCE");

    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
    const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>("Lundi");
    const [selectedTime, setSelectedTime] = useState("09:00");
    const [duration, setDuration] = useState<number>(2);
    
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [timingError, setTimingError] = useState<string | null>(null);
    const [fetchCounter, setFetchCounter] = useState(0);

    const retryTiming = () => {
        if (!service?.id) return;
        setTimingError(null);
        setOccupiedSlots([]);
        setLoadingProgress(0);
        setIsLoadingAvailability(true);
        setFetchCounter(c => c + 1);
    };

    useEffect(() => {
        const fetchAvailability = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90_000);

            const progressTimer = setInterval(() => {
                setLoadingProgress((p) => Math.min(p + 1, 80));
            }, 900);

            try {
                setTimingError(null);
                const response = await api.get(`/requests/availability/${service.id}`, {
                    signal: controller.signal,
                });
                setOccupiedSlots(Array.isArray(response.data) ? response.data : []);
                setLoadingProgress(100);
            } catch (err: any) {
                console.error("Erreur chargement disponibilités:", err);
                if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
                    setTimingError(
                        "Temps d'attente dépassé. Le serveur est peut-être en cours de réveil (Cold Start Render Free - jusqu'à 50s). Veuillez réessayer."
                    );
                } else if (
                    typeof window !== 'undefined' &&
                    !navigator.onLine
                ) {
                    setTimingError("Aucune connexion internet. Vérifiez votre réseau.");
                } else if (
                    err?.message?.toLowerCase().includes('cors') ||
                    err?.message?.toLowerCase().includes('network') ||
                    !err?.response
                ) {
                    setTimingError("Problème de connexion au serveur. CORS ou réseau instable. Veuillez réessayer.");
                } else {
                    setTimingError(err?.response?.data?.message || "Erreur serveur. Veuillez réessayer.");
                }
                setOccupiedSlots([]);
            } finally {
                clearTimeout(timeoutId);
                clearInterval(progressTimer);
                setIsLoadingAvailability(false);
                setLoadingProgress((p) => (p < 100 ? 100 : p));
            }
        };

        if (service?.id) {
            fetchAvailability();
        }
    }, [service.id, fetchCounter]);

    const isSlotOccupied = (day: number, month: number, year: number, time: string) => {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}-${time}`;
        return occupiedSlots.includes(dateKey);
    };

    const months = useMemo(() => {
        const result = [];
        const now = new Date();
        for (let i = 0; i < 4; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            result.push({
                name: d.toLocaleString('fr-FR', { month: 'long' }),
                year: d.getFullYear(),
                month: d.getMonth(),
                label: d.toLocaleString('fr-FR', { month: 'short' }).toUpperCase()
            });
        }
        return result;
    }, []);

    const selectedMonth = months[selectedMonthIndex];

    const daysInMonth = useMemo(() => {
        const date = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
        const count = date.getDate();
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [selectedMonth]);

    const plans: PlanOption[] = [
        { id: "ONCE", label: "Une fois", desc: "Ponctuel", icon: <Zap className="w-5 h-5" />, badge: "Populaire" },
        { id: "WEEKLY", label: "Hebdo", desc: "1×/semaine", icon: <Calendar className="w-5 h-5" /> },
        { id: "MONTHLY", label: "Mensuel", desc: "1×/mois", icon: <Star className="w-5 h-5" /> },
    ];

    const getSteps = () => {
        if (frequency === "ONCE") {
            return ["freq", "date", "duration", "time", "summary"];
        } else if (frequency === "WEEKLY") {
            return ["freq", "dayOfWeek", "startDate", "duration", "time", "summary"];
        } else {
            return ["freq", "month", "dayOfMonth", "duration", "time", "summary"];
        }
    };

    const steps = getSteps();
    const currentStepId = steps[step];
    const isLastStep = step === steps.length - 1;

    const nextStep = () => {
        if (step < steps.length - 1) {
            setDirection(1);
            setStep(s => s + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(s => s - 1);
        }
    };

    const handleConfirm = () => {
        const fullDate = new Date(selectedMonth.year, selectedMonth.month, selectedDay);
        const dayLabel = fullDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        const weekday = fullDate.toLocaleDateString('fr-FR', { weekday: 'long' });

        onConfirm({
            frequency,
            day: frequency === "ONCE" ? `${selectedDay}` : (frequency === "WEEKLY" ? selectedDayOfWeek : `${selectedDay}`),
            time: selectedTime,
            duration,
            dateLabel: frequency === "WEEKLY" ? `Tous les ${selectedDayOfWeek}s` : frequency === "MONTHLY" ? `Le ${selectedDay} de chaque mois` : `${dayLabel} (${weekday})`,
            startDate: fullDate.toISOString()
        });
    };

    const selectedPlanLabel = plans.find(p => p.id === frequency)?.label ?? "";

    const renderStepContent = () => {
        switch (currentStepId) {
            case "freq":
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tighter">Comment souhaitez-vous programmer votre intervention ?</h3>
                            <p className="text-xs text-chocolat/50 mt-2">Choisissez la récurrence de votre service</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {plans.map((plan) => {
                                const active = frequency === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => {
                                            setFrequency(plan.id);
                                            setTimeout(nextStep, 300);
                                        }}
                                        className={`relative flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all duration-300 text-left ${active
                                            ? "border-chocolat bg-chocolat shadow-xl shadow-chocolat/20 scale-[1.02]"
                                            : "border-zinc-100 bg-white hover:border-ocre/30"
                                            }`}
                                    >
                                        <div className={`p-3 rounded-2xl ${active ? "bg-white/10 text-white" : "bg-ocre/5 text-ocre"}`}>
                                            {plan.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm sm:text-base font-black uppercase tracking-tight ${active ? "text-white" : "text-chocolat"}`}>
                                                {plan.label}
                                            </p>
                                            <p className={`text-[10px] sm:text-xs mt-0.5 ${active ? "text-white/70" : "text-chocolat/50"}`}>
                                                {plan.desc}
                                            </p>
                                        </div>
                                        {active && (
                                            <div className="shrink-0 w-6 h-6 bg-ocre rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-chocolat" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case "date":
            case "startDate":
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tighter">
                                {currentStepId === "startDate" ? "À partir de quand commence le service ?" : "Choisissez la date d'intervention"}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-chocolat uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">
                                    {selectedMonth.name} {selectedMonth.year}
                                </span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {months.map((m, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedMonthIndex(idx)}
                                        className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black transition-all border ${selectedMonthIndex === idx
                                            ? "bg-ocre border-ocre text-white shadow-md shadow-ocre/20"
                                            : "bg-white border-zinc-100 text-chocolat/40 hover:border-ocre/30"
                                            }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-zinc-50/50 border border-zinc-100 rounded-[32px] p-5">
                            <div className="grid grid-cols-7 gap-2">
                                {daysInMonth.map((day) => {
                                    const active = selectedDay === day;
                                    const daySlotsOccupied = HOURS.filter(h => isSlotOccupied(day, selectedMonth.month, selectedMonth.year, h)).length;
                                    const isFull = daySlotsOccupied >= 5;
                                    
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => !isFull && setSelectedDay(day)}
                                            disabled={isFull}
                                            className={`aspect-square flex flex-col items-center justify-center rounded-xl text-[11px] font-bold transition-all border relative ${active
                                                ? "bg-chocolat border-chocolat text-white shadow-lg"
                                                : isFull
                                                    ? "bg-red-50 border-red-100 text-red-500 cursor-not-allowed"
                                                    : "bg-white border-zinc-100 text-chocolat/60 hover:border-ocre/40"
                                                }`}
                                        >
                                            <span>{day}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <button
                            onClick={nextStep}
                            className="w-full mt-6 bg-chocolat text-white py-4 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all"
                        >
                            Continuer
                        </button>
                    </div>
                );

            case "dayOfWeek":
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tighter">Quel jour souhaitez-vous le service ?</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {DAYS_OF_WEEK.map((day) => {
                                const active = selectedDayOfWeek === day;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => {
                                            setSelectedDayOfWeek(day);
                                            setTimeout(nextStep, 300);
                                        }}
                                        className={`py-4 rounded-2xl text-[11px] font-black transition-all border ${active
                                            ? "bg-ocre border-ocre text-white shadow-md shadow-ocre/20"
                                            : "bg-white border-zinc-100 text-chocolat/60 hover:border-ocre/40 hover:text-chocolat"
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case "month":
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tighter">Quel mois souhaitez-vous programmer ?</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {months.map((m, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedMonthIndex(idx);
                                        setTimeout(nextStep, 300);
                                    }}
                                    className={`py-4 rounded-2xl text-[11px] font-black transition-all border ${selectedMonthIndex === idx
                                        ? "bg-ocre border-ocre text-white shadow-md shadow-ocre/20"
                                        : "bg-white border-zinc-100 text-chocolat/60 hover:border-ocre/40 hover:text-chocolat"
                                        }`}
                                >
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case "dayOfMonth":
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tighter">Quel jour du mois ?</h3>
                        </div>
                        <div className="bg-zinc-50/50 border border-zinc-100 rounded-[32px] p-5">
                            <div className="grid grid-cols-7 gap-2">
                                {daysInMonth.map((day) => {
                                    const active = selectedDay === day;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                setSelectedDay(day);
                                            }}
                                            className={`aspect-square flex flex-col items-center justify-center rounded-xl text-[11px] font-bold transition-all border relative ${active
                                                ? "bg-chocolat border-chocolat text-white shadow-lg"
                                                : "bg-white border-zinc-100 text-chocolat/60 hover:border-ocre/40"
                                                }`}
                                        >
                                            <span>{day}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <button
                            onClick={nextStep}
                            className="w-full mt-6 bg-chocolat text-white py-4 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all"
                        >
                            Continuer
                        </button>
                    </div>
                );

            case "duration":
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tighter">Quelle est la durée prévue ?</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3, 4, 8].map((h) => {
                                const active = duration === h;
                                const label = h === 4 ? "Demi-journée (4h)" : h === 8 ? "Journée complète (8h)" : `${h} heure${h > 1 ? 's' : ''}`;
                                return (
                                    <button
                                        key={h}
                                        onClick={() => {
                                            setDuration(h);
                                            setTimeout(nextStep, 300);
                                        }}
                                        className={`py-4 rounded-2xl text-[11px] font-black transition-all border ${active
                                            ? "bg-ocre border-ocre text-white shadow-md shadow-ocre/20"
                                            : "bg-white border-zinc-100 text-chocolat/60 hover:border-ocre/40 hover:text-chocolat"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case "time":
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tighter">Choisissez votre créneau</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-chocolat/40 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Zap className="w-3 h-3 text-ocre" /> Matin</p>
                                <div className="flex flex-col gap-2">
                                    {HOURS.filter(h => parseInt(h) < 13).map((time) => {
                                        const isOccupied = isSlotOccupied(selectedDay, selectedMonth.month, selectedMonth.year, time);
                                        const active = selectedTime === time;
                                        return (
                                            <button
                                                key={time}
                                                disabled={isOccupied}
                                                onClick={() => {
                                                    setSelectedTime(time);
                                                    setTimeout(nextStep, 300);
                                                }}
                                                className={`py-3.5 rounded-2xl text-[11px] font-black transition-all border relative overflow-hidden ${active
                                                    ? "bg-ocre border-ocre text-white shadow-md shadow-ocre/20"
                                                    : isOccupied 
                                                        ? "bg-zinc-100 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                                        : "bg-white border-zinc-100 text-chocolat/60 hover:border-ocre/40 hover:text-chocolat"
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-chocolat/40 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Star className="w-3 h-3 text-ocre" /> Après-midi</p>
                                <div className="flex flex-col gap-2">
                                    {HOURS.filter(h => parseInt(h) >= 13).map((time) => {
                                        const isOccupied = isSlotOccupied(selectedDay, selectedMonth.month, selectedMonth.year, time);
                                        const active = selectedTime === time;
                                        return (
                                            <button
                                                key={time}
                                                disabled={isOccupied}
                                                onClick={() => {
                                                    setSelectedTime(time);
                                                    setTimeout(nextStep, 300);
                                                }}
                                                className={`py-3.5 rounded-2xl text-[11px] font-black transition-all border relative overflow-hidden ${active
                                                    ? "bg-ocre border-ocre text-white shadow-md shadow-ocre/20"
                                                    : isOccupied 
                                                        ? "bg-zinc-100 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                                        : "bg-white border-zinc-100 text-chocolat/60 hover:border-ocre/40 hover:text-chocolat"
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "summary":
                const fullDate = new Date(selectedMonth.year, selectedMonth.month, selectedDay);
                const dayLabel = fullDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
                const weekday = fullDate.toLocaleDateString('fr-FR', { weekday: 'long' });
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-chocolat uppercase tracking-tighter">Résumé de votre intervention</h3>
                        </div>
                        <div className="bg-zinc-50 border border-zinc-100 rounded-[32px] p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-200/50 pb-4">
                                <span className="text-[10px] font-bold text-chocolat/50 uppercase tracking-widest">Fréquence</span>
                                <span className="text-xs font-black text-chocolat uppercase tracking-wide">{selectedPlanLabel}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-200/50 pb-4">
                                <span className="text-[10px] font-bold text-chocolat/50 uppercase tracking-widest">Date / Jour</span>
                                <span className="text-xs font-black text-chocolat uppercase tracking-wide">
                                    {frequency === "WEEKLY" ? `Tous les ${selectedDayOfWeek}s` : frequency === "MONTHLY" ? `Le ${selectedDay} de chaque mois` : `${dayLabel} (${weekday})`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-200/50 pb-4">
                                <span className="text-[10px] font-bold text-chocolat/50 uppercase tracking-widest">Durée</span>
                                <span className="text-xs font-black text-chocolat uppercase tracking-wide">{duration} heure{duration > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-chocolat/50 uppercase tracking-widest">Horaire</span>
                                <span className="text-xs font-black text-chocolat uppercase tracking-wide">{selectedTime} - {parseInt(selectedTime) + duration}:00</span>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <button
                                onClick={handleConfirm}
                                className="w-full bg-chocolat text-white py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-4 shadow-2xl shadow-chocolat/20 group active:scale-[0.98]"
                            >
                                Confirmer
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-chocolat/90 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh] overflow-hidden relative"
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-4 pb-2 sm:hidden shrink-0 absolute top-0 w-full z-20 bg-white">
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
                </div>

                {/* ─── Header ─── */}
                <div className="px-6 pt-10 pb-5 sm:px-10 sm:pt-10 flex flex-col gap-4 shrink-0 border-b border-zinc-100 z-10 bg-white">
                    <div className="flex items-center justify-between">
                        {step > 0 ? (
                            <button
                                onClick={prevStep}
                                className="shrink-0 p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all active:scale-90 border border-zinc-100"
                            >
                                <ArrowLeft className="w-4 h-4 text-chocolat" />
                            </button>
                        ) : (
                            <div className="w-[46px]" /> // Placeholder to keep center alignment
                        )}
                        
                        <div className="flex items-center gap-2 bg-ocre/10 px-4 py-1.5 rounded-full border border-ocre/20">
                            <span className="text-ocre text-[9px] font-black uppercase tracking-[0.2em]">
                                Planifier le passage
                            </span>
                        </div>

                        <button
                            onClick={onClose}
                            className="shrink-0 p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all active:scale-90 border border-zinc-100"
                        >
                            <X className="w-4 h-4 text-chocolat" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <motion.div
                            className="h-full bg-ocre rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                                width: isLoadingAvailability
                                    ? `${loadingProgress}%`
                                    : timingError
                                        ? '0%'
                                        : `${((step + 1) / steps.length) * 100}%`
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* ─── Body ─── */}
                <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar relative bg-white">
                    {isLoadingAvailability ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-5 px-8">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-ocre animate-spin" />
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-ocre/70">
                                    {loadingProgress}%
                                </span>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-sm text-chocolat/60 font-bold">Chargement du planning...</p>
                                {loadingProgress > 25 && loadingProgress < 85 && (
                                    <p className="text-xs text-chocolat/40 font-medium max-w-xs leading-relaxed">
                                        Le serveur se réveille (Cold Start Render Free). Cela peut prendre 30 à 60 secondes à la première requête.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : timingError ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-6 px-8">
                            <AlertCircle className="w-14 h-14 text-red-300" />
                            <div className="text-center space-y-2 max-w-sm">
                                <p className="text-[11px] font-black text-chocolat/80 uppercase tracking-wider">Oups !</p>
                                <p className="text-sm text-red-500 font-bold leading-relaxed">{timingError}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={retryTiming}
                                    className="flex items-center gap-2 bg-chocolat text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all active:scale-95 shadow-lg"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Réessayer
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-2 border-2 border-zinc-200 text-chocolat/60 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-zinc-300 hover:text-chocolat transition-all active:scale-95"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    ) : months.length === 0 || daysInMonth.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-6 px-12 text-center">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-amber-400 opacity-70" />
                            </div>
                            <div className="space-y-2 max-w-sm">
                                <p className="text-lg font-black text-chocolat uppercase tracking-tight mb-2">
                                    Aucun créneau disponible
                                </p>
                                <p className="text-sm text-chocolat/40 font-medium leading-relaxed">
                                    Impossible de générer le planning des 4 prochains mois. Réessayez.
                                </p>
                            </div>
                            <button
                                onClick={retryTiming}
                                className="flex items-center gap-2 bg-chocolat text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-ocre hover:text-chocolat transition-all active:scale-95 shadow-lg"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Réessayer
                            </button>
                        </div>
                    ) : (
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="relative w-full min-h-full shrink-0 px-6 py-6 sm:px-10 sm:py-8 overflow-y-auto custom-scrollbar"
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
