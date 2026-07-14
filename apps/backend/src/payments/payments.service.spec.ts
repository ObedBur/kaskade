import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RequestStatus } from '@prisma/client';

const mockPrismaService = {
  request: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockEventEmitter = { emit: jest.fn() };

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: string) => {
    const map: Record<string, string> = {
      MBIYO_API_URL: 'https://dashboard.mbiyo.africa/api/v1',
      MBIYO_SECRET_KEY: '',
      MBIYO_USE_MOCK: 'true',
      MBIYO_WEBHOOK_URL: 'http://localhost:4000/api/v1/payments/webhook/mbiyo',
    };
    return map[key] ?? defaultValue;
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
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('initiateDeposit', () => {
    it('throws NotFoundException if request not found', async () => {
      prisma.request.findUnique.mockResolvedValue(null);
      await expect(
        service.initiateDeposit(
          { requestId: 'r1', phoneNumber: '+243990000001', operator: 'AIRTEL' as any },
          'c1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if status is not payable', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.PENDING,
        service: { price: 100 },
      });
      await expect(
        service.initiateDeposit(
          { requestId: 'r1', phoneNumber: '+243990000001', operator: 'AIRTEL' as any },
          'c1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('sends the Mbiyo payin payload with the internal payment ID as order_id', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 'payment-1' });
      prisma.payment.update.mockResolvedValue({});

      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Payment initiated successfully',
          data: {
            transaction_id: 'mbiyo-transaction-1',
            amount: 50,
            currency: 'USD',
            order_id: 'payment-1',
            status: 'pending',
          },
        }),
      } as Response);

      const result = await service.initiateDeposit(
        {
          requestId: 'r1',
          phoneNumber: '+243990000001',
          operator: 'AIRTEL' as any,
        },
        'c1',
      );

      expect(result).toMatchObject({
        paymentId: 'payment-1',
        mbiyoRef: 'mbiyo-transaction-1',
      });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://dashboard.mbiyo.africa/api/v1/merchant/payin',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amount: 50,
            currency: 'USD',
            payment_method: 'mobile_money',
            order_id: 'payment-1',
            callback_url: 'http://localhost:4000/api/v1/payments/webhook/mbiyo',
            metadata: {
              network: 'airtel',
              phone_number: '+243990000001',
              country_code: 'CD',
            },
          }),
        }),
      );
    });
  });

  describe('handleMbiyoCallback', () => {
    it('returns processed false if payment not found', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      const res = await service.handleMbiyoCallback('missing', 'txn1', 'successful');
      expect(res.processed).toBe(false);
    });

    it('updates request on successful deposit webhook', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'PENDING',
        type: 'DEPOSIT',
        requestId: 'r1',
        request: { providerId: null },
        mbiyoRef: 'txn1',
      });
      prisma.$transaction.mockResolvedValue([]);

      const res = await service.handleMbiyoCallback('p1', 'txn1', 'successful');

      expect(res.processed).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.deposit_confirmed',
        expect.objectContaining({ requestId: 'r1' }),
      );
    });
  });
});
