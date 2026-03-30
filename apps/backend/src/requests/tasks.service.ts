import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatusChangedEvent } from './events/request-status.event';

@Injectable()
export class RequestsTasksService {
  private readonly logger = new Logger(RequestsTasksService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * CRON JOB : S'exécute toutes les 5 minutes
   * Passe les requêtes PENDING expirées en EXPIRED.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredRequests() {
    this.logger.debug('Vérification des requêtes expirées...');

    const now = new Date();

    // Trouver les requêtes PENDING dont expiresAt < now
    const expiredRequests = await this.prisma.request.findMany({
      where: {
        status: RequestStatus.PENDING,
        expiresAt: {
          lt: now
        }
      }
    });

    if (expiredRequests.length === 0) return;

    this.logger.log(`${expiredRequests.length} requête(s) expirée(s) trouvée(s).`);

    for (const req of expiredRequests) {
      await this.prisma.request.update({
        where: { id: req.id },
        data: { status: RequestStatus.EXPIRED }
      });

      // Émettre l'événement pour notifier le système
      this.eventEmitter.emit(
        'request.status.changed',
        new RequestStatusChangedEvent(req.id, RequestStatus.PENDING, RequestStatus.EXPIRED, 'SYSTEM')
      );
    }
  }
}
