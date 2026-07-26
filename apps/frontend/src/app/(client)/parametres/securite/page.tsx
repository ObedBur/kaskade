import type { ReactNode } from "react";

import SettingsSection from "@/components/settings/shared/SettingsSection";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import PasswordChangeForm from "@/components/settings/security/PasswordChangeForm";
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
          <PasswordChangeForm />
        </div>
      </SettingsCard>

      {/* ... (le reste de la page reste statique pour l'instant) ... */}
    </SettingsSection>
  );
}
