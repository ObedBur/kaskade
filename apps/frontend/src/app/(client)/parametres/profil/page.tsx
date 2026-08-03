import SettingsSection from "@/components/settings/shared/SettingsSection";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import ProfileForm from "@/components/settings/profile/ProfileForm";

export default function ParametresProfilPage() {
  return (
    <SettingsSection title="Mon Profil">
      <ProfileForm />
    </SettingsSection>
  );
}