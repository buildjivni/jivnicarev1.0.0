import * as OTPAuth from "otpauth";

export function verifyAdminTOTP(token: string, secretBase32: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secretBase32),
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });
    return totp.validate({ token, window: 1 }) !== null;
  } catch (err) {
    console.error("TOTP verification error:", err);
    return false;
  }
}

export function generateTOTPSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

