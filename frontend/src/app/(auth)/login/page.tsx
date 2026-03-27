import React from 'react';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthFooter from '@/components/auth/AuthFooter';
import AuthHero from '@/components/auth/AuthHero';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-hidden">
      <AuthHeader />
      
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] pt-24">
        <AuthHero />
        <LoginForm />
      </main>

      <AuthFooter />

      {/* Background decoration elements (Architectural Style) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-60">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-slate-50 to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -translate-y-1/2 overflow-hidden"></div>
        <div className="absolute left-1/4 top-0 w-[1px] h-full bg-slate-100 overflow-hidden"></div>
      </div>
    </div>
  );
}
