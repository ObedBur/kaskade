import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  // 1. Initialisation des dossiers d'uploads (maintenu)
  const avatarDir = join(process.cwd(), 'uploads', 'avatars');
  const serviceDir = join(process.cwd(), 'uploads', 'services');
  
  [avatarDir, serviceDir].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  // 2. Création de l'application (Une seule déclaration)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 3. Sécurité et CORS
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  const frontendUrlStr = process.env.FRONTEND_URL;
  const allowedOrigins = frontendUrlStr 
    ? frontendUrlStr.split(',').map(url => url.trim().replace(/\/$/, '')) 
    : 'http://localhost:3000';

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  // 4. Configuration des assets et du préfixe
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 5. Démarrage
  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Application running on port ${port}`, 'Bootstrap'); 
}
void bootstrap();