import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MediaService } from './services/media.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload user avatar image',
    description:
      'Upload an avatar image. Accepts JPEG, PNG, GIF, WebP. Max size: 5MB. Image will be automatically resized.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file validation failed',
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.mediaService.uploadAvatar(file);
  }

  @Post('upload/cover')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload article cover image',
    description:
      'Upload a cover image for an article. Accepts JPEG, PNG, GIF, WebP. Max size: 5MB. Image will be automatically resized.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Cover image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Cover image uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file validation failed',
  })
  async uploadCover(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.mediaService.uploadCoverImage(file);
  }

  @Post('upload/content')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload in-content image',
    description:
      'Upload an image to be embedded in article content. Accepts JPEG, PNG, GIF, WebP. Max size: 5MB. Image will be automatically resized.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Content image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Content image uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file validation failed',
  })
  async uploadContentImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.mediaService.uploadContentImage(file);
  }

  @Delete(':key(*)')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete uploaded file',
    description:
      'Delete a file from storage by its key. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'File deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async deleteFile(@Param('key') key: string) {
    await this.mediaService.deleteFile(key);
    return { message: 'File deleted successfully' };
  }
}
