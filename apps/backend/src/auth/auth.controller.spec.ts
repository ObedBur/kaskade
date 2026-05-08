import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Create a mock for AuthService
const mockAuthService = {
  register: jest.fn(),
  verifyOtp: jest.fn(),
  resendOtp: jest.fn(),
  login: jest.fn(),
  refreshTokens: jest.fn(),
  getMe: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  updateMe: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true }) // Mock rate limiter since we just want unit tests
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = {
        email: 'test@test.com',
        password: 'Password123!',
        fullName: 'Test',
        phone: '123',
        quartier: 'Qtr'
      };
      const expectedResult = { message: 'Inscrit', userId: '1', email: dto.email };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verifyOtp', () => {
    it('should call authService.verifyOtp', async () => {
      const dto = { email: 'test@test.com', otp: '123456' };
      mockAuthService.verifyOtp.mockResolvedValue({ message: 'Verified' });

      await controller.verifyOtp(dto);
      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(dto.email, dto.otp);
    });
  });

  describe('resendOtp', () => {
    it('should call authService.resendOtp', async () => {
      mockAuthService.resendOtp.mockResolvedValue({ message: 'Sent' });
      await controller.resendOtp('test@test.com');
      expect(mockAuthService.resendOtp).toHaveBeenCalledWith('test@test.com');
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = { email: 'test@test.com', password: 'Password123!' };
      const tokens = { accessToken: 'a', refreshToken: 'r' };
      mockAuthService.login.mockResolvedValue({ message: 'Success', tokens, user: {} });

      const result = await controller.login(dto);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result.tokens).toEqual(tokens);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with userId from decorator', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Logged out' });

      await controller.logout('userId');
      expect(mockAuthService.logout).toHaveBeenCalledWith('userId');
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens', async () => {
      await controller.refreshTokens('userId', 'refreshToken');
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('userId', 'refreshToken');
    });
  });

  describe('getMe', () => {
    it('should call authService.getMe', async () => {
      await controller.getMe('userId');
      expect(mockAuthService.getMe).toHaveBeenCalledWith('userId');
    });
  });
  
  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      await controller.forgotPassword({ email: 'test@test.com' });
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@test.com');
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      await controller.resetPassword({ token: 'abc', newPassword: 'NewPassword123!' });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('abc', 'NewPassword123!');
    });
  });

  describe('updateMe', () => {
    it('should call authService.updateMe', async () => {
      const dto = { fullName: 'New' };
      await controller.updateMe('userId', dto);
      expect(mockAuthService.updateMe).toHaveBeenCalledWith('userId', dto);
    });
  });

  describe('Sécurité - Rate Limiting (Throttle)', () => {
    it('should have Throttle metadata on register route (max 5 req)', () => {
      const allMetadataKeys = Reflect.getMetadataKeys(AuthController.prototype.register);
      expect(allMetadataKeys).toContain('THROTTLER:LIMITdefault');
      const limitMetadata = Reflect.getMetadata('THROTTLER:LIMITdefault', AuthController.prototype.register);
      expect(limitMetadata).toBe(5);
    });

    it('should have Throttle metadata on login route (max 5 req)', () => {
      const allMetadataKeys = Reflect.getMetadataKeys(AuthController.prototype.login);
      expect(allMetadataKeys).toContain('THROTTLER:LIMITdefault');
      const limitMetadata = Reflect.getMetadata('THROTTLER:LIMITdefault', AuthController.prototype.login);
      expect(limitMetadata).toBe(5);
    });

    it('should have Throttle metadata on forgot-password route (max 3 req)', () => {
      const allMetadataKeys = Reflect.getMetadataKeys(AuthController.prototype.forgotPassword);
      expect(allMetadataKeys).toContain('THROTTLER:LIMITdefault');
      const limitMetadata = Reflect.getMetadata('THROTTLER:LIMITdefault', AuthController.prototype.forgotPassword);
      expect(limitMetadata).toBe(3);
    });
  });
});
