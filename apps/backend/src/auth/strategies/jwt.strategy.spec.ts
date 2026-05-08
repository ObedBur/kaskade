import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'JWT_ACCESS_SECRET') return 'test_secret';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user if validation is successful', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await strategy.validate({ sub: '1', email: 'test@test.com', role: 'CLIENT' });

      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: 'invalid_id', email: 'test@test.com', role: 'CLIENT' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
