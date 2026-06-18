import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { doctorService } from "@/lib/services/doctor.service";
import {
  doctorRegisterStep1Schema,
  doctorRegisterStep2Schema,
  doctorRegisterStep3Schema,
  doctorRegisterStep4Schema,
} from "@/lib/schemas/doctor.schema";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return apiError(ERRORS.UNAUTHORIZED, 401);
    }

    const body = await request.json();
    const step = parseInt(body.step, 10);

    if (isNaN(step) || step < 1 || step > 4) {
      return apiError("Invalid step number.", 400);
    }

    const payload = body.data || body;
    let validatedData;

    try {
      if (step === 1) {
        validatedData = doctorRegisterStep1Schema.parse(payload);
      } else if (step === 2) {
        validatedData = doctorRegisterStep2Schema.parse(payload);
      } else if (step === 3) {
        validatedData = doctorRegisterStep3Schema.parse(payload);
      } else if (step === 4) {
        validatedData = doctorRegisterStep4Schema.parse(payload);
      }
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        return apiError(zodError.errors[0].message, 400);
      }
      throw zodError;
    }

    const doctor = await doctorService.register(userId, step, validatedData);
    return apiSuccess({ doctor });
  } catch (error: any) {
    console.error("Doctor registration error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
