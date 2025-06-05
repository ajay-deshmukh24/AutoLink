"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileSolanaTxs = reconcileSolanaTxs;
const client_1 = require("@prisma/client");
const solana_1 = require("./solana");
const prismaClient = new client_1.PrismaClient();
function reconcileSolanaTxs() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const pendingTxs = yield prismaClient.solanaTransaction.findMany({
            where: {
                status: { in: ["pending", "submitted"] },
            },
        });
        for (const tx of pendingTxs) {
            if (!tx.txSignature) {
                // retry sending transactions that never got submitted
                try {
                    // Use atomic update to set status = 'processing' only if txSignature is null
                    const updated = yield prismaClient.solanaTransaction.updateMany({
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
                    if (updated.count === 0)
                        continue;
                    console.log(`Retrying sendSol for zapRunId: ${tx.zapRunId}`);
                    const signature = yield (0, solana_1.sendSol)(tx.toAddress, tx.amount);
                    yield prismaClient.solanaTransaction.update({
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
                    console.log(`Resent SOL: ${tx.amount} to ${tx.toAddress}, signature: ${signature}`);
                }
                catch (err) {
                    console.error(`Failed to REDACTED SOL for zapRunId: ${tx.zapRunId}`, err);
                    yield prismaClient.solanaTransaction.update({
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
            const result = yield solana_1.connection.getSignatureStatus(tx.txSignature);
            // const confirmed = result?.value?.confirmationStatus === "finalized";
            if (((_a = result.value) === null || _a === void 0 ? void 0 : _a.confirmationStatus) === "confirmed" ||
                ((_b = result.value) === null || _b === void 0 ? void 0 : _b.confirmationStatus) === "finalized") {
                yield prismaClient.solanaTransaction.update({
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
    });
}
