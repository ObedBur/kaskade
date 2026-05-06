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

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly mbiyoApiUrl: string;
  private readonly mbiyoPublicKey: string;
  private readonly mbiyoSecretKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    this.mbiyoApiUrl = this.configService.get<string>('MBIYO_API_URL', 'https://api.mbiyopay.com/v1');
    this.mbiyoPublicKey = this.configService.get<string>('MBIYO_PUBLIC_KEY', '');
    this.mbiyoSecretKey = this.configService.get<string>('MBIYO_SECRET_KEY', '');
  }

  // ─── INITIER UN PAIEMENT (ACOMPTE 50%) ──────────────────────────────────────

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

    if (request.status !== RequestStatus.ACCEPTED) {
      throw new BadRequestException(
        "L'acompte ne peut être versé que lorsqu'un prestataire a accepté la mission (statut ACCEPTED).",
      );
    }

    // Utiliser le prix négocié si défini, sinon utiliser le prix catalogue du service
    const basePrice = request.price || request.service.price;
    const depositAmount = basePrice ? basePrice * 0.5 : 0;

    if (depositAmount <= 0) {
      throw new BadRequestException('Le montant de l\'acompte est invalide (le service n\'a pas de prix).');
    }

    return this.initiateCollect({
      requestId: dto.requestId,
      clientId,
      amount: depositAmount,
      currency: dto.currency || 'USD',
      operator: dto.operator,
      phoneNumber: dto.phoneNumber,
      type: 'DEPOSIT',
    });
  }

  // ─── INITIER LE PAIEMENT FINAL (50%) ────────────────────────────────────────

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
      currency: dto.currency || 'USD',
      operator: dto.operator,
      phoneNumber: dto.phoneNumber,
      type: 'FINAL',
    });
  }

  // ─── APPEL API MBIYO PAY (COLLECT / PUSH USSD) ─────────────────────────────

  private async initiateCollect(params: {
    requestId: string;
    clientId: string;
    amount: number;
    currency: string;
    operator: string;
    phoneNumber: string;
    type: 'DEPOSIT' | 'FINAL';
  }) {
    // 1. Créer l'entrée Payment en base (statut PENDING)
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
      `💳 Payment créé [${payment.id}] | Type: ${params.type} | Montant: ${params.amount} ${params.currency} | Opérateur: ${params.operator} | Tél: ${params.phoneNumber}`,
    );

    // 2. Appeler l'API Mbiyo Pay pour déclencher le Push USSD
    try {
      const mbiyoPayload = {
        amount: params.amount,
        currency: params.currency,
        phone: params.phoneNumber,
        operator: params.operator.toLowerCase(), // Mbiyo attend en minuscule
        reference: payment.id, // Notre ID comme référence interne
        description: `Kaskade - ${params.type === 'DEPOSIT' ? 'Acompte 50%' : 'Paiement final 50%'}`,
        callback_url: this.configService.get<string>('MBIYO_WEBHOOK_URL', 'https://api.kaskade.com/payments/webhook/mbiyo'),
      };

      this.logger.log(`📡 Envoi vers Mbiyo Pay API: ${this.mbiyoApiUrl}/collect`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      let responseData: any;
      let resOk = true;

      // Si les clés d'API sont des placeholders (test local sans vraies clés), on simule la réponse
      if (this.mbiyoPublicKey.includes('test_votre_cle')) {
        this.logger.warn(`⚠️ Clés Mbiyo Pay de test détectées. Simulation de la collecte pour ${mbiyoPayload.phone}.`);
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1500));
        responseData = {
          reference: `mock_ref_${Date.now()}`,
          message: 'Collecte initiée avec succès (Mock)'
        };

        // Simuler le fait que le client valide sur son téléphone après 5 secondes
        setTimeout(async () => {
          this.logger.log(`⚠️ Simulation: Le client a validé sur son téléphone. Mise à jour PENDING -> SUCCESS.`);
          await this.handleMbiyoCallback(responseData.reference, 'SUCCESS', 'mock_txn_' + Date.now());
        }, 5000);

      } else {
        const res = await fetch(`${this.mbiyoApiUrl}/collect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.mbiyoSecretKey}`,
            'X-Public-Key': this.mbiyoPublicKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mbiyoPayload),
          signal: controller.signal,
        });
        
        responseData = await res.json();
        resOk = res.ok;

        if (!resOk) {
          throw new Error(responseData.message || `Erreur HTTP: ${res.status}`);
        }
      }

      clearTimeout(timeoutId);

      const mbiyoRef = responseData?.reference || responseData?.transaction_id;

      // 3. Enregistrer la référence Mbiyo Pay
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { mbiyoRef },
      });

      this.logger.log(`✅ Mbiyo Pay a accepté la collecte. Réf: ${mbiyoRef} | Push USSD envoyé au ${params.phoneNumber}`);

      return {
        message: `Push USSD envoyé au ${params.phoneNumber}. Veuillez confirmer le paiement sur votre téléphone.`,
        paymentId: payment.id,
        mbiyoRef,
        amount: params.amount,
        currency: params.currency,
        status: 'PENDING',
      };

    } catch (error: any) {
      // En cas d'échec de l'appel API, marquer le payment comme FAILED
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      const errorMessage = error?.message || 'Erreur inconnue';
      this.logger.error(`❌ Échec appel Mbiyo Pay: ${errorMessage}`);

      throw new InternalServerErrorException(
        `Impossible d'initier le paiement Mobile Money. ${errorMessage}`,
      );
    }
  }

  // ─── TRAITEMENT DU WEBHOOK MBIYO PAY ────────────────────────────────────────

  async handleMbiyoCallback(reference: string, status: string, transactionId?: string) {
    this.logger.log(`🔔 Webhook Mbiyo Pay reçu | Réf: ${reference} | Status: ${status}`);

    // Chercher le payment par mbiyoRef
    const payment = await this.prisma.payment.findUnique({
      where: { mbiyoRef: reference },
      include: { request: true },
    });

    if (!payment) {
      this.logger.warn(`⚠️ Webhook ignoré: Aucun payment trouvé pour la référence ${reference}`);
      return { received: true, processed: false };
    }

    // Éviter le double traitement
    if (payment.status !== 'PENDING') {
      this.logger.warn(`⚠️ Payment ${payment.id} déjà traité (status: ${payment.status}). Webhook ignoré.`);
      return { received: true, processed: false, reason: 'already_processed' };
    }

    const isSuccess = status.toUpperCase() === 'SUCCESS';

    if (isSuccess) {
      // ─── PAIEMENT CONFIRMÉ : Transaction atomique ───────────────────────
      const newRequestStatus =
        payment.type === 'DEPOSIT' ? RequestStatus.IN_PROGRESS : RequestStatus.COMPLETED;

      await this.prisma.$transaction([
        // Mettre à jour le Payment
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        }),
        // Mettre à jour le statut de la Request
        this.prisma.request.update({
          where: { id: payment.requestId },
          data: { status: newRequestStatus },
        }),
      ]);

      this.logger.log(
        `✅ Paiement ${payment.type} confirmé pour la demande ${payment.requestId}. Nouveau statut: ${newRequestStatus}`,
      );

      // Émettre les événements pour les notifications
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

    } else {
      // ─── PAIEMENT ÉCHOUÉ ────────────────────────────────────────────────
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      this.logger.warn(`❌ Paiement ${payment.type} échoué pour la demande ${payment.requestId}`);

      this.eventEmitter.emit('payment.failed', {
        requestId: payment.requestId,
        paymentId: payment.id,
        type: payment.type,
      });
    }

    return { received: true, processed: true, status: isSuccess ? 'SUCCESS' : 'FAILED' };
  }

  // ─── CONSULTER LE STATUT D'UN PAIEMENT ─────────────────────────────────────

  async getPaymentStatus(paymentId: string, clientId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (payment.clientId !== clientId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à consulter ce paiement.");
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

  // ─── HISTORIQUE DES PAIEMENTS D'UNE DEMANDE ────────────────────────────────

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
