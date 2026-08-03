"use client";

import type { ReactNode } from "react";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import PasswordChangeForm from "@/components/settings/security/PasswordChangeForm";
import {
  BadgeCheck,
  Clock3,
  LockKeyhole,
  Monitor,
  Shield,
  Smartphone,
  Laptop,
  Trash2,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";

/* ─── Sessions actives (données de démonstration) ─── */
const activeSessions = [
  {
    device: "Windows — Chrome",
    location: "Kinshasa, RDC",
    ip: "197.210.12.45",
    status: "En ligne maintenant",
    current: true,
    icon: Monitor,
  },
  {
    device: "Android — Chrome",
    location: "Kinshasa, RDC",
    ip: "197.210.12.45",
    status: "Il y a 2 heures",
    icon: Smartphone,
  },
  {
    device: "MacOS — Safari",
    location: "Lubumbashi, RDC",
    ip: "41.223.10.18",
    status: "Il y a 1 jour",
    icon: Laptop,
  },
];

/* ─── Sous-composants réutilisables ─── */
function SectionIcon({
  icon: Icon,
  tone = "default",
}: {
  icon: React.ElementType;
  tone?: "default" | "danger" | "success";
}) {
  const cls = {
    default: "bg-[var(--settings-ocre-soft)] text-[var(--ocre)]",
    danger:  "bg-red-50  text-red-500",
    success: "bg-green-50 text-green-600",
  }[tone];

  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${cls}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

function CardHeader({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  tone?: "default" | "danger" | "success";
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <SectionIcon icon={icon} tone={tone} />
      <div>
        <h3 className="text-sm font-bold text-[var(--chocolat)] uppercase tracking-[0.15em]">{title}</h3>
        {description && (
          <p className="text-xs text-[var(--chocolat-muted)] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

function StaticToggle({ enabled = false }: { enabled?: boolean }) {
  return (
    <div
      className={`relative h-7 w-12 rounded-full border transition-colors cursor-not-allowed ${
        enabled
          ? "border-[var(--ocre)] bg-[var(--ocre)]"
          : "border-[var(--settings-border-strong)] bg-[var(--settings-hover)]"
      }`}
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

/* ─── Page principale ─── */
export default function ParametresSecuritePage() {
  return (
    <SettingsSection
      title="Sécurité"
      description="Gérez les paramètres qui protègent votre compte et vos données personnelles."
    >

      {/* ══ 1. Changer le mot de passe ══ */}
      <SettingsCard>
        <CardHeader
          icon={LockKeyhole}
          title="Changer le mot de passe"
          description="Mettez à jour régulièrement votre mot de passe pour renforcer la sécurité de votre compte."
        />
        <PasswordChangeForm />
      </SettingsCard>

      {/* ══ 2. Authentification à deux facteurs ══ */}
      <SettingsCard>
        <CardHeader
          icon={Fingerprint}
          title="Authentification à deux facteurs (2FA)"
          description="Ajoutez une couche de sécurité supplémentaire à votre connexion."
        />
        <div className="space-y-4">
          {/* Option SMS */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--settings-border)] bg-[var(--off-white)] px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)]">
                <Smartphone className="h-4 w-4 text-[var(--ocre)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--chocolat)]">Code par SMS</p>
                <p className="text-[11px] text-[var(--chocolat-muted)] mt-0.5">Recevez un code sur votre numéro de téléphone</p>
              </div>
            </div>
            <StaticToggle enabled={false} />
          </div>

          {/* Option Authenticator */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--settings-border)] bg-[var(--off-white)] px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)]">
                <Shield className="h-4 w-4 text-[var(--ocre)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--chocolat)]">Application Authenticator</p>
                <p className="text-[11px] text-[var(--chocolat-muted)] mt-0.5">Google Authenticator, Authy ou équivalent</p>
              </div>
            </div>
            <StaticToggle enabled={false} />
          </div>

          <p className="text-[11px] text-[var(--chocolat-muted)] italic px-1">
            La 2FA sera disponible dans une prochaine mise à jour.
          </p>
        </div>
      </SettingsCard>

      {/* ══ 3. Sessions actives ══ */}
      <SettingsCard>
        <CardHeader
          icon={BadgeCheck}
          title="Sessions actives"
          description="Ces appareils sont actuellement connectés à votre compte."
        />
        <div className="divide-y divide-[var(--settings-border)]">
          {activeSessions.map((session, i) => (
            <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
                <session.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[var(--chocolat)]">{session.device}</p>
                  {session.current && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">
                      Actuel
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-[11px] text-[var(--chocolat-muted)]">{session.location} · {session.ip}</p>
                  <span className="text-[var(--settings-border-strong)]">·</span>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--chocolat-muted)]">
                    <Clock3 className="h-3 w-3" />
                    {session.status}
                  </div>
                </div>
              </div>
              {!session.current && (
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-[var(--settings-border-strong)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--chocolat-muted)] hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  Révoquer
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-[var(--settings-border)]">
          <button
            type="button"
            className="rounded-xl border border-red-200 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-red-500 hover:bg-red-50 transition-colors"
          >
            Déconnecter tous les autres appareils
          </button>
        </div>
      </SettingsCard>

      {/* ══ 4. Supprimer le compte ══ */}
      <SettingsCard>
        <CardHeader
          icon={Trash2}
          title="Supprimer le compte"
          description="Cette action est irréversible. Toutes vos données seront définitivement effacées."
          tone="danger"
        />
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 flex items-start gap-3 mb-5">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed">
            La suppression de votre compte entraîne la perte définitive de toutes vos réservations, messages et données personnelles. Cette action ne peut pas être annulée.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-red-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer mon compte définitivement
        </button>
      </SettingsCard>

    </SettingsSection>
  );
}
