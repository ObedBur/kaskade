"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="fixed top-0 w-full z-[100] bg-off-white/80 backdrop-blur-md border-b border-ocre/10">
      <nav className="arcture-container py-5 flex justify-between items-center">
        
        {/* Arcture Brand Block */}
        <Link href="/" className="flex items-center gap-2 group">
           <span className="text-2xl md:text-3xl font-black font-sans uppercase tracking-tighter text-chocolat group-hover:text-ocre transition-colors">
            Kaskade.
           </span>
        </Link>
        
        {/* Arcture Desktop Nav - Gotham Scales */}
        <div className="hidden lg:flex items-center gap-10 font-sans uppercase text-[10px] tracking-[0.2em] font-bold">
          <Link className="text-ocre hover:text-chocolat transition-all" href="#">MARKETPLACE</Link>
          <Link className="text-chocolat/60 hover:text-ocre transition-all" href="#">SERVICES</Link>
          <Link className="text-chocolat/60 hover:text-ocre transition-all" href="#">PROCESS</Link>
          <Link className="text-chocolat/60 hover:text-ocre transition-all" href="#">CONTACT</Link>
        </div>
        
        {/* Arcture Auth Block */}
        <div className="flex items-center gap-6 md:gap-8">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-[9px] uppercase font-bold text-chocolat/40 tracking-[0.2em]">PROTOCOL ACTIVE: {user?.fullName.split(' ')[0]}</span>
              <button 
                onClick={logout}
                className="btn-arcture py-2 px-6 !w-auto text-[9px] lowercase opacity-80 hover:opacity-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 md:gap-8">
              <Link href="/login" className="text-chocolat/60 hover:text-ocre transition-all font-bold uppercase text-[10px] tracking-widest">
                LOGIN
              </Link>
              <Link 
                href="/register" 
                className="btn-arcture !w-auto py-2.5 px-6 md:px-10"
              >
                JOIN THE ELITE
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
