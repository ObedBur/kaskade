import { Controller, Post, Get, Body, UseGuards, Logger } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ApplyProviderDto } from './dto/apply-provider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('providers')
@UseGuards(JwtAuthGuard)
export class ProvidersController {
  private readonly logger = new Logger(ProvidersController.name);

  constructor(private readonly providersService: ProvidersService) {}

  // Soumettre une candidature pour devenir prestataire
  @Post('apply')
  apply(
    @CurrentUser('id') userId: string,
    @Body() applyProviderDto: ApplyProviderDto,
  ) {
    this.logger.log(`USER : Candidature prestataire soumise par l'utilisateur ID: ${userId}`);
    return this.providersService.apply(userId, applyProviderDto);
  }

  // Consulter sa propre candidature
  @Get('my-application')
  myApplication(@CurrentUser('id') userId: string) {
    return this.providersService.findMyApplication(userId);
  }
}
