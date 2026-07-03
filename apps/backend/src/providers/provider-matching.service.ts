import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type EligibleProvider = {
  id: string;
  fullName: string;
  isActive: boolean;
  role: Role;
  metier: string | null;
};

@Injectable()
export class ProviderMatchingService {
  private readonly logger = new Logger(ProviderMatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findEligibleProviders(serviceId: string): Promise<EligibleProvider[]> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        providers: {
          where: {
            role: Role.PROVIDER,
            isActive: true,
          },
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

    if (!service) {
      return [];
    }

    if (service.providers.length > 0) {
      return service.providers;
    }

    const categoryProviders = await this.prisma.user.findMany({
      where: {
        role: Role.PROVIDER,
        isActive: true,
        categories: {
          some: { id: service.categoryId },
        },
      },
      select: {
        id: true,
        fullName: true,
        isActive: true,
        role: true,
        metier: true,
      },
    });

    this.logger.log(
      `${categoryProviders.length} prestataire(s) eligible(s) via categorie pour le service ${serviceId}.`,
    );

    return categoryProviders;
  }

  async isProviderEligibleForService(providerId: string, serviceId: string): Promise<boolean> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        providers: {
          where: { id: providerId, role: Role.PROVIDER, isActive: true },
          select: { id: true },
        },
      },
    });

    if (!service) {
      return false;
    }

    if (service.providers.length > 0) {
      return true;
    }

    const provider = await this.prisma.user.findFirst({
      where: {
        id: providerId,
        role: Role.PROVIDER,
        isActive: true,
        categories: {
          some: { id: service.categoryId },
        },
      },
      select: { id: true },
    });

    return !!provider;
  }
}
