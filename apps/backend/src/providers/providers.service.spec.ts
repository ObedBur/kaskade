import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RequestStatus, Role, Status } from '@prisma/client';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  providerApplication: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  request: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('ProvidersService', () => {
  let service: ProvidersService;
  let prisma: any;
  let eventEmitter: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
    prisma = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
    jest.clearAllMocks();
  });

  describe('apply', () => {
    it('throws NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.apply('uid', { motivation: 'mot' })).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if already PROVIDER', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER });
      await expect(service.apply('uid', { motivation: 'mot' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if already has pending app', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.CLIENT });
      prisma.providerApplication.findFirst.mockResolvedValue({ id: 'app1' });
      await expect(service.apply('uid', { motivation: 'mot' })).rejects.toThrow(BadRequestException);
    });

    it('creates application and emits event', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.CLIENT });
      prisma.providerApplication.findFirst.mockResolvedValue(null);
      prisma.providerApplication.create.mockResolvedValue({ id: 'app1' });
      
      const res = await service.apply('uid', { motivation: 'mot' });
      expect(res).toEqual({ id: 'app1' });
      expect(eventEmitter.emit).toHaveBeenCalledWith('provider.applied', { userId: 'uid' });
    });
  });

  describe('approve', () => {
    it('throws NotFoundException if application not found', async () => {
      prisma.providerApplication.findUnique.mockResolvedValue(null);
      await expect(service.approve('app1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if application is not pending', async () => {
      prisma.providerApplication.findUnique.mockResolvedValue({ status: RequestStatus.APPROVED });
      await expect(service.approve('app1')).rejects.toThrow(BadRequestException);
    });

    it('approves application, updates role, and emits event', async () => {
      prisma.providerApplication.findUnique.mockResolvedValue({ 
        status: RequestStatus.PENDING, userId: 'uid', user: { email: 'test@test.com' } 
      });
      prisma.providerApplication.update.mockResolvedValue({ status: RequestStatus.APPROVED });
      
      const res = await service.approve('app1');
      expect(res).toEqual({ status: RequestStatus.APPROVED });
      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'uid' }, data: { role: Role.PROVIDER } });
      expect(eventEmitter.emit).toHaveBeenCalledWith('provider.application.resolved', { userId: 'uid', status: 'APPROVED' });
    });
  });

  describe('reject', () => {
    it('throws NotFoundException if application not found', async () => {
      prisma.providerApplication.findUnique.mockResolvedValue(null);
      await expect(service.reject('app1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if application is not pending', async () => {
      prisma.providerApplication.findUnique.mockResolvedValue({ status: RequestStatus.REJECTED });
      await expect(service.reject('app1')).rejects.toThrow(BadRequestException);
    });

    it('rejects application and emits event', async () => {
      prisma.providerApplication.findUnique.mockResolvedValue({ 
        status: RequestStatus.PENDING, userId: 'uid', user: { email: 'test@test.com' } 
      });
      prisma.providerApplication.update.mockResolvedValue({ status: RequestStatus.REJECTED });
      
      const res = await service.reject('app1');
      expect(res).toEqual({ status: RequestStatus.REJECTED });
      expect(eventEmitter.emit).toHaveBeenCalledWith('provider.application.resolved', { userId: 'uid', status: 'REJECTED' });
    });
  });

  describe('assignServices', () => {
    it('throws BadRequestException if user is not PROVIDER', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.CLIENT });
      await expect(service.assignServices('pid', { serviceIds: ['sid'] })).rejects.toThrow(BadRequestException);
    });

    it('updates user with assigned services', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER });
      prisma.user.update.mockResolvedValue({ id: 'pid' });
      const res = await service.assignServices('pid', { serviceIds: ['sid'] });
      expect(res).toEqual({ id: 'pid' });
    });
  });

  describe('findAllApplications & findMyApplication', () => {
    it('findAllApplications returns data', async () => {
      prisma.providerApplication.findMany.mockResolvedValue([]);
      const res = await service.findAllApplications();
      expect(res).toEqual([]);
    });

    it('findMyApplication returns data', async () => {
      prisma.providerApplication.findFirst.mockResolvedValue({ id: 'app1' });
      const res = await service.findMyApplication('uid');
      expect(res).toEqual({ id: 'app1' });
    });
  });

  describe('removeService', () => {
    it('throws req mismatch if not PROVIDER', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.removeService('pid', 'sid')).rejects.toThrow(BadRequestException);
    });

    it('disconnects service', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER });
      prisma.user.update.mockResolvedValue({ id: 'pid' });
      const res = await service.removeService('pid', 'sid');
      expect(res).toEqual({ id: 'pid' });
    });
  });

  describe('findAvailableRequests', () => {
    it('throws BadRequestException if not PROVIDER', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findAvailableRequests('pid')).rejects.toThrow(BadRequestException);
    });

    it('returns requests for provider services', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER, services: [{ id: 's1' }] });
      prisma.request.findMany.mockResolvedValue([{ id: 'r1' }]);
      const res = await service.findAvailableRequests('pid');
      expect(res).toEqual([{ id: 'r1' }]);
    });
  });

  describe('acceptRequest', () => {
    it('throws if not PROVIDER', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.acceptRequest('rid', 'pid')).rejects.toThrow(BadRequestException);
    });

    it('throws if EN_MISSION', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER, status: Status.EN_MISSION });
      await expect(service.acceptRequest('rid', 'pid')).rejects.toThrow(BadRequestException);
    });

    it('throws if request not found', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER, status: Status.DISPONIBLE, services: [{ id: 's1' }] });
      prisma.request.findUnique.mockResolvedValue(null);
      await expect(service.acceptRequest('rid', 'pid')).rejects.toThrow(NotFoundException);
    });

    it('throws if request not APPROVED', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER, status: Status.DISPONIBLE, services: [{ id: 's1' }] });
      prisma.request.findUnique.mockResolvedValue({ status: RequestStatus.IN_PROGRESS });
      await expect(service.acceptRequest('rid', 'pid')).rejects.toThrow(BadRequestException);
    });

    it('throws if provider cannot handle service', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER, status: Status.DISPONIBLE, services: [{ id: 's1' }] });
      prisma.request.findUnique.mockResolvedValue({ status: RequestStatus.APPROVED, serviceId: 's2' });
      await expect(service.acceptRequest('rid', 'pid')).rejects.toThrow(BadRequestException);
    });

    it('accepts request via transaction and emits event', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER, status: Status.DISPONIBLE, services: [{ id: 's1' }] });
      prisma.request.findUnique.mockResolvedValue({ status: RequestStatus.APPROVED, serviceId: 's1', clientId: 'cid', id: 'rid' });
      prisma.$transaction.mockResolvedValue([{ id: 'rid', clientId: 'cid' }]);

      const res = await service.acceptRequest('rid', 'pid');
      expect(res).toEqual({ id: 'rid', clientId: 'cid' });
      expect(eventEmitter.emit).toHaveBeenCalledWith('request.accepted', { requestId: 'rid', clientId: 'cid', providerId: 'pid' });
    });
  });

  describe('rejectRequest', () => {
    it('throws if request not found', async () => {
      prisma.request.findUnique.mockResolvedValue(null);
      await expect(service.rejectRequest('rid', 'pid')).rejects.toThrow(NotFoundException);
    });

    it('rejects and emits event', async () => {
      prisma.request.findUnique.mockResolvedValue({ id: 'rid' });
      const res = await service.rejectRequest('rid', 'pid');
      expect(res).toEqual({ message: 'Demande ignorée avec succès' });
      expect(eventEmitter.emit).toHaveBeenCalledWith('request.rejected', { requestId: 'rid', providerId: 'pid' });
    });
  });

  describe('completeRequest', () => {
    it('throws if request not found', async () => {
      prisma.request.findUnique.mockResolvedValue(null);
      await expect(service.completeRequest('rid', 'pid')).rejects.toThrow(NotFoundException);
    });

    it('throws if providerId mismatch', async () => {
      prisma.request.findUnique.mockResolvedValue({ providerId: 'other' });
      await expect(service.completeRequest('rid', 'pid')).rejects.toThrow(BadRequestException);
    });

    it('throws if request not IN_PROGRESS (acompte non versé)', async () => {
      prisma.request.findUnique.mockResolvedValue({ providerId: 'pid', status: RequestStatus.ACCEPTED });
      await expect(service.completeRequest('rid', 'pid')).rejects.toThrow(BadRequestException);
    });

    it('completes request via transaction → AWAITING_FINAL', async () => {
      prisma.request.findUnique.mockResolvedValue({ providerId: 'pid', status: RequestStatus.IN_PROGRESS, id: 'rid' });
      prisma.$transaction.mockResolvedValue([{ id: 'rid' }]);
      const res = await service.completeRequest('rid', 'pid');
      expect(res).toEqual({ id: 'rid' });
      expect(eventEmitter.emit).toHaveBeenCalled();
    });
  });

  describe('getProfile / updateProfile', () => {
    it('throws if user is not PROVIDER in getProfile', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('pid')).rejects.toThrow(NotFoundException);
    });

    it('returns filtered profile', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER, password: 'pw', refreshToken: 'rt', bio: 'x', services: [] });
      const res = await service.getProfile('pid');
      expect((res as any).password).toBeUndefined();
      expect((res as any).refreshToken).toBeUndefined();
      expect((res as any).bio).toEqual('x');
    });

    it('updateProfile throws if not PROVIDER', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.updateProfile('pid', {})).rejects.toThrow(NotFoundException);
    });

    it('updateProfile succeeds', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: Role.PROVIDER });
      prisma.user.update.mockResolvedValue({ id: 'pid' });
      const res = await service.updateProfile('pid', { bio: 'new' });
      expect(res).toEqual({ id: 'pid' });
    });
  });
});
