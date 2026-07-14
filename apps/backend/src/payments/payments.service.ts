import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatus } from '@prisma/client';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import {
  mapOperatorToNetwork,
  isMbiyoPaymentSuccessful,
  isMbiyoPaymentFailed,
  MbiyoPayinResponse,
} from './mbiyo.util';

export interface PayinInitResult {
  message: string;
  paymentId: string;
  mbiyoRef: string | null;
  amount: number;
  currency: string;
  status: string;
  authMode?: string | null;
  instructions?: string | null;
  redirectUrl?: string | null;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly mbiyoApiUrl: string;
  private readonly mbiyoApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    this.mbiyoApiUrl = this.configService
      .get<string>('MBIYO_API_URL', 'https://dashboard.mbiyo.africa/api/v1')
      .replace(/\/$/, '');
    this.mbiyoApiKey = this.configService.get<string>('MBIYO_SECRET_KEY', '');
  }

  async initiateDeposit(dto: InitiatePaymentDto, clientId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
      include: { service: true },
    });

    if (!request) {
      throw new NotFoundException('Demande introuvable.');
    }

    if (request.clientId !== clientId) {
      throw new ForbiddenException("Vous n'êtes pas le client de cette demande.");
    }

    if (
      request.status !== RequestStatus.APPROVED &&
      request.status !== RequestStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        "L'acompte ne peut être versé que sur une demande approuvée.",
      );
    }

    const existingDeposit = await this.prisma.payment.findFirst({
      where: { requestId: dto.requestId, type: 'DEPOSIT', status: 'SUCCESS' },
    });
    if (existingDeposit) {
      throw new BadRequestException('L\'acompte a déjà été payé pour cette demande.');
    }

    const basePrice = request.price || request.service.price;
    const depositAmount = basePrice ? basePrice * 0.5 : 0;

    if (depositAmount <= 0) {
      throw new BadRequestException(
        "Le montant de l'acompte est invalide (le service n'a pas de prix).",
      );
    }

    return this.initiateCollect({
      requestId: dto.requestId,
      clientId,
      amount: depositAmount,
      currency: dto.currency || request.currency || 'USD',
      operator: dto.operator,
      phoneNumber: dto.phoneNumber,
      type: 'DEPOSIT',
      omOtp: dto.omOtp,
    });
  }

  async initiateFinalPayment(dto: InitiatePaymentDto, clientId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande introuvable.');
    }

    if (request.clientId !== clientId) {
      throw new ForbiddenException("Vous n'êtes pas le client de cette demande.");
    }

    if (request.status !== RequestStatus.AWAITING_FINAL) {
      throw new BadRequestException(
        'Le paiement final ne peut être effectué que lorsque le prestataire a terminé la mission (statut AWAITING_FINAL).',
      );
    }

    const finalAmount = request.price ? request.price * 0.5 : 0;

    if (finalAmount <= 0) {
      throw new BadRequestException('Le montant du paiement final est invalide.');
    }

    return this.initiateCollect({
      requestId: dto.requestId,
      clientId,
      amount: finalAmount,
      currency: dto.currency || request.currency || 'USD',
      operator: dto.operator,
      phoneNumber: dto.phoneNumber,
      type: 'FINAL',
      omOtp: dto.omOtp,
    });
  }

  async finalizePayment(paymentId: string, otp: string, clientId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (payment.clientId !== clientId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à finaliser ce paiement.");
    }

    if (!payment.mbiyoRef) {
      throw new BadRequestException('Référence Mbiyo manquante pour ce paiement.');
    }

    try {
      const res = await fetch(
        `${this.mbiyoApiUrl}/merchant/transactions/${payment.mbiyoRef}/finalize`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.mbiyoApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otp }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || `Erreur HTTP: ${res.status}`);
      }

      return {
        message: data.message || 'OTP transmis. Attendez la confirmation du paiement.',
        status: 'pending',
      };
    } catch (error: any) {
      this.logger.error(`❌ Finalize Mbiyo: ${error.message}`);
      throw new InternalServerErrorException(
        `Impossible de finaliser le paiement. ${error.message}`,
      );
    }
  }

  private async initiateCollect(params: {
    requestId: string;
    clientId: string;
    amount: number;
    currency: string;
    operator: InitiatePaymentDto['operator'];
    phoneNumber: string;
    type: 'DEPOSIT' | 'FINAL';
    omOtp?: string;
  }): Promise<PayinInitResult> {
    const payment = await this.prisma.payment.create({
      data: {
        requestId: params.requestId,
        clientId: params.clientId,
        amount: params.amount,
        currency: params.currency,
        operator: params.operator,
        phoneNumber: params.phoneNumber,
        type: params.type,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `💳 Payment créé [${payment.id}] | Type: ${params.type} | ${params.amount} ${params.currency} | ${params.operator}`,
    );

    const callbackUrl = this.configService.get<string>('MBIYO_WEBHOOK_URL');

    const mbiyoPayload = {
      amount: params.amount,
      currency: params.currency,
      payment_method: 'mobile_money',
      order_id: payment.id,
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
      metadata: {
        network: mapOperatorToNetwork(params.operator),
        phone_number: params.phoneNumber,
        country_code: 'CD',
        ...(params.omOtp ? { om_otp: params.omOtp } : {}),
      },
    };

    try {
      this.logger.log(
        `📡 POST ${this.mbiyoApiUrl}/merchant/payin | order_id=${payment.id}`,
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      let res: Response;
      try {
        res = await fetch(`${this.mbiyoApiUrl}/merchant/payin`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.mbiyoApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mbiyoPayload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const responseData: MbiyoPayinResponse = await res.json();

      if (!res.ok || responseData.status === 'error') {
        throw new Error(
          responseData.message ||
            (responseData as any)?.data?.amount?.[0] ||
            `Erreur HTTP: ${res.status}`,
        );
      }

      const payinData = responseData.data;
      if (!payinData?.transaction_id) {
        throw new Error('Réponse Mbiyo invalide: transaction_id manquant.');
      }
      const transactionId = payinData.transaction_id;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { mbiyoRef: transactionId },
      });

      this.logger.log(
        `✅ Payin initié | transaction_id=${transactionId} | auth_mode=${payinData?.auth_mode ?? 'null'}`,
      );

      return {
        message:
          payinData?.auth_mode === 'confirm'
            ? 'Suivez les instructions sur votre téléphone pour confirmer le paiement.'
            : `Push USSD envoyé au ${params.phoneNumber}. Confirmez sur votre téléphone.`,
        paymentId: payment.id,
        mbiyoRef: transactionId,
        amount: params.amount,
        currency: params.currency,
        status: 'PENDING',
        authMode: payinData?.auth_mode ?? null,
        instructions: payinData?.instructions ?? null,
        redirectUrl: payinData?.redirect_url ?? null,
      };
    } catch (error: any) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      const errorMessage = error?.message || 'Erreur inconnue';
      this.logger.error(`❌ Échec payin Mbiyo: ${errorMessage}`);

      throw new InternalServerErrorException(
        `Impossible d'initier le paiement Mobile Money. ${errorMessage}`,
      );
    }
  }

  async handleMbiyoCallback(
    orderId: string,
    transactionId: string,
    status: string,
  ) {
    this.logger.log(
      `🔔 Webhook Mbiyo | order_id=${orderId} | transaction_id=${transactionId} | status=${status}`,
    );

    let payment = orderId
      ? await this.prisma.payment.findUnique({
          where: { id: orderId },
          include: { request: true },
        })
      : null;

    if (!payment && transactionId) {
      payment = await this.prisma.payment.findUnique({
        where: { mbiyoRef: transactionId },
        include: { request: true },
      });
    }

    if (!payment) {
      this.logger.warn(
        `⚠️ Webhook ignoré: aucun payment pour order_id=${orderId} ou txn=${transactionId}`,
      );
      return { received: true, processed: false };
    }

    if (payment.status !== 'PENDING') {
      this.logger.warn(
        `⚠️ Payment ${payment.id} déjà traité (${payment.status}). Webhook ignoré.`,
      );
      return { received: true, processed: false, reason: 'already_processed' };
    }

    if (isMbiyoPaymentSuccessful(status)) {
      const hasAssignedProvider = Boolean(payment.request.providerId);
      const newRequestStatus =
        payment.type === 'DEPOSIT'
          ? hasAssignedProvider
            ? RequestStatus.IN_PROGRESS
            : RequestStatus.ACCEPTED
          : RequestStatus.COMPLETED;

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', mbiyoRef: transactionId || payment.mbiyoRef },
        }),
        this.prisma.request.update({
          where: { id: payment.requestId },
          data: { status: newRequestStatus },
        }),
      ]);

      this.logger.log(
        `✅ Paiement ${payment.type} confirmé → demande ${payment.requestId} = ${newRequestStatus}`,
      );

      if (payment.type === 'DEPOSIT') {
        this.eventEmitter.emit('payment.deposit_confirmed', {
          requestId: payment.requestId,
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
        });
      } else {
        this.eventEmitter.emit('payment.final_confirmed', {
          requestId: payment.requestId,
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
        });
      }
    } else if (isMbiyoPaymentFailed(status)) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      this.logger.warn(`❌ Paiement ${payment.type} échoué (${status})`);

      this.eventEmitter.emit('payment.failed', {
        requestId: payment.requestId,
        paymentId: payment.id,
        type: payment.type,
      });
    } else {
      this.logger.log(`ℹ️ Webhook statut intermédiaire ignoré: ${status}`);
      return { received: true, processed: false, reason: 'pending_status' };
    }

    return {
      received: true,
      processed: true,
      status: isMbiyoPaymentSuccessful(status) ? 'SUCCESS' : 'FAILED',
    };
  }

  async getPaymentStatus(paymentId: string, clientId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (payment.clientId !== clientId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à consulter ce paiement.",
      );
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      operator: payment.operator,
      type: payment.type,
      mbiyoRef: payment.mbiyoRef,
      createdAt: payment.createdAt,
    };
  }

  async getPaymentsByRequest(requestId: string, clientId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande introuvable.');
    }

    if (request.clientId !== clientId) {
      throw new ForbiddenException("Vous n'êtes pas le client de cette demande.");
    }

    return this.prisma.payment.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
