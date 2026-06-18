import { NextRequest } from "next/server";
import { apiSuccess, apiError, ERRORS } from "@/lib/utils/api-response";
import { prisma } from "@/lib/prisma";
import { encrypt, generatePhoneHash } from "@/lib/services/crypto.service";
import { Role, VerificationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const doctors = await prisma.doctor.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by status
    const grouped = doctors.reduce((acc: any, doc) => {
      const status = doc.verificationStatus;
      if (!acc[status]) acc[status] = [];
      acc[status].push(doc);
      return acc;
    }, {});

    return apiSuccess({ doctors, grouped });
  } catch (error: any) {
    console.error("Fetch admin doctors error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return apiError(ERRORS.FORBIDDEN, 403);
    }

    const body = await request.json();
    const { name, phone, speciality } = body;

    if (!name || !phone || !speciality) {
      return apiError("Name, phone and speciality are required.", 400);
    }

    const phoneHash = generatePhoneHash(phone);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { phoneHash },
    });

    if (user) {
      // Check if this user already has a doctor record
      const existingDoc = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      if (existingDoc) {
        return apiError("A doctor profile already exists for this phone number.", 400);
      }
    }

    // Use a transaction to create User + Doctor records
    const newDoctor = await prisma.$transaction(async (tx) => {
      let createdOrUpdatedUser = user;
      if (!createdOrUpdatedUser) {
        createdOrUpdatedUser = await tx.user.create({
          data: {
            phone: encrypt(phone),
            phoneHash,
            role: Role.DOCTOR,
            authProvider: "PATIENT_OTP",
          },
        });
      } else {
        // Update role to DOCTOR
        createdOrUpdatedUser = await tx.user.update({
          where: { id: user!.id },
          data: { role: Role.DOCTOR },
        });
      }

      // Generate sequence-based internalDoctorId
      const result = await tx.$queryRaw<[{id: string}]>`SELECT generate_doctor_id() as id`;
      const internalDoctorId = result[0].id;
      const slug = `dr-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

      const doctor = await tx.doctor.create({
        data: {
          userId: createdOrUpdatedUser.id,
          internalDoctorId,
          slug,
          name,
          phone,
          speciality,
          registrationNumber: "",
          clinicName: "",
          clinicAddress: "",
          clinicCity: "",
          clinicDistrict: "Jamui",
          operatorName: "",
          operatorMobile: "",
          registrationStep: 1,
          registrationComplete: false,
          verificationStatus: VerificationStatus.PENDING_ACTIVATION,
        },
      });

      return doctor;
    });

    return apiSuccess({ doctor: newDoctor });
  } catch (error: any) {
    console.error("Admin onboard doctor error:", error);
    return apiError(error.message || ERRORS.SERVER_ERROR, 500);
  }
}
