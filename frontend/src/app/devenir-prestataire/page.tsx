"use client";

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import DevenirPrestataireForm from '@/components/auth/DevenirPrestataireForm';
import { motion } from 'framer-motion';
import { useRequireAuth } from '@/lib/use-require-auth';

export default function DevenirPrestatairePage() {
  // Seul un CLIENT peut postuler. Si déjà PROVIDER, on redirige vers le dashboard.
  const { user, isLoading } = useRequireAuth(undefined, ['CLIENT'], '/dashboard');

  if (isLoading || !user) return null;

  return (
    <main className="bg-[#FCFBF7] min-h-screen font-sans selection:bg-[#BC9C6C] selection:text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-ocre/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-ocre/5 rounded-full blur-[100px]"></div>
      </div>

      <Navbar />

      <section className="relative z-10 pt-32 pb-24 md:pt-48 md:pb-48 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Colonne de gauche : Titre & Info */}
          <div className="lg:col-span-7">
             <DevenirPrestataireForm />
          </div>

          {/* Colonne de droite : Avantages & Image */}
          <div className="lg:col-span-5 space-y-16 mt-12 lg:mt-32">
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.3 }}
               className="space-y-12 border-l border-ocre/10 pl-10"
             >
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-ocre mb-6">01. Visibilité</h4>
                   <p className="text-chocolat/60 text-sm leading-relaxed">
                      Accédez à une clientèle premium recherchant l'excellence et le savoir-faire authentique.
                   </p>
                </div>
                
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-ocre mb-6">02. Gestion Simplifiée</h4>
                   <p className="text-chocolat/60 text-sm leading-relaxed">
                      Une interface intuitive pour gérer vos missions, vos paiements et votre calendrier en un seul endroit.
                   </p>
                </div>

                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-ocre mb-6">03. Paiements Sécurisés</h4>
                   <p className="text-chocolat/60 text-sm leading-relaxed">
                      Système d'acompte automatique et paiements garantis via notre plateforme intégrée.
                   </p>
                </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, delay: 0.5 }}
               className="relative aspect-[4/5] grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl"
             >
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" 
                  alt="Artisan Expert" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-[20px] border-white/10 m-6"></div>
             </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
