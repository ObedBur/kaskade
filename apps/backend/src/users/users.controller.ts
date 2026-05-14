import { Controller, Get, Post, Body, Patch, Param, UseGuards, HttpCode, HttpStatus, NotFoundException, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Requête ADMIN : Création d'utilisateur (${createUserDto.email})`);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    this.logger.log('Requête ADMIN : Liste de tous les utilisateurs');
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    this.logger.log(`Requête ADMIN : Détails de l'utilisateur ID: ${id}`);
    const user = await this.usersService.findOneSafe(id);
    if (!user) {
      this.logger.warn(`Échec consultation : Utilisateur ID ${id} introuvable`);
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`Requête ADMIN : Modification de l'utilisateur ID: ${id}`);
    const user = await this.usersService.findOneSafe(id);
    if (!user) {
      this.logger.warn(`Échec modification : Utilisateur ID ${id} introuvable`);
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return this.usersService.update(id, updateUserDto);
  }
}
