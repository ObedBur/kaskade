import React from 'react';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthFooter from '@/components/auth/AuthFooter';
import AuthHero from '@/components/auth/AuthHero';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white font-sans overflow-hidden">
      <AuthHeader />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] pt-24">
        <AuthHero />
        <div className="flex items-center justify-center p-6 md:p-12 lg:p-24 bg-off-white">
          <RegisterForm />
        </div>
      </main>

      <AuthFooter />

      {/* Background decoration elements (Architectural Style) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-60">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-ocre/5 to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-ocre/10 -translate-y-1/2 overflow-hidden"></div>
        <div className="absolute left-1/4 top-0 w-[1px] h-full bg-ocre/10 overflow-hidden"></div>
      </div>
    </div>
  );
}
