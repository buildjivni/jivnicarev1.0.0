import { z } from "zod";

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor identifier"),
  date: z.string().datetime("Invalid ISO date format"),
  type: z.enum(["ONLINE", "WALKIN"]),
  idempotencyKey: z.string().uuid("Invalid idempotency key"),
});

export const joinWaitlistSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor identifier"),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number format"),
  name: z.string().min(1, "Name is required").optional(),
});
