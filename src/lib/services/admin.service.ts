import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { getLogicalDate } from "@/lib/utils/logical-date";
import { createAuditLog } from "@/lib/services/audit.service";
import { sendNotification } from "@/lib/services/notification.service";
import { PartnerTier, VerificationStatus, AvailabilityStatus, TokenStatus, Role, AuditAction } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

export class AdminService {
  /**
   * Verify Doctor Workflow
   */
  async verifyDoctor(doctorId: string, adminId: string, verificationNote: string) {
    if (!verificationNote || verificationNote.trim() === "") {
      throw new Error("Verification note is required.");
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) throw new Error("Doctor not found.");

    const updatedDoctor = await prisma.$transaction(async (tx) => {
      // 1. Update verification details
      const doc = await tx.doctor.update({
        where: { id: doctorId },
        data: {
          verificationStatus: VerificationStatus.VERIFIED,
          canShowOnPublic: true,
          isAcceptingBookings: true,
          verifiedAt: new Date(),
          verifiedBy: adminId,
          verificationNote,
        },
      });

      // 2. Also ensure the linked user role is updated to DOCTOR
      await tx.user.update({
        where: { id: doctor.userId },
        data: { role: Role.DOCTOR },
      });

      return doc;
    });

    // Create Audit Log
    createAuditLog({
      userId: adminId,
      role: Role.ADMIN,
      action: AuditAction.UPDATE,
      entityType: "Doctor",
      entityId: doctorId,
      newValue: { verificationStatus: VerificationStatus.VERIFIED, verificationNote },
    });

    // Send email notification to doctor
    sendNotification(
      doctor.userId,
      "Congratulations! Your JivniCare doctor registration is approved and active.",
      "EMAIL"
    ).catch(() => {});

    return updatedDoctor;
  }

  /**
   * Reject Doctor Workflow
   */
  async rejectDoctor(doctorId: string, adminId: string, rejectionReason: string) {
    if (!rejectionReason || rejectionReason.trim() === "") {
      throw new Error("Rejection reason is required.");
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) throw new Error("Doctor not found.");

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        canShowOnPublic: false,
        isAcceptingBookings: false,
        rejectionReason,
      },
    });

    // Create Audit Log
    createAuditLog({
      userId: adminId,
      role: Role.ADMIN,
      action: AuditAction.UPDATE,
      entityType: "Doctor",
      entityId: doctorId,
      newValue: { verificationStatus: VerificationStatus.REJECTED, rejectionReason },
    });

    // Send notification to doctor
    sendNotification(
      doctor.userId,
      `Your JivniCare registration request was declined. Reason: ${rejectionReason}`,
      "EMAIL"
    ).catch(() => {});

    return updatedDoctor;
  }

  /**
   * Ban Doctor Workflow (Strict Order)
   */
  async banDoctor(doctorId: string, adminId: string, reason: string) {
    if (!reason || reason.trim() === "") {
      throw new Error("Ban reason is required.");
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) throw new Error("Doctor not found.");

    const result = await prisma.$transaction(async (tx) => {
      // 1. doctor.verificationStatus = SUSPENDED
      // 2. doctor.canShowOnPublic = false
      // 3. doctor.isAcceptingBookings = false
      // 4. doctor.availabilityStatus = OFFLINE
      const doc = await tx.doctor.update({
        where: { id: doctorId },
        data: {
          verificationStatus: VerificationStatus.SUSPENDED,
          canShowOnPublic: false,
          isAcceptingBookings: false,
          availabilityStatus: AvailabilityStatus.OFFLINE,
        },
      });

      // 5. Update user banned fields
      await tx.user.update({
        where: { id: doctor.userId },
        data: {
          isBanned: true,
          bannedAt: new Date(),
          bannedReason: reason,
        },
      });

      // 6. Delete all doctor auth_sessions (immediate session revocation)
      await tx.authSession.deleteMany({
        where: { userId: doctor.userId },
      });

      // 7. Find active patients booked in today's queue to notify them
      const logicalDate = getLogicalDate();
      const activeTokens = await tx.queueToken.findMany({
        where: {
          queue: {
            doctorId,
            date: logicalDate,
          },
          status: {
            in: [TokenStatus.BOOKED, TokenStatus.AWAITING_ARRIVAL, TokenStatus.PAYMENT_PENDING, TokenStatus.READY],
          },
        },
        select: {
          id: true,
          patientId: true,
          tokenNumber: true,
        },
      });

      return { doc, activeTokens };
    });

    // 8. Invalidate active queue caches
    const todayQueue = await prisma.dailyQueue.findFirst({
      where: {
        doctorId,
        date: getLogicalDate(),
      },
    });
    if (todayQueue) {
      await redis.del(`queue:${todayQueue.id}`).catch(() => {});
    }

    // 9. Log Audit action: BAN
    createAuditLog({
      userId: adminId,
      role: Role.ADMIN,
      action: AuditAction.BAN,
      entityType: "Doctor",
      entityId: doctorId,
      newValue: { reason },
    });

    // 10. Send notification to doctor
    sendNotification(
      doctor.userId,
      `Your Doctor account has been SUSPENDED by JivniCare. Reason: ${reason}`,
      "EMAIL"
    ).catch(() => {});

    // 11. Send notifications to patients in queue
    for (const token of result.activeTokens) {
      if (token.patientId) {
        sendNotification(
          token.patientId,
          `Appointment update: Dr. ${doctor.name} is unavailable today. You can choose to cancel your Token #${token.tokenNumber}.`,
          "IN_APP"
        ).catch(() => {});
      }
    }

    return result.doc;
  }

  /**
   * Configure platform pricing
   */
  async configurePricing(
    doctorId: string,
    pricing: {
      monthlyFee?: number;
      perBookingFee?: number;
      discountPercent?: number;
      partnerTier: PartnerTier;
      freeUntil?: Date;
    }
  ) {
    const updatedPricing = await prisma.$transaction(async (tx) => {
      // 1. Update doctor partnerTier
      await tx.doctor.update({
        where: { id: doctorId },
        data: {
          partnerTier: pricing.partnerTier,
        },
      });

      // 2. Upsert PlatformPricing details
      return tx.platformPricing.upsert({
        where: { doctorId },
        update: {
          monthlyFee: pricing.monthlyFee ?? 0,
          perBookingFee: pricing.perBookingFee ?? 0,
          discountPercent: pricing.discountPercent ?? 100, // default 100% discount for V1
          freeUntil: pricing.freeUntil || null,
        },
        create: {
          doctorId,
          monthlyFee: pricing.monthlyFee ?? 0,
          perBookingFee: pricing.perBookingFee ?? 0,
          discountPercent: pricing.discountPercent ?? 100,
          freeUntil: pricing.freeUntil || null,
        },
      });
    });

    // Log audit
    createAuditLog({
      action: AuditAction.UPDATE,
      entityType: "PlatformPricing",
      entityId: doctorId,
      newValue: pricing,
    });

    return updatedPricing;
  }
}

export const adminService = new AdminService();
