"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";

export const ChatMockUI = () => (
  <div className="flex flex-col gap-4 p-5 bg-white/60 rounded-2xl border border-white/50">
    <div className="flex gap-3 items-end">
      <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm shrink-0">
        <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Client" fill className="object-cover" sizes="32px" />
      </div>
      <div className="bg-white text-[#2C1E16] text-xs px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm font-medium">
        Bonjour, j'adore votre vision !
      </div>
    </div>
    <div className="flex justify-end relative">
      <div className="bg-gradient-to-br from-[#2C1E16] to-[#1a120d] text-white text-xs px-4 py-2.5 rounded-2xl rounded-br-none shadow-md font-medium">
        Merci ! Commençons le projet.
        <CheckCircle className="w-4 h-4 text-[#D4AF37] absolute -bottom-2 -left-3 drop-shadow-md" />
      </div>
    </div>
  </div>
);
