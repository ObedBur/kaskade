import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, RequestStatus } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalClients,
      totalProviders,
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      totalServices,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.CLIENT } }),
      this.prisma.user.count({ where: { role: Role.PROVIDER } }),
      this.prisma.request.count(),
      this.prisma.request.count({ where: { status: RequestStatus.PENDING } }),
      this.prisma.request.count({ where: { status: RequestStatus.IN_PROGRESS } }),
      this.prisma.request.count({ where: { status: RequestStatus.COMPLETED } }),
      this.prisma.service.count({ where: { isActive: true } }),
    ]);

    // Revenue estimation (only completed or in progress with fixed prices)
    const paidRequests = await this.prisma.request.findMany({
      where: {
        status: { in: [RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED, RequestStatus.AWAITING_FINAL] },
        price: { not: null },
      },
      select: { price: true },
    });

    const totalRevenue = paidRequests.reduce((sum, req) => sum + (req.price || 0), 0);

    // Additional "Important" Data
    const topQuartier = await this.prisma.user.groupBy({
      by: ['quartier'],
      where: { quartier: { not: '' } },
      _count: { _all: true },
      orderBy: { _count: { quartier: 'desc' } },
      take: 1,
    });

    const usersWithRequests = await this.prisma.user.count({
      where: { clientRequests: { some: {} } },
    });

    return {
      users: {
        total: totalUsers,
        clients: totalClients,
        providers: totalProviders,
        conversionRate: totalUsers > 0 ? (usersWithRequests / totalUsers) * 100 : 0,
        topQuartier: topQuartier[0]?.quartier || 'N/A',
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
      },
      services: {
        total: totalServices,
      },
      revenue: totalRevenue,
    };
  }

  async getRecentActivity() {
    const [recentRequests, recentUsers] = await Promise.all([
      this.prisma.request.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { fullName: true, email: true } },
          service: { select: { name: true } },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, email: true, role: true, createdAt: true },
      }),
    ]);

    return {
      recentRequests,
      recentUsers,
    };
  }

  async getUserGrowth() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const growthMap = new Map();
    users.forEach((user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      growthMap.set(date, (growthMap.get(date) || 0) + 1);
    });

    return Array.from(growthMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
