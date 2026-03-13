import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import {
  IStorageService,
  UploadResult,
} from '../interfaces/storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    const port = this.configService.get('PORT', 3000);
    this.baseUrl = `http://localhost:${port}/uploads`;
    
    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'avatars'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'covers'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'content'), { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create upload directories', error);
    }
  }

  async upload(
    file: Express.Multer.File,
    folder: string = 'content',
  ): Promise<UploadResult> {
    try {
      const fileExt = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExt}`;
      const key = `${folder}/${filename}`;
      const filepath = path.join(this.uploadDir, key);

      // Ensure folder exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });

      // Process image with sharp if it's an image
      if (file.mimetype.startsWith('image/')) {
        await sharp(file.buffer)
          .resize(2000, 2000, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toFile(filepath);
      } else {
        // For non-images, just write the buffer
        await fs.writeFile(filepath, file.buffer);
      }

      const url = `${this.baseUrl}/${key}`;

      this.logger.log(`File uploaded to local storage: ${key}`);

      return {
        url,
        key,
        filename,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to local storage', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filepath = path.join(this.uploadDir, key);
      await fs.unlink(filepath);
      this.logger.log(`File deleted from local storage: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from local storage: ${key}`, error);
      throw error;
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}
