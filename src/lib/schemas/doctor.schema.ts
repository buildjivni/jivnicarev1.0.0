import { z } from "zod";

export const doctorRegisterStep1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number format"),
  speciality: z.string().min(1, "Speciality is required"),
});

export const doctorRegisterStep2Schema = z.object({
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters"),
  clinicAddress: z.string().min(5, "Full clinic address is required"),
  clinicCity: z.string().min(2, "City is required"),
  clinicDistrict: z.enum(["Jamui", "Deoghar"], {
    errorMap: () => ({ message: "Service is restricted to Jamui and Deoghar districts only" }),
  }),
  clinicPincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  operatorName: z.string().min(2, "Operator name is required"),
  operatorMobile: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number format"),
  receptionist1Name: z.string().optional(),
  receptionist1Phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid format").optional().or(z.literal("")),
});

export const doctorRegisterStep3Schema = z.object({
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  registrationNumber: z.string().min(1, "NMC Medical Registration Number is required"),
  qualifications: z.array(z.string()).min(1, "At least one qualification is required"),
  experienceYears: z.number().min(0).max(60),
  bio: z.string().max(500).optional(),
  languages: z.array(z.string()).default(["Hindi"]),
  profilePhoto: z.string().url("Invalid profile photo URL").optional(),
  clinicPhotos: z.array(z.string().url()).max(3, "Max 3 clinic photos allowed"),
  documents: z.array(z.string().url()).min(1, "Upload registration credentials").max(10),
  isEmergencyEnabled: z.boolean().default(false),
  emergencyCapacity: z.number().min(0).default(0),
  expertiseTags: z.array(z.string()).optional(),
  diseases: z.array(z.string()).optional(),
  procedures: z.array(z.string()).optional(),
});

export const doctorRegisterStep4Schema = z.object({
  weeklySchedule: z.record(z.object({
    isActive: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  })),
  bookingWindowStart: z.string(),
  bookingWindowEnd: z.string(),
  dailyTokenLimit: z.number().min(1).max(100),
  consultationFee: z.number().min(0).max(2000),
});
