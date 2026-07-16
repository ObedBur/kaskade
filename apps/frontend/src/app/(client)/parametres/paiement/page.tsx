import Link from "next/link";

import SettingsCard from "@/components/settings/shared/SettingsCard";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  EllipsisVertical,
  Plus,
  WalletCards,
} from "lucide-react";

type PaymentStatusTone = "success" | "warning";

interface PaymentMethod {
  provider: string;
  number: string;
  status: string;
  statusTone: PaymentStatusTone;
  isDefault: boolean;
  brand: {
    label: string;
    bg: string;
    text: string;
  };
}

const paymentMethods: PaymentMethod[] = [
  {
    provider: "Airtel Money",
    number: "+243 8** *** 456",
    status: "Vérifié",
    statusTone: "success",
    isDefault: true,
    brand: {
      label: "airtel",
      bg: "bg-red-600",
      text: "text-white",
    },
  },
  {
    provider: "Vodacom M-Pesa",
    number: "+243 9** *** 789",
    status: "Vérifié",
    statusTone: "success",
    isDefault: false,
    brand: {
      label: "vod",
      bg: "bg-red-600",
      text: "text-white",
    },
  },
  {
    provider: "Orange Money",
    number: "+243 8** *** 123",
    status: "En attente",
    statusTone: "warning",
    isDefault: false,
    brand: {
      label: "orange",
      bg: "bg-orange-500",
      text: "text-white",
    },
  },
  {
    provider: "Africell Money",
    number: "+243 8** *** 987",
    status: "Vérifié",
    statusTone: "success",
    isDefault: false,
    brand: {
      label: "africell",
      bg: "bg-purple-700",
      text: "text-white",
    },
  },
];

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: PaymentStatusTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
        tone === "success"
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {tone === "success" ? (
        <BadgeCheck className="h-3.5 w-3.5" />
      ) : (
        <Clock3 className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

function BrandLogo({
  label,
  bg,
  text,
}: {
  label: string;
  bg: string;
  text: string;
}) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold uppercase tracking-tight ${bg} ${text}`}
    >
      {label}
    </div>
  );
}

export default function ParametresPaiementPage() {
  return (
    <SettingsSection
      title="Moyens de paiement"
      description="Gérez vos numéros Mobile Money utilisés pour payer vos prestataires sur Kaskade."
    >
      <div className="space-y-6">
        <SettingsCard>
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-[var(--chocolat)]">
                Vos moyens de paiement
              </h3>

              <Link
                href="/parametres/paiement/ajouter"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ocre)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Ajouter un moyen de paiement
              </Link>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.provider}
                  className="flex flex-col gap-4 rounded-2xl border border-[color:var(--settings-border)] bg-white px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <BrandLogo
                      label={method.brand.label}
                      bg={method.brand.bg}
                      text={method.brand.text}
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[var(--chocolat)]">
                          {method.provider}
                        </p>
                        {method.isDefault ? (
                          <span className="rounded-full bg-[#F5EBDD] px-2.5 py-1 text-[10px] font-bold text-[var(--ocre)]">
                            Par défaut
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-[var(--chocolat)]">
                          {method.number}
                        </p>
                        <StatusBadge label={method.status} tone={method.statusTone} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    {!method.isDefault ? (
                      <button
                        type="button"
                        className="rounded-lg border border-[color:var(--settings-border-strong)] px-4 py-2.5 text-[11px] font-bold text-[var(--chocolat)] transition-colors hover:bg-[var(--settings-hover)]"
                      >
                        Définir par défaut
                      </button>
                    ) : (
                      <div className="w-[144px]" />
                    )}

                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--chocolat-muted)] transition-colors hover:bg-[var(--settings-hover)] hover:text-[var(--chocolat)]"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[linear-gradient(180deg,#fff_0%,#fdfbf7_100%)] px-6 py-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
                  <WalletCards className="h-10 w-10" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold tracking-tight text-[var(--chocolat)]">
                    Vous n'avez pas encore de moyen de paiement enregistré
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--chocolat-muted)]">
                    Ajoutez un numéro Mobile Money pour payer vos prestataires plus rapidement.
                  </p>

                  <Link
                    href="/parametres/paiement/ajouter"
                    className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--ocre)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:opacity-90"
                  >
                    Ajouter un moyen de paiement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>

        <Link
          href="#"
          className="flex items-center justify-between rounded-2xl border border-[color:var(--settings-border-strong)] bg-white px-6 py-5 text-sm font-semibold text-[var(--chocolat)] shadow-sm transition-colors hover:bg-[var(--settings-hover)]"
        >
          <span>Voir l'historique de mes paiements</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SettingsSection>
  );
}
