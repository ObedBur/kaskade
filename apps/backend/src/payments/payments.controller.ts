import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Logger,
  Headers,
  Req,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { FinalizePaymentDto } from './dto/finalize-payment.dto';
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

  @Post('initiate/deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async initiateDeposit(
    @Body() dto: InitiatePaymentDto,
    @CurrentUser('id') clientId: string,
  ) {
    this.logger.log(
      `CLIENT ${clientId} : Acompte | Demande ${dto.requestId} | ${dto.operator} | ${dto.phoneNumber}`,
    );

    return this.paymentsService.initiateDeposit(dto, clientId);
  }

  @Post('initiate/final')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async initiateFinalPayment(
    @Body() dto: InitiatePaymentDto,
    @CurrentUser('id') clientId: string,
  ) {
    this.logger.log(
      `💳 CLIENT ${clientId} : Solde final | Demande ${dto.requestId} | ${dto.operator}`,
    );

    return this.paymentsService.initiateFinalPayment(dto, clientId);
  }

  @Post('finalize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async finalizePayment(
    @Body() dto: FinalizePaymentDto,
    @CurrentUser('id') clientId: string,
  ) {
    return this.paymentsService.finalizePayment(
      dto.paymentId,
      dto.otp,
      clientId,
    );
  }

  /**
   * Webhook Mbiyo Pay.
   * Mbiyo exige un statut 200 explicite : tout code différent (y compris
   * 201, renvoyé par défaut par Nest sur une route POST) est traité comme
   * un échec et déclenche un retry côté Mbiyo.
   * @see https://dashboard.mbiyo.africa/docs/guide/webhook
   */
  @Post('webhook/mbiyo')
  @HttpCode(200)
  async handleMbiyoWebhook(
    @Body() body: MbiyoCallbackDto,
    @Headers('signature') signatureHeader: string,
    @Req() req: Request,
  ) {
    this.logger.log('========== WEBHOOK MBIYO REÇU ==========');
    this.logger.log(`Signature reçue : ${signatureHeader ?? '(aucune)'}`);
    this.logger.log('Payload :');
    this.logger.log(JSON.stringify(body, null, 2));

    const webhookSecret = this.configService.get<string>(
      'MBIYO_WEBHOOK_SECRET',
      '',
    );

    const rawBody =
      (req as Request & { rawBody?: Buffer }).rawBody?.toString('utf8') ??
      JSON.stringify(body);

    this.logger.log('Raw Body :');
    this.logger.log(rawBody);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    this.logger.log(`Signature attendue : ${expectedSignature}`);

    const received = (signatureHeader || '').trim();

    let valid = false;

    if (received.length === expectedSignature.length) {
      valid = crypto.timingSafeEqual(
        Buffer.from(received, 'utf8'),
        Buffer.from(expectedSignature, 'utf8'),
      );
    }

    this.logger.log(`Signature valide : ${valid}`);

    if (!valid) {
      this.logger.warn('Signature webhook Mbiyo invalide.');
      throw new UnauthorizedException('Signature webhook invalide.');
    }

    this.logger.log('Signature webhook Mbiyo vérifiée.');

    return this.paymentsService.handleMbiyoCallback(
      body.order_id ?? '',
      body.transaction_id,
      body.status,
    );
  }

  @Get('status/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async getPaymentStatus(
    @Param('paymentId') paymentId: string,
    @CurrentUser('id') clientId: string,
  ) {
    return this.paymentsService.getPaymentStatus(paymentId, clientId);
  }

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
