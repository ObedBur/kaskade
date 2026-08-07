"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
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
  const { user } = useAuth();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="block md:hidden pb-12">
      <div className="mb-6 px-2">
        <h2 className="text-2xl font-serif font-black text-[var(--chocolat)]">
          Bonjour, {user?.fullName?.split(' ')[0] || 'Client'}
        </h2>
        <p className="text-xs text-[var(--chocolat-muted)] mt-1 tracking-wide">
          Gérez vos préférences et votre compte Cascadheure.
        </p>
      </div>

      <SettingsSection>
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show"
          className="space-y-6"
        >
          {navGroups.map((group) => (
            <motion.div key={group.label} variants={itemAnim} className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--ocre)] pl-2">
                {group.label}
              </p>
              <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="block group">
                    <SettingsCard className="!p-3.5 transition-all duration-300 group-hover:border-[var(--ocre)] group-hover:shadow-md bg-gradient-to-br from-white to-[#FCFBF7]">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)] group-hover:bg-[var(--ocre)] group-hover:text-white transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--chocolat)]">{item.label}</p>
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
                          className="lucide lucide-chevron-right text-[var(--chocolat-muted)] group-hover:text-[var(--ocre)] transition-colors"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    </SettingsCard>
                  </Link>
                );
              })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </SettingsSection>
    </div>
  );
}
