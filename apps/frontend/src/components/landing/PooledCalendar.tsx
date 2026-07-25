"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, Calendar, Clock, CheckCircle2, X, Loader2, Users, AlertCircle, Zap, Star, ArrowLeft, RefreshCw } from "lucide-react";
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
  duration: number;
}

interface PooledCalendarProps {
  serviceId: string;
  onClose: () => void;
  onConfirm: (slot: SelectedSlot) => void;
}

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

const DAYS_OF_WEEK = ["L", "M", "M", "J", "V", "S", "D"];

export default function PooledCalendar({ serviceId, onClose, onConfirm }: PooledCalendarProps) {
  const [data, setData] = useState<PooledCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [step, setStep] = useState(0); // 0: Date & Duration, 1: Time
  const [direction, setDirection] = useState(1);
  
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [duration, setDuration] = useState(2);

  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgressBar = () => {
    setLoadingProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    // On simule une progression jusqu'à ~80% pendant le cold start (90s max)
    const startTime = Date.now();
    const maxMs = 90_000;
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(80, (elapsed / maxMs) * 85);
      setLoadingProgress(Math.round(pct));
    }, 500);
  };

  const stopProgressBar = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setLoadingProgress(100);
  };

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    startProgressBar();

    const timeoutMs = 90_000; // 90s pour le cold start Render Free (50s+ annoncé)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await api.get(`/requests/availability/pooled/${serviceId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setData(res.data);
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isTimeout = err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || (err as any)?.message?.includes('timeout') || (err as any)?.message?.includes('aborted');
      const isCorsOrNetwork = !err?.response && (
        (err as any)?.message?.includes('CORS') ||
        (err as any)?.message?.includes('Network') ||
        (err as any)?.code === 'ERR_NETWORK'
      );

      if (isTimeout) {
        setError(
          "Le serveur est en cours de réveil (Cold Start Render Free - jusqu'à 50s). Veuillez réessayer dans quelques instants."
        );
      } else if (isCorsOrNetwork) {
        setError(
          "Problème de connexion au serveur. Vérifiez votre connexion ou que le backend est démarré."
        );
      } else {
        setError(err.response?.data?.message || "Impossible de charger les disponibilités.");
      }
    } finally {
      stopProgressBar();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
    return () => stopProgressBar();
  }, [serviceId]);

  // Flatten weeks into a single array of days
  const allDays = useMemo(() => {
    if (!data) return [];
    return data.weeks.flatMap(w => w.days);
  }, [data]);

  // Group by month
  const months = useMemo(() => {
    if (!allDays.length) return [];
    const map = new Map<string, { label: string, year: number, month: number, days: Day[] }>();
    
    allDays.forEach(day => {
      const d = new Date(day.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, {
          label: d.toLocaleString('fr-FR', { month: 'long' }),
          year: d.getFullYear(),
          month: d.getMonth(),
          days: []
        });
      }
      map.get(key)!.days.push(day);
    });
    
    return Array.from(map.values());
  }, [allDays]);

  const selectedMonth = months[selectedMonthIndex];

  const daysInMonthGrid = useMemo(() => {
    if (!selectedMonth) return [];
    const firstDay = new Date(selectedMonth.year, selectedMonth.month, 1);
    const lastDay = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() || 7) - 1; // 0 = Lundi, 6 = Dimanche
    
    const grid = [];
    // Empty cells before the 1st
    for (let i = 0; i < startingDayOfWeek; i++) {
      grid.push(null);
    }
    
    // Fill actual days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      // Find this day in our available API days
      const apiDay = allDays.find(d => {
        const dDate = new Date(d.date);
        return dDate.getFullYear() === selectedMonth.year && 
               dDate.getMonth() === selectedMonth.month && 
               dDate.getDate() === i;
      });
      grid.push({ dayNumber: i, apiDay });
    }
    return grid;
  }, [selectedMonth, allDays]);

  const handleDayClick = (day: Day) => {
    if (!day.slots.some(s => s.available)) return;
    setSelectedDay(day);
    setDirection(1);
    setStep(1); // Go to step 2
  };

  const handleTimeClick = (time: string) => {
    if (!selectedDay) return;
    onConfirm({
      date: selectedDay.date,
      dayName: selectedDay.dayName,
      time: time,
      duration: duration
    });
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(0);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      weekday: "long"
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-[#321B13]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="bg-white w-full sm:max-w-xl sm:mx-4 rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh] overflow-hidden relative"
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
                <ArrowLeft className="w-4 h-4 text-[#321B13]" />
              </button>
            ) : (
              <div className="w-[46px]" />
            )}
            
            <div className="flex items-center gap-2 bg-[#BC9C6C]/10 px-4 py-1.5 rounded-full border border-[#BC9C6C]/20">
              <Calendar className="w-3.5 h-3.5 text-[#BC9C6C]" />
              <span className="text-[#BC9C6C] text-[9px] font-black uppercase tracking-[0.2em]">
                Disponibilités
              </span>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all active:scale-90 border border-zinc-100"
            >
              <X className="w-4 h-4 text-[#321B13]" />
            </button>
          </div>

          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-[#BC9C6C] rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: loading
                  ? `${loadingProgress}%`
                  : step === 0
                    ? '50%'
                    : '100%',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar relative bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 px-8">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-[#BC9C6C] animate-spin" />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#BC9C6C]/70">
                  {loadingProgress}%
                </span>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-[#321B13]/60 font-bold">Recherche des prestataires...</p>
                {loadingProgress > 25 && loadingProgress < 85 && (
                  <p className="text-xs text-[#321B13]/40 font-medium max-w-xs leading-relaxed">
                    Le serveur se réveille (Cold Start Render Free). Cela peut prendre 30 à 60 secondes à la première requête.
                  </p>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 px-8">
              <AlertCircle className="w-14 h-14 text-red-300" />
              <div className="text-center space-y-2 max-w-sm">
                <p className="text-[11px] font-black text-[#321B13]/80 uppercase tracking-wider">Oups !</p>
                <p className="text-sm text-red-500 font-bold leading-relaxed">{error}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={fetchAvailability}
                  className="flex items-center gap-2 bg-[#321B13] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#BC9C6C] hover:text-[#321B13] transition-all active:scale-95 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 border-2 border-zinc-200 text-[#321B13]/60 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-zinc-300 hover:text-[#321B13] transition-all active:scale-95"
                >
                  Fermer
                </button>
              </div>
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
                  Nous n'avons pas encore de prestataires actifs assignés à ce service.
                </p>
              </div>
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
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 px-6 py-6 sm:px-10 sm:py-8 overflow-y-auto custom-scrollbar"
              >
                {step === 0 && (
                  <div className="space-y-8">
                    <div className="text-center mb-6">
                      <h3 className="text-lg sm:text-xl font-black text-[#321B13] uppercase tracking-tighter">Choisir la date d'intervention</h3>
                      <p className="text-xs text-[#321B13]/50 mt-2 font-medium">
                        {data?.totalProviders} prestataire(s) actif(s) dans votre zone
                      </p>
                    </div>

                    {/* Duration Picker */}
                    <div className="space-y-4 bg-zinc-50/50 p-5 rounded-[24px] border border-zinc-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#BC9C6C]" />
                        <p className="text-[10px] font-black text-[#321B13]/40 uppercase tracking-[0.2em]">
                          Durée estimée
                        </p>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {[1, 2, 3, 4, 8].map((h) => (
                          <button
                            key={h}
                            onClick={() => setDuration(h)}
                            className={`shrink-0 px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border ${duration === h
                              ? "bg-[#BC9C6C] border-[#BC9C6C] text-white shadow-md shadow-[#BC9C6C]/20"
                              : "bg-white border-zinc-200 text-[#321B13]/50 hover:border-[#BC9C6C]/40 hover:text-[#321B13]"
                              }`}
                          >
                            {h === 4 ? "4h (Demi-journée)" : h === 8 ? "8h (Journée complète)" : `${h} heure${h > 1 ? 's' : ''}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Month Picker */}
                    <div className="space-y-4">
                      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {months.map((m, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedMonthIndex(idx)}
                            className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black transition-all border capitalize ${selectedMonthIndex === idx
                              ? "bg-[#321B13] border-[#321B13] text-white shadow-md"
                              : "bg-white border-zinc-200 text-[#321B13]/40 hover:border-[#BC9C6C]/30"
                              }`}
                          >
                            {m.label} {m.year}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="bg-white border border-zinc-100 shadow-sm rounded-[32px] p-5">
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {DAYS_OF_WEEK.map((d, i) => (
                          <div key={i} className="text-center text-[10px] font-black text-[#321B13]/30 uppercase">
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {daysInMonthGrid.map((cell, idx) => {
                          if (!cell) return <div key={`empty-${idx}`} />;
                          
                          const apiDay = cell.apiDay;
                          const hasAvailableSlots = apiDay?.slots.some(s => s.available);
                          const totalAvailableSlots = apiDay?.slots.filter(s => s.available).length || 0;
                          
                          // Determine Heatmap color
                          let heatmapColor = "bg-zinc-100";
                          if (hasAvailableSlots) {
                            if (totalAvailableSlots >= 4) heatmapColor = "bg-emerald-400";
                            else heatmapColor = "bg-orange-400";
                          }

                          const isDisabled = !apiDay || !hasAvailableSlots;

                          return (
                            <button
                              key={`day-${cell.dayNumber}`}
                              onClick={() => !isDisabled && apiDay && handleDayClick(apiDay)}
                              disabled={isDisabled}
                              className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all border relative ${
                                isDisabled
                                  ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                  : "bg-white border-zinc-200 text-[#321B13] hover:border-[#BC9C6C] hover:bg-[#BC9C6C]/5 hover:scale-105 active:scale-95"
                              }`}
                            >
                              <span className="text-[12px] font-bold">{cell.dayNumber}</span>
                              <div className="flex gap-0.5 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${heatmapColor}`} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Legend */}
                      <div className="mt-5 pt-5 border-t border-zinc-100 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-[9px] font-bold text-[#321B13]/40 uppercase tracking-widest">Disponible</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-400" />
                          <span className="text-[9px] font-bold text-[#321B13]/40 uppercase tracking-widest">Limité</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && selectedDay && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-lg sm:text-xl font-black text-[#321B13] uppercase tracking-tighter">Choisissez votre heure</h3>
                      <p className="text-xs text-[#BC9C6C] mt-2 font-black uppercase tracking-widest">
                        {formatDate(selectedDay.date)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                      {/* Matin */}
                      <div>
                        <p className="text-[10px] font-bold text-[#321B13]/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-[#BC9C6C]" /> Matin
                        </p>
                        <div className="flex flex-col gap-2">
                          {selectedDay.slots.filter(s => parseInt(s.time.split(':')[0]) < 13).map((slot) => {
                            const slotHour = parseInt(slot.time.split(':')[0]);
                            const endHour = slotHour + duration;
                            const exceedsDayLimit = endHour > 18; // fermeture par défaut à 18h
                            const isDisabled = !slot.available || exceedsDayLimit;
                            return (
                              <button
                                key={slot.time}
                                disabled={isDisabled}
                                onClick={() => handleTimeClick(slot.time)}
                                title={exceedsDayLimit ? `Ce créneau dépasse la fermeture (fin à ${endHour}h)` : undefined}
                                className={`py-3.5 rounded-2xl text-[11px] font-black transition-all border relative overflow-hidden group ${
                                  isDisabled 
                                    ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                    : "bg-white border-zinc-200 text-[#321B13] hover:border-[#BC9C6C] hover:bg-[#BC9C6C] hover:text-white"
                                }`}
                              >
                                <span>{slot.time}</span>
                                {exceedsDayLimit && !slot.available && (
                                  <span className="block text-[8px] text-zinc-400 font-bold">fin à {endHour}h</span>
                                )}
                                {!isDisabled && (
                                  <div className="absolute inset-y-0 right-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Après-midi */}
                      <div>
                        <p className="text-[10px] font-bold text-[#321B13]/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Star className="w-3 h-3 text-[#BC9C6C]" /> Après-midi
                        </p>
                        <div className="flex flex-col gap-2">
                          {selectedDay.slots.filter(s => parseInt(s.time.split(':')[0]) >= 13).map((slot) => {
                            const slotHour = parseInt(slot.time.split(':')[0]);
                            const endHour = slotHour + duration;
                            const exceedsDayLimit = endHour > 18;
                            const isDisabled = !slot.available || exceedsDayLimit;
                            return (
                              <button
                                key={slot.time}
                                disabled={isDisabled}
                                onClick={() => handleTimeClick(slot.time)}
                                title={exceedsDayLimit ? `Ce créneau dépasse la fermeture (fin à ${endHour}h)` : undefined}
                                className={`py-3.5 rounded-2xl text-[11px] font-black transition-all border relative overflow-hidden group ${
                                  isDisabled 
                                    ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                    : "bg-white border-zinc-200 text-[#321B13] hover:border-[#BC9C6C] hover:bg-[#BC9C6C] hover:text-white"
                                }`}
                              >
                                <span>{slot.time}</span>
                                {exceedsDayLimit && (
                                  <span className="block text-[8px] text-zinc-400 font-bold">fin à {endHour}h</span>
                                )}
                                {!isDisabled && (
                                  <div className="absolute inset-y-0 right-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
