import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyProviderDto } from './dto/apply-provider.dto';
import { AssignServicesDto } from './dto/assign-services.dto';
import { RequestStatus, Role, Status } from '@prisma/client';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async apply(userId: string, applyProviderDto: ApplyProviderDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role === Role.PROVIDER) {
      throw new BadRequestException('Vous êtes déjà un prestataire.');
    }
    const existingApp = await this.prisma.providerApplication.findFirst({
      where: {
        userId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingApp) {
      throw new BadRequestException('Vous avez déjà une candidature en attente.');
    }

    const [application] = await this.prisma.$transaction([
      this.prisma.providerApplication.create({
        data: {
          userId,
          motivation: applyProviderDto.motivation,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          metier: applyProviderDto.metier,
          experience: applyProviderDto.experience,
          bio: applyProviderDto.bio,
          avatarUrl: applyProviderDto.avatarUrl,
          ...(applyProviderDto.quartier && { quartier: applyProviderDto.quartier }),
        },
      }),
    ]);

    this.logger.log(`Nouvelle candidature prestataire: ${user.email} (ID: ${userId})`);
    this.eventEmitter.emit('provider.applied', { userId, applicationId: application.id });

    return application;
  }

  async approve(applicationId: string) {
    const application = await this.prisma.providerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Candidature introuvable');
    }
    if (application.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Cette candidature a déjà été traitée (${application.status})`);
    }

    const updatedApp = await this.prisma.providerApplication.update({
      where: { id: applicationId },
      data: { status: RequestStatus.APPROVED },
    });

    await this.prisma.user.update({
      where: { id: application.userId },
      data: { role: Role.PROVIDER },
    });

    // Notification temporaire via logs (le client l'a explicitement demandé)
    this.logger.log(`[NOTIFICATION] L'utilisateur ${application.user.email} (ID: ${application.userId}) a été approuvé en tant que PROVIDER.`);

    this.eventEmitter.emit('provider.application.resolved', { userId: application.userId, status: 'APPROVED', applicationId: updatedApp.id });

    return updatedApp;
  }

  async reject(applicationId: string) {
    const application = await this.prisma.providerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Candidature introuvable');
    }
    if (application.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Cette candidature a déjà été traitée (${application.status})`);
    }

    const updatedApp = await this.prisma.providerApplication.update({
      where: { id: applicationId },
      data: { status: RequestStatus.REJECTED },
    });

    // Notification temporaire via logs
    this.logger.log(`[NOTIFICATION] La candidature de ${application.user.email} a été REJETÉE.`);

    this.eventEmitter.emit('provider.application.resolved', { userId: application.userId, status: 'REJECTED', applicationId: updatedApp.id });

    return updatedApp;
  }

  async assignServices(providerId: string, assignServicesDto: AssignServicesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
    });

    if (!user || user.role !== Role.PROVIDER) {
      this.logger.warn(`Échec assignation services : Utilisateur ${providerId} n'est pas prestataire`);
      throw new BadRequestException('Cet utilisateur n\'existe pas ou n\'a pas le statut de PROVIDER.');
    }

    // Connecter les services (ajout sans supprimer les anciens)
    const updatedUser = await this.prisma.user.update({
      where: { id: providerId },
      data: {
        services: {
          connect: assignServicesDto.serviceIds.map(id => ({ id })),
        },
      },
      include: {
        services: true,
      },
    });

    this.logger.log(`Services assignés au prestataire ${updatedUser.email} (ID: ${providerId}): ${assignServicesDto.serviceIds.join(', ')}`);
    return updatedUser;
  }

  async findAllApplications() {
    return this.prisma.providerApplication.findMany({
      where: {
        user: { deletedAt: null },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            quartier: true,
            role: true,
            isVerified: true,
            createdAt: true,
            metier: true,
            experience: true,
            bio: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyApplication(userId: string) {
    return this.prisma.providerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeService(providerId: string, serviceId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
    });

    if (!user || user.role !== Role.PROVIDER) {
      throw new BadRequestException('Cet utilisateur n\'existe pas ou n\'a pas le statut de PROVIDER.');
    }

    return this.prisma.user.update({
      where: { id: providerId },
      data: {
        services: {
          disconnect: { id: serviceId },
        },
      },
      include: {
        services: true,
      },
    });
  }

  async findAvailableRequests(providerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
      include: { services: true },
    });

    if (!user || user.role !== Role.PROVIDER) {
      throw new BadRequestException('Accès refusé ou utilisateur non trouvé.');
    }

    const assignedServiceIds = user.services.map(s => s.id);
    this.logger.log(`🔍 [DEBUG] Provider: ${user.fullName} | Metier: ${user.metier} | assignedServices: ${assignedServiceIds.length}`);

    const missions = await this.prisma.request.findMany({
      where: {
        OR: [
          { serviceId: { in: assignedServiceIds } },
          {
            service: {
              OR: [
                { category: { contains: (user.metier || '').substring(0, 4), mode: 'insensitive' } },
                { name: { contains: (user.metier || '').substring(0, 4), mode: 'insensitive' } },
              ]
            }
          }
        ],
        status: RequestStatus.ACCEPTED,
      },
      include: {
        service: true,
        client: {
          select: { 
            id: true, 
            fullName: true, 
            quartier: true, 
            phone: true, 
            avatarUrl: true,
            bio: true,
            isVerified: true,
            createdAt: true
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`${missions.length} mission(s) disponible(s) trouvée(s) pour ce prestataire.`);
    return missions;
  }

  async acceptRequest(requestId: string, providerId: string) {
    const provider = await this.prisma.user.findUnique({
      where: { id: providerId },
      include: { services: true },
    });

    if (!provider || provider.role !== Role.PROVIDER) {
      throw new BadRequestException('Action non autorisée.');
    }

    if (provider.status === Status.EN_MISSION) {
      throw new BadRequestException('Vous êtes déjà assigné à une mission en cours.');
    }
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande introuvable.');
    }

    if (request.status !== RequestStatus.ACCEPTED) {
      throw new BadRequestException('Cette demande n\'est plus disponible.');
    }

    const directLink = provider.services.some(s => s.id === request.serviceId);

    let canHandleByMetier = false;
    if (!directLink) {
      const service = await this.prisma.service.findUnique({
        where: { id: request.serviceId },
        include: { _count: { select: { providers: true } } }
      });

      const metierMatches = provider.metier && (
        service?.name.toLowerCase().includes(provider.metier.toLowerCase()) ||
        service?.category.toLowerCase().includes(provider.metier.toLowerCase())
      );

      if (metierMatches && service?._count.providers === 0) {
        canHandleByMetier = true;
      }
    }

    if (!directLink && !canHandleByMetier) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à réaliser ce service.');
    }

    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.IN_PROGRESS,
          providerId: providerId,
          acceptedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: providerId },
        data: { status: Status.EN_MISSION },
      })
    ]);

    this.logger.log(`Mission ${requestId} acceptée par le prestataire ${provider.email} (ID: ${providerId})`);
    this.eventEmitter.emit('request.accepted', { requestId: updatedRequest.id, clientId: updatedRequest.clientId, providerId });

    return updatedRequest;
  }

  async rejectRequest(requestId: string, providerId: string) {
    const request = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Demande introuvable');

    this.eventEmitter.emit('request.rejected', { requestId, providerId });

    return { message: 'Demande ignorée avec succès' };
  }

  async completeRequest(requestId: string, providerId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande introuvable.');
    }

    if (request.providerId !== providerId) {
      throw new BadRequestException('Vous n\'êtes pas le prestataire assigné à cette mission.');
    }

    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'La mission ne peut pas être marquée comme terminée : l\'acompte doit d\'abord être payé.'
      );
    }

    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.request.update({
        where: { id: requestId },
        data: { status: RequestStatus.AWAITING_FINAL },
      }),
      this.prisma.user.update({
        where: { id: providerId },
        data: { status: Status.DISPONIBLE },
      })
    ]);

    this.logger.log(`Mission ${requestId} marquée comme TERMINÉE par le prestataire (ID: ${providerId})`);
    this.eventEmitter.emit('request.completed', { requestId: updatedRequest.id, providerId });

    return updatedRequest;
  }

  async getProfile(providerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
      include: { services: true },
    });

    if (!user || user.role !== Role.PROVIDER) {
      throw new NotFoundException('Profil prestataire introuvable.');
    }

    const { password, refreshToken, ...profile } = user;
    return profile;
  }
  async updateProfile(providerId: string, updateProfileDto: UpdateProviderProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
    });

    if (!user || user.role !== Role.PROVIDER) {
      throw new NotFoundException('Profil prestataire introuvable.');
    }

    this.logger.log(`DONNÉES REÇUES POUR UPDATE (ID: ${providerId}): ${JSON.stringify(updateProfileDto)}`);

    if (updateProfileDto.avatarUrl && user.avatarUrl && user.avatarUrl !== updateProfileDto.avatarUrl) {
      try {
        const oldPath = join(process.cwd(), user.avatarUrl.startsWith('/') ? user.avatarUrl.substring(1) : user.avatarUrl);
        if (existsSync(oldPath)) {
          unlinkSync(oldPath);
          this.logger.log(`Nettoyage : Ancien avatar supprimé (${oldPath})`);
        }
      } catch (err) {
        this.logger.error(`Erreur lors du nettoyage de l'ancien avatar : ${err.message}`);
      }
    }

    return this.prisma.user.update({
      where: { id: providerId },
      data: {
        fullName: updateProfileDto.fullName,
        metier: updateProfileDto.metier,
        experience: updateProfileDto.experience,
        bio: updateProfileDto.bio,
        quartier: updateProfileDto.quartier,
        avatarUrl: updateProfileDto.avatarUrl,
      },
    });
  }

  async getDashboardStats(providerId: string) {
    const [revenueData, pendingCount, completedCount, activeRequest] = await Promise.all([
      this.prisma.request.aggregate({
        where: {
          providerId,
          status: { in: [RequestStatus.COMPLETED, RequestStatus.AWAITING_FINAL] },
        },
        _sum: { price: true },
      }),
      this.prisma.request.count({
        where: {
          providerId,
          status: { in: [RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS] },
        },
      }),
      this.prisma.request.count({
        where: {
          providerId,
          status: RequestStatus.COMPLETED,
        },
      }),
      this.prisma.request.findFirst({
        where: {
          providerId,
          status: { in: [RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS] },
        },
        include: { service: true, client: { select: { fullName: true, quartier: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return {
      totalRevenue: revenueData._sum.price || 0,
      pendingMissions: pendingCount,
      completedMissions: completedCount,
      activeRequest: activeRequest,
    };
  }

  async getMyMissions(providerId: string) {
    return this.prisma.request.findMany({
      where: { providerId },
      include: {
        service: true,
        client: {
          select: { id: true, fullName: true, phone: true, email: true, quartier: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProviderCalendar(providerId: string) {
    const STATUS_COLORS: Record<string, string> = {
      ACCEPTED: '#BC9C6C',
      IN_PROGRESS: '#321B13',
      AWAITING_FINAL: '#6B5B45',
      COMPLETED: '#4CAF50',
      PENDING: '#9E9E9E',
      APPROVED: '#BC9C6C',
    };

    const STATUS_LABELS: Record<string, string> = {
      ACCEPTED: 'Acceptée',
      IN_PROGRESS: 'En cours',
      AWAITING_FINAL: 'Finalisée',
      COMPLETED: 'Terminée',
      PENDING: 'En attente',
      APPROVED: 'Approuvée',
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const windowStart = new Date(today);
    windowStart.setDate(windowStart.getDate() - 7); // 7 jours passés
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + 30); // 30 jours futurs

    const missions = await this.prisma.request.findMany({
      where: {
        providerId,
        status: {
          in: [
            RequestStatus.ACCEPTED,
            RequestStatus.IN_PROGRESS,
            RequestStatus.AWAITING_FINAL,
            RequestStatus.COMPLETED,
          ],
        },
        scheduledAt: { gte: windowStart, lte: windowEnd },
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        client: { select: { id: true, fullName: true, phone: true, quartier: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Regrouper par date
    const eventsByDate: Record<string, any[]> = {};
    for (const m of missions) {
      const dateStr = m.scheduledAt.toISOString().split('T')[0];
      if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
      eventsByDate[dateStr].push({
        id: m.id,
        title: m.service?.name || 'Mission',
        category: m.service?.category,
        client: m.client?.fullName,
        clientPhone: m.client?.phone,
        clientQuartier: m.client?.quartier,
        address: m.address,
        time: m.scheduleTime || m.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        duration: 2,
        status: m.status,
        statusLabel: STATUS_LABELS[m.status] || m.status,
        color: STATUS_COLORS[m.status] || '#BC9C6C',
        price: m.price,
        isRecurring: !!m.scheduleFrequency && m.scheduleFrequency !== 'ONCE',
        frequency: m.scheduleFrequency,
      });
    }

    // Construire la structure semaine par semaine
    const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const DAY_NAMES_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const weeks: any[] = [];
    let cursor = new Date(windowStart);
    // Aligner sur le lundi de la semaine de début
    const startDow = cursor.getDay();
    cursor.setDate(cursor.getDate() - (startDow === 0 ? 6 : startDow - 1));

    let weekNum = 1;
    while (cursor <= windowEnd) {
      const weekDays: any[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().split('T')[0];
        const dayIndex = cursor.getDay();
        weekDays.push({
          date: dateStr,
          dayName: DAY_NAMES[dayIndex],
          dayNameFull: DAY_NAMES_FULL[dayIndex],
          isToday: dateStr === today.toISOString().split('T')[0],
          isPast: cursor < today,
          isSunday: dayIndex === 0,
          events: eventsByDate[dateStr] || [],
        });
        cursor.setDate(cursor.getDate() + 1);
      }

      const fmt = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      weeks.push({
        weekNumber: weekNum++,
        label: `${fmt(weekDays[0].date)} — ${fmt(weekDays[6].date)}`,
        days: weekDays,
        totalEvents: weekDays.reduce((acc, d) => acc + d.events.length, 0),
      });
    }

    const upcomingEvents = missions
      .filter(m => m.scheduledAt >= today)
      .slice(0, 5)
      .map(m => ({
        id: m.id,
        title: m.service?.name,
        date: m.scheduledAt.toISOString().split('T')[0],
        time: m.scheduleTime || '—',
        status: m.status,
        color: STATUS_COLORS[m.status] || '#BC9C6C',
        client: m.client?.fullName,
      }));

    return {
      providerId,
      window: {
        from: windowStart.toISOString().split('T')[0],
        to: windowEnd.toISOString().split('T')[0],
      },
      totalMissions: missions.length,
      upcomingEvents,
      weeks,
    };
  }
}
