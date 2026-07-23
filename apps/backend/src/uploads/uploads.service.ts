import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Sauvegarde un avatar sur Cloudinary et retourne l'URL HTTPS publique.
   * @param file - Buffer du fichier (fourni par Multer memoryStorage)
   * @returns { url: string } - URL publique Cloudinary (ex: https://res.cloudinary.com/...)
   */
  async saveAvatar(file: Express.Multer.File): Promise<{ url: string }> {
    const result = await this.cloudinaryService.uploadBuffer(
      file.buffer,
      'kaskade/avatars',
    );
    this.logger.log(`Avatar uploadé sur Cloudinary: ${result.url}`);
    return { url: result.url };
  }

  /**
   * Sauvegarde une image de service sur Cloudinary et retourne l'URL HTTPS publique.
   * @param file - Buffer du fichier (fourni par Multer memoryStorage)
   * @returns { filename: string, url: string } - publicId Cloudinary et URL publique
   */
  async saveServiceImage(
    file: Express.Multer.File,
  ): Promise<{ filename: string; url: string }> {
    const result = await this.cloudinaryService.uploadBuffer(
      file.buffer,
      'kaskade/services',
    );
    this.logger.log(`Image service uploadée sur Cloudinary: ${result.url}`);
    // On utilise directement l'URL Cloudinary au lieu du publicId
    // Cela évitera aux utilitaires (media-url.util.ts, getMediaUrl) d'ajouter le prefix localhost
    return { filename: result.url, url: result.url };
  }

  /**
   * Supprime un avatar Cloudinary lors du remplacement.
   * @param url - URL Cloudinary de l'ancien avatar
   */
  async deleteAvatar(url: string | null | undefined): Promise<void> {
    await this.cloudinaryService.deleteByUrl(url);
  }
}
