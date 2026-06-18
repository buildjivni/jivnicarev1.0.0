import { NextRequest } from "next/server";
import { getSession, createJWT, setSessionCookie } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/services/crypto.service";
import { verifyAdminTOTP } from "@/lib/utils/totp";
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

    const { token } = await request.json();
    if (!token || typeof token !== "string" || token.length !== 6) {
      return apiError("Verification code must be exactly 6 digits.", 400);
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

    // 3. Decrypt the stored TOTP secret
    const decryptedSecret = decrypt(admin.totpSecret);
    if (!decryptedSecret) {
      return apiError("TOTP secret key is unconfigured. Please restart setup.", 400);
    }

    // 4. Validate TOTP token
    const isTokenValid = verifyAdminTOTP(token, decryptedSecret);
    if (!isTokenValid) {
      return apiError("Invalid verification code. Please try again.", 400);
    }

    const isFirstTimeSetup = !admin.totpEnabled;
    let plainBackupCodes: string[] = [];

    // 5. Atomic setup of backup codes on first-time login
    if (isFirstTimeSetup) {
      // Generate 10 backup codes of 8 hex characters (4 random bytes)
      const codes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString("hex")
      );
      plainBackupCodes = codes;

      await prisma.$transaction(async (tx) => {
        // Delete any existing backup codes for safety
        await tx.backupCode.deleteMany({ where: { adminId: admin.id } });

        // Insert new hashed backup codes
        await tx.backupCode.createMany({
          data: codes.map((c) => ({
            adminId: admin.id,
            codeHash: crypto.createHash("sha256").update(c).digest("hex"),
            used: false,
          })),
        });

        // Set totpEnabled true
        await tx.admin.update({
          where: { id: admin.id },
          data: {
            totpEnabled: true,
            lastLoginAt: new Date(),
          },
        });
      });
    } else {
      // Subsequent login: update last login timestamp
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    }

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
      message: "Admin verification successful",
      backupCodes: isFirstTimeSetup ? plainBackupCodes : undefined,
    });
  } catch (error) {
    console.error("verify-totp error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
