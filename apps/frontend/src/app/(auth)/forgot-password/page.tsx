"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.post("/auth/forgot-password", { email });
      // Always show submitted on success regardless or 404
      setIsSubmitted(true);
    } catch (error) {
      // Pour des raisons de sécurité, nous afficherons aussi le succès même en cas d'erreur 404
      // mais en cas d'erreur de connexion, on pourrait vouloir retenter, restons simples :
      setIsSubmitted(true); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center px-4 py-6 min-[480px]:px-8 selection:bg-[#BC9C6C] selection:text-white">
      <div className="w-full mx-auto max-w-md lg:max-w-[450px] min-[1440px]:max-w-[500px]">
        
        {/* LOGO MINIMALISTE */}
        <div className="mb-16 text-center">
           <Link href="/" className="inline-block group mx-auto">
             <div className="flex flex-col items-center gap-0.5 mb-2">
               <div className="w-6 h-1 bg-[#BC9C6C] rounded-none group-hover:w-8 transition-all duration-300"></div>
               <div className="w-8 h-1 bg-[#321B13] rounded-none"></div>
             </div>
             <h1 className="text-xl font-black tracking-tighter text-[#321B13] uppercase">
               Kaskade<span className="text-[#BC9C6C]">.</span>
             </h1>
           </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#321B13]/10 p-8 md:p-12 shadow-[0_20px_40px_rgba(50,27,19,0.03)]"
        >
          {!isSubmitted ? (
            <>
              <h2 className="text-3xl font-black text-[#321B13] tracking-tighter mb-4 text-center">
                Mot de passe oublié
              </h2>
              <p className="text-[#321B13]/60 text-xs leading-relaxed text-center mb-10 px-4">
                Entrez l'adresse email associée à votre compte, et nous vous enverrons un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-[#321B13] mb-2">
                    Adresse Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full min-h-[44px] bg-transparent border-b border-[#321B13]/20 py-3 text-sm font-bold text-[#321B13] placeholder-[#321B13]/30 focus:outline-none focus:border-[#BC9C6C] transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-4 bg-[#BC9C6C] text-white text-[10px] uppercase font-black tracking-[0.2em] hover:bg-[#321B13] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>
            </>
          ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center py-6"
             >
               <div className="w-16 h-16 bg-[#BC9C6C]/10 flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="w-8 h-8 text-[#BC9C6C]" />
               </div>
               <h3 className="text-xl font-black text-[#321B13] uppercase tracking-tight mb-4">Lien envoyé</h3>
               
               {/* SÉCURITÉ : Ne pas confirmer que l'email existe */}
               <p className="text-[#321B13]/70 text-sm leading-relaxed mb-8">
                 Si cet email {email && <span className="font-bold text-[#321B13]">({email})</span>} est associé à un compte, vous recevrez un lien pour réinitialiser votre mot de passe d'ici quelques instants.
               </p>

               <button 
                 onClick={() => setIsSubmitted(false)}
                 className="text-[#321B13]/50 hover:text-[#321B13] text-xs font-bold underline underline-offset-4 decoration-[#321B13]/20"
               >
                 Je n'ai rien reçu
               </button>
             </motion.div>
          )}

        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[#321B13]/60 hover:text-[#321B13] text-[10px] font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3 h-3" /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
