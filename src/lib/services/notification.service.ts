import { prisma } from "@/lib/prisma";
import { NotificationType, NotificationStatus } from "@prisma/client";

export class NotificationService {
  /**
   * Unified notification dispatcher
   */
  async sendNotification(
    userId: string,
    message: string,
    method: "IN_APP" | "SMS" | "EMAIL" = "IN_APP",
    type: NotificationType = NotificationType.SYSTEM
  ) {
    if (method === "IN_APP") {
      return this.sendInAppNotification(userId, "JivniCare Notification", message, type);
    } else if (method === "SMS") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.phone) {
        const { decrypt } = await import("./crypto.service");
        const decryptedPhone = decrypt(user.phone);
        return this.sendSMS(decryptedPhone, message);
      }
    } else if (method === "EMAIL") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        return this.sendEmail(user.email, "Notification from JivniCare", `<p>${message}</p>`);
      }
    }
    return null;
  }

  /**
   * Creates an in-app Notification database entry
   */
  async sendInAppNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          status: NotificationStatus.SENT,
        },
      });
      return notification;
    } catch (err) {
      console.error("Failed to create in-app notification:", err);
      return null;
    }
  }

  /**
   * Dispatches SMS using the 2Factor.in gateway
   */
  async sendSMS(phone: string, message: string) {
    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      console.warn(`[SMS Mock] Send to ${phone}: ${message}`);
      return true;
    }

    try {
      // Direct transactional SMS template route for 2Factor.in
      const res = await fetch(
        `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            From: "JIVNIC",
            To: phone,
            Msg: message,
          }),
        }
      );
      return res.ok;
    } catch (err) {
      console.error("Failed to send transactional SMS:", err);
      return false;
    }
  }

  /**
   * Sends transactional email using Resend API
   */
  async sendEmail(to: string, subject: string, htmlContent: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@jivnicare.com";

    if (!apiKey) {
      console.warn(`[Email Mock] Send to ${to} (Subject: ${subject})`);
      return true;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to,
          subject,
          html: htmlContent,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
      return false;
    }
  }

  /**
   * Sends push notification (PWA Service Worker)
   */
  async sendPushNotification(subscription: any, payload: any) {
    // Stub for Web Push V1
    console.log("Web Push dispatched to subscription:", subscription, payload);
    return null;
  }
}

export const notificationService = new NotificationService();

// Export legacy helper function to prevent breaking imports
export const sendNotification = (
  userId: string,
  message: string,
  method: "IN_APP" | "SMS" | "EMAIL" = "IN_APP",
  type: NotificationType = NotificationType.SYSTEM
) => notificationService.sendNotification(userId, message, method, type);
