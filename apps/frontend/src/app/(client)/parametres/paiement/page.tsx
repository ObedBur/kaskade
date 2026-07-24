"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import {
  BadgeCheck,
  Clock3,
  AlertTriangle,
  XCircle,
  WalletCards,
  ArrowRight,
  Loader2,
  Receipt,
  RotateCw,
} from "lucide-react";
import api from "@/lib/api";

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  operator: string;
  phoneNumber: string;
  status: string;
  type: string; // DEPOSIT | FINAL
  mbiyoRef?: string | null;
  createdAt: string;
  request?: {
    id: string;
    status: string;
    service?: {
      id: string;
      name: string;
      category?: string;
    };
  };
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  if (normalized === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
        <BadgeCheck className="h-3.5 w-3.5" />
        Payé
      </span>
    );
  }

  if (normalized === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        <Clock3 className="h-3.5 w-3.5" />
        En cours
      </span>
    );
  }

  if (normalized === "CONFLICT_NEEDS_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
        <AlertTriangle className="h-3.5 w-3.5" />
        Vérification manuelle
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
      <XCircle className="h-3.5 w-3.5" />
      Échoué
    </span>
  );
}

function OperatorBadge({ operator }: { operator: string }) {
  const op = operator.toUpperCase();
  let bg = "bg-zinc-800 text-white";
  if (op === "VODACOM") bg = "bg-red-600 text-white";
  if (op === "AIRTEL") bg = "bg-red-700 text-white";
  if (op === "ORANGE") bg = "bg-orange-500 text-white";
  if (op === "AFRICELL") bg = "bg-purple-700 text-white";

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[9px] font-bold uppercase tracking-tight ${bg}`}
    >
      {op.slice(0, 4)}
    </div>
  );
}

export default function ParametresPaiementPage() {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/payments/my-history");
      setPayments(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistory();
  }, []);

  return (
    <SettingsSection
      title="Historique des paiements"
      description="Consultez l'historique complet de vos paiements d'acomptes et soldes sur Kaskade."
    >
      <div className="space-y-6">
        <SettingsCard>
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[color:var(--settings-border)] pb-4">
              <h3 className="text-lg font-bold text-[var(--chocolat)] flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[var(--ocre)]" />
                Transactions récentes
              </h3>

              <Link
                href="/mes-demandes"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ocre)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:opacity-90"
              >
                Mes demandes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex py-12 items-center justify-center text-[var(--ocre)]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50/50 px-6 py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <p className="text-xl font-bold tracking-tight text-[var(--chocolat)]">
                  Impossible de charger l'historique
                </p>
                <p className="mt-2 text-sm text-[var(--chocolat-muted)] max-w-md mx-auto">
                  Une erreur est survenue lors de la récupération de vos paiements. Veuillez vérifier votre connexion et réessayez.
                </p>
                <button
                  onClick={() => void fetchHistory()}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ocre)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:opacity-90"
                >
                  <RotateCw className="h-4 w-4" />
                  Réessayer
                </button>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[color:var(--settings-border)] bg-white px-5 py-4 md:flex-row md:items-center md:justify-between hover:border-[var(--ocre)]/30 transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <OperatorBadge operator={item.operator} />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-[var(--chocolat)]">
                            {item.request?.service?.name || "Service"}
                          </p>
                          <span className="rounded-full bg-[#F5EBDD] px-2.5 py-0.5 text-[10px] font-bold text-[var(--ocre)]">
                            {item.type === "DEPOSIT"
                              ? "Acompte (50%)"
                              : "Solde (50%)"}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--chocolat-muted)]">
                          <span>{item.phoneNumber}</span>
                          <span>•</span>
                          <span>
                            {new Date(item.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="text-right">
                        <p className="text-base font-black text-[var(--chocolat)]">
                          {item.currency === "USD"
                            ? `$${item.amount.toLocaleString("fr-CD", {
                                maximumFractionDigits: 2,
                              })}`
                            : `${item.amount.toLocaleString("fr-CD")} CDF`}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[linear-gradient(180deg,#fff_0%,#fdfbf7_100%)] px-6 py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)] mb-4">
                  <WalletCards className="h-8 w-8" />
                </div>
                <p className="text-xl font-bold tracking-tight text-[var(--chocolat)]">
                  Aucun paiement trouvé
                </p>
                <p className="mt-2 text-sm text-[var(--chocolat-muted)] max-w-md mx-auto">
                  Vous n'avez pas encore effectué de versement. Vos futurs acomptes et soldes apparaîtront ici.
                </p>
                <Link
                  href="/mes-demandes"
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--ocre)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:opacity-90"
                >
                  Voir mes demandes
                </Link>
              </div>
            )}
          </div>
        </SettingsCard>
      </div>
    </SettingsSection>
  );
}
