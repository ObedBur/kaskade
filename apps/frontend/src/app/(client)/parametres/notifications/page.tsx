import type { ReactNode } from "react";

import SettingsSection from "@/components/settings/shared/SettingsSection";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleX,
  LockKeyhole,
  Megaphone,
  MessageSquareText,
} from "lucide-react";

type NotificationIconTone =
  | "amber"
  | "green"
  | "blue"
  | "red"
  | "purple"
  | "amber-soft";

interface NotificationRow {
  title: string;
  description: string;
  icon: typeof BriefcaseBusiness;
  iconTone: NotificationIconTone;
  smsLocked: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

const notificationRows: NotificationRow[] = [
  {
    title: "Nouvelle offre d'un prestataire",
    description: "Vous recevez une nouvelle offre pour votre demande.",
    icon: BriefcaseBusiness,
    iconTone: "amber",
    smsLocked: true,
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    title: "Confirmation de paiement",
    description: "Vous recevez une confirmation après un paiement réussi.",
    icon: CheckCircle2,
    iconTone: "green",
    smsLocked: true,
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    title: "Rappel de rendez-vous",
    description: "Rappel avant un rendez-vous programmé.",
    icon: CalendarDays,
    iconTone: "blue",
    smsLocked: false,
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    title: "Demande annulée / refusée",
    description: "Vous êtes informé lorsqu'une demande est annulée ou refusée.",
    icon: CircleX,
    iconTone: "red",
    smsLocked: true,
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    title: "Nouveau message d'un prestataire",
    description: "Vous recevez un nouveau message dans la conversation.",
    icon: MessageSquareText,
    iconTone: "purple",
    smsLocked: false,
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    title: "Promotions / actualités Kaskade",
    description: "Recevez nos offres spéciales et actualités.",
    icon: Megaphone,
    iconTone: "amber-soft",
    smsLocked: false,
    pushEnabled: true,
    emailEnabled: true,
  },
];

function NotificationIcon({
  tone,
  children,
}: {
  tone: NotificationIconTone;
  children: ReactNode;
}) {
  const toneClassMap = {
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-600",
    purple: "bg-violet-50 text-violet-700",
    "amber-soft": "bg-orange-50 text-orange-600",
  } as const;

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${toneClassMap[tone]}`}
    >
      {children}
    </div>
  );
}

function StaticToggle({
  enabled = false,
}: {
  enabled?: boolean;
}) {
  return (
    <div
      className={`relative mx-auto h-7 w-12 rounded-full border ${
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

function SmsLockBadge() {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--settings-border)] bg-[var(--off-white)] px-2 py-1">
        <LockKeyhole className="h-3 w-3 text-[var(--chocolat-muted)]" />
        <span className="text-[10px] font-bold text-[var(--chocolat)]">Activé</span>
      </div>
      <span className="text-[9px] text-[var(--chocolat-muted)] text-center leading-tight">Non désactivable</span>
    </div>
  );
}

export default function ParametresNotificationsPage() {
  return (
    <SettingsSection
      title="Notifications"
      description="Choisissez comment et quand vous souhaitez être notifié."
    >
      <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm text-sky-800">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="max-w-4xl font-medium">
          Certaines notifications importantes sont envoyées par SMS et ne peuvent pas être
          désactivées pour des raisons de sécurité et de fiabilité.
        </p>
      </div>

      <SettingsCard
        title="Préférences de notifications"
        description="Activez ou désactivez les canaux de notification selon vos préférences."
      >
        <div className="overflow-hidden rounded-2xl border border-[color:var(--settings-border)]">
          <div className="hidden grid-cols-[1.9fr_0.7fr_0.7fr_0.7fr] items-center bg-[var(--off-white)] px-6 py-4 md:grid">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--chocolat-muted)]">
              Type d'événement
            </span>
            <span className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--chocolat-muted)]">
              SMS
            </span>
            <span className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--chocolat-muted)]">
              Push
            </span>
            <span className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--chocolat-muted)]">
              Email
            </span>
          </div>

          <div className="divide-y divide-[color:var(--settings-border)]">
            {notificationRows.map((row) => {
              const Icon = row.icon;

              return (
                <div
                  key={row.title}
                  className="px-5 py-5 md:grid md:grid-cols-[1.9fr_0.7fr_0.7fr_0.7fr] md:items-center md:gap-5 md:px-6"
                >
                  {/* Infos de la notification */}
                  <div className="flex items-start gap-3 mb-4 md:mb-0">
                    <NotificationIcon tone={row.iconTone}>
                      <Icon className="h-5 w-5" />
                    </NotificationIcon>
                    <div>
                      <p className="text-sm font-semibold text-[var(--chocolat)]">{row.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-[var(--chocolat-muted)]">
                        {row.description}
                      </p>
                    </div>
                  </div>

                  {/* Canaux sur mobile : 3 colonnes avec label+toggle empilés */}
                  <div className="grid grid-cols-3 gap-3 md:contents">
                    {/* SMS */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--chocolat-muted)] md:hidden">
                        SMS
                      </span>
                      {row.smsLocked ? <SmsLockBadge /> : <StaticToggle enabled={true} />}
                    </div>

                    {/* Push */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--chocolat-muted)] md:hidden">
                        Push
                      </span>
                      <StaticToggle enabled={row.pushEnabled} />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--chocolat-muted)] md:hidden">
                        Email
                      </span>
                      <StaticToggle enabled={row.emailEnabled} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SettingsCard>

      <div className="flex flex-col gap-5 rounded-2xl border border-[color:var(--settings-border)] bg-[#FBF8F4] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--chocolat)]">
              À propos des notifications
            </p>
            <p className="mt-1 max-w-3xl text-xs leading-6 text-[var(--chocolat-muted)]">
              Les notifications SMS importantes sont toujours activées pour garantir que vous ne
              manquiez aucune information essentielle concernant votre compte et vos paiements.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="self-start rounded-lg border border-[color:var(--settings-border-strong)] bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ocre)] transition-colors hover:bg-[var(--settings-hover)]"
        >
          Réinitialiser aux paramètres par défaut
        </button>
      </div>
    </SettingsSection>
  );
}
