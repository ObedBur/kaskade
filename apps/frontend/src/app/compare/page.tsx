"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2, TrendingUp, BadgeCheck } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { searchServices, SearchService, DEBOUNCE_MS, MIN_QUERY_LENGTH } from "@/lib/search-api";

function formatPrice(p: number | null | undefined, currency?: string | null): string {
  if (p == null) return "—";
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "$";
  return `${symbol}${p.toLocaleString("fr-FR")}`;
}

function CompareTable({ services }: { services: SearchService[] }) {
  const prices = services.map((s) => s.price).filter((p): p is number => p != null);
  const min = prices.length ? Math.min(...prices) : null;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-ocre/10 shadow-xl shadow-chocolat/5 bg-white">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-ocre/10 text-[11px] font-black uppercase tracking-widest text-chocolat/50">
            <th className="px-5 py-4">Service</th>
            <th className="px-5 py-4">Catégorie</th>
            <th className="px-5 py-4 text-right">Prix</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s, i) => (
            <tr
              key={s.id}
              className={`border-b border-ocre/5 transition-colors hover:bg-ocre/5 ${
                i % 2 === 1 ? "bg-chocolat/[0.02]" : ""
              }`}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-ocre/10 flex items-center justify-center text-chocolat font-black text-sm flex-shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-chocolat text-sm truncate flex items-center gap-1.5">
                      {s.name}
                    </p>
                    {s.quartiers && s.quartiers.length > 0 && (
                      <p className="text-[11px] text-chocolat/40 truncate">
                        {s.quartiers.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-ocre">
                  {s.category}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {s.price === min && min != null && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#1a7f37]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Meilleur prix
                    </span>
                  )}
                  <span className="font-black text-chocolat text-base">
                    {formatPrice(s.price, s.currency)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<SearchService[]>([]);
  const [state, setState] = useState<"loading" | "success" | "empty" | "error">("loading");
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initialisation depuis l'URL (?query=...) — c'est ce que pointe le bouton
  // « Voir tous les résultats » des suggestions.
  useEffect(() => {
    const q = searchParams.get("query");
    if (q) setQuery(q);
  }, [searchParams]);

  // Même logique que SearchAutocomplete : recherche backend nom-first,
  // debounce + AbortController + gestion des réponses obsolètes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      setServices([]);
      setState("empty");
      return;
    }

    debounceRef.current = setTimeout(() => {
      const ac = new AbortController();
      abortRef.current = ac;
      setState("loading");

      searchServices(q, { limit: 50, signal: ac.signal })
        .then((results) => {
          if (ac.signal.aborted) return;
          setServices(results);
          setState(results.length > 0 ? "success" : "empty");
        })
        .catch((err) => {
          if (err?.code === "ERR_CANCELED" || ac.signal.aborted) return;
          setServices([]);
          setState("error");
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <main className="bg-white min-h-screen font-sans selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      <section className="pt-28 pb-24 px-4 min-[480px]:px-8 min-[1440px]:px-12">
        <div className="arcture-container">
          <p className="text-ocre font-black text-[11px] uppercase tracking-[0.4em] mb-6">
            COMPARER LES PRIX
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-chocolat tracking-tighter leading-none uppercase mb-6">
            Comparez les <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocre to-[#d4af37] italic font-serif font-normal lowercase">
            services.
            </span>
          </h1>

          {/* Barre de recherche (même endpoint + même logique que les suggestions) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/compare?query=${encodeURIComponent(query.trim())}`);
            }}
            className="max-w-2xl relative flex items-stretch gap-2 p-2 bg-off-white rounded-[2rem] border border-ocre/10 shadow-xl shadow-chocolat/5 focus-within:border-ocre/30 transition-colors mb-10"
          >
            <div className="flex-1 flex items-center px-6">
              <Search className="w-5 h-5 text-ocre mr-3 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex : plombier, électricien..."
                className="w-full bg-transparent border-none focus:ring-0 text-chocolat font-bold text-sm uppercase tracking-widest placeholder:text-chocolat/30"
              />
            </div>
            <button
              type="submit"
              className="bg-chocolat text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-ocre hover:text-chocolat transition-all duration-300 active:scale-95"
            >
              Comparer
            </button>
          </form>

          {state === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-chocolat/50">
              <Loader2 className="w-10 h-10 animate-spin text-ocre" />
              <p className="text-sm font-bold uppercase tracking-widest">
                Recherche des services et comparaison des prix...
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <p className="text-chocolat font-bold">Impossible de lancer la recherche.</p>
              <button
                onClick={() => router.refresh()}
                className="text-ocre text-sm font-black uppercase tracking-widest border-b border-ocre"
              >
                Réessayer
              </button>
            </div>
          )}

          {state === "empty" && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <p className="text-chocolat/50 font-bold">
                Aucun service ne correspond à votre recherche.
              </p>
              <p className="text-chocolat/40 text-sm">
                La recherche se base sur le nom du service, pas sur la description.
              </p>
            </div>
          )}

          {state === "success" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-chocolat/60">
                  {services.length} service{services.length > 1 ? "s" : ""} trouvé{services.length > 1 ? "s" : ""}
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-chocolat/40">
                  <BadgeCheck className="w-4 h-4 text-ocre" />
                  Trié par pertinence puis prix
                </span>
              </div>
              <CompareTable services={services} />
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white" aria-busy="true" />
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
