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
  ) {}

  async apply(userId: string, applyProviderDto: ApplyProviderDto) {
    // 1. Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // 2. S'il est déjà PROVIDER, on bloque
    if (user.role === Role.PROVIDER) {
      throw new BadRequestException('Vous êtes déjà un prestataire.');
    }

    // 3. Empêcher une double demande en attente
    const existingApp = await this.prisma.providerApplication.findFirst({
      where: {
        userId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingApp) {
      throw new BadRequestException('Vous avez déjà une candidature en attente.');
    }

    // 4. Créer la demande et mettre à jour le profil utilisateur (Transaction)
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

    // Mise à jour de la candidature
    const updatedApp = await this.prisma.providerApplication.update({
      where: { id: applicationId },
      data: { status: RequestStatus.APPROVED },
    });

    // Mise à jour du rôle de l'utilisateur
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

  // ─── FEATURES PROVIDER ───────────────────────────────────────────────────

  // Feature A : Voir les demandes disponibles (liées à ses services)
  async findAvailableRequests(providerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
      include: { services: true },
    });

    if (!user || user.role !== Role.PROVIDER) {
      throw new BadRequestException('Accès refusé ou utilisateur non trouvé.');
    }

    const assignedServiceIds = user.services.map(s => s.id);

    return this.prisma.request.findMany({
      where: {
        OR: [
          { serviceId: { in: assignedServiceIds } },
          {
            service: {
              OR: [
                { category: { contains: user.metier || '', mode: 'insensitive' } },
                { name: { contains: user.metier || '', mode: 'insensitive' } },
              ]
            }
          }
        ],
        status: { in: [RequestStatus.APPROVED, RequestStatus.PENDING] },
      },
      include: {
        service: true,
        client: {
          select: { id: true, fullName: true, quartier: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Feature B : Accepter une mission
  async acceptRequest(requestId: string, providerId: string) {
    // Vérifier que le prestataire existe et récupérer son statut de disponibilité
    const provider = await this.prisma.user.findUnique({
      where: { id: providerId },
      include: { services: true },
    });

    if (!provider || provider.role !== Role.PROVIDER) {
      throw new BadRequestException('Action non autorisée.');
    }

    // Règle : mission unique (le prestataire ne peut pas accepter s'il est déjà en mission)
    if (provider.status === Status.EN_MISSION) {
      throw new BadRequestException('Vous êtes déjà assigné à une mission en cours.');
    }

    // Récupérer la demande
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande introuvable.');
    }

    if (request.status !== RequestStatus.APPROVED && request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Cette demande n\'est plus disponible.');
    }

    // Vérifier que le prestataire est bien assigné au service demandé
    const canHandleService = provider.services.some(s => s.id === request.serviceId);
    if (!canHandleService) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à réaliser ce service.');
    }

    // Marquer la mission acceptée + changer le statut du prestataire (transaction)
    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.ACCEPTED,
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

  // Feature B : Refuser une mission
  // (Le refus d'une demande disponible signifie simplement l'ignorer, on ne fait rien en BDD.
  // Mais si le client l'exige, on peut au moins vérifier si la demande existe)
  async rejectRequest(requestId: string, providerId: string) {
    const request = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Demande introuvable');
    
    this.eventEmitter.emit('request.rejected', { requestId, providerId });
    
    return { message: 'Demande ignorée avec succès' };
  }

  // Marquer une mission comme terminée
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

    // Le client doit avoir versé l'acompte avant que le provider puisse terminer
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

  // Feature C : Voir son profil
  async getProfile(providerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
      include: { services: true },
    });

    if (!user || user.role !== Role.PROVIDER) {
      throw new NotFoundException('Profil prestataire introuvable.');
    }

    // Retourner les données pertinentes sans le mot de passe
    const { password, refreshToken, ...profile } = user;
    return profile;
  }

  // Feature C : Modifier son profil
  async updateProfile(providerId: string, updateProfileDto: UpdateProviderProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
    });

    if (!user || user.role !== Role.PROVIDER) {
      throw new NotFoundException('Profil prestataire introuvable.');
    }

    // LOG de diagnostic serveur
    this.logger.log(`DONNÉES REÇUES POUR UPDATE (ID: ${providerId}): ${JSON.stringify(updateProfileDto)}`);

    // Nettoyage automatique de l'ancien avatar si une nouvelle URL est fournie
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
      // Total revenue (assuming price is fixed when approved/accepted)
      this.prisma.request.aggregate({
        where: {
          providerId,
          status: { in: [RequestStatus.COMPLETED, RequestStatus.AWAITING_FINAL] },
        },
        _sum: { price: true },
      }),
      // Pending missions count (assigned and in progress)
      this.prisma.request.count({
        where: {
          providerId,
          status: { in: [RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS] },
        },
      }),
      // Completed missions count
      this.prisma.request.count({
        where: {
          providerId,
          status: RequestStatus.COMPLETED,
        },
      }),
      // Active mission (Focus Principal)
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
}
