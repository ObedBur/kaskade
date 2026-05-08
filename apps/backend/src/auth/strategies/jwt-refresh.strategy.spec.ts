import { Test, TestingModule } from '@nestjs/testing';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'JWT_REFRESH_SECRET') return 'test_refresh_secret';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return payload with refresh token if Authorization header is present', () => {
      const req = {
        get: jest.fn().mockReturnValue('Bearer test_refresh_token_string'),
      } as unknown as Request;

      const payload = { sub: '1', email: 'test@test.com', role: 'CLIENT' };

      const result = strategy.validate(req, payload);

      expect(req.get).toHaveBeenCalledWith('Authorization');
      expect(result).toEqual({ ...payload, refreshToken: 'test_refresh_token_string' });
    });

    it('should throw UnauthorizedException if Authorization header is missing', () => {
      const req = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      const payload = { sub: '1', email: 'test@test.com', role: 'CLIENT' };

      expect(() => strategy.validate(req, payload)).toThrow(UnauthorizedException);
      expect(req.get).toHaveBeenCalledWith('Authorization');
    });
  });
});
