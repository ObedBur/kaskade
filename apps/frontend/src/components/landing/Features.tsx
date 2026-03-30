"use client";

import { ShieldCheck, Wallet, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  return (
    <section className="py-24 md:py-32 bg-off-white relative overflow-hidden font-sans">
      {/* Gradients de fond subtils aux couleurs de la marque */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-ocre/10 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-chocolat/5 to-transparent rounded-full blur-3xl -z-10 -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* En-tête : Typographie forte à fort contraste */}
        <div className="mb-20 flex flex-col items-start max-w-3xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ocre">L'EXCELLENCE KASKADE</span>
          </motion.div>

          {/* Titre Original : L'Humain au coeur de la structure */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-chocolat tracking-tighter leading-[1.05] mb-6">
            L'humain au cœur de <br className="hidden md:block" />
            <span className="italic font-serif font-normal text-ocre">
              la structure.
            </span>
          </h2>

          <p className="text-chocolat/70 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
            Plus qu'une plateforme, nous définissons les standards de confiance entre experts passionnés et clients visionnaires.
          </p>
        </div>

        {/* Bento Grid - Pure UI minimalist aux couleurs Kaskade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(320px,_auto)]">
          
          {/* Carte 1 : Large (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white rounded-[2rem] p-10 lg:p-14 border border-ocre/10 shadow-[0_8px_40px_-12px_rgba(50,27,19,0.05)] relative overflow-hidden group hover:border-ocre/30 transition-colors duration-500"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-ocre/5 rounded-bl-[100px] transition-transform duration-700 group-hover:scale-110 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-off-white text-primary flex items-center justify-center mb-10 border border-ocre/20 shadow-sm">
                <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
              </div>
              
              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-chocolat tracking-tighter mb-5 leading-tight uppercase">
                  Héros <br className="hidden sm:block"/> Vérifiés.
                </h3>
                <p className="text-chocolat/70 text-lg md:text-xl leading-relaxed max-w-md">
                  Rigueur et précision. Nous vérifions l'identité et le parcours de chaque professionnel pour garantir une intégration parfaite dans votre environnement.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Carte 2 : Sombre et Luxe (Span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 bg-chocolat rounded-[2rem] p-10 lg:p-14 relative overflow-hidden shadow-2xl flex flex-col justify-between group"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150 pointer-events-none"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/5 text-ocre backdrop-blur-md flex items-center justify-center mb-10 border border-white/10">
                <Wallet className="w-8 h-8" strokeWidth={1.5} />
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-5 leading-tight uppercase">
                  Transactions <br/> Zen.
                </h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  Architecture financière sécurisée. Vos fonds sont protégés et libérés uniquement après validation bilatérale de l'excellence du service.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Carte 3 : Bannière Horizontale Interactive (Span 3) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3 bg-white rounded-[2rem] p-10 lg:p-14 border border-ocre/10 shadow-[0_8px_40px_-12px_rgba(50,27,19,0.05)] relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 lg:gap-20 group"
          >
            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transition-transform duration-1000 group-hover:-translate-x-5 text-chocolat">
              <Clock className="w-96 h-96" strokeWidth={0.5} />
            </div>

            <div className="lg:w-1/2 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-off-white text-primary flex items-center justify-center mb-10 border border-ocre/20 shadow-sm">
                <Clock className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl lg:text-5xl font-black text-chocolat tracking-tighter mb-6 leading-tight uppercase">
                Proximité <br/> Kaskade.
              </h3>
            </div>

            <div className="lg:w-1/2 relative z-10 w-full">
              <p className="text-chocolat/70 text-xl leading-relaxed">
                Le talent local à son apogée. Trouvez l'expertise dont vous avez besoin, à quelques minutes de votre résidence, sans aucun compromis.
              </p>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}