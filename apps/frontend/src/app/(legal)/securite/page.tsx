import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";

export const metadata: Metadata = { title: "Sécurité" };

export default function SecuritePage() {
  return <LegalDocument eyebrow="Votre compte" title="Sécurité" introduction="La sécurité des comptes, des demandes et des paiements est essentielle à Cascadheure. Voici nos mesures et les bons réflexes à adopter." sections={[
    { title: "Protection du compte", paragraphs: ["L’accès aux espaces personnels est protégé par un mot de passe et, lorsque nécessaire, par un code de vérification envoyé par e-mail. Les mots de passe ne doivent jamais être partagés."], items: ["Choisissez un mot de passe long et unique.", "N’envoyez jamais votre code de vérification à une autre personne.", "Déconnectez-vous d’un appareil qui n’est pas le vôtre."] },
    { title: "Paiements et demandes", paragraphs: ["Avant toute validation, vérifiez le service choisi, le montant, l’adresse et le créneau. Les opérations de paiement sont accompagnées d’une confirmation afin de faciliter leur suivi."], },
    { title: "Nos mesures", paragraphs: ["Nous appliquons des contrôles d’accès, des connexions sécurisées et une validation des données pour réduire les risques d’accès non autorisé. Nous surveillons également les erreurs et comportements inhabituels nécessaires à la protection de la plateforme."], },
    { title: "Signaler un problème", paragraphs: ["Si vous suspectez un accès non autorisé, une demande inhabituelle ou un problème de paiement, changez votre mot de passe puis contactez-nous immédiatement."], },
  ]} />;
}
