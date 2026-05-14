import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RequestsTasksService {
  private readonly logger = new Logger(RequestsTasksService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * CRON JOB : S'exécute toutes les heures.
   * Passe les demandes PENDING de plus de 48h en REJECTED (auto-expiration).
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredRequests() {
    this.logger.debug('Vérification des demandes expirées...');

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);

    // Trouver les demandes PENDING créées il y a plus de 48h
    const expiredRequests = await this.prisma.request.findMany({
      where: {
        status: RequestStatus.PENDING,
        createdAt: { lt: cutoff },
      },
    });

    if (expiredRequests.length === 0) return;

    this.logger.log(`${expiredRequests.length} demande(s) expirée(s) trouvée(s).`);

    for (const req of expiredRequests) {
      await this.prisma.request.update({
        where: { id: req.id },
        data: { status: RequestStatus.REJECTED },
      });

      // Notifier le système
      this.eventEmitter.emit('request.auto_rejected', {
        requestId: req.id,
        clientId: req.clientId,
        reason: 'AUTO_EXPIRE_48H',
      });
    }
  }
}
