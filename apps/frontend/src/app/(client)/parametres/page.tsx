"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CircleHelp,
  CreditCard,
  Info,
  Languages,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Compte",
    items: [
      { label: "Mon profil", href: "/parametres/profil", icon: UserRound },
      { label: "Sécurité", href: "/parametres/securite", icon: ShieldCheck },
    ],
  },
  {
    label: "Préférences",
    items: [
      { label: "Notifications", href: "/parametres/notifications", icon: Bell },
      { label: "Langue & devise", href: "/parametres/preferences", icon: Languages },
    ],
  },
  {
    label: "Paiement",
    items: [
      { label: "Moyens de paiement", href: "/parametres/paiement", icon: CreditCard },
    ],
  },
  {
    label: "Confidentialité",
    items: [
      { label: "Confidentialité", href: "/parametres/confidentialite", icon: LockKeyhole },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Aide", href: "/parametres/aide", icon: CircleHelp },
      { label: "À propos", href: "/parametres/a-propos", icon: Info },
    ],
  },
];

export default function ParametresPage() {
  const pathname = usePathname();

  return (
    <div className="block md:hidden">
      <SettingsSection title="Paramètres">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--chocolat-muted)]">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <SettingsCard className="flex items-center justify-between !p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--chocolat)]">{item.label}</p>
                          {/* Description could be added here if available in navGroups or passed separately */}
                        </div>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-right text-[var(--chocolat-muted)]"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </SettingsCard>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </SettingsSection>
    </div>
  );
}
