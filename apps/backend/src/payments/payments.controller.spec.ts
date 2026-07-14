import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';

const mockPaymentsService = {
  initiateDeposit: jest.fn(),
  initiateFinalPayment: jest.fn(),
};

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('initiateDeposit delegates to service', async () => {
    mockPaymentsService.initiateDeposit.mockResolvedValue({ paymentId: 'p1' });
    const dto = { requestId: 'r1' } as any;
    const res = await controller.initiateDeposit(dto, 'c1');
    expect(res).toEqual({ paymentId: 'p1' });
    expect(mockPaymentsService.initiateDeposit).toHaveBeenCalledWith(dto, 'c1');
  });

  it('initiateFinalPayment delegates to service', async () => {
    mockPaymentsService.initiateFinalPayment.mockResolvedValue({ paymentId: 'p1' });
    const dto = { requestId: 'r1' } as any;
    const res = await controller.initiateFinalPayment(dto, 'c1');
    expect(res).toEqual({ paymentId: 'p1' });
    expect(mockPaymentsService.initiateFinalPayment).toHaveBeenCalledWith(dto, 'c1');
  });
});
