"use client";

import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Briefcase,
  UserCircle,
  Bell,
  Settings,
  TrendingUp,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Clients", icon: UserCircle, href: "/admin/client" },
  { name: "Prestataires", icon: Users, href: "/admin/prestataire" },
  { name: "Services", icon: Briefcase, href: "/admin/service" },
  { name: "Demandes", icon: MessageSquare, href: "/admin/request" },
  { name: "Revenus", icon: TrendingUp, href: "/admin/revenu" },
  { name: "Notifications", icon: Bell, href: "/admin/notification", badge: true },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get("/notifications");
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      } catch {
        // Silently fail - notifications may not be available
      }
    };

    fetchUnread();
    // Poll every 60 seconds
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (href: string) => {
    if (href !== pathname) {
      setIsNavigating(href);
      // Reset after a small delay (the skeleton on the page itself handles loading)
      setTimeout(() => setIsNavigating(null), 1500);
    }
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-72 bg-[#321B13] h-screen fixed left-0 top-0 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Brand Header */}
        <div className="px-8 pt-10 pb-8 border-b border-white/5 relative">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 lg:hidden text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>

          {/* Logo mark */}
          <div className="flex flex-col gap-1 mb-5">
            <div className="w-7 h-[3px] bg-[#BC9C6C] rounded-none" />
            <div className="w-10 h-[3px] bg-white rounded-none" />
            <div className="w-5 h-[3px] bg-[#BC9C6C]/40 rounded-none" />
          </div>

          {/* Wordmark */}
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">
            Kaskade<span className="text-[#BC9C6C]">.</span>
          </h1>

          {/* Badge */}
          <div className="mt-3 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BC9C6C] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-[#BC9C6C]">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isLoading = isNavigating === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`flex items-center gap-4 px-6 py-4 rounded-none transition-all duration-200 group relative ${
                  isActive
                    ? "bg-[#BC9C6C] text-[#321B13]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Active left bar */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-white/40" />
                )}

                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-[#321B13]" : "group-hover:text-[#BC9C6C] transition-colors"
                  } ${isLoading ? "animate-spin" : ""}`}
                />

                <span className={`text-[11px] font-bold uppercase tracking-[0.2em] flex-1 ${isActive ? "text-[#321B13]" : ""}`}>
                  {item.name}
                </span>

                {/* Notification badge */}
                {item.badge && unreadCount > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                    isActive
                      ? "bg-[#321B13] text-[#BC9C6C]"
                      : "bg-[#BC9C6C] text-[#321B13]"
                  }`}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}

                {/* Active arrow */}
                {isActive && (
                  <ChevronRight className="w-3 h-3 text-[#321B13]/50 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout Footer */}
        <div className="border-t border-white/5 bg-black/20 p-6 space-y-4">
          {/* User mini card */}
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-[#BC9C6C] flex items-center justify-center text-[#321B13] font-black text-xs flex-shrink-0">
                {user.fullName?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-white truncate">{user.fullName}</p>
                <p className="text-[8px] text-white/30 uppercase tracking-widest">Super Admin</p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all group"
            title="Déconnexion"
          >
            <LogOut className="w-3 h-3 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-0.5">Se déconnecter</span>
          </button>
        </div>
      </aside>
    </>
  );
}
