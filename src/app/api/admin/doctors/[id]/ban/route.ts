import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { adminService } from "@/lib/services/admin.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!adminId || userRole !== "ADMIN") {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const doctorId = params.id;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === "") {
      return apiError("Ban reason is required.", 400);
    }

    const doctor = await adminService.banDoctor(doctorId, adminId, reason);
    return apiSuccess({ doctor });
  } catch (error: any) {
    console.error("Doctor ban error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
