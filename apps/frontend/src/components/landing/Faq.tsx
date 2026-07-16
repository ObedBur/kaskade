"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Comment fonctionne la garantie de paiement ?",
    answer: "Votre paiement est divisé en deux parties : un acompte initial et un solde final. L'acompte valide la réservation mais reste sécurisé par Kaskade. Le solde n'est versé à l'expert qu'une fois la prestation terminée et validée par vos soins."
  },
  {
    question: "Les professionnels sont-ils réellement vérifiés ?",
    answer: "Absolument. Chaque expert Kaskade passe par un processus de vérification strict incluant la vérification d'identité, l'analyse des compétences professionnelles, et un entretien individuel pour garantir nos standards de qualité."
  },
  {
    question: "Puis-je reporter une intervention déjà planifiée ?",
    answer: "Oui. Vous pouvez demander un report directement depuis votre espace 'Mes Demandes'. L'expert recevra une notification et pourra accepter la nouvelle date proposée."
  },
  {
    question: "Que se passe-t-il si je ne suis pas satisfait ?",
    answer: "La satisfaction est notre priorité. Si une prestation ne correspond pas au devis initial, vos fonds sont protégés. Notre équipe de médiation dédiée intervient rapidement pour trouver une solution équitable ou procéder à un remboursement."
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous intégrons les solutions locales les plus fiables : Airtel Money, Orange Money et M-Pesa. Toutes les transactions sont chiffrées et instantanées."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 bg-white relative font-sans">
      <div className="arcture-container max-w-4xl mx-auto relative z-10">
        
        {/* En-tête */}
        <div className="text-center mb-16 md:mb-20">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-ocre font-black text-[11px] uppercase tracking-[0.4em] mb-6"
          >
            TRANSPARENCE TOTALE
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-chocolat tracking-tighter uppercase leading-none"
          >
            Foire aux <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocre to-[#d4af37] italic font-serif font-normal lowercase">questions.</span>
          </motion.h2>
        </div>

        {/* Accordéon FAQ */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-3xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-ocre/30 bg-off-white shadow-xl shadow-chocolat/5' : 'border-zinc-100 bg-white hover:border-ocre/20'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-6 sm:px-8 sm:py-8 flex items-center justify-between gap-6 text-left"
                >
                  <span className="text-base sm:text-lg font-black text-chocolat uppercase tracking-tight">
                    {faq.question}
                  </span>
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-ocre text-white' : 'bg-zinc-100 text-chocolat'}`}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 text-chocolat/70 font-medium leading-relaxed sm:text-lg border-t border-ocre/10 mt-2 pt-6">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
