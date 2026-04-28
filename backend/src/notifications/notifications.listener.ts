import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notification-type.enum';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  // Helpers pour récupérer rapidement les Admins
  private async getAdmins() {
    return this.prisma.user.findMany({ where: { role: 'ADMIN' } });
  }

  // Helper : crée une notification en DB puis push en temps réel
  private async createAndPush(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    requestId?: string;
    serviceId?: string;
    providerAppId?: string;
  }) {
    const notification = await this.notificationsService.createNotification(data);
    this.notificationsGateway.sendToUser(data.userId, notification);
    return notification;
  }

  // Helper : crée N notifications en DB puis push en temps réel à chaque user
  private async createManyAndPush(data: Array<{
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    requestId?: string;
    serviceId?: string;
    providerAppId?: string;
  }>) {
    const notifications = await this.notificationsService.createManyNotifications(data);

    // Push temps réel vers chaque destinataire (avec l'objet DB complet, incluant l'ID)
    for (const notification of notifications) {
      this.notificationsGateway.sendToUser(notification.userId, notification);
    }
    return notifications.length;
  }

  // ─── AUTHENTIFICATION ───────────────────────────────────────────────────
  @OnEvent('auth.registered')
  async handleAuthRegistered(payload: { userId: string }) {
    try {
      await this.createAndPush({
        userId: payload.userId,
        title: 'Bienvenue chez Kaskade !',
        message: 'Nous sommes ravis de vous compter parmi nous. Découvrez nos services dès maintenant.',
        type: NotificationType.AUTH_WELCOME,
      });
      this.logger.log(`Notification envoyée (Bienvenue) au user ${payload.userId}`);
    } catch (error) {
      this.logger.error(`Erreur notification auth.registered: ${error.message}`, error.stack);
    }
  }

  // ─── DEVENIR PRESTATAIRE ────────────────────────────────────────────────
  @OnEvent('provider.applied')
  async handleProviderApplied(payload: { userId: string; applicationId: string }) {
    try {
      // 1. Notifier le client
      await this.createAndPush({
        userId: payload.userId,
        title: 'Candidature reçue',
        message: 'Nous avons bien reçu votre demande. L\'équipe Kaskade vous contactera prochainement.',
        type: NotificationType.PROVIDER_APPLY_RECEIVED,
        providerAppId: payload.applicationId,
      });

      // 2. Notifier tous les Admins
      const admins = await this.getAdmins();
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: 'Nouvelle demande prestataire',
        message: `Un utilisateur (ID: ${payload.userId}) vient de soumettre une demande pour devenir prestataire.`,
        type: NotificationType.PROVIDER_APPLY_SUBMITTED,
        providerAppId: payload.applicationId,
      }));
      await this.createManyAndPush(notifications);
    } catch (error) {
      this.logger.error(`Erreur notification provider.applied: ${error.message}`, error.stack);
    }
  }

  @OnEvent('provider.application.resolved')
  async handleProviderApplicationResolved(payload: { userId: string; status: 'APPROVED' | 'REJECTED'; applicationId: string }) {
    try {
      const isApproved = payload.status === 'APPROVED';
      await this.createAndPush({
        userId: payload.userId,
        title: isApproved ? 'Candidature Acceptée !' : 'Candidature Refusée',
        message: isApproved 
          ? 'Félicitations, vous êtes maintenant Prestataire chez Kaskade.' 
          : 'Malheureusement, votre demande pour devenir prestataire n\'a pas été retenue pour le moment.',
        type: NotificationType.PROVIDER_APPLY_RESOLVED,
        providerAppId: payload.applicationId,
      });
    } catch (error) {
      this.logger.error(`Erreur notification provider.application.resolved: ${error.message}`, error.stack);
    }
  }

  // ─── GESTION DES SERVICES ───────────────────────────────────────────────
  @OnEvent('service.created')
  async handleServiceCreated(payload: { serviceId: string; serviceName: string }) {
    try {
      const users = await this.prisma.user.findMany({ 
        where: { 
          role: { in: ['PROVIDER', 'CLIENT'] }
        } 
      });
      const notifications = users.map((user) => ({
        userId: user.id,
        title: 'Nouveau service disponible !',
        message: `Découvrez notre nouveau service dans le catalogue : ${payload.serviceName}.`,
        type: NotificationType.SERVICE_CREATED,
        serviceId: payload.serviceId,
      }));
      
      if (notifications.length > 0) {
        await this.createManyAndPush(notifications);
      }
    } catch (error) {
      this.logger.error(`Erreur notification service.created: ${error.message}`, error.stack);
    }
  }

  @OnEvent('service.updated')
  async handleServiceUpdated(payload: { serviceId: string; serviceName: string }) {
    try {
      const users = await this.prisma.user.findMany({ 
        where: { role: 'PROVIDER' } 
      });
      
      const notifications = users.map((user) => ({
        userId: user.id,
        title: 'Mise à jour d\'un service',
        message: `Le service "${payload.serviceName}" a été mis à jour dans le catalogue.`,
        type: NotificationType.SERVICE_UPDATED,
        serviceId: payload.serviceId,
      }));

      if (notifications.length > 0) {
        await this.createManyAndPush(notifications);
      }
    } catch (error) {
      this.logger.error(`Erreur notification service.updated: ${error.message}`, error.stack);
    }
  }

  @OnEvent('service.deleted')
  async handleServiceDeleted(payload: { serviceId: string; serviceName: string }) {
    try {
      const users = await this.prisma.user.findMany({ 
        where: { role: 'PROVIDER' } 
      });
      
      const notifications = users.map((user) => ({
        userId: user.id,
        title: 'Service supprimé',
        message: `Le service "${payload.serviceName}" a été retiré du catalogue.`,
        type: NotificationType.SERVICE_DELETED,
      }));

      if (notifications.length > 0) {
        await this.createManyAndPush(notifications);
      }
    } catch (error) {
      this.logger.error(`Erreur notification service.deleted: ${error.message}`, error.stack);
    }
  }

  // ─── WORKFLOW DEMANDE DE SERVICE ────────────────────────────────────────
  
  // 1. Client crée -> L'admin est notifié
  @OnEvent('request.created')
  async handleRequestCreated(payload: { requestId: string; clientId: string }) {
    try {
      // A. Notifier le Client pour confirmer la réception du paiement
      await this.createAndPush({
        userId: payload.clientId,
        title: 'Paiement reçu',
        message: 'Votre acompte a été validé. Un administrateur examine votre demande pour l\'assigner à un expert.',
        type: NotificationType.REQUEST_CREATED,
        requestId: payload.requestId,
      });

      //  Notifier les Admins (en précisant que c'est déjà payé)
      const admins = await this.getAdmins();
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: 'NOUVELLE DEMANDE PAYÉE',
        message: `Une demande (ID: ${payload.requestId}) a été payée et attend votre approbation finale.`,
        type: NotificationType.REQUEST_CREATED,
        requestId: payload.requestId,
      }));
      await this.createManyAndPush(notifications);
      
      this.logger.log(`Notifications envoyées pour la nouvelle demande PAYÉE ${payload.requestId}`);
    } catch (error) {
      this.logger.error(`Erreur notification request.created: ${error.message}`, error.stack);
    }
  }

  //  Admin approuve -> Les prestataires concernés sont notifiés
  @OnEvent('request.approved')
  async handleRequestApproved(payload: { requestId: string; serviceId: string }) {
    try {
      const providers = await this.prisma.user.findMany({
        where: {
          role: 'PROVIDER',
          services: { some: { id: payload.serviceId } }
        }
      });

      const notifications = providers.map((provider) => ({
        userId: provider.id,
        title: 'Nouvelle mission disponible !',
        message: 'Une demande a été approuvée dans votre domaine d\'expertise. Acceptez-la vite !',
        type: NotificationType.REQUEST_APPROVED,
        requestId: payload.requestId,
      }));

      if (notifications.length > 0) {
        await this.createManyAndPush(notifications);
      }
    } catch (error) {
      this.logger.error(`Erreur notification request.approved: ${error.message}`, error.stack);
    }
  }

  // Admin rejette la demande -> Le client est notifié
  @OnEvent('request.admin_rejected')
  async handleRequestAdminRejected(payload: { requestId: string; clientId: string }) {
    try {
      await this.createAndPush({
        userId: payload.clientId,
        title: 'Demande refusée',
        message: 'Votre demande de service a été examinée et n\'a pas été retenue par notre équipe.',
        type: NotificationType.REQUEST_ADMIN_REJECTED,
        requestId: payload.requestId,
      });
    } catch (error) {
      this.logger.error(`Erreur notification request.admin_rejected: ${error.message}`, error.stack);
    }
  }

  // Client annule sa demande PENDING -> L'admin est notifié
  @OnEvent('request.cancelled')
  async handleRequestCancelled(payload: { requestId: string; clientId: string }) {
    try {
      const admins = await this.getAdmins();
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: 'Demande annulée',
        message: `Le client (ID: ${payload.clientId}) a annulé sa demande (ID: ${payload.requestId}).`,
        type: NotificationType.REQUEST_CANCELLED,
        requestId: payload.requestId,
      }));
      await this.createManyAndPush(notifications);
    } catch (error) {
      this.logger.error(`Erreur notification request.cancelled: ${error.message}`, error.stack);
    }
  }

  // 3. Prestataire accepte -> L'Admin et le Client sont notifiés
  @OnEvent('request.accepted')
  async handleRequestAccepted(payload: { requestId: string; clientId: string; providerId: string }) {
    try {
      // Notifier le client
      await this.createAndPush({
        userId: payload.clientId,
        title: 'Mission acceptée !',
        message: 'Un prestataire a accepté votre demande et est en route !',
        type: NotificationType.REQUEST_ACCEPTED,
        requestId: payload.requestId,
      });

      // Notifier les Admins
      const admins = await this.getAdmins();
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: 'Mission en cours',
        message: `Le prestataire (ID: ${payload.providerId}) a pris en charge la demande (ID: ${payload.requestId}).`,
        type: NotificationType.REQUEST_ACCEPTED,
        requestId: payload.requestId,
      }));
      await this.createManyAndPush(notifications);
    } catch (error) {
      this.logger.error(`Erreur notification request.accepted: ${error.message}`, error.stack);
    }
  }

  // Prestataire refuse -> l'Admin est notifié pour un suivi éventuel
  @OnEvent('request.rejected')
  async handleRequestRejected(payload: { requestId: string; providerId: string }) {
    try {
      const admins = await this.getAdmins();
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: 'Mission ignorée',
        message: `Le prestataire (ID: ${payload.providerId}) a refusé/ignoré la demande (ID: ${payload.requestId}).`,
        type: NotificationType.REQUEST_REJECTED,
        requestId: payload.requestId,
      }));
      await this.createManyAndPush(notifications);
    } catch (error) {
      this.logger.error(`Erreur notification request.rejected: ${error.message}`, error.stack);
    }
  }

  // ─── FIN DE MISSION ET PAIEMENT ─────────────────────────────────────────
  @OnEvent('payment.deposit_confirmed')
  async handlePaymentConfirmed(payload: { requestId: string }) {
    try {
      const request = await this.prisma.request.findUnique({
        where: { id: payload.requestId },
        include: { provider: true }
      });

      if (!request) return;

      // 1. Notifier le Prestataire qu'il peut commencer
      if (request.providerId) {
        await this.createAndPush({
          userId: request.providerId,
          title: 'Acompte reçu - Mission active',
          message: 'Le client a payé l\'acompte. Vous pouvez commencer la mission dès maintenant.',
          type: NotificationType.PAYMENT_DEPOSIT_CONFIRMED,
          requestId: payload.requestId,
        });
      }

      // 2. Notifier les Admins
      const admins = await this.getAdmins();
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: 'Acompte reçu',
        message: `Paiement de l'acompte (50%) confirmé pour la demande (ID: ${payload.requestId}).`,
        type: NotificationType.PAYMENT_DEPOSIT_CONFIRMED,
        requestId: payload.requestId,
      }));
      await this.createManyAndPush(notifications);
    } catch (error) {
      this.logger.error(`Erreur notification payment.deposit_confirmed: ${error.message}`, error.stack);
    }
  }

  @OnEvent('request.completed')
  async handleRequestCompleted(payload: { requestId: string; providerId: string }) {
    try {
      const request = await this.prisma.request.findUnique({
        where: { id: payload.requestId },
      });

      if (!request) return;

      // 1. Notifier le Client qu'il doit payer le solde 50%
      await this.createAndPush({
        userId: request.clientId,
        title: 'Mission terminée - En attente du solde',
        message: 'Le prestataire a terminé sa mission. Merci de procéder au paiement final de 50%.',
        type: NotificationType.REQUEST_AWAITING_FINAL,
        requestId: payload.requestId,
      });

      // 2. Notifier les Admins
      const admins = await this.getAdmins();
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: 'Mission terminée',
        message: `Le prestataire (ID: ${payload.providerId}) a déclaré la demande terminée (ID: ${payload.requestId}).`,
        type: NotificationType.REQUEST_COMPLETED,
        requestId: payload.requestId,
      }));
      await this.createManyAndPush(notifications);
    } catch (error) {
      this.logger.error(`Erreur notification request.completed: ${error.message}`, error.stack);
    }
  }

  @OnEvent('payment.final_confirmed')
  async handleFinalPaymentConfirmed(payload: { requestId: string }) {
    try {
      const request = await this.prisma.request.findUnique({
        where: { id: payload.requestId },
      });

      if (!request) return;

      // 1. Notifier le Client
      await this.createAndPush({
        userId: request.clientId,
        title: 'Paiement final confirmé',
        message: 'Merci pour votre confiance. La mission est officiellement clôturée.',
        type: NotificationType.PAYMENT_FINAL_CONFIRMED,
        requestId: payload.requestId,
      });

      // 2. Notifier le Prestataire
      if (request.providerId) {
        await this.createAndPush({
          userId: request.providerId,
          title: 'Solde reçu - Mission clôturée',
          message: 'Le client a réglé le solde final pour votre mission.',
          type: NotificationType.PAYMENT_FINAL_CONFIRMED,
          requestId: payload.requestId,
        });
      }

      // 3. Notifier les Admins
      const admins = await this.getAdmins();
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: 'Mission Clôturée (Payée)',
        message: `Le paiement final a été reçu pour la demande (ID: ${payload.requestId}).`,
        type: NotificationType.PAYMENT_FINAL_CONFIRMED,
        requestId: payload.requestId,
      }));
      await this.createManyAndPush(notifications);
    } catch (error) {
      this.logger.error(`Erreur notification payment.final_confirmed: ${error.message}`, error.stack);
    }
  }
}
