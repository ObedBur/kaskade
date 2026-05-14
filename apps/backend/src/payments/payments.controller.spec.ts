import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

const mockPaymentsService = {
  mockDeposit: jest.fn(),
  mockFinalPayment: jest.fn(),
};

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('mockDeposit delegates to service', async () => {
    mockPaymentsService.mockDeposit.mockResolvedValue({ depositPaid: 60 });
    const res = await controller.mockDeposit({ requestId: 'r1' }, 'c1');
    expect(res).toEqual({ depositPaid: 60 });
    expect(mockPaymentsService.mockDeposit).toHaveBeenCalledWith('r1', 'c1');
  });

  it('mockFinalPayment delegates to service', async () => {
    mockPaymentsService.mockFinalPayment.mockResolvedValue({ finalPaid: 60 });
    const res = await controller.mockFinalPayment({ requestId: 'r1' }, 'c1');
    expect(res).toEqual({ finalPaid: 60 });
    expect(mockPaymentsService.mockFinalPayment).toHaveBeenCalledWith('r1', 'c1');
  });
});
