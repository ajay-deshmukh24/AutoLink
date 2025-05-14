import { Kafka } from "kafkajs";

// const client = new PrismaClient();

const TOPIC_NAME = "events";

const kafka = new Kafka({
  clientId: "event-worker",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({ groupId: "main-worker" });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false, // now manually we have to acknowledge the kafka about completion
    eachMessage: async ({ topic, partition, message }) => {
      // pull the event from kafka queue
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });

      // process the current event here
      await new Promise((r) => setTimeout(r, 5000));

      console.log("processing done");

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
