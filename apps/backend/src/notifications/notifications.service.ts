import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RequestStatusChangedEvent } from '../requests/events/request-status.event';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /**
   * DESIGN PATTERN : OBSERVER / EVENT-DRIVEN
   * Écoute les changements de statut des requêtes.
   */
  @OnEvent('request.status.changed')
  handleRequestStatusChanged(event: RequestStatusChangedEvent) {
    const { requestId, oldStatus, newStatus, actorId } = event;

    this.logger.log(`🔔 NOTIFICATION : Demande #${requestId} est passée de ${oldStatus} à ${newStatus} (Action par: ${actorId})`);

    // Logique de dispatch : On imagine ici envoyer un Email (Brevo) ou un SMS
    switch (newStatus) {
      case RequestStatus.APPROVED:
        this.sendToClient(requestId, "Votre demande a été approuvée par l'admin ! Le prestataire va maintenant proposer une date.");
        break;
      
      case RequestStatus.SCHEDULED:
        this.sendToClient(requestId, "Le prestataire a proposé une date pour votre intervention. Merci de confirmer.");
        break;

      case RequestStatus.CONFIRMED:
        this.sendToProvider(requestId, "Le client a confirmé le rendez-vous. Le montant est maintenant sécurisé sous séquestre.");
        break;

      case RequestStatus.EXPIRED:
        this.sendToBoth(requestId, "La demande a expiré car elle n'a pas été traitée dans les temps.");
        break;
    }
  }

  private sendToClient(id: string, msg: string) {
    this.logger.debug(`[To Client] Request ${id}: ${msg}`);
  }

  private sendToProvider(id: string, msg: string) {
    this.logger.debug(`[To Provider] Request ${id}: ${msg}`);
  }

  private sendToBoth(id: string, msg: string) {
    this.sendToClient(id, msg);
    this.sendToProvider(id, msg);
  }
}
