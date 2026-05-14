import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardData();
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
}
