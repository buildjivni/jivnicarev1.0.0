// See logical date timezone formula in docs/01-backend-schema.md (Canonical Source of Truth)

export function getLogicalDate(now = new Date()): Date {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + IST_OFFSET);
  const hours = istNow.getUTCHours();

  const logicalDate = new Date(istNow);
  if (hours < 4) {
    logicalDate.setUTCDate(logicalDate.getUTCDate() - 1);
  }

  logicalDate.setUTCHours(0, 0, 0, 0);
  return logicalDate;
}
