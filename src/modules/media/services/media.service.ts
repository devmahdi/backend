import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import {
  IStorageService,
  UploadResult,
} from '../interfaces/storage.interface';
import * as mimeTypes from 'mime-types';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly storageService: IStorageService;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private s3StorageService: S3StorageService,
  ) {
    // Choose storage provider based on configuration
    const storageProvider = this.configService.get('STORAGE_PROVIDER', 'local');
    this.storageService =
      storageProvider === 's3'
        ? this.s3StorageService
        : this.localStorageService;

    this.maxFileSize = this.configService.get<number>(
      'MAX_FILE_SIZE',
      5 * 1024 * 1024, // 5MB default
    );

    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    this.logger.log(`Using ${storageProvider} storage provider`);
  }

  async uploadAvatar(file: Express.Multer.File): Promise<UploadResult> {
    this.validateFile(file);
    return this.storageService.upload(file, 'avatars');
  }

  async uploadCoverImage(file: Express.Multer.File): Promise<UploadResult> {
    this.validateFile(file);
    return this.storageService.upload(file, 'covers');
  }

  async uploadContentImage(file: Express.Multer.File): Promise<UploadResult> {
    this.validateFile(file);
    return this.storageService.upload(file, 'content');
  }

  async deleteFile(key: string): Promise<void> {
    return this.storageService.delete(key);
  }

  getFileUrl(key: string): string {
    return this.storageService.getUrl(key);
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Additional validation: check file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const expectedExtension = mimeTypes.extension(file.mimetype);

    if (fileExtension !== expectedExtension) {
      throw new BadRequestException(
        'File extension does not match MIME type',
      );
    }
  }
}
