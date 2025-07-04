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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("@repo/db");
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new db_1.PrismaClient();
const KAFKA_URL = process.env.KAFKA_URL;
const TOPIC_NAME = "events";
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: [KAFKA_URL],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = kafka.producer();
        yield producer.connect();
        console.log(KAFKA_URL);
        while (1) {
            const pendingRows = yield client.zapRunOutbox.findMany({
                where: {},
                take: 10,
            });
            // console.log(pendingRows);
            // const pendingRows: {
            //     id: string;
            //     zapRunId: string;
            // }[]
            // push it on to a queue (kafka/redis)
            yield producer.send({
                topic: TOPIC_NAME,
                messages: pendingRows.map((r) => {
                    return {
                        value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }),
                    };
                }),
            });
            // delete entries from zapRunOutbox
            yield client.zapRunOutbox.deleteMany({
                where: {
                    id: {
                        in: pendingRows.map((x) => x.id),
                    },
                },
            });
        }
    });
}
main();
// docker build -f apps/processor/Dockerfile -t processor-service .
