import { NextRequest } from "next/server";
import { getSession } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/services/crypto.service";
import { generateTOTPSecret } from "@/lib/utils/totp";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify session is in PENDING_MFA state
    const session = await getSession();
    if (!session || session.role !== "ADMIN_PENDING_MFA") {
      return apiError(ERRORS.UNAUTHORIZED, 401);
    }

    // 2. Fetch User and Admin records
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.role !== "ADMIN" || !user.email) {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const admin = await prisma.admin.findUnique({ where: { email: user.email } });
    if (!admin) {
      return apiError(ERRORS.NOT_FOUND, 404);
    }

    // 3. Block setup if TOTP is already enabled
    if (admin.totpEnabled) {
      return apiError("MFA is already configured.", 400);
    }

    // 4. Generate new Base32 TOTP secret
    const secret = generateTOTPSecret();
    const encryptedSecret = encrypt(secret);

    // 5. Save the encrypted secret to the database
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        totpSecret: encryptedSecret,
      },
    });

    // 6. Generate QR Code Provisioning URI
    const label = `JivniCare:${admin.email}`;
    const qrCodeUri = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=JivniCare&algorithm=SHA1&digits=6&period=30`;

    return apiSuccess({
      secret,
      qrCodeUri,
      email: admin.email,
    });
  } catch (error) {
    console.error("setup-totp error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
