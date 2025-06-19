import { PrismaClient } from "@repo/db";
import { connection, sendSol } from "../solana";
import { notifyFailure } from "./notifyFailure";

const prismaClient = new PrismaClient();
const MAX_RETRIES = 3;

export async function reconcileSolanaTxs() {
  const pendingTxs = await prismaClient.solanaTransaction.findMany({
    where: {
      status: { in: ["pending", "submitted", "processing"] }, // exclude "failed"
    },
  });

  for (const tx of pendingTxs) {
    if (!tx.txSignature && tx.status === "pending") {
      // Claim transaction
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

      if (updated.count === 0) continue;

      console.log(`Retrying sendSol for zapRunId: ${tx.zapRunId}`);

      try {
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
            retryCount: {
              increment: 1,
            },
          },
        });

        console.log(
          `Resent SOL: ${tx.amount} to ${tx.toAddress}, signature: ${signature}`
        );
      } catch (err) {
        console.error(`Failed to REDACTED SOL for zapRunId: ${tx.zapRunId}`, err);

        const newRetryCount = (tx.retryCount ?? 0) + 1;
        const finalStatus = newRetryCount >= MAX_RETRIES ? "failed" : "pending";

        await prismaClient.solanaTransaction.update({
          where: {
            zapRunId_actionId: {
              zapRunId: tx.zapRunId,
              actionId: tx.actionId,
            },
          },
          data: {
            retryCount: newRetryCount,
            status: finalStatus,
          },
        });

        if (finalStatus === "failed") {
          await notifyFailure(tx.zapRunId, "send-sol", (err as Error).message);
        }
      }
      continue;
    }

    if (tx.txSignature) {
      const result = await connection.getSignatureStatus(tx.txSignature);

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
      } else {
        console.log(`Tx not confirmed yet: ${tx.txSignature}`);
      }
    }
  }
}
