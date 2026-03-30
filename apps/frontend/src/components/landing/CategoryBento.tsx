"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryBento() {
  const categories = [
    {
        title: "INGÉNIERIE & TECH.",
        desc: "45 experts certifiés accessibles via notre protocole.",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
        colSpan: "lg:col-span-2 lg:row-span-2",
        type: "Architecture Intérieure"
    },
    {
        title: "MAISON & CONFORT.",
        desc: "Services de prestige pour résidences d'exception.",
        image: "https://images.unsplash.com/photo-1600585154340-be6048805f77?q=80&w=2070&auto=format&fit=crop",
        colSpan: "lg:col-span-2 lg:row-span-1",
        type: "Artisanat d'Exception"
    },
    {
        title: "BIEN-ÊTRE.",
        desc: "Coaching de vie",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
        colSpan: "lg:col-span-1 lg:row-span-1",
        type: "Maison & Style"
    },
    {
        title: "ATELIER.",
        desc: "Artisanat local",
        image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop",
        colSpan: "lg:col-span-1 lg:row-span-1",
        type: "Tech Innov"
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-off-white">
      <div className="arcture-container">
        
        {/* Arcture Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-10">
          <div className="max-w-[700px]">
            <span className="text-ocre font-bold tracking-[0.25em] text-[10px] uppercase mb-6 block">PORTFOLIO SÉLECTIF</span>
            <h2 className="text-chocolat leading-none uppercase">
                ÉCOSYSTÈME <br/> <span className="text-ocre italic lowercase serif">sélectif.</span>
            </h2>
          </div>
          <button className="group flex items-center justify-between gap-6 border-b border-ocre/30 text-chocolat pb-4 uppercase text-[10px] font-bold tracking-widest hover:border-chocolat transition-all w-full md:w-auto">
            DÉCOUVRIR LA COLLECTION <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
          </button>
        </div>

        {/* Bento Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 auto-rows-[350px] md:auto-rows-[400px]">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={`relative group overflow-hidden rounded-sm border border-ocre/5 shadow-2xl transition-all duration-700 ${cat.colSpan}`}
            >
              <img 
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
                src={cat.image} 
                alt={cat.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-chocolat/90 via-chocolat/20 to-transparent"></div>
              
              <div className="absolute top-8 left-8">
                <span className="bg-ocre text-chocolat px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg">
                    {cat.type}
                </span>
              </div>
              
              <div className="absolute bottom-0 left-0 p-10 md:p-12 w-full">
                <h3 className="text-2xl md:text-3xl font-bold text-off-white mb-3 uppercase tracking-tighter">
                    {cat.title}
                </h3>
                <p className="text-ocre/80 text-sm font-medium tracking-wide leading-relaxed">
                    {cat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
