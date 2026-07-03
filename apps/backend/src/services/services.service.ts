import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private withImageUrl<T extends { imageKey?: string | null }>(service: T) {
    return {
      ...service,
      imageUrl: service.imageKey
        ? `/uploads/services/${service.imageKey}`
        : null,
    };
  }

  async findAll() {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return services.map((service) => this.withImageUrl(service));
  }

  async findAllForAdmin() {
    const services = await this.prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return services.map((service) => this.withImageUrl(service));
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service introuvable.');
    return this.withImageUrl(service);
  }

  async create(data: {
    name: string;
    category: string;
    description?: string;
    price?: number;
    currency?: string;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    imageKey?: string;
  }) {
    return this.prisma.service.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      category: string;
      description: string;
      price: number;
      currency: string;
      isActive: boolean;
      workingHoursStart: string;
      workingHoursEnd: string;
      imageKey: string;
    }>,
  ) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
