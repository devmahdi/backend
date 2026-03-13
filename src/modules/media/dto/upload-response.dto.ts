import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'Publicly accessible URL of the uploaded file',
    example: 'https://example.com/uploads/avatars/abc123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Unique key/path of the file in storage',
    example: 'avatars/abc123.jpg',
  })
  key: string;

  @ApiProperty({
    description: 'Original filename with UUID prefix',
    example: 'abc123.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'MIME type of the uploaded file',
    example: 'image/jpeg',
  })
  mimetype: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;
}
