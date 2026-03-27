"use client";

import { UserSearch, MessageCircle, ShieldCheck, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Process() {
  const steps = [
    {
      id: "01",
      title: "Exploration.",
      desc: "Découvrez des talents locaux rigoureusement sélectionnés. Laissez-vous inspirer par l'excellence.",
      icon: UserSearch
    },
    {
      id: "02",
      title: "Dialogue.",
      desc: "L'humain au sommet. Échangez via notre interface sécurisée pour sculpter votre vision.",
      icon: MessageCircle
    },
    {
      id: "03",
      title: "Protocole.",
      desc: "Validation mutuelle. Un acompte sous séquestre initie la phase opérationnelle en toute sécurité.",
      icon: ShieldCheck
    },
    {
      id: "04",
      title: "Réussite.",
      desc: "Validez le livrable. Le transfert est finalisé, scellant une collaboration de prestige.",
      icon: Star
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-white border-y border-ocre/5">
      <div className="arcture-container">
        
        {/* Arcture Section Header */}
        <div className="mb-24 md:mb-32 text-center md:text-left max-w-4xl">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-ocre font-bold tracking-[0.25em] uppercase text-[10px] mb-8 block lg:mx-0 mx-auto"
          >
            NOTRE MÉTHODOLOGIE
          </motion.span>
          <h2 className="text-chocolat leading-none uppercase mb-10">
            DE LA VISION À LA <br />
            <span className="text-ocre italic lowercase serif">perfection.</span>
          </h2>
          <div className="h-px w-32 bg-ocre mb-12 opacity-30 lg:mx-0 mx-auto"></div>
          <p className="text-chocolat/85 text-lg leading-relaxed max-w-2xl font-sans lg:mx-0 mx-auto">
            Nous avons éliminé les frictions systémiques pour que vous puissiez vous concentrer sur l'essentiel : la création pure.
          </p>
        </div>

        {/* Arcture Responsive Grid: Mobile-First */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 relative">
          
          {/* Arcture connecting line - hidden on mobile */}
          <div className="hidden lg:block absolute top-[60px] left-[15%] w-[70%] h-px bg-ocre/20" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative flex flex-col items-center md:items-start text-center md:text-left group"
            >
              {/* Step indicator/icon container */}
              <div className="relative mb-12">
                <div className={`
                    relative w-[110px] h-[110px] border border-ocre/20 bg-white flex items-center justify-center 
                    transition-all duration-700 group-hover:bg-ocre shadow-lg group-hover:-translate-y-2
                `}>
                  <step.icon className="w-8 h-8 text-ocre group-hover:text-chocolat transition-colors duration-500" strokeWidth={1} />
                  
                  {/* Step ID Badge */}
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-chocolat flex items-center justify-center text-[10px] font-bold text-ocre font-sans shadow-xl tracking-[0.2em]">
                    {step.id}
                  </div>
                </div>
              </div>

              {/* Step Typography */}
              <h3 className="text-2xl font-bold mb-4 text-chocolat uppercase tracking-tighter group-hover:text-ocre transition-colors transition-all duration-500">
                {step.title}
              </h3>
              <p className="text-chocolat/70 text-sm leading-relaxed px-4 md:px-0">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Arcture CTA Button Group */}
        <div className="mt-24 md:mt-32 flex justify-center md:justify-start">
          <button className="btn-arcture group py-6 px-12 gap-3">
             INITIER UN PROJET <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
}