import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Logger,
  Headers,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { MbiyoCallbackDto } from './dto/mbiyo-callback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as crypto from 'crypto';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  // ─── INITIER UN ACOMPTE (50%) VIA MBIYO PAY ────────────────────────────────
  // Le client choisit son opérateur et entre son numéro +243
  // → Déclenche un Push USSD sur son téléphone

  @Post('initiate/deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async initiateDeposit(
    @Body() dto: InitiatePaymentDto,
    @CurrentUser('id') clientId: string,
  ) {
    this.logger.log(
      `💳 CLIENT ${clientId} : Initiation acompte | Demande: ${dto.requestId} | Opérateur: ${dto.operator} | Tél: ${dto.phoneNumber}`,
    );
    return this.paymentsService.initiateDeposit(dto, clientId);
  }

  // ─── INITIER LE PAIEMENT FINAL (50%) VIA MBIYO PAY ─────────────────────────

  @Post('initiate/final')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async initiateFinalPayment(
    @Body() dto: InitiatePaymentDto,
    @CurrentUser('id') clientId: string,
  ) {
    this.logger.log(
      `💳 CLIENT ${clientId} : Initiation paiement final | Demande: ${dto.requestId} | Opérateur: ${dto.operator} | Tél: ${dto.phoneNumber}`,
    );
    return this.paymentsService.initiateFinalPayment(dto, clientId);
  }

  // ─── WEBHOOK MBIYO PAY (ROUTE PUBLIQUE) ─────────────────────────────────────
  // Cette route reçoit les notifications de confirmation/échec de Mbiyo Pay.
  // Elle est publique (pas de JWT) mais sécurisée par signature HMAC-SHA256.

  @Post('webhook/mbiyo')
  async handleMbiyoWebhook(
    @Body() body: MbiyoCallbackDto,
    @Headers('x-mbiyo-signature') signature: string,
    @Req() req: Request,
  ) {
    this.logger.log(`🔔 Webhook Mbiyo Pay reçu | Réf: ${body.reference} | Status: ${body.status}`);

    // ── Vérification de la signature HMAC-SHA256 ──────────────────────────
    const webhookSecret = this.configService.get<string>('MBIYO_WEBHOOK_SECRET', '');

    if (!webhookSecret) {
      this.logger.error('❌ MBIYO_WEBHOOK_SECRET non configuré !');
      throw new UnauthorizedException('Configuration webhook manquante.');
    }

    // Calculer la signature attendue à partir du body brut
    const rawBody = JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!signature || !crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    )) {
      this.logger.warn(`⚠️ Signature webhook invalide ! Reçue: ${signature?.substring(0, 16)}...`);
      throw new UnauthorizedException('Signature webhook invalide.');
    }

    this.logger.log('✅ Signature webhook vérifiée avec succès.');

    // ── Traitement du callback ────────────────────────────────────────────
    return this.paymentsService.handleMbiyoCallback(
      body.reference,
      body.status,
      body.transactionId,
    );
  }

  // ─── CONSULTER LE STATUT D'UN PAIEMENT ─────────────────────────────────────

  @Get('status/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async getPaymentStatus(
    @Param('paymentId') paymentId: string,
    @CurrentUser('id') clientId: string,
  ) {
    return this.paymentsService.getPaymentStatus(paymentId, clientId);
  }

  // ─── HISTORIQUE DES PAIEMENTS D'UNE DEMANDE ────────────────────────────────

  @Get('request/:requestId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async getPaymentsByRequest(
    @Param('requestId') requestId: string,
    @CurrentUser('id') clientId: string,
  ) {
    return this.paymentsService.getPaymentsByRequest(requestId, clientId);
  }
}
