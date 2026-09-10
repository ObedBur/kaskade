import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function ConditionsPage() {
  return <LegalDocument eyebrow="Utiliser Cascadheure" title="Conditions d’utilisation" introduction="Ces conditions encadrent l’utilisation de Cascadheure, une plateforme de mise en relation entre clients et prestataires de services à Goma." sections={[
    { title: "La plateforme", paragraphs: ["Cascadheure permet de rechercher des services, d’envoyer des demandes et de suivre les étapes de réservation. Chaque utilisateur s’engage à fournir des informations exactes et à utiliser la plateforme de manière respectueuse et légale."], },
    { title: "Comptes et demandes", paragraphs: ["Vous êtes responsable de la confidentialité de vos identifiants et de l’activité réalisée depuis votre compte. Les demandes doivent contenir des informations exactes afin que les prestataires puissent évaluer leur intervention."], items: ["Les clients choisissent le service et le créneau souhaité.", "Les prestataires restent responsables des informations relatives à leurs offres et disponibilités.", "Toute utilisation frauduleuse ou abusive peut entraîner la suspension d’un compte."] },
    { title: "Prix et paiements", paragraphs: ["Les prix affichés et les modalités de paiement sont présentés avant la confirmation d’une demande. Cascadheure prend en charge les flux de paiement disponibles sur la plateforme, notamment via les solutions mobile money proposées."], items: ["Vérifiez le montant et les détails de la demande avant de confirmer.", "Conservez les confirmations et références de transaction reçues."] },
    { title: "Évolution du service", paragraphs: ["Nous pouvons faire évoluer ces conditions pour tenir compte d’une amélioration du service, d’un changement de fonctionnement ou d’une obligation légale. La version publiée sur cette page est la version de référence."], },
  ]} />;
}
