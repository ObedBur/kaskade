@Post('webhook/mbiyo')
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
    this.logger.warn('⚠️ Signature webhook Mbiyo invalide.');
    throw new UnauthorizedException('Signature webhook invalide.');
  }

  this.logger.log('✅ Signature webhook Mbiyo vérifiée.');

  return this.paymentsService.handleMbiyoCallback(
    body.order_id ?? '',
    body.transaction_id,
    body.status,
  );
}
