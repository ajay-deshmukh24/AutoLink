-- CreateTable
CREATE TABLE "SolanaTransaction" (
    "id" TEXT NOT NULL,
    "zapRunId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "txSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolanaTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolanaTransaction_zapRunId_actionId_key" ON "SolanaTransaction"("zapRunId", "actionId");
