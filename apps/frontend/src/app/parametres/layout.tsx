"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Bell, AlertTriangle, Loader2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/lib/auth-context";

const SETTINGS_TABS = [
  { name: "Sécurité", href: "/parametres", icon: Shield },
  { name: "Notifications", href: "/parametres/notifications", icon: Bell },
  { name: "Zone de Danger", href: "/parametres/danger", icon: AlertTriangle, danger: true },
];

export default function ParametresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FCFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow w-full max-w-[1200px] mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* En-tête de la page */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-2">Configuration</h2>
          <h1 className="text-3xl md:text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
            Paramètres <span className="text-[#BC9C6C]">Compte.</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Navigation latérale (Responsive: horizontal on mobile, vertical on desktop) */}
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-2 lg:w-64 shrink-0 scrollbar-hide">
            {SETTINGS_TABS.map((tab) => {
              // Vérifie si l'onglet est actif. (Pour "/parametres", on s'assure d'une correspondance exacte)
              const isActive = tab.href === "/parametres" 
                ? pathname === "/parametres" 
                : pathname?.startsWith(tab.href);
              
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                    ${isActive 
                      ? tab.danger 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-white text-[#321B13] border border-[#321B13]/10 shadow-sm'
                      : 'text-[#321B13]/60 hover:bg-white/50 hover:text-[#321B13]'
                    }
                    ${tab.danger && !isActive ? 'hover:text-red-600 hover:bg-red-50/50' : ''}
                  `}
                >
                  <tab.icon className={`w-4 h-4 ${isActive && tab.danger ? 'text-red-600' : isActive ? 'text-[#BC9C6C]' : ''}`} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>

          {/* Contenu principal */}
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}
