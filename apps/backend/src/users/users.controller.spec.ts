import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOneSafe: jest.fn(),
  update: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user returning 201 (indirectly via return value and metadata)', async () => {
      const dto = { email: 'new@test.com', password: 'pwd', fullName: 'Test', phone: '123', quartier: 'qt' };
      const expectedOutput = { id: '1', ...dto };
      mockUsersService.create.mockResolvedValue(expectedOutput);

      const result = await controller.create(dto);
      expect(result).toEqual(expectedOutput);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users for admin', async () => {
      const expectedUsers = [{ id: '1', email: 'admin@test.com', fullName: 'Admin' }];
      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();
      
      expect(result).toEqual(expectedUsers);
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const expectedUser = { id: '1', email: 'a@a.com' };
      mockUsersService.findOneSafe.mockResolvedValue(expectedUser);

      const result = await controller.findOne('1');
      expect(result).toEqual(expectedUser);
      expect(mockUsersService.findOneSafe).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException (404) if user is not found', async () => {
      mockUsersService.findOneSafe.mockResolvedValue(null);

      await expect(controller.findOne('non-existing-id')).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findOneSafe).toHaveBeenCalledWith('non-existing-id');
    });
  });

  describe('update', () => {
    it('should update and return the user if found', async () => {
      mockUsersService.findOneSafe.mockResolvedValue({ id: '1' });
      const expectedUpdate = { id: '1', fullName: 'Updated' };
      mockUsersService.update.mockResolvedValue(expectedUpdate);

      const dto = { fullName: 'Updated' };
      const result = await controller.update('1', dto);

      expect(result).toEqual(expectedUpdate);
      expect(mockUsersService.findOneSafe).toHaveBeenCalledWith('1');
      expect(mockUsersService.update).toHaveBeenCalledWith('1', dto);
    });

    it('should throw NotFoundException (404) before updating if user is not found', async () => {
      mockUsersService.findOneSafe.mockResolvedValue(null);

      const dto = { fullName: 'Updated' };
      await expect(controller.update('non-existing-id', dto)).rejects.toThrow(NotFoundException);
      
      expect(mockUsersService.findOneSafe).toHaveBeenCalledWith('non-existing-id');
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });
});
