import type { ReactNode } from "react";

import SettingsSection from "@/components/settings/shared/SettingsSection";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import {
  BadgeCheck,
  CircleAlert,
  Clock3,
  KeyRound,
  Laptop,
  LockKeyhole,
  Monitor,
  Shield,
  Smartphone,
  Trash2,
} from "lucide-react";

const passwordRequirements = [
  "Minimum 8 caracteres",
  "Une majuscule (A-Z)",
  "Une minuscule (a-z)",
  "Un chiffre (0-9)",
  "Un caractere special (!@#$%^&*)",
];

const activeSessions = [
  {
    device: "Windows - Chrome",
    location: "Kinshasa, RDC",
    ip: "197.210.12.45",
    status: "En ligne maintenant",
    current: true,
    icon: Monitor,
  },
  {
    device: "Android - Chrome",
    location: "Kinshasa, RDC",
    ip: "197.210.12.45",
    status: "Il y a 2 heures",
    icon: Smartphone,
  },
  {
    device: "MacOS - Safari",
    location: "Lubumbashi, RDC",
    ip: "41.223.10.18",
    status: "Il y a 1 jour",
    icon: Laptop,
  },
  {
    device: "iPhone - Safari",
    location: "Goma, RDC",
    ip: "102.98.14.22",
    status: "Il y a 3 jours",
    icon: Smartphone,
  },
];

