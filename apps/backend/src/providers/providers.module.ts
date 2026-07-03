import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { AdminProvidersController } from './admin-providers.controller';
import { ProviderController } from './provider.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProviderMatchingService } from './provider-matching.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProvidersController, AdminProvidersController, ProviderController],
  providers: [ProvidersService, ProviderMatchingService],
  exports: [ProvidersService, ProviderMatchingService],
})
export class ProvidersModule {}
