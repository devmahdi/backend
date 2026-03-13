import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('profile/:identifier')
  @ApiOperation({
    summary: 'Get user profile by ID or username',
    description:
      'Retrieve a user profile. Returns follower/following counts and follow status if authenticated.',
  })
  @ApiParam({
    name: 'identifier',
    description: 'User ID (UUID) or username',
    example: 'johndoe',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfile(
    @Param('identifier') identifier: string,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    const user = await this.usersService.getProfile(identifier, currentUserId);
    return user;
  }

  @Patch('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Update the authenticated user profile (bio, avatar, social links)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.id;
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateProfileDto,
    );
    return updatedUser;
  }

  @Post('follow/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Follow a user',
    description: 'Follow another user. Cannot follow yourself.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to follow',
  })
  @ApiResponse({
    status: 200,
    description: 'User followed successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'User followed successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot follow yourself or invalid request',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Already following this user',
  })
  async followUser(@Req() req: any, @Param('userId') userId: string) {
    const followerId = req.user.id;
    await this.usersService.followUser(followerId, userId);
    return { message: 'User followed successfully' };
  }

  @Delete('follow/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Unfollow a user',
    description: 'Unfollow a user you are currently following.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to unfollow',
  })
  @ApiResponse({
    status: 200,
    description: 'User unfollowed successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'User unfollowed successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Not following this user or cannot unfollow yourself',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async unfollowUser(@Req() req: any, @Param('userId') userId: string) {
    const followerId = req.user.id;
    await this.usersService.unfollowUser(followerId, userId);
    return { message: 'User unfollowed successfully' };
  }

  @Public()
  @Get(':userId/followers')
  @ApiOperation({
    summary: 'Get user followers',
    description: 'Retrieve a paginated list of users following this user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Followers retrieved successfully',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserResponseDto' },
        },
        meta: {
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async getFollowers(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = paginationDto;
    const { data, total } = await this.usersService.getFollowers(
      userId,
      page,
      limit,
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Public()
  @Get(':userId/following')
  @ApiOperation({
    summary: 'Get users this user is following',
    description: 'Retrieve a paginated list of users this user follows.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Following list retrieved successfully',
  })
  async getFollowing(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = paginationDto;
    const { data, total } = await this.usersService.getFollowing(
      userId,
      page,
      limit,
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
