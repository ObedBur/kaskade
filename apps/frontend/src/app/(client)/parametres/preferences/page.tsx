import SettingsCard from "@/components/settings/shared/SettingsCard";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import {
  CircleDollarSign,
  Clock3,
  Globe,
  House,
  Info,
  LockKeyhole,
  Monitor,
  Settings2,
  ShoppingBag,
  UserRound,
} from "lucide-react";

const languageOptions = [
  { label: "Francais (par défaut)", flag: "FR" },
  { label: "English", flag: "EN" },
];

const currencyOptions = [
  "CDF - Franc congolais (CDF)",
  "USD - Dollar americain (USD)",
];

const weekOptions = ["Lundi", "Dimanche"];
const dateOptions = ["31/12/2025", "12/31/2025"];
const timeOptions = ["24 heures (14:30)", "12 heures (2:30 PM)"];
const reminderOptions = ["08:00", "09:00", "18:00"];

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
      {children}
    </div>
  );
}

function StaticSelect({
  value,
  secondary,
  leading,
}: {
  value: string;
  secondary?: string;
  leading?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {leading ? <span className="shrink-0">{leading}</span> : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--chocolat)]">{value}</p>
          {secondary ? (
            <p className="mt-0.5 text-xs text-[var(--chocolat-muted)]">{secondary}</p>
          ) : null}
        </div>
      </div>
      <span className="text-[var(--chocolat-muted)]">⌄</span>
    </div>
  );
}

function StaticToggle({ enabled = true }: { enabled?: boolean }) {
  return (
    <div
      className={`relative h-7 w-12 rounded-full border ${
        enabled
          ? "border-[color:var(--ocre)] bg-[color:var(--ocre)]"
          : "border-[color:var(--settings-border-strong)] bg-white"
      }`}
      aria-hidden="true"
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </div>
  );
}

function PreviewNavItem({
  icon,
  active = false,
}: {
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
        active
          ? "border-[color:var(--ocre)] bg-[var(--settings-ocre-soft)] text-[var(--ocre)]"
          : "border-transparent text-[var(--chocolat-muted)]"
      }`}
    >
      {icon}
    </div>
  );
}

export default function ParametresPreferencesPage() {
  return (
    <SettingsSection
      title="Langue & devise"
      description="Personnalisez la langue, la devise et les formats d'affichage selon vos préférences."
    >
      <SettingsCard>
        <div className="space-y-7">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Globe className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                Langue
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Choisissez la langue d'affichage de l'interface.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_280px]">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                Langue de l'interface
              </p>
              <StaticSelect
                value={languageOptions[0].label}
                leading={
                  <span className="inline-flex h-5 w-7 items-center justify-center rounded-sm bg-blue-50 text-[11px] font-bold text-blue-700">
                    {languageOptions[0].flag}
                  </span>
                }
              />
            </div>

            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[#FBF8F4] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--chocolat-muted)]">
                Aperçu immédiat
              </p>

              <div className="mt-4 grid grid-cols-[56px_1fr] overflow-hidden rounded-2xl border border-[color:var(--settings-border)] bg-white">
                <div className="flex flex-col items-center gap-3 border-r border-[color:var(--settings-border)] px-2 py-4">
                  <PreviewNavItem icon={<House className="h-4 w-4" />} />
                  <PreviewNavItem icon={<ShoppingBag className="h-4 w-4" />} />
                  <PreviewNavItem icon={<Monitor className="h-4 w-4" />} active />
                  <PreviewNavItem icon={<UserRound className="h-4 w-4" />} />
                </div>

                <div className="p-5">
                  <p className="text-base font-bold text-[var(--chocolat)]">Tableau de bord</p>
                  <p className="mt-2 text-sm text-[var(--chocolat-muted)]">
                    Bienvenue sur Kaskade
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[var(--chocolat-muted)]">
                    Voici un aperçu de l'interface dans la langue sélectionnée.
                  </p>
                  <button
                    type="button"
                    className="mt-5 rounded-lg bg-[var(--ocre)] px-4 py-2 text-[11px] font-bold text-white"
                  >
                    Voir les offres
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-700">
            <Info className="h-4 w-4 shrink-0" />
            <span>Les changements de langue sont appliqués automatiquement.</span>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-7">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <CircleDollarSign className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                Devise
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Choisissez votre devise d'affichage principale.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_280px]">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                  Devise d'affichage
                </p>
                <StaticSelect value={currencyOptions[0]} />
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-700">
                <Info className="h-4 w-4 shrink-0" />
                <span>
                  Cette préférence détermine l'affichage des prix, le taux de change utilisé reste
                  celui du jour.
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                  Format des nombres
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[color:var(--ocre)] bg-[#FFF7EE] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ocre)] text-[10px] font-bold text-white">
                        ✓
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--chocolat)]">
                          1 000,00 CDF
                        </p>
                        <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                          Convention locale
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[color:var(--settings-border)] bg-white px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-block h-4 w-4 rounded-full border border-[color:var(--settings-border-strong)]" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--chocolat)]">
                          1,000.00 CDF
                        </p>
                        <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                          Convention internationale
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--chocolat-muted)]">
                  Aperçu : 12 500 CDF | 1 250 000 CDF
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[#FBF8F4] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--chocolat-muted)]">
                Taux de change actuel
              </p>
              <p className="mt-6 text-3xl font-bold tracking-tight text-[var(--chocolat)]">
                1 USD = 2 850,45 CDF
              </p>
              <p className="mt-4 text-xs text-[var(--chocolat-muted)]">
                Mis à jour aujourd'hui à 10:24
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Clock3 className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                Fuseau horaire
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Le fuseau horaire utilisé pour les horaires, rappels et événements.
              </p>
            </div>
          </div>

          <div className="max-w-2xl space-y-3">
            <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
              Fuseau horaire actuel
            </p>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--settings-border)] bg-[var(--off-white)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--chocolat)]">
                  Africa/Kinshasa (UTC+01:00)
                </p>
                <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                  Fuseau horaire fixe pour Kaskade (RDC).
                </p>
              </div>
              <LockKeyhole className="h-4 w-4 shrink-0 text-[var(--chocolat-muted)]" />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-7">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Settings2 className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                Autres préférences
              </h3>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                Premier jour de la semaine
              </p>
              <StaticSelect value={weekOptions[0]} />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                Format de la date
              </p>
              <StaticSelect value={dateOptions[0]} />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                Format de l'heure
              </p>
              <StaticSelect value={timeOptions[0]} />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                  Notes et rappels
                </p>
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                    Heure d'envoi des rappels
                  </p>
                  <StaticSelect value={reminderOptions[0]} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 md:justify-start">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                    Utiliser le format relatif
                  </p>
                  <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                    Ex: il y a 2 heures, demain à 9h
                  </p>
                </div>
                <StaticToggle />
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[var(--off-white)] px-5 py-4">
              <p className="text-sm font-semibold text-[var(--chocolat)]">Aperçu</p>
              <p className="mt-3 text-xs text-[var(--chocolat-muted)]">Aujourd'hui à 14:30</p>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">Demain à 09:00</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[color:var(--settings-border)] pt-5 lg:flex-row lg:items-center lg:justify-between">
            <button
              type="button"
              className="self-start rounded-lg bg-[var(--settings-ocre-soft)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ocre)] transition-colors hover:bg-[var(--settings-hover)]"
            >
              Enregistrer les préférences
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--chocolat-muted)]">
              <LockKeyhole className="h-4 w-4" />
              <span>Vos préférences sont enregistrées automatiquement</span>
            </div>
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
