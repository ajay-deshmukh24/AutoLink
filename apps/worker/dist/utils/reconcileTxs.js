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
const db_1 = require("@repo/db");
const solana_1 = require("../solana");
const notifyFailure_1 = require("./notifyFailure");
const prismaClient = new db_1.PrismaClient();
const MAX_RETRIES = 3;
function reconcileSolanaTxs() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const pendingTxs = yield prismaClient.solanaTransaction.findMany({
            where: {
                status: { in: ["pending", "submitted", "processing"] }, // exclude "failed"
            },
        });
        for (const tx of pendingTxs) {
            if (!tx.txSignature && tx.status === "pending") {
                // Claim transaction
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
                if (updated.count === 0)
                    continue;
                console.log(`Retrying sendSol for zapRunId: ${tx.zapRunId}`);
                try {
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
                            retryCount: {
                                increment: 1,
                            },
                        },
                    });
                    console.log(`Resent SOL: ${tx.amount} to ${tx.toAddress}, signature: ${signature}`);
                }
                catch (err) {
                    console.error(`Failed to REDACTED SOL for zapRunId: ${tx.zapRunId}`, err);
                    const newRetryCount = ((_a = tx.retryCount) !== null && _a !== void 0 ? _a : 0) + 1;
                    const finalStatus = newRetryCount >= MAX_RETRIES ? "failed" : "pending";
                    yield prismaClient.solanaTransaction.update({
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
                        yield (0, notifyFailure_1.notifyFailure)(tx.zapRunId, "send-sol", err.message);
                    }
                }
                continue;
            }
            if (tx.txSignature) {
                const result = yield solana_1.connection.getSignatureStatus(tx.txSignature);
                if (((_b = result.value) === null || _b === void 0 ? void 0 : _b.confirmationStatus) === "confirmed" ||
                    ((_c = result.value) === null || _c === void 0 ? void 0 : _c.confirmationStatus) === "finalized") {
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
                else {
                    console.log(`Tx not confirmed yet: ${tx.txSignature}`);
                }
            }
        }
    });
}
