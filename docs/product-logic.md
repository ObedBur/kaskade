Pour les utilisateurs FREE (Sécurité Maximale)
C'est le modèle "Pay-as-you-go" classique.

Paiement : Le client doit payer les 50% d'acompte immédiatement pour que sa demande soit prise en compte par l'Admin.
Workflow :
Demande + Paiement 50%.
L'Admin valide.
Le prestataire accepte.
L'idée : Comme on ne connaît pas bien l'utilisateur Free, on sécurise la plateforme et le prestataire dès le premier clic. 


2. Pour les utilisateurs PREMIUM (Expérience Fluide & Confiance)
Le système Premium pourrait fonctionner comme un Abonnement (déjà suggéré par les champs scheduleFrequency dans votre code).

Paiement : Comme l'utilisateur Premium paye déjà un abonnement, on pourrait lui offrir une "Priorité d'Intervention".
Crédit de Confiance : Peut-être que pour eux, le paiement des 50% ne se fait pas à la commande, mais automatiquement dès qu'un prestataire accepte (via une carte enregistrée ou un solde portefeuille).
Récurrence : Le système Premium gère les services récurrents (ex: Ménage tous les lundis). Le paiement de l'acompte de 50% peut être automatisé 24h avant chaque intervention. 


Paiement Confirmé : Dès que le Webhook de paiement reçoit les 50%, le système émet un événement request.ready_for_dispatch.
Le "Broadcast" : Le backend identifie tous les prestataires qui sont libres sur ce créneau et qui font ce service.
Notification Temps Réel : On envoie une notification WebSocket (ou Push) à tous ces prestataires : "Nouvelle mission disponible à 10h ! Payée à 50%. Soyez le premier à l'accepter !".
Course à l'acceptation : Le premier prestataire qui appelle l'API acceptRequest gagne la mission. Le statut passe de APPROVED à ACCEPTED. 