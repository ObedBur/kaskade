import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';

// Mock functions
const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findOne: jest.fn(),
  findOneSafe: jest.fn(),
  updateByEmail: jest.fn(),
  update: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

const mockRedisService = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user, generate OTP, save to redis, and send email', async () => {
      const createUserDto = {
        email: 'test@test.com',
        password: 'Password123!',
        fullName: 'Test User',
        phone: '123456789',
        quartier: 'Test Area',
      };
      const createdUser = { id: '1', email: 'test@test.com', fullName: 'Test User', role: 'CLIENT', isVerified: false };

      mockUsersService.create.mockResolvedValue(createdUser);
      mockMailService.sendVerificationEmail.mockResolvedValue(true);

      const result = await service.register(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRedisService.set).toHaveBeenCalledTimes(1);
      expect(mockRedisService.set.mock.calls[0][0]).toBe('otp:test@test.com'); // key
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('userId', '1');
      expect(result).toHaveProperty('message');
      // 🔐 Sécurité : l'utilisateur ne doit PAS être vérifié à la création
      expect(createdUser.isVerified).toBe(false);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and activate user', async () => {
      const email = 'test@test.com';
      const otp = '123456';

      mockRedisService.get.mockResolvedValue(otp);

      const result = await service.verifyOtp(email, otp);

      expect(mockRedisService.get).toHaveBeenCalledWith(`otp:${email}`);
      expect(mockUsersService.updateByEmail).toHaveBeenCalledWith(email, { isVerified: true });
      expect(mockRedisService.del).toHaveBeenCalledWith(`otp:${email}`);
      expect(result).toEqual({ message: 'Compte vérifié avec succès. Vous pouvez maintenant vous connecter.' });
    });

    it('should throw BadRequestException if OTP is invalid', async () => {
      mockRedisService.get.mockResolvedValue('wrongotp');

      await expect(service.verifyOtp('test@test.com', '123456')).rejects.toThrow(BadRequestException);
    });
    
    it('should throw BadRequestException if OTP is expired/null', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await expect(service.verifyOtp('test@test.com', '123456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'test@test.com', password: 'pwd' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not verified', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ isVerified: false });

      await expect(service.login({ email: 'test@test.com', password: 'pwd' })).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if login is successful', async () => {
      const user = { id: '1', email: 'test@test.com', password: 'hashedpassword', isVerified: true, role: 'CLIENT' };
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedRefreshToken');
      mockJwtService.signAsync.mockImplementation((payload, options) => {
        if (options.expiresIn === '15m') return Promise.resolve('access_token');
        return Promise.resolve('refresh_token');
      });

      const result = await service.login({ email: 'test@test.com', password: 'Password123!' });

      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashedpassword');
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith('1', 'newHashedRefreshToken');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toEqual({ accessToken: 'access_token', refreshToken: 'refresh_token' });
    });
  });

  describe('getMe', () => {
    it('should return user info without secrets', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockUsersService.findOneSafe.mockResolvedValue(user);
      const result = await service.getMe('1');
      expect(result).toEqual(user);
      expect(mockUsersService.findOneSafe).toHaveBeenCalledWith('1');
    });
  });

  describe('resendOtp', () => {
    it('should resend OTP if user is not verified', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ email: 'test@test.com', fullName: 'Test', isVerified: false, role: 'CLIENT' });
      const result = await service.resendOtp('test@test.com');
      expect(mockRedisService.set).toHaveBeenCalled();
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('should throw BadRequestException if user already verified', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ isVerified: true });
      await expect(service.resendOtp('test@test.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should remove refresh token', async () => {
      await service.logout('1');
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith('1', null);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token and send email', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ email: 'test@test.com', fullName: 'Test User' });

      const result = await service.forgotPassword('test@test.com');

      expect(mockRedisService.set).toHaveBeenCalledTimes(1);
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('message');
    });

    it('should return same generic message if user not found (No User Enumeration)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@test.com');

      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });
  });

  describe('resetPassword', () => {
    it('should update password and delete token from redis', async () => {
      const email = 'test@test.com';
      const user = { id: '1', email };
      mockRedisService.get.mockResolvedValue(email);
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.resetPassword('validtoken', 'NewPassword123!');

      expect(mockUsersService.update).toHaveBeenCalledWith('1', { password: 'NewPassword123!' });
      expect(mockRedisService.del).toHaveBeenCalledWith('reset-password:validtoken');
      expect(result).toHaveProperty('message');
    });

    it('should throw BadRequestException if token is invalid/expired', async () => {
      mockRedisService.get.mockResolvedValue(null);
      await expect(service.resetPassword('invalidtoken', 'newpwd')).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshTokens', () => {
    it('should throw ForbiddenException if user has no refresh token', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: '1', refreshToken: null });
      await expect(service.refreshTokens('1', 'token')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if refresh token does not match', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: '1', refreshToken: 'hashedtoken' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.refreshTokens('1', 'wrongtoken')).rejects.toThrow(ForbiddenException);
    });

    it('should return new tokens if refresh is successful', async () => {
      const user = { id: '1', email: 'test@test.com', role: 'CLIENT', refreshToken: 'hashedtoken' };
      mockUsersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedRT');
      mockJwtService.signAsync.mockResolvedValue('new_token');

      const result = await service.refreshTokens('1', 'validRT');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalled();
    });
  });

  describe('updateMe', () => {
    it('should call usersService.update', async () => {
      const dto = { fullName: 'New Name' };
      mockUsersService.update.mockResolvedValue({ id: '1', ...dto });
      const result = await service.updateMe('1', dto);
      expect(result.fullName).toBe('New Name');
      expect(mockUsersService.update).toHaveBeenCalledWith('1', dto);
    });
  });
});
