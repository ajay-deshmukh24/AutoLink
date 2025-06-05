import { PrismaClient } from "@prisma/client";
import { connection, sendSol } from "./solana";

const prismaClient = new PrismaClient();

export async function reconcileSolanaTxs() {
  const pendingTxs = await prismaClient.solanaTransaction.findMany({
    where: {
      status: { in: ["pending", "submitted"] },
    },
  });

  for (const tx of pendingTxs) {
    if (!tx.txSignature) {
      // retry sending transactions that never got submitted
      try {
        // Use atomic update to set status = 'processing' only if txSignature is null
        const updated = await prismaClient.solanaTransaction.updateMany({
          where: {
            zapRunId: tx.zapRunId,
            actionId: tx.actionId,
            txSignature: null,
            status: "pending",
          },
          data: {
            status: "processing",
          },
        });

        // Skip if another process has already picked this tx
        if (updated.count === 0) continue;

        console.log(`Retrying sendSol for zapRunId: ${tx.zapRunId}`);

        const signature = await sendSol(tx.toAddress, tx.amount);

        await prismaClient.solanaTransaction.update({
          where: {
            zapRunId_actionId: {
              zapRunId: tx.zapRunId,
              actionId: tx.actionId,
            },
          },
          data: {
            txSignature: signature,
            status: "submitted",
          },
        });

        console.log(
          `Resent SOL: ${tx.amount} to ${tx.toAddress}, signature: ${signature}`
        );
      } catch (err) {
        console.error(`Failed to REDACTED SOL for zapRunId: ${tx.zapRunId}`, err);

        await prismaClient.solanaTransaction.update({
          where: {
            zapRunId_actionId: {
              zapRunId: tx.zapRunId,
              actionId: tx.actionId,
            },
          },
          data: {
            status: "pending", // revert back to pending
          },
        });
      }

      continue;
    }

    const result = await connection.getSignatureStatus(tx.txSignature);
    // const confirmed = result?.value?.confirmationStatus === "finalized";

    if (
      result.value?.confirmationStatus === "confirmed" ||
      result.value?.confirmationStatus === "finalized"
    ) {
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
