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
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Clients", icon: UserCircle, href: "/admin/client" },
  { name: "Prestataires", icon: Users, href: "/admin/prestataire" },
  { name: "Services", icon: Briefcase, href: "/admin/service" },
  { name: "Demandes", icon: MessageSquare, href: "/admin/request" },
  { name: "Revenus", icon: TrendingUp, href: "/admin/revenu" },
  { name: "Notifications", icon: Bell, href: "/admin/notification" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

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
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-4 px-6 py-4 rounded-none transition-all duration-300 group ${isActive
                  ? "bg-[#BC9C6C] text-[#321B13]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-[#321B13]" : "group-hover:text-[#BC9C6C] transition-colors"}`} />
                <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isActive ? "text-[#321B13]" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="border-t border-white/5 bg-black/20 p-6">
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
