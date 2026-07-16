import type { ReactNode } from "react";

import Link from "next/link";

import SettingsCard from "@/components/settings/shared/SettingsCard";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import {
  ArrowRight,
  Download,
  Eye,
  FileClock,
  FileText,
  LockKeyhole,
  MapPin,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";

function SectionBadge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "soft";
}) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
        tone === "soft"
          ? "bg-sky-50 text-sky-700"
          : "bg-[var(--settings-ocre-soft)] text-[var(--ocre)]"
      }`}
    >
      {children}
    </div>
  );
}

function StaticToggle({ enabled = false }: { enabled?: boolean }) {
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

function ToggleRow({
  icon,
  title,
  description,
  value,
  helper,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  value?: string;
  helper?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[color:var(--settings-border)] bg-white px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--off-white)] text-[var(--ocre)]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--chocolat)]">{title}</p>
          <p className="mt-1 text-xs leading-6 text-[var(--chocolat-muted)]">{description}</p>
          {value ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--ocre)]">
              {value}
            </p>
          ) : null}
          {helper ? (
            <p className="mt-1 text-xs text-[var(--chocolat-muted)]">{helper}</p>
          ) : null}
        </div>
      </div>

      <div className="self-end lg:self-auto">
        <StaticToggle enabled />
      </div>
    </div>
  );
}

function ActionRow({
  icon,
  title,
  description,
  cta,
  href = "#",
  danger = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
  href?: string;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[color:var(--settings-border)] bg-white px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            danger ? "bg-red-50 text-red-500" : "bg-[var(--off-white)] text-[var(--ocre)]"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--chocolat)]">{title}</p>
          <p className="mt-1 text-xs leading-6 text-[var(--chocolat-muted)]">{description}</p>
        </div>
      </div>

      <Link
        href={href}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
          danger
            ? "border-red-200 text-red-500 hover:bg-red-50"
            : "border-[color:var(--settings-border-strong)] text-[var(--chocolat)] hover:bg-[var(--settings-hover)]"
        }`}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function ParametresConfidentialitePage() {
  return (
    <SettingsSection
      title="Confidentialité"
      description="Contrôlez qui voit vos informations et gérez vos données personnelles."
    >
      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Eye className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                1. Visibilité du profil
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Gérez comment vos informations sont visibles auprès des prestataires.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleRow
              icon={<Users className="h-5 w-5" />}
              title="Visibilité auprès des prestataires"
              description="Autorisez les prestataires à voir votre profil, vos préférences et les informations utiles lors d'une mise en relation."
              value="Visible pour les prestataires vérifiés"
            />
            <ToggleRow
              icon={<MapPin className="h-5 w-5" />}
              title="Partage de la localisation"
              description="Partagez votre position précise ou uniquement votre quartier afin d'améliorer la qualité des propositions reçues."
              value="Partage limité au quartier"
              helper="Votre position précise n'est jamais affichée publiquement."
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <ShieldCheck className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                2. Communications & consentement
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Choisissez comment vos données peuvent être utilisées pour améliorer votre
                expérience.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleRow
              icon={<Megaphone className="h-5 w-5" />}
              title="Communications marketing"
              description="Recevez des offres, nouveautés et recommandations personnalisées liées à vos usages sur Kaskade."
              value="Activé"
            />
            <ToggleRow
              icon={<FileText className="h-5 w-5" />}
              title="Partage de données anonymisées"
              description="Autorisez l'utilisation de données anonymisées pour les analyses produits, les statistiques et l'amélioration des services."
              value="Autorisé"
              helper="Aucune donnée directement identifiable n'est partagée."
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge tone="soft">
              <LockKeyhole className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                3. Mes données
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Accédez à vos informations personnelles et à l'historique de votre activité.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ActionRow
              icon={<Download className="h-5 w-5" />}
              title="Demander un export de mes données"
              description="Préparez une archive contenant vos informations personnelles, préférences et données liées à votre compte."
              cta="Demander l'export"
            />
            <ActionRow
              icon={<FileClock className="h-5 w-5" />}
              title="Voir l'historique complet de mes demandes"
              description="Consultez l'ensemble de vos demandes passées, en cours et archivées depuis votre compte Kaskade."
              cta="Voir l'historique"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard className="bg-[#FCFAF7]">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <ShieldCheck className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                4. Informations légales
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Retrouvez les documents utiles liés à la protection de vos données et aux actions
                sensibles sur votre compte.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ActionRow
              icon={<FileText className="h-5 w-5" />}
              title="Politique de confidentialité"
              description="Consultez les règles de collecte, d'utilisation et de conservation de vos données personnelles sur Kaskade."
              cta="Lire la politique"
            />
            <ActionRow
              icon={<LockKeyhole className="h-5 w-5" />}
              title="Supprimer mon compte"
              description="Cette action est disponible dans les paramètres de sécurité et entraîne la suppression définitive du compte."
              cta="Aller à sécurité"
              href="/parametres/securite"
              danger
            />
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
