"use client";

import Navbar from "@/components/landing/Navbar";
import ServiceExplorer from "@/components/landing/ServiceExplorer";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Suspense } from "react";

export default function ServicesPage() {
  return (
    <main className="bg-white min-h-screen font-sans selection:bg-[#D4AF37] selection:text-white">
      <Navbar />
      
      {/* 
        Le ServiceExplorer est injecté ici. 
      */}
      <div className="pt-20 px-4 min-[480px]:px-8 min-[1440px]:px-12">
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8 }}
         >
           <Suspense fallback={<div className="flex justify-center items-center py-24"><div className="w-10 h-10 animate-spin text-ocre border-4 border-ocre/20 border-t-ocre rounded-full" /></div>}>
             <ServiceExplorer />
           </Suspense>
         </motion.div>
      </div>

      <Footer />
    </main>
  );
}
