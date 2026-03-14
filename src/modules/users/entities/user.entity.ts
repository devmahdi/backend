import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '../../posts/entities/post.entity';

export enum UserRole {
  READER = 'READER',
  AUTHOR = 'AUTHOR',
  ADMIN = 'ADMIN',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true, length: 100 })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'json', nullable: true })
  socialLinks: {
    twitter?: string;
    github?: string;
    website?: string;
    linkedin?: string;
  };

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.READER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  // Self-referencing many-to-many for followers
  @ManyToMany(() => User, (user) => user.following)
  @JoinTable({
    name: 'user_followers',
    joinColumn: { name: 'followerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followingId', referencedColumnName: 'id' },
  })
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
  following: User[];

  // Virtual fields (not stored in DB, computed at runtime)
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean; // Whether current user follows this user
}
