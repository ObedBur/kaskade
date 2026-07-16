import type { ReactNode } from "react";

import Link from "next/link";

import SettingsCard from "@/components/settings/shared/SettingsCard";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Globe,
  Info,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";

type SupportTone = "green" | "amber" | "slate";

interface QuickSupportCard {
  title: string;
  description: string;
  action: string;
  helper: string;
  icon: typeof MessageCircle;
  tone: SupportTone;
  value?: string;
}

const quickSupportCards: QuickSupportCard[] = [
  {
    title: "WhatsApp",
    description: "Discutez avec notre équipe sur WhatsApp.",
    action: "Contacter via WhatsApp",
    helper: "Réponse généralement en quelques minutes pendant les heures d'ouverture.",
    icon: MessageCircle,
    tone: "green",
    value: undefined,
  },
  {
    title: "Téléphone",
    description: "Appelez notre service client directement.",
    action: "Cliquez pour appeler",
    helper: "Lundi - Samedi\n08h00 - 18h00",
    icon: Phone,
    tone: "amber",
    value: "+243 81 000 0000",
  },
  {
    title: "Email",
    description: "Envoyez-nous un email, nous vous répondrons rapidement.",
    action: "Envoyer un email",
    helper: "Réponse généralement sous 24 heures ouvrables.",
    icon: Mail,
    tone: "slate",
    value: "support@kaskade.cd",
  },
];

const faqItems = [
  { icon: ShieldCheck, question: "Comment fonctionne la garantie de paiement ?" },
  { icon: Smartphone, question: "Quels moyens de paiement sont acceptés ?" },
  { icon: CircleAlert, question: "Comment ajouter un moyen de paiement ?" },
  { icon: Trash2, question: "Comment supprimer un moyen de paiement ?" },
  { icon: Info, question: "Les prestataires sont-ils vérifiés ?" },
  { icon: CalendarDays, question: "Puis-je reporter une intervention déjà planifiée ?" },
  { icon: ShieldCheck, question: "Que se passe-t-il si je ne suis pas satisfait ?" },
  { icon: Info, question: "Comment supprimer mon compte ?" },
];

function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
      {children}
    </div>
  );
}

function StaticSelect({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3">
      <span className="text-sm font-semibold text-[var(--chocolat-muted)]">{value}</span>
      <ChevronDown className="h-4 w-4 text-[var(--chocolat-muted)]" />
    </div>
  );
}

function SupportIcon({
  children,
  tone,
}: {
  children: ReactNode;
  tone: SupportTone;
}) {
  const toneClassMap = {
    green: "bg-green-50 text-green-600",
    amber: "bg-[var(--settings-ocre-soft)] text-[var(--ocre)]",
    slate: "bg-slate-50 text-slate-600",
  } as const;

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${toneClassMap[tone]}`}
    >
      {children}
    </div>
  );
}

export default function ParametresAidePage() {
  return (
    <SettingsSection
      title="Aide"
      description="Besoin d'assistance ? Trouvez une réponse ou contactez-nous."
    >
      <SettingsCard>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <SectionBadge>
                <MessageCircle className="h-5 w-5" />
              </SectionBadge>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                  1. Assistance rapide
                </h3>
                <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                  Contactez notre équipe par le canal de votre choix.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#F2FBF4] px-4 py-2 text-xs font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>Support en ligne</span>
              <span className="text-green-600/80">Nous sommes disponibles.</span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {quickSupportCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[color:var(--settings-border)] bg-white p-5"
                >
                  <SupportIcon tone={card.tone}>
                    <Icon className="h-5 w-5" />
                  </SupportIcon>

                  <p className="mt-5 text-lg font-bold text-[var(--chocolat)]">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--chocolat-muted)]">
                    {card.description}
                  </p>

                  {card.value ? (
                    <p className="mt-5 text-xl font-bold tracking-tight text-[var(--chocolat)]">
                      {card.value}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    className="mt-5 rounded-lg border border-[color:var(--settings-border-strong)] bg-[#FBF8F4] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ocre)] transition-colors hover:bg-[var(--settings-hover)]"
                  >
                    {card.action}
                  </button>

                  <p className="mt-5 whitespace-pre-line text-xs leading-6 text-[var(--chocolat-muted)]">
                    {card.helper}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Mail className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                2. Nous envoyer un message
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Décrivez votre demande et notre équipe vous répondra dans les plus brefs délais.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">Sujet</p>
              <StaticSelect value="Sélectionnez un sujet" />
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">Message</p>
              <div className="min-h-[140px] rounded-2xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-4 text-sm text-[var(--chocolat-muted)]">
                Décrivez votre problème en donnant le plus de détails possible.
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                Capture d'écran (optionnel)
              </p>
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-[color:var(--settings-border-strong)] bg-[#FCFAF7] px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--chocolat-muted)] shadow-sm">
                  <Paperclip className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--chocolat)]">
                    Ajouter une capture d'écran
                  </p>
                  <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                    PNG, JPG ou PDF - Max. 10 Mo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-[var(--ocre)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:opacity-90"
              >
                Envoyer le message
              </button>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <SectionBadge>
                <Info className="h-5 w-5" />
              </SectionBadge>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                  3. Questions fréquentes
                </h3>
                <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                  Trouvez rapidement une réponse parmi les questions les plus courantes.
                </p>
              </div>
            </div>

            <Link
              href="#"
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[var(--chocolat)] transition-colors hover:text-[var(--ocre)]"
            >
              Voir toutes les questions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--settings-border)] bg-white">
            {faqItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.question}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    index !== faqItems.length - 1
                      ? "border-b border-[color:var(--settings-border)]"
                      : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--off-white)] text-[var(--chocolat-muted)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-[var(--chocolat)]">{item.question}</p>
                  </div>

                  <ChevronDown className="h-4 w-4 shrink-0 text-[var(--chocolat-muted)]" />
                </div>
              );
            })}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard className="bg-[#FCFAF7]">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <SectionBadge>
              <Info className="h-5 w-5" />
            </SectionBadge>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--chocolat)]">
                4. Informations techniques
              </h3>
              <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
                Détails utiles pour nous aider à résoudre les problèmes techniques.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">Plateforme</p>
              <p className="mt-2 text-sm font-semibold text-[var(--chocolat)]">Web</p>
            </div>

            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">Navigateur</p>
              <p className="mt-2 text-sm font-semibold text-[var(--chocolat)]">Chrome 138</p>
            </div>

            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">Langue</p>
              <p className="mt-2 text-sm font-semibold text-[var(--chocolat)]">Français</p>
            </div>

            <div className="rounded-2xl border border-[color:var(--settings-border)] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                Fuseau horaire
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--chocolat)]">
                Africa/Kinshasa
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--settings-border-strong)] bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ocre)] transition-colors hover:bg-[var(--settings-hover)]"
            >
              <CircleAlert className="h-4 w-4" />
              Signaler un problème technique
            </button>
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
