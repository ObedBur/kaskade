import { Body, Controller, Get, Patch, Param, UseGuards, Logger } from '@nestjs/common';
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

  // Voir toutes les demandes de service
  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  // Voir le détail d'une demande
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  // Approuver une demande (le prix est automatiquement lu depuis le Service)
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() body?: { price?: number }) {
    this.logger.log(`ADMIN : Approbation de la demande ID: ${id}`);
    return this.requestsService.approve(id, body?.price);
  }

  // Rejeter une demande
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    this.logger.log(`ADMIN : Rejet de la demande ID: ${id}`);
    return this.requestsService.reject(id);
  }
}
