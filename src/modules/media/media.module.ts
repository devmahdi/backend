import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './services/media.service';
import { LocalStorageService } from './services/local-storage.service';
import { S3StorageService } from './services/s3-storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [MediaController],
  providers: [MediaService, LocalStorageService, S3StorageService],
  exports: [MediaService],
})
export class MediaModule {}
