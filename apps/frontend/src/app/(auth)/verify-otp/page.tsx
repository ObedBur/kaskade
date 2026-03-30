import React, { Suspense } from 'react';
import VerifyOtpForm from '@/components/auth/VerifyOtpForm';
import Link from 'next/link';

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-stretch overflow-hidden bg-off-white selection:bg-ocre/30">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center px-6 md:px-24 lg:px-32 z-10 bg-off-white">
        {/* Simplified Auth Header for OTP */}
        <header className="fixed top-0 left-0 p-8 md:p-12">
          <Link href="/">
            <h1 className="text-chocolat font-black tracking-tighter text-2xl uppercase">Kaskade</h1>
          </Link>
        </header>

        <Suspense fallback={<div className="text-chocolat/60 uppercase tracking-widest text-xs animate-pulse">Initialisation du protocole...</div>}>
          <VerifyOtpForm />
        </Suspense>

        {/* Structural Design elements (Architectural Timeline) */}
        <footer className="fixed bottom-0 left-0 w-full px-10 md:px-24 pb-12 hidden md:flex items-center gap-4 max-w-lg pointer-events-none">
          <div className="h-[2px] flex-1 bg-chocolat/10"></div>
          <div className="h-[2px] flex-1 bg-ocre"></div>
          <div className="h-[2px] flex-1 bg-chocolat/10"></div>
        </footer>
      </main>

      {/* Right Visual Monolith */}
      <aside className="hidden lg:block w-5/12 relative overflow-hidden bg-[#f0ede9]">
        <div className="absolute inset-0 bg-gradient-to-r from-off-white to-transparent z-10 w-48"></div>
        
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkmOjdIZ1-eRywZU5GkSm0Lzc4hVN7DW-5rlzpGukkQbjqU61VF_bgUKd7ZAlCk9Z7_VXSIe0mo2aIiZ4lCX4CxeKtqb8xuD5VDrMB9EBpzQkt02tmgw8l5lOrlohBqUYPFr6fYlDgoiHuTzwnCNv43wnLA3Ky2ZOn2qOAHjlEoo2xM8n38xiQbxGvJWWB090S5A_13tbFfKAN5KMwmyHo05GnL4myF18Ffcedo6Lim0Xsp2bcDTo_atNjZEQ-6nqgNXSSnvsWnVA" 
          alt="Architectural landscape"
          className="w-full h-full object-cover grayscale opacity-60 hover:scale-105 transition-transform duration-[30s]"
        />

        {/* Overlay quote */}
        <div className="absolute bottom-16 left-16 z-20 max-w-xs">
          <p className="text-chocolat/40 text-[9px] uppercase tracking-[0.3em] font-semibold mb-6">System Architecture</p>
          <div className="h-[1px] w-12 bg-ocre mb-8"></div>
          <p className="text-chocolat text-xs font-serif leading-relaxed italic opacity-80">
            "Simplicity is the ultimate sophistication. Precision in code, elegance in structure."
          </p>
        </div>

        {/* Dynamic scanline effect decoration */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(188,156,108,0.1)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20"></div>
      </aside>
    </div>
  );
}
