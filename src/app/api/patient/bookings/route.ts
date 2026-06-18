import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return apiError(ERRORS.UNAUTHORIZED, 401);
    }

    const bookings = await prisma.queueToken.findMany({
      where: {
        patientId: userId,
      },
      include: {
        queue: {
          select: {
            id: true,
            date: true,
            status: true,
            type: true,
            doctor: {
              select: {
                id: true,
                name: true,
                slug: true,
                speciality: true,
                clinicName: true,
                clinicAddress: true,
                clinicCity: true,
                clinicDistrict: true,
                profilePhoto: true,
                partnerTier: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return apiSuccess({ bookings });
  } catch (error) {
    console.error("patient bookings fetch error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
