import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Find user by ID with optional relations
   */
  async findById(id: string, relations: string[] = []): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  /**
   * Get user profile with follower/following counts
   */
  async getProfile(
    identifier: string,
    currentUserId?: string,
  ): Promise<User> {
    // Try to find by ID first, then by username
    let user = await this.usersRepository.findOne({
      where: [{ id: identifier }, { username: identifier }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get follower and following counts
    const followersCount = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.followers', 'follower')
      .where('user.id = :userId', { userId: user.id })
      .getCount();

    const followingCount = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.following', 'following')
      .where('user.id = :userId', { userId: user.id })
      .getCount();

    user.followersCount = followersCount;
    user.followingCount = followingCount;

    // Check if current user follows this user
    if (currentUserId && currentUserId !== user.id) {
      const isFollowing = await this.isFollowing(currentUserId, user.id);
      user.isFollowing = isFollowing;
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    // Update only provided fields
    if (updateProfileDto.fullName !== undefined) {
      user.fullName = updateProfileDto.fullName;
    }
    if (updateProfileDto.bio !== undefined) {
      user.bio = updateProfileDto.bio;
    }
    if (updateProfileDto.avatarUrl !== undefined) {
      user.avatarUrl = updateProfileDto.avatarUrl;
    }
    if (updateProfileDto.socialLinks !== undefined) {
      user.socialLinks = updateProfileDto.socialLinks;
    }

    return this.usersRepository.save(user);
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const follower = await this.findById(followerId, ['following']);
    const userToFollow = await this.findById(followingId);

    // Check if already following
    const alreadyFollowing = follower.following?.some(
      (user) => user.id === followingId,
    );

    if (alreadyFollowing) {
      throw new ConflictException('Already following this user');
    }

    // Add to following list
    if (!follower.following) {
      follower.following = [];
    }
    follower.following.push(userToFollow);

    await this.usersRepository.save(follower);
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    const follower = await this.findById(followerId, ['following']);

    // Check if following
    const followingIndex = follower.following?.findIndex(
      (user) => user.id === followingId,
    );

    if (followingIndex === -1 || !follower.following) {
      throw new BadRequestException('Not following this user');
    }

    // Remove from following list
    follower.following.splice(followingIndex, 1);

    await this.usersRepository.save(follower);
  }

  /**
   * Check if user A follows user B
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const count = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.following', 'following')
      .where('user.id = :followerId', { followerId })
      .andWhere('following.id = :followingId', { followingId })
      .getCount();

    return count > 0;
  }

  /**
   * Get user's followers
   */
  async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: User[]; total: number }> {
    await this.findById(userId); // Verify user exists

    const [followers, total] = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.following', 'following', 'following.id = :userId', {
        userId,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: followers, total };
  }

  /**
   * Get users that this user is following
   */
  async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: User[]; total: number }> {
    const user = await this.findById(userId);

    const [following, total] = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.followers', 'follower', 'follower.id = :userId', {
        userId: user.id,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: following, total };
  }

  /**
   * Create a new user (for auth module)
   */
  async create(userData: Partial<User>): Promise<User> {
    // Check if email or username already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === userData.username) {
        throw new ConflictException('Username already exists');
      }
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashedToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;

    await this.usersRepository.update(userId, {
      refreshToken: hashedToken,
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(userId, { password: hashedPassword });
  }
}
