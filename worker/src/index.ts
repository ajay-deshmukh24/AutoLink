import { Kafka } from "kafkajs";

// const client = new PrismaClient();

const TOPIC_NAME = "events";

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({ groupId: "main-worker" });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    // now we have to acknowledge the kafka about success
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });

      await new Promise((r) => setTimeout(r, 5000));

      // console.log("processing done")

      //   NOTE: worker should acknowledge kafka that msg has been processed successfully it should not be considered default after consuming msg

      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: (parseInt(message.offset) + 1).toString(), //5
        },
      ]);
    },
  });
}

main();
