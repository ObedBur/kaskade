import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * StorageService - Gestion centralisée de la logique CDN/Storage
 * Architecture scalable: Prépare le code pour AWS S3, Cloudinary, etc.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly cdnBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.cdnBaseUrl =
      this.configService.get('CDN_BASE_URL') ||
      (process.env.BACKEND_URL || 'http://localhost:4000') + '/uploads/services';
  }

  /**
   * Génère l'URL publique pour une image basée sur imageKey
   * @param imageKey 
   * @returns
   */
  getPublicUrl(imageKey: string | null): string | null {
    if (!imageKey) {
      return null;
    }

    return `${this.cdnBaseUrl}/${imageKey}`;
  }

  /**
   * Placeholder pour les URLs signées (future implémentation)
   * Utile pour AWS S3 ou accès privés
   * @param imageKey
   * @param expirySeconds 
   * @returns 
   */
  async getSignedUrl(
    imageKey: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    // TODO: Implémenter avec AWS SDK
    // Pour maintenant, retourner l'URL publique
    this.logger.warn(
      `getSignedUrl not implemented yet for key: ${imageKey}`,
    );
    return this.getPublicUrl(imageKey)!;
  }

  /**
   * Valide le format de la clé image
   * @param imageKey 
   * @returns 
   */
  isValidImageKey(imageKey: string): boolean {
    // Exemples de validations:
    // - Ne pas vide
    // - Format: nom-uuid.extension
    // - Extensions autorisées: jpg, png, webp
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasValidExtension = validExtensions.some((ext) =>
      imageKey.toLowerCase().endsWith(ext),
    );

    return Boolean(imageKey && imageKey.length > 0 && hasValidExtension);
  }

  /**
   * Extrait l'extension d'un imageKey
   * @param imageKey 
   * @returns 
   */
  getFileExtension(imageKey: string): string {
    const parts = imageKey.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }
}
