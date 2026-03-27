"use client";

import { ShieldCheck, Wallet, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  const featuresList = [
    {
      icon: ShieldCheck,
      title: "HÉROS VÉRIFIÉS.",
      desc: "Rigueur et précision. Nous vérifions l'identité et le parcours de chaque professionnel pour garantir une intégration parfaite dans votre environnement."
    },
    {
      icon: Wallet,
      title: "TRANSACTIONS ZEN.",
      desc: "Architecture financière sécurisée. Vos fonds sont protégés et libérés uniquement après validation bilatérale de l'excellence du service."
    },
    {
      icon: Clock,
      title: "PROXIMITÉ ÉLITE.",
      desc: "Le talent local à son apogée. Trouvez l'expertise dont vous avez besoin, à quelques minutes de votre résidence, sans compromis."
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-off-white">
      <div className="arcture-container">
        
        {/* Arcture Page Header */}
        <div className="mb-20 md:mb-32 text-center md:text-left max-w-4xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block py-1 px-4 rounded-sm bg-ocre/10 text-ocre text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-ocre/20"
          >
            L'EXCELLENCE KASKADE
          </motion.span>
          <h2 className="text-chocolat leading-tight mb-8">
            L'HUMAIN AU CŒUR DE <span className="text-ocre italic lowercase serif">la structure.</span>
          </h2>
          <div className="h-px w-24 bg-ocre mb-10 opacity-30"></div>
          <p className="text-chocolat/85 text-lg max-w-2xl leading-relaxed">
            Plus qu'une plateforme, nous définissons les standards de confiance entre experts passionnés et clients visionnaires.
          </p>
        </div>

        {/* Arcture Responsive Grid: Mobile-First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {featuresList.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`group p-10 border border-ocre/5 transition-all duration-500 shadow-[0_4px_30px_rgba(50,27,19,0.02)]
                ${i === 2 ? 'bg-chocolat text-white sm:col-span-2 lg:col-span-1 sm:mx-auto lg:mx-0 sm:w-1/2 lg:w-full' : 'bg-white'}`}
            >
              <div className={`w-12 h-12 flex items-center justify-center mb-10 border transition-all duration-500
                ${i === 2 ? 'border-ocre/40 text-ocre group-hover:bg-ocre group-hover:text-chocolat' : 'border-ocre/20 text-ocre group-hover:bg-ocre group-hover:text-chocolat'}`}>
                <feature.icon className="w-6 h-6" />
              </div>

              <h3 className={`text-xl font-bold mb-6 uppercase tracking-tighter transition-colors
                ${i === 2 ? 'text-ocre group-hover:text-chocolat' : 'text-chocolat group-hover:text-ocre'}`}>
                {feature.title}
              </h3>
              <p className={`leading-relaxed text-sm transition-colors
                ${i === 2 ? 'text-white/60 group-hover:text-chocolat/80' : 'text-chocolat/70 group-hover:text-ocre/80'}`}>
                {feature.desc}
              </p>
              
              {i === 2 && (
                <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-ocre uppercase tracking-widest">
                  <Heart className="w-3 h-3 fill-current" />
                  <span>ÉCOSYSTÈME CIRCULAIRE</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}