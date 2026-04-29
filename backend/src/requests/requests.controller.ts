import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
export class RequestsController {
  private readonly logger = new Logger(RequestsController.name);

  constructor(private readonly requestsService: RequestsService) {}

  // Créer une demande de service
  @Post()
  create(
    @CurrentUser('id') clientId: string,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    this.logger.log(`CLIENT : Création d'une nouvelle demande par l'utilisateur ID: ${clientId}`);
    return this.requestsService.create(clientId, createRequestDto);
  }

  // Voir uniquement SES propres demandes
  @Get()
  findMyRequests(@CurrentUser('id') clientId: string) {
    return this.requestsService.findMyRequests(clientId);
  }

  // Récupérer les créneaux occupés pour un service
  @Get('availability/:serviceId')
  getAvailability(@Param('serviceId') serviceId: string) {
    return this.requestsService.getAvailability(serviceId);
  }

  // Voir le détail d'une de SES demandes
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') clientId: string) {
    return this.requestsService.findOneForClient(id, clientId);
  }

  // Modifier une de SES demandes (PENDING uniquement)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') clientId: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestsService.updateForClient(id, clientId, updateRequestDto);
  }

  // Annuler une de SES demandes (PENDING uniquement)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') clientId: string) {
    return this.requestsService.removeForClient(id, clientId);
  }

}
