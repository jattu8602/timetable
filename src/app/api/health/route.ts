import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "healthy";
  } catch {
    checks.database = "unhealthy";
  }

  try {
    const Redis = (await import("ioredis")).default;
    const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
    });
    await redis.ping();
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
