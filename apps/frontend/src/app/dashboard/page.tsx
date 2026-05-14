"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  TrendingUp,
  Loader2,
  AlertCircle,
  MapPin,
  User as UserIcon,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalRevenue: number;
  pendingMissions: number;
  completedMissions: number;
  activeRequest: any | null;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, reqsRes] = await Promise.all([
        api.get("/provider/dashboard-stats"),
        api.get("/provider/requests"),
      ]);
      setStats(statsRes.data);
      setAvailableRequests(reqsRes.data);
    } catch (err) {
      console.error("Erreur dashboard:", err);
      toast.error("Impossible de charger les données du tableau de bord.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading]);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/provider/requests/${id}/accept`);
      toast.success("Mission acceptée !");
      fetchData(); // Rafraîchir tout
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'acceptation.");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-20">

      {/* HEADER EDITORIAL */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <h2 className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-4">Espace Prestataire</h2>
        <h1 className="text-5xl md:text-7xl font-sans font-black text-[#321B13] tracking-tighter leading-none mb-6">
          BONJOUR, <br />
          <span className="text-[#BC9C6C]">{user?.fullName?.split(' ')[0].toUpperCase()}.</span>
        </h1>
        <p className="text-[#321B13]/70 max-w-lg text-sm md:text-base leading-relaxed border-l-2 border-[#BC9C6C] pl-6">
          Suivez vos performances en temps réel et gérez vos missions avec l'excellence Kaskade.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">

        {/* COLONNE GAUCHE : Stats & Focus */}
        <div className="xl:col-span-4 space-y-16">

          {/* STATS */}
          <section>
            <div className="flex items-end justify-between border-b border-[#321B13]/10 pb-4 mb-8">
              <h3 className="text-sm font-black text-[#321B13] uppercase tracking-widest">Performances</h3>
              <span className="text-[10px] text-[#321B13]/50 uppercase tracking-widest font-bold">Total</span>
            </div>

            <div className="space-y-8">
              <div className="bg-[#321B13] text-[#FCFBF7] p-8 md:p-10 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2">Revenus générés</p>
                  <p className="text-4xl md:text-5xl font-black tracking-tighter">
                    {stats?.totalRevenue.toLocaleString()} $
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[#BC9C6C]">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Compte vérifié</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#BC9C6C] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FCFBF7] border border-[#321B13]/5 p-6 hover:bg-[#321B13]/5 transition-colors">
                  <Clock className="w-5 h-5 text-[#BC9C6C] mb-4" />
                  <p className="text-3xl font-black text-[#321B13] tracking-tighter mb-1">
                    {stats?.pendingMissions}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-[#321B13]/60 font-bold">En cours</p>
                </div>
                <div className="bg-[#FCFBF7] border border-[#321B13]/5 p-6 hover:bg-[#321B13]/5 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-[#321B13] mb-4" />
                  <p className="text-3xl font-black text-[#321B13] tracking-tighter mb-1">
                    {stats?.completedMissions}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-[#321B13]/60 font-bold">Complétées</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard/missions')}
                className="w-full py-4 bg-[#FCFBF7] border border-[#321B13]/10 text-[#321B13] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#321B13] hover:text-white transition-all group"
              >
                Gérer toutes mes missions
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          {/* FOCUS PRINCIPAL */}
          <section>
            <h3 className="text-sm font-black text-[#321B13] uppercase tracking-widest border-b border-[#321B13]/10 pb-4 mb-8">Focus Principal</h3>

            {stats?.activeRequest ? (
              <div className="bg-white p-8 shadow-[0_20px_40px_rgba(50,27,19,0.03)] border border-[#321B13]/5">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-[#BC9C6C]/10 text-[#321B13] px-3 py-1 text-[9px] uppercase tracking-widest font-bold inline-flex items-center gap-1.5">
                    <Play className="w-3 h-3 text-[#BC9C6C] fill-current" />
                    {stats.activeRequest.status === 'ACCEPTED' ? 'Accepté' : 'En cours'}
                  </div>
                  <span className="text-[#321B13] font-black text-xs">
                    {stats.activeRequest.price ? `${stats.activeRequest.price} $` : 'Prix à fixer'}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-[#321B13] leading-snug mb-3">
                  {stats.activeRequest.service?.name}
                </h4>
                <div className="flex items-center gap-2 text-[#321B13]/60 text-[10px] mb-8 font-bold uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  {stats.activeRequest.address}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#BC9C6C]/20 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-[#BC9C6C]" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Client</p>
                      <p className="text-xs font-bold">{stats.activeRequest.client?.fullName}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/dashboard/missions/${stats.activeRequest.id}`)}
                  className="w-full mt-8 py-4 border border-[#321B13]/20 text-[#321B13] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#321B13] hover:text-white transition-all duration-300"
                >
                  Gérer la mission
                </button>
              </div>
            ) : (
              <div className="bg-[#FCFBF7] border border-dashed border-[#321B13]/10 p-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#321B13]/10 mx-auto mb-4" />
                <p className="text-[10px] font-bold text-[#321B13]/40 uppercase tracking-widest">Aucune mission active</p>
              </div>
            )}
          </section>
        </div>

        {/* COLONNE DROITE : Missions Disponibles */}
        <div className="xl:col-span-8">
          <div className="flex items-end justify-between border-b border-[#321B13]/10 pb-4 mb-8">
            <h3 className="text-sm font-black text-[#321B13] uppercase tracking-widest flex items-center gap-3">
              Missions Disponibles
              {availableRequests.length > 0 && (
                <span className="bg-[#BC9C6C] text-white text-[10px] px-2 py-0.5 rounded-none font-black uppercase tracking-widest">
                  {availableRequests.length}
                </span>
              )}
            </h3>
          </div>

          <div className="space-y-6">
            {availableRequests.length > 0 ? (
              availableRequests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white border border-[#321B13]/10 hover:border-[#BC9C6C] hover:shadow-[0_20px_40px_rgba(188,156,108,0.1)] transition-all duration-500 p-8 md:p-10 flex flex-col md:flex-row gap-8 justify-between relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#BC9C6C] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="text-[#321B13] text-[10px] uppercase font-bold tracking-widest border border-[#321B13]/20 px-2 py-0.5">
                        {req.service?.category}
                      </span>
                      <span className="text-[#321B13]/40 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Soumis le {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-2xl md:text-3xl font-black text-[#321B13] tracking-tight mb-3 uppercase">
                      {req.service?.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[#321B13]/60 text-xs mb-4">
                      <MapPin className="w-3.5 h-3.5 text-[#BC9C6C]" />
                      {req.address} • {req.client?.quartier}
                    </div>
                    <p className="text-[#321B13]/60 text-sm max-w-xl leading-relaxed line-clamp-2">
                      {req.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between md:min-w-[150px]">
                    <div className="text-left md:text-right mb-6 md:mb-0">
                      <p className="text-[10px] uppercase tracking-widest text-[#321B13]/50 font-bold mb-1">Budget Fixé</p>
                      <p className="text-3xl font-black text-[#321B13]">{req.price || '—'} $</p>
                    </div>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={actionLoading === req.id}
                      className="bg-[#BC9C6C] hover:bg-[#321B13] text-white px-8 py-4 w-full md:w-auto text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === req.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Accepter'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 text-center bg-[#FCFBF7] border border-dashed border-[#321B13]/10">
                <Briefcase className="w-12 h-12 text-[#321B13]/5 mx-auto mb-6" />
                <h4 className="text-sm font-black text-[#321B13]/40 uppercase tracking-[0.2em] mb-2">
                  Aucune mission disponible
                </h4>
                <p className="text-xs text-[#321B13]/30 max-w-xs mx-auto">
                  Revenez plus tard ou vérifiez que vous avez bien des services assignés par l'administration.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
