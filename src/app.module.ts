import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaModule } from './modules/media/media.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticlesModule } from './modules/posts/articles.module';
import { FeedModule } from './modules/feed/feed.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ClapsModule } from './modules/claps/claps.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { StatsModule } from './modules/stats/stats.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Serve static files (for local storage)
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(
            __dirname,
            '..',
            configService.get('UPLOAD_DIR', './uploads'),
          ),
          serveRoot: '/uploads',
          serveStaticOptions: {
            index: false,
            cacheControl: true,
            maxAge: 86400000, // 1 day in milliseconds
          },
        },
      ],
    }),

    // TypeORM configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', true), // Disable in production
        logging: configService.get('DB_LOGGING', true),
        autoLoadEntities: true,
      }),
    }),

    // Rate limiting (throttler)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000, // Convert to ms
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    MediaModule,
    ArticlesModule,
    FeedModule,
    CommentsModule,
    ClapsModule,
    BookmarksModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Apply JWT auth globally (will be overridden by @Public() decorator)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
