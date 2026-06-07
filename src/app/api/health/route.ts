import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    await prisma.department.count();
    checks.database = "healthy";
  } catch {
    checks.database = "unhealthy";
  }

  try {
    const redisUrl = process.env.REDIS_URL ?? "";

    if (redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://")) {
      const Redis = (await import("ioredis")).default;
      const redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
      });
      await redis.ping();
      await redis.quit();
    } else if (redisUrl.startsWith("https://")) {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: redisUrl, token: process.env.UPSTASH_REDIS_TOKEN ?? "" });
      await redis.ping();
    } else {
      throw new Error("Unknown REDIS_URL format");
    }

    checks.redis = "healthy";
  } catch {
    checks.redis = "unhealthy";
  }

  const allHealthy = Object.values(checks).every((s) => s === "healthy");

  return Response.json(
    { status: allHealthy ? "healthy" : "degraded", ...checks },
    { status: allHealthy ? 200 : 503 }
  );
}
