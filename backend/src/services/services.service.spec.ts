import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  service: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockStorageService = {
  getPublicUrl: jest.fn((imageKey: string | null) => imageKey ? `https://cdn.kaskade.com/services/${imageKey}` : null),
  isValidImageKey: jest.fn((imageKey: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(imageKey)),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('ServicesService', () => {
  let service: ServicesService;
  let prisma: any;
  let storageService: any;
  let eventEmitter: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    prisma = module.get(PrismaService);
    storageService = module.get(StorageService);
    eventEmitter = module.get(EventEmitter2);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('throws ConflictException if service exists', async () => {
      prisma.service.findFirst.mockResolvedValue({ id: '1' });
      await expect(service.create({ name: 'test', category: 'cat', price: 100 })).rejects.toThrow(ConflictException);
      expect(prisma.service.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: 'test', mode: 'insensitive' },
          category: { equals: 'cat', mode: 'insensitive' },
        },
      });
    });

    it('throws BadRequestException if imageKey is invalid', async () => {
      prisma.service.findFirst.mockResolvedValue(null);
      storageService.isValidImageKey.mockReturnValue(false);
      await expect(service.create({ name: 'test2', category: 'cat', price: 100, imageKey: 'invalid.txt' })).rejects.toThrow(BadRequestException);
    });

    it('creates service and emits event if not exists', async () => {
      const mockService = {
        id: '2',
        name: 'test2',
        category: 'cat',
        description: null,
        price: 100,
        isActive: true,
        imageKey: 'service-123.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.service.findFirst.mockResolvedValue(null);
      prisma.service.create.mockResolvedValue(mockService);
      const res = await service.create({ name: 'test2', category: 'cat', price: 100, imageKey: 'service-123.jpg' });
      expect(res).toEqual({
        id: '2',
        name: 'test2',
        category: 'cat',
        description: null,
        price: 100,
        isActive: true,
        imageUrl: 'https://cdn.kaskade.com/services/service-123.jpg',
        createdAt: mockService.createdAt,
        updatedAt: mockService.updatedAt,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('service.created', { serviceId: '2', serviceName: 'test2' });
    });
  });

  describe('findAll', () => {
    it('returns all ordered by category and name with imageUrl', async () => {
      const mockServices = [
        {
          id: '1',
          name: 'Service1',
          category: 'cat1',
          description: null,
          price: 100,
          isActive: true,
          imageKey: 'service-1.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      prisma.service.findMany.mockResolvedValue(mockServices);
      const res = await service.findAll();
      expect(res).toHaveLength(1);
      expect(res[0]).toHaveProperty('imageUrl', 'https://cdn.kaskade.com/services/service-1.jpg');
      expect(res[0]).not.toHaveProperty('imageKey');
      expect(prisma.service.findMany).toHaveBeenCalledWith({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });
  });

  describe('findAllActive', () => {
    it('returns all active ordered with imageUrl', async () => {
      const mockServices = [
        {
          id: '1',
          name: 'Service1',
          category: 'cat1',
          description: null,
          price: 100,
          isActive: true,
          imageKey: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      prisma.service.findMany.mockResolvedValue(mockServices);
      const res = await service.findAllActive();
      expect(res).toHaveLength(1);
      expect(res[0]).toHaveProperty('imageUrl', null);
      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException if not found', async () => {
      prisma.service.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('returns service with imageUrl if found', async () => {
      const mockService = {
        id: '1',
        name: 'Service1',
        category: 'cat1',
        description: 'desc',
        price: 100,
        isActive: true,
        imageKey: 'service-1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.service.findUnique.mockResolvedValue(mockService);
      const res = await service.findOne('1');
      expect(res).toHaveProperty('imageUrl', 'https://cdn.kaskade.com/services/service-1.jpg');
      expect(res).not.toHaveProperty('imageKey');
      expect(res.name).toEqual('Service1');
    });
  });

  describe('update', () => {
    it('throws NotFoundException via findOne if not found', async () => {
      prisma.service.findUnique.mockResolvedValue(null);
      await expect(service.update('1', { isActive: false })).rejects.toThrow(NotFoundException);
      expect(prisma.service.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException if imageKey is invalid', async () => {
      prisma.service.findUnique.mockResolvedValue({ id: '1' });
      storageService.isValidImageKey.mockReturnValue(false);
      await expect(service.update('1', { imageKey: 'invalid.txt' })).rejects.toThrow(BadRequestException);
    });

    it('updates service and emits event with imageUrl', async () => {
      const mockService = {
        id: '1',
        name: 'updated',
        category: 'cat1',
        description: null,
        price: 100,
        isActive: true,
        imageKey: 'service-updated.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.service.findUnique.mockResolvedValue(mockService);
      prisma.service.update.mockResolvedValue(mockService);
      const res = await service.update('1', { isActive: false });
      expect(res).toHaveProperty('imageUrl', 'https://cdn.kaskade.com/services/service-updated.jpg');
      expect(prisma.service.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { isActive: false } });
      expect(eventEmitter.emit).toHaveBeenCalledWith('service.updated', { serviceId: '1', serviceName: 'updated' });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException via findOne if not found', async () => {
      prisma.service.findUnique.mockResolvedValue(null);
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      expect(prisma.service.delete).not.toHaveBeenCalled();
    });

    it('removes service if found and returns it with imageUrl', async () => {
      const mockService = {
        id: '1',
        name: 'removed',
        category: 'cat1',
        description: null,
        price: 100,
        isActive: true,
        imageKey: 'service-removed.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.service.findUnique.mockResolvedValue(mockService);
      prisma.service.delete.mockResolvedValue(mockService);
      const res = await service.remove('1');
      expect(res).toHaveProperty('imageUrl', 'https://cdn.kaskade.com/services/service-removed.jpg');
      expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
