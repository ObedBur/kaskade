import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatus } from '@prisma/client';
import { InitiatePaymentDto, PaymentOperator } from './dto/initiate-payment.dto';
import { MbiyoCallbackDto } from './dto/mbiyo-callback.dto';

type KaskadePaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

interface MbiyoPayinResponse {
  status: string;
  message?: string;
  data?: {
    transaction_id?: string;
    amount?: number;
    fee?: number;
    charged_amount?: number;
    currency?: string;
    order_id?: string;
    status?: string;
    payment_method?: string;
    redirect_url?: string | null;
    instructions?: string | null;
    auth_mode?: string | null;
    created_at?: string;
  };
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
      .get<string>('MBIYO_API_URL', 'https://dashboard.mbiyo.africa/api')
      .replace(/\/$/, '');
    this.mbiyoApiKey = this.configService.get<string>('MBIYO_API_KEY', '');
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
      throw new ForbiddenException("Vous n'etes pas le client de cette demande.");
    }

    if (request.status !== RequestStatus.APPROVED && request.status !== RequestStatus.ACCEPTED) {
      throw new BadRequestException(
        "L'acompte ne peut etre verse que sur une demande approuvee.",
      );
    }

    const basePrice = request.price || request.service.price;
    const depositAmount = basePrice ? basePrice * 0.5 : 0;

    if (depositAmount <= 0) {
      throw new BadRequestException(
        "Le montant de l'acompte est invalide (le service n'a pas de prix).",
      );
    }

    return this.initiatePayin({
      requestId: dto.requestId,
      clientId,
      amount: depositAmount,
      currency: dto.currency || 'USD',
      operator: dto.operator,
      phoneNumber: dto.phoneNumber,
      type: 'DEPOSIT',
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
      throw new ForbiddenException("Vous n'etes pas le client de cette demande.");
    }

    if (request.status !== RequestStatus.AWAITING_FINAL) {
      throw new BadRequestException(
        'Le paiement final ne peut etre effectue que lorsque le prestataire a termine la mission.',
      );
    }

    const finalAmount = request.price ? request.price * 0.5 : 0;

    if (finalAmount <= 0) {
      throw new BadRequestException('Le montant du paiement final est invalide.');
    }

    return this.initiatePayin({
      requestId: dto.requestId,
      clientId,
      amount: finalAmount,
      currency: dto.currency || 'USD',
      operator: dto.operator,
      phoneNumber: dto.phoneNumber,
      type: 'FINAL',
    });
  }

  private async initiatePayin(params: {
    requestId: string;
    clientId: string;
    amount: number;
    currency: string;
    operator: PaymentOperator;
    phoneNumber: string;
    type: 'DEPOSIT' | 'FINAL';
  }) {
    if (!this.mbiyoApiKey) {
      throw new ServiceUnavailableException('MBIYO_API_KEY non configure.');
    }

    const network = this.toMbiyoNetwork(params.operator);
    const phoneNumber = this.toMbiyoPhoneNumber(params.phoneNumber);

    const payment = await this.prisma.payment.create({
      data: {
        requestId: params.requestId,
        clientId: params.clientId,
        amount: params.amount,
        currency: params.currency,
        operator: params.operator,
        phoneNumber,
        type: params.type,
        status: 'PENDING',
      },
    });

    const callbackUrl = this.configService.get<string>(
      'MBIYO_WEBHOOK_URL',
      'https://api.kaskade.com/api/v1/payments/webhook/mbiyo',
    );

    const mbiyoPayload = {
      amount: params.amount,
      currency: params.currency,
      payment_method: 'mobile_money',
      order_id: payment.id,
      callback_url: callbackUrl,
      metadata: {
        phone_number: phoneNumber,
        network,
        country_code: 'CD',
      },
    };

    this.logger.log(
      `Envoi Payin Mbiyo: ${params.amount} ${params.currency}, network=${network}, order_id=${payment.id}`,
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`${this.mbiyoApiUrl}/v1/merchant/payin`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.mbiyoApiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mbiyoPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = (await res.json().catch(() => null)) as MbiyoPayinResponse | null;

      if (!res.ok || !responseData || responseData.status !== 'success') {
        const message =
          responseData?.message || `Mbiyo a refuse la transaction (HTTP ${res.status}).`;
        throw new Error(message);
      }

      const transactionId = responseData.data?.transaction_id;
      const initialStatus = this.toKaskadePaymentStatus(responseData.data?.status);

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { mbiyoRef: transactionId },
      });

      if (initialStatus !== 'PENDING' && transactionId) {
        await this.handleMbiyoCallback({
          transaction_id: transactionId,
          amount: Number(responseData.data?.amount ?? params.amount),
          fee: Number(responseData.data?.fee ?? 0),
          currency: responseData.data?.currency ?? params.currency,
          order_id: payment.id,
          status: responseData.data?.status ?? 'pending',
          charged_amount: Number(responseData.data?.charged_amount ?? params.amount),
          type: 'cashin',
          created_at: responseData.data?.created_at,
          metadata: {
            phone_number: phoneNumber,
            network,
            country_code: 'CD',
          },
        });
      }

      return {
        message: 'Paiement initie. Veuillez confirmer la transaction sur votre telephone.',
        paymentId: payment.id,
        mbiyoRef: transactionId,
        amount: responseData.data?.amount ?? params.amount,
        chargedAmount: responseData.data?.charged_amount,
        fee: responseData.data?.fee,
        currency: responseData.data?.currency ?? params.currency,
        status: initialStatus,
        redirectUrl: responseData.data?.redirect_url ?? null,
        instructions: responseData.data?.instructions ?? null,
        authMode: responseData.data?.auth_mode ?? null,
      };
    } catch (error: any) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      const errorMessage = error?.message || 'Erreur inconnue';
      this.logger.error(`Echec appel Mbiyo Payin: ${errorMessage}`);

      throw new InternalServerErrorException(
        `Impossible d'initier le paiement Mobile Money. ${errorMessage}`,
      );
    }
  }

  async handleMbiyoCallback(payload: MbiyoCallbackDto) {
    this.logger.log(
      `Webhook Mbiyo recu | order_id=${payload.order_id} | transaction_id=${payload.transaction_id} | status=${payload.status}`,
    );

    const payment = await this.prisma.payment.findUnique({
      where: { id: payload.order_id },
      include: { request: true },
    });

    if (!payment) {
      this.logger.warn(`Webhook ignore: aucun paiement trouve pour order_id=${payload.order_id}`);
      return { received: true, processed: false };
    }

    if (payment.mbiyoRef && payment.mbiyoRef !== payload.transaction_id) {
      this.logger.warn(
        `Webhook ignore: transaction_id inattendu pour payment=${payment.id}`,
      );
      return { received: true, processed: false, reason: 'transaction_mismatch' };
    }

    if (payment.status !== 'PENDING') {
      this.logger.warn(`Paiement ${payment.id} deja traite (${payment.status}).`);
      return { received: true, processed: false, reason: 'already_processed' };
    }

    const nextPaymentStatus = this.toKaskadePaymentStatus(payload.status);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { mbiyoRef: payload.transaction_id },
    });

    if (nextPaymentStatus === 'PENDING') {
      return { received: true, processed: false, status: 'PENDING' };
    }

    if (nextPaymentStatus === 'SUCCESS') {
      const newRequestStatus =
        payment.type === 'DEPOSIT' ? RequestStatus.IN_PROGRESS : RequestStatus.COMPLETED;

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        }),
        this.prisma.request.update({
          where: { id: payment.requestId },
          data: { status: newRequestStatus },
        }),
      ]);

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

      return { received: true, processed: true, status: 'SUCCESS' };
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });

    this.eventEmitter.emit('payment.failed', {
      requestId: payment.requestId,
      paymentId: payment.id,
      type: payment.type,
    });

    return { received: true, processed: true, status: 'FAILED' };
  }

  async getPaymentStatus(paymentId: string, clientId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (payment.clientId !== clientId) {
      throw new ForbiddenException("Vous n'etes pas autorise a consulter ce paiement.");
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
      throw new ForbiddenException("Vous n'etes pas le client de cette demande.");
    }

    return this.prisma.payment.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private toMbiyoNetwork(operator: PaymentOperator): string {
    const networks: Record<PaymentOperator, string> = {
      [PaymentOperator.AIRTEL]: 'airtel',
      [PaymentOperator.ORANGE]: 'orange',
      [PaymentOperator.MPESA]: 'vodacom',
      [PaymentOperator.AFRICELL]: 'africell',
    };

    return networks[operator];
  }

  private toMbiyoPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  private toKaskadePaymentStatus(status?: string): KaskadePaymentStatus {
    switch ((status || '').toLowerCase()) {
      case 'success':
      case 'successful':
        return 'SUCCESS';
      case 'failed':
      case 'failure':
      case 'cancelled':
      case 'canceled':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  }
}
