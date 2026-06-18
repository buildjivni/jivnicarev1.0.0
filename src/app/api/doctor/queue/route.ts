import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { prisma } from "@/lib/prisma";
import { getLogicalDate } from "@/lib/utils/logical-date";
import { TokenStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return apiError(ERRORS.UNAUTHORIZED, 401);
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return apiError("Doctor profile not found.", 404);
    }

    const logicalDate = getLogicalDate();

    const queues = await prisma.dailyQueue.findMany({
      where: {
        doctorId: doctor.id,
        date: logicalDate,
      },
      include: {
        tokens: {
          orderBy: { tokenNumber: "asc" },
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return apiSuccess({ queues, logicalDate });
  } catch (error: any) {
    console.error("Fetch doctor queues error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
