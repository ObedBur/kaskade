import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * POST /api/v1/uploads/avatar
   * Upload une image de profil (avatar).
   * Accepte uniquement les images, max 5 MB.
   * Retourne { url: "/uploads/avatars/<uuid>.<ext>" }
   */
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // On garde le fichier en mémoire pour le valider avant d'écrire
    }),
  )
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp|gif)$/ }),
        ],
        errorHttpStatusCode: 400,
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu.');
    }

    this.logger.log(
      `📸 Upload avatar | Taille: ${(file.size / 1024).toFixed(1)} KB | Type: ${file.mimetype}`,
    );

    const result = this.uploadsService.saveAvatar(file);

    this.logger.log(`✅ Avatar enregistré → ${result.url}`);
    return result;
  }
}
