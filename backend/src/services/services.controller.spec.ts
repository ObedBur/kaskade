import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController, AdminServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';

const mockServicesService = {
  findAllActive: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ServicesControllers', () => {
  let publicController: ServicesController;
  let adminController: AdminServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController, AdminServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    publicController = module.get<ServicesController>(ServicesController);
    adminController = module.get<AdminServicesController>(AdminServicesController);
    jest.clearAllMocks();
  });

  describe('ServicesController (Public)', () => {
    it('findAllActive should call service', async () => {
      mockServicesService.findAllActive.mockResolvedValue([]);
      await expect(publicController.findAllActive()).resolves.toEqual([]);
      expect(mockServicesService.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('findOne should call service', async () => {
      mockServicesService.findOne.mockResolvedValue({ id: '1' });
      await expect(publicController.findOne('1')).resolves.toEqual({ id: '1' });
      expect(mockServicesService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('AdminServicesController (Admin)', () => {
    it('create should call service', async () => {
      const dto: CreateServiceDto = { name: 'n', category: 'c', price: 100 };
      mockServicesService.create.mockResolvedValue({ id: '1' });
      await expect(adminController.create(dto)).resolves.toEqual({ id: '1' });
      expect(mockServicesService.create).toHaveBeenCalledWith(dto);
    });

    it('findAll should call service', async () => {
      mockServicesService.findAll.mockResolvedValue([]);
      await expect(adminController.findAll()).resolves.toEqual([]);
      expect(mockServicesService.findAll).toHaveBeenCalledTimes(1);
    });

    it('update should call service', async () => {
      mockServicesService.update.mockResolvedValue({ id: '1' });
      await expect(adminController.update('1', { isActive: false })).resolves.toEqual({ id: '1' });
      expect(mockServicesService.update).toHaveBeenCalledWith('1', { isActive: false });
    });

    it('remove should call service', async () => {
      mockServicesService.remove.mockResolvedValue({ id: '1' });
      await expect(adminController.remove('1')).resolves.toEqual({ id: '1' });
      expect(mockServicesService.remove).toHaveBeenCalledWith('1');
    });
  });
});
