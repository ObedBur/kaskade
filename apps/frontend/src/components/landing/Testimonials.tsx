"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Sophie M.",
    role: "Propriétaire",
    content: "Une plateforme exceptionnelle. J'ai trouvé un plombier qualifié en moins de 10 minutes. La sécurisation du paiement via Kaskade m'a totalement rassurée.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Marc D.",
    role: "Gérant de restaurant",
    content: "L'interface est d'une fluidité remarquable. Le système d'abonnement me permet de gérer l'entretien de mes locaux sans aucun stress hebdomadaire.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Élodie P.",
    role: "Architecte d'intérieur",
    content: "En tant que prestataire, Kaskade a révolutionné ma façon de trouver des clients premium. La garantie de paiement est un avantage inestimable.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-[#F5F3ED] relative overflow-hidden font-sans border-t border-ocre/10">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-chocolat/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-ocre/5 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3" />

      <div className="arcture-container relative z-10">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-ocre font-black text-[11px] uppercase tracking-[0.4em] mb-6"
          >
            L'EXPÉRIENCE CLIENT
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-chocolat tracking-tighter uppercase leading-none mb-6"
          >
            Confiance <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocre to-[#d4af37] italic font-serif font-normal lowercase">Absolue.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-chocolat/60 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Ce que disent ceux qui ont redéfini leur quotidien avec l'écosystème Kaskade.
          </motion.p>
        </div>

        {/* Grille de témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 border border-ocre/10 shadow-xl shadow-chocolat/5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 relative group flex flex-col h-full"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-ocre/10 group-hover:text-ocre/20 transition-colors duration-500" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-ocre fill-ocre" />
                ))}
              </div>

              <p className="text-chocolat/80 text-base lg:text-lg font-medium leading-relaxed mb-10 flex-1 relative z-10 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-off-white shadow-sm">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="text-chocolat font-black uppercase tracking-widest text-sm mb-1">{testimonial.name}</h4>
                  <p className="text-ocre font-bold uppercase tracking-[0.2em] text-[9px]">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
