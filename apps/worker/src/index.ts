import { Kafka } from "kafkajs";
import { PrismaClient } from "@repo/db";
import { JsonObject } from "@prisma/client/runtime/library";
import { parse } from "./utils/parser";
import dotenv from "dotenv";
import { sendEmail } from "./email";
import { sendSol, connection } from "./solana";
import { reconcileSolanaTxs } from "./utils/reconcileTxs";
import { handleNotionAction, RunInfo } from "./notion";
import { retry } from "./utils/retry";
import { notifyFailure } from "./utils/notifyFailure";

dotenv.config();

const KAFKA_BROKER = process.env.KAFKA_BROKER!;
const KAFKA_API_KEY = process.env.KAFKA_API_KEY!;
const KAFKA_API_SECRET = process.env.KAFKA_API_SECRET!;

const MAX_RETRIES = 3;

const prismaClient = new PrismaClient();

const TOPIC_NAME = "events";

const kafka = new Kafka({
  clientId: "event-worker",
  brokers: [KAFKA_BROKER],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: KAFKA_API_KEY,
    password: KAFKA_API_SECRET,
  },
});

interface ZapRunDetails {
  zap: {
    id: string;
    name?: string;
    actions: {
      id: string;
      zapId: string;
      actionId: string;
      metadata: Record<string, string> | null;
      sortingOrder: number;
      type: {
        id: string;
        name: string;
        image: string;
      };
    }[];
  };
  metadata?: Record<string, string>;
}

async function main() {
  const consumer = kafka.consumer({ groupId: "main-worker" });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  // need producer beacuse if not last action of zap we need to push zap again to the queue
  const producer = kafka.producer();
  await producer.connect();

  // bacground reconfirmation check (non-blocking)
  setInterval(() => {
    reconcileSolanaTxs().catch(console.error);
  }, 10000); // every 10s (tune based on throughput)

  await consumer.run({
    autoCommit: false, // now manually we have to acknowledge the kafka about completion
    eachMessage: async ({ topic, partition, message }) => {
      // pull the event from kafka queue
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      if (!message.value?.toString()) {
        return;
      }

      const parsedValue = JSON.parse(message.value?.toString());
      const zapRunId = parsedValue.zapRunId;
      const stage = parsedValue.stage;

      // find the associated zap to run from zapRun table
      const rawZapRunDetails = await prismaClient.zapRun.findFirst({
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
        console.error("ZapRunDetails not found. Cannot proceed.");
        return;
      }

      const zapRunDetails = rawZapRunDetails as ZapRunDetails;

      // ---------opt-2------------
      // send query to get the zap id
      // send query to get back actions associated to this zap id
      // send query to find available actions

      const currentAction = zapRunDetails?.zap.actions.find(
        (x: any) => x.sortingOrder === stage
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
        const metadata = currentAction.metadata as JsonObject;

        const body = parse(metadata?.body as string, zapRunMetadata); // you just recv {comment.amount}

        const to = parse("{comment.email}", zapRunMetadata); // {comment.email}

        console.log(`sending out mail to ${to} body is ${body}`);

        await retry(
          () => sendEmail(to, body),
          MAX_RETRIES,
          (err) => notifyFailure(zapRunId, "email", err.message)
        );
      }

      if (currentAction.type.id === "send-sol") {
        // console.log("sending solana");
        // parse out the amount, address to send

        const address = parse("{comment.address}", zapRunMetadata);
        const amount = parse("{comment.amount}", zapRunMetadata);

        console.log(`Initiating SOL transfer: ${amount} SOL to ${address}`);

        const existingTx = await prismaClient.solanaTransaction.findUnique({
          where: {
            zapRunId_actionId: {
              zapRunId,
              actionId: currentAction.id,
            },
          },
        });

        let shouldSkip = false;

        if (
          existingTx?.status === "confirmed" ||
          existingTx?.status === "failed"
        ) {
          console.log("Transaction already done. skipping...");
          shouldSkip = true;
        }

        if (existingTx?.status === "submitted" && existingTx.txSignature) {
          console.log("checking status of previously submitted transaction...");
          const status = await connection.getSignatureStatus(
            existingTx.txSignature
          );

          if (
            status.value?.confirmationStatus === "confirmed" ||
            status.value?.confirmationStatus === "finalized"
          ) {
            await prismaClient.solanaTransaction.update({
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
            shouldSkip = true;
          }

          // throw new Error("Tx still pending. Will retry.");
        }

        if (
          existingTx?.status === "pending" ||
          existingTx?.status === "processing"
        ) {
          console.log(
            "Transaction exists but still pending. Will retry later."
          );
          shouldSkip = true;
        }

        if (shouldSkip) {
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

          await consumer.commitOffsets([
            {
              topic: TOPIC_NAME,
              partition: partition,
              offset: (parseInt(message.offset) + 1).toString(), //5
            },
          ]);

          return;
        }

        // send new transaction
        await prismaClient.solanaTransaction.upsert({
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
          const signature = await sendSol(address, amount);
          await prismaClient.solanaTransaction.update({
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
        } catch (err) {
          const currentRetry = existingTx?.retryCount ?? 0;
          const newRetry = currentRetry + 1;

          await prismaClient.solanaTransaction.update({
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
          // throw err;
        }
      }

      if (currentAction.type.id === "notion") {
        console.log("Logging to Notion...");

        const runInfo: RunInfo = {
          zapRunId,
          emailSent: zapRunDetails?.zap.actions.some(
            (act: any) => act.type.id === "email"
          ),
          solSent: zapRunDetails?.zap.actions.some(
            (act: any) => act.type.id === "send-sol"
          ),
        };

        try {
          await retry(
            () => handleNotionAction(zapRunDetails, runInfo),
            MAX_RETRIES,
            (err) => notifyFailure(zapRunId, "notion", err.message)
          );

          console.log("Notion log added");
        } catch (err) {
          console.error("Notion logging failed:", err);
          // throw err;
        }
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

// docker build -f apps/worker/Dockerfile -t worker-service .
