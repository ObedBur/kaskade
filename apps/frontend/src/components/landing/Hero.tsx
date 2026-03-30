"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { toast } from "sonner";

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6048805f77?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
];

export default function Hero() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative pt-[120px] pb-24 md:pt-[160px] md:pb-48 min-h-[90vh] flex items-center bg-off-white overflow-hidden">

            {/* Arcture Visual Monolith Slider (Right relative to content) */}
            <div className="absolute right-0 top-0 w-full lg:w-[60%] h-full z-0 overflow-hidden pointer-events-none">
                <div
                    className="relative w-full h-full"
                    style={{
                        maskImage: "linear-gradient(to right, transparent 0%, black 40%)",
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 40%)"
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={index}
                            initial={{ opacity: 0, scale: 1.1, filter: "grayscale(100%)" }}
                            animate={{ opacity: 1, scale: 1, filter: "grayscale(10%)" }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-full h-full object-cover"
                            src={HERO_IMAGES[index]}
                            alt={`Kaskade Talent ${index + 1}`}
                        />
                    </AnimatePresence>

                    {/* Architectural Overlay Pattern (Luxe) */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none z-10"></div>
                </div>
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
                        <h1 className="mb-8 md:mb-12 text-chocolat uppercase leading-none">
                            TROUVEZ VOTRE SERVICE <br />
                            <span className="text-ocre italic lowercase serif">
                                près de chez vous
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-chocolat/85 max-w-[600px] mb-12 md:mb-16 border-l border-ocre pl-6 md:pl-8"
                    >
                        Trouvez facilement des services locaux fiables, sélectionnés pour leur qualité
                    </motion.p>

                    {/* Arcture Search Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="max-w-[700px] bg-white shadow-2xl flex flex-col md:flex-row items-stretch md:items-center group p-1"
                    >
                        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-ocre/10">
                            <Search className="text-ocre mr-4 w-5 h-5" />
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-chocolat placeholder:text-chocolat/25 font-bold text-xs uppercase tracking-[0.1em]"
                                placeholder="QUEL SERVICE RECHERCHEZ-VOUS ?"
                                type="text"
                            />
                        </div>
                        <button
                            onClick={() => {
                                toast.success("Protocole de recherche lancé.");
                            }}
                            className="btn-arcture h-full py-6 px-12"
                        >
                            EXPLORER
                        </button>
                    </motion.div>

                    {/* Arcture Slide indicator */}
                    <div className="mt-16 flex gap-3">
                        {HERO_IMAGES.map((_, i) => (
                            <div
                                key={i}
                                className={`h-[2px] transition-all duration-1000 ${i === index ? 'bg-ocre w-16' : 'bg-ocre/20 w-8'}`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
