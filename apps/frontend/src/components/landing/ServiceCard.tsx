"use client";

import { Star, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Service } from "@/lib/mock-data";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-3xl border border-ocre/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
    >
      {/* SECTION IMAGE */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image 
          src={service.image} 
          alt={service.title} 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-chocolat/30 to-transparent" />
        
        <div className="absolute top-4 left-4">
           <span className="bg-ocre text-chocolat px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg rounded-sm">
              {service.category}
           </span>
        </div>
      </div>

      {/* SECTION CONTENU (Plus aéré pour 4 colonnes) */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-sm md:text-base font-black text-chocolat uppercase tracking-tighter leading-tight flex-1 line-clamp-2 min-h-[2.5rem]">
            {service.title}
          </h3>
          <div className="flex items-center gap-1 bg-ocre/5 px-2 py-0.5 rounded-full shrink-0">
            <Star className="w-3.5 h-3.5 text-ocre fill-ocre" />
            <span className="text-[11px] font-black text-chocolat">{service.rating}</span>
          </div>
        </div>

        <p className="text-chocolat/50 text-xs font-medium leading-relaxed line-clamp-2">
          {service.description}
        </p>

        {/* Profil Prestataire */}
        <div className="flex items-center gap-3 py-3 border-y border-ocre/5">
           <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white shadow-sm ring-2 ring-ocre/5 shrink-0">
              <Image src={service.provider.avatar} alt={service.provider.name} fill className="object-cover" />
           </div>
           <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                 <p className="text-[10px] font-black text-chocolat uppercase tracking-wider truncate">{service.provider.name}</p>
                 {service.provider.verified && <ShieldCheck className="w-3 h-3 text-[#25D366]" />}
              </div>
              <p className="text-[8px] text-chocolat/30 font-bold uppercase tracking-widest mt-0.5">EXPERT CERTIFIÉ</p>
           </div>
        </div>

        {/* Footer (Prix & Action) */}
        <div className="mt-auto pt-2 flex items-center justify-between">
           <div className="flex flex-col">
              <p className="text-[9px] font-black text-chocolat/30 uppercase tracking-widest mb-0.5">À PARTIR DE</p>
              <p className="text-xl font-black text-chocolat tracking-tighter">
                {service.price}<span className="text-sm text-ocre ml-1">$</span>
              </p>
           </div>
           
           <button className="bg-chocolat text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-ocre hover:text-chocolat transition-all duration-300 shadow-xl shadow-chocolat/10 active:scale-90 group/btn">
              <ChevronRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
           </button>
        </div>

      </div>
    </motion.div>
  );
}
