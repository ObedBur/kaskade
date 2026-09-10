"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';

export default function AuthHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <header className="fixed top-0 left-0 z-[100] w-full border-b border-white/5 bg-chocolat">
      <div className="arcture-container flex h-16 items-center justify-between">
        <BrandLogo />
        <nav className="flex items-center space-x-4 md:space-x-8">
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
