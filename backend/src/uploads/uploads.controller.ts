import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

type UploadedImage = {
  filename: string;
  url: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function ensureUploadDir(folder: 'avatars' | 'services'): string {
  const uploadDir = join(process.cwd(), 'uploads', folder);

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
}

function imageFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    callback(
      new BadRequestException('Seuls les fichiers image sont autorises.'),
      false,
    );
    return;
  }

  callback(null, true);
}

function createStorage(folder: 'avatars' | 'services') {
  return diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, ensureUploadDir(folder));
    },
    filename: (_req, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();
      callback(null, `${folder.slice(0, -1)}-${randomUUID()}${extension}`);
    },
  });
}

function assertUploadedFile(file?: Express.Multer.File): Express.Multer.File {
  if (!file) {
    throw new BadRequestException('Aucun fichier fourni.');
  }

  return file;
}

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('avatars'),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  uploadAvatar(@UploadedFile() file?: Express.Multer.File): UploadedImage {
    const uploadedFile = assertUploadedFile(file);

    return {
      filename: uploadedFile.filename,
      url: `/uploads/avatars/${uploadedFile.filename}`,
    };
  }

  @Post('service')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('services'),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  uploadServiceImage(@UploadedFile() file?: Express.Multer.File): UploadedImage {
    const uploadedFile = assertUploadedFile(file);

    return {
      filename: uploadedFile.filename,
      url: `/uploads/services/${uploadedFile.filename}`,
    };
  }
}
