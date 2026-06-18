import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    return apiSuccess({
      status: "healthy",
      db: "connected",
      redis: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return apiError("Service unhealthy", 503);
  }
}
