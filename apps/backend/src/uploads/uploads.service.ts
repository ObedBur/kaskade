import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly avatarDir: string;
  private readonly serviceDir: string;

  constructor() {
    this.avatarDir = join(process.cwd(), 'uploads', 'avatars');
    this.serviceDir = join(process.cwd(), 'uploads', 'services');

    [this.avatarDir, this.serviceDir].forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Sauvegarde un fichier image uploadé et retourne l'URL relative.
   * @param file Buffer du fichier (fourni par Multer)
   * @param originalName Nom original du fichier pour extraire l'extension
   * @returns { url: string } - URL publique relative (ex: /uploads/avatars/uuid.jpg)
   */
  saveAvatar(file: Express.Multer.File): { url: string } {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filePath = join(this.avatarDir, filename);

    writeFileSync(filePath, file.buffer);

    this.logger.log(`Avatar sauvegardé : ${filePath}`);
    return { url: `/uploads/avatars/${filename}` };
  }

  saveServiceImage(file: Express.Multer.File): {
    filename: string;
    url: string;
  } {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filePath = join(this.serviceDir, filename);

    writeFileSync(filePath, file.buffer);

    this.logger.log(`Image service sauvegardée : ${filePath}`);
    return { filename, url: `/uploads/services/${filename}` };
  }

  /**
   * Supprime un ancien avatar du disque (appel optionnel au nettoyage).
   */
  deleteAvatar(relativePath: string): void {
    if (!relativePath) return;
    const absolutePath = join(
      process.cwd(),
      relativePath.startsWith('/') ? relativePath.substring(1) : relativePath,
    );
    if (existsSync(absolutePath)) {
      try {
        unlinkSync(absolutePath);
        this.logger.log(`Ancien avatar supprimé : ${absolutePath}`);
      } catch (err: any) {
        this.logger.error(`Erreur suppression avatar : ${err.message}`);
      }
    }
  }
}
