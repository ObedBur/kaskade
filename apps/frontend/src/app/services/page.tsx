"use client";

import Navbar from "@/components/landing/Navbar";
import ServiceExplorer from "@/components/landing/ServiceExplorer";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";

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
           <ServiceExplorer />
         </motion.div>
      </div>

      <Footer />
    </main>
  );
}
