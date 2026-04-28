import { Controller, Get, UseGuards, Req, Put, Param, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getNotifications(@Req() req: any) {
    return this.prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true },
    });
  }

  @Put('read-all')
  async markAllAsRead(@Req() req: any) {
    return this.prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    return this.prisma.notification.deleteMany({
      where: { id, userId: req.user.id },
    });
  }
}
