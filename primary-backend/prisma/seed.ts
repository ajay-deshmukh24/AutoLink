import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main() {
  await prismaClient.availableTriggers.create({
    data: {
      id: "webhook",
      name: "Webhook",
      image:
        "https://cdn.iconscout.com/icon/free/png-256/free-webhooks-icon-download-in-svg-png-gif-file-formats--brand-company-logo-world-logos-vol-3-pack-icons-282425.png",
    },
  });

  await prismaClient.availableAction.create({
    data: {
      id: "send-sol",
      name: "Send Solana",
      image:
        "https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png",
    },
  });

  await prismaClient.availableAction.create({
    data: {
      id: "email",
      name: "Send Email",
      image:
        "https://cdn.pixabay.com/photo/2016/01/26/17/15/gmail-1162901_1280.png",
    },
  });
}

main();