function SectionBadge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
        tone === "danger"
          ? "bg-red-50 text-red-500"
          : "bg-[var(--settings-ocre-soft)] text-[var(--ocre)]"
      }`}
    >
      {children}
    </div>
  );
}

function StaticToggle({
  enabled = false,
  disabled = false,
}: {
  enabled?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`relative h-7 w-12 rounded-full border transition-colors ${
        enabled
          ? "border-[color:var(--ocre)] bg-[color:var(--ocre)]"
          : "border-[color:var(--settings-border-strong)] bg-white"
      } ${disabled ? "opacity-60" : ""}`}
      aria-hidden="true"
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </div>
  );
}

export default function ParametresSecuritePage() {
  return (
    <SettingsSection
      title="Sécurité"
      description="Gérez les paramètres qui protègent votre compte et vos données."
    >
      <SettingsCard>
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <LockKeyhole className="h-5 w-5" />
            </SectionBadge>
            <div className="min-w-0">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                1. Changer le mot de passe
              </h3>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_280px]">
            <div className="space-y-5">
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                  Mot de passe actuel
                </span>
                <div className="relative">
                  <input
                    readOnly
                    value="************"
                    className="w-full rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--chocolat)] outline-none"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--chocolat-muted)]">
                    <KeyRound className="h-4 w-4" />
                  </span>
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                  Nouveau mot de passe
                </span>
                <div className="relative">
                  <input
                    readOnly
                    value="************"
                    className="w-full rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--chocolat)] outline-none"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--chocolat-muted)]">
                    <KeyRound className="h-4 w-4" />
                  </span>
                </div>
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                    Force du mot de passe :
                  </span>
                  <span className="text-xs font-bold text-[var(--ocre)]">Moyen</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--settings-hover)]">
                  <div
                    className="h-2 rounded-full bg-[var(--ocre)]"
                    style={{ width: "58%" }}
                  />
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                  Confirmer le nouveau mot de passe
                </span>
                <div className="relative">
                  <input
                    readOnly
                    value="************"
                    className="w-full rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--chocolat)] outline-none"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--chocolat-muted)]">
                    <KeyRound className="h-4 w-4" />
                  </span>
                </div>
              </label>
            </div>

            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[var(--off-white)] p-5">
              <p className="text-xs font-bold text-[var(--chocolat)]">
                Exigences du mot de passe
              </p>
              <div className="mt-4 space-y-3">
                {passwordRequirements.map((requirement) => (
                  <div
                    key={requirement}
                    className="flex items-center gap-3 text-xs text-[var(--chocolat-muted)]"
                  >
                    <span className="h-3 w-3 rounded-full border border-[color:var(--settings-border-strong)]" />
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="self-end rounded-lg border border-[color:var(--settings-border-strong)] bg-[var(--off-white)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ocre)] transition-colors hover:bg-[var(--settings-hover)]"
            >
              Mettre à jour le mot de passe
            </button>

            <div className="flex items-center gap-3 rounded-xl bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-700">
              <CircleAlert className="h-4 w-4 shrink-0" />
              <span>
                Après la mise à jour, vous serez déconnecté de tous les autres appareils.
              </span>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <BadgeCheck className="h-5 w-5" />
            </SectionBadge>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                2. Vérification du numéro de téléphone
              </h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                Numéro de téléphone
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-base font-bold text-[var(--chocolat)]">+243 81 000 0000</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Vérifié
                </span>
              </div>
              <p className="text-xs text-[var(--chocolat-muted)]">
                Votre numéro de téléphone est utilisé pour la connexion, la récupération de
                compte et les notifications importantes.
              </p>
            </div>

            <button
              type="button"
              className="self-start rounded-lg border border-[color:var(--settings-border-strong)] bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ocre)] transition-colors hover:bg-[var(--settings-hover)]"
            >
              Modifier le numéro
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Monitor className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                3. Sessions actives
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Gérez les appareils et navigateurs sur lesquels votre compte est connecté.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--settings-border)]">
            <div className="hidden grid-cols-[1.4fr_1.1fr_1fr_0.8fr] gap-4 bg-[var(--off-white)] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--chocolat-muted)] md:grid">
              <span>Appareil</span>
              <span>Localisation</span>
              <span>Dernière activité</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-[color:var(--settings-border)]">
              {activeSessions.map((session) => {
                const Icon = session.icon;

                return (
                  <div
                    key={`${session.device}-${session.status}`}
                    className={`grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_1.1fr_1fr_0.8fr] md:items-center ${
                      session.current ? "bg-green-50/80" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--chocolat-muted)] shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--chocolat)]">
                          {session.device}
                        </p>
                        {session.current ? (
                          <p className="text-xs font-bold text-green-700">Cet appareil</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-sm text-[var(--chocolat)]">
                      <p>{session.location}</p>
                      <p className="text-xs text-[var(--chocolat-muted)]">{session.ip}</p>
                    </div>

                    <p
                      className={`text-sm font-semibold ${
                        session.current ? "text-green-700" : "text-[var(--chocolat-muted)]"
                      }`}
                    >
                      {session.status}
                    </p>

                    <div className="flex md:justify-start">
                      {session.current ? (
                        <span className="px-2 py-1 text-xs font-bold text-[var(--chocolat-muted)]">
                          -
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500 transition-colors hover:bg-red-50"
                        >
                          Déconnecter
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <button
              type="button"
              className="rounded-lg border border-red-200 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 transition-colors hover:bg-red-50"
            >
              Déconnecter tous les autres appareils
            </button>
          </div>
        </div>
      </SettingsCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard>
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <SectionBadge>
                  <Shield className="h-5 w-5" />
                </SectionBadge>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--chocolat)]">
                    4. Authentification à deux facteurs (2FA)
                  </h3>
                  <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                    Ajoutez une couche de sécurité supplémentaire à votre compte.
                  </p>
                </div>
              </div>

              <StaticToggle disabled />
            </div>

            <div className="rounded-2xl border border-dashed border-[color:var(--settings-border-strong)] bg-[var(--off-white)] px-6 py-8 text-center">
              <Shield className="mx-auto h-5 w-5 text-[var(--chocolat-muted)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--chocolat)]">
                Bientôt disponible
              </p>
              <p className="mt-2 text-xs text-[var(--chocolat-muted)]">
                Cette fonctionnalité sera disponible prochainement.
              </p>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard>
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <SectionBadge>
                  <Clock3 className="h-5 w-5" />
                </SectionBadge>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--chocolat)]">
                    5. Historique de connexion
                  </h3>
                  <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                    Consultez les dernières connexions à votre compte.
                  </p>
                </div>
              </div>

              <StaticToggle disabled />
            </div>

            <div className="rounded-2xl border border-dashed border-[color:var(--settings-border-strong)] bg-[var(--off-white)] px-6 py-8 text-center">
              <Clock3 className="mx-auto h-5 w-5 text-[var(--chocolat-muted)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--chocolat)]">
                Bientôt disponible
              </p>
              <p className="mt-2 text-xs text-[var(--chocolat-muted)]">
                Cette fonctionnalité sera disponible prochainement.
              </p>
            </div>
          </div>
        </SettingsCard>
      </div>

      <SettingsCard className="border-red-100 bg-red-50/40">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <SectionBadge tone="danger">
                <Trash2 className="h-5 w-5" />
              </SectionBadge>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
                  6. Supprimer le compte
                </h3>
                <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                  La suppression de votre compte est définitive. Cette action supprimera vos
                  données personnelles de manière permanente.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-[#FFF5EF] px-5 py-4">
              <ul className="space-y-2 text-xs text-[var(--chocolat-muted)]">
                <li>- Vos données de transaction seront conservées conformément à nos obligations légales.</li>
                <li>- Cette action ne peut pas être annulée.</li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            className="self-start rounded-lg border border-red-200 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-red-500 transition-colors hover:bg-red-50"
          >
            Supprimer mon compte
          </button>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
