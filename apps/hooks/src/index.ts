import express, { RequestHandler } from "express";
import { PrismaClient, Prisma } from "@repo/db";

const client = new PrismaClient();

const app = express();
app.use(express.json());

const PORT = 3002;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

app.post("/hooks/catch/:userId/:zapId", (async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  // const commenter = body?.comment?.user?.login;

  // if (commenter && commenter !== GITHUB_USERNAME) {
  //   console.log(`Ignored comment by ${commenter}, not ${GITHUB_USERNAME}`);
  //   return res.status(200).json({ message: "Comment ignored" });
  // }

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
}) as RequestHandler);

app.listen(PORT, () => console.log(`hooks is listening to the port ${PORT}`));

// # From monorepo root
// docker build -f apps/hooks/Dockerfile -t hooks-service .
// docker run -p 3002:3002 hooks-service
