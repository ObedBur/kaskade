require('dotenv').config();

async function testBrevo() {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.MAIL_FROM_EMAIL || "obedburindi@gmail.com";
    const senderName = process.env.MAIL_FROM_NAME || "Kaskade App";
    
    if (!apiKey) {
        console.error("❌ Erreur: BREVO_API_KEY n'est pas définie dans le fichier .env");
        process.exit(1);
    }

    console.log("Tentative d'envoi de l'email via l'API Brevo en direct...");

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: senderEmail, name: "Admin Kaskade" }],
                subject: "Test de l'intégration Brevo - Kaskade",
                htmlContent: "<html><body><h1>Email de test réussi!</h1><p>Si vous recevez cet email, cela signifie que la configuration Brevo fonctionne parfaitement dans votre projet Kaskade.</p><p>Votre clé API est valide.</p></body></html>"
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Succès! Email envoyé avec succès.');
            console.log('Message ID: ', data.messageId);
        } else {
            console.error('❌ Erreur lors de l\'envoi de l\'email.');
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Exception lors de la requête:");
        console.error(error);
    }
}

testBrevo();
