import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function main() {
  while (1) {
    // doubt--why not client.ZapRunOutbox here
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });

    pendingRows.forEach((r) => {});
  }
}

main();
