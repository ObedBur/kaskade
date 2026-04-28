import { Controller, Patch, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @Roles(Role.CLIENT) // Uniquement les clients peuvent initier une demande
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Request() req
  ) {
    return this.requestsService.create(createRequestDto, req.user.id);
  }

  @Patch(':id/status')
  async transitionStatus(
    @Param('id') id: string,
    @Body('status') status: RequestStatus,
    @Request() req
  ) {
    // req.user est injecté par le JwtAuthGuard
    return this.requestsService.updateStatus(id, status, req.user.id, req.user.role);
  }
}
