"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Bell, Search, Menu, X, ChevronDown } from 'lucide-react';

export default function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-[#321B13] border-b border-white/5 flex items-center justify-between px-4 md:px-10 sticky top-0 z-50 lg:ml-72 transition-all duration-300">

      {/* Left Interface: Logo & Search (Start Alignment) */}
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-white/70 hover:text-[#BC9C6C] transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar - Now at start */}
        <div className="hidden sm:flex w-full max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#BC9C6C] transition-colors" />
            <input
              type="text"
              placeholder="RECHERCHER..."
              className="w-full bg-white/[0.03] pr-4 pl-12 py-2.5 border border-white/5 rounded-none text-[10px] font-black tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-[#BC9C6C]/30 focus:bg-white/5 transition-all hover:border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Right Interface: Actions & Profile */}
      {/* User Card */}
      <div className="flex items-center gap-4 group cursor-pointer">
        {/* Notifications - Moved in front of the name */}
        <Link
          href="/admin/notification"
          className="relative p-2 text-white/30 hover:text-[#BC9C6C] transition-all"
        >
          <Bell className="w-4 h-4 text-white/50" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#BC9C6C] rounded-full border border-[#321B13]" />
        </Link>

        <div className="text-right hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-[#BC9C6C] transition-colors">
            {user?.fullName}
          </p>
          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
            {user?.role === 'ADMIN' ? 'Super Admin' : 'Admin'}
          </p>
        </div>

        <div className="relative">
          <div className="w-10 h-10 bg-[#BC9C6C] flex items-center justify-center text-[#321B13] font-black text-xs border border-white/10 shadow-lg active:scale-95 transition-all">
            {user?.fullName?.[0].toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#321B13] rounded-full" />
        </div>

        <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-[#BC9C6C] transition-colors ml-1 hidden sm:block" />
      </div>

    </header>
  );
}
