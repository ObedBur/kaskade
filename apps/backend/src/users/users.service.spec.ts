import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if the email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'existing@test.com' });
      
      await expect(service.create({ 
        email: 'existing@test.com', 
        password: 'pwd', 
        fullName: 'Test', 
        phone: '123', 
        quartier: 'qt' 
      })).rejects.toThrow(ConflictException);
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'existing@test.com' } });
    });

    it('should hash password and call prisma.user.create on success', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw_123');
      
      const dto = { email: 'new@test.com', password: 'pwd', fullName: 'Test', phone: '123', quartier: 'qt' };
      const createdUser = { id: '2', ...dto, password: 'hashed_pw_123' };
      
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('pwd', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({ 
        data: { ...dto, password: 'hashed_pw_123' } 
      });
      expect(result).toEqual(createdUser);
    });

    it('should propagate database connection failures', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      
      mockPrismaService.user.create.mockRejectedValue(new Error('DB Connection Timeout'));
      
      const dto = { email: 'new@test.com', password: 'pwd', fullName: 'Test', phone: '123', quartier: 'qt' };
      
      await expect(service.create(dto)).rejects.toThrow('DB Connection Timeout');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      
      const result = await service.findByEmail('test@test.com');
      
      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });

    it('should return null if user by email is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.findByEmail('absent@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 'unique_id', email: 'test@test.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      
      const result = await service.findOne('unique_id');
      
      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 'unique_id' } });
    });

    it('should return null if user by id is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.findOne('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findOneSafe', () => {
    it('should return a user safely picking specific fields', async () => {
      const safeUser = { id: '1', email: 'test@test.com', fullName: 'Test', role: 'CLIENT' };
      mockPrismaService.user.findUnique.mockResolvedValue(safeUser);
      
      const result = await service.findOneSafe('1');
      
      expect(result).toEqual(safeUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, email: true, fullName: true, phone: true, quartier: true, role: true, isVerified: true },
      });
    });
    
    it('should handle database error correctly', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Prisma error'));
      await expect(service.findOneSafe('1')).rejects.toThrow('Prisma error');
    });
  });

  describe('updateByEmail', () => {
    it('should update a user using their email', async () => {
      const dto = { fullName: 'Updated Name' };
      const updatedUser = { id: '1', email: 'test@test.com', fullName: 'Updated Name' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);
      
      const result = await service.updateByEmail('test@test.com', dto);
      
      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({ where: { email: 'test@test.com' }, data: dto });
    });
  });

  describe('update', () => {
    it('should hash a new password if provided in UpdateUserDto', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_pwd');
      const dto = { password: 'new_password', fullName: 'Updated' };
      mockPrismaService.user.update.mockResolvedValue({ id: '1', fullName: 'Updated' });

      await service.update('1', dto);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({ 
        where: { id: '1' }, 
        data: { password: 'new_hashed_pwd', fullName: 'Updated' } 
      });
    });

    it('should update a user normally without hashing if password is not provided', async () => {
      const dto = { fullName: 'No Password Update' };
      mockPrismaService.user.update.mockResolvedValue({ id: '1', fullName: 'No Password Update' });
      
      await service.update('1', dto);
      
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({ 
        where: { id: '1' }, 
        data: dto 
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('should update the refreshToken of a user', async () => {
      mockPrismaService.user.update.mockResolvedValue({ id: '1', refreshToken: 'new_rt' });
      
      await service.updateRefreshToken('1', 'new_rt');
      
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({ 
        where: { id: '1' }, 
        data: { refreshToken: 'new_rt' } 
      });
    });
  });

  describe('findAll', () => {
    it('should return all users with specific fields selected', async () => {
      const userList = [{ id: '1', email: 'a@a.com' }, { id: '2', email: 'b@b.com' }];
      mockPrismaService.user.findMany.mockResolvedValue(userList);
      
      const result = await service.findAll();
      
      expect(result).toEqual(userList);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isVerified: true,
          isActive: true,
        },
      });
    });
  });
});
