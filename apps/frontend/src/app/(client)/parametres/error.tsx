"use client";

import { useEffect } from "react";

interface ParametresErrorProps {
  error: Error;
  reset: () => void;
}

export default function ParametresError({ error, reset }: ParametresErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-2xl rounded-[28px] border border-[color:var(--settings-border)] bg-white p-10 text-center shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[var(--chocolat-muted)]">
          Erreur de chargement
        </p>
        <h2 className="text-[2rem] font-black tracking-[-0.04em] text-[var(--chocolat)]">
          Impossible d’afficher cette section.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--chocolat-muted)]">
          Une erreur est survenue dans cette vue des paramètres. Réessayez pour relancer le
          rendu de la section en conservant la navigation.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[var(--chocolat)] px-6 py-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--off-white)] transition-colors hover:bg-[var(--ocre)] hover:text-[var(--chocolat)]"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
