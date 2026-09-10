import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return <LegalDocument eyebrow="Vos données" title="Politique de confidentialité" introduction="Cascadheure connecte les habitants de Goma à des prestataires de services. Cette page explique quelles informations sont nécessaires au fonctionnement de la plateforme et comment elles sont utilisées." sections={[
    { title: "Données collectées", paragraphs: ["Nous recueillons les informations que vous fournissez lors de la création de votre compte ou d’une demande : nom, adresse e-mail, numéro de téléphone, quartier, rôle sur la plateforme et informations liées aux services demandés."], items: ["Les détails utiles à une demande : service, adresse, créneau et description.", "Les informations de paiement et les références de transaction nécessaires au suivi des acomptes et paiements.", "Les données techniques indispensables à la sécurité et au fonctionnement du site."] },
    { title: "Utilisation des données", paragraphs: ["Ces informations servent à créer et sécuriser votre compte, vous mettre en relation avec le bon prestataire, traiter vos demandes et vous contacter au sujet de votre activité sur Cascadheure."], items: ["Faciliter les réservations et les paiements.", "Prévenir les abus, fraudes et accès non autorisés.", "Améliorer la qualité, la sécurité et la fiabilité du service."] },
    { title: "Partage limité", paragraphs: ["Nous ne vendons pas vos données personnelles. Les informations nécessaires à l’exécution d’une demande sont communiquées au prestataire concerné. Nous pouvons aussi recourir à des fournisseurs techniques pour l’hébergement, l’envoi d’e-mails et les paiements mobile money."], items: ["Votre localisation précise n’est pas affichée publiquement.", "Le prestataire ne reçoit que les informations utiles à la réalisation de la demande."] },
    { title: "Vos choix", paragraphs: ["Vous pouvez consulter ou mettre à jour les informations de votre compte dans vos paramètres. Pour demander l’accès, la correction ou la suppression de vos données, contactez-nous à l’adresse indiquée ci-dessous."], },
  ]} />;
}
