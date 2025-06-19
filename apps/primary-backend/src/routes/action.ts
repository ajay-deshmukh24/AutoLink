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

router.get("/available", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const availableActions = await prismaClient.availableAction.findMany({});
  res.json({
    availableActions,
  });
}) as RequestHandler);

export const actionRouter = router;
