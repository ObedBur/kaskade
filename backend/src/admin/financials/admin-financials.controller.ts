import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, RequestStatus } from '@prisma/client';

@Controller('admin/financials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminFinancialsController {
  private readonly logger = new Logger(AdminFinancialsController.name);

  constructor(private readonly prisma: PrismaService) { }

  @Get()
  async getFinancials() {
    this.logger.log('ADMIN : Consultation des données financières');

    const completedRequests = await this.prisma.request.findMany({
      where: {
        status: { in: [RequestStatus.COMPLETED, RequestStatus.IN_PROGRESS, RequestStatus.AWAITING_FINAL] },
        price: { not: null },
      },
      include: {
        client: { select: { fullName: true } },
        service: { select: { name: true } },
        payments: { where: { status: 'SUCCESS' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Déterminer la devise majoritaire ou par défaut
    const defaultCurrency = completedRequests[0]?.payments[0]?.currency || 'FC';

    const totalRevenue = completedRequests.reduce((sum, req) => sum + (req.price || 0), 0);
    const completedCount = completedRequests.filter(r => r.status === RequestStatus.COMPLETED).length;

    // Simulate stats for the frontend
    const stats = [
      {
        label: "Revenu Total",
        value: `${totalRevenue.toLocaleString()} ${defaultCurrency}`,
        trend: "+12.5%",
        color: "text-emerald-500"
      },
      {
        label: "Missions Clôturées",
        value: completedCount.toString(),
        trend: "+5.2%",
        color: "text-blue-500"
      },
      {
        label: "Missions en Cours",
        value: completedRequests.filter(r => r.status === RequestStatus.IN_PROGRESS).length.toString(),
        trend: "+2.1%",
        color: "text-amber-500"
      },
      {
        label: "Prix Moyen Mission",
        value: completedRequests.length > 0
          ? `${Math.round(totalRevenue / completedRequests.length).toLocaleString()} ${defaultCurrency}`
          : `0 ${defaultCurrency}`,
        trend: "Stable",
        color: "text-purple-500"
      }
    ];

    // Transform requests into transaction items for the frontend
    const transactions = completedRequests.map(req => {
      const currency = req.payments[0]?.currency || 'FC';
      return {
        id: req.id.slice(0, 8),
        type: req.status === RequestStatus.COMPLETED ? "PAIEMENT" : "ACOMPTE",
        amount: `${req.price?.toLocaleString()} ${currency}`,
        status: req.status === RequestStatus.COMPLETED ? "RÉUSSI" : "EN ATTENTE",
        date: new Date(req.updatedAt).toLocaleDateString('fr-FR'),
        method: req.service.name + " (" + req.client.fullName + ")"
      };
    });

    return {
      stats,
      transactions: transactions.slice(0, 10) // Limit to last 10
    };
  }
}
