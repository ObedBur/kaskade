"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Briefcase,
  MapPin,
  History,
  FileText,
  User as UserIcon,
  AlertTriangle,
  X,
  Phone,
  Mail,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminGuard } from "@/lib/use-admin-guard";
import api from "@/lib/api";
import { toast } from "sonner";

type Application = {
  id: string;
  motivation: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    quartier?: string;
    role: string;
    avatarUrl?: string;
    metier?: string;
    experience?: string;
    bio?: string;
    isVerified: boolean;
    createdAt: string;
  };
};

const statusConfig = {
  PENDING: {
    label: "En attente",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  APPROVED: {
    label: "Approuvée",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejetée",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
  },
};

export default function AdminPrestatairePage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [applications, setApplications] = useState<Application[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchApplications = async () => {
    try {
      const res = await api.get("/admin/providers/applications");
      setApplications(Array.isArray(res.data) ? res.data : res.data.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les candidatures.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchApplications();
  }, [isAuthenticated]);

  const handleApprove = async (applicationId: string) => {
    setActionLoading(applicationId);
    try {
      await api.patch(`/admin/providers/applications/${applicationId}/approve`);
      toast.success("Candidature approuvée !");
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: "APPROVED" } : a))
      );
      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => prev ? { ...prev, status: "APPROVED" } : null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'approbation.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setActionLoading(applicationId);
    try {
      await api.patch(`/admin/providers/applications/${applicationId}/reject`);
      toast.success("Candidature rejetée.");
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: "REJECTED" } : a))
      );
      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => prev ? { ...prev, status: "REJECTED" } : null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du rejet.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter((a) => {
    const statusMatch = filter === "ALL" || a.status === filter;
    const searchMatch =
      a.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.user.metier || "").toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    approved: applications.filter((a) => a.status === "APPROVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedApp(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (authLoading || (isAuthenticated && dataLoading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="">
      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
              Candidatures Prestataires
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Analysez et traitez les demandes des candidats souhaitant devenir prestataires.
            </p>
          </div>
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou métier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-[#BC9C6C]/10 transition-all"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", count: counts.all, color: "text-slate-700", bg: "bg-slate-50" },
            { label: "En attente", count: counts.pending, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Approuvées", count: counts.approved, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Rejetées", count: counts.rejected, color: "text-red-500", bg: "bg-red-50" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 text-center`}>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-50 p-1.5 rounded-2xl flex flex-wrap gap-1 w-full md:w-fit">
          {(
            [
              { key: "ALL", label: "Toutes" },
              { key: "PENDING", label: "En attente" },
              { key: "APPROVED", label: "Approuvées" },
              { key: "REJECTED", label: "Rejetées" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                filter === tab.key
                  ? "bg-white text-[#321B13] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
              {tab.key === "PENDING" && counts.pending > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-8 rounded-3xl text-center font-bold">
          {error}
        </div>
      )}

      {/* Applications Table */}
      {!error && (
        <div className="space-y-4">
          <div className="space-y-3 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
            {paginatedApplications.length > 0 ? (
              paginatedApplications.map((app, i) => {
              const config = statusConfig[app.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedApp(app)}
                  className={`flex items-center gap-5 p-5 bg-white border rounded-2xl cursor-pointer hover:shadow-md transition-all group ${
                    app.status === "PENDING"
                      ? "border-amber-200/60 hover:border-amber-300"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center group-hover:border-[#BC9C6C]/30 transition-colors">
                    {app.user.avatarUrl ? (
                      <img src={app.user.avatarUrl} alt={app.user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-black text-slate-300">
                        {app.user.fullName.split(" ").map((n) => n[0]).join("")}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-sm truncate">{app.user.fullName}</h3>
                      {app.user.isVerified && <Shield className="w-3.5 h-3.5 text-[#BC9C6C] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{app.user.email}</p>
                  </div>

                  {/* Métier */}
                  <div className="hidden md:block text-right min-w-[140px]">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Métier</p>
                    <p className="text-xs font-bold text-slate-600 truncate">{app.user.metier || "—"}</p>
                  </div>

                  {/* Date */}
                  <div className="hidden lg:block text-right min-w-[100px]">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Soumis le</p>
                    <p className="text-xs font-bold text-slate-600">
                      {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color} ${config.border} border`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-24 text-center">
              <AlertTriangle className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">
                Aucune candidature trouvée
              </p>
            </div>
          )}
          </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 border border-slate-100 rounded-2xl shadow-sm gap-4">
            <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
              Affichage de <span className="text-[#321B13]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> à <span className="text-[#321B13]">{Math.min(currentPage * ITEMS_PER_PAGE, filteredApplications.length)}</span> sur <span className="text-[#321B13]">{filteredApplications.length}</span> candidatures
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-[#321B13] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] custom-scrollbar">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                      currentPage === idx + 1
                        ? "bg-[#321B13] text-white"
                        : "bg-transparent text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-[#321B13] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  MODAL — Détail de la candidature                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedApp(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Card */}
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-8 md:p-10">

                {/* Header Section */}
                <div className="flex items-start gap-6 mb-8 pb-8 border-b border-slate-100">
                  {/* Large Avatar */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center shadow-lg">
                    {selectedApp.user.avatarUrl ? (
                      <img
                        src={selectedApp.user.avatarUrl}
                        alt={selectedApp.user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-black text-slate-300">
                        {selectedApp.user.fullName.split(" ").map((n) => n[0]).join("")}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-black tracking-tight truncate">
                        {selectedApp.user.fullName}
                      </h2>
                      {selectedApp.user.isVerified && (
                        <Shield className="w-4 h-4 text-[#BC9C6C] flex-shrink-0" />
                      )}
                    </div>

                    {/* Status Badge */}
                    {(() => {
                      const config = statusConfig[selectedApp.status];
                      const StatusIcon = config.icon;
                      return (
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color} ${config.border} border mb-3`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </div>
                      );
                    })()}

                    {/* Contact Info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {selectedApp.user.email}
                      </span>
                      {selectedApp.user.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {selectedApp.user.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        Soumis le {new Date(selectedApp.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <InfoCard
                    icon={<Briefcase className="w-4 h-4 text-[#BC9C6C]" />}
                    label="Spécialité / Métier"
                    value={selectedApp.user.metier}
                  />
                  <InfoCard
                    icon={<History className="w-4 h-4 text-[#BC9C6C]" />}
                    label="Expérience"
                    value={selectedApp.user.experience}
                  />
                  <InfoCard
                    icon={<MapPin className="w-4 h-4 text-[#BC9C6C]" />}
                    label="Zone d'activité"
                    value={selectedApp.user.quartier}
                  />
                  <InfoCard
                    icon={<UserIcon className="w-4 h-4 text-[#BC9C6C]" />}
                    label="Rôle actuel"
                    value={selectedApp.user.role}
                  />
                </div>

                {/* Bio */}
                {selectedApp.user.bio && (
                  <div className="bg-slate-50 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <UserIcon className="w-4 h-4 text-[#BC9C6C]" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Bio
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedApp.user.bio}</p>
                  </div>
                )}

                {/* Motivation */}
                <div className="bg-[#BC9C6C]/5 border border-[#BC9C6C]/15 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-[#BC9C6C]" />
                    <span className="text-[10px] font-black text-[#BC9C6C] uppercase tracking-widest">
                      Lettre de motivation
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.motivation}
                  </p>
                </div>
              </div>

              {/* Footer Actions — Fixed at bottom */}
              <div className="border-t border-slate-100 px-8 md:px-10 py-5 bg-slate-50/80 backdrop-blur-sm flex-shrink-0">
                {selectedApp.status === "PENDING" ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={actionLoading === selectedApp.id}
                      className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                      {actionLoading === selectedApp.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approuver la candidature
                    </button>
                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={actionLoading === selectedApp.id}
                      className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-red-500 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {actionLoading === selectedApp.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Rejeter la candidature
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    {(() => {
                      const config = statusConfig[selectedApp.status];
                      const StatusIcon = config.icon;
                      return (
                        <span className={`flex items-center gap-2 text-sm font-bold ${config.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          Candidature {config.label.toLowerCase()}
                        </span>
                      );
                    })()}
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Small reusable card ───────────────────────────────────────────── */
function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-sm font-bold text-slate-700">{value || "Non renseigné"}</p>
    </div>
  );
}
