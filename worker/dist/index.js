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
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
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
        yield consumer.run({
            autoCommit: false, // now manually we have to acknowledge the kafka about completion
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c, _d;
                // pull the event from kafka queue
                console.log({
                    partition,
                    offset: message.offset,
                    value: message.value.toString(),
                });
                if (!((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString())) {
                    return;
                }
                const parsedValue = JSON.parse((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString());
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
                // find the associated zap to run from zapRun table
                const zapRunDetails = yield prismaClient.zapRun.findFirst({
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
                // ---------opt-2------------
                // send query to get the zap id
                // send query to get back actions associated to this zap id
                // send query to find available actions
                const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.find((x) => x.sortingOrder === stage);
                if (!currentAction) {
                    console.log("current action not found");
                    return;
                }
                if (currentAction.type.id === "email") {
                    console.log("sending mail");
                }
                if (currentAction.type.id === "send-sol") {
                    console.log("sending solana");
                }
                // process the current event here
                // await new Promise((r) => setTimeout(r, 5000));
                const lastStage = (((_d = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions) === null || _d === void 0 ? void 0 : _d.length) || 1) - 1; //1
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
