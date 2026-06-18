import { z } from "zod";

export const adminVerifyDoctorSchema = z.object({
  verificationNote: z.string().trim().min(5, "Verification note must be at least 5 characters (mandatory)"),
});

export const adminRejectDoctorSchema = z.object({
  rejectionReason: z.string().trim().min(5, "Rejection reason is required"),
});

export const adminBanDoctorSchema = z.object({
  reason: z.string().trim().min(5, "Ban reason is required"),
});

export const adminPricingSchema = z.object({
  doctorId: z.string().uuid(),
  monthlyFee: z.number().min(0).default(2999),
  perBookingFee: z.number().min(0).default(29),
  discountPercent: z.number().min(0).max(100).default(100),
  partnerTier: z.enum(["EARLY_PARTNER", "STANDARD", "PREMIUM"]),
  freeUntil: z.string().datetime().optional(),
});
