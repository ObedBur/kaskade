import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  TooManyRequestsException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RequestStatus } from '@prisma/client';

const mockPrismaService = {
  user: {
    findMany: jest.fn(),
  },
  notification: {
    createMany: jest.fn(),
  },
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
      MBIYO_SECRET_KEY: 'test-key',
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
    jest.restoreAllMocks();
    jest.clearAllMocks();
    prisma.user.findMany.mockResolvedValue([]);
    prisma.notification.createMany.mockResolvedValue({ count: 0 });
  });

  describe('initiateDeposit', () => {
    it('throws NotFoundException if request not found', async () => {
      prisma.request.findUnique.mockResolvedValue(null);
      await expect(
        service.initiateDeposit(
          {
            requestId: 'r1',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
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
          {
            requestId: 'r1',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('blocks a recent pending deposit for the same request', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'pending-payment',
          createdAt: new Date(),
        });

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r1',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.payment.create).not.toHaveBeenCalled();
    });

    it('expires an old pending deposit and allows a new attempt', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'old-pending-payment',
          createdAt: new Date(Date.now() - 6 * 60 * 1000),
        });
      prisma.payment.update.mockResolvedValue({});
      prisma.payment.create.mockResolvedValue({ id: 'payment-1' });

      jest.spyOn(global, 'fetch').mockResolvedValue({
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

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r1',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).resolves.toMatchObject({ paymentId: 'payment-1' });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'old-pending-payment' },
        data: { status: 'EXPIRED' },
      });
    });

    it('returns a clean BadRequestException on active payment unique constraint', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r1',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
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

    it('uses the request currency when CDF is stored and dto.currency is absent', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 8000,
        currency: 'CDF',
        service: { price: 8000 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 'payment-cdf' });
      prisma.payment.update.mockResolvedValue({});

      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Payment initiated successfully',
          data: {
            transaction_id: 'mbiyo-cdf-transaction',
            amount: 4000,
            currency: 'CDF',
            order_id: 'payment-cdf',
            status: 'pending',
          },
        }),
      } as Response);

      const result = await service.initiateDeposit(
        {
          requestId: 'r-cdf',
          phoneNumber: '+243990000001',
          operator: 'AIRTEL' as any,
        },
        'c1',
      );

      expect(result).toMatchObject({ amount: 4000, currency: 'CDF' });
      expect(prisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 4000,
            currency: 'CDF',
          }),
        }),
      );
      expect(
        JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string),
      ).toMatchObject({
        amount: 4000,
        currency: 'CDF',
        order_id: 'payment-cdf',
      });
    });

    it('rejects dto.currency when it differs from the request currency', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 8000,
        currency: 'CDF',
        service: { price: 8000 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r-cdf',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
            currency: 'USD' as any,
          },
          'c1',
        ),
      ).rejects.toThrow('Devise invalide : cette demande est en CDF.');
      expect(prisma.payment.create).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('maps a Mbiyo 400 validation error to BadRequestException and marks payment as failed', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 'payment-400' });
      prisma.payment.update.mockResolvedValue({});
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          status: 'failed',
          message: 'Phone number is invalid',
          data: null,
        }),
      } as Response);

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r-400',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-400' },
        data: { status: 'FAILED' },
      });
    });

    it('maps a Mbiyo 401 error to InternalServerErrorException', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 'payment-401' });
      prisma.payment.update.mockResolvedValue({});
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          status: 'failed',
          message: 'Unauthorized',
          data: null,
        }),
      } as Response);

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r-401',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('maps a Mbiyo 429 error to TooManyRequestsException', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 'payment-429' });
      prisma.payment.update.mockResolvedValue({});
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          status: 'failed',
          message: 'Too many requests',
          data: null,
        }),
      } as Response);

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r-429',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).rejects.toThrow(TooManyRequestsException);
    });

    it('maps a Mbiyo 503 error to ServiceUnavailableException', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 'payment-503' });
      prisma.payment.update.mockResolvedValue({});
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          status: 'failed',
          message: 'Service unavailable',
          data: null,
        }),
      } as Response);

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r-503',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('maps a fetch timeout to ServiceUnavailableException', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.APPROVED,
        price: 100,
        currency: 'USD',
        service: { price: 100 },
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 'payment-timeout' });
      prisma.payment.update.mockResolvedValue({});
      jest.spyOn(global, 'fetch').mockRejectedValue({
        name: 'AbortError',
        message: 'The operation was aborted',
      });

      await expect(
        service.initiateDeposit(
          {
            requestId: 'r-timeout',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('initiateFinalPayment', () => {
    it('uses USD when the request has no stored currency and dto.currency is absent', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.AWAITING_FINAL,
        price: 100,
        currency: null,
      });
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 'payment-final-usd' });
      prisma.payment.update.mockResolvedValue({});

      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Payment initiated successfully',
          data: {
            transaction_id: 'mbiyo-usd-transaction',
            amount: 50,
            currency: 'USD',
            order_id: 'payment-final-usd',
            status: 'pending',
          },
        }),
      } as Response);

      const result = await service.initiateFinalPayment(
        {
          requestId: 'r-usd',
          phoneNumber: '+243990000001',
          operator: 'AIRTEL' as any,
        },
        'c1',
      );

      expect(result).toMatchObject({ amount: 50, currency: 'USD' });
      expect(
        JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string),
      ).toMatchObject({
        amount: 50,
        currency: 'USD',
        order_id: 'payment-final-usd',
      });
    });

    it('blocks a recent pending final payment for the same request', async () => {
      prisma.request.findUnique.mockResolvedValue({
        clientId: 'c1',
        status: RequestStatus.AWAITING_FINAL,
        price: 100,
        currency: 'USD',
      });
      prisma.payment.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'pending-final-payment',
          createdAt: new Date(),
        });

      await expect(
        service.initiateFinalPayment(
          {
            requestId: 'r1',
            phoneNumber: '+243990000001',
            operator: 'AIRTEL' as any,
          },
          'c1',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.payment.create).not.toHaveBeenCalled();
    });
  });

  describe('handleMbiyoCallback', () => {
    it('returns processed false if payment not found', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      const res = await service.handleMbiyoCallback(
        'missing',
        'txn1',
        'successful',
      );
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
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          data: { transaction_id: 'txn1', status: 'successful' },
        }),
      } as Response);

      const res = await service.handleMbiyoCallback('p1', 'txn1', 'successful');

      expect(res.processed).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.deposit_confirmed',
        expect.objectContaining({ requestId: 'r1' }),
      );
    });

    it('accepts a successful webhook for an expired payment', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'EXPIRED',
        type: 'DEPOSIT',
        requestId: 'r1',
        request: { providerId: null },
        mbiyoRef: 'txn1',
        amount: 50,
        currency: 'USD',
      });
      prisma.$transaction.mockResolvedValue([]);
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          data: { transaction_id: 'txn1', status: 'successful' },
        }),
      } as Response);

      const res = await service.handleMbiyoCallback('p1', 'txn1', 'successful');

      expect(res).toMatchObject({ received: true, processed: true });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('marks payment for review and returns processed false on success conflict', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'EXPIRED',
        type: 'DEPOSIT',
        requestId: 'r1',
        request: { providerId: null },
        mbiyoRef: 'txn1',
        amount: 50,
        currency: 'USD',
      });
      prisma.$transaction.mockRejectedValue({ code: 'P2002' });
      prisma.payment.update.mockResolvedValue({});
      prisma.user.findMany.mockResolvedValue([{ id: 'admin-1' }]);
      prisma.notification.createMany.mockResolvedValue({ count: 1 });
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          data: { transaction_id: 'txn1', status: 'successful' },
        }),
      } as Response);

      const res = await service.handleMbiyoCallback('p1', 'txn1', 'successful');

      expect(res).toEqual({
        received: true,
        processed: false,
        reason: 'reconciliation_required',
      });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { status: 'CONFLICT_NEEDS_REVIEW' },
      });
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            userId: 'admin-1',
            type: 'PAYMENT_RECONCILIATION_NEEDED',
            requestId: 'r1',
          }),
        ],
      });
    });
  });

  describe('finalizePayment', () => {
    it('maps Invalid OTP from Mbiyo to BadRequestException', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-finalize',
        clientId: 'c1',
        mbiyoRef: 'txn-finalize',
      });
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          status: 'failed',
          message: 'Invalid OTP',
          data: null,
        }),
      } as Response);

      await expect(
        service.finalizePayment('payment-finalize', '123456', 'c1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('maps a Mbiyo 403 finalize error to InternalServerErrorException', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-finalize-403',
        clientId: 'c1',
        mbiyoRef: 'txn-finalize-403',
      });
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          status: 'failed',
          message: 'Forbidden',
          data: null,
        }),
      } as Response);

      await expect(
        service.finalizePayment('payment-finalize-403', '123456', 'c1'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
