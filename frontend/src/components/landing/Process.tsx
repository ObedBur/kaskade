"use client";

import { useRef, useState } from "react";
import { UserSearch, MessageCircle, ShieldCheck, ArrowRight, MousePointer2, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

// MOCKS IMPORTÉS (Maintenance améliorée)
import { FreelanceMockUI } from "./process-mocks/FreelanceMockUI";
import { ChatMockUI } from "./process-mocks/ChatMockUI";
import { PaymentMockUI } from "./process-mocks/PaymentMockUI";

// ----------------------------------------------------------------------
// 1. EFFET SPOTLIGHT OPTIMISÉ (GPU & CPU)
// ----------------------------------------------------------------------
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  // Optimisation : Ne calcule la position que sur desktop et si survolé
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || window.innerWidth < 1024) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      style={{ transform: "translateZ(0)" }} // GPU Acceleration
      className={`relative overflow-hidden rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgba(212,175,55,0.15)] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0 hidden lg:block"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(212,175,55,0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. COMPOSANT PRINCIPAL
// ----------------------------------------------------------------------
export default function Process() {
  const steps = [
    { id: "01", title: "Demande", desc: "Sélectionnez un service, réglez l'acompte sécurisé et notre équipe vous affecte le meilleur prestataire.", icon: UserSearch, ui: <FreelanceMockUI /> },
    { id: "02", title: "Intervention", desc: "Le prestataire qualifié se déplace directement à votre domicile à l'heure de votre rendez-vous.", icon: MessageCircle, ui: <ChatMockUI /> },
    { id: "03", title: "Finalisation", desc: "Le travail est accompli. Vous validez la prestation et profitez d'un service d'excellence.", icon: ShieldCheck, ui: <PaymentMockUI /> },
  ];

  return (
    <section className="py-24 md:py-40 bg-[#FBF9F6] relative z-0 overflow-hidden font-sans selection:bg-[#D4AF37] selection:text-white">

      {/* BACKGROUND DECOR */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#2C1E16]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="arcture-container relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* COLONNE GAUCHE : STICKY HEADER (Responsive optimized) */}
          <div className="lg:col-span-5 lg:sticky lg:top-40 pt-0 lg:pt-10 mb-10 lg:mb-0">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#2C1E16] leading-[1.05] tracking-tighter mb-8">
              Conçu pour <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#D4AF37] to-[#8B6914]">
                l'Excellence.
              </span>
            </h2>

            <p className="text-[#2C1E16]/60 text-lg md:text-xl font-medium leading-relaxed max-w-md mb-8">
              Découvrez un flux de travail chirurgical, pensé pour les leaders de demain et adapté aux réalités locales.
            </p>
          </div>


          {/* COLONNE DROITE : TIMELINE VERTICALE */}
          <div className="lg:col-span-7 relative">

            {/* Ligne pointillée (Inspiration Dribbble : toujours visible même sur mobile) */}
            <div className="absolute top-10 bottom-10 left-[1.5rem] md:left-[3.25rem] w-px border-l-2 border-dashed border-[#D4AF37]/20 z-0" />

            <div className="flex flex-col gap-16 md:gap-24 relative z-10">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="flex flex-row gap-4 sm:gap-6 md:gap-12 group relative"
                >
                  {/* Sur mobile, on garde la structure en ligne (flex-row) pour une vraie timeline */}
                  <div className="relative shrink-0 flex items-start md:items-center gap-4 z-10 pt-4 md:pt-0">
                    <div className="w-12 h-12 md:w-24 md:h-24 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center text-lg md:text-3xl font-black text-[#2C1E16] shadow-lg group-hover:border-[#D4AF37] group-hover:text-[#D4AF37] transition-colors duration-500">
                      {step.id}
                    </div>
                  </div>

                  <SpotlightCard className="flex-1 p-6 sm:p-8 md:p-10">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-center">

                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent flex items-center justify-center mb-6 border border-[#D4AF37]/20 text-[#D4AF37]">
                          <step.icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-[#2C1E16] mb-4 tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-[#2C1E16]/60 text-base font-medium leading-relaxed">
                          {step.desc}
                        </p>
                      </div>

                      <div className="relative mt-8 xl:mt-0">
                        {step.ui}
                        {i === 0 && (
                          <motion.div
                            animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -bottom-6 -right-4 z-20 drop-shadow-2xl pointer-events-none hidden lg:block"
                          >
                            <MousePointer2 className="w-8 h-8 fill-[#2C1E16] text-white" />
                          </motion.div>
                        )}
                      </div>

                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}