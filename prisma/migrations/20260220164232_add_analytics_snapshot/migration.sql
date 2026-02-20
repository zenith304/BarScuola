/*
  Warnings:

  - You are about to drop the column `cutoffTime` on the `Settings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "PrintJob" DROP CONSTRAINT "PrintJob_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pickupTime" TEXT;

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "cutoffTime",
ADD COLUMN     "dailyRevenueCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "orderEndTime" TEXT NOT NULL DEFAULT '10:00',
ADD COLUMN     "orderStartTime" TEXT NOT NULL DEFAULT '00:00',
ADD COLUMN     "pickupEndTime" TEXT NOT NULL DEFAULT '11:00',
ADD COLUMN     "pickupStartTime" TEXT NOT NULL DEFAULT '10:00';

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "revenueCents" INTEGER NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshotItem" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "AnalyticsSnapshotItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'NEW',

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsSnapshotItem" ADD CONSTRAINT "AnalyticsSnapshotItem_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "AnalyticsSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
