import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
  HttpException,
  InternalServerErrorException,
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment, RequestStatus, Role } from '@prisma/client';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import {
  mapOperatorToNetwork,
  isMbiyoPaymentSuccessful,
  isMbiyoPaymentFailed,
  MbiyoPayinResponse,
} from './mbiyo.util';

const DEFAULT_PENDING_PAYMENT_EXPIRATION_MS = 5 * 60 * 1000;
const ACTIVE_PAYMENT_ERROR_MESSAGE =
  'Un paiement est déjà en cours pour cette demande, veuillez patienter ou réessayer dans quelques minutes.';

type PaymentWithRequest = Payment & {
  request: {
    providerId: string | null;
  };
};

type ConfirmPaymentSuccessOutcome =
  | { outcome: 'confirmed' }
  | { outcome: 'conflict' };

interface VerifiedMbiyoTransactionStatus {
  status: string;
  transactionId?: string;
}

interface MbiyoApiEnvelope<T = unknown> {
  status?: string;
  message?: string;
  data?: T | null;
}

interface MbiyoResponseDetails<T = unknown> {
  statusCode: number;
  responseStatus?: string;
  message: string;
  data?: T | null;
  payload?: MbiyoApiEnvelope<T> | null;
}

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
  private readonly pendingPaymentExpirationMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    this.mbiyoApiUrl = this.configService
      .get<string>('MBIYO_API_URL', 'https://dashboard.mbiyo.africa/api/v1')
      .replace(/\/$/, '');
    this.mbiyoApiKey = this.configService.get<string>('MBIYO_SECRET_KEY', '');
    if (!this.mbiyoApiKey.trim()) {
      throw new Error(
        'MBIYO_SECRET_KEY est requis pour initialiser PaymentsService.',
      );
    }
    this.pendingPaymentExpirationMs = this.getPendingPaymentExpirationMs();
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
      throw new ForbiddenException(
        "Vous n'êtes pas le client de cette demande.",
      );
    }

    if (
      request.status !== RequestStatus.APPROVED &&
      request.status !== RequestStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        "L'acompte ne peut être versé que sur une demande approuvée.",
      );
    }

    await this.assertNoActivePayment(dto.requestId, 'DEPOSIT');

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
      currency: this.resolveRequestCurrency(dto, request.currency),
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
      throw new ForbiddenException(
        "Vous n'êtes pas le client de cette demande.",
      );
    }

    if (request.status !== RequestStatus.AWAITING_FINAL) {
      throw new BadRequestException(
        'Le paiement final ne peut être effectué que lorsque le prestataire a terminé la mission (statut AWAITING_FINAL).',
      );
    }

    await this.assertNoActivePayment(dto.requestId, 'FINAL');

    const finalAmount = request.price ? request.price * 0.5 : 0;

    if (finalAmount <= 0) {
      throw new BadRequestException(
        'Le montant du paiement final est invalide.',
      );
    }

    return this.initiateCollect({
      requestId: dto.requestId,
      clientId,
      amount: finalAmount,
      currency: this.resolveRequestCurrency(dto, request.currency),
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
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à finaliser ce paiement.",
      );
    }

    if (!payment.mbiyoRef) {
      throw new BadRequestException(
        'Référence Mbiyo manquante pour ce paiement.',
      );
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

      const response = await this.readMbiyoResponse(res);

      if (!res.ok || this.isMbiyoFailureStatus(response.responseStatus)) {
        throw this.createMbiyoHttpException(
          'Impossible de finaliser le paiement.',
          {
            statusCode: response.statusCode,
            message: response.message,
          },
        );
      }

      return {
        message:
          response.message ||
          'OTP transmis. Attendez la confirmation du paiement.',
        status: 'pending',
      };
    } catch (error: any) {
      const mappedError = this.normalizeMbiyoException(
        'Impossible de finaliser le paiement.',
        error,
      );
      this.logger.error(
        `❌ Finalize Mbiyo [${this.getErrorStatusCode(mappedError) ?? 'n/a'}]: ${mappedError.message}`,
      );
      throw mappedError;
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
    const payment = await this.createPendingPayment(params);

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

      const response =
        await this.readMbiyoResponse<MbiyoPayinResponse['data']>(res);

      if (!res.ok || this.isMbiyoFailureStatus(response.responseStatus)) {
        throw this.createMbiyoHttpException(
          "Impossible d'initier le paiement Mobile Money.",
          {
            statusCode: response.statusCode,
            message: response.message,
          },
        );
      }

      const payinData = response.data;
      if (!payinData?.transaction_id) {
        throw new BadGatewayException(
          "Impossible d'initier le paiement Mobile Money. Réponse Mbiyo invalide: transaction_id manquant.",
        );
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

      const mappedError = this.normalizeMbiyoException(
        "Impossible d'initier le paiement Mobile Money.",
        error,
      );
      this.logger.error(
        `❌ Échec payin Mbiyo [${this.getErrorStatusCode(mappedError) ?? 'n/a'}]: ${mappedError.message}`,
      );

      throw mappedError;
    }
  }

  private resolveRequestCurrency(
    dto: InitiatePaymentDto,
    requestCurrency?: string | null,
  ): string {
    const currency = requestCurrency || 'USD';

    // La devise du body client ne doit jamais piloter un calcul financier:
    // elle sert uniquement à détecter une incohérence avec la demande persistée.
    if (dto.currency && String(dto.currency) !== currency) {
      throw new BadRequestException(
        `Devise invalide : cette demande est en ${currency}.`,
      );
    }

    return currency;
  }

  private async assertNoActivePayment(
    requestId: string,
    type: 'DEPOSIT' | 'FINAL',
  ) {
    const successfulPayment = await this.prisma.payment.findFirst({
      where: { requestId, type, status: 'SUCCESS' },
    });

    if (successfulPayment) {
      throw new BadRequestException(
        type === 'DEPOSIT'
          ? "L'acompte a déjà été payé pour cette demande."
          : 'Le paiement final a déjà été payé pour cette demande.',
      );
    }

    const pendingPayment = await this.prisma.payment.findFirst({
      where: { requestId, type, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    if (!pendingPayment) {
      return;
    }

    const ageMs = Date.now() - pendingPayment.createdAt.getTime();
    if (ageMs <= this.pendingPaymentExpirationMs) {
      throw new BadRequestException(ACTIVE_PAYMENT_ERROR_MESSAGE);
    }

    // Payment.status est un String dans schema.prisma: EXPIRED peut être stocké sans migration d'enum.
    await this.prisma.payment.update({
      where: { id: pendingPayment.id },
      data: { status: 'EXPIRED' },
    });

    this.logger.warn(
      `Paiement ${type} expiré [${pendingPayment.id}] après ${Math.round(ageMs / 1000)}s.`,
    );
  }

  private async createPendingPayment(params: {
    requestId: string;
    clientId: string;
    amount: number;
    currency: string;
    operator: InitiatePaymentDto['operator'];
    phoneNumber: string;
    type: 'DEPOSIT' | 'FINAL';
  }) {
    try {
      return await this.prisma.payment.create({
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
    } catch (error: any) {
      if (this.isActivePaymentUniqueConstraintError(error)) {
        throw new BadRequestException(ACTIVE_PAYMENT_ERROR_MESSAGE);
      }
      throw error;
    }
  }

  private getPendingPaymentExpirationMs(): number {
    const rawValue = this.configService.get<string>(
      'PAYMENT_PENDING_EXPIRATION_MS',
    );
    const parsed = rawValue ? Number(rawValue) : NaN;

    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_PENDING_PAYMENT_EXPIRATION_MS;
  }

  private isActivePaymentUniqueConstraintError(error: unknown): boolean {
    const maybeError =
      error && typeof error === 'object'
        ? (error as {
            code?: unknown;
            meta?: { code?: unknown };
            cause?: { code?: unknown };
          })
        : undefined;

    return (
      maybeError?.code === 'P2002' ||
      maybeError?.code === '23505' ||
      maybeError?.meta?.code === '23505' ||
      maybeError?.cause?.code === '23505'
    );
  }

  private async readMbiyoResponse<T = unknown>(
    res: Response,
  ): Promise<MbiyoResponseDetails<T>> {
    const payload = await this.parseMbiyoPayload<T>(res);
    const message = this.extractMbiyoMessage(payload, res.status);

    return {
      statusCode: res.status,
      responseStatus: payload?.status?.toLowerCase(),
      message,
      data: payload?.data,
      payload,
    };
  }

  private async parseMbiyoPayload<T = unknown>(
    res: Response,
  ): Promise<MbiyoApiEnvelope<T> | null> {
    try {
      return (await res.json()) as MbiyoApiEnvelope<T>;
    } catch {
      return null;
    }
  }

  private isMbiyoFailureStatus(status?: string | null): boolean {
    return status === 'error' || status === 'failed';
  }

  private extractMbiyoMessage(
    payload: MbiyoApiEnvelope<unknown> | null,
    statusCode: number,
  ): string {
    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    const amountMessage = this.extractAmountValidationMessage(payload?.data);
    if (amountMessage) {
      return amountMessage;
    }

    return `Erreur HTTP: ${statusCode}`;
  }

  private extractAmountValidationMessage(data: unknown): string | null {
    if (!data || typeof data !== 'object' || !('amount' in data)) {
      return null;
    }

    const amount = (data as { amount?: unknown }).amount;
    return Array.isArray(amount) && typeof amount[0] === 'string'
      ? amount[0]
      : null;
  }

  private normalizeMbiyoException(
    action: string,
    error: unknown,
  ): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    if (this.isMbiyoTimeoutError(error)) {
      return new ServiceUnavailableException(
        `${action} Mbiyo est temporairement indisponible (timeout).`,
      );
    }

    return new BadGatewayException(
      `${action} Service Mbiyo indisponible ou réponse upstream invalide.`,
    );
  }

  private createMbiyoHttpException(
    action: string,
    details: { statusCode?: number; message?: string },
  ): HttpException {
    const statusCode = details.statusCode;
    const message = details.message || 'Erreur Mbiyo inconnue.';

    switch (statusCode) {
      case 400:
      case 402:
      case 422:
        return new BadRequestException(`${action} ${message}`);
      case 404:
        return new NotFoundException(`${action} ${message}`);
      case 409:
        return new ConflictException(`${action} ${message}`);
      case 429:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new HttpException(`${action} ${message}`, 429);
      case 401:
      case 403:
        return new InternalServerErrorException(
          `${action} Configuration Mbiyo invalide ou permissions insuffisantes. ${message}`,
        );
      case 503:
        return new ServiceUnavailableException(
          `${action} Mbiyo est temporairement indisponible. ${message}`,
        );
      case 500:
      case 502:
      case 504:
        return new BadGatewayException(
          `${action} Erreur upstream Mbiyo. ${message}`,
        );
      default:
        return new BadGatewayException(
          `${action} Service Mbiyo indisponible ou réponse upstream invalide. ${message}`,
        );
    }
  }

  private isMbiyoTimeoutError(error: unknown): boolean {
    return (
      !!error &&
      typeof error === 'object' &&
      ((error as { name?: string }).name === 'AbortError' ||
        (error as { code?: string }).code === 'ABORT_ERR')
    );
  }

  private getErrorStatusCode(error: unknown): number | null {
    return error instanceof HttpException ? error.getStatus() : null;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }

    return 'Erreur inconnue';
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

    if (payment.status !== 'PENDING' && payment.status !== 'EXPIRED') {
      this.logger.warn(
        `⚠️ Payment ${payment.id} déjà traité (${payment.status}). Webhook ignoré.`,
      );
      return { received: true, processed: false, reason: 'already_processed' };
    }

    if (isMbiyoPaymentSuccessful(status)) {
      const verificationId = payment.mbiyoRef || transactionId || orderId;

      if (!verificationId) {
        this.logger.error(
          `❌ Vérification Mbiyo impossible: identifiant transaction manquant | paymentId=${payment.id} | order_id=${orderId}`,
        );
        return {
          received: true,
          processed: false,
          reason: 'verification_failed',
        };
      }

      let verified: VerifiedMbiyoTransactionStatus;
      try {
        verified = await this.verifyTransactionStatus(verificationId);
      } catch (error: unknown) {
        this.logger.error(
          `❌ Vérification Mbiyo échouée | paymentId=${payment.id} | transaction=${verificationId} | error=${this.getErrorMessage(error)}`,
        );
        return {
          received: true,
          processed: false,
          reason: 'verification_failed',
        };
      }

      if (!isMbiyoPaymentSuccessful(verified.status)) {
        this.logger.warn(
          `⚠️ Statut Mbiyo incohérent webhook/API | paymentId=${payment.id} | transaction=${verificationId} | webhook=${status} | api=${verified.status}`,
        );
        return {
          received: true,
          processed: false,
          reason: 'status_mismatch',
        };
      }

      const result = await this.confirmPaymentSuccess(payment, transactionId);

      if (result.outcome === 'conflict') {
        return {
          received: true,
          processed: false,
          reason: 'reconciliation_required',
        };
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
      throw new ForbiddenException(
        "Vous n'êtes pas le client de cette demande.",
      );
    }

    return this.prisma.payment.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async verifyTransactionStatus(
    transactionId: string,
  ): Promise<VerifiedMbiyoTransactionStatus> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(
        `${this.mbiyoApiUrl}/merchant/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.mbiyoApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        },
      );

      const response = await this.readMbiyoResponse<{
        status: string;
        transaction_id?: string;
      }>(res);

      if (!res.ok || this.isMbiyoFailureStatus(response.responseStatus)) {
        throw this.createMbiyoHttpException(
          'Impossible de verifier le statut de la transaction Mbiyo.',
          {
            statusCode: response.statusCode,
            message: response.message,
          },
        );
      }

      if (!response.data?.status) {
        throw new BadGatewayException(
          'Impossible de verifier le statut de la transaction Mbiyo. Reponse Mbiyo invalide: statut transaction manquant.',
        );
      }

      return {
        status: response.data.status,
        transactionId: response.data.transaction_id,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async confirmPaymentSuccess(
    payment: PaymentWithRequest,
    transactionId?: string | null,
  ): Promise<ConfirmPaymentSuccessOutcome> {
    const hasAssignedProvider = Boolean(payment.request.providerId);
    const newRequestStatus =
      payment.type === 'DEPOSIT'
        ? hasAssignedProvider
          ? RequestStatus.IN_PROGRESS
          : RequestStatus.ACCEPTED
        : RequestStatus.COMPLETED;

    try {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            mbiyoRef: transactionId || payment.mbiyoRef,
          },
        }),
        this.prisma.request.update({
          where: { id: payment.requestId },
          data: { status: newRequestStatus },
        }),
      ]);
    } catch (error: any) {
      if (!this.isActivePaymentUniqueConstraintError(error)) {
        throw error;
      }

      this.logger.error(
        `🚨 PAYMENT_RECONCILIATION_CONFLICT | paymentId=${payment.id} | mbiyoRef=${payment.mbiyoRef ?? transactionId ?? 'null'} | requestId=${payment.requestId} | amount=${payment.amount} ${payment.currency}`,
      );

      try {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'CONFLICT_NEEDS_REVIEW' },
        });
      } catch (updateError: unknown) {
        this.logger.error(
          `🚨 Impossible de marquer le paiement en conflit | paymentId=${payment.id} | error=${this.getErrorMessage(updateError)}`,
        );
      }

      await this.notifyAdminsPaymentReview(
        payment,
        'PAYMENT_RECONCILIATION_NEEDED',
        'Conflit de paiement à vérifier',
      );

      return { outcome: 'conflict' };
    }

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

    return { outcome: 'confirmed' };
  }

  async notifyAdminsPaymentReview(
    payment: Pick<
      Payment,
      'id' | 'requestId' | 'amount' | 'currency' | 'mbiyoRef'
    >,
    type: 'PAYMENT_RECONCILIATION_NEEDED' | 'PAYMENT_ABANDONED_NEEDS_REVIEW',
    title: string,
  ) {
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: Role.ADMIN },
        select: { id: true },
      });

      if (admins.length === 0) {
        this.logger.warn(
          `⚠️ Aucun administrateur trouvé pour notifier ${type} | paymentId=${payment.id}`,
        );
        return;
      }

      await this.prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title,
          message: `Vérification manuelle requise pour le paiement ${payment.id}. Demande: ${payment.requestId}. Montant: ${payment.amount} ${payment.currency}. Référence Mbiyo: ${payment.mbiyoRef ?? 'non renseignée'}.`,
          type,
          requestId: payment.requestId,
        })),
      });
    } catch (error: unknown) {
      this.logger.warn(
        `⚠️ Notification admin impossible pour ${type} | paymentId=${payment.id} | error=${this.getErrorMessage(error)}`,
      );
    }
  }
}
