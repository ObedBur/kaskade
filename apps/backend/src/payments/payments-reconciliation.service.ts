import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { isMbiyoPaymentFailed, isMbiyoPaymentSuccessful } from './mbiyo.util';

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

const RECONCILABLE_PAYMENT_STATUSES = ['EXPIRED', 'PENDING'] as const;
const DEFAULT_PENDING_EXPIRATION_MS = 5 * 60 * 1000;

@Injectable()
export class PaymentsReconciliationService {
  private readonly logger = new Logger(PaymentsReconciliationService.name);
  private readonly mbiyoApiUrl: string;
  private readonly mbiyoApiKey: string;
  private readonly pendingPaymentExpirationMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {
    this.mbiyoApiUrl = this.configService
      .get<string>('MBIYO_API_URL', 'https://dashboard.mbiyo.africa/api/v1')
      .replace(/\/$/, '');
    this.mbiyoApiKey = this.configService.get<string>('MBIYO_SECRET_KEY', '');

    // IMPORTANT: doit rester synchronisé avec la valeur utilisée dans
    // PaymentsService.assertNoActivePayment (même variable d'env,
    // PAYMENT_PENDING_EXPIRATION_MS). Idéalement, exposer une méthode
    // publique getPendingPaymentExpirationMs() sur PaymentsService et
    // l'appeler ici plutôt que de dupliquer la lecture de config — à faire
    // en prochaine passe pour éviter toute divergence entre les deux.
    const configured = this.configService.get<string>(
      'PAYMENT_PENDING_EXPIRATION_MS',
    );
    const parsed = configured ? Number(configured) : NaN;
    this.pendingPaymentExpirationMs =
      Number.isFinite(parsed) && parsed > 0
        ? parsed
        : DEFAULT_PENDING_EXPIRATION_MS;
  }

  @Cron('*/15 * * * *')
  async reconcileExpiredPayments() {
    const cutoffRecent = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const stalePendingCutoff = new Date(
      Date.now() - this.pendingPaymentExpirationMs,
    );
    let checked = 0;
    let confirmed = 0;
    let conflicts = 0;
    let failed = 0;
    let abandoned = 0;

    // EXPIRED récents (déjà basculés par une tentative de retry côté client)
    // + PENDING devenus trop vieux mais jamais retentés par personne — sans
    // ce second cas, un paiement dont le webhook échoue ET que le client ne
    // relance jamais reste invisible pour ce cron indéfiniment.
    const paymentsToCheck = await this.prisma.payment.findMany({
      where: {
        mbiyoRef: { not: null },
        createdAt: { gte: cutoffRecent },
        OR: [
          { status: 'EXPIRED' },
          { status: 'PENDING', createdAt: { lt: stalePendingCutoff } },
        ],
      },
      include: { request: true },
      orderBy: { createdAt: 'asc' },
    });

    for (const payment of paymentsToCheck) {
      checked += 1;

      try {
        const mbiyoTransaction = await this.fetchMbiyoTransaction(
          payment.mbiyoRef!,
        );

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
            `❌ Paiement marqué FAILED après réconciliation | paymentId=${payment.id} | mbiyoRef=${payment.mbiyoRef} | statusAvant=${payment.status} | statusMbiyo=${mbiyoStatus}`,
          );
        }
        // Si toujours "pending" côté Mbiyo : rien à faire, on retentera au
        // prochain passage du cron (dans 15 min).
      } catch (error: unknown) {
        this.logger.error(
          `🚨 Réconciliation Mbiyo échouée | paymentId=${payment.id} | mbiyoRef=${payment.mbiyoRef} | error=${this.getErrorMessage(error)}`,
        );
      }
    }

    // Au-delà de 48h sans résolution (EXPIRED ou PENDING), on abandonne et
    // on notifie les admins pour investigation manuelle.
    const abandonedPayments = await this.prisma.payment.findMany({
      where: {
        status: { in: [...RECONCILABLE_PAYMENT_STATUSES] },
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

    const rawData: unknown = await res.json();
    const data = rawData as MbiyoTransactionResponse;

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

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
