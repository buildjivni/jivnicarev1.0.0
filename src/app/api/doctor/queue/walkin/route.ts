import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { queueService } from "@/lib/services/queue.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const walkinSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number format"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export async function POST(request: NextRequest) {
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
    const result = walkinSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    const { name, phone, address } = result.data;
    const token = await queueService.createWalkin(
      doctor.id,
      new Date(),
      name,
      phone,
      address,
      userId
    );

    return apiSuccess({ token });
  } catch (error: any) {
    console.error("Walkin registration error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
