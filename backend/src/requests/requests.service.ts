import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── CLIENT ───────────────────────────────────────────────────────────────

  async create(clientId: string, createRequestDto: any) {
    const { serviceId, phoneNumber, operator, ...requestData } = createRequestDto;

    // 1. Vérifier que le service existe (Source de vérité)
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      this.logger.error(`TENTATIVE COMMANDE : Service ${serviceId} introuvable.`);
      throw new BadRequestException('Le service spécifié est introuvable.');
    }

    // 2. Calcul STRICT et Côté Serveur de l'acompte (50%)
    // Le frontend n'a plus le droit de dire "j'ai payé X", c'est le serveur qui dicte.
    if (!service.price) {
      throw new BadRequestException('Le prix du service n\'est pas défini.');
    }
    const requiredDeposit = service.price * 0.5;

    // 3. MOCK SÉCURISÉ : Simulation de l'appel API Mobile Money (Airtel, Orange)
    // Dans la vraie vie, ici on ferait un appel axios vers FlexPay/Maxicash
    // et on s'arrêterait là en attendant le Webhook.
    this.logger.log(`[PAIEMENT INITIÉ] Demande de ${requiredDeposit}$ via ${operator || 'MOBILE MONEY'} pour le numéro ${phoneNumber}`);
    
    // -> Attente simulée du Webhook de confirmation (2 secondes)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // -> Arrivée du Webhook (Simulation) : L'opérateur confirme que le solde était suffisant
    this.logger.log(`[WEBHOOK REÇU] Paiement de ${requiredDeposit}$ confirmé par l'opérateur.`);

    // 4. Création de la demande uniquement APRÈS confirmation du paiement serveur
    const request = await this.prisma.request.create({
      data: { 
        ...requestData,
        serviceId,
        clientId, 
        price: service.price, // Prix total figé
        status: RequestStatus.PENDING 
      },
      include: { service: true, client: true },
    });

    this.logger.log(
      `COMMANDE VALIDÉE : Demande ID ${request.id} créée suite au paiement de ${requiredDeposit}$.`
    );
    
    // 5. Déclenchement des notifications temps réel
    this.eventEmitter.emit('request.created', { requestId: request.id, clientId });

    return request;
  }

  // Un client ne voit que ses propres demandes
  async findMyRequests(clientId: string) {
    return this.prisma.request.findMany({
      where: { clientId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Un client voit une demande uniquement si elle lui appartient
  async findOneForClient(id: string, clientId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!request) throw new NotFoundException('Demande introuvable.');
    if (request.clientId !== clientId) {
      throw new ForbiddenException("Vous n'avez pas accès à cette demande.");
    }

    return request;
  }

  // Un client peut modifier sa demande seulement si elle est PENDING
  async updateForClient(id: string, clientId: string, updateRequestDto: UpdateRequestDto) {
    const request = await this.findOneForClient(id, clientId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Seules les demandes en attente peuvent être modifiées.');
    }

    return this.prisma.request.update({
      where: { id },
      data: updateRequestDto,
      include: { service: true },
    });
  }

  // Un client peut annuler sa demande seulement si elle est PENDING
  async removeForClient(id: string, clientId: string) {
    const request = await this.findOneForClient(id, clientId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Seules les demandes en attente peuvent être annulées.');
    }

    const result = await this.prisma.request.delete({ where: { id } });

    this.logger.log(`Demande ${id} ANNULÉE par le client ${clientId}`);
    this.eventEmitter.emit('request.cancelled', { requestId: id, clientId });

    return result;
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  // L'admin voit toutes les demandes avec infos client et service
  async findAll() {
    return this.prisma.request.findMany({
      include: {
        service: true,
        client: {
          select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true },
        },
        payments: { where: { status: 'SUCCESS' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        service: true,
        client: {
          select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true },
        },
        payments: { where: { status: 'SUCCESS' }, take: 1 },
      },
    });

    if (!request) throw new NotFoundException('Demande introuvable.');
    return request;
  }

  async approve(id: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Seules les demandes en attente peuvent être approuvées.');
    }

    // Le prix est hérité du Service catalogue (fixé à la création du service)
    const service = await this.prisma.service.findUnique({ where: { id: request.serviceId } });
    const price = service?.price ?? 0;

    const updatedRequest = await this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.APPROVED, price },
    });

    this.logger.log(`Demande ${id} APPROUVÉE par l'admin (Prix fixé: ${price})`);
    this.eventEmitter.emit('request.approved', { requestId: updatedRequest.id, serviceId: updatedRequest.serviceId });

    return updatedRequest;
  }

  async reject(id: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Seules les demandes en attente peuvent être rejetées.');
    }

    const updatedRequest = await this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.REJECTED },
    });

    this.logger.log(`Demande ${id} REJETÉE par l'admin`);
    this.eventEmitter.emit('request.admin_rejected', {
      requestId: id,
      clientId: request.clientId,
    });

    return updatedRequest;
  }

  /**
   * Récupère les créneaux occupés pour un service donné
   */
  async getAvailability(serviceId: string) {
    const activeRequests = await this.prisma.request.findMany({
      where: {
        serviceId,
        status: {
          in: [
            RequestStatus.PENDING,
            RequestStatus.APPROVED,
            RequestStatus.ACCEPTED,
            RequestStatus.IN_PROGRESS,
            RequestStatus.AWAITING_FINAL
          ]
        }
      },
      select: {
        scheduledAt: true,
        scheduleTime: true
      }
    });

    // Formater les données pour le frontend : "YYYY-MM-DD-HH:mm"
    const occupiedSlots: string[] = [];

    activeRequests.forEach(req => {
      if (req.scheduledAt && req.scheduleTime) {
        const dateStr = req.scheduledAt.toISOString().split('T')[0];
        const timeStr = req.scheduleTime; // ex: "09:00"
        
        // Ajouter le créneau de départ
        occupiedSlots.push(`${dateStr}-${timeStr}`);
        
        // Si la durée est > 1, on bloque aussi les heures suivantes (optionnel mais recommandé)
        // Pour simplifier ici, on renvoie juste le point de départ
      }
    });

    return occupiedSlots;
  }

}

