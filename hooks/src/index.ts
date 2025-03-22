import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const client = new PrismaClient();
// console.log(Object.keys(client));

const app = express();

// password logic

app.get("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  // store in db a new trigger and its outbox
  await client.$transaction(async (tx: Prisma.TransactionClient) => {
    // console.log(Object.keys(tx));
    const run = await tx.zapRun.create({
      data: {
        zapId: zapId,
        metadata: body,
      },
    });

    await tx.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });
  });

  // push it on to a queue (kafka/redis)

  res.json({
    message: "Webhook received",
  });
});

app.listen(3002);
