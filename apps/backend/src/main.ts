import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process'; 

async function bootstrap() {
  // 2. AJOUT : Synchronisation automatique de la base de données au démarrage
  try {
    Logger.log('🔄 Synchronisation de la base de données avec Prisma...', 'Bootstrap');
    
    execSync('npx prisma migrate deploy', { stdio: 'inherit' }); 
    
    Logger.log('✅ Base de données synchronisée avec succès !', 'Bootstrap');
  } catch (error) {
    Logger.error('❌ Échec de la synchronisation de la base de données', error, 'Bootstrap');
  }

  // Ensure uploads directories exist
  const avatarDir = join(process.cwd(), 'uploads', 'avatars');
  const serviceDir = join(process.cwd(), 'uploads', 'services');
  
  [avatarDir, serviceDir].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
  // Serve uploaded files statically (outside of api/v1 prefix)
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

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Application running on port ${port}`, 'Bootstrap');
}
void bootstrap();