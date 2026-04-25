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
      price: service.price || 0, // Retourne 0 si null pour le frontend
      currency: service.currency || 'USD',
      isActive: service.isActive,
      imageUrl: this.storageService.getPublicUrl(service.imageKey),
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
        'Format imageKey invalide.',
      );
    }
  }

  async create(createServiceDto: CreateServiceDto) {
    // 1. Validation de l'image
    this.validateImageKey(createServiceDto.imageKey);

    // 2. Vérification d'unicité globale du nom (Kaskade Rule)
    const existing = await this.prisma.service.findFirst({
      where: {
        name: { equals: createServiceDto.name, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException(
        `La catégorie "${createServiceDto.name}" existe déjà dans le système.`,
      );
    }

    // 3. Création de la catégorie globale
    const newCategory = await this.prisma.service.create({
      data: {
        ...createServiceDto,
        price: createServiceDto.price || 0, // Valeur par défaut si non fourni
        isActive: createServiceDto.isActive !== undefined ? createServiceDto.isActive : true, // Actif par défaut
      },
    });

    this.logger.log(`ADMIN : Nouvelle catégorie globale créée : ${newCategory.name}`);
    this.eventEmitter.emit('service.created', { serviceId: newCategory.id, serviceName: newCategory.name });

    return this.formatServiceResponse(newCategory);
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
