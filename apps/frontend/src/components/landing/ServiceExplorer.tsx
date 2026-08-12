"use client";

import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calculator,
  Calendar,
  ChevronRight,
  Loader2,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import ServiceCard from "./ServiceCard";

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency?: string | null;
  imageUrl: string | null;
  imageKey?: string | null;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  quartiers?: string[];
  provider?: {
    id: string;
    fullName: string;
    isVerified: boolean;
  };
  _count?: { reviews: number };
}

const BUDGET_OPTIONS = [
  { label: "Tous les budgets", min: 0, max: Infinity },
  { label: "Moins de 100 $", min: 0, max: 100 },
  { label: "100 $ - 300 $", min: 100, max: 300 },
  { label: "300 $ - 500 $", min: 300, max: 500 },
  { label: "Plus de 500 $", min: 500, max: Infinity },
];

const AVAILABILITY_OPTIONS = [
  { label: "Toutes disponibilités", key: "ALL" },
  { label: "Matin (avant 12h)", key: "MORNING" },
  { label: "Après-midi (12h - 18h)", key: "AFTERNOON" },
  { label: "Soirée (après 18h)", key: "EVENING" },
];

function getAvailabilityKey(start?: string): string {
  if (!start) return "ALL";
  const hour = parseInt(start.split(":")[0] || "0", 10);
  if (hour < 12) return "MORNING";
  if (hour < 18) return "AFTERNOON";
  return "EVENING";
}

