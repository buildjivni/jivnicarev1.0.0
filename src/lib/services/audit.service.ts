import { prisma } from "@/lib/prisma";
import { AuditAction, Role } from "@prisma/client";

export function createAuditLog(data: {
  userId?: string;
  role?: Role;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: object;
  newValue?: object;
  ipAddress?: string;
}) {
  // Fire and forget — never blocks the main execution flow
  prisma.auditLog
    .create({
      data: {
        userId: data.userId || null,
        role: data.role || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        oldValue: data.oldValue ? JSON.stringify(data.oldValue) : undefined,
        newValue: data.newValue ? JSON.stringify(data.newValue) : undefined,
        ipAddress: data.ipAddress || null,
      },
    })
    .catch((err) => {
      console.error("AuditLog creation failed:", err);
    });
}
