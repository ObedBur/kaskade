import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload un buffer vers Cloudinary et retourne l'URL publique HTTPS.
   * @param buffer - Le buffer du fichier (depuis Multer memoryStorage)
   * @param folder - Dossier Cloudinary cible (ex: 'kaskade/avatars')
   * @param publicId - (optionnel) Identifiant public personnalisé
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        folder,
        resource_type: 'image',
        format: 'webp', // On convertit tout en webp pour optimiser la taille
        quality: 'auto:good',
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            reject(new Error(`Upload Cloudinary échoué: ${error.message}`));
            return;
          }
          if (!result) {
            reject(new Error('Cloudinary: aucun résultat retourné'));
            return;
          }
          this.logger.log(`Image uploadée sur Cloudinary: ${result.secure_url}`);
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Supprime une image sur Cloudinary à partir de son URL publique.
   * Utile lors du remplacement d'un avatar ou d'une image de service.
   * @param url - L'URL Cloudinary complète de l'image à supprimer
   */
  async deleteByUrl(url: string | null | undefined): Promise<void> {
    if (!url || !url.includes('cloudinary.com')) return;

    try {
      // Extraire le publicId depuis l'URL Cloudinary
      // Format: https://res.cloudinary.com/<cloud>/image/upload/v<version>/<folder>/<publicId>.<ext>
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return;

      // Rejoindre les parties après 'upload/v<version>'
      const afterUpload = parts.slice(uploadIndex + 2).join('/');
      // Supprimer l'extension
      const publicId = afterUpload.replace(/\.[^/.]+$/, '');

      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image Cloudinary supprimée: ${publicId}`);
    } catch (err: any) {
      this.logger.warn(`Impossible de supprimer l'image Cloudinary: ${err.message}`);
    }
  }
}
