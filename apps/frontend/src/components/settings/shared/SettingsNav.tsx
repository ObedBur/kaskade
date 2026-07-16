"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CircleHelp,
  CreditCard,
  Info,
  Languages,
  LockKeyhole,
  LogOut,
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
      { label: "Profil", href: "/parametres/profil", icon: UserRound },
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

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation des paramètres"
      className="flex h-full w-full flex-col px-6 py-8 lg:px-8 lg:py-14"
    >
      <div className="flex-1 space-y-8 overflow-y-auto pr-1 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--chocolat)_15%,transparent)] [&::-webkit-scrollbar-track]:bg-transparent">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--chocolat-muted)]">
              {group.label}
            </p>

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm transition-colors ${
                      active
                        ? "font-bold text-[var(--chocolat)]"
                        : "font-medium text-[var(--chocolat-muted)] hover:bg-[var(--settings-hover)] hover:text-[var(--chocolat)]"
                    }`}
                    style={active ? { backgroundColor: "color-mix(in srgb, var(--ocre) 25%, transparent)" } : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${active ? "text-[var(--chocolat)]" : "text-[var(--chocolat-muted)]"}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[color:var(--settings-border)] pt-5">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </nav>
  );
}
