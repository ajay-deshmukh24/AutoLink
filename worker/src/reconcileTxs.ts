import { PrismaClient } from "@prisma/client";
import { connection } from "./solana";

const prismaClient = new PrismaClient();

export async function reconcileSolanaTxs() {
  const pendingTxs = await prismaClient.solanaTransaction.findMany({
    where: {
      status: { in: ["pending", "submitted"] },
    },
  });

  for (const tx of pendingTxs) {
    if (!tx.txSignature) continue;

    const result = await connection.getSignatureStatus(tx.txSignature);
    const confirmed = result?.value?.confirmationStatus === "finalized";

    if (confirmed) {
      await prismaClient.solanaTransaction.update({
        where: {
          zapRunId_actionId: {
            zapRunId: tx.zapRunId,
            actionId: tx.actionId,
          },
        },
        data: {
          status: "confirmed",
        },
      });
      console.log(`Reconciled and confirmed tx: ${tx.txSignature}`);
    }
  }
}
