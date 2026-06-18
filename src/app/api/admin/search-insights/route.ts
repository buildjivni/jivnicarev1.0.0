import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    // Top 10 queries overall
    const topQueriesRaw = await prisma.searchLog.groupBy({
      by: ["query"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const topQueries = topQueriesRaw.map((q) => ({
      query: q.query,
      count: q._count.id,
    }));

    // Top 10 zero-result queries
    const zeroResultQueriesRaw = await prisma.searchLog.groupBy({
      by: ["query"],
      where: {
        resultCount: 0,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const zeroResultQueries = zeroResultQueriesRaw.map((q) => ({
      query: q.query,
      count: q._count.id,
    }));

    return apiSuccess({
      topQueries,
      zeroResultQueries,
    });
  } catch (error: any) {
    console.error("Fetch search insights error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
