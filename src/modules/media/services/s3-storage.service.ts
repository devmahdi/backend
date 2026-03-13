import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import {
  IStorageService,
  UploadResult,
} from '../interfaces/storage.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET');
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload(
    file: Express.Multer.File,
    folder: string = 'content',
  ): Promise<UploadResult> {
    try {
      const fileExt = file.originalname.split('.').pop();
      const filename = `${uuidv4()}.${fileExt}`;
      const key = `${folder}/${filename}`;

      let buffer = file.buffer;

      // Process image with sharp if it's an image
      if (file.mimetype.startsWith('image/')) {
        buffer = await sharp(file.buffer)
          .resize(2000, 2000, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make files publicly accessible
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded to S3: ${key}`);

      return {
        url,
        key,
        filename,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to S3', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${key}`, error);
      throw error;
    }
  }

  getUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
