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

  async findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service introuvable.');
    return service;
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

  async update(id: string, data: Partial<{
    name: string;
    category: string;
    description: string;
    price: number;
    currency: string;
    isActive: boolean;
    workingHoursStart: string;
    workingHoursEnd: string;
    imageKey: string;
  }>) {
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
