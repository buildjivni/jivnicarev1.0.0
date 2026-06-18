import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { prisma } from "@/lib/prisma";
import { getLogicalDate } from "@/lib/utils/logical-date";
import { AvailabilityStatus, QueueType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const logicalDate = getLogicalDate();

    // 1. Online Doctors
    const onlineDoctors = await prisma.doctor.count({
      where: {
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        deletedAt: null,
      },
    });

    // 2. Daily queues today
    const queueCount = await prisma.dailyQueue.count({
      where: {
        date: logicalDate,
      },
    });

    // 3. Emergency queues today
    const emergencyQueueCount = await prisma.dailyQueue.count({
      where: {
        date: logicalDate,
        type: QueueType.EMERGENCY,
      },
    });

    // 4. Booking counts today
    const bookingsCount = await prisma.queueToken.count({
      where: {
        queue: {
          date: logicalDate,
        },
      },
    });

    // 5. Pending verifications
    const pendingVerifications = await prisma.doctor.count({
      where: {
        verificationStatus: "PENDING_REVIEW",
      },
    });

    return apiSuccess({
      onlineDoctors,
      queueCount,
      emergencyQueueCount,
      bookingsCount,
      pendingVerifications,
      logicalDate,
    });
  } catch (error: any) {
    console.error("Fetch admin stats error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
