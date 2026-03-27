"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function AuthHero() {
  return (
    <section className="relative hidden md:flex items-end p-12 lg:p-16 overflow-hidden bg-off-white border-r border-ocre/20">
      <div className="absolute inset-0 z-0 opacity-100">
        {/* for login page */}
        <img
          className="w-full h-full object-cover grayscale brightness-110 contrast-100 opacity-20"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeUA5zs2-THfU68BqllIlnOLA9Vu4l0eVQ6rg_GW6ISJTBkElYBF3uS9xZzTSptY9zuEU964esWdxxJ0NiraO8mP_AydURfUZuiv9mb2R_3VVsn8E9_RZtZRW6CadFAdVMalrix42jfoiShmg4rB4hZkRrGDYB0xRpK5oOx9hZthVZnO8B9A3E0eCZnOOuqzX-MWmKAhvj0-NkVgHW_B9KQFjQ_cqvN9jHN-SMg4_9KAJRSp762voRWvxbQb2ceXf7mC-Tzuai-eY"
          alt="Architectural skyscraper grayscale"
        />
      </div>
      {/* for register page */}
      <div className="absolute inset-0 z-0 opacity-60">
        <img alt="Architectural perspective" className="w-full h-full object-cover grayscale brightness-75" data-alt="Monolithic brutalist architecture with sharp concrete angles and dramatic shadows against a deep twilight sky, minimalist and high-end aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzUPy7knebMJaIVa8U9bWJvDoPn52-F2ctxyQIA8EmaA4hwaHlSbZvdaR4K-3e8iByHHyw-pEc_RDlKciey7CSCACin-7CC62fOYVRLXpcx7O64yNfYfkvP1DlpX0LDi3Aml7pivU8JelAWFZFQo52YweA_IwdNEsghk6VATd7dajDPlBWAdgtq9WkSluLv4blxDq0OahjYP3AtrhIw5CvSpYq0L4QGg-qdEEbeCgEY1nx_SfWY3NaZjr5aIN5tLI0QiKDhvG9C_M" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-off-white via-transparent to-transparent"></div>

      <div className="relative z-10 w-full">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-4xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.1] text-chocolat"
        >
          Accès.<br />Contrôle.<br />Défini.
        </motion.h1>

        <div className="mt-8 max-w-xs border-l-2 border-ocre pl-6">
          <p className="text-chocolat/70 font-sans text-[9px] uppercase tracking-[0.15em] leading-relaxed">
            L'intégrité architecturale rencontre la souveraineté numérique. Entrez dans les systèmes monolithiques de Kaskade.
          </p>
        </div>

        {/* Architectural Metadata decoration */}
        <div className="mt-16 lg:mt-24 grid grid-cols-2 gap-6 opacity-60 pointer-events-none select-none">
          <div className="space-y-1">
            <span className="block font-sans text-[7px] uppercase tracking-widest text-ocre font-bold">Lat: 40.7128° N</span>
            <span className="block font-sans text-[7px] uppercase tracking-widest text-ocre font-bold">Long: 74.0060° W</span>
          </div>
          <div className="text-right space-y-1">
            <span className="block font-sans text-[7px] uppercase tracking-widest text-ocre font-bold">V: 2.0.4-Alpha</span>
            <span className="block font-sans text-[7px] uppercase tracking-widest text-ocre font-bold">S: Chiffré</span>
          </div>
        </div>
      </div>
    </section>
  );
}
