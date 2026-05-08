"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, X, Loader2, Users, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Slot {
  time: string;
  availableProviders: number;
  available: boolean;
  reason?: string;
}

interface Day {
  date: string;
  dayName: string;
  isToday: boolean;
  isSunday: boolean;
  isWeekend: boolean;
  slots: Slot[];
}

interface Week {
  weekNumber: number;
  label: string;
  days: Day[];
}

interface PooledCalendarData {
  serviceId: string;
  serviceName: string;
  totalProviders: number;
  window: { from: string; to: string };
  timeSlots: string[];
  weeks: Week[];
}

interface SelectedSlot {
  date: string;
  dayName: string;
  time: string;
}

interface PooledCalendarProps {
  serviceId: string;
  onClose: () => void;
  onConfirm: (slot: SelectedSlot) => void;
}

export default function PooledCalendar({ serviceId, onClose, onConfirm }: PooledCalendarProps) {
  const [data, setData] = useState<PooledCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [selected, setSelected] = useState<SelectedSlot | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get(`/requests/availability/pooled/${serviceId}`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Impossible de charger les disponibilités.");
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [serviceId]);

  const currentWeek = data?.weeks[currentWeekIndex];
  const totalWeeks = data?.weeks.length ?? 0;

  const handleSlotClick = (day: Day, slot: Slot) => {
    if (!slot.available) return;
    setSelected({ date: day.date, dayName: day.dayName, time: slot.time });
  };

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#321B13]/70 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-8 pt-8 pb-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#BC9C6C]" />
              <span className="text-[10px] font-black text-[#BC9C6C] uppercase tracking-[0.3em]">
                Disponibilités
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#321B13] tracking-tighter">
              Choisir un créneau
            </h2>
            {data && (
              <p className="text-xs text-[#321B13]/40 mt-1 font-medium">
                {data.totalProviders > 0
                  ? `${data.totalProviders} prestataire${data.totalProviders > 1 ? "s" : ""} disponibles`
                  : "Aucun prestataire disponible actuellement"}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-[#321B13] transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-[#BC9C6C] animate-spin" />
              <p className="text-sm text-[#321B13]/40 font-medium">Calcul des disponibilités...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 px-8">
              <AlertCircle className="w-12 h-12 text-red-300" />
              <p className="text-sm text-red-400 font-bold text-center">{error}</p>
            </div>
          ) : data && data.totalProviders === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 px-12 text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-amber-400 opacity-50" />
              </div>
              <div>
                <p className="text-lg font-black text-[#321B13] uppercase tracking-tight mb-2">
                  Service momentanément indisponible
                </p>
                <p className="text-sm text-[#321B13]/40 font-medium leading-relaxed">
                  Nous n'avons pas encore de prestataires actifs assignés à ce service dans votre zone. 
                  Revenez plus tard ou contactez le support.
                </p>
              </div>
            </div>
          ) : data && currentWeek ? (
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setCurrentWeekIndex((i) => Math.max(0, i - 1))}
                  disabled={currentWeekIndex === 0}
                  className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 text-[#321B13]" />
                </button>

                <div className="text-center">
                  <p className="text-[9px] font-black text-[#321B13]/30 uppercase tracking-[0.3em] mb-1">
                    Semaine {currentWeek.weekNumber} / {totalWeeks}
                  </p>
                  <p className="text-base font-black text-[#321B13] tracking-tight">
                    {currentWeek.label}
                  </p>
                </div>

                <button
                  onClick={() => setCurrentWeekIndex((i) => Math.min(totalWeeks - 1, i + 1))}
                  disabled={currentWeekIndex >= totalWeeks - 1}
                  className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 text-[#321B13]" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-6">
                {currentWeek.days.map((day) => {
                  const isSelected = selected?.date === day.date;
                  const hasAvailableSlot = day.slots.some((s) => s.available);

                  return (
                    <div
                      key={day.date}
                      className={`flex flex-col items-center gap-1 ${day.isSunday ? "opacity-30" : ""}`}
                    >
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest ${
                          day.isToday ? "text-[#BC9C6C]" : "text-[#321B13]/40"
                        }`}
                      >
                        {day.dayName.slice(0, 3)}
                      </span>

                      <span
                        className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                          day.isToday
                            ? "bg-[#BC9C6C] text-white"
                            : day.isSunday 
                              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                              : "text-[#321B13]/70"
                        } ${isSelected ? "ring-2 ring-[#321B13]" : ""}`}
                      >
                        {new Date(day.date).getDate()}
                      </span>

                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          day.isSunday 
                            ? "bg-zinc-200" 
                            : (hasAvailableSlot ? "bg-emerald-400" : "bg-zinc-200")
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWeekIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {currentWeek.days.map((day) => {
                    if (day.isSunday) return null;
                    const availableSlots = day.slots.filter((s) => s.available);

                    return (
                      <div key={day.date}>
                        <div className="flex items-center gap-3 mb-3">
                          <p className="text-xs font-black text-[#321B13] uppercase tracking-widest">
                            {day.dayName}
                            {day.isToday && (
                              <span className="ml-2 text-[9px] font-bold text-[#BC9C6C] normal-case tracking-normal">
                                Aujourd'hui
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#321B13]/30 font-medium">
                            {formatDate(day.date)}
                          </p>
                          <div className="flex-1 h-px bg-zinc-100" />
                        </div>

                        {availableSlots.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {availableSlots.map((slot) => {
                              const isSlotSelected =
                                selected?.date === day.date && selected?.time === slot.time;

                              return (
                                <motion.button
                                  key={slot.time}
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleSlotClick(day, slot)}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${
                                    isSlotSelected
                                      ? "bg-[#321B13] border-[#321B13] text-white shadow-lg shadow-[#321B13]/20"
                                      : "bg-white border-zinc-200 text-[#321B13] hover:border-[#BC9C6C] hover:bg-[#BC9C6C]/5"
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  {slot.time}
                                  {isSlotSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
                                </motion.button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-zinc-50 border border-dashed border-zinc-100 rounded-xl p-3 mb-6 flex items-center justify-center">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                              Aucun créneau disponible pour ce jour
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!currentWeek.days.some(
                    (d) => !d.isWeekend && d.slots.some((s) => s.available)
                  ) && (
                    <div className="text-center py-12 text-[#321B13]/30">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-black uppercase tracking-widest">
                        Aucun créneau disponible cette semaine
                      </p>
                      <p className="text-xs mt-1">
                        Essayez la semaine suivante
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : null}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-8 py-6 border-t border-zinc-100 bg-white shrink-0"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black text-[#BC9C6C] uppercase tracking-[0.3em] mb-1">
                    Créneau sélectionné
                  </p>
                  <p className="text-lg font-black text-[#321B13] tracking-tight">
                    {selected.dayName} {formatDate(selected.date)} à {selected.time}
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  className="shrink-0 bg-[#321B13] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#BC9C6C] transition-all shadow-lg active:scale-95"
                >
                  Confirmer ce créneau →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
