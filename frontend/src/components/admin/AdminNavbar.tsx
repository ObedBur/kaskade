"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Bell, Search, Menu, X, ChevronDown } from 'lucide-react';

export default function AdminNavbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-20 bg-[#321B13] border-b border-white/5 flex items-center justify-between px-4 md:px-10 sticky top-0 z-50">
      
      {/* Left Interface: Logo & Toggle */}
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-white/70 hover:text-[#BC9C6C] transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            Kaskade<span className="text-[#BC9C6C]">.</span>
          </span>
        </Link>
      </div>

      {/* Center: Search Bar (Hidden on mobile, visible on tablet/desk) */}
      <div className="hidden sm:flex flex-1 max-w-lg mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#BC9C6C] transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher dans le dashboard..." 
            className="w-full bg-white/5 pr-4 pl-12 py-3 border border-white/10 rounded-full text-xs font-bold tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-[#BC9C6C]/40 focus:bg-white/10 transition-all hover:border-white/20"
          />
        </div>
      </div>

      {/* Right Interface: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Notifications */}
        <Link 
          href="/admin/notifications" 
          className="relative p-2.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-[#BC9C6C] transition-all rounded-full hidden xs:flex"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#BC9C6C] rounded-full border border-[#321B13]" />
        </Link>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block" />

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
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
      </div>

      {/* Mobile Drawer (Simplified) */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#321B13] border-b border-white/5 p-4 flex flex-col gap-4 lg:hidden animate-in slide-in-from-top duration-300">
           <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10">
              <Search className="w-4 h-4 text-[#BC9C6C]" />
              <input 
                type="text" 
                placeholder="RECHERCHER..." 
                className="bg-transparent border-none outline-none text-[10px] font-black tracking-[0.2em] text-white w-full uppercase"
              />
           </div>
           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-4 pt-4">Navigation Rapide</p>
           <nav className="flex flex-col gap-1">
              <Link href="/admin/dashboard" className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest hover:bg-[#BC9C6C] hover:text-[#321B13] transition-colors">Vue Globale</Link>
              <Link href="/admin/notifications" className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest hover:bg-[#BC9C6C] hover:text-[#321B13] transition-colors">Notifications</Link>
              <Link href="/admin/users" className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest hover:bg-[#BC9C6C] hover:text-[#321B13] transition-colors">Utilisateurs</Link>
           </nav>
        </div>
      )}
    </header>
  );
}
