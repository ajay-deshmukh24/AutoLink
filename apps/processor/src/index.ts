import { PrismaClient } from "@repo/db";
import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const client = new PrismaClient();
const KAFKA_BROKER = process.env.KAFKA_BROKER!;
const KAFKA_API_KEY = process.env.KAFKA_API_KEY!;
const KAFKA_API_SECRET = process.env.KAFKA_API_SECRET!;

// console.log("KAFKA_BROKER env value:", process.env.KAFKA_BROKER);
// console.log("KAFKA_BROKER env value:", KAFKA_BROKER);
// process.exit(0);

const TOPIC_NAME = "events";

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: [KAFKA_BROKER],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: KAFKA_API_KEY,
    password: KAFKA_API_SECRET,
  },
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const producer = kafka.producer();
  await producer.connect();

  while (1) {
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });
    // console.log(pendingRows);

    // const pendingRows: {
    //     id: string;
    //     zapRunId: string;
    // }[]

    if (pendingRows.length === 0) {
      console.log("No pending rows found, waiting...");
      await sleep(5000); // Wait before checking again
      continue; // Skip to the next loop iteration
    }

    try {
      // push it on to a queue (kafka/redis)
      await producer.send({
        topic: TOPIC_NAME,
        messages: pendingRows.map((r: any) => {
          return {
            value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }),
          };
        }),
      });

      // delete entries from zapRunOutbox
      await client.zapRunOutbox.deleteMany({
        where: {
          id: {
            in: pendingRows.map((x: any) => x.id),
          },
        },
      });
    } catch (error) {
      console.error("Error producing to Kafka:", error);
    }

    await sleep(5000);
  }
}

main();

// docker build -f apps/processor/Dockerfile -t processor-service .
