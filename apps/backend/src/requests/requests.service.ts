import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus, Role } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatusChangedEvent } from './events/request-status.event';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * MACHINE D'ÉTAT : Gère le passage d'un statut à un autre
   * avec vérification de rôle et de validité de transition.
   */
  async updateStatus(requestId: string, nextStatus: RequestStatus, userId: string, userRole: Role) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { service: true }
    });

    if (!request) {
      throw new NotFoundException(`Demande #${requestId} introuvable.`);
    }

    const currentStatus = request.status;

    // ─────────────────────────────────────────────
    // RÈGLES DE TRANSITION (State Machine)
    // ─────────────────────────────────────────────

    switch (nextStatus) {
      // 1. PENDING -> APPROVED ou REJECTED (Uniquement par l'ADMIN)
      case RequestStatus.APPROVED:
      case RequestStatus.REJECTED:
        if (userRole !== Role.ADMIN) {
          throw new ForbiddenException("Seul un administrateur peut valider ou rejeter une demande initiale.");
        }
        if (currentStatus !== RequestStatus.PENDING) {
          throw new BadRequestException(`Impossible de passer à ${nextStatus} depuis le statut ${currentStatus}.`);
        }
        break;

      // 2. APPROVED -> SCHEDULED (Uniquement par le PRESTATAIRE)
      case RequestStatus.SCHEDULED:
        if (userRole !== Role.PROVIDER) {
          throw new ForbiddenException("Seul le prestataire peut planifier une intervention.");
        }
        if (currentStatus !== RequestStatus.APPROVED) {
          throw new BadRequestException("Une demande doit être approuvée par l'admin avant d'être planifiée.");
        }
        break;

      // 3. SCHEDULED -> CONFIRMED (Uniquement par le CLIENT)
      case RequestStatus.CONFIRMED:
        if (userRole !== Role.CLIENT) {
          throw new ForbiddenException("Seul le client peut confirmer le rendez-vous pour verrouiller le séquestre.");
        }
        if (currentStatus !== RequestStatus.SCHEDULED) {
          throw new BadRequestException("Le prestataire doit d'abord proposer une date (SCHEDULED).");
        }
        break;

      // 4. CONFIRMED -> COMPLETED (Uniquement par le CLIENT)
      case RequestStatus.COMPLETED:
        if (userRole !== Role.CLIENT) {
          throw new ForbiddenException("Le client est le seul habilité à valider la fin de prestation pour libérer les fonds.");
        }
        if (currentStatus !== RequestStatus.CONFIRMED) {
          throw new BadRequestException("La prestation doit être confirmée avant d'être marquée comme terminée.");
        }
        break;

      default:
        throw new BadRequestException(`Transition vers ${nextStatus} non gérée ou interdite.`);
    }

    // Mise à jour effective
    const updatedRequest = await this.prisma.request.update({
      where: { id: requestId },
      data: { 
        status: nextStatus,
        adminId: nextStatus === RequestStatus.APPROVED || nextStatus === RequestStatus.REJECTED ? userId : undefined,
      }
    });

    // Émettre l'événement de changement de statut (Design Pattern Observer)
    this.eventEmitter.emit(
      'request.status.changed',
      new RequestStatusChangedEvent(requestId, currentStatus, nextStatus, userId)
    );

    return updatedRequest;
  }
}
