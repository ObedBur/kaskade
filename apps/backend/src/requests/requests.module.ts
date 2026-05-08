import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { AdminRequestsController } from './admin-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RequestsController, AdminRequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
