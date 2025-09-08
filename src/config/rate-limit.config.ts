import { ThrottlerAsyncOptions } from '@nestjs/throttler';
import { RedisService } from '../infra/redis/redis.service';

export const ratelimitConfig: ThrottlerAsyncOptions = {
  useFactory: (redisService: RedisService) => ({
    throttlers: [{
      ttl: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 900000, // 15 minutes
      limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    }],
    storage: {
      async increment(key: string, ttl: number): Promise<{ totalHits: number; timeToExpire: number }> {
        const client = redisService.getClient();
        const pipeline = client.pipeline();
        pipeline.incr(key);
        pipeline.expire(key, Math.ceil(ttl / 1000));
        const results = await pipeline.exec();
        const totalHits = results[0][1] as number;
        const timeToExpire = ttl;
        return { totalHits, timeToExpire };
      },
    },
  }),
  inject: [RedisService],
};