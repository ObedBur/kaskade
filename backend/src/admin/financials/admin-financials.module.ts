import { Module } from '@nestjs/common';
import { AdminFinancialsController } from './admin-financials.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminFinancialsController],
})
export class AdminFinancialsModule {}
