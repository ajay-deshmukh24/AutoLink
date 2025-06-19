-- AddForeignKey
ALTER TABLE "SolanaTransaction" ADD CONSTRAINT "SolanaTransaction_zapRunId_fkey" FOREIGN KEY ("zapRunId") REFERENCES "ZapRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolanaTransaction" ADD CONSTRAINT "SolanaTransaction_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;
