import Link from "next/link";

import SettingsCard from "@/components/settings/shared/SettingsCard";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import PrivacyPolicyLink from "@/components/settings/about/PrivacyPolicyLink";
import TermsLink from "@/components/settings/about/TermsLink";
import {
  ArrowRight,
  Building2,
  ExternalLink,
  FileBadge,
  Globe,
  Info,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
      {children}
    </div>
  );
}

function LegalLink({
  title,
  description,
  href = "#",
  status = "Document en cours",
}: {
  title: string;
  description: string;
  href?: string;
  status?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--settings-border)] bg-white px-5 py-5 transition-colors hover:bg-[var(--settings-hover)]"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--chocolat)]">{title}</p>
        <p className="mt-1 text-xs leading-6 text-[var(--chocolat-muted)]">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ocre)]">
          {status}
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-[var(--chocolat-muted)]" />
      </div>
    </Link>
  );
}

function ContactLink({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--settings-border)] bg-white px-5 py-5 transition-colors hover:bg-[var(--settings-hover)]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--off-white)] text-[var(--ocre)]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--chocolat)]">{title}</p>
          <p className="mt-1 text-xs text-[var(--chocolat-muted)]">{value}</p>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--chocolat-muted)]" />
    </Link>
  );
}

export default function ParametresAProposPage() {
  return (
    <SettingsSection
      title="À propos"
      description="Informations légales et à propos de Kaskade."
    >
      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Info className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                1. Présentation de Kaskade
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Informations essentielles sur la plateforme et son positionnement.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_280px]">
            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[linear-gradient(180deg,#fff_0%,#fdfbf7_100%)] px-6 py-6">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--ocre)] text-xl font-black tracking-wide text-white">
                  K
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ocre)]">
                    Kaskade
                  </p>
                  <h4 className="mt-2 text-2xl font-bold tracking-tight text-[var(--chocolat)]">
                    Kaskade connecte les habitants de Goma à des prestataires de services
                    vérifiés.
                  </h4>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--chocolat-muted)]">
                    La plateforme simplifie la mise en relation, sécurise les paiements et offre
                    une expérience premium pensée pour les besoins du quotidien.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[#FBF8F4] px-5 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--chocolat-muted)]">
                  Version de l'application
                </p>
                <p className="mt-3 text-xl font-bold text-[var(--chocolat)]">Kaskade v1.2.0</p>
              </div>

              <div className="rounded-2xl border border-[color:var(--settings-border)] bg-white px-5 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--chocolat-muted)]">
                  Dernière mise à jour
                </p>
                <p className="mt-3 text-sm font-semibold text-[var(--chocolat)]">16 juillet 2026</p>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <FileBadge className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                2. Documents légaux
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Accédez aux documents contractuels et juridiques de référence.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <TermsLink />
            <PrivacyPolicyLink />
            <LegalLink
              title="Politique de remboursement / garantie de paiement"
              description="Document formel détaillant les règles de remboursement, de médiation et la garantie de paiement Kaskade."
            />
            <LegalLink
              title="Mentions légales"
              description="Les informations de structure juridique, raison sociale et identifiants officiels seront publiées dès finalisation."
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Globe className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                3. Réseaux sociaux & contact
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Retrouvez Kaskade sur les canaux publics et l'adresse de contact général.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ContactLink
              icon={<Instagram className="h-5 w-5" />}
              title="Instagram"
              value="@kaskade.app"
              href="#"
            />
            <ContactLink
              icon={<Linkedin className="h-5 w-5" />}
              title="LinkedIn"
              value="Kaskade"
              href="#"
            />
            <ContactLink
              icon={<Mail className="h-5 w-5" />}
              title="Contact général"
              value="contact@kaskade.app"
              href="mailto:contact@kaskade.app"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard className="bg-[#FCFAF7]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Building2 className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                4. Zone bas de page
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                © 2026 Kaskade Systems
              </p>
            </div>
          </div>

          <p className="text-xs text-[var(--chocolat-muted)]">
            Les documents juridiques sont en cours de finalisation et seront publiés ici dès
            validation.
          </p>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
