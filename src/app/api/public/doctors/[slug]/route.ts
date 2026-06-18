import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import * as Sentry from "@sentry/nextjs";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const doctor = await prisma.doctor.findFirst({
      where: {
        slug,
        verificationStatus: "VERIFIED",
        canShowOnPublic: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        speciality: true,
        clinicName: true,
        clinicAddress: true,
        clinicCity: true,
        clinicDistrict: true,
        clinicPhotos: true,
        consultationFee: true,
        availabilityStatus: true,
        isAcceptingBookings: true,
        partnerTier: true,
        profilePhoto: true,
        bio: true,
        gender: true,
        languages: true,
        isEmergencyEnabled: true,
        emergencyFee: true,
        qualifications: true,
        experienceYears: true,
        expertiseTags: true,
        weeklySchedule: true,
      },
    });

    if (!doctor) {
      return apiError(ERRORS.NOT_FOUND, 404);
    }

    return apiSuccess({ doctor });
  } catch (error) {
    console.error("public doctor profile fetch error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
