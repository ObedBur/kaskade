"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle, Briefcase, History, MapPin, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const applySchema = z.object({
  motivation: z.string().min(20, 'Votre motivation doit faire au moins 20 caractères'),
  metier: z.string().min(3, 'Veuillez préciser votre métier'),
  experience: z.string().min(1, 'Veuillez préciser votre expérience'),
  bio: z.string().optional(),
  quartier: z.string().min(2, 'Le quartier est requis'),
  avatarUrl: z.string().optional(),
});

type ApplyValues = z.infer<typeof applySchema>;

export default function DevenirPrestataireForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      quartier: user?.quartier || '',
      avatarUrl: user?.avatarUrl || '',
    }
  });

  const avatarUrlWatch = watch('avatarUrl');

  const onSubmit = async (data: ApplyValues) => {
    setIsLoading(true);
    try {
      await api.post('/providers/apply', data);
      toast.success("Candidature soumise avec succès !");
      setIsSubmitted(true);
      setTimeout(() => {
        router.push('/mes-demandes');
      }, 5000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la soumission de la candidature.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 md:p-16 text-center border border-ocre/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-ocre/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-ocre/10 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="w-10 h-10 text-ocre" />
          </div>
          <h3 className="text-3xl font-serif font-black text-chocolat mb-6 uppercase tracking-tighter">Dossier Complet.</h3>
          <p className="text-chocolat/70 text-sm leading-relaxed max-w-sm mb-10">
            Merci pour votre candidature détaillée. Nos experts vont analyser votre profil professionnel avec la plus grande attention.
          </p>
          <button 
            onClick={() => router.push('/mes-demandes')}
            className="text-ocre font-black uppercase tracking-[0.2em] text-[10px] hover:text-chocolat transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto">
      <header className="mb-12">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-ocre font-sans text-[10px] uppercase tracking-[0.3em] mb-4 block font-black"
        >
          JOIN THE ELITE NETWORK
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-chocolat mb-6 uppercase leading-none"
        >
          Devenir <br />
          <span className="text-ocre italic lowercase serif capitalize">Expert Kaskade.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-chocolat/70 text-sm md:text-base font-sans leading-relaxed border-l-2 border-ocre pl-6"
        >
          Complétez votre profil professionnel pour rejoindre notre écosystème d'artisans et d'experts d'exception.
        </motion.p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white/50 backdrop-blur-md p-8 md:p-12 border border-ocre/10 shadow-xl">
        
        {/* Photo de Profil Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-ocre/10">
           <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-ocre/20 overflow-hidden bg-off-white flex items-center justify-center transition-all group-hover:border-ocre/50">
                 {avatarUrlWatch ? (
                   <img src={avatarUrlWatch} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="flex flex-col items-center text-ocre/30">
                      <UserIcon className="w-8 h-8 mb-1" />
                      <span className="text-[7px] font-black">PHOTO</span>
                   </div>
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-chocolat rounded-full flex items-center justify-center text-ocre shadow-lg border border-white/10">
                 <MapPin className="w-3 h-3" /> {/* Placeholder icon for "upload" feel */}
              </div>
           </div>
           <div className="flex-1 space-y-2 w-full">
              <label className="text-[9px] uppercase font-black tracking-[0.2em] text-chocolat/50">
                Lien de votre photo de profil
              </label>
              <input
                {...register('avatarUrl')}
                className="w-full bg-white border border-ocre/10 rounded-sm p-3 text-[11px] text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/30 focus:border-ocre/50 transition-all outline-none"
                placeholder="https://images.unsplash.com/votre-photo..."
                disabled={isLoading}
              />
              <p className="text-[7px] text-chocolat/30 uppercase font-bold tracking-widest">
                Utilisez une URL d'image publique (Unsplash, Google Drive, etc.) pour votre profil.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Métier */}
          <div className="group space-y-2">
            <label className={`text-[9px] uppercase font-black tracking-[0.2em] transition-colors ${errors.metier ? 'text-red-500' : 'text-chocolat/50 group-focus-within:text-ocre'}`}>
              Spécialité / Métier
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ocre/40" />
              <input
                {...register('metier')}
                className={`w-full bg-white border border-ocre/10 rounded-sm py-4 pl-12 pr-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/30 focus:border-ocre/50 transition-all outline-none ${errors.metier ? 'border-red-500 bg-red-50/5' : ''}`}
                placeholder="Ex: Architecte d'intérieur"
                disabled={isLoading}
              />
            </div>
            {errors.metier && <p className="text-[8px] text-red-500 uppercase font-black">{errors.metier.message}</p>}
          </div>

          {/* Expérience */}
          <div className="group space-y-2">
            <label className={`text-[9px] uppercase font-black tracking-[0.2em] transition-colors ${errors.experience ? 'text-red-500' : 'text-chocolat/50 group-focus-within:text-ocre'}`}>
              Expérience
            </label>
            <div className="relative">
              <History className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ocre/40" />
              <input
                {...register('experience')}
                className={`w-full bg-white border border-ocre/10 rounded-sm py-4 pl-12 pr-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/30 focus:border-ocre/50 transition-all outline-none ${errors.experience ? 'border-red-500 bg-red-50/5' : ''}`}
                placeholder="Ex: 5 ans"
                disabled={isLoading}
              />
            </div>
            {errors.experience && <p className="text-[8px] text-red-500 uppercase font-black">{errors.experience.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Quartier */}
           <div className="group space-y-2">
            <label className={`text-[9px] uppercase font-black tracking-[0.2em] transition-colors ${errors.quartier ? 'text-red-500' : 'text-chocolat/50 group-focus-within:text-ocre'}`}>
              Zone d'activité (Quartier)
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ocre/40" />
              <input
                {...register('quartier')}
                className={`w-full bg-white border border-ocre/10 rounded-sm py-4 pl-12 pr-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/30 focus:border-ocre/50 transition-all outline-none ${errors.quartier ? 'border-red-500 bg-red-50/5' : ''}`}
                placeholder="Ex: Himbi"
                disabled={isLoading}
              />
            </div>
            {errors.quartier && <p className="text-[8px] text-red-500 uppercase font-black">{errors.quartier.message}</p>}
          </div>

          {/* Bio Rapide */}
          <div className="group space-y-2">
            <label className={`text-[9px] uppercase font-black tracking-[0.2em] transition-colors ${errors.bio ? 'text-red-500' : 'text-chocolat/50 group-focus-within:text-ocre'}`}>
              Courte Bio (Optionnel)
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ocre/40" />
              <input
                {...register('bio')}
                className="w-full bg-white border border-ocre/10 rounded-sm py-4 pl-12 pr-4 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/30 focus:border-ocre/50 transition-all outline-none"
                placeholder="Un mot sur vous..."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Motivation */}
        <div className="group space-y-3">
          <div className="flex justify-between items-end">
            <label className={`text-[9px] uppercase font-black tracking-[0.2em] transition-colors ${errors.motivation ? 'text-red-500' : 'text-chocolat/50 group-focus-within:text-ocre'}`}>
              Pourquoi nous rejoindre ?
            </label>
            <span className="text-[8px] text-chocolat/30 font-bold uppercase tracking-widest">Min. 20 caractères</span>
          </div>
          <textarea
            {...register('motivation')}
            rows={4}
            className={`w-full bg-white border border-ocre/10 rounded-sm p-5 text-sm text-chocolat placeholder:text-chocolat/20 focus:ring-1 focus:ring-ocre/30 focus:border-ocre/50 transition-all outline-none resize-none ${errors.motivation ? 'border-red-500 bg-red-50/5' : ''}`}
            placeholder="Décrivez ce qui fait de vous un expert d'exception..."
            disabled={isLoading}
          />
          {errors.motivation && (
            <p className="mt-2 text-[8px] text-red-500 uppercase tracking-widest font-black">{errors.motivation.message}</p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-arcture py-6 flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <span className="animate-pulse">Transmission du dossier...</span>
            ) : (
              <>
                <span>SOUMETTRE MON DOSSIER D'EXPERT</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[8px] text-chocolat/40 font-bold uppercase tracking-widest leading-loose max-w-sm mx-auto">
          En soumettant ce dossier, vous certifiez l'exactitude des informations fournies pour l'examen de votre candidature.
        </p>
      </form>
    </div>
  );
}
