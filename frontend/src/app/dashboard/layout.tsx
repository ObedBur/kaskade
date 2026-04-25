"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  Bell,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  RefreshCcw
} from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Protection de la route : Seul un utilisateur (rôle = Provider) en MODE = Provider peut accéder à ce dashboard
  const { user, userMode, isLoading: authLoading } = useRequireAuth(undefined, ['PROVIDER'], '/mes-demandes');
  const { logout, switchMode } = useAuth();

  const [availableCount, setAvailableCount] = React.useState(0);
  const [unreadNotifs, setUnreadNotifs] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        try {
          const [reqsRes, notifsRes] = await Promise.all([
            api.get("/provider/requests"),
            api.get("/notifications")
          ]);
          setAvailableCount(reqsRes.data.length);
          const notifs = notifsRes.data.data || notifsRes.data;
          setUnreadNotifs(notifs.filter((n: any) => !n.isRead).length);
        } catch (err) {
          console.error("Error fetching sidebar counts:", err);
        }
      };
      fetchCounts();
    }
  }, [user, pathname]); // Re-fetch on path change to sync counts

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Missions Disponibles", href: "/dashboard/missions", icon: Briefcase, badge: availableCount },
    { name: "Mes Missions", href: "/dashboard/mes-missions", icon: ClipboardList },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: unreadNotifs },
    { name: "Profil", href: "/dashboard/profil", icon: User },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FCFBF7] font-sans selection:bg-[#BC9C6C] selection:text-white flex">
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-[#321B13]/10 bg-[#FCFBF7] z-40">
        <div className="p-10">
          <Link href="/" className="inline-block group">
            <div className="flex flex-col gap-0.5 mb-2">
              <div className="w-6 h-1 bg-[#BC9C6C] rounded-none group-hover:w-8 transition-all duration-300"></div>
              <div className="w-8 h-1 bg-[#321B13] rounded-none"></div>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-[#321B13] uppercase">
              Kaskade<span className="text-[#BC9C6C]">.</span>
            </h1>
          </Link>
          <div className="mt-2 text-[#321B13]/50 text-xs uppercase tracking-[0.2em] font-medium">
            Artisan Portal
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-none transition-all duration-300 group ${isActive
                    ? "bg-[#321B13] text-[#FCFBF7]"
                    : "text-[#321B13]/60 hover:text-[#321B13] hover:bg-[#321B13]/5"
                  }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-[#BC9C6C]" : "group-hover:text-[#BC9C6C] transition-colors"}`} />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? "text-white" : ""}`}>
                  {item.name}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto text-[10px] px-2 py-0.5 font-bold ${isActive ? "bg-[#BC9C6C] text-[#321B13]" : "bg-[#BC9C6C]/20 text-[#321B13]"} rounded-full`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#321B13]/10 space-y-4">

          <button
            onClick={() => switchMode('CLIENT')}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#BC9C6C]/10 hover:bg-[#BC9C6C]/20 text-[#321B13] transition-colors group"
          >
            <span className="text-[10px] uppercase font-black tracking-widest">Mode Client</span>
            <RefreshCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#321B13]/5 border border-[#321B13]/10 rounded-none flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-[#321B13]/50" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[#321B13] tracking-widest max-w-[100px] truncate">{user.fullName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#BC9C6C]"></div>
                  <p className="text-[9px] text-[#321B13]/60 uppercase tracking-widest font-bold">Disponible</p>
                </div>
              </div>
            </div>

            <button onClick={logout} className="p-2 text-[#321B13]/40 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- TOPBAR MOBILE --- */}
      <header className="lg:hidden fixed top-0 w-full bg-[#FCFBF7]/90 backdrop-blur-md border-b border-[#321B13]/5 z-50 h-20 flex items-center justify-between px-6">
        <Link href="/" className="inline-block">
          <h1 className="text-xl font-black tracking-tighter text-[#321B13] uppercase">
            Kaskade<span className="text-[#BC9C6C]">.</span>
          </h1>
        </Link>
        <button onClick={() => setIsSidebarOpen(true)} className="text-[#321B13] p-2">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-[#321B13]/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="w-[80%] max-w-sm bg-[#FCFBF7] h-full shadow-2xl relative z-[61] flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-[#321B13]/10">
              <h1 className="text-xl font-black tracking-tighter text-[#321B13] uppercase">Kaskade.</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="text-[#321B13]/50 hover:text-[#321B13]">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-none transition-all ${isActive ? "bg-[#321B13] text-[#FCFBF7]" : "text-[#321B13]/70 hover:bg-[#321B13]/5"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 lg:pl-0 pt-20 lg:pt-0 min-w-0">
        <div className="max-w-[1200px] mx-auto p-6 md:p-12 lg:p-16">
          {children}
        </div>
      </main>
    </div>
  );
}
