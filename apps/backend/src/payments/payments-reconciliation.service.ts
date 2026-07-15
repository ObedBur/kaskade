import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import {
  isMbiyoPaymentFailed,
  isMbiyoPaymentSuccessful,
} from './mbiyo.util';

interface MbiyoTransactionResponse {
  status: string;
  message?: string;
  data?: {
    transaction_id: string;
    status: string;
    order_id?: string;
    amount?: number;
    currency?: string;
  } | null;
}

@Injectable()
export class PaymentsReconciliationService {
  private readonly logger = new Logger(PaymentsReconciliationService.name);
  private readonly mbiyoApiUrl: string;
  private readonly mbiyoApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {
    this.mbiyoApiUrl = this.configService
      .get<string>('MBIYO_API_URL', 'https://dashboard.mbiyo.africa/api/v1')
      .replace(/\/$/, '');
    this.mbiyoApiKey = this.configService.get<string>('MBIYO_SECRET_KEY', '');
  }

  @Cron('*/15 * * * *')
  async reconcileExpiredPayments() {
    const cutoffRecent = new Date(Date.now() - 48 * 60 * 60 * 1000);
    let checked = 0;
    let confirmed = 0;
    let conflicts = 0;
    let failed = 0;
    let abandoned = 0;

    const expiredPayments = await this.prisma.payment.findMany({
      where: {
        status: 'EXPIRED',
        mbiyoRef: { not: null },
        createdAt: { gte: cutoffRecent },
      },
      include: { request: true },
      orderBy: { createdAt: 'asc' },
    });

    for (const payment of expiredPayments) {
      checked += 1;

      try {
        const mbiyoTransaction = await this.fetchMbiyoTransaction(payment.mbiyoRef!);

        if (!mbiyoTransaction) {
          continue;
        }

        const mbiyoStatus = mbiyoTransaction.status;
        if (isMbiyoPaymentSuccessful(mbiyoStatus)) {
          const result = await this.paymentsService.confirmPaymentSuccess(
            payment,
            mbiyoTransaction.transaction_id,
          );

          if (result.outcome === 'conflict') {
            conflicts += 1;
          } else {
            confirmed += 1;
          }
        } else if (isMbiyoPaymentFailed(mbiyoStatus)) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });
          failed += 1;
          this.logger.warn(
            `❌ Paiement expiré marqué FAILED après réconciliation | paymentId=${payment.id} | mbiyoRef=${payment.mbiyoRef} | status=${mbiyoStatus}`,
          );
        }
      } catch (error: any) {
        this.logger.error(
          `🚨 Réconciliation Mbiyo échouée | paymentId=${payment.id} | mbiyoRef=${payment.mbiyoRef} | error=${error.message}`,
        );
      }
    }

    const abandonedPayments = await this.prisma.payment.findMany({
      where: {
        status: 'EXPIRED',
        createdAt: { lt: cutoffRecent },
      },
      orderBy: { createdAt: 'asc' },
    });

    for (const payment of abandonedPayments) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'ABANDONED' },
      });
      abandoned += 1;

      await this.paymentsService.notifyAdminsPaymentReview(
        payment,
        'PAYMENT_ABANDONED_NEEDS_REVIEW',
        'Paiement abandonné à vérifier',
      );
    }

    this.logger.log(
      `🔔 Réconciliation Mbiyo terminée | vérifiés=${checked} | confirmés=${confirmed} | conflits=${conflicts} | échoués=${failed} | abandonnés=${abandoned}`,
    );
  }

  private async fetchMbiyoTransaction(transactionId: string) {
    const res = await fetch(
      `${this.mbiyoApiUrl}/merchant/transactions/${transactionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.mbiyoApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data: MbiyoTransactionResponse = await res.json();

    if (res.status === 404) {
      this.logger.warn(
        `⚠️ Transaction Mbiyo introuvable, nouvelle tentative au prochain passage | mbiyoRef=${transactionId} | message=${data?.message ?? 'Transaction not found'}`,
      );
      return null;
    }

    if (!res.ok || data.status === 'error') {
      throw new Error(data?.message || `Erreur HTTP: ${res.status}`);
    }

    if (!data.data?.transaction_id || !data.data.status) {
      throw new Error('Réponse Mbiyo invalide: statut transaction manquant.');
    }

    return data.data;
  }
}
