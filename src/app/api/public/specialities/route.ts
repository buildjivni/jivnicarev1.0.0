import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    const specialities = await prisma.speciality.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return apiSuccess({ specialities });
  } catch (error) {
    console.error("public specialities fetch error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
