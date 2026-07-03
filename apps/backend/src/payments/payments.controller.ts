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

  @Post('initiate/deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async initiateDeposit(
    @Body() dto: InitiatePaymentDto,
    @CurrentUser('id') clientId: string,
  ) {
    this.logger.log(
      `CLIENT ${clientId}: initiation acompte | request=${dto.requestId} | operator=${dto.operator}`,
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
      `CLIENT ${clientId}: initiation paiement final | request=${dto.requestId} | operator=${dto.operator}`,
    );
    return this.paymentsService.initiateFinalPayment(dto, clientId);
  }

  @Post('webhook/mbiyo')
  async handleMbiyoWebhook(
    @Body() body: MbiyoCallbackDto,
    @Headers('signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log(
      `Webhook Mbiyo recu | order_id=${body.order_id} | transaction_id=${body.transaction_id} | status=${body.status}`,
    );

    const webhookSecret = this.configService.get<string>('MBIYO_WEBHOOK_SECRET', '');

    if (!webhookSecret) {
      this.logger.error('MBIYO_WEBHOOK_SECRET non configure.');
      throw new UnauthorizedException('Configuration webhook manquante.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody || Buffer.from(JSON.stringify(body)))
      .digest('hex');

    const signatureBuffer = Buffer.from(signature || '', 'hex');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');

    if (
      !signature ||
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      this.logger.warn(`Signature webhook invalide: ${signature?.substring(0, 16)}...`);
      throw new UnauthorizedException('Signature webhook invalide.');
    }

    return this.paymentsService.handleMbiyoCallback(body);
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
