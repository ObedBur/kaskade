import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const mockNotificationsService = {
  findAllForUser: jest.fn(),
  markAllAsRead: jest.fn(),
  markAsRead: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service findAllForUser', async () => {
    mockNotificationsService.findAllForUser.mockResolvedValue([]);
    await expect(controller.findAll('u1')).resolves.toEqual([]);
    expect(mockNotificationsService.findAllForUser).toHaveBeenCalledWith('u1');
  });

  it('markAllAsRead should call service markAllAsRead', async () => {
    mockNotificationsService.markAllAsRead.mockResolvedValue({ count: 1 });
    await expect(controller.markAllAsRead('u1')).resolves.toEqual({ count: 1 });
    expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith('u1');
  });

  it('markAsRead should call service markAsRead', async () => {
    mockNotificationsService.markAsRead.mockResolvedValue({ id: 'n1' });
    await expect(controller.markAsRead('n1', 'u1')).resolves.toEqual({ id: 'n1' });
    expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith('n1', 'u1');
  });
});
