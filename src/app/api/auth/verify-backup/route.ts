import { NextRequest } from "next/server";
import { getSession, createJWT, setSessionCookie } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import crypto from "crypto";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify session
    const session = await getSession();
    if (!session || session.role !== "ADMIN_PENDING_MFA") {
      return apiError(ERRORS.UNAUTHORIZED, 401);
    }

    const { code } = await request.json();
    if (!code || typeof code !== "string" || code.length !== 8) {
      return apiError("Backup code must be exactly 8 characters.", 400);
    }

    // 2. Fetch User and Admin records
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.role !== "ADMIN" || !user.email) {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    if (user.isBanned) {
      return apiError("Account suspended.", 403);
    }

    const admin = await prisma.admin.findUnique({ where: { email: user.email } });
    if (!admin) {
      return apiError(ERRORS.NOT_FOUND, 404);
    }

    // 3. Hash the submitted backup code
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    // 4. Find matching unused backup code
    const backupCodeRecord = await prisma.backupCode.findFirst({
      where: {
        adminId: admin.id,
        codeHash,
        used: false,
      },
    });

    if (!backupCodeRecord) {
      return apiError("Invalid or already used backup code.", 400);
    }

    // 5. Mark backup code as used and upgrade session in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.backupCode.update({
        where: { id: backupCodeRecord.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      await tx.admin.update({
        where: { id: admin.id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    });

    // 6. Delete temporary session and upgrade to full ADMIN session
    await prisma.authSession.deleteMany({ where: { id: session.sessionId } });

    const newSession = await prisma.authSession.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const upgradedJwt = await createJWT({
      userId: user.id,
      role: "ADMIN",
      sessionId: newSession.id,
    });
    setSessionCookie(upgradedJwt);

    return apiSuccess({
      message: "Backup code verification successful",
    });
  } catch (error) {
    console.error("verify-backup error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
