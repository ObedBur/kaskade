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
  Trash2,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PrestatairesSkeleton } from "@/components/admin/Skeleton";
import { useAdminGuard } from "@/lib/use-admin-guard";
import api from "@/lib/api";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/utils";

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
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<Application | null>(null);
  const [validationApp, setValidationApp] = useState<Application | null>(null);
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

  const handleApprove = async (applicationId: string, serviceId: string) => {
    setActionLoading(applicationId);
    try {
      await api.patch(`/admin/providers/applications/${applicationId}/approve`, { serviceId });
      toast.success("Candidature approuvée et métier assigné !");
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: "APPROVED" } : a))
      );
      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => prev ? { ...prev, status: "APPROVED" } : null);
      }
      setValidationApp(null);
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

  const handleDeleteProvider = async (app: Application) => {
    setActionLoading(`delete-${app.id}`);
    try {
      await api.delete(`/users/${app.user.id}`);
      toast.success("Utilisateur supprimé avec succès.");
      setApplications(prev => prev.filter(a => a.user.id !== app.user.id));
      if (selectedApp?.id === app.id) {
        setSelectedApp(null);
      }
      setDeleteConfirmApp(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la suppression.");
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
    return <PrestatairesSkeleton />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="">
      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
              Candidatures Prestataires<span className="text-[#BC9C6C]">.</span>
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
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${filter === tab.key
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
                    className={`flex items-center gap-5 p-5 bg-white border rounded-2xl cursor-pointer hover:shadow-md transition-all group ${app.status === "PENDING"
                      ? "border-amber-200/60 hover:border-amber-300"
                      : "border-slate-100 hover:border-slate-200"
                      }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center group-hover:border-[#BC9C6C]/30 transition-colors">
                      {app.user.avatarUrl ? (
                        <img src={getMediaUrl(app.user.avatarUrl)} alt={app.user.fullName} className="w-full h-full object-cover" />
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
                      className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${currentPage === idx + 1
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
                        src={getMediaUrl(selectedApp.user.avatarUrl)}
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
                  {/* Left Actions */}
                  <div className="flex-1">
                    {selectedApp.status === "PENDING" ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                        <button
                          onClick={() => setValidationApp(selectedApp)}
                          disabled={actionLoading === selectedApp.id}
                          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                        >
                          {actionLoading === selectedApp.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(selectedApp.id)}
                          disabled={actionLoading === selectedApp.id}
                          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-red-500 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          {actionLoading === selectedApp.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Rejeter
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
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
                      </div>
                    )}
                  </div>
                  {/* Right Actions */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setDeleteConfirmApp(selectedApp)}
                      className="px-5 py-3 bg-white text-red-500 border border-red-100 rounded-xl font-bold text-xs hover:bg-red-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de suppression */}
      {deleteConfirmApp && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !actionLoading && setDeleteConfirmApp(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden">
            <button
              onClick={() => !actionLoading && setDeleteConfirmApp(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
            <div className="flex flex-col items-center text-center mb-8 mt-4">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-[#321B13] mb-2">Supprimer ce prestataire ?</h3>
              <p className="text-sm text-slate-500">
                Êtes-vous sûr de vouloir supprimer <strong className="text-[#321B13]">{deleteConfirmApp.user.fullName}</strong> ? Cette action cachera cet utilisateur de la plateforme.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmApp(null)}
                disabled={!!actionLoading}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteProvider(deleteConfirmApp)}
                disabled={!!actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg shadow-red-500/20"
              >
                {actionLoading === `delete-${deleteConfirmApp.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Validation Intelligente */}
      {validationApp && (
        <IntelligentValidationModal
          application={validationApp}
          onClose={() => setValidationApp(null)}
          onConfirm={(serviceId) => handleApprove(validationApp.id, serviceId)}
          loading={actionLoading === validationApp.id}
        />
      )}
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

/* ── Intelligent Validation Modal ───────────────────────────────────────────── */
function IntelligentValidationModal({
  application,
  onClose,
  onConfirm,
  loading
}: {
  application: Application;
  onClose: () => void;
  onConfirm: (serviceId: string) => void;
  loading: boolean;
}) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const [sugRes, allRes] = await Promise.all([
          api.get(`/admin/providers/applications/${application.id}/suggestions`),
          api.get("/services")
        ]);
        setSuggestions(sugRes.data || []);
        setAllServices(Array.isArray(allRes.data) ? allRes.data : allRes.data.data || []);
        
        if (sugRes.data?.length > 0) {
          setSelectedServiceId(sugRes.data[0].id);
        }
      } catch (err) {
        toast.error("Erreur lors du chargement des suggestions.");
      } finally {
        setDataLoading(false);
      }
    };
    fetchSuggestions();
  }, [application.id]);

  const filteredServices = allServices.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-[#321B13]">Valider et attribuer un métier</h2>
            <p className="text-sm text-slate-500 mt-1">
              Sélectionnez le métier principal de <strong className="text-[#321B13]">{application.user.fullName}</strong>.
            </p>
          </div>
          <button onClick={() => !loading && onClose()} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#BC9C6C] animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-400 animate-pulse">Analyse intelligente du profil...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profil analysé */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 items-start">
                <div className="bg-white p-2 rounded-xl text-amber-500 shadow-sm shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-900 mb-2">Profil du candidat</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.user.metier && (
                      <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-bold text-amber-700 shadow-sm">Métier: {application.user.metier}</span>
                    )}
                    {application.user.experience && (
                      <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-bold text-amber-700 shadow-sm">Exp: {application.user.experience}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#BC9C6C]" />
                  Suggestions Intelligentes
                </h3>
                
                {suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestions.slice(0, 4).map((sug) => {
                      const isSelected = selectedServiceId === sug.id;
                      const stars = Math.round((sug.matchPercentage / 100) * 5);
                      
                      return (
                        <div 
                          key={sug.id}
                          onClick={() => setSelectedServiceId(sug.id)}
                          className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                            isSelected 
                              ? 'border-[#BC9C6C] bg-orange-50 shadow-sm' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold ${isSelected ? 'text-[#321B13]' : 'text-slate-700'}`}>{sug.name}</h4>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${isSelected ? 'bg-[#BC9C6C] text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {sug.matchPercentage}%
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-3.5 h-3.5 ${i < stars ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 truncate">
                            Catégorie: {sug.category}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-500 text-sm">
                    Aucune suggestion trouvée pour ce profil.
                  </div>
                )}
              </div>

              {/* Tous les services (fallback) */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                  <span>Rechercher un autre métier</span>
                </h3>
                
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Chercher dans tous les métiers de la plateforme..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#BC9C6C]/50"
                  />
                </div>

                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
                  {filteredServices.length > 0 ? (
                    filteredServices.map(service => (
                      <div 
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`px-4 py-3 border-b border-slate-50 cursor-pointer flex justify-between items-center transition-colors ${selectedServiceId === service.id ? 'bg-[#BC9C6C]/10' : 'hover:bg-slate-50'}`}
                      >
                        <div>
                          <p className={`text-sm font-bold ${selectedServiceId === service.id ? 'text-[#321B13]' : 'text-slate-700'}`}>{service.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{service.category}</p>
                        </div>
                        {selectedServiceId === service.id && (
                          <CheckCircle className="w-5 h-5 text-[#BC9C6C]" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">Aucun métier correspondant</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <button 
            onClick={() => window.open('/admin/service', '_blank')}
            className="text-xs font-bold text-[#BC9C6C] hover:text-[#321B13] transition-colors"
          >
            + Créer un nouveau métier
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3.5 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors disabled:opacity-50 shadow-sm"
            >
              Annuler
            </button>
            <button
              onClick={() => selectedServiceId && onConfirm(selectedServiceId)}
              disabled={loading || !selectedServiceId}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Validation..." : "Valider le prestataire"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
