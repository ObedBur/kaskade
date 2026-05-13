import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminRequestsController {
  private readonly logger = new Logger(AdminRequestsController.name);

  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  findAll() {
    this.logger.log('ADMIN: Récupération de toutes les demandes');
    return this.requestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    this.logger.log(`ADMIN: Approbation de la demande ${id}`);
    return this.requestsService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    this.logger.log(`ADMIN: Rejet de la demande ${id}`);
    return this.requestsService.reject(id);
  }
}
