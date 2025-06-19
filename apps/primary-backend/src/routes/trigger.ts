import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

const router = Router();

// /api/v1/trigger/available
router.get("/available", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const availableTriggers = await prismaClient.availableTriggers.findMany({});
  res.json({
    availableTriggers,
  });
}) as RequestHandler);

export const triggerRouter = router;
