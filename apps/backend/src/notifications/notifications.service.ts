import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notification-type.enum';

interface CreateNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  requestId?: string;
  serviceId?: string;
  providerAppId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Création avec support des relations vers ressources
  async createNotification(data: CreateNotificationPayload) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        requestId: data.requestId,
        serviceId: data.serviceId,
        providerAppId: data.providerAppId,
      },
    });
    this.logger.log(`Notification créée pour l'utilisateur ${data.userId}: ${data.title} (${data.type})`);
    return notification;
  }

  // Création massive avec support des relations — retourne les objets créés (avec IDs)
  async createManyNotifications(data: CreateNotificationPayload[]) {
    const notifications = await Promise.all(
      data.map(d =>
        this.prisma.notification.create({
          data: {
            userId: d.userId,
            title: d.title,
            message: d.message,
            type: d.type,
            requestId: d.requestId,
            serviceId: d.serviceId,
            providerAppId: d.providerAppId,
          },
        }),
      ),
    );
    this.logger.log(`${notifications.length} notifications créées en masse.`);
    return notifications;
  }

  // Lister les notifications d'un utilisateur avec relations et pagination
  async findAllForUser(userId: string, options?: { page: number; limit: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        include: {
          request: true,
          service: true,
          providerApp: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Compteur de notifications non lues
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification non autorisée');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // Tout marquer comme lu
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification non autorisée');
    }

    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification supprimée' };
  }
}
