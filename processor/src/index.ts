import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const client = new PrismaClient();

const TOPIC_NAME = "events";

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  while (1) {
    const producer = kafka.producer();
    await producer.connect();

    // doubt--why not client.ZapRunOutbox here
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });

    // const pendingRows: {
    //     id: string;
    //     zapRunId: string;
    // }[]

    // push it on to a queue (kafka/redis)
    await producer.send({
      topic: TOPIC_NAME,
      messages: pendingRows.map((r) => {
        return {
          value: r.zapRunId,
        };
      }),
    });

    // delete entries from zapRunOutbox
    await client.zapRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((x) => x.id),
        },
      },
    });
  }
}

main();
