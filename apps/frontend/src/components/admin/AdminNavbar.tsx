"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Bell, Menu, ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PAGE_LABELS: Record<string, string> = {
  "/admin/dashboard":    "Dashboard",
  "/admin/client":       "Clients",
  "/admin/prestataire":  "Prestataires",
  "/admin/service":      "Services",
  "/admin/request":      "Demandes",
  "/admin/revenu":       "Revenus",
  "/admin/notification": "Notifications",
  "/admin/analytics":    "Analytiques",
  "/admin/settings":     "Paramètres",
  "/admin/financials":   "Finances",
  "/admin/users":        "Utilisateurs",
};

export default function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const currentPageLabel = PAGE_LABELS[pathname] ?? "";

  return (
    <header className="h-20 bg-[#321B13] border-b border-white/5 flex items-center justify-between px-4 md:px-10 sticky top-0 z-50 lg:ml-72 transition-all duration-300">

      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-white/70 hover:text-[#BC9C6C] transition-colors flex-shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 min-w-0" aria-label="Breadcrumb">
          <Link href="/admin/dashboard" className="flex-shrink-0 text-white/30 hover:text-[#BC9C6C] transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
          {currentPageLabel && (
            <>
              <ChevronRight className="w-3 h-3 text-white/10 flex-shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#BC9C6C] truncate">
                {currentPageLabel}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 group cursor-pointer flex-shrink-0">
        {/* Notification Bell */}
        <Link
          href="/admin/notification"
          className="relative p-2 text-white/30 hover:text-[#BC9C6C] transition-all"
        >
          <Bell className="w-4 h-4 text-white/50" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#BC9C6C] rounded-full border border-[#321B13]" />
        </Link>

        {/* User info */}
        <div className="text-right hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-[#BC9C6C] transition-colors">
            {user?.fullName}
          </p>
          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
            {user?.role === 'ADMIN' ? 'Super Admin' : 'Admin'}
          </p>
        </div>

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 bg-[#BC9C6C] flex items-center justify-center text-[#321B13] font-black text-xs border border-white/10 shadow-lg active:scale-95 transition-all">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#321B13] rounded-full" />
        </div>
      </div>

    </header>
  );
}
