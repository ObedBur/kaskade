"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const lastAutoVerifiedOtpRef = useRef<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { isLoading: isAuthLoading } = useAuthGuard();

  const updateOtp = (value: string, startIndex: number) => {
    const digits = value.replace(/\D/g, '').slice(0, 6 - startIndex);
    if (!digits) return;

    const nextOtp = [...otp];
    digits.split('').forEach((digit, offset) => {
      nextOtp[startIndex + offset] = digit;
    });
    setOtp(nextOtp);

    const nextFocusIndex = Math.min(startIndex + digits.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (!element.value) {
      setOtp(otp.map((digit, currentIndex) => currentIndex === index ? '' : digit));
      return;
    }

    updateOtp(element.value, index);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = useCallback(async (otpValue: string) => {
    if (otpValue.length !== 6 || isLoading) return;
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
  }, [email, isLoading, router]);

  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      lastAutoVerifiedOtpRef.current = null;
      return;
    }
    if (lastAutoVerifiedOtpRef.current === otpValue) return;

    lastAutoVerifiedOtpRef.current = otpValue;
    void verifyOtp(otpValue);
  }, [otp, verifyOtp]);

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
    <div className="w-full mx-auto max-w-[450px] min-[1440px]:max-w-[500px]">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-chocolat font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-4 sm:mb-6 md:mb-10"
      >
        Verify.
      </motion.h2>

      <div className="space-y-2 md:space-y-4 mb-8 md:mb-16">
        <p className="text-ocre font-medium uppercase tracking-[0.2em] text-[8px] md:text-[10px]">Protocol de Sécurité</p>
        <p className="text-chocolat/80 text-sm md:text-lg leading-relaxed">
          Nous avons envoyé un code à <span className="font-bold text-chocolat">{email || 'votre email'}</span>. <br/>Entrez les identifiants pour continuer.
        </p>
      </div>

      <div className="space-y-8 md:space-y-12">
        <div className="flex gap-1 min-[480px]:gap-2 sm:gap-4 justify-between">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoFocus={index === 0}
              ref={(el) => { inputRefs.current[index] = el; }}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onPaste={(e) => {
                e.preventDefault();
                updateOtp(e.clipboardData.getData('text'), index);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={isLoading}
              aria-label={`Chiffre ${index + 1} du code de vérification`}
              className="w-full h-12 sm:h-16 lg:h-20 text-center text-xl md:text-3xl font-light bg-white rounded-lg md:rounded-xl border border-chocolat/10 text-chocolat focus:ring-2 focus:ring-ocre/30 focus:border-ocre/50 transition-all outline-none"
              placeholder="·"
            />
          ))}
        </div>

        <div className="flex flex-col gap-8">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-chocolat/50" aria-live="polite">
            {isLoading ? 'Vérification du code…' : 'La vérification démarre automatiquement après le 6e chiffre.'}
          </p>

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
      </div>
    </div>
  );
}
