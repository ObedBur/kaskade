"use client";

import { Search, SlidersHorizontal, MapPin, Calculator, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { generateMockServices, Service } from "@/lib/mock-data";
import ServiceCard from "./ServiceCard";

export default function ServiceExplorer() {
  const filters = [
    { name: "Catégorie", icon: SlidersHorizontal },
    { name: "Budget", icon: Calculator },
    { name: "Disponibilité", icon: Calendar },
    { name: "Localisation", icon: MapPin },
  ];

  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Génération des données de test via faker.js
    setServices(generateMockServices(18));
  }, []);

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden font-sans border-y border-ocre/5">
      
      {/* Éléments de structure (Glows Kaskade) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ocre/5 rounded-full blur-[100px] -z-10 translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-chocolat/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* EN-TÊTE : Inspiré de Stitch mais Style Kaskade */}
        <div className="max-w-4xl mb-16 md:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-ocre font-black text-[11px] uppercase tracking-[0.4em] mb-8"
          >
            L'ÉCOSYSTÈME
          </motion.p>
          
          <h2 className="text-5xl md:text-7xl font-black text-chocolat tracking-tighter leading-none uppercase mb-8">
            Trouver un <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocre to-[#d4af37] italic font-serif font-normal lowercase">service.</span>
          </h2>
          
          <p className="text-chocolat/60 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
            Parcourez et demandez des services locaux certifiés pour tous vos besoins quotidiens, avec la garantie de qualité Kaskade.
          </p>
        </div>

        {/* BARRE DE RECHERCHE & FILTRES : Style Premium Architectural */}
        <div className="flex flex-col gap-10">
          
          {/* Bloc de Recherche (Inspiré de Stitch Search Bar) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex flex-col md:flex-row items-stretch gap-4 p-2 bg-off-white rounded-[2.5rem] border border-ocre/10 shadow-xl shadow-chocolat/5 focus-within:border-ocre/30 transition-colors"
          >
            <div className="flex-1 flex items-center px-8 py-4 sm:py-6">
              <Search className="w-6 h-6 text-ocre mr-4" />
              <input 
                type="text" 
                placeholder="Quel service recherchez-vous ?"
                className="w-full bg-transparent border-none focus:ring-0 text-chocolat font-bold text-sm uppercase tracking-widest placeholder:text-chocolat/30"
              />
            </div>
            
            <button className="bg-chocolat text-white px-12 py-5 sm:py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-ocre hover:text-chocolat transition-all duration-300 shadow-lg shadow-chocolat/20 active:scale-95 group">
               RECHERCHER
               <ChevronRight className="w-4 h-4 inline-block ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* FILTRES (Chips style minimal) */}
          <div className="flex flex-wrap items-center gap-4">
            {filters.map((filter, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 px-6 py-4 bg-white border border-ocre/10 rounded-full hover:border-ocre hover:bg-off-white transition-all group shadow-sm"
              >
                <filter.icon className="w-4 h-4 text-chocolat group-hover:text-ocre transition-colors" />
                <span className="text-[11px] font-black text-chocolat uppercase tracking-widest">{filter.name}</span>
              </motion.button>
            ))}
            
            <div className="ml-auto">
               <button className="text-[10px] font-black text-ocre uppercase tracking-widest border-b border-ocre/20 hover:border-ocre pb-1 transition-all">
                  Effacer les filtres
               </button>
            </div>
          </div>

        </div>

        {/* GRILLE DE SERVICES (4 colonnes pour un meilleur équilibre) */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* CTA FINAL pour plus de services */}
        <div className="mt-20 flex justify-center">
           <button className="border-b-2 border-ocre/30 text-chocolat px-8 py-4 font-black text-xs uppercase tracking-[0.3em] hover:border-ocre transition-all active:scale-95">
              Explorer tous les experts
           </button>
        </div>

      </div>
    </section>
  );
}
