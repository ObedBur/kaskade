import { Test, TestingModule } from '@nestjs/testing';
import { ProviderController } from './provider.controller';
import { ProvidersService } from './providers.service';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';

const mockProvidersService = {
  findAvailableRequests: jest.fn(),
  acceptRequest: jest.fn(),
  rejectRequest: jest.fn(),
  completeRequest: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
};

describe('ProviderController', () => {
  let controller: ProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderController],
      providers: [
        {
          provide: ProvidersService,
          useValue: mockProvidersService,
        },
      ],
    }).compile();

    controller = module.get<ProviderController>(ProviderController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAvailableRequests', async () => {
    mockProvidersService.findAvailableRequests.mockResolvedValue([]);
    await expect(controller.findAvailableRequests('pid')).resolves.toEqual([]);
    expect(mockProvidersService.findAvailableRequests).toHaveBeenCalledWith('pid');
  });

  it('acceptRequest', async () => {
    mockProvidersService.acceptRequest.mockResolvedValue({ id: 'reqId' });
    await expect(controller.acceptRequest('reqId', 'pid')).resolves.toEqual({ id: 'reqId' });
    expect(mockProvidersService.acceptRequest).toHaveBeenCalledWith('reqId', 'pid');
  });

  it('rejectRequest', async () => {
    mockProvidersService.rejectRequest.mockResolvedValue({ message: 'ignored' });
    await expect(controller.rejectRequest('reqId', 'pid')).resolves.toEqual({ message: 'ignored' });
    expect(mockProvidersService.rejectRequest).toHaveBeenCalledWith('reqId', 'pid');
  });

  it('completeRequest', async () => {
    mockProvidersService.completeRequest.mockResolvedValue({ id: 'reqId' });
    await expect(controller.completeRequest('reqId', 'pid')).resolves.toEqual({ id: 'reqId' });
    expect(mockProvidersService.completeRequest).toHaveBeenCalledWith('reqId', 'pid');
  });

  it('getProfile', async () => {
    mockProvidersService.getProfile.mockResolvedValue({ id: 'pid' });
    await expect(controller.getProfile('pid')).resolves.toEqual({ id: 'pid' });
    expect(mockProvidersService.getProfile).toHaveBeenCalledWith('pid');
  });

  it('updateProfile', async () => {
    const dto: UpdateProviderProfileDto = { metier: 'Plombier' };
    mockProvidersService.updateProfile.mockResolvedValue({ id: 'pid', metier: 'Plombier' });
    await expect(controller.updateProfile('pid', dto)).resolves.toEqual({ id: 'pid', metier: 'Plombier' });
    expect(mockProvidersService.updateProfile).toHaveBeenCalledWith('pid', dto);
  });
});
