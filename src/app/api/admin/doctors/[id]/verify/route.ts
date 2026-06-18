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
    const { action, note, reason } = body;

    if (action === "APPROVE") {
      if (!note || note.trim() === "") {
        return apiError("Verification note is required.", 400);
      }
      const doctor = await adminService.verifyDoctor(doctorId, adminId, note);
      return apiSuccess({ doctor });
    } else if (action === "REJECT") {
      if (!reason || reason.trim() === "") {
        return apiError("Rejection reason is required.", 400);
      }
      const doctor = await adminService.rejectDoctor(doctorId, adminId, reason);
      return apiSuccess({ doctor });
    } else {
      return apiError("Invalid action. Must be APPROVE or REJECT.", 400);
    }
  } catch (error: any) {
    console.error("Doctor verification error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
