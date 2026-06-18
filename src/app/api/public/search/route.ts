import { NextRequest } from "next/server";
import { searchService } from "@/lib/services/search.service";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { rateLimits, applyRateLimit } from "@/lib/utils/rate-limit";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    // 1. Enforce Search Rate Limit (100/hr)
    const limitResponse = await applyRateLimit(request, rateLimits.search);
    if (limitResponse) return limitResponse;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const district = searchParams.get("district");
    const speciality = searchParams.get("speciality") || undefined;
    const feeRange = searchParams.get("feeRange") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const language = searchParams.get("language") || undefined;
    const availableToday = searchParams.get("availableToday") === "true";
    const emergencyOnly = searchParams.get("emergencyOnly") === "true";
    
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const lat = latStr ? parseFloat(latStr) : undefined;
    const lng = lngStr ? parseFloat(lngStr) : undefined;
    
    const pageStr = searchParams.get("page");
    const page = pageStr ? parseInt(pageStr, 10) : 1;

    // 2. Validate district is provided
    if (!district) {
      return apiError("District is required.", 400);
    }

    // 3. Minimum query length check
    if (q.trim().length === 1) {
      return apiSuccess({
        results: [],
        totalCount: 0,
        message: "Type at least 2 characters",
      });
    }

    // 4. Maximum query length check
    if (q.length > 100) {
      return apiError("Search query must not exceed 100 characters.", 400);
    }

    // 5. Execute search
    const searchResult = await searchService.search(
      q,
      {
        district,
        speciality,
        feeRange,
        gender,
        language,
        availableToday,
        emergencyOnly,
      },
      lat,
      lng,
      page
    );

    return apiSuccess(searchResult);
  } catch (error) {
    console.error("public search error:", error);
    Sentry.captureException(error);
    return apiError(ERRORS.SERVER_ERROR, 500);
  }
}
