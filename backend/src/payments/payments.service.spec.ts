import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RequestStatus } from '@prisma/client';

const mockPrismaService = {
  request: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockEventEmitter = { emit: jest.fn() };

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let eventEmitter: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
    jest.clearAllMocks();
  });

  // ─── mockDeposit ─────────────────────────────────────────────────────────

  describe('mockDeposit (Acompte 50%)', () => {
    it('throws NotFoundException if request not found', async () => {
      prisma.request.findUnique.mockResolvedValue(null);
      await expect(service.mockDeposit('r1', 'c1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if client does not own request', async () => {
      prisma.request.findUnique.mockResolvedValue({ clientId: 'other', status: RequestStatus.ACCEPTED });
      await expect(service.mockDeposit('r1', 'c1')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if status is not ACCEPTED', async () => {
      prisma.request.findUnique.mockResolvedValue({ clientId: 'c1', status: RequestStatus.APPROVED });
      await expect(service.mockDeposit('r1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('updates to IN_PROGRESS, emits event and returns deposit info', async () => {
      prisma.request.findUnique.mockResolvedValue({
        id: 'r1', clientId: 'c1', status: RequestStatus.ACCEPTED, price: 120,
      });
      prisma.request.update.mockResolvedValue({ id: 'r1', status: RequestStatus.IN_PROGRESS });

      const res = await service.mockDeposit('r1', 'c1');

      expect(res.depositPaid).toBe(60);
      expect(res.remaining).toBe(60);
      expect(prisma.request.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { status: RequestStatus.IN_PROGRESS },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.deposit_confirmed', { requestId: 'r1' });
    });
  });

  // ─── mockFinalPayment ────────────────────────────────────────────────────

  describe('mockFinalPayment (Solde 50%)', () => {
    it('throws NotFoundException if request not found', async () => {
      prisma.request.findUnique.mockResolvedValue(null);
      await expect(service.mockFinalPayment('r1', 'c1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if client does not own request', async () => {
      prisma.request.findUnique.mockResolvedValue({ clientId: 'other', status: RequestStatus.AWAITING_FINAL });
      await expect(service.mockFinalPayment('r1', 'c1')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if status is not AWAITING_FINAL', async () => {
      prisma.request.findUnique.mockResolvedValue({ clientId: 'c1', status: RequestStatus.IN_PROGRESS });
      await expect(service.mockFinalPayment('r1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('updates to COMPLETED, emits event and returns final payment info', async () => {
      prisma.request.findUnique.mockResolvedValue({
        id: 'r1', clientId: 'c1', status: RequestStatus.AWAITING_FINAL, price: 120,
      });
      prisma.request.update.mockResolvedValue({ id: 'r1', status: RequestStatus.COMPLETED });

      const res = await service.mockFinalPayment('r1', 'c1');

      expect(res.finalPaid).toBe(60);
      expect(res.totalPaid).toBe(120);
      expect(prisma.request.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { status: RequestStatus.COMPLETED },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.final_confirmed', { requestId: 'r1' });
    });
  });
});
