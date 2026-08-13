"use client";
import { useState, useEffect, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ServiceExplorer from "../components/landing/ServiceExplorer";
import Testimonials from "../components/landing/Testimonials";
import Footer from "../components/landing/Footer";
import { Phone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect ADMIN away from landing page
  useEffect(() => {
    if (!isLoading && user?.role === 'ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <main className="bg-off-white min-h-screen text-chocolat font-sans selection:bg-ocre/20 overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col"
        >
          <Navbar />

          <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center bg-off-white"><div className="w-10 h-10 animate-spin text-ocre border-4 border-ocre/20 border-t-ocre rounded-full" /></div>}>
            <Hero />
          </Suspense>
          

          <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center bg-[#F5F3ED]"><div className="w-10 h-10 animate-spin text-ocre border-4 border-ocre/20 border-t-ocre rounded-full" /></div>}>
            <ServiceExplorer />
          </Suspense>

          <Testimonials />

          {/* Arcture Final CTA Section */}
          <section className="py-24 md:py-32 px-4 min-[480px]:px-8 min-[1440px]:px-12 bg-off-white">
            <div className="arcture-container relative z-10">
              <div className="bg-chocolat rounded-sm p-12 md:p-16 lg:p-24 text-center text-white overflow-hidden relative shadow-[0_30px_100px_rgba(50,27,19,0.15)]">
                <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-ocre/20 rounded-full blur-[160px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-ocre/10 rounded-full blur-[160px] opacity-40"></div>

                <div className="relative z-10 max-w-3xl mx-auto">
                  <span className="text-ocre font-bold tracking-[0.4em] text-[10px] uppercase mb-8 block">Prêt à commencer ?</span>
                  <h2 className="text-off-white mb-10 max-w-5xl mx-auto leading-tight uppercase text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter">
                    REDÉFINISSEZ <br /> <span className="text-ocre italic lowercase serif font-normal">votre quotidien.</span>
                  </h2>
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-8">
                    <Link href="/devenir-prestataire" className="w-full md:w-auto">
                      <button className="btn-arcture py-6 px-12 bg-white text-chocolat hover:bg-ocre hover:text-chocolat w-full">
                        DEVENIR PRESTATAIRE
                      </button>
                    </Link>
                    <a
                      href="mailto:contact@cascadheure.app"
                      className="flex items-center justify-center gap-3 bg-transparent border border-ocre/30 text-ocre px-10 py-5 rounded-md font-bold hover:bg-ocre/10 transition-all uppercase tracking-[0.2em] text-[11px] w-full md:w-auto group"
                    >
                      <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      NOUS CONTACTER
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}