import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ServicesService } from '../services/services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly servicesService: ServicesService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardData();
  }

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/activity')
  getDashboardActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('dashboard/growth')
  getDashboardGrowth() {
    return this.adminService.getDashboardGrowth();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('requests')
  getRequests() {
    return this.adminService.getRequests();
  }

  @Get('financials')
  getFinancials() {
    return this.adminService.getFinancials();
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Get('services')
  getServices() {
    return this.servicesService.findAllForAdmin();
  }

  @Post('services')
  createService(@Body() body: any) {
    return this.servicesService.create(body);
  }

  @Patch('services/:id')
  updateService(@Param('id') id: string, @Body() body: any) {
    return this.servicesService.update(id, body);
  }

  @Delete('services/:id')
  removeService(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
