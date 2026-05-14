"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useAuthGuard } from '@/lib/use-auth-guard';

import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  // Redirect if already authenticated
  const { isLoading: isAuthLoading } = useAuthGuard();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { tokens, user } = response.data;
      // Store tokens & redirect to home
      login(tokens, user);
      toast.success("Authentification réussie. Bienvenue dans le système.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Échec de l'initialisation de la session.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) return null;

  return (
    <section className="flex flex-col justify-center px-4 min-[480px]:px-8 py-8 md:py-12 bg-off-white min-[1440px]:p-12">
      <div className="w-full mx-auto max-w-[450px] min-[1440px]:max-w-[500px]">
        <header className="mb-8 md:mb-10 text-center md:text-left">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ocre font-sans text-[9px] uppercase tracking-[0.25em] mb-3 block font-bold"
          >
            Authentification Système
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-chocolat mb-3"
          >
            Bienvenue.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-chocolat/85 text-xs font-sans leading-relaxed"
          >
            Identifiez-vous pour accéder à votre espace sécurisé Kaskade.
          </motion.p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            {/* Email Field */}
            <div className="group space-y-2">
              <label
                className={`block font-sans text-[9px] uppercase tracking-[0.15em] transition-colors ${errors.email ? 'text-red-500' : 'text-chocolat/60 group-focus-within:text-ocre'
                  }`}
              >
                Identification (Email)
              </label>
              <input
                {...register('email')}
                className={`w-full min-h-[44px] py-3 px-4 bg-white/50 backdrop-blur-sm border border-ocre/10 rounded-[4px] text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/20 focus:border-ocre/40 transition-all outline-none ${errors.email ? 'border-red-500 bg-red-50/10' : ''
                  }`}
                placeholder="kaskade@gmail.com"
                type="email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-[8px] text-red-500 uppercase tracking-widest font-bold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="group space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label
                  className={`block font-sans text-[9px] uppercase tracking-[0.15em] transition-colors ${errors.password ? 'text-red-500' : 'text-chocolat/60 group-focus-within:text-ocre'
                    }`}
                >
                  Clé d'Accès
                </label>
                <Link
                  href="/forgot-password"
                  className="text-ocre font-sans text-[8px] uppercase tracking-[0.1em] hover:text-chocolat transition-colors font-bold underline underline-offset-4 decoration-ocre/20"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  className={`w-full min-h-[44px] py-3 px-4 pr-12 bg-white/50 backdrop-blur-sm border border-ocre/10 rounded-[4px] text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/20 focus:border-ocre/40 transition-all outline-none ${errors.password ? 'border-red-500 bg-red-50/10' : ''
                    }`}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolat/30 hover:text-ocre transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[8px] text-red-500 uppercase tracking-widest font-bold">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="pt-6 space-y-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 px-8 bg-ocre text-chocolat font-bold uppercase tracking-[0.2em] text-[11px] rounded-[4px] shadow-[0_4px_20px_rgba(188,156,108,0.15)] hover:bg-chocolat hover:text-ocre hover:shadow-[0_8px_30px_rgba(50,27,19,0.2)] transition-all duration-500 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Connexion...' : 'Connexion'}
            </button>
            <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-ocre/10 gap-4">
              <span className="text-chocolat/40 text-[9px] uppercase tracking-[0.1em] font-medium">Nouveau ici ?</span>
              <Link
                href="/register"
                className="text-ocre font-bold uppercase tracking-[0.1em] text-[10px] hover:text-chocolat transition-all underline underline-offset-4 decoration-ocre/30"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
