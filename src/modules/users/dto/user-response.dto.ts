import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'Software developer...' })
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: {
      twitter: 'https://twitter.com/johndoe',
      github: 'https://github.com/johndoe',
    },
  })
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
    linkedin?: string;
  };

  @ApiProperty({ enum: UserRole, example: UserRole.AUTHOR })
  role: UserRole;

  @ApiPropertyOptional({ example: 150 })
  followersCount?: number;

  @ApiPropertyOptional({ example: 75 })
  followingCount?: number;

  @ApiPropertyOptional({ example: false })
  isFollowing?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
