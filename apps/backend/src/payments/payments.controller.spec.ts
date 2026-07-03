import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentCurrency, PaymentOperator } from './dto/initiate-payment.dto';
import * as crypto from 'crypto';

const mockPaymentsService = {
  initiateDeposit: jest.fn(),
  initiateFinalPayment: jest.fn(),
  handleMbiyoCallback: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => (key === 'MBIYO_WEBHOOK_SECRET' ? 'secret' : '')),
};

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    jest.clearAllMocks();
  });

  it('delegates deposit initiation to the service', async () => {
    const dto = {
      requestId: '550e8400-e29b-41d4-a716-446655440000',
      phoneNumber: '+243971111111',
      operator: PaymentOperator.AIRTEL,
      currency: PaymentCurrency.USD,
    };
    mockPaymentsService.initiateDeposit.mockResolvedValue({ paymentId: 'p1' });

    await expect(controller.initiateDeposit(dto, 'client-1')).resolves.toEqual({
      paymentId: 'p1',
    });
    expect(mockPaymentsService.initiateDeposit).toHaveBeenCalledWith(dto, 'client-1');
  });

  it('verifies Mbiyo Signature and delegates webhook payload', async () => {
    const body = {
      transaction_id: 'CI-123',
      amount: 5,
      currency: 'USD',
      order_id: 'payment-1',
      status: 'successful',
      metadata: {
        country_code: 'CD',
        phone_number: '243971111111',
        network: 'airtel',
      },
    };
    const signature = crypto
      .createHmac('sha256', 'secret')
      .update(JSON.stringify(body))
      .digest('hex');

    mockPaymentsService.handleMbiyoCallback.mockResolvedValue({
      received: true,
      processed: true,
      status: 'SUCCESS',
    });

    await expect(
      controller.handleMbiyoWebhook(body, signature, {
        rawBody: Buffer.from(JSON.stringify(body)),
      } as any),
    ).resolves.toEqual({
      received: true,
      processed: true,
      status: 'SUCCESS',
    });
    expect(mockPaymentsService.handleMbiyoCallback).toHaveBeenCalledWith(body);
  });
});
