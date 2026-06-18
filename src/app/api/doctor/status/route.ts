import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { doctorService } from "@/lib/services/doctor.service";
import { prisma } from "@/lib/prisma";
import { AvailabilityStatus } from "@prisma/client";

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
    const { status, breakMessage } = body;

    if (!status || !Object.values(AvailabilityStatus).includes(status)) {
      return apiError("Invalid availability status.", 400);
    }

    const updatedDoctor = await doctorService.updateStatus(
      doctor.id,
      status as AvailabilityStatus,
      breakMessage
    );

    return apiSuccess({ doctor: updatedDoctor });
  } catch (error: any) {
    console.error("Update status error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
