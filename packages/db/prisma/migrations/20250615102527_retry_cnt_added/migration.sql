-- AlterTable
ALTER TABLE "SolanaTransaction" ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
