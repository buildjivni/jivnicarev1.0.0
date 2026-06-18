import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginGoogleUser } from "@/lib/services/auth.service";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const code = nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", nextUrl.origin));
  }

  try {
    let email = "";
    let name = "";
    let googleId = "";

    // 1. Check if mock login code is provided (for dev/test validation)
    if (code.startsWith("mock_code_")) {
      const role = code.replace("mock_code_", "");
      if (role === "admin") {
        email = "admin@jivnicare.com";
        name = "System Administrator";
        googleId = "mock_admin_google_id";
      } else {
        // Find any doctor in the database to log in as them
        const doc = await prisma.doctor.findFirst();
        if (doc) {
          email = doc.email || "doctor@jivnicare.com";
          name = doc.name;
          googleId = "mock_doctor_google_id";
        } else {
          email = "doctor@jivnicare.com";
          name = "Dr. Test Doctor";
          googleId = "mock_doctor_google_id";
        }
      }
    } else {
      // 2. Perform real Google OAuth Exchange
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: `${nextUrl.origin}/api/auth/google/callback`,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Google token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokens = await tokenResponse.json();
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userResponse.ok) {
        throw new Error(`Google userinfo fetch failed: ${userResponse.statusText}`);
      }

      const googleUser = await userResponse.json();
      email = googleUser.email;
      name = googleUser.name;
      googleId = googleUser.sub;
    }

    // 3. Login User via Auth Service
    const loginResult = await loginGoogleUser(email, googleId, name);
    if (!loginResult.success) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(loginResult.message || "forbidden")}`, nextUrl.origin));
    }

    // 4. Route based on MFA requirement
    if (loginResult.mfaRequired) {
      return NextResponse.redirect(new URL("/admin/totp", nextUrl.origin));
    } else {
      return NextResponse.redirect(new URL("/doctor/dashboard", nextUrl.origin));
    }
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    Sentry.captureException(error);
    return NextResponse.redirect(new URL("/login?error=server_error", nextUrl.origin));
  }
}
