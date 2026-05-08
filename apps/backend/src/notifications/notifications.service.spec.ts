import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { NotificationType } from './notification-type.enum';

const mockPrismaService = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const data = { userId: 'u1', title: 't', message: 'm', type: NotificationType.AUTH_WELCOME };
      const expected = { id: '1', ...data };
      prisma.notification.create.mockResolvedValue(expected);
      const res = await service.createNotification(data);
      expect(res).toEqual(expected);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          requestId: undefined,
          serviceId: undefined,
          providerAppId: undefined,
        },
      });
    });
  });

  describe('createManyNotifications', () => {
    it('should create many notifications individually and return them', async () => {
      const data = [{ userId: 'u1', title: 't', message: 'm', type: NotificationType.AUTH_WELCOME }];
      const created = { id: 'n1', ...data[0] };
      prisma.notification.create.mockResolvedValue(created);
      const res = await service.createManyNotifications(data);
      expect(res).toEqual([created]);
      expect(prisma.notification.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllForUser', () => {
    it('should return paginated notifications for a user', async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);
      const res = await service.findAllForUser('u1');
      expect(res).toEqual({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: { request: true, service: true, providerApp: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('markAsRead', () => {
    it('throws NotFoundException if not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);
      await expect(service.markAsRead('n1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if user mismatch', async () => {
      prisma.notification.findUnique.mockResolvedValue({ userId: 'other' });
      await expect(service.markAsRead('n1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('updates and returns notification', async () => {
      prisma.notification.findUnique.mockResolvedValue({ id: 'n1', userId: 'u1' });
      prisma.notification.update.mockResolvedValue({ id: 'n1', isRead: true });
      const res = await service.markAsRead('n1', 'u1');
      expect(res).toEqual({ id: 'n1', isRead: true });
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n1' },
        data: { isRead: true },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread for user', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 2 });
      const res = await service.markAllAsRead('u1');
      expect(res).toEqual({ count: 2 });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', isRead: false },
        data: { isRead: true },
      });
    });
  });
});
