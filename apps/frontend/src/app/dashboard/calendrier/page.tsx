"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  Loader2,
  MapPin,
  User,
  Phone,
  Clock,
  Repeat,
  X,
  AlertCircle,
  CheckCircle2,
  Play,
  Hourglass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  title: string;
  category?: string;
  client?: string;
  clientPhone?: string;
  clientQuartier?: string;
  address?: string;
  time: string;
  duration: number;
  status: string;
  statusLabel: string;
  color: string;
  price?: number;
  isRecurring: boolean;
  frequency?: string;
}

interface CalendarDay {
  date: string;
  dayName: string;
  dayNameFull: string;
  isToday: boolean;
  isPast: boolean;
  isSunday: boolean;
  events: CalendarEvent[];
}

interface CalendarWeek {
  weekNumber: number;
  label: string;
  days: CalendarDay[];
  totalEvents: number;
}

interface CalendarData {
  providerId: string;
  window: { from: string; to: string };
  totalMissions: number;
  upcomingEvents: any[];
  weeks: CalendarWeek[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00 to 20:00
const HOUR_HEIGHT = 80;

const parseTimeToDecimal = (time: string) => {
  if (!time) return 8;
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
};

const STATUS_ICON: Record<string, any> = {
  ACCEPTED: Clock,
  IN_PROGRESS: Play,
  AWAITING_FINAL: Hourglass,
  COMPLETED: CheckCircle2,
};

function StatusBadge({ status, label, color }: { status: string; label: string; color: string }) {
  const Icon = STATUS_ICON[status] || Clock;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest"
      style={{ background: color }}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// ─── Event Grid Pill ──────────────────────────────────────────────────────────

function EventGridPill({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const startDecimal = parseTimeToDecimal(event.time);
  const duration = event.duration || 2;
  const top = (startDecimal - 6) * HOUR_HEIGHT;
  const height = duration * HOUR_HEIGHT;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ zIndex: 10, scale: 1.02 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute left-1 right-1 rounded-xl p-3 border-l-4 shadow-sm cursor-pointer overflow-hidden group transition-all"
      style={{
        top: `${top}px`,
        height: `${height - 4}px`,
        background: `white`,
        borderLeftColor: event.color,
        boxShadow: `0 4px 15px -3px ${event.color}20`,
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: event.color }}>
            {event.time}
          </p>
          {event.isRecurring && <Repeat className="w-3 h-3 opacity-30" />}
        </div>
        <h4 className="text-[11px] font-black text-[#321B13] leading-tight mb-1 group-hover:text-[#BC9C6C] transition-colors line-clamp-2">
          {event.title}
        </h4>
        {height > 100 && (
          <>
            <p className="text-[10px] text-[#321B13]/40 font-bold truncate">{event.client}</p>
            <div className="mt-auto pt-2 flex items-center justify-between">
              <span className="text-[9px] font-black text-[#321B13]">${event.price}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: event.color }} />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function EventDetailModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#321B13]/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="h-2 w-full" style={{ background: event.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[9px] font-black text-[#321B13]/40 uppercase tracking-widest mb-1">{event.category}</p>
              <h3 className="text-lg font-black text-[#321B13] tracking-tight">{event.title}</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-zinc-50 text-[#321B13]/40">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-4">
            <StatusBadge status={event.status} label={event.statusLabel} color={event.color} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm"><Clock className="w-4 h-4 text-[#BC9C6C]" /> <span className="font-bold">{event.time}</span></div>
            <div className="flex items-start gap-3 text-sm"><MapPin className="w-4 h-4 text-[#BC9C6C] mt-0.5" /> <span>{event.address}</span></div>
            <div className="flex items-center gap-3 text-sm"><User className="w-4 h-4 text-[#BC9C6C]" /> <span className="font-bold">{event.client}</span></div>
            <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-[#BC9C6C]" /> <span className="font-bold">{event.clientPhone}</span></div>
            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-[#321B13]/50 font-bold uppercase tracking-widest">Rémunération</span>
              <span className="text-xl font-black">${event.price}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Vue Semaine (Grid) ───────────────────────────────────────────────────────

function WeekView({ week, onEventClick }: { week: CalendarWeek; onEventClick: (e: CalendarEvent) => void }) {
  return (
    <div className="bg-white rounded-[32px] border border-zinc-100 overflow-hidden shadow-sm">
      <div className="flex border-b border-zinc-100 ml-16">
        {week.days.map((day) => (
          <div key={day.date} className={`flex-1 py-6 flex flex-col items-center border-r border-zinc-50 last:border-r-0 ${day.isToday ? "bg-[#BC9C6C]/5" : ""}`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${day.isToday ? "text-[#BC9C6C]" : "text-[#321B13]/30"}`}>{day.dayNameFull}</span>
            <span className={`text-xl font-black ${day.isToday ? "text-[#BC9C6C]" : "text-[#321B13]"}`}>{new Date(day.date).getDate()}</span>
          </div>
        ))}
      </div>
      <div className="relative flex max-h-[700px] overflow-y-auto">
        <div className="w-16 shrink-0 bg-[#FCFBF7] border-r border-zinc-100">
          {HOURS.map((h) => (
            <div key={h} className="h-[80px] flex items-start justify-center pt-2">
              <span className="text-[10px] font-bold text-[#321B13]/30 tabular-nums">{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>
        <div className="flex-1 flex relative">
          <div className="absolute inset-0 pointer-events-none">
            {HOURS.map((h) => ( <div key={h} className="h-[80px] border-b border-zinc-50 last:border-b-0" /> ))}
          </div>
          {week.days.map((day) => (
            <div key={day.date} className={`flex-1 relative border-r border-zinc-50 last:border-r-0 min-h-[1200px] ${day.isToday ? "bg-[#BC9C6C]/[0.02]" : ""}`}>
              {day.events.map((ev) => ( <EventGridPill key={ev.id} event={ev} onClick={() => onEventClick(ev)} /> ))}
              {day.isSunday && ( <div className="absolute inset-0 bg-zinc-50/50 flex items-center justify-center"><span className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.4em] rotate-90">Repos Dominical</span></div> )}
            </div>
          ))}
          {week.days.some(d => d.isToday) && <CurrentTimeIndicator />}
        </div>
      </div>
    </div>
  );
}

function CurrentTimeIndicator() {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      const mins = now.getMinutes();
      if (hour >= 6 && hour <= 20) {
        const decimal = hour + mins / 60;
        setTop((decimal - 6) * HOUR_HEIGHT);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
  if (top === 0) return null;
  return (
    <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top: `${top}px` }}>
      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
      <div className="flex-1 h-px bg-red-500 shadow-[0_0_10px_red]" />
    </div>
  );
}

// ─── Vue Mois ─────────────────────────────────────────────────────────────────

function MonthView({ weeks, onEventClick }: { weeks: CalendarWeek[]; onEventClick: (e: CalendarEvent) => void }) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div key={d} className="text-center text-[9px] font-black uppercase tracking-widest text-[#321B13]/30 py-1">{d}</div>
        ))}
      </div>
      {weeks.map((week) => (
        <div key={week.weekNumber} className="grid grid-cols-7 gap-1">
          {week.days.map((day) => {
            const hasEvents = day.events.length > 0;
            return (
              <div key={day.date} className={`aspect-square rounded-lg p-1 flex flex-col items-center transition-all ${day.isToday ? "bg-[#BC9C6C] text-white" : day.isPast ? "opacity-40 bg-zinc-50" : hasEvents ? "bg-[#321B13]/5 cursor-pointer hover:bg-[#321B13]/10" : "bg-white hover:bg-zinc-50"} ${day.isSunday ? "opacity-30" : ""}`}>
                <span className={`text-[10px] font-black ${day.isToday ? "text-white" : "text-[#321B13]/60"}`}>{new Date(day.date).getDate()}</span>
                {hasEvents && !day.isToday && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {day.events.slice(0, 3).map((ev) => ( <div key={ev.id} onClick={(e) => { e.stopPropagation(); onEventClick(ev); }} className="w-1.5 h-1.5 rounded-full" style={{ background: ev.color }} /> ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendrierPage() {
  const { user } = useAuth();
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"week" | "month">("week");
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchCalendar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get("/provider/calendar");
      setData(res.data);
      if (!isRefresh) {
        const idx = res.data.weeks.findIndex((w: CalendarWeek) => w.days.some((d: CalendarDay) => d.isToday));
        if (idx >= 0) setWeekIndex(idx);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Impossible de charger le calendrier.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const currentWeek = data?.weeks[weekIndex];
  const totalWeeks = data?.weeks.length ?? 0;

  return (
    <div className="space-y-10 pb-20">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-3">Planning</p>
          <h1 className="text-4xl md:text-5xl font-black text-[#321B13] tracking-tighter leading-none">MON CALENDRIER<span className="text-[#BC9C6C]">.</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 rounded-xl p-1 gap-1">
            {["week", "month"].map((v: any) => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? "bg-[#321B13] text-white shadow" : "text-[#321B13]/50 hover:text-[#321B13]"}`}>{v === "week" ? "Semaine" : "Mois"}</button>
            ))}
          </div>
          <button onClick={() => fetchCalendar(true)} disabled={refreshing} className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[#321B13]/60 transition-all">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4"><Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" /><p className="text-xs font-bold text-[#321B13]/40 uppercase tracking-widest">Chargement...</p></div>
      ) : data ? (
        <>
          <AnimatePresence mode="wait">
            {view === "week" && currentWeek && (
              <motion.section key="week-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setWeekIndex(i => Math.max(0, i - 1))} disabled={weekIndex === 0} className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4 text-[#321B13]" /></button>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-[#321B13]/30 uppercase tracking-widest mb-0.5">Semaine {currentWeek.weekNumber}</p>
                    <p className="text-sm font-black text-[#321B13] tracking-tight">{currentWeek.label}</p>
                  </div>
                  <button onClick={() => setWeekIndex(i => Math.min(totalWeeks - 1, i + 1))} disabled={weekIndex >= totalWeeks - 1} className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30"><ChevronRight className="w-4 h-4 text-[#321B13]" /></button>
                </div>
                <WeekView week={currentWeek} onEventClick={setSelectedEvent} />
              </motion.section>
            )}
            {view === "month" && (
              <motion.section key="month-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm">
                <MonthView weeks={data.weeks} onEventClick={setSelectedEvent} />
              </motion.section>
            )}
          </AnimatePresence>
        </>
      ) : null}

      <AnimatePresence>{selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}</AnimatePresence>
    </div>
  );
}
