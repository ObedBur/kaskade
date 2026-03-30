import { Controller, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

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
