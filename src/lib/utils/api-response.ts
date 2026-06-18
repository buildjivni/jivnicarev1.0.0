import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export const ERRORS = {
  UNAUTHORIZED: "Authentication required.",
  FORBIDDEN: "You do not have permission.",
  NOT_FOUND: "Not found.",
  RATE_LIMITED: "Too many requests. Please slow down.",
  SERVER_ERROR: "Something went wrong. Please try again.",
  INVALID_OTP: "Invalid OTP. Try again.",
  OTP_EXPIRED: "OTP expired. Request a new one.",
  OTP_BLOCKED: "Too many attempts. Try after 15 minutes.",
  BOOKING_LIMIT: "You already have 3 active bookings today.",
  QUEUE_FULL: "No slots available for today.",
  INVALID_STATE: "This action is not allowed at current status.",
  INVALID_DISTRICT: "Service available only in Jamui and Deoghar.",
};
