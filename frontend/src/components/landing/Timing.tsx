"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Calendar, Clock, Check, ArrowRight,
    Zap, Star, ChevronRight
} from "lucide-react";
import { Service } from "./ServiceExplorer";

interface TimingProps {
    service: Service;
    onClose: () => void;
    onConfirm: (plan: SchedulePlan) => void;
}

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY";

interface SchedulePlan {
    frequency: Frequency;
    day: string;
    time: string;
}

interface PlanOption {
    id: Frequency;
    label: string;
    desc: string;
    icon: ReactNode;
    badge?: string;
}

const DAYS_OF_WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const MONTHLY_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export default function Timing({ service, onClose, onConfirm }: TimingProps) {
    const [frequency, setFrequency] = useState<Frequency>("WEEKLY");
    const [selectedDay, setSelectedDay] = useState<string>("Lun");
    const [selectedTime, setSelectedTime] = useState("09:00");

    const plans: PlanOption[] = [
        {
            id: "DAILY",
            label: "Quotidien",
            desc: "Chaque jour",
            icon: <Zap className="w-5 h-5" />,
        },
        {
            id: "WEEKLY",
            label: "Hebdo",
            desc: "1×/semaine",
            icon: <Calendar className="w-5 h-5" />,
            badge: "Populaire",
        },
        {
            id: "MONTHLY",
            label: "Mensuel",
            desc: "1×/mois",
            icon: <Star className="w-5 h-5" />,
        },
    ];

    const handleFrequencyChange = (newFreq: Frequency) => {
        setFrequency(newFreq);
        // Reset day selection to a valid default
        if (newFreq === "WEEKLY") setSelectedDay("Lun");
        if (newFreq === "MONTHLY") setSelectedDay("1");
    };

    const handleConfirm = () => {
        onConfirm({
            frequency,
            day: frequency === "DAILY" ? "Tous les jours" : selectedDay,
            time: selectedTime,
        });
    };

    const selectedPlanLabel = plans.find(p => p.id === frequency)?.label ?? "";

    return (
        <div
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-chocolat/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                    <div className="w-10 h-1 bg-zinc-200 rounded-full" />
                </div>

                {/* Gradient accent */}
                <div className="hidden sm:block absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ocre via-chocolat to-ocre rounded-t-[32px]" />

                {/* ─── Header ─── */}
                <div className="px-5 pt-4 pb-4 sm:px-8 sm:pt-7 flex items-start justify-between gap-4 shrink-0 border-b border-zinc-100">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-ocre/10 text-ocre px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-ocre/15">
                                Offre Premium
                            </span>
                            <div className="flex -space-x-1">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-3.5 h-3.5 rounded-full bg-ocre border border-white flex items-center justify-center">
                                        <Star className="w-1.5 h-1.5 text-white fill-current" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <h2 className="text-lg sm:text-2xl font-black text-chocolat uppercase tracking-tight leading-tight">
                            Planifier le service
                        </h2>
                        <p className="text-[10px] font-bold text-chocolat/40 uppercase tracking-wider mt-0.5 truncate">
                            {service.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all active:scale-95"
                    >
                        <X className="w-4 h-4 text-chocolat" />
                    </button>
                </div>

                {/* ─── Scrollable body ─── */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6 space-y-5">

                    {/* Frequency Picker */}
                    <div>
                        <p className="text-[9px] font-black text-chocolat/30 uppercase tracking-[0.2em] mb-3">
                            Fréquence d'intervention
                        </p>
                        <div className="grid grid-cols-3 gap-2.5">
                            {plans.map((plan) => {
                                const active = frequency === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => handleFrequencyChange(plan.id)}
                                        className={`relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${active
                                            ? "border-chocolat bg-chocolat shadow-lg"
                                            : "border-zinc-100 bg-zinc-50 hover:border-ocre/40"
                                            }`}
                                    >
                                        {plan.badge && !active && (
                                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-ocre text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {plan.badge}
                                            </span>
                                        )}
                                        <div className={`p-2 rounded-xl ${active ? "bg-white/15" : "bg-white shadow-sm"}`}>
                                            <div className={active ? "text-white" : "text-ocre"}>
                                                {plan.icon}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-[11px] font-black uppercase tracking-tight ${active ? "text-white" : "text-chocolat"}`}>
                                                {plan.label}
                                            </p>
                                            <p className={`text-[9px] font-bold mt-0.5 ${active ? "text-white/60" : "text-chocolat/40"}`}>
                                                {plan.desc}
                                            </p>
                                        </div>
                                        {active && (
                                            <div className="absolute top-2.5 right-2.5">
                                                <Check className="w-3.5 h-3.5 text-ocre" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Day Picker (Weekly / Monthly only) */}
                    <AnimatePresence mode="popLayout">
                        {frequency !== "DAILY" && (
                            <motion.div
                                key={frequency}
                                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                                transition={{ duration: 0.18 }}
                                className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-3.5 h-3.5 text-ocre" />
                                    <p className="text-[9px] font-black text-chocolat/40 uppercase tracking-widest">
                                        {frequency === "WEEKLY" ? "Jour de passage" : "Date du mois"}
                                    </p>
                                </div>

                                {frequency === "WEEKLY" ? (
                                    <div className="grid grid-cols-7 gap-1.5">
                                        {DAYS_OF_WEEK.map((day) => (
                                            <button
                                                key={day}
                                                onClick={() => setSelectedDay(day)}
                                                className={`py-2.5 rounded-xl text-[9px] font-black transition-all border active:scale-95 ${selectedDay === day
                                                    ? "bg-ocre border-ocre text-white shadow-sm"
                                                    : "bg-white border-zinc-200 text-chocolat/50 hover:border-ocre/40 hover:text-chocolat"
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-7 gap-1.5">
                                        {MONTHLY_DAYS.map((day) => (
                                            <button
                                                key={day}
                                                onClick={() => setSelectedDay(day)}
                                                className={`py-2 rounded-lg text-[9px] font-black transition-all border active:scale-95 ${selectedDay === day
                                                    ? "bg-ocre border-ocre text-white shadow-sm"
                                                    : "bg-white border-zinc-200 text-chocolat/50 hover:border-ocre/40"
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hour Picker */}
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-3.5 h-3.5 text-ocre" />
                            <p className="text-[9px] font-black text-chocolat/40 uppercase tracking-widest">
                                Heure de passage
                            </p>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                            {HOURS.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-2.5 rounded-xl text-[9px] font-black transition-all border active:scale-95 ${selectedTime === time
                                        ? "bg-ocre border-ocre text-white shadow-sm"
                                        : "bg-white border-zinc-200 text-chocolat/50 hover:border-ocre/40 hover:text-chocolat"
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary chip */}
                    <div className="flex items-center gap-2 px-1">
                        <Zap className="w-3 h-3 text-ocre shrink-0" />
                        <p className="text-[9px] font-bold text-chocolat/30 italic uppercase tracking-wider">
                            Priorité premium • interventions garanties
                        </p>
                    </div>
                </div>

                {/* ─── Footer ─── */}
                <div className="shrink-0 px-5 pb-6 pt-3 sm:px-8 sm:pb-8 border-t border-zinc-100 bg-white">
                    {/* Selected summary */}
                    <div className="flex items-center gap-3 mb-4 bg-chocolat/[0.04] rounded-2xl px-4 py-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-chocolat/40 uppercase tracking-widest mb-0.5">Planning sélectionné</p>
                            <p className="text-[11px] font-black text-chocolat uppercase tracking-tight truncate">
                                {selectedPlanLabel}
                                {frequency !== "DAILY" && ` · ${selectedDay}`}
                                {` · ${selectedTime}`}
                            </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-chocolat/30 shrink-0" />
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-chocolat text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-3 shadow-lg group active:scale-[0.98]"
                    >
                        Confirmer le planning
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
