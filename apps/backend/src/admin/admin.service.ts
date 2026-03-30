import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      newUsers,
      activeRequests,
      totalRevenueResult,
      recentActivityData,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.request.count({
        where: {
          status: { in: ['PENDING', 'APPROVED', 'SCHEDULED', 'CONFIRMED'] },
        },
      }),
      this.prisma.request.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { escrowAmount: true },
      }),
      this.prisma.request.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          service: true,
          provider: true,
        },
      }),
    ]);

    // Categories mock calculation as Prisma groupBy doesn't directly support 
    // joining relations on count, so we get total services
    const services = await this.prisma.service.findMany({
      select: { category: true }
    });
    
    const categoryCounts = services.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalServices = services.length || 1;
    const colors = ["#FF6B00", "#BC9C6C", "#321B13", "#4A5568"];
    const categories = Object.keys(categoryCounts).map((cat, i) => ({
      label: cat,
      value: `${Math.round((categoryCounts[cat] / totalServices) * 100)}%`,
      color: colors[i % colors.length]
    })).slice(0, 3);

    const stats = [
      {
        label: 'Revenu Total',
        value: `$${(totalRevenueResult._sum.escrowAmount || 0).toLocaleString()}`,
        trend: '+12%',
        color: '#FF6B00',
      },
      {
        label: 'Demandes Actives',
        value: activeRequests.toString(),
        trend: '+5%',
        color: '#BC9C6C',
      },
      {
        label: 'Nouveaux Inscrits',
        value: newUsers.toString(),
        trend: '+8%',
        color: '#321B13',
      },
      {
        label: 'Utilisateurs Totaux',
        value: totalUsers.toString(),
        trend: '+2%',
        color: '#FF6B00',
      },
    ];

    const activities = recentActivityData.map((req) => ({
      id: req.id,
      name: req.provider?.fullName || 'En attente',
      email: req.client.email,
      type: req.service.title,
      status: req.status === 'COMPLETED' ? 'VÉRIFIÉ' : 
              req.status === 'REJECTED' ? 'SUSPENDU' : 'EN ATTENTE',
      amount: req.escrowAmount ? `$${req.escrowAmount}` : '$0.00',
    }));

    return { stats, activities, categories };
  }

  async getUsers() {
    const usersData = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { clientRequests: true, providerRequests: true },
        },
      },
    });

    const users = usersData.map((user) => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      status: user.isActive ? 'ACTIF' : 'INACTIF',
      joined: new Date(user.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      tasks: user.role === 'PROVIDER' ? user._count.providerRequests : user._count.clientRequests,
      rating: 5.0,
    }));

    return { users };
  }

  async getRequests() {
    const requestsData = await this.prisma.request.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        service: true,
      },
    });

    const requests = requestsData.map((req) => ({
      id: req.id,
      client: req.client.fullName,
      service: req.service.title,
      amount: req.escrowAmount ? `$${req.escrowAmount.toLocaleString()}` : '$0.00',
      status: req.status === 'COMPLETED' ? 'TERMINÉ' : 
              req.status === 'PENDING' ? 'EN ATTENTE' : 
              req.status === 'REJECTED' ? 'REJETÉ' : 'VÉRIFIÉ',
      date: new Date(req.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      }),
    }));

    return { requests };
  }

  async getFinancials() {
    const [totalRevenue, escrow, requestsData] = await Promise.all([
      this.prisma.request.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { escrowAmount: true },
      }),
      this.prisma.request.aggregate({
        where: { status: { in: ['CONFIRMED', 'SCHEDULED'] } },
        _sum: { escrowAmount: true },
      }),
      this.prisma.request.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
        where: { escrowAmount: { not: null } },
      }),
    ]);

    const revSum = totalRevenue._sum.escrowAmount || 0;
    const stats = [
      { label: 'Solde Total', value: `$${revSum.toLocaleString()}`, trend: '+12%', color: '#FF6B00' },
      { label: 'En Séquestre', value: `$${(escrow._sum.escrowAmount || 0).toLocaleString()}`, trend: '+4%', color: '#BC9C6C' },
      { label: 'Payé Prestataires', value: `$${(revSum * 0.8).toLocaleString()}`, trend: '+8%', color: '#321B13' },
      { label: 'Commissions', value: `$${(revSum * 0.2).toLocaleString()}`, trend: '+15%', color: '#FF6B00' },
    ];

    const transactions = requestsData.map((req) => ({
      id: req.id.slice(-4),
      type: 'PAIEMENT',
      amount: `+$${req.escrowAmount?.toLocaleString()}`,
      status: req.status === 'COMPLETED' ? 'RÉUSSI' : 'EN ATTENTE',
      date: new Date(req.updatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      }),
      method: 'Service Escrow',
    }));

    return { stats, transactions };
  }

  async getAnalytics() {
    const usersData = await this.prisma.user.findMany({ select: { city: true } });
    
    const cityCounts = usersData.reduce((acc, curr) => {
      const city = curr.city || "Goma";
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUsers = usersData.length || 1;
    const colors = ["#FF6B00", "#BC9C6C", "#321B13"];
    
    const cities = Object.keys(cityCounts).map((city, i) => ({
      city,
      percentage: Math.round((cityCounts[city] / totalUsers) * 100),
      color: colors[i % colors.length]
    })).sort((a, b) => b.percentage - a.percentage);

    const topCity = cities[0] ? `${cities[0].city} (${cities[0].percentage}%)` : "Aucune";

    return {
      cities,
      metrics: {
        growth: "+12.4%",
        conversion: "3.2%",
        topCity,
      }
    };
  }

  getSettings() {
    return {
      settings: {
        interfaceMode: "light",
        notifications: true
      }
    };
  }
}
