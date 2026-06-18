import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { adminService } from "@/lib/services/admin.service";
import { PartnerTier } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const body = await request.json();
    const {
      doctorId,
      monthlyFee,
      perBookingFee,
      discountPercent,
      partnerTier,
      freeUntil,
    } = body;

    if (!doctorId) {
      return apiError("Doctor ID is required.", 400);
    }

    if (partnerTier && !Object.values(PartnerTier).includes(partnerTier)) {
      return apiError("Invalid partner tier.", 400);
    }

    const updatedPricing = await adminService.configurePricing(doctorId, {
      monthlyFee: monthlyFee !== undefined ? Number(monthlyFee) : undefined,
      perBookingFee: perBookingFee !== undefined ? Number(perBookingFee) : undefined,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : undefined,
      partnerTier: partnerTier as PartnerTier,
      freeUntil: freeUntil ? new Date(freeUntil) : undefined,
    });

    return apiSuccess({ pricing: updatedPricing });
  } catch (error: any) {
    console.error("Configure pricing error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
