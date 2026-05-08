"use client";

import { useState, ReactNode, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Calendar, Clock, Check, ArrowRight,
    Zap, Star, ChevronRight, ChevronLeft, MapPin
} from "lucide-react";
import { Service } from "./ServiceExplorer";
import { toast } from "sonner";
import api from "@/lib/api";

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

export default function Timing({ service, onClose, onConfirm }: TimingProps) {
    const [frequency, setFrequency] = useState<Frequency>("ONCE");
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
    const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
    const [selectedTime, setSelectedTime] = useState("09:00");
    const [duration, setDuration] = useState<number>(2);
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

    // Récupérer les disponibilités réelles depuis le backend
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                setIsLoadingAvailability(true);
                const response = await api.get(`/requests/availability/${service.id}`);
                setOccupiedSlots(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Erreur chargement disponibilités:", err);
                // On garde une liste vide en cas d'erreur
            } finally {
                setIsLoadingAvailability(false);
            }
        };

        if (service?.id) {
            fetchAvailability();
        }
    }, [service.id]);

    const isSlotOccupied = (day: number, month: number, year: number, time: string) => {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}-${time}`;
        return occupiedSlots.includes(dateKey);
    };

    // Generate next 4 months
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

    // Days in the selected month
    const daysInMonth = useMemo(() => {
        const date = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
        const count = date.getDate();
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [selectedMonth]);

    const plans: PlanOption[] = [
        {
            id: "ONCE",
            label: "Une fois",
            desc: "Ponctuel",
            icon: <Zap className="w-5 h-5" />,
            badge: "Populaire",
        },
        {
            id: "WEEKLY",
            label: "Hebdo",
            desc: "1×/semaine",
            icon: <Calendar className="w-5 h-5" />,
        },
        {
            id: "MONTHLY",
            label: "Mensuel",
            desc: "1×/mois",
            icon: <Star className="w-5 h-5" />,
        },
    ];
    const handleConfirm = () => {
        const fullDate = new Date(selectedMonth.year, selectedMonth.month, selectedDay);
        const dayLabel = fullDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        const weekday = fullDate.toLocaleDateString('fr-FR', { weekday: 'long' });

        onConfirm({
            frequency,
            day: frequency === "ONCE" ? `${selectedDay}` : (frequency === "WEEKLY" ? weekday : `${selectedDay}`),
            time: selectedTime,
            duration,
            dateLabel: `${dayLabel} (${weekday})`,
            startDate: fullDate.toISOString()
        });
    };

    const selectedPlanLabel = plans.find(p => p.id === frequency)?.label ?? "";

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
                className="bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-4 pb-2 sm:hidden shrink-0">
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
                </div>

                {/* ─── Header ─── */}
                <div className="px-6 pt-2 pb-5 sm:px-10 sm:pt-10 flex items-start justify-between gap-4 shrink-0 border-b border-zinc-100">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-ocre/10 text-ocre px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-ocre/20">
                                Expérience Premium
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-3xl font-black text-chocolat uppercase tracking-tighter leading-tight">
                            Planifier le <span className="text-ocre italic font-serif lowercase">passage.</span>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all active:scale-90 border border-zinc-100"
                    >
                        <X className="w-5 h-5 text-chocolat" />
                    </button>
                </div>

                {/* ─── Body ─── */}
                <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar px-6 py-6 sm:px-10 sm:py-8 space-y-8">

                    {/* Frequency Picker */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-ocre" />
                            <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-[0.2em]">
                                Fréquence de service
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {plans.map((plan) => {
                                const active = frequency === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setFrequency(plan.id)}
                                        className={`relative flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all duration-300 ${active
                                            ? "border-chocolat bg-chocolat shadow-xl shadow-chocolat/20 scale-[1.02]"
                                            : "border-zinc-100 bg-white hover:border-ocre/30"
                                            }`}
                                    >
                                        <div className={`p-2.5 rounded-2xl ${active ? "bg-white/10" : "bg-ocre/5 text-ocre"}`}>
                                            {plan.icon}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-[11px] font-black uppercase tracking-tight ${active ? "text-white" : "text-chocolat"}`}>
                                                {plan.label}
                                            </p>
                                        </div>
                                        {active && (
                                            <div className="absolute top-3 right-3">
                                                <div className="w-4 h-4 bg-ocre rounded-full flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-chocolat" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date Selector (Month + Day) */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* Month Picker */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-ocre" />
                                        <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-[0.2em]">
                                            Choisir le mois
                                        </p>
                                    </div>
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

                            {/* Day Grid */}
                            <div className="bg-zinc-50/50 border border-zinc-100 rounded-[32px] p-5 sm:p-6">
                                <p className="text-[9px] font-black text-chocolat/30 uppercase tracking-[0.2em] mb-4 text-center">
                                    Date de passage souhaitée
                                </p>
                                <div className="grid grid-cols-7 gap-2">
                                    {daysInMonth.map((day) => {
                                        const active = selectedDay === day;
                                        // Calculer si le jour est très occupé (ex: plus de 3 créneaux pris)
                                        const daySlotsOccupied = HOURS.filter(h => isSlotOccupied(day, selectedMonth.month, selectedMonth.year, h)).length;
                                        const isFull = daySlotsOccupied >= 5;
                                        const isBusy = daySlotsOccupied > 0 && daySlotsOccupied < 5;

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
                                                {!active && !isFull && isBusy && (
                                                    <div className="flex gap-0.5 mt-0.5">
                                                        <div className="w-1 h-1 rounded-full bg-orange-400" />
                                                    </div>
                                                )}
                                                {isFull && (
                                                    <div className="absolute top-1 right-1">
                                                        <div className="w-1 h-1 rounded-full bg-red-500" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Légende de disponibilité */}
                                <div className="mt-4 flex items-center justify-center gap-4 px-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                        <span className="text-[8px] font-bold text-chocolat/40 uppercase tracking-widest">Chargé</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-[8px] font-bold text-chocolat/40 uppercase tracking-widest">Complet</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Duration Picker */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-ocre" />
                            <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-[0.2em]">
                                Durée de l'intervention
                            </p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {[1, 2, 3, 4, 5, 8].map((h) => (
                                <button
                                    key={h}
                                    onClick={() => setDuration(h)}
                                    className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black transition-all border ${duration === h
                                        ? "bg-ocre border-ocre text-white shadow-md shadow-ocre/20"
                                        : "bg-white border-zinc-100 text-chocolat/50 hover:border-ocre/40 hover:text-chocolat"
                                        }`}
                                >
                                    {h} {h === 1 ? 'heure' : 'heures'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hour Picker */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-ocre" />
                            <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-[0.2em]">
                                Créneau horaire
                            </p>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {HOURS.map((time) => {
                                const isOccupied = isSlotOccupied(selectedDay, selectedMonth.month, selectedMonth.year, time);
                                return (
                                    <button
                                        key={time}
                                        disabled={isOccupied}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-3.5 rounded-2xl text-[10px] font-black transition-all border relative overflow-hidden ${selectedTime === time
                                            ? "bg-ocre border-ocre text-white shadow-md shadow-ocre/20"
                                            : isOccupied 
                                                ? "bg-zinc-100 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                                : "bg-white border-zinc-100 text-chocolat/50 hover:border-ocre/40 hover:text-chocolat"
                                            }`}
                                    >
                                        {time}
                                        {isOccupied && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                                <div className="w-full h-[1px] bg-red-500 rotate-12"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ─── Footer ─── */}
                <div className="shrink-0 px-6 pb-8 pt-4 sm:px-10 sm:pb-10 border-t border-zinc-100 bg-white">
                    {/* Selected summary */}
                    <div className="flex items-center gap-4 mb-6 bg-off-white rounded-[24px] px-5 py-4 border border-ocre/10">
                        <div className="w-10 h-10 rounded-full bg-ocre/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-ocre" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-chocolat/30 uppercase tracking-[0.2em] mb-0.5">Planning finalisé</p>
                            <p className="text-[13px] font-black text-chocolat uppercase tracking-tight truncate">
                                {selectedPlanLabel}
                                {` • ${selectedDay} ${selectedMonth.name}`}
                                {` • ${selectedTime} (${duration}h)`}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-chocolat text-white py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-4 shadow-2xl shadow-chocolat/20 group active:scale-[0.98]"
                    >
                        Confirmer le planning
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
