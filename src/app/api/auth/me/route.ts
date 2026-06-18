import { NextRequest } from "next/server";
import { getSession } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/services/crypto.service";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError(ERRORS.UNAUTHORIZED, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError(ERRORS.NOT_FOUND, 404);
    }

    if (user.isBanned || !user.isActive) {
      return apiError("Account suspended or inactive.", 403);
    }

    // Decrypt the phone number for the user's own display
    const decryptedPhone = user.phone ? decrypt(user.phone) : "";

    return apiSuccess({
      user: {
        ...user,
        phone: decryptedPhone,
      },
    });
  } catch (error) {
    console.error("me error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