export default function ServiceExplorer() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [budget, setBudget] = useState(0);
  const [availability, setAvailability] = useState("ALL");
  const [location, setLocation] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = searchParams.get("query");
    if (query) setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [...new Set(services.map((s) => s.category))].sort();
  const locations = [
    ...new Set(services.flatMap((s) => s.quartiers ?? [])),
  ].filter(Boolean).sort();

  const filteredServices = services.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !(
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    )) return false;

    if (category && s.category !== category) return false;

    const budgetOpt = BUDGET_OPTIONS[budget];
    if (budgetOpt && !(s.price >= budgetOpt.min && s.price < budgetOpt.max)) return false;

    if (availability !== "ALL" && getAvailabilityKey(s.workingHoursStart) !== availability) return false;

    if (location && !(s.quartiers ?? []).includes(location)) return false;

    return true;
  });

  const hasActiveFilters =
    category !== "" || budget > 0 || availability !== "ALL" || location !== "";

  const clearFilters = () => {
    setCategory("");
    setBudget(0);
    setAvailability("ALL");
    setLocation("");
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/services");
        setServices(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Erreur chargement services:", err);
        setError("Impossible de charger les services. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="py-24 md:py-32 bg-[#F5F3ED] relative overflow-hidden font-sans border-y border-ocre/10">
      {/* Éléments de structure (Glows Cascadheure) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ocre/5 rounded-full blur-[100px] -z-10 translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-chocolat/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="arcture-container relative">
        {/* EN-TÊTE : Inspiré de Stitch mais Style Cascadheure */}
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocre to-[#d4af37] italic font-serif font-normal lowercase">
              service.
            </span>
          </h2>

          <p className="text-chocolat/60 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
            Parcourez et demandez des services locaux certifiés pour tous vos
            besoins quotidiens, avec la garantie de qualité Cascadheure.
          </p>
        </div>

        {/* BARRE DE RECHERCHE & FILTRES : Style Premium Architectural */}
        <div className="flex flex-col gap-10">
          {/* Bloc de Recherche (Inspiré de Stitch Search Bar) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex flex-col md:flex-row items-stretch gap-4 p-2 bg-off-white rounded-[2.5rem] border border-ocre/10 shadow-xl shadow-chocolat/5 focus-within:border-ocre/30 transition-colors"
          >
            <div className="flex-1 flex items-center px-8 py-4 sm:py-6">
              <Search className="w-6 h-6 text-ocre mr-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quel service recherchez-vous ?"
                className="w-full bg-transparent border-none focus:ring-0 text-chocolat font-bold text-sm uppercase tracking-widest placeholder:text-chocolat/30"
              />
            </div>

            <button className="bg-chocolat text-white px-12 py-5 sm:py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-ocre hover:text-chocolat transition-all duration-300 shadow-lg shadow-chocolat/20 active:scale-95 group">
              RECHERCHER
              <ChevronRight className="w-4 h-4 inline-block ml-2 transition-transform group-hover:translate-x-1" />
            </button>          </motion.div>

          {/* FILTRES (Chips style minimal + dropdowns responsives) */}
          <div ref={filterRef} className="relative">
            <div className="flex flex-wrap gap-3 md:gap-4">
              {/* Catégorie */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === "category" ? null : "category")}
                  className={`flex items-center gap-2.5 px-5 py-3.5 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    category
                      ? "bg-chocolat text-white border-chocolat"
                      : "bg-white border-ocre/10 text-chocolat hover:border-ocre hover:bg-off-white"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-ocre" />
                  <span className="max-w-[120px] truncate">{category || "Catégorie"}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${activeFilter === "category" ? "rotate-90" : ""}`} />
                </button>
                {activeFilter === "category" && (
                  <div className="absolute left-0 top-full mt-3 w-60 max-w-[calc(100vw-3rem)] bg-white border border-ocre/10 rounded-2xl shadow-2xl shadow-chocolat/10 overflow-hidden z-30">
                    {categories.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        <button onClick={() => { setCategory(""); setActiveFilter(null); }} className={`w-full flex items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-widest transition-colors ${!category ? "text-ocre bg-ocre/5" : "text-chocolat/70 hover:bg-white/50"}`}>
                          Toutes les catégories {!category && <Check className="w-4 h-4 text-ocre" />}
                        </button>
                        {categories.map((c) => (
                          <button key={c} onClick={() => { setCategory(c); setActiveFilter(null); }} className={`w-full flex items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-widest transition-colors ${category === c ? "text-ocre bg-ocre/5" : "text-chocolat/70 hover:bg-white/50"}`}>
                            {c} {category === c && <Check className="w-4 h-4 text-ocre" />}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="px-5 py-4 text-xs text-chocolat/50">Aucune catégorie</p>
                    )}
                  </div>
                )}
              </div>

              {/* Budget */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === "budget" ? null : "budget")}
                  className={`flex items-center gap-2.5 px-5 py-3.5 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    budget > 0
                      ? "bg-chocolat text-white border-chocolat"
                      : "bg-white border-ocre/10 text-chocolat hover:border-ocre hover:bg-off-white"
                  }`}
                >
                  <Calculator className="w-4 h-4 text-ocre" />
                  <span className="max-w-[120px] truncate">{budget > 0 ? BUDGET_OPTIONS[budget].label : "Budget"}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${activeFilter === "budget" ? "rotate-90" : ""}`} />
                </button>
                {activeFilter === "budget" && (
                  <div className="absolute left-0 top-full mt-3 w-60 max-w-[calc(100vw-3rem)] bg-white border border-ocre/10 rounded-2xl shadow-2xl shadow-chocolat/10 overflow-hidden z-30">
                    {BUDGET_OPTIONS.map((opt, i) => (
                      <button key={opt.label} onClick={() => { setBudget(i); setActiveFilter(null); }} className={`w-full flex items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-widest transition-colors ${budget === i ? "text-ocre bg-ocre/5" : "text-chocolat/70 hover:bg-white/50"}`}>
                        {opt.label} {budget === i && <Check className="w-4 h-4 text-ocre" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Disponibilité */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === "availability" ? null : "availability")}
                  className={`flex items-center gap-2.5 px-5 py-3.5 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    availability !== "ALL"
                      ? "bg-chocolat text-white border-chocolat"
                      : "bg-white border-ocre/10 text-chocolat hover:border-ocre hover:bg-off-white"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-ocre" />
                  <span className="max-w-[160px] truncate">{availability !== "ALL" ? AVAILABILITY_OPTIONS.find(o => o.key === availability)?.label : "Disponibilité"}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${activeFilter === "availability" ? "rotate-90" : ""}`} />
                </button>
                {activeFilter === "availability" && (
                  <div className="absolute left-0 top-full mt-3 w-60 max-w-[calc(100vw-3rem)] bg-white border border-ocre/10 rounded-2xl shadow-2xl shadow-chocolat/10 overflow-hidden z-30">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <button key={opt.key} onClick={() => { setAvailability(opt.key); setActiveFilter(null); }} className={`w-full flex items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-widest transition-colors ${availability === opt.key ? "text-ocre bg-ocre/5" : "text-chocolat/70 hover:bg-white/50"}`}>
                        {opt.label} {availability === opt.key && <Check className="w-4 h-4 text-ocre" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Localisation */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === "location" ? null : "location")}
                  className={`flex items-center gap-2.5 px-5 py-3.5 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    location
                      ? "bg-chocolat text-white border-chocolat"
                      : "bg-white border-ocre/10 text-chocolat hover:border-ocre hover:bg-off-white"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-ocre" />
                  <span className="max-w-[120px] truncate">{location || "Localisation"}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${activeFilter === "location" ? "rotate-90" : ""}`} />
                </button>
                {activeFilter === "location" && (
                  <div className="absolute left-0 top-full mt-3 w-60 max-w-[calc(100vw-3rem)] bg-white border border-ocre/10 rounded-2xl shadow-2xl shadow-chocolat/10 overflow-hidden z-30">
                    {locations.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        <button onClick={() => { setLocation(""); setActiveFilter(null); }} className={`w-full flex items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-widest transition-colors ${!location ? "text-ocre bg-ocre/5" : "text-chocolat/70 hover:bg-white/50"}`}>
                          Toutes les zones {!location && <Check className="w-4 h-4 text-ocre" />}
                        </button>
                        {locations.map((loc) => (
                          <button key={loc} onClick={() => { setLocation(loc); setActiveFilter(null); }} className={`w-full flex items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-widest transition-colors ${location === loc ? "text-ocre bg-ocre/5" : "text-chocolat/70 hover:bg-white/50"}`}>
                            {loc} {location === loc && <Check className="w-4 h-4 text-ocre" />}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="px-5 py-4 text-xs text-chocolat/50">Aucune zone disponible</p>
                    )}
                  </div>
                )}
              </div>

              {/* Réinitialiser */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3.5 text-[11px] font-black uppercase tracking-widest text-ocre hover:text-chocolat border border-ocre/30 rounded-full hover:bg-ocre/5 transition-all"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>

        {/* GRILLE DE SERVICES */}
        {isLoading ? (
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center gap-4 py-24 text-chocolat/50">
            <Loader2 className="w-10 h-10 animate-spin text-ocre" />
            <p className="text-sm font-bold uppercase tracking-widest">
              Chargement des services...
            </p>
          </div>
        ) : error ? (
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-chocolat font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-ocre text-sm font-black uppercase tracking-widest border-b border-ocre"
            >
              Réessayer
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-chocolat/50 font-bold">
              Aucun service disponible pour le moment.
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-chocolat/50 font-bold">
              Aucun résultat pour les critères sélectionnés.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                clearFilters();
              }}
              className="text-ocre text-sm font-black uppercase tracking-widest border-b border-ocre"
            >
              Effacer la recherche et les filtres
            </button>
          </div>
        ) : (
          <div className="mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* CTA FINAL pour plus de services */}
        <div className="mt-20 flex justify-center">
          <button className="border-b-2 border-ocre/30 text-chocolat px-8 py-4 font-black text-xs uppercase tracking-[0.3em] hover:border-ocre transition-all active:scale-95">
            Explorer tous les experts
          </button>
        </div>
      </div>
    </section>
  );
}
