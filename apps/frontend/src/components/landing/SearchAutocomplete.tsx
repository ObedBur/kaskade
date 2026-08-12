"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import api from "@/lib/api";

interface SearchService {
  id: string;
  name: string;
  category: string;
  price: number | null;
  imageUrl?: string | null;
}

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
  const [services, setServices] = useState<SearchService[]>([]);
  const [suggestions, setSuggestions] = useState<SearchService[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get("/services")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setServices(data);
      })
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    const matches = services
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSuggestions(matches);
    setIsOpen(matches.length > 0);
    setActiveIndex(-1);
  }, [query, services]);

  const submit = (value: string) => {
    const q = value.trim();
    if (!q) return;
    router.push(`/services?query=${encodeURIComponent(q)}`);
    setQuery("");
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
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        submit(suggestions[activeIndex].name);
      }
    }
  };

  const inputBase = dark
    ? "block w-full bg-black/20 border border-white/10 rounded-md py-2 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-ocre transition-all"
    : "block w-full bg-white border border-ocre/10 rounded-md py-2 pl-11 pr-4 text-sm text-chocolat placeholder:text-chocolat/30 focus:outline-none focus:ring-1 focus:ring-ocre transition-all";

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
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`${inputBase} ${actionLabel ? "pr-28" : "pr-4"}`}
        />
        {actionLabel && (
          <button
            type="submit"
            className="absolute inset-y-0 right-0 mr-1.5 my-auto h-10 px-6 bg-chocolat text-white text-xs font-black uppercase tracking-widest rounded-md hover:bg-ocre hover:text-chocolat transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className={dropdownBase}>
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
        </div>
      )}
    </div>
  );
}
