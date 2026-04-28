"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Check, ArrowRight, Zap, Star } from "lucide-react";
import { Service } from "./ServiceExplorer";

interface TimingProps {
    service: Service;
    onClose: () => void;
    onConfirm: (plan: any) => void;
}

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY";

interface PlanOption {
    id: Frequency;
    label: string;
    desc: string;
    priceMultiplier: number;
    icon: ReactNode;
}

export default function Timing({ service, onClose, onConfirm }: TimingProps) {
    const [frequency, setFrequency] = useState<Frequency>("WEEKLY");
    const [selectedDay, setSelectedDay] = useState<string>("Lun");
    const [selectedTime, setSelectedTime] = useState("09:00");

    const plans: PlanOption[] = [
        {
            id: "DAILY",
            label: "Quotidien",
            desc: "Tous les jours",
            priceMultiplier: 0.9,
            icon: <Zap className="w-4 h-4" />,
        },
        {
            id: "WEEKLY",
            label: "Hebdo",
            desc: "Par semaine",
            priceMultiplier: 0.85,
            icon: <Calendar className="w-4 h-4" />,
        },
        {
            id: "MONTHLY",
            label: "Mensuel",
            desc: "Par mois",
            priceMultiplier: 0.8,
            icon: <Star className="w-4 h-4" />,
        },
    ];

    const handleConfirm = () => {
        onConfirm({
            frequency,
            day: frequency === "DAILY" ? "Tous les jours" : selectedDay,
            time: selectedTime,
        });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-chocolat/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[40px] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
            >
                {/* Header decoration */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-ocre via-chocolat to-ocre"></div>

                {/* Fixed Header */}
                <div className="p-6 sm:p-8 pb-4 flex justify-between items-start border-b border-zinc-50 bg-white z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-ocre/10 text-ocre px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-ocre/20">
                                Offre Premium
                            </span>
                            <div className="flex -space-x-1">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-3.5 h-3.5 rounded-full bg-ocre border border-white flex items-center justify-center shadow-sm">
                                        <Star className="w-2 h-2 text-white fill-current" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-chocolat uppercase tracking-tight leading-none">
                            Planifiez votre service
                        </h2>
                        <p className="text-chocolat/40 text-[10px] sm:text-xs font-bold mt-1.5 uppercase tracking-wide">
                            {service.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-all border border-zinc-100 shadow-sm hover:scale-105 active:scale-95"
                    >
                        <X className="w-4 h-4 text-chocolat" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 py-4 space-y-6 scrollbar-hide">
                    {/* Frequency selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-chocolat/30 uppercase tracking-[0.2em] ml-1">
                            Abonnement
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setFrequency(plan.id)}
                                    className={`relative p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 ${frequency === plan.id
                                        ? "border-chocolat bg-chocolat text-white shadow-lg scale-105 z-10"
                                        : "border-zinc-100 bg-[#FCFBF7] hover:border-ocre/30 text-chocolat"
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${frequency === plan.id ? "bg-white/10" : "bg-white shadow-sm"}`}>
                                        <div className={frequency === plan.id ? "text-white" : "text-ocre"}>
                                            {plan.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tight leading-none">
                                            {plan.label}
                                        </p>
                                        <p className={`text-[8px] font-bold mt-1 opacity-60`}>
                                            {plan.desc}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Combined Selection Area */}
                    <div className="space-y-4">
                        {/* Day Selection (Only for Weekly/Monthly) */}
                        <AnimatePresence mode="wait">
                            {frequency !== "DAILY" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    className="bg-zinc-50/50 border border-zinc-100 rounded-[24px] p-5"
                                >
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-zinc-100">
                                            <Calendar className="w-3.5 h-3.5 text-ocre" />
                                        </div>
                                        <label className="text-[10px] font-black text-chocolat/40 uppercase tracking-widest">
                                            {frequency === "WEEKLY" ? "Jour de passage" : "Date du mois"}
                                        </label>
                                    </div>

                                    <div className={`grid gap-1.5 ${frequency === "WEEKLY" ? "grid-cols-4 sm:grid-cols-7" : "grid-cols-7 sm:grid-cols-10"}`}>
                                        {frequency === "WEEKLY" ? (
                                            ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dimanche"].map((day) => (
                                                <button
                                                    key={day}
                                                    onClick={() => setSelectedDay(day)}
                                                    className={`py-2 rounded-xl text-[9px] font-black transition-all border ${selectedDay === day
                                                        ? "bg-ocre border-ocre text-chocolat shadow-md"
                                                        : "bg-white border-zinc-200 text-chocolat/40 hover:border-ocre hover:text-chocolat"
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))
                                        ) : (
                                            Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map((day) => (
                                                <button
                                                    key={day}
                                                    onClick={() => setSelectedDay(day)}
                                                    className={`py-1.5 rounded-lg text-[8px] font-black transition-all border ${selectedDay === day
                                                        ? "bg-ocre border-ocre text-chocolat shadow-md"
                                                        : "bg-white border-zinc-200 text-chocolat/40 hover:border-ocre hover:text-chocolat"
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Hour Selection (Always shown) */}
                        <div className="bg-zinc-50/50 border border-zinc-100 rounded-[24px] p-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-zinc-100">
                                    <Clock className="w-3.5 h-3.5 text-ocre" />
                                </div>
                                <label className="text-[10px] font-black text-chocolat/40 uppercase tracking-widest">
                                    Heure de passage
                                </label>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                                {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 rounded-xl text-[9px] font-black transition-all border ${selectedTime === time
                                            ? "bg-ocre border-ocre text-chocolat shadow-md"
                                            : "bg-white border-zinc-200 text-chocolat/40 hover:border-ocre hover:text-chocolat"
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="p-6 sm:p-8 pt-4 bg-white border-t border-zinc-50">
                    <p className="text-[8px] font-bold text-chocolat/30 italic flex items-center gap-2 mb-4 justify-center uppercase tracking-wider">
                        <Zap className="w-3 h-3 text-ocre" /> Priorité Premium Activée • Planning Garanti
                    </p>
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-chocolat text-white py-5 rounded-[20px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-4 shadow-2xl group"
                    >
                        Valider mon planning <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
