"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "+150", label: "Experts Certifiés", suffix: "" },
  { value: "1000", label: "Interventions Réussies", suffix: "+" },
  { value: "100", label: "Paiements Sécurisés", suffix: "%" },
  { value: "4.9", label: "Note Moyenne", suffix: "/5" },
];

export default function Stats() {
  return (
    <section className="py-12 md:py-20 bg-chocolat relative overflow-hidden border-y border-ocre/20">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-ocre/5 via-transparent to-ocre/5" />
      
      <div className="arcture-container relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 divide-x-0 md:divide-x divide-white/10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col items-start justify-center text-left ${
                index === 0 
                  ? 'pr-4 md:pr-8' 
                  : index === 2 
                    ? 'pr-4 md:px-8' 
                    : 'pl-4 md:px-8'
              }`}
            >
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">
                  {stat.value}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-ocre">
                  {stat.suffix}
                </span>
              </div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/60">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
