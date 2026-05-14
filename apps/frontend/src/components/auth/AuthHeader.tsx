"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <header className="fixed top-0 left-0 w-full bg-off-white/80 backdrop-blur-md text-chocolat border-b border-ocre/10 z-[100]">
      <div className="flex justify-between items-center w-full px-8 md:px-20 py-6">
        <Link href="/">
          <h1 className="text-xl font-black tracking-tighter text-[#321B13] uppercase">
             Kaskade<span className="text-[#BC9C6C]">.</span>
          </h1>
        </Link>
        <nav className="flex items-center space-x-8">
          <Link 
            href="/" 
            className="text-chocolat/60 uppercase tracking-[0.05em] text-[10px] font-bold hover:text-ocre transition-all duration-300 active:scale-95"
          >
            Accueil
          </Link>
          <Link 
            href={isLoginPage ? '/register' : '/login'} 
            className="text-chocolat font-bold uppercase tracking-[0.05em] text-[10px] hover:bg-chocolat hover:text-ocre transition-all duration-300 active:scale-95 border border-chocolat px-5 py-2 rounded-[6px]"
          >
            {isLoginPage ? 'Inscription' : 'Se connecter'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
