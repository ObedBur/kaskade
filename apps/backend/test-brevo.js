const { BrevoClient } = require('@getbrevo/brevo');
require('dotenv').config();

async function testBrevo() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("❌ Erreur : BREVO_API_KEY n'est pas défini dans le fichier .env");
    process.exit(1);
  }

  console.log("🔍 Initialisation du client Brevo...");
  const client = new BrevoClient({ apiKey });

  try {
    // Essai d'envoi d'un email de test
    const emailTo = process.env.MAIL_FROM_EMAIL || "test@example.com";
    console.log(`✉️ Tentative d'envoi d'un e-mail de test à : ${emailTo}`);

    const result = await client.transactionalEmails.sendTransacEmail({
      subject: "Test de configuration Brevo - Kaskade",
      to: [{ email: emailTo, name: "Admin Kaskade" }],
      sender: {
        email: process.env.MAIL_FROM_EMAIL || "contact@kaskade.com",
        name: process.env.MAIL_FROM_NAME || "Kaskade Dev",
      },
      htmlContent: "<h1>Succès !</h1><p>Si vous lisez ceci, votre configuration Brevo fonctionne parfaitement.</p>",
    });

    console.log("✅ SUCCÈS ! L'e-mail a été envoyé avec succès.");
    console.log("Détails de la réponse :", JSON.stringify(result, null, 2));
    console.log(`\n👉 Vérifiez la boîte de réception de : ${emailTo}`);

  } catch (error) {
    console.error("❌ ERREUR lors de l'envoi de l'e-mail avec Brevo :");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error);
    }
  }
}

testBrevo();
