import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { getLogicalDate } from "@/lib/utils/logical-date";
import { TokenStatus, QueueStatus, AvailabilityStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Authorization Header
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const logicalDate = getLogicalDate();

    // 2. Execute database updates atomically
    const result = await prisma.$transaction(async (tx) => {
      // a. Expire active tokens today and older
      const tokenUpdate = await tx.queueToken.updateMany({
        where: {
          status: {
            in: [
              TokenStatus.BOOKED,
              TokenStatus.AWAITING_ARRIVAL,
              TokenStatus.PAYMENT_PENDING,
              TokenStatus.READY,
              TokenStatus.CALLED,
              TokenStatus.IN_CONSULTATION,
            ],
          },
          queue: {
            date: {
              lte: logicalDate,
            },
          },
        },
        data: {
          status: TokenStatus.EXPIRED,
        },
      });

      // b. Close daily queues today and older
      const queueUpdate = await tx.dailyQueue.updateMany({
        where: {
          date: {
            lte: logicalDate,
          },
          status: QueueStatus.ACTIVE,
        },
        data: {
          status: QueueStatus.CLOSED,
        },
      });

      // c. Find all daily queues that were closed to invalidate their redis caches
      const closedQueues = await tx.dailyQueue.findMany({
        where: {
          date: {
            lte: logicalDate,
          },
        },
        select: {
          id: true,
        },
      });

      // d. Reset doctor availability to OFFLINE
      const doctorUpdate = await tx.doctor.updateMany({
        where: {
          deletedAt: null,
        },
        data: {
          availabilityStatus: AvailabilityStatus.OFFLINE,
          isAcceptingBookings: false,
          breakMessage: null,
        },
      });

      // e. Update stats: Increment patient counters for doctors who completed sessions today
      const completedTokensGrouped = await tx.queueToken.groupBy({
        by: ["queueId"],
        where: {
          status: TokenStatus.COMPLETED,
          queue: {
            date: logicalDate,
          },
        },
        _count: {
          id: true,
        },
      });

      let statsUpdatedCount = 0;
      for (const group of completedTokensGrouped) {
        const queue = await tx.dailyQueue.findUnique({
          where: { id: group.queueId },
          select: { doctorId: true },
        });

        if (queue) {
          await tx.doctor.update({
            where: { id: queue.doctorId },
            data: {
              jivnicarePatientsServed: {
                increment: group._count.id,
              },
              lifetimePatientsServed: {
                increment: group._count.id,
              },
            },
          });
          statsUpdatedCount += group._count.id;
        }
      }

      // f. Purge search logs older than 90 days
      const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const searchLogPurge = await tx.searchLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      return {
        expiredTokens: tokenUpdate.count,
        closedQueues: queueUpdate.count,
        closedQueueIds: closedQueues.map((q) => q.id),
        resetDoctors: doctorUpdate.count,
        statsUpdatedCount,
        purgedSearchLogs: searchLogPurge.count,
      };
    });

    // 3. Clear Redis cache for all closed queues
    for (const queueId of result.closedQueueIds) {
      await redis.del(`queue:${queueId}`).catch((err) => {
        console.error(`Redis del failed for queue:${queueId}`, err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Midnight cleanup cron completed successfully.",
      summary: {
        expiredTokens: result.expiredTokens,
        closedQueues: result.closedQueues,
        resetDoctors: result.resetDoctors,
        statsUpdatedCount: result.statsUpdatedCount,
        purgedSearchLogs: result.purgedSearchLogs,
      },
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
