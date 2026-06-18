import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { queueService } from "@/lib/services/queue.service";
import { prisma } from "@/lib/prisma";
import { TokenStatus } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tokenId = params.id;
    const body = await request.json();
    const { fromStatus, toStatus } = body;

    if (!fromStatus || !toStatus) {
      return apiError("Both fromStatus and toStatus are required.", 400);
    }

    // Verify token belongs to this doctor
    const token = await prisma.queueToken.findUnique({
      where: { id: tokenId },
      include: {
        queue: true,
      },
    });

    if (!token) {
      return apiError("Token not found.", 404);
    }

    if (token.queue.doctorId !== doctor.id) {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const updatedToken = await queueService.transition(
      tokenId,
      fromStatus as TokenStatus,
      toStatus as TokenStatus,
      userId
    );

    return apiSuccess({ token: updatedToken });
  } catch (error: any) {
    console.error("Token transition error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
