import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { AdminRequestsController } from './admin-requests.controller';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';

const mockRequestsService = {
  create: jest.fn(),
  findMyRequests: jest.fn(),
  findOneForClient: jest.fn(),
  updateForClient: jest.fn(),
  removeForClient: jest.fn(),
  mockPaymentDeposit: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
};

describe('RequestsControllers', () => {
  let clientController: RequestsController;
  let adminController: AdminRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController, AdminRequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: mockRequestsService,
        },
      ],
    }).compile();

    clientController = module.get<RequestsController>(RequestsController);
    adminController = module.get<AdminRequestsController>(AdminRequestsController);
    jest.clearAllMocks();
  });

  describe('RequestsController (Client)', () => {
    it('create should call service', async () => {
      const dto: CreateRequestDto = { serviceId: 'uuid', description: 'd', address: 'a', scheduledAt: 'ds' };
      mockRequestsService.create.mockResolvedValue({ id: '1' });
      await expect(clientController.create('cid', dto)).resolves.toEqual({ id: '1' });
      expect(mockRequestsService.create).toHaveBeenCalledWith('cid', dto);
    });

    it('findMyRequests should call service', async () => {
      mockRequestsService.findMyRequests.mockResolvedValue([]);
      await expect(clientController.findMyRequests('cid')).resolves.toEqual([]);
      expect(mockRequestsService.findMyRequests).toHaveBeenCalledWith('cid');
    });

    it('findOne should call service', async () => {
      mockRequestsService.findOneForClient.mockResolvedValue({ id: '1' });
      await expect(clientController.findOne('1', 'cid')).resolves.toEqual({ id: '1' });
      expect(mockRequestsService.findOneForClient).toHaveBeenCalledWith('1', 'cid');
    });

    it('update should call service', async () => {
      mockRequestsService.updateForClient.mockResolvedValue({ id: '1' });
      await expect(clientController.update('1', 'cid', { address: 'a' })).resolves.toEqual({ id: '1' });
      expect(mockRequestsService.updateForClient).toHaveBeenCalledWith('1', 'cid', { address: 'a' });
    });

    it('remove should call service', async () => {
      mockRequestsService.removeForClient.mockResolvedValue({ id: '1' });
      await expect(clientController.remove('1', 'cid')).resolves.toEqual({ id: '1' });
      expect(mockRequestsService.removeForClient).toHaveBeenCalledWith('1', 'cid');
    });


  });

  describe('AdminRequestsController (Admin)', () => {
    it('findAll should call service', async () => {
      mockRequestsService.findAll.mockResolvedValue([]);
      await expect(adminController.findAll()).resolves.toEqual([]);
      expect(mockRequestsService.findAll).toHaveBeenCalled();
    });

    it('findOne should call service', async () => {
      mockRequestsService.findOne.mockResolvedValue({ id: '1' });
      await expect(adminController.findOne('1')).resolves.toEqual({ id: '1' });
      expect(mockRequestsService.findOne).toHaveBeenCalledWith('1');
    });

    it('approve should call service without price (price from Service)', async () => {
      mockRequestsService.approve.mockResolvedValue({ id: '1', price: 100 });
      await expect(adminController.approve('1')).resolves.toEqual({ id: '1', price: 100 });
      expect(mockRequestsService.approve).toHaveBeenCalledWith('1');
    });

    it('reject should call service', async () => {
      mockRequestsService.reject.mockResolvedValue({ id: '1' });
      await expect(adminController.reject('1')).resolves.toEqual({ id: '1' });
      expect(mockRequestsService.reject).toHaveBeenCalledWith('1');
    });
  });
});
