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
import { RequestStatus, Role } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { withServiceImageUrl } from '../common/utils/media-url.util';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private withImageUrl<T extends { imageKey?: string | null }>(
    service: T | null | undefined,
  ) {
    if (!service) return service;
    return withServiceImageUrl(service);
  }

  private withServiceImageUrl<T extends { service?: any }>(request: T) {
    return {
      ...request,
      service: this.withImageUrl(request.service),
    };
  }

  async create(clientId: string, createRequestDto: any) {
    const { serviceId, phoneNumber, operator, ...requestData } =
      createRequestDto;

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      this.logger.error(
        `TENTATIVE COMMANDE : Service ${serviceId} introuvable.`,
      );
      throw new BadRequestException('Le service spécifié est introuvable.');
    }

    if (!service.price) {
      throw new BadRequestException("Le prix du service n'est pas défini.");
    }

    const isPremiumSubscription = Boolean(requestData.scheduleFrequency);

    const request = await this.prisma.request.create({
      data: {
        ...requestData,
        serviceId,
        clientId,
        price: service.price,
        currency: service.currency || 'USD',
        status: isPremiumSubscription
          ? RequestStatus.PENDING
          : RequestStatus.APPROVED,
      },
      include: { service: true, client: true },
    });

    this.logger.log(
      `Demande créée [${request.id}] pour le service "${service.name}" — en attente de paiement acompte.`,
    );

    this.eventEmitter.emit('request.created', {
      requestId: request.id,
      clientId,
    });

    return this.withServiceImageUrl(request);
  }

  async findMyRequests(clientId: string) {
    const requests = await this.prisma.request.findMany({
      where: { clientId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((request) => this.withServiceImageUrl(request));
  }

  async findOneForClient(id: string, clientId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!request) throw new NotFoundException('Demande introuvable.');
    if (request.clientId !== clientId) {
      throw new ForbiddenException("Vous n'avez pas accès à cette demande.");
    }

    return this.withServiceImageUrl(request);
  }

  async updateForClient(
    id: string,
    clientId: string,
    updateRequestDto: UpdateRequestDto,
  ) {
    const request = await this.findOneForClient(id, clientId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Seules les demandes en attente peuvent être modifiées.',
      );
    }

    const updatedRequest = await this.prisma.request.update({
      where: { id },
      data: updateRequestDto,
      include: { service: true },
    });

    return this.withServiceImageUrl(updatedRequest);
  }

  async removeForClient(id: string, clientId: string) {
    const request = await this.findOneForClient(id, clientId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Seules les demandes en attente peuvent être annulées.',
      );
    }

    const result = await this.prisma.request.delete({ where: { id } });

    this.logger.log(`Demande ${id} ANNULÉE par le client ${clientId}`);
    this.eventEmitter.emit('request.cancelled', { requestId: id, clientId });

    return result;
  }

  async findAll() {
    const requests = await this.prisma.request.findMany({
      include: {
        service: true,
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        payments: { where: { status: 'SUCCESS' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((request) => this.withServiceImageUrl(request));
  }

  async findOne(id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        service: true,
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        payments: { where: { status: 'SUCCESS' }, take: 1 },
      },
    });

    if (!request) throw new NotFoundException('Demande introuvable.');
    return this.withServiceImageUrl(request);
  }

  async approve(id: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Seules les demandes en attente peuvent être approuvées.',
      );
    }

    const service = await this.prisma.service.findUnique({
      where: { id: request.serviceId },
    });
    const price = service?.price ?? 0;

    const updatedRequest = await this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.APPROVED, price },
    });

    this.logger.log(
      `Demande ${id} APPROUVÉE par l'admin (Prix fixé: ${price})`,
    );
    this.eventEmitter.emit('request.approved', {
      requestId: updatedRequest.id,
      serviceId: updatedRequest.serviceId,
    });

    return updatedRequest;
  }

  async reject(id: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Seules les demandes en attente peuvent être rejetées.',
      );
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
            RequestStatus.AWAITING_FINAL,
          ],
        },
      },
      select: { scheduledAt: true, scheduleTime: true },
    });

    const occupiedSlots: string[] = [];
    activeRequests.forEach((req) => {
      if (req.scheduledAt && req.scheduleTime) {
        const dateStr = req.scheduledAt.toISOString().split('T')[0];
        occupiedSlots.push(`${dateStr}-${req.scheduleTime}`);
      }
    });
    return occupiedSlots;
  }

  async getPooledAvailability(serviceId: string) {
    let service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        providers: {
          select: {
            id: true,
            fullName: true,
            isActive: true,
            role: true,
            metier: true,
          },
        },
      },
    });

    if (!service || !service.isActive) {
      throw new NotFoundException('Service introuvable ou inactif.');
    }

    let activeProviders = service.providers.filter((p) => p.isActive);

    if (activeProviders.length === 0) {
      this.logger.log(
        `Aucun prestataire lié à "${service.name}". Recherche par métier "${service.category}" ou "${service.name}"...`,
      );

      const fallbackProviders = await this.prisma.user.findMany({
        where: {
          role: Role.PROVIDER,
          isActive: true,
          OR: [
            {
              metier: {
                contains: service.name.substring(0, 4),
                mode: 'insensitive',
              },
            },
            {
              metier: {
                contains: service.category.substring(0, 4),
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          fullName: true,
          isActive: true,
          role: true,
          metier: true,
        },
      });

      if (fallbackProviders.length > 0) {
        this.logger.log(
          `${fallbackProviders.length} prestataire(s) trouvé(s) par métier.`,
        );
        activeProviders = fallbackProviders;
      }
    }

    this.logger.log(
      `Service "${service.name}" : ${activeProviders.length} prestataire(s) actif(s) détecté(s).`,
    );

    if (activeProviders.length === 0) {
      this.logger.warn(
        `Aucun prestataire actif trouvé (ni lié, ni par métier) pour "${service.name}".`,
      );
    }

    const totalProviders = activeProviders.length;

    const parseHour = (timeStr: string): number => {
      const [h] = timeStr.split(':').map(Number);
      return h;
    };

    const startHour = parseHour(service.workingHoursStart || '08:00');
    const endHour = parseHour(service.workingHoursEnd || '18:00');

    const timeSlots: string[] = [];
    for (let h = startHour; h < endHour; h += 2) {
      timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + 30);

    const activeRequests = await this.prisma.request.findMany({
      where: {
        serviceId,
        status: {
          in: [
            RequestStatus.APPROVED,
            RequestStatus.ACCEPTED,
            RequestStatus.IN_PROGRESS,
            RequestStatus.AWAITING_FINAL,
          ],
        },
        scheduledAt: { gte: today, lte: windowEnd },
      },
      select: {
        providerId: true,
        scheduledAt: true,
        scheduleTime: true,
      },
    });

    const occupiedKeys = new Set<string>();
    activeRequests.forEach((req) => {
      if (req.providerId && req.scheduledAt && req.scheduleTime) {
        const dateStr = req.scheduledAt.toISOString().split('T')[0];
        occupiedKeys.add(`${dateStr}|${req.scheduleTime}|${req.providerId}`);
      }
    });

    const DAY_NAMES = [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ];

    const weeks: any[] = [];
    let currentDay = new Date(today);
    let weekNumber = 1;

    const minBookingTime = new Date();
    minBookingTime.setHours(minBookingTime.getHours() + 2);

    while (currentDay <= windowEnd) {
      const weekDays: any[] = [];

      for (let d = 0; d < 7 && currentDay <= windowEnd; d++) {
        const dateStr = currentDay.toISOString().split('T')[0];
        const dayIndex = currentDay.getDay();
        const isSunday = dayIndex === 0;

        const slots = timeSlots.map((time) => {
          const slotDateTime = new Date(`${dateStr}T${time}:00`);
          if (slotDateTime <= minBookingTime) {
            return {
              time,
              availableProviders: 0,
              available: false,
              reason: 'past',
            };
          }
          if (isSunday) {
            return {
              time,
              availableProviders: 0,
              available: false,
              reason: 'sunday_off',
            };
          }
          const busyProviders = activeProviders.filter((p) =>
            occupiedKeys.has(`${dateStr}|${time}|${p.id}`),
          ).length;

          const availableProviders = totalProviders - busyProviders;

          return {
            time,
            availableProviders,
            available: availableProviders > 0,
          };
        });

        weekDays.push({
          date: dateStr,
          dayName: DAY_NAMES[dayIndex],
          isToday: dateStr === today.toISOString().split('T')[0],
          isSunday,
          isWeekend: dayIndex === 0 || dayIndex === 6,
          slots,
        });

        currentDay.setDate(currentDay.getDate() + 1);
      }

      const firstDay = weekDays[0];
      const lastDay = weekDays[weekDays.length - 1];
      const fmt = (d: string) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        });
      };

      weeks.push({
        weekNumber,
        label: `${fmt(firstDay.date)} — ${fmt(lastDay.date)}`,
        days: weekDays,
      });

      weekNumber++;
    }

    return {
      serviceId,
      serviceName: service.name,
      totalProviders,
      window: {
        from: today.toISOString().split('T')[0],
        to: windowEnd.toISOString().split('T')[0],
      },
      timeSlots,
      weeks,
    };
  }
}
