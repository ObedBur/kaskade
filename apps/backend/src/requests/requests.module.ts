import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { AdminRequestsController } from './admin-requests.controller';
import { RequestsTasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RequestsController, AdminRequestsController],
  providers: [RequestsService, RequestsTasksService],
})
export class RequestsModule {}
