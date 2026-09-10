import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { withServiceImageUrl } from '../common/utils/media-url.util';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private withImageUrl<T extends { imageKey?: string | null }>(service: T) {
    return withServiceImageUrl(service);
  }

  private normalizeQuery(q: string): string[] {
    return q
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  private stripAccents(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private normalizedName(service: { name?: string | null }): string {
    return this.stripAccents(String(service.name ?? '').toLowerCase());
  }

  private computeScore(
    service: { name?: string | null },
    words: string[],
  ): { score: number; allMatch: boolean } {
    // Pertinence calculée uniquement sur le nom du service.
    // Un match en description / quartier ne doit jamais faire remonter un service.
    const name = this.normalizedName(service);

    let score = 0;
    let allMatch = true;
    words.forEach((w) => {
      let wordMatched = false;
      if (name === w) {
        score += 100;
        wordMatched = true;
      } else if (name.startsWith(w)) {
        score += 50;
        wordMatched = true;
      } else if (name.includes(w)) {
        score += 30;
        wordMatched = true;
      }
      if (!wordMatched) allMatch = false;
    });
    return { score, allMatch };
  }

  async findAll() {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        providers: { select: { quartier: true } },
      },
    });

    return services.map((service) =>
      this.withImageUrl({
        ...service,
        quartiers: [
          ...new Set(
            service.providers
              .map((p) => p.quartier.trim())
              .filter((q) => q.length > 0),
          ),
        ],
      }),
    );
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

  async search(query: string, limit = 8) {
    const words = this.normalizeQuery(query);
    if (!words.length) return [];

    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      include: {
        providers: { select: { quartier: true } },
      },
    });

    const mapped = services.map((service) =>
      this.withImageUrl({
        ...service,
        quartiers: [
          ...new Set(
            service.providers
              .map((p) => p.quartier.trim())
              .filter((q) => q.length > 0),
          ),
        ],
      }),
    );

    const scored = mapped
      .map((s) => ({ ...s, ...this.computeScore(s, words) }))
      .filter((s) => s.allMatch)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const pa = a.price == null ? Number.MAX_SAFE_INTEGER : a.price;
        const pb = b.price == null ? Number.MAX_SAFE_INTEGER : b.price;
        return pa - pb;
      })
      .slice(0, limit);

    return scored.map((s) => {
      const { score: _sc, allMatch: _am, ...service } = s;
      void _sc;
      void _am;
      return service;
    });
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
