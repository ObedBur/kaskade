"use client";

import { Search, SlidersHorizontal, MapPin, Calculator, Calendar, ChevronRight, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ServiceCard from "./ServiceCard";

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string | null;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  provider?: {
    id: string;
    fullName: string;
    isVerified: boolean;
  };
  _count?: { reviews: number };
}

const PRICE_RANGES = [
  { label: "Moins de $50", min: 0, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "Plus de $200", min: 200, max: Infinity },
];

export default function ServiceExplorer() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<number | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/services');
        setServices(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Erreur chargement services:', err);
        setError('Impossible de charger les services. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Catégories uniques extraites des services
  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
    return cats;
  }, [services]);

  // Filtrage
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = !searchQuery || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !activeCategory || service.category === activeCategory;
      
      const priceRange = activePriceRange !== null ? PRICE_RANGES[activePriceRange] : null;
      const matchesPrice = !priceRange || (service.price >= priceRange.min && service.price < priceRange.max);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [services, searchQuery, activeCategory, activePriceRange]);

  const hasActiveFilters = activeCategory || activePriceRange !== null || searchQuery;

  return (
    <section className="py-16 md:py-20 bg-[#F5F3ED] relative overflow-hidden font-sans border-y border-ocre/10">

      {/* Éléments de structure */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ocre/5 rounded-full blur-[100px] -z-10 translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-chocolat/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="arcture-container relative">

        {/* EN-TÊTE */}
        <div className="max-w-4xl mb-16 md:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-ocre font-black text-[11px] uppercase tracking-[0.4em] mb-8"
          >
            L'ÉCOSYSTÈME
          </motion.p>

          <h2 className="text-5xl md:text-7xl font-black text-chocolat tracking-tighter leading-none uppercase mb-8">
            Trouver un <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocre to-[#d4af37] italic font-serif font-normal lowercase">service.</span>
          </h2>

          <p className="text-chocolat/60 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
            Parcourez et demandez des services locaux certifiés pour tous vos besoins quotidiens, avec la garantie de qualité Kaskade.
          </p>
        </div>

        {/* BARRE DE RECHERCHE & FILTRES */}
        <div className="flex flex-col gap-6">

          {/* Bloc de Recherche */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex flex-col md:flex-row items-stretch gap-4 p-2 bg-off-white rounded-[2.5rem] border border-ocre/10 shadow-xl shadow-chocolat/5 focus-within:border-ocre/30 transition-colors"
          >
            <div className="flex-1 flex items-center px-8 py-4 sm:py-6">
              <Search className="w-6 h-6 text-ocre mr-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/services${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
                  }
                }}
                placeholder="Quel service recherchez-vous ?"
                className="w-full bg-transparent border-none focus:ring-0 text-chocolat font-bold text-sm uppercase tracking-widest placeholder:text-chocolat/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="ml-2 text-chocolat/30 hover:text-chocolat transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => router.push(`/services${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)}
              className="bg-chocolat text-white px-12 py-5 sm:py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-ocre hover:text-chocolat transition-all duration-300 shadow-lg shadow-chocolat/20 active:scale-95 group"
            >
              RECHERCHER
              <ChevronRight className="w-4 h-4 inline-block ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* FILTRES */}
          <div className="flex flex-wrap items-center gap-4 relative">
            {/* Filtre Catégorie */}
            <div className="relative">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                viewport={{ once: true }}
                onClick={() => { setShowCategoryFilter(!showCategoryFilter); setShowPriceFilter(false); }}
                className={`flex items-center gap-3 px-6 py-4 border rounded-full transition-all group shadow-sm ${activeCategory ? 'bg-chocolat border-chocolat text-white' : 'bg-white border-ocre/10 hover:border-ocre hover:bg-off-white text-chocolat'}`}
              >
                <SlidersHorizontal className={`w-4 h-4 transition-colors ${activeCategory ? 'text-ocre' : 'group-hover:text-ocre'}`} />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {activeCategory || "Catégorie"}
                </span>
                {activeCategory && (
                  <X className="w-3 h-3 ml-1 opacity-70" onClick={(e) => { e.stopPropagation(); setActiveCategory(null); }} />
                )}
              </motion.button>
              <AnimatePresence>
                {showCategoryFilter && categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 z-30 bg-white border border-ocre/10 rounded-2xl shadow-2xl shadow-chocolat/10 p-3 min-w-[180px] flex flex-col gap-1"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat === activeCategory ? null : cat); setShowCategoryFilter(false); }}
                        className={`text-left px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-ocre/10 text-ocre' : 'text-chocolat/70 hover:bg-off-white hover:text-chocolat'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filtre Budget */}
            <div className="relative">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                onClick={() => { setShowPriceFilter(!showPriceFilter); setShowCategoryFilter(false); }}
                className={`flex items-center gap-3 px-6 py-4 border rounded-full transition-all group shadow-sm ${activePriceRange !== null ? 'bg-chocolat border-chocolat text-white' : 'bg-white border-ocre/10 hover:border-ocre hover:bg-off-white text-chocolat'}`}
              >
                <Calculator className={`w-4 h-4 transition-colors ${activePriceRange !== null ? 'text-ocre' : 'group-hover:text-ocre'}`} />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {activePriceRange !== null ? PRICE_RANGES[activePriceRange].label : "Budget"}
                </span>
                {activePriceRange !== null && (
                  <X className="w-3 h-3 ml-1 opacity-70" onClick={(e) => { e.stopPropagation(); setActivePriceRange(null); }} />
                )}
              </motion.button>
              <AnimatePresence>
                {showPriceFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 z-30 bg-white border border-ocre/10 rounded-2xl shadow-2xl shadow-chocolat/10 p-3 min-w-[180px] flex flex-col gap-1"
                  >
                    {PRICE_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => { setActivePriceRange(i === activePriceRange ? null : i); setShowPriceFilter(false); }}
                        className={`text-left px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activePriceRange === i ? 'bg-ocre/10 text-ocre' : 'text-chocolat/70 hover:bg-off-white hover:text-chocolat'}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chips statiques restants */}
            {[
              { name: "Disponibilité", icon: Calendar },
              { name: "Localisation", icon: MapPin },
            ].map((filter, i) => (
              <motion.button
                key={filter.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: (i + 2) * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 px-6 py-4 bg-white border border-ocre/10 rounded-full hover:border-ocre hover:bg-off-white transition-all group shadow-sm text-chocolat"
              >
                <filter.icon className="w-4 h-4 group-hover:text-ocre transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-widest">{filter.name}</span>
              </motion.button>
            ))}

            {/* Reset Filtres actifs */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setActiveCategory(null); setActivePriceRange(null); setSearchQuery(""); }}
                  className="flex items-center gap-2 px-4 py-4 text-ocre border border-ocre/30 rounded-full hover:bg-ocre/10 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <X className="w-3 h-3" /> Effacer
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* GRILLE DE SERVICES */}
        {isLoading ? (
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center gap-4 py-24 text-chocolat/50">
            <Loader2 className="w-10 h-10 animate-spin text-ocre" />
            <p className="text-sm font-bold uppercase tracking-widest">Chargement des services...</p>
          </div>
        ) : error ? (
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-chocolat font-bold">{error}</p>
            <button onClick={() => window.location.reload()} className="text-ocre text-sm font-black uppercase tracking-widest border-b border-ocre">Réessayer</button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-chocolat/50 font-bold">
              {hasActiveFilters ? "Aucun service ne correspond à vos filtres." : "Aucun service disponible pour le moment."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => { setActiveCategory(null); setActivePriceRange(null); setSearchQuery(""); }}
                className="text-ocre text-sm font-black uppercase tracking-widest border-b border-ocre mt-2"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {hasActiveFilters && (
              <p className="mt-8 text-[11px] font-black text-chocolat/40 uppercase tracking-widest">
                {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} trouvé{filteredServices.length > 1 ? 's' : ''}
              </p>
            )}
            <div className="mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        )}

        {/* CTA FINAL */}
        <div className="mt-20 flex justify-center">
          <button
            onClick={() => router.push('/services')}
            className="border-b-2 border-ocre/30 text-chocolat px-8 py-4 font-black text-xs uppercase tracking-[0.3em] hover:border-ocre transition-all active:scale-95"
          >
            Explorer tous les experts
          </button>
        </div>

      </div>

      {/* Fermer les dropdowns en cliquant dehors */}
      {(showCategoryFilter || showPriceFilter) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => { setShowCategoryFilter(false); setShowPriceFilter(false); }}
        />
      )}
    </section>
  );
}

