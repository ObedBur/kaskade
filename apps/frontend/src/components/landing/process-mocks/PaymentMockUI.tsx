"use client";

import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const PaymentMockUI = () => (
  <div className="p-6 bg-white/80 rounded-2xl border border-white flex flex-col items-center gap-3 shadow-sm">
    <div className="w-14 h-14 rounded-full bg-emerald-50/80 flex items-center justify-center border border-emerald-100 mb-2 shadow-inner">
      <ShieldCheck className="w-7 h-7 text-emerald-600" strokeWidth={1.5} />
    </div>
    <div className="text-center">
      <h4 className="text-[#2C1E16]/50 text-[10px] font-black uppercase tracking-widest mb-1">Séquestre Sécurisé</h4>
      <p className="text-4xl font-black text-[#2C1E16] tracking-tighter">2 400 $</p>
    </div>
    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
      <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F1C40F]" />
    </div>
  </div>
);
