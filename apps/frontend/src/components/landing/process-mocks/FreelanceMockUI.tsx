"use client";

import Image from "next/image";
import { Star } from "lucide-react";

export const FreelanceMockUI = () => (
  <div className="relative p-5 bg-white/80 rounded-2xl shadow-sm border border-white transition-transform duration-500 hover:-translate-y-2 group">
    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] text-[#2C1E16] text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10">
      Top 1%
    </div>
    <div className="flex items-center gap-4 relative z-0">
      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 shadow-inner">
        <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Sophie L." fill className="object-cover" sizes="56px" />
      </div>
      <div>
        <h4 className="text-[#2C1E16] font-bold text-base">Sophie L.</h4>
        <p className="text-[#2C1E16]/60 text-xs font-medium mb-1">Directrice Artistique</p>
        <div className="flex gap-1" aria-label="5 étoiles">
          {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />)}
        </div>
      </div>
    </div>
  </div>
);
