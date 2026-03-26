"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LuxurySplashScreen({ finishLoading }: { finishLoading: () => void }) {
  const [percent, setPercent] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsExiting(true), 800);
          return 100;
        }
        return prev + (Math.random() * 15 + 2);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence onExitComplete={finishLoading}>
      {!isExiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{
            scale: 1.5,
            filter: "blur(40px)",
            opacity: 0,
            transition: { duration: 0.9, ease: [0.7, 0, 0.3, 1] }
          }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#050505] overflow-hidden"
        >
          {/* Fond Dynamique (Mesh Gradient) */}
          <div className="absolute inset-0 opacity-40">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-orange-600 blur-[120px] rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                x: [0, -60, 0],
                y: [0, 40, 0]
              }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900 blur-[130px] rounded-full"
            />
          </div>

          {/* Effet de Grain/Bruit pour le réalisme */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

          {/* Container Principal (Glassmorphism) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 flex flex-col items-center p-12 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl"
          >
            {/* Texte KASKADE avec remplissage liquide */}
            <div className="relative mb-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-white/10 ">
                Kaskade.
              </h1>

              {/* Le "Liquide" qui remplit le texte */}
              <motion.h1
                style={{ clipPath: `inset(${100 - percent}% 0 0 0)` }}
                className="absolute inset-0 text-5xl md:text-7xl font-black tracking-tighter text-orange-500 uppercase select-none transition-all duration-300 ease-out"
              >
                Kaskade.
              </motion.h1>
            </div>

            {/* Indicateur minimaliste */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-white/40 font-mono text-[10px] uppercase tracking-[0.6em]">
                Initializing Services
              </div>
              <div className="text-white font-bold text-2xl tabular-nums">
                {Math.floor(percent)}%
              </div>
            </div>

            {/* Barre de progression ultra-fine */}
            <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden rounded-b-[40px]">
              <motion.div
                className="h-full bg-orange-500"
                animate={{ width: `${percent}%` }}
              />
            </div>
          </motion.div>

          {/* Décoration : Anneaux animés */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-[500px] h-[500px] border border-white/5 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-[700px] h-[700px] border border-white/[0.02] rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}