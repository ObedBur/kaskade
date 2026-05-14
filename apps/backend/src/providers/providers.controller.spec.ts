import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ApplyProviderDto } from './dto/apply-provider.dto';

const mockProvidersService = {
  apply: jest.fn(),
  findMyApplication: jest.fn(),
};

describe('ProvidersController', () => {
  let controller: ProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [
        {
          provide: ProvidersService,
          useValue: mockProvidersService,
        },
      ],
    }).compile();

    controller = module.get<ProvidersController>(ProvidersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('apply should call service apply', async () => {
    const dto: ApplyProviderDto = { motivation: 'I want to work' };
    mockProvidersService.apply.mockResolvedValue({ id: 'app-id' });
    await expect(controller.apply('u-id', dto)).resolves.toEqual({ id: 'app-id' });
    expect(mockProvidersService.apply).toHaveBeenCalledWith('u-id', dto);
  });

  it('myApplication should call service findMyApplication', async () => {
    mockProvidersService.findMyApplication.mockResolvedValue({ id: 'app-id' });
    await expect(controller.myApplication('u-id')).resolves.toEqual({ id: 'app-id' });
    expect(mockProvidersService.findMyApplication).toHaveBeenCalledWith('u-id');
  });
});
