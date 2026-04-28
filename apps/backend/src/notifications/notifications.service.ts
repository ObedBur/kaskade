import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RequestStatusChangedEvent } from '../requests/events/request-status.event';
import { RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('request.status.changed')
  async handleRequestStatusChanged(event: RequestStatusChangedEvent) {
    const { requestId, oldStatus, newStatus } = event;

    this.logger.log(` NOTIFICATION : Demande #${requestId} est passée de ${oldStatus} à ${newStatus}`);

    // Récupérer les détails de la requête pour avoir les IDs utilisateur
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { service: true },
    });

    if (!request) return;

    const title = 'Mise à jour de votre demande';
    let message = '';
    let type = 'INFO';

    switch (newStatus) {
      case RequestStatus.PENDING:
        message = `Votre demande pour "${request.service.title}" a été bien reçue. Elle est en cours de validation par un admin.`;
        await this.createNotification(request.clientId, title, message, 'INFO', `/mes-demandes/${requestId}`);
        break;

      case RequestStatus.APPROVED:
        message = `Votre demande pour "${request.service.title}" a été approuvée par l'admin. Le prestataire va vous contacter.`;
        await this.createNotification(request.clientId, title, message, 'SUCCESS', `/mes-demandes/${requestId}`);
        break;
      
      case RequestStatus.SCHEDULED:
        message = `Un rendez-vous a été proposé pour votre intervention. Merci de le confirmer.`;
        await this.createNotification(request.clientId, "Rendez-vous proposé", message, 'WARNING', `/mes-demandes/${requestId}`);
        break;

      case RequestStatus.CONFIRMED:
        message = `Rendez-vous confirmé ! Le paiement est sécurisé sous séquestre.`;
        await this.createNotification(request.clientId, "Paiement sécurisé", message, 'SUCCESS', `/mes-demandes/${requestId}`);
        if (request.providerId) {
          await this.createNotification(request.providerId, "Nouvelle intervention confirmée", "Un nouveau rendez-vous a été confirmé par le client.", 'SUCCESS', `/demandes/${requestId}`);
        }
        break;

      case RequestStatus.COMPLETED:
        message = `La prestation est marquée comme terminée. Merci pour votre confiance !`;
        await this.createNotification(request.clientId, "Prestation terminée", message, 'SUCCESS', `/mes-demandes/${requestId}`);
        break;

      case RequestStatus.REJECTED:
        message = `Votre demande a été refusée ou annulée.`;
        await this.createNotification(request.clientId, "Demande refusée", message, 'ERROR');
        break;
    }
  }

  private async createNotification(userId: string, title: string, message: string, type: string = 'INFO', link?: string) {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
        },
      });
      this.logger.debug(`[Notification saved] User: ${userId} | ${title}`);
    } catch (err) {
      this.logger.error("Erreur lors de la sauvegarde de la notification", err);
    }
  }
}
