import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { AssignServicesDto } from './dto/assign-services.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminProvidersController {
  private readonly logger = new Logger(AdminProvidersController.name);

  constructor(private readonly providersService: ProvidersService) {}

  // Lister toutes les candidatures
  @Get('applications')
  findAllApplications() {
    return this.providersService.findAllApplications();
  }

  // Approuver une candidature
  @Patch('applications/:id/approve')
  approve(@Param('id') id: string) {
    this.logger.log(`ADMIN : Approbation de la candidature prestataire ID: ${id}`);
    return this.providersService.approve(id);
  }

  // Rejeter une candidature
  @Patch('applications/:id/reject')
  reject(@Param('id') id: string) {
    this.logger.log(`ADMIN : Rejet de la candidature prestataire ID: ${id}`);
    return this.providersService.reject(id);
  }

  // Assigner des services à un prestataire approuvé
  @Post(':providerId/services')
  assignServices(
    @Param('providerId') providerId: string,
    @Body() assignServicesDto: AssignServicesDto,
  ) {
    return this.providersService.assignServices(providerId, assignServicesDto);
  }

  // Retirer un service d'un prestataire
  @Delete(':providerId/services/:serviceId')
  removeService(
    @Param('providerId') providerId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.providersService.removeService(providerId, serviceId);
  }
}
