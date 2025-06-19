import { Client as NotionClient } from "@notionhq/client";
import { PrismaClient } from "@repo/db";
import dotenv from "dotenv";
dotenv.config();

const prismaClient = new PrismaClient();
const notion = new NotionClient({ auth: process.env.NOTION_SECRET });

interface ZapRunDetails {
  zap: {
    id: string;
    name?: string;
  };
  metadata?: Record<string, string>;
}

export interface RunInfo {
  zapRunId: string;
  emailSent?: boolean;
  solSent?: boolean;
}

export async function handleNotionAction(
  zapRunDetails: ZapRunDetails,
  runInfo: RunInfo
): Promise<void> {
  const zapId = zapRunDetails.zap.id;
  const zapName = zapRunDetails.zap.name || `Zap-${zapId}`;
  const dbKey = `notionDbId_${zapId}`;
  let dbId = zapRunDetails.metadata?.[dbKey];

  // Create database if not exists
  if (!dbId) {
    const db = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: process.env.NOTION_PARENT_PAGE_ID!,
      },
      title: [{ type: "text", text: { content: zapName } }],
      properties: {
        Name: {
          title: {},
        },
        Timestamp: { type: "date", date: {} },
        "Email Status": {
          type: "select",
          select: {
            options: [
              { name: "Sent", color: "green" },
              { name: "Not Sent", color: "red" },
            ],
          },
        },
        "SOL Status": {
          type: "select",
          select: {
            options: [
              { name: "Transferred", color: "green" },
              { name: "Not Transferred", color: "red" },
            ],
          },
        },
        "Overall Status": {
          type: "select",
          select: {
            options: [
              { name: "Success", color: "green" },
              { name: "Partial", color: "yellow" },
              { name: "Failed", color: "red" },
            ],
          },
        },
      },
    });

    dbId = db.id;
    await prismaClient.zapRun.update({
      where: { id: runInfo.zapRunId },
      data: {
        metadata: {
          ...(zapRunDetails.metadata ?? {}),
          [dbKey]: dbId,
        },
      },
    });
  }

  // Prepare the row values based on runInfo
  const emailStatus = runInfo.emailSent ? "Sent" : "Not Sent";
  const solStatus = runInfo.solSent ? "Transferred" : "Not Transferred";

  let overall: string;
  if (runInfo.emailSent && runInfo.solSent) {
    overall = "Success";
  } else if (runInfo.emailSent || runInfo.solSent) {
    overall = "Partial";
  } else {
    overall = "Failed";
  }

  // Add log row
  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: `ZapRun ${runInfo.zapRunId.substring(0, 6)}...`,
            },
          },
        ],
      },
      Timestamp: {
        date: { start: new Date().toISOString() },
      },
      "Email Status": {
        select: { name: emailStatus },
      },
      "SOL Status": {
        select: { name: solStatus },
      },
      "Overall Status": {
        select: { name: overall },
      },
    },
  });
}
