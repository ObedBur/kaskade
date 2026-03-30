"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/use-auth-guard';
import { User, Hammer } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Le téléphone est requis').max(15, 'Numéro trop long'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Au moins une majuscule, une minuscule et un chiffre requis'),
  confirmPassword: z.string(),
  role: z.enum(['CLIENT', 'PROVIDER'], {
    required_error: "Veuillez choisir votre profil",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAuthGuard();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CLIENT',
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterValues) => {
    setIsLoading(true);
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      };
      
      const response = await api.post('/auth/register', payload);
      toast.success("Compte créé avec succès. Bienvenue.");
      console.log('Register Response:', response.data);
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la création du compte.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) return null;

  return (
    <section className="flex flex-col justify-center px-4 md:px-8 py-8 md:py-12 bg-off-white">
      <div className="max-w-xl w-full mx-auto">
        <header className="mb-8 md:mb-10 text-center md:text-left">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ocre font-sans text-[9px] uppercase tracking-[0.25em] mb-3 block font-bold"
          >
            Nouveau Profil
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-chocolat mb-3"
          >
            Inscription.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-chocolat/85 text-xs font-sans leading-relaxed"
          >
            Rejoignez l'écosystème Kaskade et accédez à nos services architecturaux.
          </motion.p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* SÉLECTEUR DE RÔLE : Style Premium Architectural */}
          <div className="space-y-3 mb-8">
            <label className="block font-sans text-[9px] uppercase tracking-[0.2em] text-chocolat/60 font-bold">
              Nature du Profil
            </label>
            <div className="flex bg-white border border-ocre/10 p-1 rounded-full w-fit mx-auto md:mx-0">
              <button
                type="button"
                onClick={() => setValue('role', 'CLIENT')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
                  selectedRole === 'CLIENT' 
                  ? 'bg-chocolat text-white shadow-md' 
                  : 'text-chocolat/60 hover:text-chocolat hover:bg-ocre/5'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Client</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('role', 'PROVIDER')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
                  selectedRole === 'PROVIDER' 
                  ? 'bg-chocolat text-white shadow-md' 
                  : 'text-chocolat/60 hover:text-chocolat hover:bg-ocre/5'
                }`}
              >
                <Hammer className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Prestataire</span>
              </button>
            </div>
            {errors.role && (
              <p className="mt-1 text-[8px] text-red-500 uppercase tracking-widest font-bold">{errors.role.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nom complet */}
            <div className="group space-y-2">
              <label 
                className={`block font-sans text-[9px] uppercase tracking-[0.15em] transition-colors ${
                  errors.fullName ? 'text-red-500' : 'text-chocolat/60 group-focus-within:text-ocre'
                }`}
              >
                Nom complet
              </label>
              <input 
                {...register('fullName')}
                className={`w-full bg-white/50 backdrop-blur-sm border border-ocre/10 rounded-[4px] p-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/20 focus:border-ocre/40 transition-all outline-none ${
                    errors.fullName ? 'border-red-500 bg-red-50/10' : ''
                }`}
                placeholder="Ex: Jean Dupont" 
                type="text"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="mt-1 text-[8px] text-red-500 uppercase tracking-widest font-bold">{errors.fullName.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="group space-y-2">
              <label 
                className={`block font-sans text-[9px] uppercase tracking-[0.15em] transition-colors ${
                  errors.phone ? 'text-red-500' : 'text-chocolat/60 group-focus-within:text-ocre'
                }`}
              >
                Téléphone
              </label>
              <input 
                {...register('phone')}
                className={`w-full bg-white/50 backdrop-blur-sm border border-ocre/10 rounded-[4px] p-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/20 focus:border-ocre/40 transition-all outline-none ${
                    errors.phone ? 'border-red-500 bg-red-50/10' : ''
                }`}
                placeholder="+33 6 00 00 00 00" 
                type="tel"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="mt-1 text-[8px] text-red-500 uppercase tracking-widest font-bold">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Email Field - Full Width */}
          <div className="group space-y-2">
            <label 
              className={`block font-sans text-[9px] uppercase tracking-[0.15em] transition-colors ${
                errors.email ? 'text-red-500' : 'text-chocolat/60 group-focus-within:text-ocre'
              }`}
            >
              Email Officiel
            </label>
            <input 
              {...register('email')}
              className={`w-full bg-white/50 backdrop-blur-sm border border-ocre/10 rounded-[4px] p-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/20 focus:border-ocre/40 transition-all outline-none ${
                  errors.email ? 'border-red-500 bg-red-50/10' : ''
              }`}
              placeholder="votre@email.com" 
              type="email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-[8px] text-red-500 uppercase tracking-widest font-bold">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div className="group space-y-2">
              <label 
                className={`block font-sans text-[9px] uppercase tracking-[0.15em] transition-colors ${
                  errors.password ? 'text-red-500' : 'text-chocolat/60 group-focus-within:text-ocre'
                }`}
              >
                Clé d’Accès
              </label>
              <input 
                {...register('password')}
                className={`w-full bg-white/50 backdrop-blur-sm border border-ocre/10 rounded-[4px] p-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/20 focus:border-ocre/40 transition-all outline-none ${
                    errors.password ? 'border-red-500 bg-red-50/10' : ''
                }`}
                placeholder="••••••••" 
                type="password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-[8px] text-red-500 uppercase tracking-widest font-bold">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="group space-y-2">
              <label 
                className={`block font-sans text-[9px] uppercase tracking-[0.15em] transition-colors ${
                  errors.confirmPassword ? 'text-red-500' : 'text-chocolat/60 group-focus-within:text-ocre'
                }`}
              >
                Confirmation
              </label>
              <input 
                {...register('confirmPassword')}
                className={`w-full bg-white/50 backdrop-blur-sm border border-ocre/10 rounded-[4px] p-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/20 focus:border-ocre/40 transition-all outline-none ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50/10' : ''
                }`}
                placeholder="••••••••" 
                type="password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[8px] text-red-500 uppercase tracking-widest font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="pt-6 space-y-8">
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 px-8 bg-ocre text-chocolat font-bold uppercase tracking-[0.2em] text-[11px] rounded-[4px] shadow-[0_4px_20px_rgba(188,156,108,0.15)] hover:bg-chocolat hover:text-ocre hover:shadow-[0_8px_30px_rgba(50,27,19,0.2)] transition-all duration-500 disabled:opacity-50 cursor-pointer"
            >
                {isLoading ? 'Initialisation...' : "S'inscrire"}
            </button>
            <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-ocre/10 gap-4">
                <span className="text-chocolat/40 text-[9px] uppercase tracking-[0.1em] font-medium">Déjà enregistré dans le système ?</span>
                <Link 
                    href="/login" 
                    className="text-ocre font-bold uppercase tracking-[0.1em] text-[10px] hover:text-chocolat transition-all underline underline-offset-4 decoration-ocre/30"
                >
                    Connexion
                </Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
