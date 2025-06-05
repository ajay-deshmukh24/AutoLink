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
        var _a;
        const pendingTxs = yield prismaClient.solanaTransaction.findMany({
            where: {
                status: { in: ["pending", "submitted"] },
            },
        });
        for (const tx of pendingTxs) {
            if (!tx.txSignature)
                continue;
            const result = yield solana_1.connection.getSignatureStatus(tx.txSignature);
            const confirmed = ((_a = result === null || result === void 0 ? void 0 : result.value) === null || _a === void 0 ? void 0 : _a.confirmationStatus) === "finalized";
            if (confirmed) {
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
