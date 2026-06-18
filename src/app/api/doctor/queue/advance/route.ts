import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { queueService } from "@/lib/services/queue.service";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { queueId, action } = body;

    if (!queueId) {
      return apiError("Queue ID is required.", 400);
    }

    if (action !== "CALL_NEXT" && action !== "COMPLETE") {
      return apiError("Invalid action. Must be CALL_NEXT or COMPLETE.", 400);
    }

    // Verify that the queue belongs to this doctor
    const queue = await prisma.dailyQueue.findUnique({
      where: { id: queueId },
    });

    if (!queue) {
      return apiError("Queue not found.", 404);
    }

    if (queue.doctorId !== doctor.id) {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const res = await queueService.advance(queueId, action, userId);
    return apiSuccess(res);
  } catch (error: any) {
    console.error("Queue advance error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
