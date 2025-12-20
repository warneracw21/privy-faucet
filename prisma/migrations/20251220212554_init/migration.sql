-- CreateEnum
CREATE TYPE "Asset" AS ENUM ('NATIVE', 'USDC');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Withdrawal_user_idx" ON "Withdrawal"("user");

-- CreateIndex
CREATE INDEX "Withdrawal_chain_idx" ON "Withdrawal"("chain");

-- CreateIndex
CREATE INDEX "Withdrawal_chain_asset_idx" ON "Withdrawal"("chain", "asset");

-- CreateIndex
CREATE INDEX "Withdrawal_user_chain_idx" ON "Withdrawal"("user", "chain");
