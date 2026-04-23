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
      'https://cdn.kaskade.com/services';
  }

  /**
   * Génère l'URL publique pour une image basée sur imageKey
   * @param imageKey - Clé de l'image (ex: "service-123-abc.jpg")
   * @returns URL complète (ex: "https://cdn.kaskade.com/services/service-123-abc.jpg")
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
   * @param expirySeconds - Durée de validité
   * @returns Promise<string> URL signée
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
   * @param imageKey - Clé à valider
   * @returns true si valide
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
   * @param imageKey - "service-123-abc.jpg"
   * @returns ".jpg"
   */
  getFileExtension(imageKey: string): string {
    const parts = imageKey.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }
}
