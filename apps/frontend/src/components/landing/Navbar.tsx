"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, Bell, ChevronDown, Home, Settings, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getMediaUrl } from "@/lib/utils";
import api from "@/lib/api";
import SearchAutocomplete from "./SearchAutocomplete";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const { user, isAuthenticated, switchMode, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Accueil");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications').then(res => {
        const result = res.data;
        const notifs = Array.isArray(result) ? result : result.data ?? [];
        setNotifications(notifs.slice(0, 5));
        setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
      }).catch(err => console.error("Error fetching notifications for navbar:", err));
    }
  }, [isAuthenticated]);

  const navLinks = user?.role === 'ADMIN' ? [] : [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Settings },
    { name: "Mes demandes", href: "/mes-demandes", icon: FileText },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-chocolat border-b border-white/5">
      <div className="arcture-container h-16 flex items-center justify-between">

        <BrandLogo />

        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <SearchAutocomplete dark />
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative group">
            <Link href="/notifications" className="relative p-2 text-white/60 hover:text-ocre transition-colors flex items-center justify-center">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ocre border border-chocolat rounded-full"></span>
              )}
            </Link>

            {/* Dropdown Menu on Hover */}
            {isAuthenticated && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-chocolat border border-white/10 rounded-md shadow-2xl flex flex-col overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right transform scale-95 group-hover:scale-100 z-[60]">
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-ocre text-chocolat text-[9px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <Link key={n.id} href="/notifications" className="block p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-xs font-bold ${n.isRead ? 'text-white/60' : 'text-white'}`}>{n.title}</h4>
                          {!n.isRead && <span className="w-1.5 h-1.5 bg-ocre rounded-full mt-1 flex-shrink-0 ml-2"></span>}
                        </div>
                        <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{n.message}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-white/40 text-[10px] uppercase tracking-widest">
                      Aucune notification
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-white/5 bg-black/20">
                  <Link href="/notifications" className="block w-full text-center py-2 text-[10px] text-ocre hover:text-white uppercase tracking-widest font-bold transition-colors">
                    Voir tout
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Only: Auth/Profile/Connect */}
          {isAuthenticated && user ? (
            <div className="hidden lg:flex items-center gap-4"> {/* Changed from md:flex to lg:flex */}
              {user.role === 'PROVIDER' && (
                <button
                  onClick={() => switchMode('PROVIDER')}
                  className="bg-transparent border border-white/10 hover:border-ocre/30 text-ocre px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Mode Prestataire
                </button>
              )}

              {user.role === 'CLIENT' && (
                <Link
                  href="/devenir-prestataire"
                  className="bg-transparent border border-white/10 hover:border-ocre/30 text-ocre px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Devenir Prestataire
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="flex flex-col items-end hidden lg:flex">
                    <span className="text-[10px] font-black tracking-widest uppercase text-white">{user.fullName}</span>
                    <span className="text-[8px] text-white/50 tracking-[0.2em] font-bold">{user.role}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white/50 font-bold overflow-hidden outline outline-2 outline-transparent group-hover:outline-ocre/50 transition-all">
                    {user.avatarUrl ? (
                      <img src={getMediaUrl(user.avatarUrl)} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      user.fullName.charAt(0)
                    )}
                  </div>
                  <ChevronDown className={`hidden lg:block h-3 w-3 text-white/40 group-hover:text-ocre transition-all ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-4 w-48 bg-chocolat border border-white/10 rounded-md shadow-xl py-1 flex flex-col overflow-hidden">
                    <Link
                      href={user.role === 'ADMIN' ? '/admin/dashboard' : '/mes-demandes'}
                      className="px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      href="/parametres"
                      className="px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Paramètres
                    </Link>
                    <hr className="border-white/5 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="px-4 py-3 text-xs text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-bold uppercase tracking-widest"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden lg:block bg-ocre hover:bg-white text-chocolat px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all"> {/* Changed from md:block to lg:block */}
              Se connecter
            </Link>
          )}

          {/* Toggle Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-ocre"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* --- SECONDARY NAV BAR --- */}
      <div className="hidden lg:block border-t border-white/5 bg-chocolat">
        <div className="arcture-container flex items-center h-12 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setActiveTab(link.name)}
              className={`px-4 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === link.name
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
        <div className="lg:hidden bg-chocolat border-t border-white/5 py-4 shadow-2xl">
          <div className="relative mb-4 px-4">
            <SearchAutocomplete
              dark
              onSelect={() => setIsMobileMenuOpen(false)}
            />
          </div>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    setActiveTab(link.name);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-3 flex items-center group transition-all ${activeTab === link.name
                    ? "border-l-[2px] border-ocre bg-gradient-to-r from-ocre/10 to-transparent text-ocre"
                    : "border-l-[2px] border-transparent text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <div className="flex items-center gap-4 pl-4">
                    <Icon className={`w-4 h-4 stroke-[1.5] transition-colors ${activeTab === link.name ? 'text-ocre' : 'text-white/30 group-hover:text-white'}`} />
                    <span className="text-[14px] font-medium tracking-wide">{link.name}</span>
                  </div>
                </Link>
              )
            })}

            {isAuthenticated && user ? (
              <div className="w-full mt-4 pt-4 border-t border-white/5 px-4">
                {user.role === 'PROVIDER' && (
                  <button
                    onClick={() => {
                      switchMode('PROVIDER');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-transparent border border-ocre/20 text-ocre text-center rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-ocre hover:text-chocolat transition-all mb-2"
                  >
                    Mode Prestataire
                  </button>
                )}
                {user.role === 'CLIENT' && (
                  <Link
                    href="/devenir-prestataire"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 bg-transparent border border-ocre/20 text-ocre text-center rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-ocre hover:text-chocolat transition-all mb-2"
                  >
                    Devenir Prestataire
                  </Link>
                )}

                <div className="w-full py-3 bg-black/20 rounded-xl flex items-center gap-3 border border-white/5 px-4">
                  <div className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center font-black text-ocre text-sm overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={getMediaUrl(user.avatarUrl)} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      user.fullName.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[12px] font-bold text-white leading-tight">{user.fullName}</span>
                    <span className="text-[9px] text-white/40 uppercase tracking-[0.2em]">{user.role}</span>
                  </div>
                </div>
                <Link
                  href={user.role === 'ADMIN' ? '/admin/dashboard' : '/mes-demandes'}
                  className="block px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/parametres"
                  className="block px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Paramètres
                </Link>
                <hr className="border-white/5 my-1" />
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-xs text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-bold uppercase tracking-widest"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="px-4 mt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-3 bg-ocre/10 border border-ocre/20 text-ocre text-center rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-ocre hover:text-chocolat transition-all"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
