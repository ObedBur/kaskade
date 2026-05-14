import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existing) {
      this.logger.warn(`Tentative de création avec un email déjà utilisé: ${createUserDto.email}`);
      throw new ConflictException('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    this.logger.log(`Nouvel utilisateur créé: ${user.email} (ID: ${user.id}, Rôle: ${user.role})`);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findOneSafe(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        quartier: true,
        role: true,
        isPremium: true,
        isVerified: true,
        metier: true,
        experience: true,
        bio: true,
        avatarUrl: true,
      },
    });
  }

  async updateByEmail(email: string, data: UpdateUserDto) {
    const user = await this.prisma.user.update({ where: { email }, data });
    this.logger.log(`Utilisateur mis à jour par email: ${email}`);
    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.prisma.user.update({ where: { id }, data });
    this.logger.log(`Utilisateur mis à jour: ${user.email} (ID: ${id})`);
    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    return this.prisma.user.update({ where: { id }, data: { refreshToken } });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isPremium: true,
        isVerified: true,
        isActive: true,
        phone: true,
        quartier: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
