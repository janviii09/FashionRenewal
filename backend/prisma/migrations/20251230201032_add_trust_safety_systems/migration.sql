/*
  Warnings:

  - The values [INVESTIGATING] on the enum `DisputeStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `resolution` column on the `Dispute` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `againstId` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseDeadline` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `reason` on the `Dispute` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('ITEM_NOT_AS_DESCRIBED', 'ITEM_DAMAGED', 'LATE_DELIVERY', 'PAYMENT_ISSUE', 'HARASSMENT', 'FRAUD', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeResolution" AS ENUM ('REFUND_FULL', 'REFUND_PARTIAL', 'NO_REFUND', 'FORCE_COMPLETE', 'PENALIZE_BUYER', 'PENALIZE_SELLER', 'MUTUAL_AGREEMENT');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL', 'PHONE', 'GOVERNMENT_ID', 'TRUSTED_LENDER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REVOKED');

-- AlterEnum
BEGIN;
CREATE TYPE "DisputeStatus_new" AS ENUM ('OPEN', 'RESPONDED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED', 'ESCALATED');
ALTER TABLE "Dispute" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Dispute" ALTER COLUMN "status" TYPE "DisputeStatus_new" USING ("status"::text::"DisputeStatus_new");
ALTER TYPE "DisputeStatus" RENAME TO "DisputeStatus_old";
ALTER TYPE "DisputeStatus_new" RENAME TO "DisputeStatus";
DROP TYPE "DisputeStatus_old";
ALTER TABLE "Dispute" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "againstId" INTEGER NOT NULL,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "escalatedAt" TIMESTAMP(3),
ADD COLUMN     "refundAmount" DECIMAL(10,2),
ADD COLUMN     "resolvedById" INTEGER,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "responseDeadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "reviewDeadline" TIMESTAMP(3),
ADD COLUMN     "trustScoreImpact" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER,
DROP COLUMN "reason",
ADD COLUMN     "reason" "DisputeReason" NOT NULL,
DROP COLUMN "resolution",
ADD COLUMN     "resolution" "DisputeResolution";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "disputeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "disputeLockedAt" TIMESTAMP(3),
ADD COLUMN     "hasActiveDispute" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "disputeRiskScore" DECIMAL(3,2),
ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "flaggedAt" TIMESTAMP(3),
ADD COLUMN     "idVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trustedLender" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DisputeEvidence" (
    "id" SERIAL NOT NULL,
    "disputeId" INTEGER NOT NULL,
    "uploadedById" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeResponse" (
    "id" SERIAL NOT NULL,
    "disputeId" INTEGER NOT NULL,
    "respondedById" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeTimeline" (
    "id" SERIAL NOT NULL,
    "disputeId" INTEGER NOT NULL,
    "actorId" INTEGER,
    "event" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVerification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationData" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "reviewedById" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationAttempt" (
    "id" SERIAL NOT NULL,
    "verificationId" INTEGER NOT NULL,
    "attemptType" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedLenderMetrics" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "successfulRentals" INTEGER NOT NULL DEFAULT 0,
    "totalRentals" INTEGER NOT NULL DEFAULT 0,
    "lastDisputeDate" TIMESTAMP(3),
    "accountAge" INTEGER NOT NULL,
    "currentTrustScore" DECIMAL(3,2) NOT NULL,
    "isEligible" BOOLEAN NOT NULL DEFAULT false,
    "badgeGrantedAt" TIMESTAMP(3),
    "badgeRevokedAt" TIMESTAMP(3),
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextCalculationAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedLenderMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DisputeEvidence_disputeId_idx" ON "DisputeEvidence"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeResponse_disputeId_idx" ON "DisputeResponse"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeTimeline_disputeId_idx" ON "DisputeTimeline"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeTimeline_createdAt_idx" ON "DisputeTimeline"("createdAt");

-- CreateIndex
CREATE INDEX "UserVerification_userId_idx" ON "UserVerification"("userId");

-- CreateIndex
CREATE INDEX "UserVerification_status_idx" ON "UserVerification"("status");

-- CreateIndex
CREATE INDEX "UserVerification_type_idx" ON "UserVerification"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerification_userId_type_key" ON "UserVerification"("userId", "type");

-- CreateIndex
CREATE INDEX "VerificationAttempt_verificationId_idx" ON "VerificationAttempt"("verificationId");

-- CreateIndex
CREATE INDEX "VerificationAttempt_createdAt_idx" ON "VerificationAttempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedLenderMetrics_userId_key" ON "TrustedLenderMetrics"("userId");

-- CreateIndex
CREATE INDEX "TrustedLenderMetrics_isEligible_idx" ON "TrustedLenderMetrics"("isEligible");

-- CreateIndex
CREATE INDEX "TrustedLenderMetrics_nextCalculationAt_idx" ON "TrustedLenderMetrics"("nextCalculationAt");

-- CreateIndex
CREATE INDEX "Dispute_raisedById_idx" ON "Dispute"("raisedById");

-- CreateIndex
CREATE INDEX "Dispute_againstId_idx" ON "Dispute"("againstId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_createdAt_idx" ON "Dispute"("createdAt");

-- CreateIndex
CREATE INDEX "Dispute_responseDeadline_idx" ON "Dispute"("responseDeadline");

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_againstId_fkey" FOREIGN KEY ("againstId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeEvidence" ADD CONSTRAINT "DisputeEvidence_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeEvidence" ADD CONSTRAINT "DisputeEvidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeResponse" ADD CONSTRAINT "DisputeResponse_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeResponse" ADD CONSTRAINT "DisputeResponse_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeTimeline" ADD CONSTRAINT "DisputeTimeline_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeTimeline" ADD CONSTRAINT "DisputeTimeline_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationAttempt" ADD CONSTRAINT "VerificationAttempt_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "UserVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedLenderMetrics" ADD CONSTRAINT "TrustedLenderMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
