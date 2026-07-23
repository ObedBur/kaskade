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
  // 1. (Ancienne config d'uploads supprimée - on utilise Cloudinary)

  // 2. Création de l'application (Une seule déclaration)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

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

  // 4. Configuration du préfixe

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
  if (!process.env.MBIYO_WEBHOOK_SECRET?.trim()) {
    throw new Error('MBIYO_WEBHOOK_SECRET est requis au démarrage.');
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Application running on port ${port}`, 'Bootstrap'); 
}
void bootstrap();
