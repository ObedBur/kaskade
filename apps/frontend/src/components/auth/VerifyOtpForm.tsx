"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/lib/use-auth-guard';

export default function VerifyOtpForm() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { isLoading: isAuthLoading } = useAuthGuard();

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      toast.error("Veuillez entrer le code complet.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', {
        email: email || '', // On devrait idéalement avoir l'email en query param
        otp: otpValue
      });
      toast.success("Vérification réussie !");
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Code invalide ou expiré.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email manquant pour le renvoi.");
      return;
    }
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success("Nouveau code envoyé !");
    } catch (error: any) {
      toast.error("Erreur lors du renvoi du code.");
    }
  };

  if (isAuthLoading) return null;

  return (
    <div className="max-w-md w-full">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-chocolat font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-6 md:mb-10"
      >
        Verify.
      </motion.h2>

      <div className="space-y-2 md:space-y-4 mb-8 md:mb-16">
        <p className="text-ocre font-medium uppercase tracking-[0.2em] text-[8px] md:text-[10px]">Protocol de Sécurité</p>
        <p className="text-chocolat/80 text-sm md:text-lg leading-relaxed">
          Nous avons envoyé un code à <span className="font-bold text-chocolat">{email || 'votre email'}</span>. <br/>Entrez les identifiants pour continuer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
        <div className="flex gap-2 md:gap-4 justify-between">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoFocus={index === 0}
              ref={(el) => { inputRefs.current[index] = el; }}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-full h-12 md:h-20 text-center text-xl md:text-3xl font-light bg-white rounded-lg md:rounded-xl border border-chocolat/10 text-chocolat focus:ring-2 focus:ring-ocre/30 focus:border-ocre/50 transition-all outline-none"
              placeholder="·"
            />
          ))}
        </div>

        <div className="flex flex-col gap-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 px-8 rounded-xl bg-ocre text-chocolat font-bold text-sm uppercase tracking-widest hover:bg-chocolat hover:text-ocre transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </button>

          <div className="flex justify-between items-center">
            <button
              onClick={handleResend}
              type="button"
              className="text-chocolat/60 hover:text-ocre transition-colors text-[10px] uppercase tracking-[0.15em] font-bold group"
            >
              Renvoyer le code <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
            <Link
              href="/login"
              className="text-chocolat/30 hover:text-chocolat transition-colors text-[10px] uppercase tracking-[0.15em] font-bold"
            >
              Retour connexion
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
