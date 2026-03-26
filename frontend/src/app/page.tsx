"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "../components/SplashScreen";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import CategoryBento from "../components/landing/CategoryBento";
import Process from "../components/landing/Process";
import Footer from "../components/landing/Footer";
import { MessageCircle, Phone } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="bg-[#FDFCFB] min-h-screen text-[#0F172A] font-sans selection:bg-[#1A73E8]/10 overflow-x-hidden">
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

            <CategoryBento />

            <Process />

            {/* Final CTA Section */}
            <section className="py-32 px-8">
              <div className="max-w-7xl mx-auto bg-[#0A192F] rounded-[3rem] p-12 md:p-32 text-center text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-[#1A73E8]/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="relative z-10">
                  <h2 className="text-5xl md:text-7xl font-extrabold mb-10 max-w-4xl mx-auto leading-tight">Prêt à transformer votre quotidien ?</h2>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <button className="bg-white text-slate-900 px-12 py-5 rounded-full font-bold text-xl active:scale-0.95 shadow-xl transition-all">
                      Créer mon compte
                    </button>
                    <button className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-bold hover:bg-white/20 transition-all active:scale-0.95">
                      <Phone className="w-5 h-5" />
                      Nous contacter
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