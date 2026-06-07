import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Reuse connection across Next.js API reloads to prevent connection leaks
let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    if (redisUrl.startsWith("https://")) {
      console.warn(
        "WARNING: REDIS_URL is configured as an HTTP REST endpoint (Upstash API). BullMQ requires a TCP connection protocol (redis:// or rediss://). Falling back to local lazy connection for build/compatibility."
      );
      redisConnection = new IORedis("redis://127.0.0.1:6379", {
        maxRetriesPerRequest: null,
        lazyConnect: true,
      });
    } else {
      redisConnection = new IORedis(redisUrl, {
        maxRetriesPerRequest: null, // Critical requirement for BullMQ
      });
    }
  }
  return redisConnection;
}

export const timetableQueue = new Queue("timetable-ingestion", {
  connection: getRedisConnection() as any,
});

export const importQueue = new Queue("import-jobs", {
  connection: getRedisConnection() as any,
});
