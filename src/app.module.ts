import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Infrastructure modules
import { PrismaModule } from './infra/prisma/prisma.module';
import { RedisModule } from './infra/redis/redis.module';
import { CryptoModule } from './infra/crypto/crypto.module';
import { LoggerModule } from './infra/logger/logger.module';
import { StorageModule } from './infra/storage/storage.module';

// Application modules
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FilesModule } from './modules/files/files.module';

// Configuration
import { appConfig } from './config/app.config';
import { securityConfig } from './config/security.config';
import { ratelimitConfig } from './config/rate-limit.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, securityConfig],
    }),

    // Throttling/Rate limiting
    ThrottlerModule.forRootAsync(ratelimitConfig),

    // Scheduler for jobs
    ScheduleModule.forRoot(),

    // Infrastructure
    PrismaModule,
    RedisModule,
    CryptoModule,
    LoggerModule,
    StorageModule,

    // Application modules
    AuthModule,
    AccountModule,
    UsersModule,
    ClientsModule,
    ContractsModule,
    TicketsModule,
    DashboardModule,
    FilesModule,
  ],
})
export class AppModule {}