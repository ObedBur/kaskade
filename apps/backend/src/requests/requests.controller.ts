import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
export class RequestsController {
  private readonly logger = new Logger(RequestsController.name);

  constructor(private readonly requestsService: RequestsService) { }

  @Post()
  create(
    @CurrentUser('id') clientId: string,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    this.logger.log(`CLIENT : Création d'une nouvelle demande par l'utilisateur ID: ${clientId}`);
    return this.requestsService.create(clientId, createRequestDto);
  }

  @Get()
  findMyRequests(@CurrentUser('id') clientId: string) {
    return this.requestsService.findMyRequests(clientId);
  }

  @Public()
  @Get('availability/pooled/:serviceId')
  getPooledAvailability(@Param('serviceId') serviceId: string) {
    return this.requestsService.getPooledAvailability(serviceId);
  }

  @Public()
  @Get('availability/:serviceId')
  getAvailability(@Param('serviceId') serviceId: string) {
    return this.requestsService.getAvailability(serviceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') clientId: string) {
    return this.requestsService.findOneForClient(id, clientId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') clientId: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestsService.updateForClient(id, clientId, updateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') clientId: string) {
    return this.requestsService.removeForClient(id, clientId);
  }

}
