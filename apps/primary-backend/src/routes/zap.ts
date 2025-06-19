import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";
import { Prisma } from "@repo/db";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  // console.log("create a zap");

  // @ts-ignore
  const id = req.id;
  const body = req.body;
  const parsedData = ZapCreateSchema.safeParse(body);

  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const zapId = await prismaClient.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const zap = await tx.zap.create({
        data: {
          name: parsedData.data?.name || "Untitled Zap",
          userId: id,
          triggerId: "",
          actions: {
            create: parsedData.data?.actions.map((x, index) => ({
              actionId: x.availableActionId,
              sortingOrder: index,
              metadata: x.actionMetadata,
            })),
          },
        },
      });

      const trigger = await tx.trigger.create({
        // @ts-ignore
        data: {
          triggerId: parsedData.data?.availableTriggerId,
          zapId: zap.id,
        },
      });

      await tx.zap.update({
        where: {
          id: zap.id,
        },
        data: {
          triggerId: trigger.id,
        },
      });
      return zap.id;
    }
  );

  res.json({
    zapId,
  });
});

router.get("/", authMiddleware, async (req, res) => {
  // console.log("get user zaps");

  // @ts-ignore
  const id = req.id;
  const zaps = await prismaClient.zap.findMany({
    where: {
      userId: id,
    },
    include: {
      actions: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });

  res.json({
    zaps,
  });
});

router.get("/:zapId", authMiddleware, async (req, res) => {
  // console.log("get user specific zap");

  // @ts-ignore
  const id = req.id;
  const zapId = req.params.zapId;

  const zap = await prismaClient.zap.findFirst({
    where: {
      id: zapId,
      userId: id,
    },
    include: {
      actions: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });

  res.json({
    zap,
  });
});

router.delete("/:zapId", authMiddleware, async (req, res) => {
  // console.log("reached in delete route s-1");
  // console.log(req.body);

  // @ts-ignore
  const userId = req.id;
  const zapId = req.params.zapId;

  try {
    // Make sure the zap belongs to the logged-in user
    const zap = await prismaClient.zap.findFirst({
      where: {
        id: zapId,
        userId,
      },
    });

    console.log("zap deleted successfully\n", zap);

    if (!zap) {
      res.status(404).json({ message: "Zap not found" });
    }

    // Delete the zap (cascades will handle trigger, actions, zapRuns, zapRunOutbox)
    await prismaClient.zap.delete({
      where: {
        id: zapId,
      },
    });

    res.json({ message: "Zap deleted successfully" });
  } catch (error) {
    console.error("Delete zap error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export const zapRouter = router;
