"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, isAuthenticated, switchMode } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Accueil");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = user?.role === 'ADMIN' ? [] : [
    { name: "Accueil", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Mes demandes", href: "/mes-demandes" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-chocolat border-b border-white/5 font-sans">
      {/* --- TOP BAR --- */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Logo (Style Kaskade avec couleurs brand) */}
        <Link href="/" className="flex items-center gap-2 group">
           <div className="flex flex-col gap-0.5">
             <div className="w-6 h-1 bg-ocre rounded-full group-hover:bg-ocre/80 transition-colors"></div>
             <div className="w-8 h-1 bg-[#d4af37] rounded-full group-hover:bg-ocre/60 transition-colors"></div>
             <div className="w-5 h-1 bg-ocre/40 rounded-full group-hover:bg-ocre/20 transition-colors"></div>
           </div>
           <span className="hidden md:block text-xl font-black text-white ml-2 tracking-tight">Kaskade</span>
        </Link>

        {/* Search Bar (Kaskade Theme) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-ocre/60" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full bg-black/20 border border-white/10 rounded-md py-2 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-ocre transition-all"
            />
          </div>
        </div>

          {/* Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/notifications" className="relative p-2 text-white/60 hover:text-ocre transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-ocre border-2 border-chocolat rounded-full"></span>
          </Link>
          
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-4">
              {user.role === 'PROVIDER' && (
                <button
                  onClick={() => switchMode('PROVIDER')}
                  className="bg-white/5 border border-ocre/20 hover:bg-ocre/10 text-ocre px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Mode Prestataire
                </button>
              )}
              
              <Link href={user.role === 'ADMIN' ? '/admin/dashboard' : '/mes-demandes'} className="flex items-center gap-3 cursor-pointer group">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-[10px] font-black tracking-widest uppercase text-white">{user.fullName}</span>
                  <span className="text-[8px] text-white/50 tracking-[0.2em] font-bold">{user.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white/50 font-bold overflow-hidden outline outline-2 outline-transparent group-hover:outline-ocre/50 transition-all">
                   {user.fullName.charAt(0)}
                </div>
                <ChevronDown className="hidden lg:block h-3 w-3 text-white/40 group-hover:text-ocre transition-colors" />
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden lg:block bg-ocre hover:bg-white text-chocolat px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all"
            >
              Se connecter
            </Link>
          )}

          {/* Toggle Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-ocre"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* --- SECONDARY NAV BAR --- */}
      <div className="hidden md:block border-t border-white/5 bg-chocolat">
        <div className="max-w-[1600px] mx-auto px-8 flex items-center h-12 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setActiveTab(link.name)}
              className={`px-4 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === link.name
                  ? "bg-black/40 text-ocre"
                  : "text-white/50 hover:text-white hover:bg-black/20"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-chocolat border-t border-white/5 py-6 px-4 space-y-4 shadow-2xl">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocre/50" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white"
            />
          </div>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  setActiveTab(link.name);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  activeTab === link.name
                    ? "bg-ocre text-chocolat"
                    : "text-white/60 hover:bg-black/20"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 px-4 py-4 bg-ocre text-chocolat text-center rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Se connecter
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
