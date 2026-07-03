import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatus } from '@prisma/client';
import { PaymentCurrency, PaymentOperator } from './dto/initiate-payment.dto';

const mockPrismaService = {
  request: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
};

const mockEventEmitter = { emit: jest.fn() };

const mockConfigService = {
  get: jest.fn((key: string, fallback?: string) => {
    const values: Record<string, string> = {
      MBIYO_API_URL: 'https://dashboard.mbiyo.africa/api',
      MBIYO_API_KEY: 'test-api-key',
      MBIYO_WEBHOOK_URL: 'https://example.com/api/v1/payments/webhook/mbiyo',
    };
    return values[key] ?? fallback;
  }),
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get(PrismaService) as typeof mockPrismaService;
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  it('initiates a RDC Payin with Mbiyo metadata and MPESA mapped to vodacom', async () => {
    prisma.request.findUnique.mockResolvedValue({
      id: 'request-1',
      clientId: 'client-1',
      status: RequestStatus.ACCEPTED,
      price: 10,
      service: { price: 10 },
    });
    prisma.payment.create.mockResolvedValue({
      id: 'payment-1',
      requestId: 'request-1',
      clientId: 'client-1',
      amount: 5,
      currency: 'USD',
      operator: 'MPESA',
      phoneNumber: '243810000000',
      type: 'DEPOSIT',
      status: 'PENDING',
    });
    prisma.payment.update.mockResolvedValue({});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        status: 'success',
        data: {
          transaction_id: 'CI-123',
          amount: 5,
          currency: 'USD',
          order_id: 'payment-1',
          status: 'pending',
        },
      }),
    });

    const response = await service.initiateDeposit(
      {
        requestId: '550e8400-e29b-41d4-a716-446655440000',
        phoneNumber: '+243810000000',
        operator: PaymentOperator.MPESA,
        currency: PaymentCurrency.USD,
      },
      'client-1',
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://dashboard.mbiyo.africa/api/v1/merchant/payin',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          amount: 5,
          currency: 'USD',
          payment_method: 'mobile_money',
          order_id: 'payment-1',
          callback_url: 'https://example.com/api/v1/payments/webhook/mbiyo',
          metadata: {
            phone_number: '243810000000',
            network: 'vodacom',
            country_code: 'CD',
          },
        }),
      }),
    );
    expect(response).toEqual(
      expect.objectContaining({
        paymentId: 'payment-1',
        mbiyoRef: 'CI-123',
        status: 'PENDING',
      }),
    );
  });

  it('processes a successful Mbiyo webhook and starts the request', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: 'payment-1',
      requestId: 'request-1',
      clientId: 'client-1',
      amount: 5,
      currency: 'USD',
      type: 'DEPOSIT',
      status: 'PENDING',
      mbiyoRef: 'CI-123',
      request: { id: 'request-1' },
    });
    prisma.payment.update.mockResolvedValue({});
    prisma.request.update.mockResolvedValue({});

    const response = await service.handleMbiyoCallback({
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
    });

    expect(prisma.request.update).toHaveBeenCalledWith({
      where: { id: 'request-1' },
      data: { status: RequestStatus.IN_PROGRESS },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'payment.deposit_confirmed',
      expect.objectContaining({
        requestId: 'request-1',
        paymentId: 'payment-1',
      }),
    );
    expect(response).toEqual({ received: true, processed: true, status: 'SUCCESS' });
  });
});
