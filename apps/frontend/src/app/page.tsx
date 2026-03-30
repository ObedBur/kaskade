"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "../components/SplashScreen";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import CategoryBento from "../components/landing/CategoryBento";
import Process from "../components/landing/Process";
import ServiceExplorer from "../components/landing/ServiceExplorer";
import Footer from "../components/landing/Footer";
import { MessageCircle, Phone } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="bg-off-white min-h-screen text-chocolat font-sans selection:bg-ocre/20 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {loading ? (
          <SplashScreen key="splash" finishLoading={() => setLoading(false)} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col"
          >
            <Navbar />
            
            <Hero />

            <Features />

            <ServiceExplorer />

            <CategoryBento />

            <Process />

            {/* Arcture Final CTA Section */}
            <section className="py-48 px-4 md:px-8 bg-off-white">
              <div className="arcture-container bg-chocolat rounded-sm p-16 md:p-32 lg:p-40 text-center text-white overflow-hidden relative shadow-[0_30px_100px_rgba(50,27,19,0.15)]">
                <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-ocre/20 rounded-full blur-[160px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-ocre/10 rounded-full blur-[160px] opacity-40"></div>
                
                <div className="relative z-10">
                  <span className="text-ocre font-bold tracking-[0.4em] text-[10px] uppercase mb-12 block">READY TO START?</span>
                  <h2 className="text-off-white mb-20 max-w-5xl mx-auto leading-none uppercase">
                    REDÉFINISSEZ <br/> <span className="text-ocre italic lowercase serif">votre quotidien.</span>
                  </h2>
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-10">
                    <button className="btn-arcture py-6 px-16 bg-white text-chocolat hover:bg-ocre hover:text-chocolat w-full md:w-auto">
                      REJOINDRE L'ÉCOSYSTÈME
                    </button>
                    <button className="flex items-center justify-center gap-4 bg-transparent border border-ocre/30 text-ocre px-12 py-6 rounded-md font-bold hover:bg-ocre/10 transition-all uppercase tracking-[0.2em] text-[11px] w-full md:w-auto group">
                      <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      NOUS CONTACTER
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <Footer />

            {/* WhatsApp Float */}
            <a className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-2xl" 
               style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} href="#">
              <MessageCircle className="w-8 h-8 fill-transparent" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}