"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  const borderRadius = useTransform(scrollYProgress, [0, 1], ["0px 0px 0px 0px", "32px 32px 0px 0px"]);

  return (
    <motion.footer
      ref={footerRef}
      style={{ borderRadius }}
      className="w-full bg-chocolat text-white mt-24 pt-24 pb-12 overflow-hidden relative shadow-2xl"
    >
      <div className="absolute inset-0 bg-ocre/5 backdrop-blur-3xl -z-0 pointer-events-none"></div>

      <div className="arcture-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 mb-24">

          {/* Logo & Info */}
          <div className="lg:col-span-1">
            <a className="text-4xl font-serif font-black text-ocre mb-10 block tracking-tighter uppercase" href="#">Kaskade.</a>
            <p className="text-white text-base leading-relaxed font-sans tracking-wide">
              La référence premium pour connecter talents locaux et clients visionnaires au sein de l'écosystème architectural de Kaskade.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-serif font-black mb-10 text-[10px] uppercase tracking-[0.4em] text-ocre opacity-80">Réseau.</h5>
            <ul className="space-y-5 text-white/70 font-sans uppercase text-[10px] tracking-widest font-bold">
              <li><Link className="hover:text-ocre transition-all" href="/devenir-prestataire">Devenir Expert</Link></li>
              <li><a className="hover:text-ocre transition-all" href="#">Nos Services</a></li>
              <li><a className="hover:text-ocre transition-all" href="#">Marketplace</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-serif font-black mb-10 text-[10px] uppercase tracking-[0.4em] text-ocre opacity-80">Juridique.</h5>
            <ul className="space-y-5 text-white/70 font-sans uppercase text-[10px] tracking-widest font-bold">
              <li><a className="hover:text-ocre transition-all" href="#">Confidentialité</a></li>
              <li><a className="hover:text-ocre transition-all" href="#">Conditions</a></li>
              <li><a className="hover:text-ocre transition-all" href="#">Sécurité</a></li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div>
            <h5 className="font-serif font-black mb-10 text-[10px] uppercase tracking-[0.4em] text-ocre opacity-80">Infrastructure.</h5>
            <div className="flex flex-col gap-3">
              <div className="px-5 py-3 border border-ocre/20 bg-white/5 rounded-sm flex items-center gap-4 hover:border-ocre/50 transition-all group max-w-xs">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden p-1">
                  <img src="/airtel.png" alt="Airtel" className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/80 group-hover:text-red-400 transition-colors">AIRTEL MONEY</span>
              </div>
              <div className="px-5 py-3 border border-ocre/20 bg-white/5 rounded-sm flex items-center gap-4 hover:border-orange-500/50 transition-all group max-w-xs">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center overflow-hidden p-1.5 border border-white/10">
                  <img src="/orange.png" alt="Orange" className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/80 group-hover:text-orange-400 transition-colors">ORANGE MONEY</span>
              </div>
              <div className="px-5 py-3 border border-ocre/20 bg-white/5 rounded-sm flex items-center gap-4 hover:border-green-500/50 transition-all group max-w-xs">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden p-1">
                  <img src="/m-pesa.png" alt="M-Pesa" className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/80 group-hover:text-green-400 transition-colors">M-PESA INTÉGRÉ</span>
              </div>
            </div>
          </div>

        </div>

        {/* Arcture Copyright Area */}
        <div className="pt-16 border-t border-ocre/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white text-xs font-bold uppercase tracking-[0.2em]">© 2026 KASKADE SYSTEMS. TOUS DROITS RÉSERVÉS.</p>
          <div className="flex gap-8">
            <a href="#" className="text-white hover:text-ocre transition-colors italic text-xs font-bold uppercase tracking-[0.2em]">INSTAGRAM</a>
            <a href="#" className="text-white hover:text-ocre transition-colors italic text-xs font-bold uppercase tracking-[0.2em]">LINKEDIN</a>
          </div>
          <p className="text-white italic text-xs font-bold uppercase tracking-[0.2em]">L'exclusivité par la proximité.</p>
        </div>
      </div>
    </motion.footer>
  );
}
