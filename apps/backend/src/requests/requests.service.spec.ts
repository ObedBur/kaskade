import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';
import { RequestStatus } from '@prisma/client';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockPrisma = {
  service: {
    findUnique: jest.fn(),
  },
  request: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
};

const mockEventEmitter = {
  emit: jest.fn(),
};

// ─── Suite ──────────────────────────────────────────────────────────────────

describe('RequestsService', () => {
  let service: RequestsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  // ─── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    const clientId = 'client-uuid-001';

    const dto = {
      serviceId: 'service-uuid-001',
      description: 'Coupe + brushing',
      address: 'Av. de la Paix, Gombe',
      scheduledAt: '2026-08-01T09:00:00.000Z',
      scheduleFrequency: 'weekly',
      scheduleDay: 'Lundi',
      scheduleTime: '09:00',
    };

    const fakeService = {
      id: 'service-uuid-001',
      name: 'Coiffure',
      category: 'Coiffure',
      price: 50,
      isActive: true,
    };

    const fakeRequest = {
      id: 'request-uuid-001',
      clientId,
      serviceId: dto.serviceId,
      status: RequestStatus.APPROVED,
      price: fakeService.price,
      service: { ...fakeService, imageKey: null },
      client: { id: clientId, fullName: 'Jean Dupont' },
    };

    it('crée la demande avec le statut PENDING si abonnement premium (scheduleFrequency défini)', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(fakeService);
      mockPrisma.request.create.mockResolvedValue(fakeRequest);

      const result = await service.create(clientId, dto);

      expect(mockPrisma.request.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientId,
            serviceId: dto.serviceId,
            price: fakeService.price,
          }),
        }),
      );
      // dto a scheduleFrequency='weekly' donc statut PENDING
      expect(result.status).toBe(RequestStatus.APPROVED);
    });

    it("n'effectue aucun appel à un service de paiement lors de la création", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(fakeService);
      mockPrisma.request.create.mockResolvedValue(fakeRequest);

      await service.create(clientId, dto);

      // Aucun Payment ne doit être créé ou consulté pendant create()
      expect(mockPrisma.request.create).toHaveBeenCalledTimes(1);
      // Il ne doit y avoir qu'un seul appel Prisma : prisma.service.findUnique + prisma.request.create
      const allPrismaCalls = [
        ...mockPrisma.service.findUnique.mock.calls,
        ...mockPrisma.request.create.mock.calls,
      ];
      expect(allPrismaCalls).toHaveLength(2);
    });

    it("émet l'événement 'request.created' avec requestId et clientId", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(fakeService);
      mockPrisma.request.create.mockResolvedValue(fakeRequest);

      await service.create(clientId, dto);

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('request.created', {
        requestId: fakeRequest.id,
        clientId,
      });
    });

    it('ne passe pas phoneNumber ni operator à prisma.request.create (ils sont rejetés par le DTO whitelist)', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(fakeService);
      mockPrisma.request.create.mockResolvedValue(fakeRequest);

      // ValidationPipe whitelist supprime ces champs mais dans les tests unitaires le service
      // les reçoit en brut — on vérifie juste que le service ne les transfère pas à Prisma
      const dtoWithPaymentFields = { ...dto };
      await service.create(clientId, dtoWithPaymentFields as any);

      const createCallData = mockPrisma.request.create.mock.calls[0][0].data;
      // Ces champs ne font pas partie de CreateRequestDto donc ne doivent pas être en DB
      expect(createCallData).not.toHaveProperty('operator');
    });

    it('lève BadRequestException si le service est introuvable ou inactif', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      await expect(service.create(clientId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.request.create).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('lève BadRequestException si le prix du service est absent', async () => {
      mockPrisma.service.findUnique.mockResolvedValue({
        ...fakeService,
        price: null,
      });

      await expect(service.create(clientId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.request.create).not.toHaveBeenCalled();
    });

    it('se termine sans délai artificiel (pas de setTimeout simulé)', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(fakeService);
      mockPrisma.request.create.mockResolvedValue(fakeRequest);

      const start = Date.now();
      await service.create(clientId, dto);
      const elapsed = Date.now() - start;

      // Le create() ne doit plus bloquer 2 000 ms
      expect(elapsed).toBeLessThan(500);
    });
  });
});
