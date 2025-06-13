import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const client = new PrismaClient();

const app = express();
app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  // Extract and parse GitHub comment if it exists
  let parsedMetadata: any = body;

  const commentBody = body?.comment?.body;
  if (commentBody) {
    const lines = commentBody.split("\n");
    const commentMetadata: Record<string, string> = {};

    lines.forEach((line: string) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length > 0) {
        commentMetadata[key.trim()] = rest.join(":").trim();
      }
    });

    parsedMetadata = {
      comment: commentMetadata,
    };
  }

  // Store parsed metadata to DB
  await client.$transaction(async (tx: Prisma.TransactionClient) => {
    const run = await tx.zapRun.create({
      data: {
        zapId: zapId,
        metadata: parsedMetadata,
      },
    });

    await tx.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });
  });

  res.json({
    message: "Webhook received and parsed",
  });
});

app.listen(3002);
