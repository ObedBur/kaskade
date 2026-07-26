import type { ReactNode } from "react";

import Link from "next/link";

import SettingsCard from "@/components/settings/shared/SettingsCard";
import SettingsSection from "@/components/settings/shared/SettingsSection";
import ContactSupportForm from "@/components/settings/help/ContactSupportForm";
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

// ... (le reste du code de la page reste le même)

export default function ParametresAidePage() {
  return (
    <SettingsSection
      title="Aide"
      description="Besoin d'assistance ? Trouvez une réponse ou contactez-nous."
    >
      {/* ... (Assistance rapide, etc.) ... */}

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

          <ContactSupportForm />

        </div>
      </SettingsCard>

      {/* ... (Questions fréquentes, etc.) ... */}

    </SettingsSection>
  );
}

// Le reste des composants (SectionBadge, etc.) peut être gardé ou supprimé si non utilisé ailleurs.
function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
      {children}
    </div>
  );
}
