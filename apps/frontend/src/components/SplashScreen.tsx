
"use client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen({ finishLoading }: { finishLoading: () => void }) {
  const [percent, setPercent] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const text = "Cascade.com";

  useEffect(() => {
    // Progression avec petits sauts aléatoires pour plus de réalisme
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsExiting(true), 500); // Déclenche la sortie
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 3 + 1); // Augmentation variable
        return next > 100 ? 100 : next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Définir les variants d'animation pour le point (fixé en position)
  const pointVariants: Variants = {
    glow: {
      textShadow: [
        "0px 0px 12px rgba(255, 107, 0, 0.3)",  // Lueur faible
        "0px 0px 25px rgba(255, 107, 0, 1)",    // Lueur intense (allumé)
        "0px 0px 12px rgba(255, 107, 0, 0.3)",  // Lueur faible
        "0px 0px 0px rgba(255, 107, 0, 0)",     // Extinction totale (éteint)
      ],
      transition: {
        duration: 2.5, // Plus lent pour que ce soit élégant
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }
  return (
    <AnimatePresence onExitComplete={finishLoading}>
      {!isExiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} // Sortie cinématique
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          {/* Logo avec effet de lueur dynamique */}
          <div className="flex mb-10 text-5xl md:text-7xl font-bold tracking-tighter">
            {text.split("").map((letter, index) => {
              if (letter === ".") {
                // Animer spécifiquement le point avec glow (fixé en position)
                return (
                  <motion.span
                    key={index}
                    variants={pointVariants}
                    animate="glow" // Appliquer l'effet de glow uniquement
                    className="text-[#FF6B00]" // Couleur de base du point
                  >
                    {letter}
                  </motion.span>
                );
              } else {
                // Animation standard pour les autres lettres (initiale)
                return (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0.1, y: 10 }}
                    animate={{
                      opacity: [0.1, 1, 0.1],
                      y: 0,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.1,
                      ease: "easeInOut"
                    }}
                    className="text-gray-900"
                  >
                    {letter}
                  </motion.span>
                );
              }
            })}
          </div>

          {/* Container Barre de progression (Inchangé) */}
          <div className="relative w-72">
            <div className="w-full h-[1px] bg-black/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[#FF6B00] to-[#FF6B00]"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>

            {/* Lueur qui suit la progression (Inchangé) */}
            <motion.div
              className="absolute top-[-2px] h-2 w-2 rounded-full bg-[#FF6B00] blur-[4px]"
              animate={{ left: `${percent}%` }}
              style={{ x: "-50%" }}
            />
          </div>

          {/* Texte de statut (Inchangé) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <span className="text-[#FF6B00]/80 text-[10px] uppercase tracking-[0.5em] font-medium">
              Initializing Core {percent}%
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1 h-1 bg-[#FF6B00] rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}