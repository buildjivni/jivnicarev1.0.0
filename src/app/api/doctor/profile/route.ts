import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { doctorService } from "@/lib/services/doctor.service";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return apiError(ERRORS.UNAUTHORIZED, 401);
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!doctor) {
      return apiError("Doctor profile not found.", 404);
    }

    return apiSuccess({ doctor });
  } catch (error: any) {
    console.error("Fetch doctor profile error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}

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

    if (body.weeklySchedule !== undefined) {
      const updatedDoctor = await doctorService.updateSchedule(doctor.id, body.weeklySchedule);
      return apiSuccess({ doctor: updatedDoctor });
    }

    // Support updating other basic fields
    const allowedUpdates: Record<string, any> = {};
    const updatableKeys = [
      "name",
      "phone",
      "email",
      "gender",
      "profilePhoto",
      "bio",
      "languages",
      "consultationFee",
      "dailyTokenLimit",
      "clinicName",
      "clinicAddress",
      "clinicPincode",
      "operatorName",
      "operatorMobile",
      "receptionist1Name",
      "receptionist1Phone",
      "receptionist2Name",
      "receptionist2Phone",
      "receptionist3Name",
      "receptionist3Phone",
    ];

    for (const key of updatableKeys) {
      if (body[key] !== undefined) {
        allowedUpdates[key] = body[key];
      }
    }

    if (Object.keys(allowedUpdates).length > 0) {
      const updatedDoctor = await prisma.doctor.update({
        where: { id: doctor.id },
        data: allowedUpdates,
      });
      return apiSuccess({ doctor: updatedDoctor });
    }

    return apiError("No valid fields to update.", 400);
  } catch (error: any) {
    console.error("Update doctor profile error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
