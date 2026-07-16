import Link from "next/link";

import { ExternalLink } from "lucide-react";

export default function TermsLink() {
  return (
    <Link
      href="#"
      className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--settings-border)] bg-white px-5 py-5 transition-colors hover:bg-[var(--settings-hover)]"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--chocolat)]">
          Conditions Générales d'Utilisation
        </p>
        <p className="mt-1 text-xs leading-6 text-[var(--chocolat-muted)]">
          Le document contractuel complet encadrant l'usage de la plateforme est en cours de
          préparation.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ocre)]">
          Document en cours
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-[var(--chocolat-muted)]" />
      </div>
    </Link>
  );
}
