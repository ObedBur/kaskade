import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateServiceDto, ServiceResponseDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Formate un service pour la réponse API
   * Remplace imageKey par imageUrl (CDN)
   */
  private formatServiceResponse(service: any): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description || null,
      price: service.price,
      currency: service.currency,
      isActive: service.isActive,
      imageUrl: this.storageService.getPublicUrl(service.imageKey), // ← Génère URL depuis imageKey
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  /**
   * Valide le imageKey si fourni
   */
  private validateImageKey(imageKey?: string): void {
    if (imageKey && !this.storageService.isValidImageKey(imageKey)) {
      throw new BadRequestException(
        'Format imageKey invalide. Utilisez format: nom-uuid.extension (jpg, png, webp)',
      );
    }
  }

  async create(createServiceDto: CreateServiceDto) {
    // Valider imageKey si fourni
    this.validateImageKey(createServiceDto.imageKey);

    // Empêcher les doublons (même nom + même catégorie)
    const existing = await this.prisma.service.findFirst({
      where: {
        name: { equals: createServiceDto.name, mode: 'insensitive' },
        category: { equals: createServiceDto.category, mode: 'insensitive' },
      },
    });

    if (existing) {
      this.logger.warn(`Tentative de création d'un service existant: ${createServiceDto.name} (${createServiceDto.category})`);
      throw new ConflictException(
        `Un service "${createServiceDto.name}" existe déjà dans la catégorie "${createServiceDto.category}".`,
      );
    }

    const newService = await this.prisma.service.create({
      data: createServiceDto,
    });

    this.logger.log(`Nouveau service catalogue créé: ${newService.name} (Catégorie: ${newService.category}, ID: ${newService.id})`);
    this.eventEmitter.emit('service.created', { serviceId: newService.id, serviceName: newService.name });

    return this.formatServiceResponse(newService);
  }

  async findAll() {
    const services = await this.prisma.service.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return services.map((service) => this.formatServiceResponse(service));
  }

  async findAllActive() {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return services.map((service) => this.formatServiceResponse(service));
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service introuvable.`);
    }
    return this.formatServiceResponse(service);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    // Vérifie que le service existe
    await this.findOne(id);

    // Valider imageKey si fourni en update
    this.validateImageKey(updateServiceDto.imageKey);

    // Récupérer le service actuel
    const currentService = await this.prisma.service.findUnique({ where: { id } });

    if (!currentService) {
      throw new NotFoundException(`Service introuvable.`);
    }

    // Vérifier unicité nom+catégorie si l'un ou l'autre change
    if (updateServiceDto.name || updateServiceDto.category) {
      const existing = await this.prisma.service.findFirst({
        where: {
          id: { not: id },
          name: { equals: updateServiceDto.name || currentService.name, mode: 'insensitive' },
          category: { equals: updateServiceDto.category || currentService.category, mode: 'insensitive' },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Un service avec ce nom existe déjà dans cette catégorie.`,
        );
      }
    }

    const updatedService = await this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });

    this.logger.log(`Service catalogue mis à jour: ${updatedService.name} (ID: ${id})`);
    this.eventEmitter.emit('service.updated', { serviceId: updatedService.id, serviceName: updatedService.name });

    return this.formatServiceResponse(updatedService);
  }

  async remove(id: string) {
    const service = await this.findOne(id); // Vérifie que le service existe
    const result = await this.prisma.service.delete({ where: { id } });
    this.logger.log(`Service catalogue supprimé: ${service.name} (ID: ${id})`);
    this.eventEmitter.emit('service.deleted', { serviceId: id, serviceName: service.name });
    return this.formatServiceResponse(result);
  }
}
