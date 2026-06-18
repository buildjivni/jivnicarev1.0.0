-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('PATIENT_OTP', 'GOOGLE_OAUTH');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING_ACTIVATION', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'ON_BREAK', 'OFFLINE');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('BOOKED', 'AWAITING_ARRIVAL', 'PAYMENT_PENDING', 'READY', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('ONLINE', 'WALKIN');

-- CreateEnum
CREATE TYPE "QueueType" AS ENUM ('REGULAR', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'TOKEN_CALLED', 'QUEUE_UPDATE', 'DOCTOR_STATUS_CHANGE', 'VERIFICATION_STATUS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VERIFY', 'REJECT', 'BAN', 'UNBAN', 'BOOK', 'CANCEL', 'ADVANCE', 'COMPLETE', 'NO_SHOW', 'STATUS_CHANGE', 'EMERGENCY_ENABLE', 'EMERGENCY_DISABLE');

-- CreateEnum
CREATE TYPE "PartnerTier" AS ENUM ('EARLY_PARTNER', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneHash" TEXT,
    "name" TEXT,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PATIENT',
    "googleId" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'PATIENT_OTP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "bannedReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "internalDoctorId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "gender" "Gender",
    "profilePhoto" TEXT,
    "bio" TEXT,
    "languages" TEXT[] DEFAULT ARRAY['Hindi']::TEXT[],
    "speciality" TEXT NOT NULL,
    "qualifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "registrationNumber" TEXT NOT NULL,
    "expertiseTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "diseases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "procedures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clinicName" TEXT NOT NULL,
    "clinicAddress" TEXT NOT NULL,
    "clinicCity" TEXT NOT NULL,
    "clinicDistrict" TEXT NOT NULL,
    "clinicPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clinicPincode" TEXT,
    "clinicLatitude" DOUBLE PRECISION,
    "clinicLongitude" DOUBLE PRECISION,
    "operatorName" TEXT NOT NULL,
    "operatorMobile" TEXT NOT NULL,
    "receptionist1Name" TEXT,
    "receptionist1Phone" TEXT,
    "receptionist2Name" TEXT,
    "receptionist2Phone" TEXT,
    "receptionist3Name" TEXT,
    "receptionist3Phone" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "verificationNote" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "rejectionReason" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isEmergencyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emergencyCapacity" INTEGER NOT NULL DEFAULT 0,
    "emergencyApprovedAt" TIMESTAMP(3),
    "emergencyApprovedBy" TEXT,
    "emergencyPendingRequest" BOOLEAN NOT NULL DEFAULT false,
    "offersEmergency" BOOLEAN NOT NULL DEFAULT false,
    "emergencyFee" INTEGER,
    "weeklySchedule" JSONB,
    "bookingWindowStart" TEXT,
    "bookingWindowEnd" TEXT,
    "dailyTokenLimit" INTEGER NOT NULL DEFAULT 30,
    "consultationFee" INTEGER NOT NULL DEFAULT 0,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'OFFLINE',
    "clinicStartTime" TEXT,
    "clinicEndTime" TEXT,
    "isAcceptingBookings" BOOLEAN NOT NULL DEFAULT false,
    "breakMessage" TEXT,
    "canShowOnPublic" BOOLEAN NOT NULL DEFAULT false,
    "lifetimePatientsServed" INTEGER NOT NULL DEFAULT 0,
    "jivnicarePatientsServed" INTEGER NOT NULL DEFAULT 0,
    "partnerTier" "PartnerTier" NOT NULL DEFAULT 'STANDARD',
    "registrationStep" INTEGER NOT NULL DEFAULT 1,
    "registrationComplete" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_queues" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'ACTIVE',
    "type" "QueueType" NOT NULL DEFAULT 'REGULAR',
    "currentToken" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" INTEGER NOT NULL,
    "emergencySlots" INTEGER NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_tokens" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "patientId" TEXT,
    "tokenNumber" INTEGER NOT NULL,
    "status" "TokenStatus" NOT NULL DEFAULT 'BOOKED',
    "type" "TokenType" NOT NULL DEFAULT 'ONLINE',
    "walkinName" TEXT,
    "walkinPhone" TEXT,
    "walkinAddress" TEXT,
    "paymentVerified" BOOLEAN NOT NULL DEFAULT false,
    "paymentVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "internalNotes" TEXT,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_pricing" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 2999,
    "perBookingFee" DOUBLE PRECISION NOT NULL DEFAULT 29,
    "discountPercent" INTEGER NOT NULL DEFAULT 100,
    "partnerTier" "PartnerTier" NOT NULL DEFAULT 'EARLY_PARTNER',
    "freeUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "role" "Role",
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archived_records" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "archivedBy" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "archived_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlists" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "speciality" TEXT NOT NULL,
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "contactedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "district" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "googleId" TEXT,
    "totpSecret" TEXT NOT NULL,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_codes" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_logs" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentText" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneHash_key" ON "users"("phoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_token_key" ON "auth_sessions"("token");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_idx" ON "auth_sessions"("userId");

-- CreateIndex
CREATE INDEX "auth_sessions_token_idx" ON "auth_sessions"("token");

-- CreateIndex
CREATE INDEX "auth_sessions_expiresAt_idx" ON "auth_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_internalDoctorId_key" ON "doctors"("internalDoctorId");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_slug_key" ON "doctors"("slug");

-- CreateIndex
CREATE INDEX "doctors_slug_idx" ON "doctors"("slug");

-- CreateIndex
CREATE INDEX "doctors_speciality_idx" ON "doctors"("speciality");

-- CreateIndex
CREATE INDEX "doctors_clinicDistrict_idx" ON "doctors"("clinicDistrict");

-- CreateIndex
CREATE INDEX "doctors_clinicCity_idx" ON "doctors"("clinicCity");

-- CreateIndex
CREATE INDEX "doctors_verificationStatus_idx" ON "doctors"("verificationStatus");

-- CreateIndex
CREATE INDEX "doctors_availabilityStatus_idx" ON "doctors"("availabilityStatus");

-- CreateIndex
CREATE INDEX "doctors_canShowOnPublic_idx" ON "doctors"("canShowOnPublic");

-- CreateIndex
CREATE INDEX "doctors_partnerTier_idx" ON "doctors"("partnerTier");

-- CreateIndex
CREATE INDEX "daily_queues_doctorId_idx" ON "daily_queues"("doctorId");

-- CreateIndex
CREATE INDEX "daily_queues_date_idx" ON "daily_queues"("date");

-- CreateIndex
CREATE INDEX "daily_queues_type_idx" ON "daily_queues"("type");

-- CreateIndex
CREATE UNIQUE INDEX "daily_queues_doctorId_date_type_key" ON "daily_queues"("doctorId", "date", "type");

-- CreateIndex
CREATE UNIQUE INDEX "queue_tokens_idempotencyKey_key" ON "queue_tokens"("idempotencyKey");

-- CreateIndex
CREATE INDEX "queue_tokens_queueId_idx" ON "queue_tokens"("queueId");

-- CreateIndex
CREATE INDEX "queue_tokens_patientId_idx" ON "queue_tokens"("patientId");

-- CreateIndex
CREATE INDEX "queue_tokens_status_idx" ON "queue_tokens"("status");

-- CreateIndex
CREATE INDEX "queue_tokens_tokenNumber_idx" ON "queue_tokens"("tokenNumber");

-- CreateIndex
CREATE UNIQUE INDEX "platform_pricing_doctorId_key" ON "platform_pricing"("doctorId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "archived_records_entityType_idx" ON "archived_records"("entityType");

-- CreateIndex
CREATE INDEX "archived_records_entityId_idx" ON "archived_records"("entityId");

-- CreateIndex
CREATE INDEX "waitlists_doctorId_idx" ON "waitlists"("doctorId");

-- CreateIndex
CREATE INDEX "waitlists_phone_idx" ON "waitlists"("phone");

-- CreateIndex
CREATE INDEX "doctor_requests_district_idx" ON "doctor_requests"("district");

-- CreateIndex
CREATE INDEX "doctor_requests_speciality_idx" ON "doctor_requests"("speciality");

-- CreateIndex
CREATE INDEX "doctor_requests_contacted_idx" ON "doctor_requests"("contacted");

-- CreateIndex
CREATE INDEX "search_logs_query_idx" ON "search_logs"("query");

-- CreateIndex
CREATE INDEX "search_logs_district_idx" ON "search_logs"("district");

-- CreateIndex
CREATE INDEX "search_logs_createdAt_idx" ON "search_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "districts_name_key" ON "districts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "specialities_name_key" ON "specialities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_googleId_key" ON "admins"("googleId");

-- CreateIndex
CREATE INDEX "backup_codes_adminId_idx" ON "backup_codes"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_logs_identifier_type_key" ON "rate_limit_logs"("identifier", "type");

-- CreateIndex
CREATE INDEX "consent_logs_userId_idx" ON "consent_logs"("userId");

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_queues" ADD CONSTRAINT "daily_queues_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tokens" ADD CONSTRAINT "queue_tokens_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "daily_queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tokens" ADD CONSTRAINT "queue_tokens_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_pricing" ADD CONSTRAINT "platform_pricing_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlists" ADD CONSTRAINT "waitlists_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlists" ADD CONSTRAINT "waitlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_codes" ADD CONSTRAINT "backup_codes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
