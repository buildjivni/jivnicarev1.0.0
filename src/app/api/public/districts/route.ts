import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    const districts = await prisma.district.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return apiSuccess({ districts });
  } catch (error) {
    console.error("public districts fetch error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
