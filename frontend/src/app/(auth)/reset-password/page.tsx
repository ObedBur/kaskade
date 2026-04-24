"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Le lien de réinitialisation est invalide ou manquant.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);
    
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de la réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#321B13]/10 p-8 md:p-12 shadow-[0_20px_40px_rgba(50,27,19,0.03)]"
      >
        {!isSubmitted ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 border border-[#321B13]/10 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-[#BC9C6C]" />
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-[#321B13] tracking-tighter mb-4 text-center">
              Créer un nouveau mot de passe
            </h2>
            <p className="text-[#321B13]/60 text-xs leading-relaxed text-center mb-10 px-4">
              Assurez-vous qu'il contienne au moins 8 caractères, incluant des chiffres et des lettres.
            </p>

            {error && (
              <div className="mb-6 p-4 border-l-2 border-[#b91c1c] bg-[#b91c1c]/5 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#b91c1c] mt-0.5 shrink-0" />
                <p className="text-[#b91c1c] text-xs font-bold">{error}</p>
              </div>
            )}

            {!token && !error && (
              <div className="mb-6 p-4 border-l-2 border-[#BC9C6C] bg-[#BC9C6C]/10 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#321B13] mt-0.5 shrink-0" />
                <p className="text-[#321B13] text-xs font-bold">Le jeton (token) est manquant dans l'URL. Veuillez utiliser le lien fourni dans votre email.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-[#321B13] mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!token}
                  className="w-full min-h-[44px] bg-transparent border-b border-[#321B13]/20 py-3 text-sm font-bold text-[#321B13] placeholder-[#321B13]/30 focus:outline-none focus:border-[#BC9C6C] transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-widest text-[#321B13] mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={!token}
                  className="w-full min-h-[44px] bg-transparent border-b border-[#321B13]/20 py-3 text-sm font-bold text-[#321B13] placeholder-[#321B13]/30 focus:outline-none focus:border-[#BC9C6C] transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword || !token}
                className="w-full py-4 bg-[#BC9C6C] text-white text-[10px] uppercase font-black tracking-[0.2em] hover:bg-[#321B13] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? "Enregistrement..." : "Mettre à jour"}
              </button>
            </form>
          </>
        ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-[#BC9C6C]/10 flex items-center justify-center mx-auto mb-6 border border-[#BC9C6C]/20">
                <CheckCircle2 className="w-8 h-8 text-[#321B13]" />
              </div>
              <h3 className="text-xl font-black text-[#321B13] uppercase tracking-tight mb-4">Mot de passe réinitialisé</h3>
              
              <p className="text-[#321B13]/70 text-sm leading-relaxed mb-10">
                Votre nouveau mot de passe a été configuré avec succès. Vous pouvez maintenant vous connecter à votre espace Kaskade de manière sécurisée.
              </p>

              <Link 
                href="/login"
                className="inline-block w-full py-4 bg-[#321B13] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#BC9C6C] transition-colors duration-300"
              >
                Accéder à la connexion
              </Link>
            </motion.div>
        )}
      </motion.div>
      
      {!isSubmitted && (
        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[#321B13]/60 hover:text-[#321B13] text-[10px] font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3 h-3" /> Retour
          </Link>
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense fallback={<div className="text-center text-[#321B13]/50 text-xs uppercase tracking-widest font-bold">Chargement...</div>}>
          <ResetPasswordForm />
        </Suspense>

      </div>
    </div>
  );
}
