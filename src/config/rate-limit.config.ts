import { ThrottlerAsyncOptions } from '@nestjs/throttler';

export const ratelimitConfig: ThrottlerAsyncOptions = {
  useFactory: () => ({
    throttlers: [{
      ttl: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 900000, // 15 minutes
      limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    }],
  }),
};