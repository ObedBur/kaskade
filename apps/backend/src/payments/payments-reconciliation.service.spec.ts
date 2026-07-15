import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsReconciliationService } from './payments-reconciliation.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';

const mockPrismaService = {
  payment: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

const mockPaymentsService = {
  confirmPaymentSuccess: jest.fn(),
  notifyAdminsPaymentReview: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: string) => {
    const map: Record<string, string> = {
      MBIYO_API_URL: 'https://dashboard.mbiyo.africa/api/v1',
      MBIYO_SECRET_KEY: 'test-key',
    };
    return map[key] ?? defaultValue;
  }),
};

describe('PaymentsReconciliationService', () => {
  let service: PaymentsReconciliationService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsReconciliationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsReconciliationService>(
      PaymentsReconciliationService,
    );
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('confirms a successful expired Mbiyo payment', async () => {
    const payment = {
      id: 'p1',
      mbiyoRef: 'txn1',
      status: 'EXPIRED',
      createdAt: new Date(),
      request: { providerId: null },
    };
    prisma.payment.findMany
      .mockResolvedValueOnce([payment])
      .mockResolvedValueOnce([]);
    mockPaymentsService.confirmPaymentSuccess.mockResolvedValue({
      outcome: 'confirmed',
    });
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'success',
        data: { transaction_id: 'txn1', status: 'successful' },
      }),
    } as Response);

    await service.reconcileExpiredPayments();

    expect(mockPaymentsService.confirmPaymentSuccess).toHaveBeenCalledWith(
      payment,
      'txn1',
    );
  });

  it('marks failed or cancelled Mbiyo payments as FAILED', async () => {
    prisma.payment.findMany
      .mockResolvedValueOnce([
        {
          id: 'p1',
          mbiyoRef: 'txn1',
          status: 'EXPIRED',
          createdAt: new Date(),
          request: { providerId: null },
        },
      ])
      .mockResolvedValueOnce([]);
    prisma.payment.update.mockResolvedValue({});
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'success',
        data: { transaction_id: 'txn1', status: 'cancelled' },
      }),
    } as Response);

    await service.reconcileExpiredPayments();

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { status: 'FAILED' },
    });
  });

  it('abandons unresolved expired payments older than 48h', async () => {
    const payment = {
      id: 'p-old',
      requestId: 'r1',
      mbiyoRef: 'txn-old',
      amount: 50,
      currency: 'USD',
    };
    prisma.payment.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([payment]);
    prisma.payment.update.mockResolvedValue({});

    await service.reconcileExpiredPayments();

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'p-old' },
      data: { status: 'ABANDONED' },
    });
    expect(mockPaymentsService.notifyAdminsPaymentReview).toHaveBeenCalledWith(
      payment,
      'PAYMENT_ABANDONED_NEEDS_REVIEW',
      'Paiement abandonné à vérifier',
    );
  });
});
