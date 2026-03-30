"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Menu, X, Bell, User, ChevronDown, LogOut, Settings, 
  LayoutDashboard, Briefcase 
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Déterminer dynamiquement le rôle en fonction du véritable contexte d'authentification
  const userRole = isAuthenticated 
    ? (user?.role?.toLowerCase() === 'provider' ? 'provider' : 'client')
    : 'guest';

  // Gérer l'effet de navbar sticky / ombre au défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le dropdown au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = {
    guest: [
      { name: "Accueil", href: "/" },
      { name: "Services", href: "/services" },
      { name: "Devenir prestataire", href: "/devenir-prestataire" },
    ],
    client: [
      { name: "Accueil", href: "/" },
      { name: "Services", href: "/services" },
      { name: "Mes demandes", href: "/mes-demandes", badge: 2 },
    ],
    provider: [
      { name: "Accueil", href: "/" },
      { name: "Mes services", href: "/mes-services" },
      { name: "Demandes reçues", href: "/demandes", badge: 5 },
    ],
  };

  const activeLinks = navLinks[userRole];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]" : "bg-white/90 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl md:text-3xl font-black font-sans tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                Kaskade<span className="text-blue-600">.</span>
              </span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {activeLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
                >
                  {link.name}
                  {link.badge && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions & Profil (Desktop) */}
            <div className="hidden lg:flex items-center gap-6">
              {userRole === "guest" ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <Link
                    href="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Se connecter
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  {/* Notification Badge Icon */}
                  <button className="relative text-gray-500 hover:text-blue-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {userRole === "client" ? 2 : 5}
                    </span>
                  </button>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none pl-2 pr-1 py-1 rounded-full border border-transparent hover:border-gray-200"
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-sm">
                        {user?.fullName?.split(' ')[0] || (userRole === "client" ? "Espace Client" : "Espace Pro")}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Menu Dropdown Profil */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-bold text-gray-900">
                            {user?.fullName || (userRole === "client" ? "Jean Dupont" : "Pro Services Inc.")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {user?.email || (userRole === "client" ? "jean.dupont@example.com" : "contact@proservices.fr")}
                          </p>
                        </div>
                        
                        <div className="py-2">
                          {userRole === "client" ? (
                            <>
                              <Link href="/mon-compte" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <User className="w-4 h-4" /> Mon Compte
                              </Link>
                              <Link href="/parametres" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <Settings className="w-4 h-4" /> Paramètres
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                              </Link>
                              <Link href="/mon-profil" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <Briefcase className="w-4 h-4" /> Mon Profil
                              </Link>
                            </>
                          )}
                        </div>
                        
                        <div className="px-2 pt-2 border-t border-gray-50">
                          <button 
                            onClick={() => { logout(); setIsDropdownOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Déconnexion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Burger Mobile */}
            <div className="lg:hidden flex items-center gap-4">
              {userRole !== "guest" && (
                <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {userRole === "client" ? 2 : 5}
                  </span>
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-900 focus:outline-none p-1"
                aria-label="Menu principal"
              >
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Mobile (Dropdown) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 z-40 max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="px-4 py-6 space-y-6">
              <nav className="flex flex-col gap-2">
                {activeLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-800 font-medium hover:text-blue-600 hover:bg-blue-50 px-3 py-3 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="pt-6 border-t border-gray-100">
                {userRole === "guest" ? (
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-2 px-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-base font-bold text-gray-900">
                          Visiteur
                        </p>
                        <p className="text-sm text-gray-500">
                          Non connecté
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center py-3.5 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                      Se connecter
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-2 px-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-base font-bold text-gray-900">
                          {user?.fullName || (userRole === "client" ? "Jean Dupont" : "Pro Services Inc.")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user?.email || (userRole === "client" ? "jean.dupont@example.com" : "contact@proservices.fr")}
                        </p>
                      </div>
                    </div>
                    
                    {userRole === "client" ? (
                      <>
                        <Link href="/mon-compte" className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                          <User className="w-5 h-5 text-gray-400" /> Mon Compte
                        </Link>
                        <Link href="/parametres" className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                          <Settings className="w-5 h-5 text-gray-400" /> Paramètres
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                          <LayoutDashboard className="w-5 h-5 text-gray-400" /> Dashboard
                        </Link>
                        <Link href="/mon-profil" className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                          <Briefcase className="w-5 h-5 text-gray-400" /> Mon Profil
                        </Link>
                      </>
                    )}
                    
                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-3 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl mt-2 w-full text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-500" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
