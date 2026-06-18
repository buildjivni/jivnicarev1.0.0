import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { prisma } from "@/lib/prisma";
import { getLogicalDate } from "@/lib/utils/logical-date";

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const logicalDate = getLogicalDate();

    const queues = await prisma.dailyQueue.findMany({
      where: {
        date: logicalDate,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            speciality: true,
            clinicName: true,
            internalDoctorId: true,
          },
        },
        tokens: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedQueues = queues.map((queue) => {
      const activeCount = queue.tokens.filter((t) =>
        ["BOOKED", "AWAITING_ARRIVAL", "PAYMENT_PENDING", "READY", "CALLED", "IN_CONSULTATION"].includes(t.status)
      ).length;

      const completedCount = queue.tokens.filter((t) => t.status === "COMPLETED").length;
      const noShowCount = queue.tokens.filter((t) => t.status === "NO_SHOW").length;

      return {
        id: queue.id,
        doctorId: queue.doctorId,
        doctorName: queue.doctor.name,
        speciality: queue.doctor.speciality,
        clinicName: queue.doctor.clinicName,
        internalDoctorId: queue.doctor.internalDoctorId,
        date: queue.date,
        type: queue.type,
        status: queue.status,
        dailyLimit: queue.dailyLimit,
        totalTokens: queue.totalTokens,
        activeCount,
        completedCount,
        noShowCount,
      };
    });

    return apiSuccess({ queues: formattedQueues, logicalDate });
  } catch (error: any) {
    console.error("Fetch queue health error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
