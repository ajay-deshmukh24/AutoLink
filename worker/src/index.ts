import { Kafka } from "kafkajs";
import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { parse } from "./parser";

const prismaClient = new PrismaClient();

const TOPIC_NAME = "events";

const kafka = new Kafka({
  clientId: "event-worker",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({ groupId: "main-worker" });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  // need producer beacuse if not last action of zap we need to push zap again to the queue
  const producer = kafka.producer();
  await producer.connect();

  await consumer.run({
    autoCommit: false, // now manually we have to acknowledge the kafka about completion
    eachMessage: async ({ topic, partition, message }) => {
      // pull the event from kafka queue
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });

      if (!message.value?.toString()) {
        return;
      }

      const parsedValue = JSON.parse(message.value?.toString());
      const zapRunId = parsedValue.zapRunId;
      const stage = parsedValue.stage;

      // find the associated zap to run from zapRun table
      const zapRunDetails = await prismaClient.zapRun.findFirst({
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

      const currentAction = zapRunDetails?.zap.actions.find(
        (x) => x.sortingOrder === stage
      );

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

      const zapRunMetadata = zapRunDetails?.metadata; // {comment: {email: "ajay@gmail.com"}}

      if (currentAction.type.id === "email") {
        // console.log("sending mail");
        // parse out the email, body to send

        const body = parse(
          (currentAction.metadata as JsonObject)?.body as string,
          zapRunMetadata
        ); // you just recv {comment.amount}

        const to = parse(
          (currentAction.metadata as JsonObject)?.email as string,
          zapRunMetadata
        ); // {comment.email}

        console.log(`sending out mail to ${to} body is ${body}`);
      }

      if (currentAction.type.id === "send-sol") {
        // console.log("sending solana");
        // parse out the amount, address to send

        const amount = parse(
          (currentAction.metadata as JsonObject)?.amount as string,
          zapRunMetadata
        ); // you just recv {comment.amount}

        const address = parse(
          (currentAction.metadata as JsonObject)?.address as string,
          zapRunMetadata
        ); // {comment.email}

        console.log(`sending out sol of ${amount} to address ${address}`);
      }

      // process the current event here
      // await new Promise((r) => setTimeout(r, 5000));

      const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1; //1
      if (lastStage !== stage) {
        await producer.send({
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
