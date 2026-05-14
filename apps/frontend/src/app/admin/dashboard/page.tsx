"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useAdminGuard } from "@/lib/use-admin-guard";
import {
  Users,
  Briefcase,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Clock,
  UserPlus,
  LayoutDashboard,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  users: { total: number; clients: number; providers: number };
  requests: { total: number; pending: number; inProgress: number; completed: number };
  services: { total: number };
  revenue: Record<string, number>;
}

interface RecentActivity {
  recentRequests: any[];
  recentUsers: any[];
}

export default function AdminDashboardPage() {
  const { isLoading: authLoading, isAuthenticated, user } = useAdminGuard();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;

    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/dashboard/activity')
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#BC9C6C]" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#321B13]">Synchronisation des données...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const revenue = stats?.revenue || { USD: 0, CDF: 0 };
  const hasUSD = (revenue.USD || 0) > 0;
  const hasCDF = (revenue.CDF || 0) > 0;

  const topCards = [
    {
      title: "Revenue",
      value: hasUSD ? `${revenue.USD.toLocaleString('fr-FR')} $` : (hasCDF ? `${revenue.CDF.toLocaleString('fr-FR')} FC` : '0 FC'),
      sub: (hasUSD && hasCDF) ? `+ ${revenue.CDF.toLocaleString('fr-FR')} FC` : "C.A Plateforme",
      icon: TrendingUp,
      color: "text-green-600"
    },
    { title: "Demandes", value: stats?.requests.total || 0, sub: `${stats?.requests.pending || 0} en attente`, icon: MessageSquare, color: "text-blue-600" },
    { title: "Prestataires", value: stats?.users.providers || 0, sub: "Actifs", icon: Briefcase, color: "text-[#BC9C6C]" },
    { title: "Clients", value: stats?.users.clients || 0, sub: "Clients inscrits", icon: Users, color: "text-purple-600" },
    { title: "Alertes", value: stats?.requests.pending || 0, sub: "Prioritaires", icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8 font-sans">

      {/* 5 Stats Cards - Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {topCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 border border-gray-100 rounded-none shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 group"
          >
            <div className="flex justify-between items-start">
              <div className={`p-2 bg-gray-50 rounded-none group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Live</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#321B13]">{card.value}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{card.title}</p>
            </div>
            <div className="pt-4 border-t border-gray-50">
              <p className="text-[9px] text-gray-500 italic">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row - Proportional Widths ALIGNED with Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Requests (Matches 2/5 top cards = 40%) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#321B13]">Dernières Demandes</h2>
            <Link href="/admin/requests" className="text-[9px] font-bold text-[#BC9C6C] hover:underline uppercase tracking-widest">Voir tout</Link>
          </div>
          <div className="space-y-6 h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {activity?.recentRequests.map((req, i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-none group-hover:bg-[#BC9C6C]/10">
                  <Clock className="w-4 h-4 text-gray-400 group-hover:text-[#BC9C6C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[11px] font-black text-[#321B13] truncate uppercase">{req.service?.name}</p>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-none uppercase tracking-tighter ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Par {req.client?.fullName}</p>
                  <p className="text-[9px] text-gray-300 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {(!activity?.recentRequests || activity.recentRequests.length === 0) && (
              <div className="py-20 text-center text-gray-400 text-[10px] uppercase tracking-widest">Aucune demande récente</div>
            )}
          </div>
        </div>

        {/* Recent Users (Matches 2/5 top cards = 40%) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#321B13]">Nouveaux Inscrits</h2>
            <Link href="/admin/users" className="text-[9px] font-bold text-[#BC9C6C] hover:underline uppercase tracking-widest">Gestion</Link>
          </div>
          <div className="space-y-6 h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {activity?.recentUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-none group-hover:bg-[#BC9C6C]/10">
                  <UserPlus className="w-4 h-4 text-gray-400 group-hover:text-[#BC9C6C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-[#321B13] uppercase">{u.fullName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black px-2 py-1 bg-gray-50 text-gray-400 uppercase tracking-widest border border-gray-100">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown (Matches 1/5 top card = 20%) */}
        <div className="lg:col-span-1 bg-white border border-gray-100 shadow-sm p-8 flex flex-col">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#321B13] mb-8 pb-4 border-b border-gray-50 w-full text-left">Résumé</h2>
          <div className="space-y-10 w-full flex-1 flex flex-col justify-start pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Terminées</p>
                <p className="text-lg font-black text-green-600">{stats?.requests.completed || 0}</p>
              </div>
              <div className="w-full bg-gray-50 h-[3px]">
                <div
                  className="bg-green-600 h-full"
                  style={{ width: `${(stats?.requests.completed || 0) / (stats?.requests.total || 1) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">En cours</p>
                <p className="text-lg font-black text-blue-600">{stats?.requests.inProgress || 0}</p>
              </div>
              <div className="w-full bg-gray-50 h-[3px]">
                <div
                  className="bg-blue-600 h-full"
                  style={{ width: `${(stats?.requests.inProgress || 0) / (stats?.requests.total || 1) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attente</p>
                <p className="text-lg font-black text-amber-500">{stats?.requests.pending || 0}</p>
              </div>
              <div className="w-full bg-gray-50 h-[3px]">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(stats?.requests.pending || 0) / (stats?.requests.total || 1) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Full Width */}
      <div className="w-full bg-[#321B13] text-white p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <LayoutDashboard className="w-64 h-64 -mr-16 -mt-16" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="max-w-2xl">
            <span className="text-[#BC9C6C] font-black tracking-[0.4em] text-[10px] uppercase mb-6 block">System Performance</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
              REDÉFINISSEZ <br /> <span className="text-[#BC9C6C] italic serif lowercase">la gestion de services.</span>
            </h2>
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              Actuellement {stats?.users.total || 0} membres forment l'écosystème Kaskade. Votre rôle d'administrateur assure la fluidité des {stats?.requests.total || 0} missions en cours.
            </p>
          </div>
          <div className="flex gap-6">
            <div className="p-10 border border-white/10 bg-white/5 text-center min-w-[160px]">
              <p className="text-3xl font-black text-white">{stats?.users.total || 0}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#BC9C6C] mt-2">Membres</p>
            </div>
            <div className="p-10 border border-white/10 bg-white/5 text-center min-w-[160px]">
              <p className="text-3xl font-black text-white">{stats?.requests.total || 0}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#BC9C6C] mt-2">Services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
