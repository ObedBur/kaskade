"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2, X } from "lucide-react";
import { searchServices, SearchService } from "@/lib/search-api";

interface SearchAutocompleteProps {
  dark?: boolean;
  placeholder?: string;
  onSelect?: () => void;
  actionLabel?: string;
  className?: string;
}

export default function SearchAutocomplete({
  dark = false,
  placeholder = "Rechercher un service...",
  onSelect,
  actionLabel,
  className = "",
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchService[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const normalizeQuery = (q: string) =>
    q.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");

  const fetchSuggestions = useCallback(async (q: string) => {
    const norm = q.trim();
    if (norm.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchServices(norm, { limit: 8, signal: ac.signal });
      if (!ac.signal.aborted) {
        setSuggestions(data);
        setIsOpen(data.length > 0);
        setActiveIndex(-1);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Erreur de recherche");
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      if (!ac.signal.aborted) setIsLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    const norm = normalizeQuery(value);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (norm.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(norm);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      debounceRef.current && clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const submit = (value: string) => {
    const q = value.trim();
    if (!q) return;
    router.push(`/services?query=${encodeURIComponent(q)}`);
    setQuery("");
    setIsOpen(false);
    onSelect?.();
  };

  const goToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/compare?query=${encodeURIComponent(q)}`);
    setIsOpen(false);
    onSelect?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) submit(suggestions[activeIndex].name);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const inputBase = dark
    ? "block w-full bg-black/20 border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-ocre transition-all"
    : "block w-full bg-white border border-ocre/10 rounded-md py-2 pl-10 pr-4 text-sm text-chocolat placeholder:text-chocolat/30 focus:outline-none focus:ring-1 focus:ring-ocre transition-all";

  const dropdownBase = dark
    ? "absolute top-full mt-2 w-full bg-chocolat border border-white/10 rounded-md shadow-2xl overflow-hidden z-[70]"
    : "absolute top-full mt-2 w-full bg-white border border-ocre/10 rounded-md shadow-2xl overflow-hidden z-[70]";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); submit(query); }} className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-4 w-4 ${dark ? "text-ocre/60" : "text-ocre"}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (query.trim().length >= 2 && suggestions.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`${inputBase} ${actionLabel ? "pr-24 min-[360px]:pr-28" : "pr-4"}`}
        />
        {isLoading && (
          <Loader2 className="absolute inset-y-0 right-4 my-auto h-4 w-4 animate-spin text-ocre" />
        )}
        {error && !isLoading && (
          <button
            type="button"
            onClick={() => { setError(null); handleChange(query); }}
            className="absolute inset-y-0 right-4 my-auto h-5 w-5 text-red-400 hover:text-red-300"
            aria-label="Réessayer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {actionLabel && (
          <button
            type="submit"
            className="absolute inset-y-0 right-0 mr-1 my-auto h-9 px-3 text-[10px] min-[360px]:mr-1.5 min-[360px]:h-10 min-[360px]:px-5 min-[360px]:text-xs bg-chocolat text-white font-black uppercase tracking-wider min-[360px]:tracking-widest rounded-md hover:bg-ocre hover:text-chocolat transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </form>

      {isOpen && (
        <div className={dropdownBase}>
          {isLoading && (
            <div className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-ocre/60">
              <Loader2 className="mx-auto mb-1 h-4 w-4 animate-spin" />
              Recherche...
            </div>
          )}
          {error && !isLoading && (
            <div className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-red-400">
              Erreur de recherche
            </div>
          )}
          {!isLoading && !error && suggestions.length === 0 && (
            <div className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-chocolat/40">
              Aucun service trouvé
            </div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => submit(s.name)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                i === activeIndex
                  ? dark
                    ? "bg-white/5 text-white"
                    : "bg-ocre/5 text-chocolat"
                  : dark
                    ? "text-white/70"
                    : "text-chocolat/70"
              }`}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-bold truncate">{s.name}</span>
                <span className={`text-[10px] uppercase tracking-widest ${dark ? "text-white/40" : "text-chocolat/40"}`}>
                  {s.category}
                </span>
              </div>
              <ArrowRight className={`w-4 h-4 flex-shrink-0 ${dark ? "text-ocre/60" : "text-ocre"}`} />
            </button>
          ))}
          {!isLoading && !error && (suggestions.length > 0 || query.trim().length >= 2) && (
            <div className={`border-t ${dark ? "border-white/10" : "border-ocre/10"}`}>
              <a
                href={`/compare?query=${encodeURIComponent(query.trim())}`}
                onClick={goToCompare}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-ocre/10 group ${
                  dark ? "text-ocre" : "text-ocre"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-widest">
                  Voir tous les résultats
                </span>
                <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1 ${dark ? "text-ocre" : "text-ocre"}`} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
