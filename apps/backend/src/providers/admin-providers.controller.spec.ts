import { Test, TestingModule } from '@nestjs/testing';
import { AdminProvidersController } from './admin-providers.controller';
import { ProvidersService } from './providers.service';
import { AssignServicesDto } from './dto/assign-services.dto';

const mockProvidersService = {
  findAllApplications: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
  assignServices: jest.fn(),
  removeService: jest.fn(),
};

describe('AdminProvidersController', () => {
  let controller: AdminProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProvidersController],
      providers: [
        {
          provide: ProvidersService,
          useValue: mockProvidersService,
        },
      ],
    }).compile();

    controller = module.get<AdminProvidersController>(AdminProvidersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllApplications should return applications', async () => {
    mockProvidersService.findAllApplications.mockResolvedValue([]);
    await expect(controller.findAllApplications()).resolves.toEqual([]);
    expect(mockProvidersService.findAllApplications).toHaveBeenCalled();
  });

  it('approve should call service approve', async () => {
    mockProvidersService.approve.mockResolvedValue({ status: 'APPROVED' });
    await expect(controller.approve('app-id')).resolves.toEqual({ status: 'APPROVED' });
    expect(mockProvidersService.approve).toHaveBeenCalledWith('app-id');
  });

  it('reject should call service reject', async () => {
    mockProvidersService.reject.mockResolvedValue({ status: 'REJECTED' });
    await expect(controller.reject('app-id')).resolves.toEqual({ status: 'REJECTED' });
    expect(mockProvidersService.reject).toHaveBeenCalledWith('app-id');
  });

  it('assignServices should call service assignServices', async () => {
    const dto: AssignServicesDto = { serviceIds: ['uuid1'] };
    mockProvidersService.assignServices.mockResolvedValue({ id: 'p-id' });
    await expect(controller.assignServices('p-id', dto)).resolves.toEqual({ id: 'p-id' });
    expect(mockProvidersService.assignServices).toHaveBeenCalledWith('p-id', dto);
  });

  it('removeService should call service removeService', async () => {
    mockProvidersService.removeService.mockResolvedValue({ id: 'p-id' });
    await expect(controller.removeService('p-id', 's-id')).resolves.toEqual({ id: 'p-id' });
    expect(mockProvidersService.removeService).toHaveBeenCalledWith('p-id', 's-id');
  });
});
