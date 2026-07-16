import SettingsSection from "@/components/settings/shared/SettingsSection";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import { UserRound, User, Mail, Phone, FileText, Map, MapPin, Building } from "lucide-react";

export default function ParametresProfilPage() {
  return (
    <SettingsSection title="Mon Profil">
      
      {/* 1. En-tête du profil (Avatar & Info rapide) */}
      <SettingsCard>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <UserRound className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[var(--chocolat)]">John Doe</h3>
              <p className="text-sm text-[var(--chocolat-muted)]">Client</p>
              <p className="mt-1 text-sm flex items-center gap-1.5 text-[var(--chocolat-muted)]">
                <MapPin className="h-3.5 w-3.5" />
                Kinshasa, RDC
              </p>
            </div>
          </div>
          
          <button
            type="button"
            className="shrink-0 rounded-lg border border-[color:var(--settings-border-strong)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--ocre)] transition-colors hover:bg-[var(--settings-hover)]"
          >
            Modifier
          </button>
        </div>
      </SettingsCard>

      {/* 2. Informations personnelles */}
      <SettingsCard title="Informations Personnelles" actionLabel="Modifier">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Prénom</p>
              <p className="text-sm font-semibold text-[var(--chocolat)]">John</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Nom</p>
              <p className="text-sm font-semibold text-[var(--chocolat)]">Doe</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Adresse email</p>
              <p className="text-sm font-semibold text-[var(--chocolat)]">john.doe@exemple.com</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Téléphone</p>
              <p className="text-sm font-semibold text-[var(--chocolat)]">+243 81 000 0000</p>
            </div>
          </div>

          <div className="flex gap-4 sm:col-span-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Bio</p>
              <p className="text-sm font-semibold text-[var(--chocolat)] leading-relaxed">
                Utilisateur régulier de la plateforme Kaskade. À la recherche des meilleurs prestataires de la région.
              </p>
            </div>
          </div>

        </div>
      </SettingsCard>

      {/* 3. Adresse */}
      <SettingsCard title="Adresse" actionLabel="Modifier">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <Map className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Pays</p>
              <p className="text-sm font-semibold text-[var(--chocolat)]">République Démocratique du Congo</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Ville / Province</p>
              <p className="text-sm font-semibold text-[var(--chocolat)]">Kinshasa</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
              <Building className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Quartier</p>
              <p className="text-sm font-semibold text-[var(--chocolat)]">Gombe</p>
            </div>
          </div>

        </div>
      </SettingsCard>

    </SettingsSection>
  );
}
