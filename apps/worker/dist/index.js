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
const kafkajs_1 = require("kafkajs");
const db_1 = require("@repo/db");
const parser_1 = require("./utils/parser");
// import dotenv from "dotenv";
const email_1 = require("./email");
const solana_1 = require("./solana");
const reconcileTxs_1 = require("./utils/reconcileTxs");
const notion_1 = require("./notion");
const retry_1 = require("./utils/retry");
const notifyFailure_1 = require("./utils/notifyFailure");
// dotenv.config();
const MAX_RETRIES = 3;
const prismaClient = new db_1.PrismaClient();
const TOPIC_NAME = "events";
const kafka = new kafkajs_1.Kafka({
    clientId: "event-worker",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({ groupId: "main-worker" });
        yield consumer.connect();
        yield consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
        // need producer beacuse if not last action of zap we need to push zap again to the queue
        const producer = kafka.producer();
        yield producer.connect();
        // bacground reconfirmation check (non-blocking)
        setInterval(() => {
            (0, reconcileTxs_1.reconcileSolanaTxs)().catch(console.error);
        }, 10000); // every 10s (tune based on throughput)
        yield consumer.run({
            autoCommit: false, // now manually we have to acknowledge the kafka about completion
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c, _d, _e, _f, _g, _h;
                // pull the event from kafka queue
                console.log({
                    partition,
                    offset: message.offset,
                    value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                });
                if (!((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString())) {
                    return;
                }
                const parsedValue = JSON.parse((_d = message.value) === null || _d === void 0 ? void 0 : _d.toString());
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
                // find the associated zap to run from zapRun table
                const rawZapRunDetails = yield prismaClient.zapRun.findFirst({
                    where: {
                        id: zapRunId,
                    },
                    include: {
                        zap: {
                            include: {
                                actions: {
                                    include: {
                                        type: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!rawZapRunDetails) {
                    console.error("ZapRunDetails not found. Cannot log to Notion.");
                    return;
                }
                const zapRunDetails = rawZapRunDetails;
                // ---------opt-2------------
                // send query to get the zap id
                // send query to get back actions associated to this zap id
                // send query to find available actions
                const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.find((x) => x.sortingOrder === stage);
                if (!currentAction) {
                    console.log("current action not found");
                    return;
                }
                console.log(currentAction);
                // {
                //   id:"",
                //   zapId:"",
                //   actionId:"send-sol",
                //   metadata:{amount:'',adress:''},
                //   sortingOrder:'',
                //   type:{
                //     id:'send-sol',
                //     name:'',
                //     image:''
                //   }
                // }
                const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata; // {comment: {email: "ajay@gmail.com"}}
                if (currentAction.type.id === "email") {
                    // console.log("sending mail");
                    // parse out the email, body to send
                    const metadata = currentAction.metadata;
                    const body = (0, parser_1.parse)(metadata === null || metadata === void 0 ? void 0 : metadata.body, zapRunMetadata); // you just recv {comment.amount}
                    const to = (0, parser_1.parse)("{comment.email}", zapRunMetadata); // {comment.email}
                    console.log(`sending out mail to ${to} body is ${body}`);
                    yield (0, retry_1.retry)(() => (0, email_1.sendEmail)(to, body), MAX_RETRIES, (err) => (0, notifyFailure_1.notifyFailure)(zapRunId, "email", err.message));
                }
                if (currentAction.type.id === "send-sol") {
                    // console.log("sending solana");
                    // parse out the amount, address to send
                    const address = (0, parser_1.parse)("{comment.address}", zapRunMetadata);
                    const amount = (0, parser_1.parse)("{comment.amount}", zapRunMetadata);
                    console.log(`Initiating SOL transfer: ${amount} SOL to ${address}`);
                    const existingTx = yield prismaClient.solanaTransaction.findUnique({
                        where: {
                            zapRunId_actionId: {
                                zapRunId,
                                actionId: currentAction.id,
                            },
                        },
                    });
                    if ((existingTx === null || existingTx === void 0 ? void 0 : existingTx.status) === "confirmed") {
                        console.log("Transaction already confirmed. skipping...");
                        return;
                    }
                    if ((existingTx === null || existingTx === void 0 ? void 0 : existingTx.status) === "submitted" && existingTx.txSignature) {
                        console.log("checking status of previously submitted transaction...");
                        const status = yield solana_1.connection.getSignatureStatus(existingTx.txSignature);
                        if (((_e = status.value) === null || _e === void 0 ? void 0 : _e.confirmationStatus) === "confirmed" ||
                            ((_f = status.value) === null || _f === void 0 ? void 0 : _f.confirmationStatus) === "finalized") {
                            yield prismaClient.solanaTransaction.update({
                                where: {
                                    zapRunId_actionId: {
                                        zapRunId,
                                        actionId: currentAction.id,
                                    },
                                },
                                data: {
                                    status: "confirmed",
                                },
                            });
                            console.log("Transaction confirmed on Solana. Marked in DB.");
                            return;
                        }
                        throw new Error("Tx still pending. Will retry.");
                    }
                    if ((existingTx === null || existingTx === void 0 ? void 0 : existingTx.status) === "pending") {
                        console.log("Transaction exists but still pending. Will retry later.");
                        return;
                    }
                    // send new transaction
                    yield prismaClient.solanaTransaction.upsert({
                        where: {
                            zapRunId_actionId: {
                                zapRunId,
                                actionId: currentAction.id,
                            },
                        },
                        update: {
                            status: "processing",
                        },
                        create: {
                            zapRunId,
                            actionId: currentAction.id,
                            amount,
                            toAddress: address,
                            status: "processing",
                        },
                    });
                    try {
                        const signature = yield (0, solana_1.sendSol)(address, amount);
                        yield prismaClient.solanaTransaction.update({
                            where: {
                                zapRunId_actionId: {
                                    zapRunId,
                                    actionId: currentAction.id,
                                },
                            },
                            data: {
                                txSignature: signature,
                                status: "submitted",
                            },
                        });
                        console.log(`SOL sent with tx: ${signature}`);
                    }
                    catch (err) {
                        const currentRetry = (_g = existingTx === null || existingTx === void 0 ? void 0 : existingTx.retryCount) !== null && _g !== void 0 ? _g : 0;
                        const newRetry = currentRetry + 1;
                        yield prismaClient.solanaTransaction.update({
                            where: {
                                zapRunId_actionId: {
                                    zapRunId,
                                    actionId: currentAction.id,
                                },
                            },
                            data: {
                                retryCount: newRetry,
                                status: newRetry >= MAX_RETRIES ? "failed" : "pending",
                            },
                        });
                        throw err;
                    }
                }
                if (currentAction.type.id === "notion") {
                    console.log("Logging to Notion...");
                    const runInfo = {
                        zapRunId,
                        emailSent: zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.some((act) => act.type.id === "email"),
                        solSent: zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.some((act) => act.type.id === "send-sol"),
                    };
                    try {
                        yield (0, retry_1.retry)(() => (0, notion_1.handleNotionAction)(zapRunDetails, runInfo), MAX_RETRIES, (err) => (0, notifyFailure_1.notifyFailure)(zapRunId, "notion", err.message));
                        console.log("Notion log added");
                    }
                    catch (err) {
                        console.error("Notion logging failed:", err);
                        throw err;
                    }
                }
                // process the current event here
                // await new Promise((r) => setTimeout(r, 5000));
                const lastStage = (((_h = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions) === null || _h === void 0 ? void 0 : _h.length) || 1) - 1; //1
                if (lastStage !== stage) {
                    yield producer.send({
                        topic: TOPIC_NAME,
                        messages: [
                            {
                                value: JSON.stringify({
                                    stage: stage + 1,
                                    zapRunId,
                                }),
                            },
                        ],
                    });
                }
                console.log("processing done");
                //   NOTE: worker should acknowledge kafka that msg has been processed successfully it should not be considered default after consuming msg
                yield consumer.commitOffsets([
                    {
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString(), //5
                    },
                ]);
            }),
        });
    });
}
main();
