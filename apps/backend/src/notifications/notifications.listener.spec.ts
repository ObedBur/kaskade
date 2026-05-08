import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsListener } from './notifications.listener';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

const mockNotificationsService = {
  createNotification: jest.fn().mockResolvedValue({ id: 'n1', userId: 'u1', title: 't', message: 'm', type: 'type', isRead: false, createdAt: new Date() }),
  createManyNotifications: jest.fn().mockResolvedValue([{ id: 'n1', userId: 'u1', title: 't', message: 'm', type: 'type', isRead: false, createdAt: new Date() }]),
};

const mockNotificationsGateway = {
  sendToUser: jest.fn(),
  sendToUsers: jest.fn(),
};

const mockPrismaService = {
  user: {
    findMany: jest.fn(),
  },
  request: {
    findUnique: jest.fn(),
  },
};

describe('NotificationsListener', () => {
  let listener: NotificationsListener;
  let notificationsService: any;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsListener,
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    listener = module.get<NotificationsListener>(NotificationsListener);
    notificationsService = module.get(NotificationsService);
    prisma = module.get(PrismaService);
    
    // Silence logger during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  it('handleAuthRegistered', async () => {
    mockNotificationsService.createNotification.mockResolvedValue({ id: 'n1', userId: 'u1' });
    await listener.handleAuthRegistered({ userId: 'u1' });
    expect(notificationsService.createNotification).toHaveBeenCalled();
  });

  describe('Provider Application', () => {
    it('handleProviderApplied targets admins and client', async () => {
      mockNotificationsService.createNotification.mockResolvedValue({ id: 'n1', userId: 'u1' });
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n2', userId: 'admin1' }]);
      prisma.user.findMany.mockResolvedValue([{ id: 'admin1' }]);
      await listener.handleProviderApplied({ userId: 'u1', applicationId: 'app1' });
      expect(notificationsService.createNotification).toHaveBeenCalled();
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });

    it('handleProviderApplicationResolved - APPROVED', async () => {
      mockNotificationsService.createNotification.mockResolvedValue({ id: 'n1', userId: 'u1' });
      await listener.handleProviderApplicationResolved({ userId: 'u1', status: 'APPROVED', applicationId: 'app1' });
      expect(notificationsService.createNotification).toHaveBeenCalled();
      expect(notificationsService.createNotification.mock.calls[0][0].title).toContain('Acceptée');
    });

    it('handleProviderApplicationResolved - REJECTED', async () => {
      mockNotificationsService.createNotification.mockResolvedValue({ id: 'n1', userId: 'u1' });
      await listener.handleProviderApplicationResolved({ userId: 'u1', status: 'REJECTED', applicationId: 'app1' });
      expect(notificationsService.createNotification).toHaveBeenCalled();
      expect(notificationsService.createNotification.mock.calls[0][0].title).toContain('Refusée');
    });
  });

  describe('Service Management', () => {
    it('handleServiceCreated with clients', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'c1' }]);
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n1', userId: 'c1' }]);
      await listener.handleServiceCreated({ serviceId: 's1', serviceName: 'Serv' });
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });

    it('handleServiceCreated without clients', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      await listener.handleServiceCreated({ serviceId: 's1', serviceName: 'Serv' });
      expect(notificationsService.createManyNotifications).not.toHaveBeenCalled();
    });

    it('handleServiceUpdated', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'user1' }]);
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n1', userId: 'user1' }]);
      await listener.handleServiceUpdated({ serviceId: 's1', serviceName: 'Serv' });
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });

    it('handleServiceUpdated without users', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      await listener.handleServiceUpdated({ serviceId: 's1', serviceName: 'Serv' });
      expect(notificationsService.createManyNotifications).not.toHaveBeenCalled();
    });
  });

  describe('Request Workflow', () => {
    it('handleRequestCreated', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'admin1' }]);
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n1', userId: 'admin1' }]);
      await listener.handleRequestCreated({ requestId: 'r1', clientId: 'c1' });
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });

    it('handleRequestApproved with providers', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n1', userId: 'p1' }]);
      await listener.handleRequestApproved({ requestId: 'r1', serviceId: 's1' });
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });

    it('handleRequestApproved without providers', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      await listener.handleRequestApproved({ requestId: 'r1', serviceId: 's1' });
      expect(notificationsService.createManyNotifications).not.toHaveBeenCalled();
    });

    it('handleRequestAccepted', async () => {
      mockNotificationsService.createNotification.mockResolvedValue({ id: 'n1', userId: 'c1' });
      prisma.user.findMany.mockResolvedValue([{ id: 'admin1' }]);
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n2', userId: 'admin1' }]);
      await listener.handleRequestAccepted({ requestId: 'r1', clientId: 'c1', providerId: 'p1' });
      expect(notificationsService.createNotification).toHaveBeenCalled();
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });

    it('handleRequestRejected', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'admin1' }]);
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n1', userId: 'admin1' }]);
      await listener.handleRequestRejected({ requestId: 'r1', providerId: 'p1' });
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });
  });

  describe('Payment and Completion', () => {
    it('handlePaymentConfirmed', async () => {
      prisma.request.findUnique.mockResolvedValue({ id: 'r1', providerId: 'p1' });
      mockNotificationsService.createNotification.mockResolvedValue({ id: 'n1', userId: 'p1' });
      prisma.user.findMany.mockResolvedValue([{ id: 'admin1' }]);
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n2', userId: 'admin1' }]);
      await listener.handlePaymentConfirmed({ requestId: 'r1' });
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });

    it('handleRequestCompleted', async () => {
      prisma.request.findUnique.mockResolvedValue({ id: 'r1', clientId: 'c1' });
      mockNotificationsService.createNotification.mockResolvedValue({ id: 'n1', userId: 'c1' });
      prisma.user.findMany.mockResolvedValue([{ id: 'admin1' }]);
      mockNotificationsService.createManyNotifications.mockResolvedValue([{ id: 'n2', userId: 'admin1' }]);
      await listener.handleRequestCompleted({ requestId: 'r1', providerId: 'p1' });
      expect(notificationsService.createManyNotifications).toHaveBeenCalled();
    });
  });
});
