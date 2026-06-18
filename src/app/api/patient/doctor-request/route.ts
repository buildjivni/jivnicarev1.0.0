import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const doctorRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number format"),
  district: z.string().min(1, "District is required"),
  speciality: z.string().min(1, "Speciality is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate input
    const result = doctorRequestSchema.safeParse(body);
    if (!result.success) {
      return apiError("Invalid input provided.", 400);
    }
    const { name, phone, district, speciality } = result.data;

    // 2. Validate district is active (Jamui or Deoghar only in V1)
    const districtRecord = await prisma.district.findFirst({
      where: {
        name: { equals: district, mode: "insensitive" },
        isActive: true,
      },
    });

    if (!districtRecord) {
      return apiError(ERRORS.INVALID_DISTRICT, 400);
    }

    // 3. Create DoctorRequest record
    const docRequest = await prisma.doctorRequest.create({
      data: {
        name,
        phone,
        district,
        speciality,
      },
    });

    return apiSuccess({
      message: "Request submitted successfully",
      id: docRequest.id,
    });
  } catch (error) {
    console.error("doctor request error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
