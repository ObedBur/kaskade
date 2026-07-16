import type { CSSProperties, ReactNode } from "react";

import SettingsNav from "@/components/settings/shared/SettingsNav";

const settingsShellVars = {
  "--off-white": "#FCFBF7",
  "--chocolat": "#321B13",
  "--chocolat-muted": "rgba(50, 27, 19, 0.85)",
  "--ocre": "#BC9C6C",
  "--font-h1-mobile": "2.25rem",
  "--font-h1-tablet": "3rem",
  "--font-h1-desktop": "4.5rem",
  "--settings-border": "color-mix(in srgb, var(--chocolat) 12%, transparent)",
  "--settings-border-strong": "color-mix(in srgb, var(--chocolat) 16%, transparent)",
  "--settings-hover": "color-mix(in srgb, var(--chocolat) 6%, transparent)",
  "--settings-ocre-soft": "color-mix(in srgb, var(--ocre) 16%, transparent)",
} as CSSProperties;

interface ParametresLayoutProps {
  children: ReactNode;
}

import { Sun, Globe, ChevronDown, UserRound } from "lucide-react";

export default function ParametresLayout({ children }: ParametresLayoutProps) {
  return (
    <div
      style={settingsShellVars}
      className="flex h-screen flex-col overflow-hidden bg-white text-[var(--chocolat)]"
    >
      {/* Top Header */}
      <header className="flex h-[88px] shrink-0 items-center justify-between border-b border-[color:var(--settings-border-strong)] px-8 lg:px-12">
        <div className="flex items-center gap-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-xs font-bold text-[var(--ocre)] tracking-widest">
            LOGO
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-[var(--chocolat)]">
            Paramètres
          </h1>
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <button className="text-[var(--chocolat-muted)] hover:text-[var(--chocolat)] transition-colors">
            <Sun className="h-5 w-5" />
          </button>
          <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-[var(--chocolat-muted)] hover:text-[var(--chocolat)] transition-colors">
            <Globe className="h-5 w-5" />
            <span>FR</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <UserRound className="h-5 w-5" />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="hidden min-h-0 w-[280px] shrink-0 overflow-y-auto border-r border-[color:var(--settings-border-strong)] bg-white md:block">
          <SettingsNav />
        </aside>

        {/* Right Content */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--off-white)] p-8 lg:p-14">
          <div className="mx-auto max-w-[900px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
