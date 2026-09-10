"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import SearchAutocomplete from "./SearchAutocomplete";
import api from "@/lib/api";

interface ServiceImage {
  id: string;
  name: string;
  imageUrl: string | null;
}

const HERO_FALLBACK = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop";

export default function Hero() {
    const [index, setIndex] = useState(0);
    const [heroImages, setHeroImages] = useState<ServiceImage[]>([]);

    useEffect(() => {
        const fetchHeroImages = async () => {
            try {
                const response = await api.get("/services");
                const services = Array.isArray(response.data) ? response.data : [];
                const withImages = services
                    .filter((s: any) => s.imageUrl)
                    .slice(0, 5) as ServiceImage[];
                if (withImages.length > 0) {
                    setHeroImages(withImages);
                }
            } catch (err) {
                console.error("Erreur chargement images hero:", err);
            }
        };
        fetchHeroImages();
    }, []);

    useEffect(() => {
        if (heroImages.length === 0) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    return (
        <section className="relative flex min-h-[680px] items-start overflow-hidden bg-off-white pb-12 pt-24 sm:min-h-[75vh] sm:items-center sm:pb-16 lg:pt-[112px] md:pb-24">

            {/* Arcture Visual Monolith Slider (Right relative to content) */}
            <div className="absolute right-0 top-16 lg:top-[112px] bottom-0 w-full lg:w-[60%] z-0 overflow-hidden pointer-events-none">
                <div
                    className="relative w-full h-full"
                    style={{
                        maskImage: "linear-gradient(to right, transparent 0%, black 40%)",
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 40%)"
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={heroImages[index]?.id || index}
                            initial={{ opacity: 0, scale: 1.1, filter: "grayscale(100%)" }}
                            animate={{ opacity: 1, scale: 1, filter: "grayscale(10%)" }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-full h-full object-cover object-[center_20%]"
                            src={heroImages[index]?.imageUrl || HERO_FALLBACK}
                            alt={heroImages[index]?.name || "Cascadheur"}
                        />
                    </AnimatePresence>

                    {/* Architectural Overlay Pattern (Luxe) */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none z-10"></div>
                </div>
                <div className="absolute inset-0 bg-off-white/45 sm:bg-off-white/20 lg:bg-transparent" />
            </div>

            {/* Arcture Grid Layout */}
            <div className="arcture-container relative z-10 w-full">
                <div className="max-w-[900px]">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* H1 follows Gotham Bold Arcture Scale */}
                        <h1 className="mb-6 break-words text-4xl leading-[0.95] text-chocolat sm:mb-8 sm:text-5xl md:mb-12 md:text-7xl uppercase">
                            TROUVEZ <span className="sm:hidden"><br /></span>VOTRE SERVICE <br />
                            <span className="text-ocre italic lowercase serif">
                                près de chez vous
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-8 max-w-[260px] border-l border-ocre pl-4 text-sm leading-relaxed text-chocolat/85 sm:mb-12 sm:max-w-[600px] sm:pl-6 md:mb-16 md:pl-8 md:text-base"
                    >
                        Trouvez facilement des services locaux fiables, sélectionnés pour leur qualité
                    </motion.p>

                    {/* Arcture Search Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="max-w-[900px] bg-white shadow-2xl flex items-center group p-1"
                    >
                        <SearchAutocomplete
                            actionLabel="EXPLORER"
                            className="h-full"
                        />
                    </motion.div>

                    {/* Arcture Slide indicator */}
                    <div className="mt-10 flex gap-2 sm:mt-16 sm:gap-3">
                        {heroImages.map((_, i) => (
                            <div
                                key={i}
                                className={`h-[2px] transition-all duration-1000 ${i === index ? 'bg-ocre w-10 sm:w-16' : 'bg-ocre/20 w-5 sm:w-8'}`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
